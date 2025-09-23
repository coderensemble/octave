<template>
    <Form @input="validateForm" v-slot="{ errors }" :ref="`form-${tabIndex}`">
        <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-col-8">
                <h2 class="fr-h2">Stockages</h2>
            </div>
            <div class="fr-col-4">
                <ul class="fr-btns-group--right">
                    <fr-button
                        v-if="!isReadOnly"
                        type="button"
                        label="Ajouter un Volume"
                        iconName="add-line"
                        iconPosition="left"
                        @click="() => { modal.show = true; }"
                    />
                </ul>
            </div>
            <div class="fr-p-4v fr-col-12">
                <div class="fr-mb-4w" v-for="(value, key, index) in sortedData('stockage', 'modele')">
                    <div class="fr-h6" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <i v-if="value.icone" :class="[ value?.icone,  'fr-mr-2w' ]"></i>
                            {{ key }} - {{ value.titre }}
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
                    <custom-accordion :label="`${storageKey} - ${storage.description}`"
                                      :iconName="value?.icone || ''"
                                      caret-position="before"
                                      :key="storageKey"
                                      :allAccordionsState="allAccordionsState"
                                      :state="Object.keys(errors).some(error => error.includes(storageKey)) ? 'error': ''"
                                      v-for="(storage, storageKey) in getData('stockage', 'modele', key)">
                        <template v-slot:buttons>
                            <fr-button
                                v-if="!isReadOnly"
                                type="button"
                                size="sm"
                                level="tertiary-no-outline"
                                iconPosition=""
                                label="Supprimer"
                                @click.stop="openDeleteModal(storageKey)"
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
                            <div class="block-body fr-grid-row--gutters fr-grid-row">
                                <storage-form :catalogues="catalogues"
                                              :edb="edb"
                                              :storage-key="storageKey"
                                              :storage-data="storage"
                                              :isReadOnly="isReadOnly"
                                />
                            </div>
                        </div>
                    </custom-accordion>
                </div>
            </div>

        </div>
    </Form>
    <CreateStorageModal
        :catalogues="catalogues"
        :edb="edb"
        v-model="modal.show"
        v-bind="modal"
        @add-storage="addStorage"
    />
    <confirm-modal
        :modelValue="confirmModalKey !== false"
        @update:modelValue="confirmModalKey = $event"
        @confirm="deleteStorage(confirmModalKey)"
        :message="`Voulez-vous supprimer le stockage ${confirmModalKey} ? `"
    />
</template>

<script>
import { edb } from "@/pages/Platforms/data.js";
import CustomInput from "@/components/Octave/CustomInput.vue";
import CreateStorageModal from "@/pages/Platforms/Modal/CreateStorageModal.vue";
import CustomAccordion from "@/components/Octave/CustomAccordion.vue";
import storageForm from "@/pages/Platforms/Forms/StorageForm.vue";
import { mapGetters, mapState } from "vuex";
import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import { Form } from "vee-validate";
import serverForm from "@/pages/Platforms/Forms/ServerForm.vue";
import ConfirmModal from "@/components/Octave/ConfirmModal.vue";
import accordionsMixins from "@/pages/Platforms/mixins/accordionsMixins.js";

export default {
    data() {
        return {
            confirmModalKey: false,
            modal: {
                show: false,
            },
        };
    },
    components: {
        ConfirmModal,
        serverForm,
        Form,
        CustomCheckbox,
        CreateStorageModal,
        CustomInput,
        CustomAccordion,
        storageForm,
    },
    props: ["edb", "catalogues", "isReadOnly", "tabIndex", "errors"],
    mixins: [platformMixins, accordionsMixins],
    computed: {
        ...mapGetters("authentication", ["userGroups"]),
    },
    methods: {
        deleteStorage(key) {
            delete this.edb.stockage[key];
            this.updateNetworks();
            this.closeDeleteModal();
        },
        openDeleteModal(serverKey) {
            this.confirmModalKey = serverKey;
        },
        closeDeleteModal() {
            this.confirmModalKey = false;
        },
        addStorage(storage, key) {
            if (!this.edb.stockage) {
                this.edb.stockage = edb.stockage;
            }
            this.edb.stockage[key] = storage;
            this.updateNetworks();
            this.modal.show = false;
        },
    },
};
</script>
<style scoped>
@import '@/assets/octave.css';
</style>