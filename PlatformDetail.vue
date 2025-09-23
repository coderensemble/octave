<template>
    <div class="fr-grid-row">
        <div class="fr-col-4">
            <h1 class="fr-mb-0">
                Plateforme {{ platformId }}
            </h1>
            <p class="fr-text--xs fr-ml-1v">Version de Standard: {{ standard.version }}
                <fr-button v-if="standard.documentation" title="Documentation" size="sm" :level="4"
                           iconName="external-link-line"
                           @click="openDocumentation" />
            </p>
        </div>
        <div class="fr-col-8" style="display: flex; justify-content: flex-end; flex-wrap: wrap; align-items: center;">
            <p class="fr-text--xs" style="display: flex; align-items: center;"><i>Dernière sauvegarde {{ lastCommit.date
                }} par {{ lastCommit.user }}</i>
                <fr-button
                    v-if="!isReadOnly"
                    :isDisabled="!isPlatformTouched(platformId) || isReadOnly"
                    label="Sauvegarder"
                    iconPosition="left"
                    title="Sauvegarder la plateforme"
                    iconName="save-3-line"
                    level="tertiary-no-outline"
                    @click="saveModal.show = true"

                />
                <fr-button
                    v-if="!isReadOnly"
                    :isDisabled=" !isPlatformTouched(platformId) || isReadOnly"
                    iconName="arrow-go-back-line"
                    iconPosition="left"
                    label="Annuler"
                    title="Annuler les changements et revenir à la dernière version"
                    @click="this.restoreModalOpen = true"
                    level="tertiary-no-outline"
                />
                <span v-if="userGroups.includes('CAT')">
                <fr-button
                    v-if="!isReadOnly"
                    label="Valider"
                    :isDisabled="Object.values(errors).some(tabErrors => Object.keys(tabErrors).length > 0) || isReadOnly"
                    iconName="arrow-right-line"
                    iconPosition="left"
                    @click="this.validateModal.show= true"
                    level="tertiary-no-outline"
                />
                </span>
            </p>

        </div>
    </div>
    <div class="fr-grid-row">
        <div class="fr-col-12">
            <div class="fr-tabs">
                <ul class="fr-tabs__list" role="tablist" aria-label="Tabs label">
                    <li role="presentation"
                        v-for="(tab, index) in filteredTabs()"
                        :key="index"
                    >
                        <button
                            :id="`tabpanel-${index}`"
                            class="fr-tabs__tab fr-tabs__tab--icon-left"
                            :class="[errors?.[index] && Object.keys(errors[index]).length > 0 ?
                            'fr-icon-error-warning-line fr-tabs__tab--error' :
                            'fr-icon-checkbox-line']"
                            :aria-selected="activeTab === index"
                            :aria-controls="`tabpanel-${index}-panel`"
                            @click="onChangeTab($event, index)"
                        >
                            {{ tab.label }}
                        </button>
                    </li>
                </ul>
                <div
                    v-for="(tab, index) in filteredTabs()"
                    :key="index"
                    :id="`tabpanel-${index}-panel`"
                    class="fr-tabs__panel"
                    :class="{'fr-tabs__panel--selected': activeTab === index}"
                    role="tabpanel"
                    :aria-labelledby="`tabpanel-${index}`"
                    tabindex="0"
                    v-show="activeTab === index"
                >
                    <component
                        :is="tab.component"
                        :label="tab.label"
                        :ref="`tab-${index}`"
                        :tabIndex="index"
                        @validation-errors="handleValidationErrors(index, $event)"
                        :edb="currentEdb"
                        :platformId="platformId"
                        :projectId="projectId"
                        :project="project"
                        :isReadOnly="isReadOnly"
                        :catalogues="catalogues"
                        v-if="currentEdb && catalogues"
                    />
                </div>
            </div>
        </div>
    </div>
    <confirm-modal
        v-model="restoreModalOpen"
        @confirm="restoreEdb"
        message="Voulez-vous restaurer les données à la dernière version transmise ? "
    />
    <save-modal
        v-model="saveModal.show"
        :edb="currentEdb"
        @confirm="savePlatform($event)"
    >
    </save-modal>
    <transmission-modal
        v-model="validateModal.show"
        :edb="currentEdb"
        @confirm="validateEdb($event)"
        :console-data="validateModal.consoleData"
    >
    </transmission-modal>
</template>

<script>
import {
    getDocumentationStd, getPlatformVersion,
    getUpdatedPlatformVersion,
    getProjectStandardTag,
    getStandard,
    manageIssue,
} from "@/services/octave.js";
import { mapGetters } from "vuex";
import { dateMixin } from "@/mixins/date.js";

import GeneralInfo from "@/pages/Platforms/Tabs/GeneralInfo.vue";
import Servers from "@/pages/Platforms/Tabs/Servers.vue";
import Storages from "@/pages/Platforms/Tabs/Storages.vue";
import Networks from "@/pages/Platforms/Tabs/Networks.vue";
import Applications from "@/pages/Platforms/Tabs/Applications.vue";
import ConfirmModal from "@/components/Octave/ConfirmModal.vue";
import {notifyProject} from "@/services/fastapi.js"
import TransmissionModal from "@/pages/Platforms/Modal/TransmissionModal.vue";
import SaveModal from "@/pages/Platforms/Modal/SaveModal.vue";
import {
    createTag,
    getTags,
    getProject,
    getCommitFromBranch,
    deleteTag,
} from "@/services/gitlab.js";
import UploadModal from "@/pages/Platforms/Modal/UploadModal.vue";
import platforms from "../../stores/modules/platforms.js";
import { checkTask, executeTask, outputTask } from "@/services/fastapi.js";
import CustomAccordion from "@/components/Octave/CustomAccordion.vue";
import FrLoading from "@/to_be_deleted/components/FrLoading/FrLoading.vue";
import { mailSave, mailValidate } from "@/services/mail.js";

export default {
    components: {
        FrLoading,
        CustomAccordion,
        UploadModal,
        GeneralInfo,
        SaveModal,
        Servers,
        Storages,
        Applications,
        Networks,
        ConfirmModal,
        TransmissionModal,
    },
    props: ["projectId", "platformId", "isReadOnly", "creation"],
    data() {
        return {
            gitDiff: null,
            restoreModalOpen: false,
            saveModal: {
                show: false
            },
            validateModal: {
                show: false,
                consoleData: "",
            },
            new: false,
            checkLock: false,
            activeTab: 0, // par défaut le premier onglet est actif
            tabs: [
                {
                    label: "Informations Générales",
                    component: GeneralInfo,
                    isValid: true,
                },
                {
                    label: "Serveurs",
                    component: Servers,
                    isValid: true,
                },
                {
                    label: "Stockages",
                    component: Storages,
                    isValid: true,
                },
                {
                    label: "Configurations",
                    component: Applications,
                    isValid: true,
                },
                {
                    label: "Réseaux",
                    component: Networks,
                    isValid: true,
                    rights: ["CAT"],
                },
            ],
            catalogues: {},
            errors: {},
            lastCommit: {
                date: null,
                user: null,
            },
            standard: {
                version: "",
                documentation: "",
            },
        };
    },
    watch: {
        currentEdb: {
            deep: true,
            handler(newVal) {
                this.handleLock(this.platformId);
            },
        },
        attachments: {
            deep: true,
            handler(newVal) {
                this.handleLock(this.platformId);
            },
        },
    },

    beforeMount() {
        // Si la plateforme n'existe pas déjà dans le store
        // ou si elle n'a pas été modifié alors on récupère la dernière du gitlab
        if (!this.getPlatform(this.platformId) || !this.isPlatformTouched(this.platformId)) {
            // On crée la plateforme dans le store
            this.$store.dispatch("platforms/createPlatform", {
                projectId: this.projectId,
                platformId: this.platformId,
            });
        }

    },
    async mounted() {
        this.$store.commit("loading/SET_LOADING", true);

        this.standard = await getProjectStandardTag(this.projectId);
        this.standard.documentation = await getDocumentationStd(this.standard.version);

        this.catalogues = await getStandard(`STD-${this.standard.version}`);

        // Pour palier au lien vers la plateforme sur le champs modele_description à remplacer dès que
        // edb mis au propre sur l'ensemble des projets
        // if (catalogues) {
        //     this.catalogues = {
        //         ...catalogues,
        //         plateforme: Object.entries(catalogues.plateforme).find(([key, obj]) =>
        //             this.currentEdb.plateforme.architecture
        //                 ? key === this.currentEdb.plateforme.architecture
        //                 : obj.description === this.currentEdb.plateforme.modele_description,
        //         )?.[1],
        //     };
        // }

        this.project = await getProject(this.projectId);

        //on recupere la date de creation du dernier commit (créé lors de la sauvegarde)
        const commits = await getCommitFromBranch(this.projectId, `edb-${this.platformId}`);
        this.lastCommit.date = this.formatDate(commits[0]?.created_at);
        this.lastCommit.user = commits[0].committer_name;


        // On valide les formulaires des différents onglets lors que l'on est sur une édition
        if (!this.isReadOnly) {
            await this.validateAllTabs();
        }
        this.$store.commit("loading/SET_LOADING", false);

    },
    methods: {
        openDocumentation() {
            window.open(this.standard.documentation);
        },
        async handleLock(platformId) {
            if (this.checkLock) {
                return;
            }
            this.checkLock = true;

            const tags = await getTags(this.projectId, `LOCK-FO-${platformId}`);
            const isTouched = this.isPlatformTouched(this.platformId);

            if (tags.length === 0 && isTouched) {
                const tagName = `LOCK-FO-${platformId}-tmp-${Date.now() / 1000}-${this.$store.getters["authentication/user"].username}`;
                await createTag(this.projectId, tagName, `edb-${platformId}`);
            } else if (tags.length > 0 && !isTouched) {
                await deleteTag(this.projectId, tags[0].name);
            }

            this.checkLock = false;
        },
        handleValidationErrors(index, errors) {
            this.errors[index] = errors;
        },
        async savePlatform(event) {
            // Save platform into store and gitlab
            await this.$store.dispatch("platforms/savePlatform", {
                projectId: this.projectId,
                platformId: this.platformId,
                comment: event.message
            });

            //const platformVersion = await getUpdatedPlatformVersion(this.projectId, this.platformId, this.currentEdb.plateforme.tarpf)

            // Add a comment to the platform gitlab ticket
            await manageIssue(this.projectId, this.platformId,
                ["STEP_ONGOING", "GRP_CAT", "GRP_MOE"],
                `<p class="fr-mb-1w">Mise à jour de la plateforme ${this.platformId}.</p>
                              <p class="fr-m-0 fr-text--sm fr-"><i class="fr-text--sm">"${event.message}"</i></p>`
            );

            // Send a notifications to project users
            const {subject, body} = mailSave(this.platformId, this.user, event.message, this.$router);
            await notifyProject(this.projectId, encodeURIComponent(subject), encodeURIComponent(body));

            // Update save information (user and date)
            const commits = await getCommitFromBranch(this.projectId, `edb-${this.platformId}`);
            this.lastCommit.date = this.formatDate(commits[0]?.created_at);
            this.lastCommit.user = commits[0].committer_name;

        },

        async validateEdb(event) {
            // Save platform into store and gitlab
            await this.$store.dispatch("platforms/savePlatform", {
                projectId: this.projectId,
                platformId: this.platformId,
            });

            const platformVersion = await getUpdatedPlatformVersion(this.projectId, this.platformId, this.currentEdb.plateforme.tarpf, "minor");
            const params = {
                env: "production",
                project: this.project.path,
                platform: this.platformId,
                version: platformVersion,
                message: `Génération de la Fast ${this.platformId}`,
            };
            const result = await executeTask("fast/generate", params);

            let taskState;
            let taskOutput;
            while (taskState !== "SUCCESS") {
                taskState = (await checkTask(result.task_id)).state;
                taskOutput = (await outputTask(result.task_id));
                this.validateModal.consoleData = taskOutput;
                // Introduisez un délai entre chaque vérification pour éviter une surcharge.
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            await createTag(this.projectId, `FAST-${this.platformId}-${platformVersion}-tmp`, `edb-${this.platformId}`);
            await manageIssue(this.projectId, this.platformId,
                ["STEP_READY", "GRP_CAT", "GRP_MOE"],
                `<p class="fr-mb-1w">Génération de la FAST ${platformVersion}</p>
                              <p class="fr-m-0 fr-text--sm fr-"><i>"${event.message}"</i></p>`);

            // Send a notifications to project users
            const {subject, body} = await mailValidate(this.platformId, this.user, platformVersion, event.message, this.$router);
            await notifyProject(this.projectId, encodeURIComponent(subject), encodeURIComponent(body));


            this.$router.push({ name: "ProjectEdit", params: { project_id: this.projectId } });
        },
        async restoreEdb() {
            await this.$store.dispatch("platforms/restorePlatform", {
                projectId: this.projectId,
                platformId: this.platformId,
            });
            // Attendez la prochaine mise à jour du DOM pour valider
            this.$nextTick(async () => {
                await this.validateAllTabs();
            });
        },
        async validateTab(tabIndex) {
            const tabRef = await this.$refs[`tab-${tabIndex}`][0];
            const formKey = `form-${tabIndex}`;
            const validation = tabRef?.$refs?.hasOwnProperty(formKey) ? await tabRef.$refs[formKey].validate() : true;
            this.errors[tabIndex] = validation.errors;
        },
        async validateAllTabs() {
            this.$nextTick(async () => {
                await Promise.all(this.filteredTabs().map((_tab, index) => this.validateTab(index)));
            });
        },
        async onChangeTab(event, index) {
            // Si le formulaire est valide, changez d'onglet
            this.activeTab = index;
        },
        filteredTabs() {
            return this.tabs.filter((tab) => {
                return !tab.rights || tab.rights.some(r => this.userGroups.includes(r));
            });
        },
    },
    computed: {
        platforms() {
            return platforms;
        },
        ...mapGetters("authentication", ["userGroups", "user"]),
        ...mapGetters("platforms", ["isPlatformTouched", "getPlatform", "getAttachments", "getPlatformLabels"]),
        currentEdb: function() {
            return this.getPlatform(this.platformId);
        },
        attachments: function() {
            return this.getAttachments(this.platformId);
        },
    },
    mixins: [dateMixin],
};
</script>

<style scoped>
@import '@/assets/octave.css';
</style>