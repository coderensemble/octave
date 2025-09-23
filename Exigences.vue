<template>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div class="fr-col-12 fr-col-md-6">
            <div class="fr-grid-row">
                <div class="fr-col-12 fr-mb-2w" v-for="(value, key) in catalogues.DICP">
                    <fr-range
                        :key="key"
                        :label="upperCaseFirstLetter(key)"
                        :description="getHintText(key)"
                        :min-value="1"
                        :max-value="4"
                        :data-prefix="upperCaseFirstLetter(key[0])"
                        :step="1"
                        :isVisibleMaxMinIndicator="false"
                        :hasSteps="true"
                        v-model:lowValue="edb.plateforme.dicp[key]"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Cursor from "@/components/Octave/Curseur.vue";
import { formatMixin } from "@/mixins/format.js";

export default {
    components: { Cursor },
    mixins: [formatMixin],
    props: ["platform", "edb", "catalogues"],

    data() {
        return {

        };
    },

    methods: {
        getHintText(key) {
            const referenceValue = this.edb.plateforme.dicp[key] || 1; // If value is blank, use 1
            return this.catalogues.DICP[key][referenceValue] || "";
        },

    },

};
</script>