<template>

    <div class="fr-grid-row code-row"
         v-for="(line, lineIndex) in applicationData.code"
         :key="lineIndex">

        <div
            :class="['fr-col-auto', { [`fr-col-${props.size}`]: props.size}, 'fr-pr-2w']"
            v-for="(props, propKey, propIndex) in catalogues?.application?.[applicationData.modele.toUpperCase()].params"
            :key="propIndex">
            <CustomField
                v-if="props.mandatory !== false || showOptional"
                :name="`${applicationKey}[${lineIndex}].${propKey}`"
                :type="props.type"
                :size="xs"
                :label="upperCaseFirstLetter(propKey)"
                :rules="[props.rule, props.error]"
                :mandatory="props.mandatory != '' ? !props.mandatory : false"
                :options="props.options"
                :tooltip="props.description"
                :modelValue="line[propKey]"
                :isReadOnly=isReadOnly
                validateOnInput
                @update:modelValue="line[propKey]=$event"
            />
        </div>
        <div class="fr-col-12">
            <fr-button
                v-if="hasOptionalParams && !isReadOnly"
                type="button" size="sm" level="tertiary-no-outline"
                @click="showOptional = !showOptional">
                <span v-if="showOptional">Masquer les paramètres optionnels</span>
                <span v-else>Afficher les paramètres optionnels</span>
            </fr-button>
            <fr-button
                v-if="lineIndex === applicationData.code.length -1 && !isReadOnly"
                type="button"
                iconName="add-line"
                level="tertiary-no-outline"
                size="sm" @click="addRow(applicationData, applicationKey) " />
            <fr-button v-if="applicationData.code.length > 1 && !isReadOnly"
                       iconName="delete-line" size="sm"
                       type="button"
                       level="tertiary-no-outline"
                       @click="deleteRow(applicationData, applicationKey, lineIndex)"

            />

        </div>
    </div>
    <div class="fr-col-12 fr-h6 fr-mb-0 fr-pb-0">Serveurs</div>

    <div class="fr-grid-row">
        <div class="fr-col-12">
            <custom-checkbox
                v-model="applicationData.serveurs"
                columns=6
                mode="array"
                :options="getServers(applicationData)"
                size="sm"
                class="fr-mb-0"
                :isInline="true"
                :isReadOnly=isReadOnly
            />
        </div>
    </div>


</template>
<style>
.code-row {
    background-color: var(--background-alt-grey);
    border-radius: 10px;
    position: relative;
    padding: 20px;
    margin: 10px 0; /* Increase top and bottom margin to accommodate the header */
}
</style>
<script>

import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import CustomField from "@/components/Octave/CustomField.vue";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import { formatMixin } from "@/mixins/format.js";
import applicationMixins from "@/pages/Platforms/mixins/applicationMixins.js";

export default {
    data() {
        return {
            showOptional: false,

        };
    },
    props: {
        applicationData: { type: Object, required: true },
        applicationKey: { type: [String, Number], required: true },
        edb: { type: Object, required: true },
        catalogues: { type: Object, required: true },
        isReadOnly: {
            type: Boolean,
            default: false,
        },
        tabIndex: String,
    },
    methods: {},

    computed: {
        hasOptionalParams() {
            return this.applicationData.modele &&
                Object.values(this.catalogues?.application?.[this.applicationData.modele.toUpperCase()].params || {})
                    .some(param => param.mandatory === false);
        },
    },
    mixins: [platformMixins, formatMixin, applicationMixins],
    components: {
        CustomField,
        CustomCheckbox,
    },
};
</script>