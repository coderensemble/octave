<template>
    <div class="fr-grid-row">
        <div class="fr-col-6 fr-" >
            <h2 class="fr-h2" >Configurations </h2>

        </div>
        <div class="fr-col-6">
            <ul class="fr-btns-group--right" style="display: flex;">
                <fr-button
                    v-if="!isReadOnly"
                    type="button"
                    label="Ajouter une Configuration"
                    iconName="add-line"
                    iconPosition="left"
                    @click="() => { createApplicationModal.show = true; }"
                    style="margin-right: 10px;"
                />
                <fr-button
                    v-if="!isReadOnly"
                    type="button"
                    label="Ajouter des fichiers"
                    iconName="file-add-line"
                    iconPosition="left"
                    @click="() => { uploadFileModal.show = true; }"
                />
            </ul>
        </div>

        <div class="fr-p-4v fr-col-12">

            <Form @input="validateForm" v-slot="{ errors }" :ref="`form-${tabIndex}`" @submit="onSubmit">
                <div class="fr-mb-4w" v-for="(value, key, index) in sortedData('application', 'modele')">
                    <div class="fr-h6" style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center;">
                            <i v-if="value.icone" :class="[ value?.icone,  'fr-mr-2w' ]"></i>
                            {{ value.nom }} - {{ value.label }}
                        </div>
                        <fr-button
                            type="button"
                            :label="allAccordionsState === 'open' ? 'Fermer les accordéons' : 'Ouvrir les accordéons'"
                            iconPosition="left"
                            size="sm"
                            :level="4"
                            @click="toggleAllAccordions"
                        />
                    </div>

                    <custom-accordion :label="`${applicationKey} - ${value.label}`"
                                      :iconName="value?.icone || ''"
                                      :state="Object.keys(errors).some(error => error.startsWith(applicationKey)) ? 'error': ''"
                                      caretPosition="before"
                                      :allAccordionsState="allAccordionsState"
                                      v-for="(application, applicationKey) in getData('application', 'modele', key)"
                                      :key="key"
                    >
                        <template v-slot:buttons>
                            <fr-button
                                v-if="!isReadOnly"
                                type="button"
                                size="sm"
                                level="tertiary-no-outline"
                                iconPosition=""
                                label="Supprimer"
                                @click.stop="openDeleteModal(applicationKey)"
                                iconName="delete-bin-line"
                                title="Supprimer"
                            />
                        </template>
                        <div class="block-element">
                            <div class="block-header fr-col-12">
                                <div class="fr-col-auto">
                                </div>
                                <div class="fr-col-auto fr-col--top">
                                </div>
                            </div>

                            <application-form
                                :catalogues="catalogues"
                                :edb="edb"
                                :application-key="applicationKey"
                                :application-data="application"
                                :isReadOnly=isReadOnly
                                @validateRow="validateRow"
                            />

                        </div>
                    </custom-accordion>
                </div>

            </Form>


        </div>
    </div>

    <CreateApplicationModal
        :catalogues="catalogues"
        :edb="edb"
        v-model="createApplicationModal.show"
        v-bind="createApplicationModal"
        @add-application="addApplication"
    />
    <!-- Le modal qui s'affiche lorsque l'utilisateur clique sur "Supprimer". -->
    <confirm-modal
        :modelValue="confirmModalKey !== false"
        @update:modelValue="confirmModalKey = $event"
        @confirm="deleteApplication(confirmModalKey)"
        :message="`Voulez-vous supprimer l'application ${confirmModalKey} ? `"
    />
    <upload-modal
        ref="applicationUploadModal"
        :modelValue="uploadFileModal.show"
        @update:modelValue="uploadFileModal.show = $event"
        :projectId="projectId"
        :platformId="platformId"
        :uploadDir="`edb/edb-${platformId}/upload`"
        :supported-ext="catalogues.upload"
    />
</template>

<script>
import { edb } from "@/pages/Platforms/data.js";
import ApplicationForm from "@/pages/Platforms/Forms/ApplicationForm.vue";
import CreateApplicationModal from "@/pages/Platforms/Modal/CreateApplicationModal.vue";
import CustomAccordion from "@/components/Octave/CustomAccordion.vue";
import { mapGetters, mapState } from "vuex";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import accordionsMixins from "@/pages/Platforms/mixins/accordionsMixins.js";
import { formatMixin } from "@/mixins/format.js";
import { Form } from "vee-validate";
import ConfirmModal from "@/components/Octave/ConfirmModal.vue";
import UploadModal from "@/pages/Platforms/Modal/UploadModal.vue";

export default {
    data() {
        return {
            confirmModalKey: false,
            createApplicationModal: {
                show: false,
            },
            uploadFileModal: {
                show: false,
            },
            error: false,
        };
    },
    components: { ConfirmModal, UploadModal, Form, CreateApplicationModal, CustomAccordion, ApplicationForm },
    props: ["platformId", "edb", "catalogues", "isReadOnly", "tabIndex", "errors", "projectId"],
    mixins: [platformMixins, formatMixin, accordionsMixins],
    computed: {

        ...mapGetters("authentication", ["userGroups"]),
    },
    methods: {
        addApplication(application, key) {
            if (!this.edb.application) {
                this.edb.application = edb.application;
            }
            this.edb.application[key] = application;
            this.createApplicationModal.show = false;
        },
        openDeleteModal(serverKey) {
            this.confirmModalKey = serverKey;
        },
        closeDeleteModal() {
            this.confirmModalKey = false;
        },
        deleteApplication(key) {
            delete this.edb.application[key];
            this.closeDeleteModal();
        },
        validateRow() {
            this.$nextTick(() => {
                this.validateForm();
            });
        },

    },
};
</script>
<style scoped>
@import '@/assets/octave.css';
</style>