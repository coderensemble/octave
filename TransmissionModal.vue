<template>
    <fr-modal
        :modelValue="modelValue"
        title="Valider la demande de plateforme"
        size="lg"
        @update:modelValue="updateModelValue($event)"
    >
        <ConsoleComponent v-if="showConsole" :console-data="consoleData" />
        <Form v-else v-slot="{ errors }" ref="transmitForm">
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

            <!--            <custom-checkbox-->
            <!--                label="Indisponibilités"-->
            <!--                v-model="availability"-->
            <!--                :options="availabilityOptions"-->
            <!--            />-->
            <fr-button type="button" class="fr-mr-2w" @click="handleSubmit">Confirmer</fr-button>
            <fr-button type="button" level="secondary" @click="cancelAction">Annuler</fr-button>
        </Form>
    </fr-modal>
</template>

<script lang="ts">
import customCheckbox from "@/components/Octave/CustomCheckbox.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";
import { Form } from "vee-validate";
import ConsoleComponent from "@/components/Octave/Console.vue";


export default {
    name: "TransmissionModal",
    data() {
        return {
            showConsole: false,
            description: "",
            availability: {},
            availabilityOptions: [
                {
                    label: "IIA",
                    value: "iia",
                },
                {
                    label: "Intex",
                    value: "intex",
                },
                {
                    label: "Production",
                    value: "production",
                },
            ],
        };
    },
    components: { ConsoleComponent, customCheckbox, CustomInput, Form },
    props: {
        modelValue: { type: Boolean, default: false },
        consoleData: { type: String, default: "" },
    },
    methods: {
        handleSubmit: async function() {
            const validation = await this.$refs.transmitForm.validate();
            if (validation.valid) {
                this.showConsole = true;
                this.$emit("confirm", { message: this.description, availability: this.availability });
            }
        },

        cancelAction() {
            this.$emit("update:modelValue", false);
        },
        updateModelValue(newValue) {
            this.$emit("update:modelValue", newValue);
        },
    },
    computed: {},
};
</script>

<style scoped>
@import '@/assets/octave.css';
</style>