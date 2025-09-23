<template>
    <div class="fr-range-group" :id="`range-${uid}-group`">
        <label class="fr-label">{{ label }}
            <span class="fr-hint-text">{{ hintText }}</span>
        </label>
        <div class="fr-range fr-range--sm">
            <input style="position:absolute;width:100%" :id="`range-${uid}`" :name="`range-${uid}`" type="range"
                   :aria-labelledby="`range-${uid}-label`" min="1"
                   max="4" step="1" :aria-describedby="`range-${uid}-messages`" data-fr-js-range-input="true" :value="modelValue" @input="updateValue"
            />
        </div>
        <div style="display:flex;justify-content:space-between;width:60%;margin-top:5%">
            <span class="fr-range__min" aria-hidden="false"></span>
            <span class="fr-range__max" aria-hidden="false"></span>
        </div>

        <div class="fr-messages-group" :id="`range-${uid}-messages`" aria-live="polite"></div>
    </div>
</template>
<script>
import "@gouvfr/dsfr/dist/dsfr.main.css";

export default {
    props: ["label", "hintText", "modelValue"],
    data() {
        return {
            value: this.modelValue || 1,
            uid: Math.random().toString(36).substr(2, 16),

        };
    },

    methods: {
        updateValue(event) {
            this.$emit('update:modelValue', Number(event.target.value));
        }
    }
};
</script>
