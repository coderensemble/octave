<template>
    <div class="fr-grid-row">
        <div class="fr-col-12">
            <h1 class="fr-mb-0">
                Nouvelle Plateforme {{ edb.plateforme.code }}
            </h1>
            <p class="fr-text--xs fr-ml-1v">Version de Standard: {{ standard.version }}
                <fr-button v-if="standard.documentation" title="Documentation" size="sm" :level="4"
                           iconName="external-link-line"
                           @click="openDocumentation" />
            </p>
        </div>
    </div>
    <fr-stepper :steps="stepList" :currentStep="currentStepIndex + 1" />
    <Form v-slot="{errors}" :ref="`form-${currentStepIndex}`">
        <fr-loading v-if="loading" />
        <component
            :is="currentStep.component"
            :ref="`step-${currentStepIndex}`"
            :stepIndex="currentStepIndex"
            :catalogues="catalogues"
            :edb="edb"
            :project="project"
            :projectId="projectId"
            v-else
        />
    </Form>
    <fr-button v-if="currentStepIndex !== 0" label="Etape précédente" @click="goToPreviousStep" class="fr-mr-2w" />
    <fr-button v-if="currentStepIndex < steps.length -1" label="Etape suivante" @click="goToNextStep" />
    <fr-button v-else label="Valider la plateforme" @click="createPlatform" />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Identification from "@/pages/Platforms/Steps/Identification.vue";
import Architecture from "@/pages/Platforms/Steps/Architecture.vue";
import Exigences from "@/pages/Platforms/Steps/Exigences.vue";
import Evolution from "@/pages/Platforms/Steps/Evolution.vue";
import Creation from "@/pages/Platforms/Steps/Creation.vue";
import { catalogues, edb, server } from "@/pages/Platforms/data.js";
import {
    getDocumentationStd,
    getProjectStandardTag,
    getProjectWithDetails,
    getStandard,
    getStandardTags,
    manageIssue,
    mergeMatchingObject,
} from "@/services/octave.js";
import { commit, createBranch, createTag, getProject } from "@/services/gitlab.js";
import { Form } from "vee-validate";
import { cloneDeep } from "lodash";
import yaml from "js-yaml";
import { checkTask, executeTask, getSoftVersions, notifyProject } from "@/services/fastapi.js";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import { steps } from "@/datas/steps.js";
import FrLoading from "@/to_be_deleted/components/FrLoading/FrLoading.vue";
import { mailNewPlatform } from "@/services/mail.js";

export default {
    components: {
        Identification,
        Architecture,
        Exigences,
        Evolution,
        Creation,
        Form,
    },
    props: ["projectId"],
    mixins: [platformMixins],
    data() {
        return {
            steps: [
                { name: "Identification", component: Identification },
                { name: "Architecture", component: Architecture },
                { name: "Exigences", component: Exigences },
                { name: "Evolution", component: Evolution },
                { name: "Création", component: Creation },
            ],
            currentStepIndex: 0,
            edb: cloneDeep(edb),
            catalogues: catalogues,
            standard: {
                version: "",
                documentation: "",
            },
            project: {},
        };
    },
    async mounted() {
        this.$store.commit("loading/SET_LOADING", true);

        const standardTags = await getStandardTags();
        // Check if a standard already exist on a platform of this project. If not get the last from octave-standard

        this.standard = { version: "0.0.99" };
        // this.standard = await getProjectStandardTag(this.projectId)
        //     ? await getProjectStandardTag(this.projectId)
        //     : standardTags[0];
        this.standard.documentation = await getDocumentationStd(this.standard.version);

        this.catalogues = await getStandard(`STD-${this.standard.version}`);

        this.project = await getProjectWithDetails(this.projectId);
        //this.platforms = await getPlatforms(this.projectId);
        this.$store.commit("loading/SET_LOADING", false);

    },
    computed: {
        currentStep() {
            return this.steps[this.currentStepIndex];
        },
        stepList() {
            return this.steps.map(step => step.name);
        },
        ...mapGetters("authentication", ["userGroups", "user"]),
    },
    methods: {
        openDocumentation() {
            window.open(this.standard.documentation);
        },
        ...mapActions(["addEdb"]),
        async goToNextStep() {
            const stepRef = this.$refs[`form-${this.currentStepIndex}`];
            const validation = await stepRef.validate();
            // const validation = stepRef?.$refs?.hasOwnProperty(formKey) ? stepRef.$refs[formKey].validate() : true;
            if (this.currentStepIndex < this.steps.length - 1 && validation.valid) {
                this.currentStepIndex++;
            }
        },
        goToPreviousStep() {
            if (this.currentStepIndex > 0) {
                this.currentStepIndex--;
            }
        },
        async generateEDB() {
            const architecture = this.edb.plateforme.architecture;

            if (this.catalogues.plateforme.hasOwnProperty(architecture)) {
                this.edb.plateforme.env = this.$route.query.env;
                this.edb.plateforme.modele_description = this.catalogues.plateforme[architecture].description;
                this.edb.stockage = this.catalogues.plateforme[architecture].stockage;
                this.edb.application = this.catalogues.plateforme[architecture].application;

                const groupesServeurs = this.catalogues.plateforme[architecture].groupes;

                // Default servers creation from platform
                for (const key of groupesServeurs) {
                    let serverModel = key.slice(0, -1);
                    if (this.catalogues.serveur.hasOwnProperty(serverModel)) {
                        let serverData = this.catalogues.serveur[serverModel];
                        let serverDefault = cloneDeep(server);
                        mergeMatchingObject(serverData, serverDefault);
                        const os = Object.keys(serverData.soft)[0];
                        const soft = serverData.soft[os][0];
                        const versions = await getSoftVersions(os, soft);
                        this.edb.serveur[key.slice(1)] = {
                            ...serverDefault,
                            modele: serverModel,
                            os: os,
                            soft: soft,
                            version: versions?.data?.[0]?.version || "latest",
                        };
                    }
                }

                // Création des outils par défaut
                this.edb.plateforme.outils = Object.fromEntries(
                    Object.entries(this.catalogues.plateforme[architecture].outils)
                        .map(([tool, items]) => [tool, items.find(item => item !== "")]),
                );

                // Ajout du code projet
                this.edb.projet.code = this.project.path;
                this.edb.projet.nom = this.project.name;
                this.edb.projet.moe = this.project?.cpia?.MOE ?? "";
                this.edb.projet.moa = this.project?.cpia?.MOA ?? "";
                this.edb.projet.code_app = this.project?.cpia?.Code ?? "";
                this.edb.projet.description = this.project?.cpia?.Description ?? "";

                // Ajout des utilisateurs et groupes par défaut
                this.edb.projet.user = this.project.path;
                this.edb.projet.group = this.project.path;

                this.$nextTick(() => {
                    // Update des réseaux
                    this.updateNetworks();

                    //Update des hosts
                    //this.updateHosts();
                });


            } else {
                console.log(`Pas de catalogue correspondant à l'architecture: ${architecture}`);
            }
        },
        async createEDB() {
            // Création de la branche
            const branchName = `edb-${this.edb.plateforme.code}`;
            await createBranch(this.projectId, branchName);

            const yamlContent = yaml.dump(this.edb, { noRefs: true });

            // Prepare the data for the new file
            const actions = [{
                action: "create",
                file_path: `edb/${branchName}/${branchName}.yaml`,
                content: yamlContent,  // Convert the EDB object to a JSON string
            }];

            // Commit the new file
            await commit(this.projectId, branchName, `Created edb/edb-${branchName}`, actions);

            return branchName;
        },
        async createPlatform() {
            try {
                this.$store.commit("loading/SET_LOADING", true);

                // Générer l'edb complet à partir des informations de la plateforme.
                await this.generateEDB();
                await this.createEDB();

                await manageIssue(this.projectId, this.edb.plateforme.code, ["STEP_ONGOING", "GRP_CAT", "GRP_MOE"], `Création de la plateforme ${this.edb.plateforme.code}`);
                const params = {
                    version: this.standard.version,
                    project: this.project.path,
                    platforms: this.edb.plateforme.code,
                };

                // Send a notifications to project users
                const {subject, body} = mailNewPlatform(this.projectId, this.edb.plateforme.code, this.user, this.$router);
                await notifyProject(this.projectId, encodeURIComponent(subject), encodeURIComponent(body));

                const result = await executeTask("standard/update", params);
                let taskState;
                while (taskState !== "SUCCESS") {
                    taskState = (await checkTask(result.task_id)).state;
                    // Introduisez un délai entre chaque vérification pour éviter une surcharge.
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                this.$store.commit("loading/SET_LOADING", false);
                await this.$router.push({
                    name: "PlatformAfterCreate", params: {
                        project_id: this.projectId,
                        platform_id: this.edb.plateforme.code,
                    },
                });
            } catch (error) {
                console.error("Error creating platform:", error);
            }
        },

    },
};
</script>