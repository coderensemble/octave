<template>
    <div class="fr-grid-row fr-grid-row--gutters fr-mt-5w">
        <div class="fr-col-8">
            <h2 class="fr-h2">Projets</h2>
        </div>
        <div class="fr-col-4">
            <ul class="fr-btns-group--right">
                <fr-button
                    label="Ajouter un Projet"
                    iconName="add-line"
                    iconPosition="left"
                    title="Ajouter un Projet"
                    v-if="userGroups && userGroups.includes('CAT')"
                    @click="modalProject.show=true"
                    @update-project="fetchProjects"
                />
            </ul>
        </div>
        <div class="fr-p-4v fr-col-12 fr-mb-2w">


            <clir-auto-table
                v-model:state="projects.stateData"
                v-bind="projects"
                @insertRecord="modalProject.show=true"
                @refresh="fetchProjects"
                refreshable
            >
                <template #FavRenderer="currentRecordInfos">
                    <FavRenderer
                        selectedIcon="star-fill"
                        unselectedIcon="star-line"
                        :currentMetaRecord="currentRecordInfos.currentMetaRecord.$datas"
                        :initialIsStarred="record => record.isStarred"
                        :onStar="id => starProject(id)"
                        :onUnstar="id => unStarProject(id)"
                    />
                </template>

                <template #customLineActions="currentRecordInfos">
                    <!--                    <fr-button title="Voir le projet" class="fr-btn&#45;&#45;tertiary-no-outline" iconName="eye-line"-->
                    <!--                               @click="viewProject(currentRecordInfos)" />-->

                    <fr-button class="fr-btn--tertiary-no-outline"
                               :iconName="currentRecordInfos.currentMetaRecord.$datas.isStarred ? 'star-fill': 'star-line'"
                               @click="toggleFavorites(currentRecordInfos.currentMetaRecord.$datas)" />
                    <fr-button title="Voir le projet"
                               class="fr-btn--tertiary-no-outline" iconName="arrow-right-line"
                               @click="viewProject(currentRecordInfos)" />
                </template>
            </clir-auto-table>
        </div>
    </div>
    <CreateProjectModal
        :records="projects.records"
        v-model="modalProject.show"
        v-bind="modalProject"
        @close-modal="modalProject.show = false"
        @update-projects="fetchProjects"
    />
</template>

<script>
import {
    getGroupProjects,
    createProject,
    getGroup,
    getUser,
    starProject,
    unStarProject,
    getStarredProjects,
} from "@/services/gitlab.js";
import CreateProjectModal from "@/pages/Projects/CreateProjectModal.vue";
import { validateEmptyField, resetInputs } from "@/services/form.js";
import { initProject } from "@/services/backend.js";
import { mapState, mapGetters } from "vuex";
import FavRenderer from "@/components/Octave/FavRenderer.vue";
import FrLoading from "@/to_be_deleted/components/FrLoading/FrLoading.vue";

export default {
    name: "Projects",
    components: { FrLoading, FavRenderer, CreateProjectModal },
    data() {
        return {
            modalProject: {
                title: "Ajouter un Projet",
                iconName: "add-line",
                size: "lg",
                show: false,
            },
            projects: {
                stateData: {
                    currentPage: 1,
                    sortBy: "isStarred",
                    sortOrder: "desc",
                    searchField: "",
                    searchText: "",
                    rowsByPage: 5,
                },
                fields: [
                    { key: "name", label: "Nom du projet", type: "string" },
                    { key: "path", label: "Trigramme", type: "string" },
                    { key: "user", label: "Responsable", type: "string" },
                    { key: "created_at", label: "Création", type: "date", alignment: "left", format: "DD/MM/YYYY" },
                    {
                        key: "last_activity_at",
                        label: "Modification",
                        type: "date",
                        alignment: "center",
                        format: "DD/MM/YYYY",
                    },
                    // {
                    //     key: "favorites",
                    //     label: "Favorites",
                    //     type: "number",
                    //     alignment: "right",
                    //     customRenderer: "FavRenderer",
                    // },
                ],
                records: [],
                //caption: "légende du tableau",
                //selectMode: "all",
            },
        }
            ;
    },
    methods: {
        async toggleFavorites(record) {
            if (record.isStarred) {
                await unStarProject(record.id);

            } else {
                await starProject(record.id);
            }
            record.isStarred = !record.isStarred;
            this.sortProjects();
        },
        sortProjects() {
            this.projects.records.sort((a, b) => b.$datas.isStarred - a.$datas.isStarred);
        },
        starProject,
        unStarProject,
        viewProject(record) {
            this.$router.push({
                name: "ProjectView",
                params: {
                    project_id: record.currentMetaRecord.$datas.id,
                    project_path: record.currentMetaRecord.$datas.path,
                },
            });
        },
        editProject(record) {
            this.$router.push({ name: "ProjectEdit", params: { project_id: record.currentMetaRecord.$datas.id } });
        },
        async fetchProjects() {
            try {
                let  projects = await getGroupProjects(import.meta.env.VITE_GITLAB_GROUP, this.projects.stateData.currentPage, 1000, this.projects.stateData.page);
                const favorites = await getStarredProjects();
                projects = projects.filter(project => !project.tag_list.includes('disabled'));

                this.projects.records = await Promise.all(projects.map(async project => {
                    const user = await getUser(project.creator_id);
                    return {
                        $datas: {
                            id: project.id,
                            name: project.name,
                            user: user.name,
                            isStarred: favorites.some(favorite => favorite.id === project.id),
                            last_activity_at: project.last_activity_at,
                            created_at: project.created_at,
                            path: project.path,
                        },
                        $metadatas: { isSelectable: true },
                    };
                }));
                this.sortProjects();


            } catch (error) {
                console.error("There was an error:", error);
            }
        },

    },
    computed: {
        ...mapGetters("authentication", ["userGroups"]),
    },
    async created() {
        this.$store.commit("loading/SET_LOADING", true);

        /*const standards = await getStandards();
        standards.sort((a, b) => a.name.localeCompare(b.name));*/
        await this.fetchProjects();
        this.$store.commit("loading/SET_LOADING", false);

    },
};
</script>