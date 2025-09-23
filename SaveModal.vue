<template>
    <fr-modal
        :modelValue="modelValue"
        title="Sauvegarder la plateforme"
        size="lg"
        @update:modelValue="updateModelValue($event)"
    >
        <Form v-slot="{ errors }" ref="saveForm">
            <custom-input
                type="textarea"
                description="Merci d'ajouter une description des changements réalisés."
                v-model="description"
                name="commitMessage"
                label="Description"
                is-required
                class="fr-mb-2w"
                rows="2"
                cols="50"
            />


            <fr-button type="button" class="fr-mr-2w" @click="handleSubmit">Confirmer</fr-button>
            <fr-button type="button" level="secondary" @click="cancelAction">Annuler</fr-button>
        </Form>
    </fr-modal>
</template>

<script lang="ts">
import customCheckbox from "@/components/Octave/CustomCheckbox.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";
import { Form } from "vee-validate";


export default {
    name: "SaveModal",
    data() {
        return {
            description: "",
            diff: null,
        };
    },
    watch: {
        "modelValue": {
            handler: async function() {
                // diff edb
            },
        },
    },
    components: { customCheckbox, CustomInput, Form },
    props: {
        modelValue: { type: Boolean, default: false },
    },
    methods: {
        async handleSubmit() {
            const validation = await this.$refs.saveForm.validate();
            if (validation.valid) {
                this.$emit("confirm", { message: this.description });
                this.$emit("update:modelValue", false);
            }
        },
        cancelAction() {
            this.$emit("update:modelValue", false);
        },
        updateModelValue(newValue) {
            this.$emit("update:modelValue", newValue);
        },
    },
    computed: {

    },
};
</script>

