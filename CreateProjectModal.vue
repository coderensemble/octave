<template>
    <fr-modal>
        <Form v-slot="{ meta }" ref="addProject">
            <div class="fr-container">
                <div class="fr-grid-row fr-grid-row--gutters">
                    <div class="fr-col-12 fr-col-md-9">
                        <SearchBar name="project"
                                   label="Libellé du Projet"
                                   is-required
                                   :getOptions="getOptions"
                                   v-model="selectedProject"
                                   @update:modelValue="handleSelect"
                                   required
                                   description="Saisissez les premières lettres du projet"
                                   :rules="{required_project: true, unique_project_name: true}"
                        />
                    </div>
                    <div class="fr-col-12 fr-col-md-3">
                        <custom-input v-model="createTrigram"
                                      :rules="{ min_car: 3, max_car: 3, lowerCase: true, unique_trigram: true }"
                                      name="trigram"
                                      validateOnInput
                                      description="3 lettres Alphanum"
                                      label="Trigramme"
                                      is-required
                        />
                    </div>
                    <div class="fr-col-12">
                        <div class="fr-container fr-background-alt--grey fr-p-4v"
                             v-if="Object.values(this.selectedData).some(item => item !== '')">
                            <div class="fr-grid-row fr-grid-row--gutters">

                                <div class="fr-col-12 fr-col-md-4">
                                    <div><strong>MOE</strong></div>
                                    <div>{{ selectedData.MOE }}</div>
                                </div>
                                <div class="fr-col-12 fr-col-md-4">
                                    <div><strong>MOA</strong></div>
                                    <div>{{ selectedData.MOA }}</div>
                                </div>
                                <div class="fr-col-4">
                                    <div><strong>Code Application</strong></div>
                                    <div>{{ selectedData.CodeApp }}</div>
                                </div>
                                <div class="fr-col-12">
                                    <div><strong>Description</strong></div>
                                    <div v-html="selectedData.Description"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="fr-col-12">
                        <fr-button label="Ajouter"
                                   @click.prevent="handleSubmit"
                                   :is-disabled="!meta.valid"
                        />
                    </div>
                </div>
            </div>
        </Form>
    </fr-modal>
</template>

<script>
import { ErrorMessage, Form, defineRule } from "vee-validate";
import SearchBar from "@/components/Octave/SearchBar.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";
import { createProject, getGroup, getGroupProjects, starProject } from "@/services/gitlab.js";
import "@/services/validationRules.js";
import { mapGetters } from "vuex";
import { searchApplication } from "@/services/fastapi.js";


export default {
    name: "CreateProjectModal",
    components: { CustomInput, SearchBar, ErrorMessage, Form },
    props: ["records"],
    data() {
        return {
            selectedData: {
                MOE: "",
                MOA: "",
                CodeApp: "",
                Description: "",
            },
            createTrigram: "",
            selectedProject: "",
            storedOptions: [],
        };
    },
    methods: {
        async handleSelect(selectedLabel) {
            this.selectedData = {
                MOE: "",
                MOA: "",
                CodeApp: "",
                Description: "",
            };

            let filteredResults = this.storedOptions.filter(
                (project) => project.Libelle === selectedLabel,
            );

            if (filteredResults.length > 0) {
                const selected = filteredResults[0];
                this.selectedData.MOE = selected.MOE;
                this.selectedData.MOA = selected.MOA;
                this.selectedData.CodeApp = selected.Code;
                this.selectedData.Description = selected.Libell_long;
            } else {
                this.$refs.addProject.setErrors({ project: "Le projet saisi n'existe pas dans la liste des options" });

            }
        },
        async getOptions(inputValue) {
            if (inputValue.length < 3) {
                return [];
            }
            const res = await searchApplication(inputValue);
            if (res) {
                this.storedOptions = res.data;
                return res.data.map((item) => item.Libelle);
            } else {
                return [];
            }
        },
        async handleSubmit() {
            let group = await getGroup(import.meta.env.VITE_GITLAB_GROUP);
            const project = await createProject({
                name: this.selectedProject,
                namespace_id: group.id,
                path: this.createTrigram,
                description: this.selectedData.Description,
                build_git_strategy: 'clone'
            });
            await starProject(project.id);
            this.$emit("update-projects");
            this.$emit("close-modal");
        },
    },
    created() {
        defineRule("required_project", value => {
            return !!this.selectedProject || "Un projet doit être sélectionné.";
        });
        defineRule("unique_trigram", async value => {
            const path = `${import.meta.env.VITE_GITLAB_GROUP.toLowerCase()}/${value}`
            const project = await getGroupProjects(
                import.meta.env.VITE_GITLAB_GROUP,
                undefined,
                undefined,
                `${encodeURIComponent(path)}&search_namespaces=true`);
            return project.length ? "Ce trigramme existe déjà." : true;
        });
        defineRule("unique_project_name", async value => {
            const project = await getGroupProjects(
                import.meta.env.VITE_GITLAB_GROUP,
                undefined,
                undefined,
                value);
            return project.length ? "Ce projet existe déjà." : true;
        });

    },
    computed: {

        ...mapGetters("authentication", ["user"]),
    },
};
</script>