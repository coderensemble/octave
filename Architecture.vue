<template>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div class="fr-col-12">
            <div class='fr-input-group'>
                <h4>Modèle d'architecture applicative SI1</h4>
                <div class="fr-grid-row fr-grid-row--gutters">
                    <div class="fr-col-8">
                        <custom-radio
                            columns=2
                            label="Quel est le modèle d’architecture applicative?"
                            :options="getArchitectures()"
                            v-model="edb.plateforme.architecture"
                        />
                    </div>
                    <div class="fr-col-4">
                        <fr-image v-if="edb.plateforme.architecture"
                                  :src="getArchitectureImage(catalogues, edb.plateforme.architecture)"
                                  fit="contain"
                                  class="sticky-img"
                        />
                    </div>
                </div>
                <h4> Zone d'Implantation</h4>
                <custom-radio
                    is-inline
                    v-model="edb.plateforme.zone"
                    label="Qui seront les utilisateurs?"
                    :options="getZones(edb.plateforme.architecture)"
                />
            </div>
        </div>
    </div>
</template>
<style scoped>
.sticky-img {
    position: sticky;
    top: 0;
}
</style>
<script>
import CustomRadio from "@/components/Octave/CustomRadio.vue";
import { getArchitectureImage } from "@/services/octave.js";

export default {

    props: ["platforms", "edb", "project", "catalogues", "stepIndex"],
    components: { CustomRadio },
    data() {
        return {};
    },
    watch: {
        "edb.plateforme.architecture": function(newVal) {
            this.edb.plateforme.zone = this.getZones(newVal)[0].value;
        },
    },
    methods: {
        getArchitectures() {
            const plateforme = this.catalogues?.plateforme;
            return plateforme
                ? Object.keys(plateforme).map(key => ({
                    label: plateforme[key].description,
                    description: plateforme[key].info,
                    value: key,
                }))
                : [];
        },
        getZones(architecture) {
            const plateforme = this.catalogues?.plateforme;
            if (plateforme && plateforme[architecture]) {
                return plateforme[architecture].zone.map(item => ({
                    label: item,
                    value: item,
                }));
            } else {
                return [];
            }
        },
        getArchitectureImage
    },


    created() {
        if (!this.edb.plateforme.architecture) {
            this.edb.plateforme.architecture = this.getArchitectures()[0].value;
        }
        if (!this.edb.plateforme.zone) {
            this.edb.plateforme.zone = this.getZones(this.edb.plateforme.architecture)[0].value;
        }
    },
};
</script>