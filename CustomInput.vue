<template>
    <Field :name="name" :rules="computedRules" :modelValue="modelValue" v-slot="{field, errors}">

        <div v-if="type === 'textarea'"
             :class="[
                 'fr-input-group', {
                 'fr-input-group--error': errors.length > 0
                 }, {
                 'fr-input-group--disabled': isReadOnly
             }
             ]">

            <label :class="`fr-label fr-text--${size} fr-m-0`" :for="name">{{ label }}
                <span v-if="isRequired"> *</span>
                <fr-tooltip
                    v-if="tooltip"
                    :content="tooltip"
                />
                <span v-if="description" class="fr-hint-text">{{ description }}</span>
            </label>
            <div :class="['fr-input-wrap', iconName ? `fr-icon-${iconName}` : '']">
            <textarea
                :id="name"
                class="fr-input fr-m-0"
                v-bind="field"
                style="max-width: 100%;"
                :required="isRequired"
                @input="updateValue($event.target.value)"
                :disabled="isReadOnly"
            />
            </div>
            <p v-if="errors.length > 0" class="fr-error-text" style="overflow: auto;white-space: normal;">
                {{ errors[0] }}
            </p>
        </div>
        <div v-else
             :class="['fr-input-group', {'fr-input-group--valid': errors.length === 0 && showValid && modelValue}, { 'fr-input-group--error': errors.length > 0 }, {'fr-input-group--disabled': isReadOnly}]">
            <label :class="`fr-label fr-text--${size} fr-m-0`" :for="name">{{ label }}
                <span v-if="isRequired"> *</span><custom-tooltip
                    v-if="tooltip"
                    :tooltip-text="tooltip"
                />
                <span v-if="description" class="fr-hint-text" v-html="description"></span>
            </label>
            <div :class="['fr-input-wrap', iconName ? `fr-icon-${iconName}` : '']">
                <input :class="`fr-input fr-text--${size} fr-m-0`"
                       :type="type" :id="name"
                       v-bind="field"
                       :required="isRequired"
                       :disabled="isReadOnly"
                       @input="updateValue($event.target.value)"
                       :min="type==='number' ? min : ''"
                       :max="type==='number' ? max : ''"
                       :maxLength="max"
                >
            </div>
            <p v-if="errors.length > 0" class="fr-error-text" :title="errors[0]">{{ errors[0] }}</p>


        </div>
    </Field>
</template>
<style>
</style>
<script>
import { defineComponent } from "vue";
import { defineRule, Field, useForm } from "vee-validate";
import "@/services/validationRules.js";
import CustomTooltip from "@/components/Octave/CustomTooltip.vue";

export default defineComponent({
    name: "CustomInput",
    components: { CustomTooltip, Field },
    data() {
        return {
            uid: Math.random().toString(36).substr(2, 16),
        };
    },
    methods: {
        updateValue(value) {
            if (this.type === 'number') {
                value = parseInt(value, 10);
            }
            this.$emit("update:modelValue", value);
        },
    },
    computed: {
        computedRules() {
            let rules = {};
            if (!this.isReadOnly) { // n'ajoute des règles que si le champ n'est pas en lecture seule
                rules = this.rules;
                if (this.isRequired) {
                    rules = { ...rules, required: true };
                }
                if (this.type === "date") {
                    rules = { ...rules, date_format: true };
                }
                if (this.type === "number") {
                    rules = { ...rules, integer: true, min_value: this.min };
                }
            }
            return rules;
        },

    },
    props: {
        modelValue: {
            type: String,
        },
        size: {
            type: String,
            default: "sm",
        },
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: false,
        },
        tooltip: String,
        description: String,
        iconName: String,
        type: {
            type: String,
            default: "text",
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
        rules: {
            type: [Object, Function],
            required: false,
        },
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
        },
        showValid: {
            type: Boolean,
            default: false
        }

    },
});
</script>