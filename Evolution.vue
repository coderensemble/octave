<template>
        <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
            <div class="fr-col-12">
                <div class='fr-input-group'>
                    <fr-radio
                        v-for="(value, key) in catalogues.EVOLUTION"
                        :key="key"
                        isInline
                        v-model="edb.plateforme.evolution[key]"
                        :label="upperCaseFirstLetter(key)"
                        :options="mapToOptionFormat(value)"
                    />
                </div>
            </div>
        </div>
</template>

<script>
import CustomRadio from "../../../components/Octave/CustomRadio.vue";
import { formatMixin } from "@/mixins/format.js";

export default {
    components: { CustomRadio },
    props: ['platform', 'edb', 'catalogues'],
    mixins: [ formatMixin ],

    methods: {
        mapToOptionFormat(value) {
            return Object.entries(value).map(([key, value]) => ({label: value, value: parseInt(key)}));
        },
    },

    mounted() {

    }

};
</script>