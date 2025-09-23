<template>
    <Field :name="name" :rules="computedRules" v-slot="{field, errors}">
        <div
            :class="['fr-input-group', { 'fr-select-group--error': errors.length > 0 }, {'fr-select-group--disabled': isReadOnly}]">
            <label :class="`fr-label fr-text--${size} fr-m-0`" :for="name">
                {{ label }}
                <span v-if="isRequired"> *</span>

                <span v-if="selectedOption(field.value)?.description" class="fr-hint-text">{{ selectedOption(field.value).description }}</span>
                <span v-else-if="description" class="fr-hint-text">{{ description }}</span>
            </label>
            <div class="fr-input-wrap">
                <select :class="`fr-select fr-text--${size} fr-m-0`" v-bind="{...$attrs, ...field}"
                        :id="`select-${uid}`" :name="name" v-model="field.value" :disabled="isReadOnly">
                    <option value="" v-if="unSelectable"></option>
                    <option v-if="typeof options[0] === 'string'"
                            v-for="(option,index) in options"
                            :key="index"
                            :value="index">
                        {{ option }}
                    </option>
                    <option v-else
                            v-for="option in options"
                            :key="option.value"
                            :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
            <p v-if="errors.length > 0" class="fr-error-text">{{ errors[0] }}</p>
        </div>
    </Field>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { defineRule, Field } from "vee-validate";
import "@/services/validationRules.js";

export default defineComponent({
    name: "CustomSelect",
    components: { Field },
    methods: {
        handleErrors(errors) {
            this.$emit("update-errors", { fieldName: this.name, errors: errors });
        },
        selectedOption(value) {
            if (Array.isArray(this.options)) {
                return this.options.find(option => option.value == value);
            }
            return null;  // ou bien une valeur par défaut
        },
    },
    data() {
        return {
            uid: Math.random().toString(36).substr(2, 16),
        };
    },
    computed: {
        computedRules() {
            let rules = this.rules;
            if (this.isRequired) {
                rules = { ...rules, required: true };
            }
            return rules;
        },

    },
    props: {
        description: {
            type: String,
        },
        name: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            default: "sm",
        },
        label: {
            type: String,
            required: false,
        },
        isReadOnly: {
            type: Boolean,
            default: false,
        },
        isRequired: {
            type: Boolean,
            default: false,
        },
        unSelectable: {
            type: Boolean,
            default: false,
        },
        unSelectText: String,
        rules: {
            type: Object,
            required: false,
        },
        options: {
            type: [Array, Object],
            required: true,
            default: function () {
                return [];  // Valeur par défaut pour les options.
            }
        },
    },
});
</script>