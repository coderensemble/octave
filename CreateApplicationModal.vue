<template>
    <fr-modal
        v-bind="$attrs"
        v-model="modal.show"
        :size="modal.size"
        :title="modal.title"
        :iconName="modal.iconName"
    >
        <Form v-slot="{ errors, submitForm }" ref="createApplicationForm" @submit="handleSubmit">
            <div class="fr-grid-row fr-grid-row--gutters">
                <div class="fr-col-12 fr-col-md-10">
                    <CustomSelect
                        name="storageName"
                        :options="applicationNames"
                        :unSelectable="true"
                        unSelectText="Sélectionner un type de Stockage"
                        :rules="{required: true}"
                        v-model="application.modele"
                    />
                </div>
                <div class="fr-col-12 fr-col-md-2 fr-mt-1w">
                    <fr-button
                        label="Ajouter"
                        type="button"
                        @click="handleSubmit"
                    />
                </div>
            </div>
            <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                <div class="fr-col-12">
                    <div class="fr-card" v-if="application.modele">
                        <div class="fr-card__body">
                            <div class="fr-card__content fr-p-3w">
                                <h3 class="fr-card__title fr-pb-3w"><i
                                    :class="[ application.icone || '',  'fr-mr-2w' ]"></i>
                                    {{ key }} -
                                    {{ application.label }}
                                </h3>
                                <p class="fr-card__desc">
                                    <div v-html="catalogues.application?.[application.modele]?.aide" class="fr-pb-2w" />
                                    <application-form
                                        :key="key"
                                        v-if="application.modele"
                                        :catalogues="catalogues"
                                        :edb="edb"
                                        :application-key="key"
                                        :application-data="application"
                                    />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    </fr-modal>
</template>

<script>
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import { application } from "@/pages/Platforms/data.js";
import ApplicationForm from "@/pages/Platforms/Forms/ApplicationForm.vue";
import { Form } from "vee-validate";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import { formatMixin } from "@/mixins/format.js";
import applicationMixins from "@/pages/Platforms/mixins/applicationMixins.js";
import { cloneDeep } from "lodash";
import { mergeMatchingObject } from "@/services/octave.js";
import { mapGetters } from "vuex";

export default {
    name: "CreateApplicationModal",
    data() {
        return {
            showOptional: false,
            modal: {
                title: "Ajouter une Configuration",
                iconName: "add-line",
                size: "xl",
            },
            application: cloneDeep(application),
            selectedApplication: "",
            key: "",
        };
    },
    components: { CustomSelect, application, Form, ApplicationForm },
    mixins: [platformMixins, formatMixin, applicationMixins],
    props: ["catalogues", "edb"],
    computed: {
        ...mapGetters("authentication", ["userGroups"]),
        applicationNames() {
            if (this.catalogues && this.catalogues.application) {
                // check if userGroups contains 'CAT'
                const containsCAT = this.userGroups ? this.userGroups.includes("CAT") : false;

                const mapApplicationNames = Object.values(this.catalogues.application)
                    .filter(application => containsCAT || application.visible)
                    .map(application => ({
                        label: `${application.nom} - ${application.label}`,
                        value: application.nom,
                    }));

                return [...new Set(mapApplicationNames)].sort((a, b) => a.label.localeCompare(b.label));
            } else {
                return [];  // or whatever default value you want
            }
        },
    },
    watch: {
        "application.modele": function(newVal, oldVal) {
            this.resetApplication();
            if (this.catalogues) {
                const foundApplication = Object.values(this.catalogues.application).find(app => app.nom === newVal);
                if (foundApplication) {
                    const code = this.getDefaultCode(foundApplication.params, { "class": newVal.toLowerCase() });
                    mergeMatchingObject(foundApplication, this.application);
                    this.application.modele = newVal;
                    this.application.code = [code];
                    this.key = foundApplication.nom + (this.newElementId(this.edb.application, newVal));

                }
            }
        },
    },
    methods: {
        resetApplication() {
            this.application = cloneDeep(application);
        },
        async handleSubmit() {
            const validation = await this.$refs.createApplicationForm.validate();
            if (validation.valid) {
                this.$emit("add-application", this.application, this.key);
                this.$refs.createApplicationForm.resetForm();
                this.resetApplication();
            }
        },

    },
};
</script>