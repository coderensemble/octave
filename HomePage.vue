<template>
    <fr-notice class="fr-mb-2w" v-model="mess.isVisible" :description="mess.message"
               v-for="(mess, index) in activeItems"
               :key="index" />
    <div class="fr-grid-row fr-grid-row--gutters fr-mt-5w">
        <div class="fr-col-12 fr-col-md-8 fr-col-lg-10 fr-mb-4w">
            <h2 class="fr-h2">Actualités</h2>
            <fr-quote
                v-for="(tag, index) in tagsMessage" v-bind:key="index"
                :quoteLabel="tag.message"
                :authorLabel="tag.name"
                :reference="formatDate(tag.commit.created_at)"
            />
            <p v-if="tagsMessage.length === 0">Aucune Actualité.</p>
        </div>
        <div class="fr-p-4v fr-col-12 fr-mb-2w">
            <h2 class="fr-h2">Dernières Activités</h2>
            <div v-if="sortedRecordsData">
                <clir-auto-table
                    v-model:state="stateData"
                    :records="sortedRecordsData"
                    :fields="fieldsData"
                    :withPageDirectAccess="withPageDirectAccessData"
                    :rowsByPageSelectable="rowsByPageSelectableData"
                    :sortable="sortableData"
                    :filtrable="filtrableData"
                    isBordered
                >
                    <!--Ajouter les boutons d'action-->
                    <template #customLineActions="currentRecordInfos">

                        <!--                        <fr-button class="fr-btn&#45;&#45;tertiary-no-outline"-->
                        <!--                                   :iconName="currentRecordInfos.currentMetaRecord.$datas.subscribed ? 'star-fill': 'star-line'"-->
                        <!--                                   :title="'S\'abonner au ticket'"-->
                        <!--                                   @click="toggleFavorites(currentRecordInfos)" />-->
                        <!--                        <fr-button title="Editer la plateforme"-->
                        <!--                                   class="fr-btn&#45;&#45;tertiary-no-outline" iconName="pencil-line"-->
                        <!--                                   @click="editPlatform(currentRecordInfos)" />-->
                        <fr-button class="fr-btn--tertiary-no-outline"
                                   iconName="file-fill"
                                   title="Voir la fiche FAST"
                                   v-bind:disabled="!currentRecordInfos.currentMetaRecord.$datas.showIcone"
                                   @click="currentRecordInfos.currentMetaRecord.$datas.showIcone ? downloadFastFile(currentRecordInfos): ''" />
                        <fr-button title="Voir le Projet" class="fr-btn--tertiary-no-outline"
                                   iconName="arrow-right-line"
                                   @click="viewProject(currentRecordInfos)" />
                    </template>
                </clir-auto-table>
            </div>
            <p v-else>
                Aucun projet en favoris.
            </p>
        </div>
    </div>
</template>
<script>
import {
    getProject,
    getBroadcastMessages,
    getTags,
    getIssues,
    listIssues,
    unsubscribeTicket, subscribeTicket, getBranches, getStarredProjects,
} from "@/services/gitlab.js";
import { dateMixin } from "@/mixins/date.js";
import { getFastUrl } from "@/services/octave.js";
import { steps } from "@/datas/steps.js";
import FrLoading from "@/to_be_deleted/components/FrLoading/FrLoading.vue";

export default {
    name: "HomePage",
    components: { FrLoading },

    data() {
        return {
            broadcastMessages: [],
            tags: [],
            tickets: [],
            labels: [],
            recordsData: [],
            stateData: { "currentPage": 1, "sortOrder": "", "rowsByPage": 5 },
            fieldsData: [
                {
                    "key": "projectName",
                    "label": "Projet",
                    "type": "string",
                    "alignment": "left",
                    "tdClass": "fr-pr-4w",
                },
                {
                    "key": "platformId",
                    "label": "Plateforme",
                    "type": "string",
                    "alignment": "left",
                    "tdClass": "fr-pr-4w",
                },
                {
                    "key": "creation",
                    "label": "Création",
                    "type": "date",
                    "format": "DD/MM/YYYY HH:MM",
                    "alignment": "left",
                },
                {
                    "key": "update",
                    "label": "Modifications",
                    "type": "date",
                    "format": "DD/MM/YYYY HH:MM",
                    "alignment": "left",
                },
                {
                    "key": "author",
                    "label": "Auteur",
                    "type": "string",
                    "alignment": "left",
                },
                {
                    "key": "statut", "label": "Statut", "type": "string", "alignment": "left",
                }],
            withPageDirectAccessData: false,
            rowsByPageSelectableData: false,
            sortableData: false,
            filtrableData: false,
        };
    },

    async created() {
        this.$store.commit("loading/SET_LOADING", true);

        this.projectStandard = await getProject(import.meta.env.VITE_GITLAB_PROJECT_STANDARD);

        // Launch independent operations in parallel
        const [tags, broadcastMessages, starredProjects, allTickets] = await Promise.all([
            getTags(this.projectStandard.id, "^STD"),
            getBroadcastMessages(),
            getStarredProjects(),
            listIssues("scope=all&state=opened&order_by=updated_at&with_labels_details=true&search=^platform"),
        ]);

        this.tags = tags;
        this.broadcastMessages = broadcastMessages;

        const starredProjectIds = starredProjects.map(project => project.id);
        this.tickets = allTickets.filter(ticket => starredProjectIds.includes(ticket.project_id));

        this.recordsData = await Promise.all(this.tickets.map(async (record) => {
            const platformId = record.title.split("-")[1];
            const project = starredProjects.find(project => project.id === record.project_id);
            const branch = await getBranches(record.project_id, undefined, `edb-${platformId}`);


            return {
                iid: record.iid,
                projectId: project.id,
                projectPath: project.path,
                platformId: platformId,
                projectName: project ? project.name : "N/A",
                //subscribed: (await getIssues(record.project_id, record.iid)).subscribed,
                creation: branch.commit.authored_date,
                update: branch.commit.committed_date,
                author: branch.commit.committer_name,
                statut: record.labels
                    .filter(label => label.name.startsWith("STEP_"))
                    .map(label => steps[label.name] || label.name)
                    .join(", "),
                showIcone: (await getFastUrl(platformId)),
            };
        }));
        this.$store.commit("loading/SET_LOADING", false);
    },
    /*Propriétés calculées*/
    computed: {
        /*Trier les donnée en fonction de la souscription */
        sortedRecordsData() {
            return [...this.recordsData].sort((a, b) => {
                return b.subscribed - a.subscribed;
            });
        },

        /*Boucler dans les messages recu pour savoir lequel est actif et est le plus récent*/
        activeItems() {
            return this.broadcastMessages.filter(item => item.active);
        },
        /*Récupérer seulement les 3 premiers tags*/
        tagsMessage() {
            return this.tags.filter(tag => tag.message).slice(0, 3);
        },

    },

    methods: {
        /* Mécanique de changement de statut abonné/désabonné*/
        async toggleFavorites(record) {
            if (record.currentMetaRecord.$datas.subscribed) {
                await unsubscribeTicket(record.currentMetaRecord.$datas.projectId, record.currentMetaRecord.$datas.iid);
            } else {
                await subscribeTicket(record.currentMetaRecord.$datas.projectId, record.currentMetaRecord.$datas.iid);
            }
            record.currentMetaRecord.$datas.subscribed = !record.currentMetaRecord.$datas.subscribed;
        },

        /*Mécanique de lien vers la fiche Fast*/
        downloadFastFile(record) {
            const trigram = record.currentMetaRecord.$datas.platformId.slice(0, 3);
            const platformName = record.currentMetaRecord.$datas.platformId;
            const fileUrl = `/pub/${trigram}/${platformName}/fast-latest/`;

            this.$router.push({
                name: "FastView",
                params: {
                    project_id: record.currentMetaRecord.$datas.projectId,
                    platform_id: record.currentMetaRecord.$datas.platformId,
                },
                query: {
                    url: fileUrl,
                },
            });
        },

        /*Visualiser le projet*/
        viewProject(record) {
            this.$router.push({
                name: "ProjectView",
                params: {
                    project_id: record.currentMetaRecord.$datas.projectId,
                    project_path: record.currentMetaRecord.$datas.projectPath,
                },
            });
        },

        /*modifier la plateforme*/
        // editPlatform(record) {
        //     this.$router.push({
        //         name: "ProjectEdit",
        //         params: { project_id: record.currentMetaRecord.$datas.projectId },
        //     });
        // },
    },

    /* import formatDate pour formater la date en fr */
    mixins: [dateMixin],

};
</script>
