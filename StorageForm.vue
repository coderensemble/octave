<template>
    <div class="fr-col-12">

        <custom-input :name="`edb.stockage[${storageKey}].description`"
                      :isReadOnly="isReadOnly"
                      label="Description"
                      v-model="storageData.description"

        />
    </div>
    <div class="fr-col-4">
        <custom-input :name="`edb.stockage[${storageKey}].taille.production`"
                      v-model="storageData.taille.production"
                      label="Taille Production"
                      type="number"
                      :min="0"
                      :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-4">
        <custom-input :name="`edb.stockage[${storageKey}].taille.iia`"
                      label="Taille IIA"
                      :isReadOnly="!edb.plateforme.iia"
                      v-model="storageData.taille.iia"
                      :min="0"
                      type="number"
        />
    </div>
    <div class="fr-col-4">
        <custom-input
            :name="`edb.stockage[${storageKey}].taille.intex`"
            label="Taille Intex"
            :isReadOnly="!edb.plateforme.intex"
            :min="0"
            v-model="storageData.taille.intex"
            type="number"
        />
    </div>
    <div class="fr-col-12 fr-h6 fr-mb-0 fr-pb-0">Serveurs</div>

    <div class="fr-col-12 fr-py-0">
        <custom-checkbox
            v-model="storageData.serveurs"
            columns=6
            mode="array"
            :options="getServers(storageData)"
            size="sm"
            class="fr-mb-0"
            :isInline="true"
            :isReadOnly="isReadOnly"
        />
    </div>
</template>
<script>


import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";
import "@/pages/Platforms/mixins/platformMixins.js"
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
export default {
    data() {
        return {};
    },
    methods:{

    },
    mixins: [platformMixins],
    props: {
        storageData: { type: Object, required: true },
        storageKey: { type: [String, Number], required: true },
        edb: { type: Object, required: true },
        catalogues: { type: Object, required: true },
        isReadOnly: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        CustomCheckbox,
        CustomInput,
    },
}
</script>