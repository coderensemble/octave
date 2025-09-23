<template>
    <Field :name="name" :rules="computedRules" :modelValue="inputValue" v-slot="{field, errors}">
        <div :class="['fr-input-group', { 'fr-input-group--error': errors.length > 0 }]">
            <div class="selector fr-mb-2w">
                <label :class="`fr-label fr-text--sm fr-m-0`" :for="`${name}-${uid}`">
                    {{ label }}<span v-if="isRequired"> *</span>
                    <span v-if="description" class="fr-hint-text">{{ description }}</span>
                </label>
                <input type="text" class="fr-input fr-text--m" v-bind="field" @input="update($event)" @blur="hide"
                       @focus="unhide" :id="`${name}-${uid}`">
                <div v-if="open" class="selector-dropdown">
                    <div class="selector-option"
                         v-for="(option, index) in filteredOptions"
                         :key="index"
                         @mousedown.prevent="select(option)">
                        {{ option }}

                    </div>
                </div>
                <p v-if="errors.length > 0" class="fr-error-text" style="overflow: auto;white-space: normal;">
                    {{ errors[0] }}
                </p>
            </div>
        </div>
    </Field>
</template>

<script>

import { Field } from "vee-validate";


export default {
    name: "SearchBar",
    components: { Field },
    data() {
        return {
            inputValue: "",
            open: false,
            options: [],
            uid: Math.random().toString(36).substr(2, 16),

        };
    },
    props: {
        getOptions: {
            type: Function,
            required: true,
        },
        rules: {
            type: [Object, Function],
            required: false,
        },
        label: String,
        isRequired: {
            type: Boolean,
            default: false,
        },
        description: String,
        isReadOnly: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        filteredOptions() {
            return this.options;
        },
        computedRules() {
            let rules = {};
            if (!this.isReadOnly) { // n'ajoute des règles que si le champ n'est pas en lecture seule
                rules = this.rules;
                if (this.isRequired) {
                    rules = { ...rules, required: true };
                }
            }
            return rules;
        },
    },
    watch: {},
    methods: {
        async fetchOptions(query) {
            if (query === "") {
                this.options = [];
            } else {
                try {
                    this.options = await this.getOptions(query);
                } catch (err) {
                    console.log(err);
                }
            }
        },
        update(event) {
            this.fetchOptions(event.target.value);
            this.open = true;
        },
        hide() {
            this.open = false;
        },
        unhide() {
            this.open = true;
        },
        select(option) {
            this.inputValue = option;
            this.open = false;
            this.$emit("update:modelValue", option);
        },
    },
};
</script>

<style scoped>
.selector {
    position: relative;
    width: 100%;
}

.selector input {
    width: 100%;
}

.selector-dropdown {
    background-color: #ffffff;
    position: absolute;
    width: 100%;
    border: 1px solid #dfdfdf;
    border-radius: 3px;
    max-height: 200px; /* À modifier selon vos exigences */
    overflow-y: auto; /* Affiche la barre de défilement uniquement si besoin */
    z-index: 99999;
}

.selector-option {
    padding: 10px;
}

.selector-option:hover {
    background-color: #f2f2f2;
}
</style>