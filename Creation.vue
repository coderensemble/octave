<template>
    <div>
        <h4 class="fr-mb-4w">Création</h4>
        <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
            <div class="fr-col-12">

                <custom-accordion label="Identification">
                    <div class="fr-grid-row fr-p-2w">
                        <div class="fr-col-3 fr-text--bold">Code de la plateforme:</div>
                        <div class="fr-col-9">{{ edb.plateforme.code }}</div>
                        <div class="fr-col-3 fr-text--bold">Description:</div>
                        <div class="fr-col-9">{{ edb.plateforme.description }}</div>
                    </div>
                </custom-accordion>
                <custom-accordion label="Architecture">
                    <div class="fr-grid-row fr-p-2w">
                        <div class="fr-col-9">
                            <div class="fr-grid-row">

                                <div class="fr-col-3 fr-text--bold">Architecture:</div>
                                <div class="fr-col-9">{{ edb.plateforme.architecture }}</div>

                                <div class="fr-col-3 fr-text--bold">Informations:</div>
                                <div class="fr-col-9"
                                     v-html="catalogues.plateforme[edb.plateforme.architecture].info"></div>

                                <div class="fr-col-3 fr-text--bold">Zone:</div>
                                <div class="fr-col-auto">{{ edb.plateforme.zone }}</div>
                            </div>
                        </div>
                        <div class="fr-col-3">
                            <img height="400" :src="getArchitectureImage(catalogues, edb.plateforme.architecture)"
                                 alt="" />

                        </div>
                    </div>
                </custom-accordion>
                <custom-accordion label="Exigences">
                    <div class="fr-grid-row fr-p-2w">
                        <div class="fr-col-12">
                            <div class="fr-grid-row" v-for="(key, value) in edb.plateforme.dicp">
                                <div class="fr-col-3 fr-text--bold">{{ upperCaseFirstLetter(value) }}:</div>
                                <div class="fr-col-9">{{upperCaseFirstLetter(value[0])}}{{key}} - {{ catalogues.DICP[value][key] }}</div>
                            </div>
                        </div>
                    </div>
                </custom-accordion>
                <custom-accordion label="Evolutivité">
                    <div class="fr-grid-row fr-p-2w">
                        <div class="fr-col-12">
                            <div class="fr-grid-row" v-for="(key, value) in edb.plateforme.evolution">

                                <div class="fr-col-3 fr-text--bold">{{ upperCaseFirstLetter(value) }}:</div>
                                <div class="fr-col-9">{{ catalogues.EVOLUTION[value][key] }}</div>

                            </div>
                        </div>
                    </div>
                </custom-accordion>

            </div>
            <div class="fr-col-12 fr-col-md-3">

            </div>
        </div>
    </div>
</template>

<script>
import CustomAccordion from "@/components/Octave/CustomAccordion.vue";
import { formatMixin } from "@/mixins/format.js";
import { getArchitectureImage } from "@/services/octave.js";

export default {
    props: ["edb", "catalogues", "project", "platforms", "steps"],

    mixins: [formatMixin],

    data() {
        return {};
    },

    methods: {
        getArchitectureImage,
    },

    components: {
        CustomAccordion,
    },
};
</script>