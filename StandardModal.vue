<template>
    <fr-modal v-model="currentState.show" title="Choisir un standard">
        <fr-select v-model="currentState.version"
                   class="fr-mb-3w"
                   :options="(standards).map(std => ({label: std.name.split('-')[1], value: std.name.split('-')[1]}))"
                   placeholder="Choisissez un standard"
        />
        <div>
            <p class="fr-mb-1w fr-mr-1w" style="display: flex; justify-content: space-between;">
                <div style="display: flex;">
                    <span class="fr-text--bold">Date :&nbsp;</span><span>{{ formatDate(date_created) }}</span>
                </div>
                <div style="display: flex;">
                    <span class="fr-text--bold">Auteur :&nbsp;</span><span>{{ author }}</span>
                </div>
            </p>
            <p class="fr-m-0">
                <span class="fr-text--bold">Description :</span>
            </p>
            <p class="fr-mb-1w">
                <span v-if="description">{{ description }}</span>
                <span v-else>NA</span>
            </p>
        </div>
        <a v-if="documentation" class="fr-text--sm" :href="documentation" target="_blank">Documentation</a>
        <div class="fr-mt-3w">
            <fr-button label="Confirmer" @click="confirm" />
        </div>
    </fr-modal>
</template>
<script>
import { getDocumentationStd, getStandardTags } from "@/services/octave.js";
import { dateMixin } from "@/mixins/date.js";

export default {
    name: "StandardModal",
    data() {
        return {
            documentation: "",
            version: "",
            standards: [],
        };
    },
    async created() {
        let standards = await getStandardTags();
        this.standards = standards ? standards : [];
        this.version = this.currentState.version;
    },
    props: ["modelValue"],
    emits: ["update:modelValue"],
    watch: {
        "currentState.version": {
            handler: async function(newValue) {
                this.documentation = await getDocumentationStd(newValue);
            },
            immediate: true,
        },
    },
    computed: {
        currentState: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
        description() {
            const standard = this.standards.find(standard => standard.name === `STD-${this.currentState.version}`);
            return standard ? standard.message : null;
        },
        date_created() {
            const standard = this.standards.find(standard => standard.name === `STD-${this.currentState.version}`);
            return standard ? standard.commit.committed_date : null;
        },
        author() {
            const standard = this.standards.find(standard => standard.name === `STD-${this.currentState.version}`);
            return standard ? standard.commit.author_name : null;
        },
    },
    methods: {
        confirm() {
            this.currentState.show = false; // close modal after confirm
            this.$emit("confirm", this.currentState);
        },
    },
    mixins: [dateMixin],
};
</script>