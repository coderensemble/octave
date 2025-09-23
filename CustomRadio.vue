<template>
    <fieldset class="fr-fieldset" :id="`radio-${uid}`" :aria-labelledby="`radio-${uid}-legend radio-${uid}-messages`">
        <legend class="fr-fieldset__legend--regular fr-fieldset__legend" :id="`radio-${uid}-legend`">
            {{ label }}
            <span class="fr-hint-text">{{ description }}</span>
        </legend>

        <div class="fr-radio-container" :style="isInline ? `display: flex`: `grid-template-columns: repeat(${columns}, 1fr); display: grid;
            grid-auto-rows: minmax(50px, auto); width: 100%`">
            <div
                v-for="(option, index) in options"
                :key="index"
                class="fr-fieldset__element" :class="{'fr-fieldset__element--inline': isInline}">
                <div class="fr-radio-group">
                    <input type="radio"
                           :checked="modelValue === option.value"
                           :value="option.value"
                           :id="`radio-${uid}-${index+1}`"
                           :name="`radio-${uid}`"
                           v-model="selectedValue"
                    >
                    <label class="fr-label" :for="`radio-${uid}-${index+1}`">
                        {{ option.label }}
                        <span v-if="option.description" class="fr-hint-text" v-html="option.description"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="fr-messages-group" :id="`radio-${uid}-messages`" aria-live="assertive"></div>
    </fieldset>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "CustomRadio",
    data() {
        return {
            selectedValue: this.modelValue,
            uid: Math.random().toString(36).substr(2, 16),
        };
    },
    watch: {
        selectedValue(newValue) {
            this.$emit("update:modelValue", newValue);
        },
    },
    props: {
        options: {
            type: Array,
            default: () => [],
        },
        isInline: {
            type: Boolean,
            default: false,
        },
        description: String,
        label: String,
        modelValue: [Number, String],
        columns: {
            type: Number,
            default: 1,
        },
    },
});
</script>
