<template>
    <fr-modal
        v-bind="$attrs"
        v-model="modal.show"
        :size="modal.size"
        :title="modal.title"
        :iconName="modal.iconName"
    >
        <Form v-slot="{ errors, submitForm }" ref="createStorageForm" @submit="handleSubmit">
            <div class="fr-grid-row fr-grid-row--gutters">
                <div class="fr-col-12 fr-col-md-10">
                    <CustomSelect
                        name="storageName"
                        :options="storageNames"
                        :unSelectable="true"
                        unSelectText="Sélectionner un type de Stockage"
                        :rules="{required: true}"
                        v-model="storage.nature"
                    />
                </div>
                <div class="fr-col-12 fr-col-md-2 fr-mt-1w">
                    <fr-button
                        label="Ajouter"
                        @click="handleSubmit"
                    />
                </div>
            </div>
            <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                <div class="fr-col-12">
                    <div class="fr-card" v-if="storage.nature">
                        <div class="fr-card__body">
                            <div class="fr-card__content fr-p-3w">
                                <h3 class="fr-card__title"><i
                                    :class="[ catalogues.stockage?.[storage.modele]?.icone || '',  'fr-mr-2w' ]"></i>
                                    {{ key }} -
                                    {{ storage.titre }}
                                </h3>

                                <p class="fr-card__desc">
                                    <div v-html="storage.aide ? storage.aide : ''" class="fr-pb-2w" />
                                    <div class="fr-grid-row fr-grid-row--gutters">
                                        <storage-form
                                            :key="key"
                                            :catalogues="catalogues"
                                            :edb="edb"
                                            :storage-key="key"
                                            :storage-data="storage" />
                                    </div>
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
import StorageForm from "@/pages/Platforms/Forms/StorageForm.vue";
import { storage } from "@/pages/Platforms/data.js";
import { Form } from "vee-validate";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import { mergeMatchingObject } from "@/services/octave.js";

export default {
    name: "CreateStorageModal",
    components: { CustomSelect, storage, Form, StorageForm },
    mixins: [platformMixins],
    props: ["catalogues", "edb"],
    watch: {
        "storage.nature": function(newVal, oldVal) {
            if (this.storage.nature !== "0" && this.storage.nature !== "") {
                const foundStorage = Object.values(this.catalogues.stockage).find(storage => storage.nature === this.storage.nature);

                if (foundStorage) {
                    mergeMatchingObject(foundStorage, this.storage);
                    this.storage.description = foundStorage.titre;
                    this.storage.modele = Object.keys(this.catalogues.stockage).find(key => this.catalogues.stockage[key] === foundStorage);
                    this.key = foundStorage.nom + (this.newElementId(this.edb.stockage, this.storage.modele));
                }
            }
        },
    },
    data() {
        return {
            modal: {
                title: "Ajouter un stockage",
                iconName: "add-line",
                size: "lg",
            },
            storage: { ...storage },
            key: "",
        };
    },
    computed: {
        storageNames() {
            if (this.catalogues && this.catalogues.stockage) {
                const mapStorageNames = Object.values(this.catalogues.stockage).map(storage => ({
                    label: `${storage.nom} - ${storage.nature}`,
                    value: storage.nature,
                }));
                return [...new Set(mapStorageNames)].sort((a, b) => a.label.localeCompare(b.label));
            } else {
                return [];  // or whatever default value you want
            }
        },
    },

    methods: {
        handleSubmit() {
            this.$refs.createStorageForm.validate();
            this.$emit("add-storage", this.storage, this.key);
            this.$refs.createStorageForm.resetForm();
            this.storage = { ...storage };
        },
    },
};
</script>