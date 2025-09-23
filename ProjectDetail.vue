<template>
    <h1 class="fr-mb-4v">{{ project.name }} ({{ project.path }})</h1>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-2w fr-grid-row--center">

        <!-- Premier bloc -->
        <div class="fr-col-12 fr-col-md-7 fr-col-lg-7">
            <div class="fr-container fr-background-alt--grey fr-p-4v">
                <div class="fr-grid-row fr-grid-row--gutters">
                    <div class="fr-col-12 fr-col-md-4">
                        <div><strong>MOE</strong></div>
                        <div v-if="project?.cpia?.MOE">{{ project?.cpia?.MOE }}</div>
                        <div v-else>N/A</div>
                    </div>
                    <div class="fr-col-12 fr-col-md-4">
                        <div><strong>MOA</strong></div>
                        <div v-if="project?.cpia?.MOA">{{ project?.cpia?.MOA }}</div>
                        <div v-else>N/A</div>
                    </div>
                    <div class="fr-col-12 fr-col-md-4">
                        <div><strong>Code Application</strong></div>
                        <div v-if="project?.cpia?.Code">{{ project?.cpia?.Code }}</div>
                        <div v-else>N/A</div>
                    </div>
                </div>
                <div class="fr-grid-row fr-grid-row--gutters">
                    <div class="fr-col-12">
                        <div><strong>Description</strong></div>
                        <div v-if="project?.cpia?.Description" v-html="project?.cpia?.Description"></div>
                        <div v-else>N/A</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Deuxième Bloc -->
        <div class="fr-col-12 fr-col-md-5 fr-col-lg-5">
            <p v-if="modalStandard.version">
                <strong>Version du standard :</strong> {{ standard.version }}
                <fr-button v-if="standard.documentation" label="Documentation" iconPosition="left" size="sm"
                           :level="4" iconName="external-link-line" @click="openDocumentation()" />
                <!-- Bouton pour choisir la version du standard -->
                <span v-if="userGroups && userGroups.includes('CAT')">
                            <fr-button label="Modifier" iconPosition="left" size="sm" :level="4" iconName="edit-line"
                                       @click="modalStandard.show = true" />
                        </span>
            </p>
            <p>
                <strong>Auteur : </strong>{{ project.author.name }}
            </p>
            <p>
                <strong>Création :</strong> {{ formatDate(project.created_at) }}
            </p>
            <p>
                <strong>Dernière Modification :</strong> {{ formatDate(project.last_activity_at) }}
            </p>

        </div>
    </div>

    <div class="fr-grid-row fr-mb-2w fr-bordered">
        <div class="fr-col-md-8 fr-col-12">
            <h3>Liste des Plateformes</h3>
        </div>
        <div class="fr-col-md-4 fr-col-12 fr-pr-4v">
            <fr-button
                label="Ajouter une Plateforme"
                iconName="add-line"
                iconPosition="left"
                title="Ajouter une Plateforme"
                v-if="userGroups && userGroups.includes('CAT')"
                @click="createPlatform"
            />
        </div>
    </div>
    <div class="fr-grid-row fr-mb-2w">
        <div class="fr-p-4v fr-col-12" v-if="Object.keys(platforms).length === 0">
            Aucune plateforme disponible
        </div>
        <div class="fr-p-4v fr-col-12 fr-col-md-6" v-for="(platform, index) in platforms">

            <div class="fr-card fr-card--horizontal">
                <div class="fr-card__body">
                    <div class="fr-card__content">
                        <h3 class="fr-card__title">{{ index }}
                            <!--                                <fr-button title="Voir l'historique de la plateforme" size="sm" :level="4"-->
                            <!--                                           iconName="time-line" />-->
                        </h3>
                        <p class="fr-card__desc fr-mt-0">{{ platform.edb.plateforme.description }}</p>
                        <div class="fr-card__start">
                            <div
                                style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <ul @click="openHistoryModal(platform)" style="cursor: pointer;"
                                        class="fr-badges-group"
                                        v-if="getPlatformStep(index)">
                                        <li class="fr-badge fr-badge--sm fr-badge--blue-ecume fr-badge--icon-left fr-icon-time-line">
                                            {{ steps[getPlatformStep(index)] }}
                                        </li>
                                    </ul>
                                    <ul class="fr-badges-group">
                                        <li class="fr-badge fr-badge--sm fr-badge--orange-terre-battue fr-badge--icon-left fr-icon-group-fill"
                                            v-for="(group) in getPlatformGroups(index)">
                                            {{ group }}
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <fr-button
                                        v-if="user.name === platform.commit.author_name"
                                        label=""
                                        size="sm"
                                        class="fr-mt-n2w"
                                        level="tertiary-no-outline"
                                        iconName="delete-bin-line"
                                        iconPosition="left"
                                        title="Supprimer"
                                        @click="openDeleteModal(index)"
                                    />
                                </div>
                            </div>
                            <p class="fr-card__detail" v-if="getPlatformVersion(index, platform)"><i>Version :
                                {{ getPlatformVersion(index, platform) }}</i></p>
                        </div>
                        <div class="fr-card__end">
                            <p class="fr-card__detail">
                                Dernière modification le {{ formatDate(platform.commit.committed_date) }}
                                par
                                {{ platform.commit.committer_name }}
                            </p>
                        </div>
                    </div>
                    <div class="fr-card__footer">
                        <ul class="fr-btns-group fr-btns-group--right fr-btns-group--icon-left fr-btns-group--inline fr-btns-group--inline-lg">
                            <li>
                                <fr-button
                                    label="Fast"
                                    level="tertiary"
                                    class="fr-mr-1w"
                                    size="sm"
                                    iconName="eye-line"
                                    iconPosition="left"
                                    title="Fast"
                                    v-if="platform.tags.find(tag => tag.name.startsWith(`FAST-`))"
                                    @click="openFastModal(index, platform)"
                                />
                            </li>
                            <li v-if="hasLock(index)">

                                <fr-button
                                    class="fr-mr-1w"
                                    level="secondary"
                                    size="sm"
                                    label="Modifier"
                                    iconName="pencil-line"
                                    iconPosition="left"
                                    title="Modifier"
                                    @click="openLockModal(index)"
                                />
                            </li>
                            <li v-else>

                                <fr-button
                                    class="fr-mr-1w"
                                    level="secondary"
                                    label="Modifier"
                                    size="sm"

                                    iconName="pencil-line"
                                    iconPosition="left"
                                    title="Modifier"
                                    @click="editPlatform(index)"
                                />
                            </li>
                            <li>
                                <fr-button
                                    label="Visualiser"
                                    level="primary"
                                    class="fr-mr-1w"
                                    size="sm"

                                    iconName="eye-line"
                                    iconPosition="left"
                                    title="Visualiser"
                                    @click="viewPlatform(index)"
                                />
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <StandardModal
        v-model="modalStandard"
        @confirm="confirmStandard" />
    <HistoryModal
        v-model="modalHistory"
    />
    <FastModal
        v-model="modalFast"
        @redirect="handleRedirect"
    />
    <!-- Modal pour modification en cours -->
    <fr-modal v-if="modalLock.user" v-model="modalLock.show" title="Modification en cours">
        <p> L'utilisateur <b>{{ modalLock.user.name }}</b> est actuellement en train de modifier la
            plateforme.
            <br /><br />
            <!--            Vous pouvez le contacter à l'adresse <b>{{ modalLock.user.email }}</b>.-->
        </p>
        <div class="fr-my-3v">
            <fr-button class="fr-mr-2w" v-if="userGroups && userGroups.includes('CAT')"
                       label="Supprimer le verrou"
                       iconPosition="left"
                       @click='deleteLock(modalLock.platformId)'
                       iconName="lock-unlock-line"
            />
            <fr-button iconPosition="" label="Annuler" level="secondary" @click="modalLock.show = false" />
        </div>
    </fr-modal>
    <confirm-modal
        v-model="deleteModal.show"
        title="Supprimer une Platforme"
        @confirm="deletePlatform(deleteModal.platformId)"
        :message="`Voulez vous vraiment supprimer la plateforme ${deleteModal.platformId} ?`"
    />
</template>


<script>
import { deleteTag, getUser } from "@/services/gitlab.js";
import {
    deletePlatform,
    getDocumentationStd,
    getFastUrl,
    getPlatforms, getPlatformVersion,
    getProjectStandardTag,
    getProjectWithDetails,
} from "@/services/octave.js";
import { mapGetters } from "vuex";
import { checkTask, executeTask } from "@/services/fastapi.js";
import { dateMixin } from "@/mixins/date.js";
import ConfirmModal from "@/components/Octave/ConfirmModal.vue";
import StandardModal from "@/pages/Projects/Modal/StandardModal.vue";
import { steps } from "../../datas/steps.js";
import FastModal from "@/pages/Projects/Modal/FastModal.vue";
import HistoryModal from "@/pages/Projects/Modal/HistoryModal.vue";


export default {
    components: { ConfirmModal, StandardModal, FastModal, HistoryModal },
    props: ["projectId", "isReadOnly"],
    data() {
        return {
            standard: {
                version: "",
                documentation: null,
            },
            modalStandard: {
                show: false,
                version: "",
                loading: false,
            },
            modalHistory: {
                show: false,
                projectId: null,
                platform: null,
            },
            modalFast: {
                show: false,
                platformId: null,
                projectId: null,
                platform: null,
            },
            modalLock: {
                platformId: null,
                show: false,
                user: {},
            },
            deleteModal: {
                platformId: null,
                show: false,
            },
            project: {
                author: "",
                standard: {
                    name: "",
                },
            },
            platforms: {},
        };
    },
    async mounted() {
        this.$store.commit("loading/SET_LOADING", true);
        this.project = await getProjectWithDetails(this.projectId);
        this.platforms = await getPlatforms(this.projectId);
        const standard = await getProjectStandardTag(this.projectId);
        if (standard) {
            this.modalStandard.version = this.standard.version = standard.version;
            this.standard.documentation = await getDocumentationStd(this.standard.version);
        }
        this.$store.commit("loading/SET_LOADING", false);
    },

    methods: {
        async showFast(platformId) {
            const fastUrl = await getFastUrl(platformId, "tmp");
            if (fastUrl) {
                window.open(`${fastUrl}/fast`);
            }
        },
        openDocumentation() {
            window.open(this.standard.documentation, "_blank");
        },
        async confirmStandard() {
            this.$store.commit("loading/SET_LOADING", true);

            const params = {
                version: this.modalStandard.version,
                project: this.project.path,
            };
            const result = await executeTask("standard/update", params);
            this.modalStandard.show = false;

            this.standard.version = this.modalStandard.version;
            let taskState;
            while (taskState !== "SUCCESS") {
                taskState = (await checkTask(result.task_id)).state;
                // Introduisez un délai entre chaque vérification pour éviter une surcharge.
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            // Update standard and documentation link
            this.standard.version = this.modalStandard.version;
            this.standard.documentation = await getDocumentationStd(this.standard.version);
            this.$store.commit("loading/SET_LOADING", false);

        },
        getPlatformStep(platformId) {
            const stepLabels = this.platforms[platformId]?.issues.flatMap(issue =>
                issue.labels.filter(label => label.startsWith("STEP_")));

            return stepLabels[0];
        },
        getPlatformGroups(platformId) {
            return this.platforms[platformId].issues.flatMap(issue =>
                issue.labels.filter(label => label.startsWith("GRP_")).map(label => label.replace("GRP_", "")));
        },
        getPlatformVersion(platformId) {
            const tags = this.platforms[platformId].tags;
            const sortedTags = tags
                .filter(tag => tag.name.startsWith('FAST-') && !tag.name.endsWith("tmp"))
                .map(tag => tag.name.split('-')[2])
                .sort((a, b) => b.localeCompare(a, undefined, {numeric: true, sensitivity: 'base'}));  // sort, numeric
            return sortedTags.length > 0 ? sortedTags[0] : null;
        },
        getLockTag(platformId) {
            return this.platforms[platformId].tags.find(tag => tag.name.startsWith(`LOCK-FO-${platformId}`));
        },

        hasLock(platformId) {
            const lockTag = this.getLockTag(platformId);
            if (!lockTag) return false;
            const usernameLock = lockTag.name.split("-").pop();
            return usernameLock !== this.user.username;
        },
        async openLockModal(platformId) {
            const lockTag = this.getLockTag(platformId);
            const username = lockTag.name.split("-").pop();
            this.modalLock.user = await getUser(username);
            this.modalLock.platformId = platformId;
            this.modalLock.show = true;  // ouvre la modal
        },
        openFastModal(platformId, platform) {
            if (platform) {
                this.modalFast.platformId = platformId;
                this.modalFast.projectId = this.projectId;
                this.modalFast.platform = platform;
                this.modalFast.show = true;
            }
        },
        openHistoryModal(platform) {
            this.modalHistory = {
                platform: platform,
                projectId: this.projectId,
            };
            this.modalHistory.show = true;
        },
        async deleteLock(platformId) {
            const platform = this.platforms[platformId];

            if (!this.userGroups.includes("CAT")) return;

            const lockTag = this.getLockTag(platformId);
            if (!lockTag) return;

            await deleteTag(this.projectId, lockTag.name);
            this.platforms[platformId].tags = platform.tags.filter(tag => !tag.name.includes(`LOCK-FO-${platformId}`));
            this.modalLock.show = false;
        },

        createPlatform() {
            this.$router.push({
                name: "PlatformCreate",
                params: { project_id: this.projectId },
                query: { env: "production" },
            });
        },
        viewPlatform(platformId) {
            this.$router.push({
                name: "PlatformView",
                params: { project_id: this.projectId, platform_id: platformId },
            });
        },
        handleRedirect({ projectId, platformId, fastUrl, version, temp }) {
            this.$router.push({
                name: "FastView",
                params: {
                    project_id: projectId,
                    platform_id: platformId,
                },
                query: {
                    url: encodeURIComponent(fastUrl),
                    version,
                    temp,
                },
            });
        },
        editPlatform(platformId) {
            this.$router.push({
                name: "PlatformEdit",
                params: { project_id: this.projectId, platform_id: platformId },
            });
        },
        async deletePlatform(platformId) {
            this.$store.commit("loading/SET_LOADING", true);

            await deletePlatform(this.projectId, platformId);
            delete this.platforms[platformId]; // remove platform from the list
            this.$store.dispatch("platforms/deletePlatform", platformId);
            this.$store.commit("loading/SET_LOADING", false);


        },
        openDeleteModal(platformId) {
            this.deleteModal.platformId = platformId;
            this.deleteModal.show = true;
        },

    },
    computed: {
        steps() {
            return steps;
        },
        ...mapGetters("authentication", ["userGroups", "user"]),
    },
    mixins: [dateMixin],
};
</script>