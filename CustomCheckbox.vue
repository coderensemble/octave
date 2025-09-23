<template>
    <fieldset
        class="fr-fieldset"
        :id="`checkboxes-${uid}`"
        :aria-labelledby="`checkboxes-${uid}-legend checkboxes-${uid}-messages`">
        <legend :class="['fr-fieldset__legend--regular', 'fr-m-0', 'fr-fieldset__legend', {[`fr-text--${size}`]: size}]" :id="`checkboxes-${uid}-legend`">
            {{ label }}
        </legend>
        <div class="fr-checkbox-container" :style="`grid-template-columns: repeat(${columns}, 1fr); display: grid;
            grid-auto-rows: minmax(50px, auto); width: 100%`">
            <div v-for="(option, index) in options" :key="index"
                 class="fr-fieldset__element fr-fieldset__element--inline">
                <div :class="`fr-checkbox-group fr-checkbox-group--${size}`">
                    <input
                        :name="`checkboxes-el-${uid}-${index+1}`"
                        :id="`checkboxes-el-${uid}-${index+1}`"
                        type="checkbox"
                        @change="(event) => updateModelValue(option, event.target.checked)"
                        :checked="mode === 'object' ? modelValue[option.value] : modelValue?.includes(option.value)"
                        :disabled="option.disabled || isReadOnly"
                        :aria-describedby="`checkboxes-el-${uid}-${index+1}-messages`"
                    >
                    <label :class="['fr-label', {[`fr-text--${size}`]: size}, 'fr-mb-0']" :for="`checkboxes-el-${uid}-${index+1}`">
                        {{ option.label }}
                        <span v-if="option.description" class="fr-hint-text" v-html="option.description"></span>
                    </label>
                    <div class="fr-messages-group" :id="`checkboxes-el-${uid}-${index+1}-messages`"
                         aria-live="assertive"></div>
                </div>
            </div>
        </div>

        <div :id="`checkboxes-${uid}-messages`" class="fr-messages-group" aria-live="assertive"></div>
    </fieldset>
</template>
<script>
export default {
    data() {
        return {
            uid: Math.random().toString(36).substr(2, 16),
        };
    },
    created() {
        if (this.mode === "object" && !this.modelValue) {
            this.$emit("update:modelValue", {});
        } else if (this.mode === "array" && !this.modelValue) {
            this.$emit("update:modelValue", []);
        }
    },
    props: {
        label: String,
        columns: {
            type: String,
            default: "4",
        },
        modelValue: {
            type: [Object, Array],
        },
        description: String,
        options: {
            type: Array,
            default: () => [],
        },
        size: {
            type: String,
            default: "md",
        },
        mode: {
            type: String,
            default: "object",
        },
        isReadOnly: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        updateModelValue(option, isChecked) {
            if (this.mode === "object") {
                this.$emit("update:modelValue", { ...this.modelValue, [option.value]: isChecked });
            } else if (this.mode === "array") {
                if (isChecked) {
                    if (!this.modelValue.includes(option.value)) {
                        this.$emit("update:modelValue", [...this.modelValue, option.value]);
                    }
                } else {
                    const newValue = this.modelValue.filter(value => value !== option.value);
                    this.$emit("update:modelValue", newValue);
                }
            }
        },

    },

};
</script>script>