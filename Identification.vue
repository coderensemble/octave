<template>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
        <div class="fr-col-12 fr-pb-0">
            <label for="plateforme.code">Code Plateforme *</label>
        </div>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w fr-grid-row--top">
        <div class="fr-col-8 fr-col-md-3">
            <custom-input name="project.code" is-read-only
                          v-model="project.path" />
        </div>
        <div class="fr-col-4 fr-col-md-3">
            <custom-select rules="required" name="plateforme.code" :options="availableKeys"
                           :modelValue="edb.plateforme.code.slice(-1)" @input="updatePlatformCode" />
        </div>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w fr-grid-row--bottom">
        <div class="fr-col-12 fr-col-md-6">
            <custom-input is-required name="plateforme.description" label="Description" type="textarea"
                          v-model="edb.plateforme.description" />
        </div>
    </div>
</template>

<script>
import CustomInput from "@/components/Octave/CustomInput.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import { getBranches } from "@/services/gitlab.js";
import { Form } from "vee-validate";

export default {
    props: ["edb", "catalogues", "project", "platforms", "stepIndex", "projectId"],

    data() {
        return {
            availableKeys: [],
            selectedCode: "",
        };
    },

    methods: {
        updatePlatformCode(event) {
            this.edb.plateforme.code = this.project.path + event.target.value;
        },
        async getAvailablePlateformeCode() {
            const branches = await getBranches(this.projectId, "edb-");
            const usedKeys = branches.map(el => el.name.slice(-1));
            const allKeys = "abcdefghijklmnopqrstuvwxyz123456789".split("");
            const availableKeys = allKeys.filter(key => !usedKeys.includes(key));
            return availableKeys.map(key => ({ label: key, value: key }));

        },
    },
    async created() {
    },
    async mounted() {
        this.availableKeys = await this.getAvailablePlateformeCode();

    },

    components: { Form, CustomSelect, CustomInput },
};
</script>