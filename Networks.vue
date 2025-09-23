<template>
    <Form validateOnInput @input="validateForm" v-slot="{ errors }" :ref="`form-${tabIndex}`">
        <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-col-8">
                <h2 class="fr-h2">{{ label }} <p class="fr-badge fr-badge--sm fr-badge--orange-terre-battue fr-badge--icon-left fr-icon-group-fill">CAT</p></h2>
            </div>
            <div class="fr-p-4v fr-col-12">
                <div class="fr-h6">
                    <div style="display: flex; justify-content: flex-end;">
                        <fr-button
                            type="button"
                            :label="allAccordionsState === 'open' ? 'Fermer les accordéons' : 'Ouvrir les accordéons'"
                            iconPosition="left"
                            size="sm"
                            :level="4"
                            @click="toggleAllAccordions"
                        />
                    </div>
                </div>
                <custom-accordion
                    v-for="(networkValue, networkKey) in edb.reseau || {}"
                    :key="networkKey"
                    :allAccordionsState="allAccordionsState"

                    :label="`${networkKey} - ${networkValue.description}`"
                    :state="Object.keys(errors).some(error => error.includes(networkKey)) ? 'error': ''"
                    caret-position="before">
                    <template v-slot:buttons>

                    </template>
                    <div class="block-element">
                        <div class="block-header fr-col-12">
                            <div class="fr-col-auto">

                            </div>
                            <div class="fr-col-auto fr-col--top">
                            </div>
                        </div>
                        <div class="block-body fr-grid-row--gutters fr-grid-row">
                            <network-form :catalogues="catalogues"
                                          :edb="edb"
                                          :network-key="networkKey"
                                          :network-data="networkValue"
                                          :isReadOnly="isReadOnly"
                            />
                        </div>

                    </div>
                </custom-accordion>
            </div>
        </div>
    </Form>
</template>

<script>
import { Form } from "vee-validate";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import { mapGetters } from "vuex";
import { getFileFromRepository } from "@/services/gitlab.js";
import yaml from "js-yaml";
import CustomAccordion from "@/components/Octave/CustomAccordion.vue";
import networkForm from "@/pages/Platforms/Forms/NetworkForm.vue";
import accordionsMixins from "@/pages/Platforms/mixins/accordionsMixins.js";


export default {
    props: ["label", "edb", "catalogues", "isReadOnly", "tabIndex"],
    mixins: [platformMixins, accordionsMixins],
    data() {
        return {
            networks: {},
        };
    },
    components: {
        networkForm,
        CustomAccordion,
        Form,
    },
    methods: {},
    computed: {
        ...mapGetters("authentication", ["userGroups"]),

    },
    // mounted() {
    //     this.updateNetworks();
    // },
};
</script>
<style scoped>
@import '@/assets/octave.css';
</style>