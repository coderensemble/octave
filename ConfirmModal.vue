<template>
    <fr-modal
        :modelValue="modelValue"
        :title="title || 'Confirmation'"
        @update:modelValue="updateModelValue($event)"
        :size="size"
    >
        <p>
            <slot></slot>
        </p>
        <p v-if="message">{{ message }}</p>
        <fr-button type="button" class="fr-mr-2w" @click="confirmAction">Confirmer</fr-button>
        <fr-button v-if="!noCancelButton" type="button" level="secondary" @click="cancelAction">Annuler</fr-button>
    </fr-modal>
</template>

<script lang="ts">
export default {
    name: "ConfirmationModal",
    props: {
        modelValue: { type: Boolean, default: false },
        message: { type: String, required: false },
        action: { type: Function, required: true },
        noCancelButton: { type: Boolean, default: false },
        size: { type: String, default: "md" },
    },
    methods: {
        confirmAction() {
            this.$emit("confirm");
            this.$emit("update:modelValue", false);
        },
        cancelAction() {
            this.$emit("update:modelValue", false);
        },
        updateModelValue(newValue) {
            this.$emit("update:modelValue", newValue);
        },
    },
};
</script>