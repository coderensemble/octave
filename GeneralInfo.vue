<template>
    <Form validateOnInput @input="validateForm" v-slot="{ errors }" :ref="`form-${tabIndex}`">
        <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-col-8">
                <h2 class="fr-h2">{{ label }}</h2>
            </div>
        </div>
        <component
            :is="formType"
            :edb="edb"
            :catalogues="catalogues"
            :is-read-only="isReadOnly"
        />
    </Form>
</template>

<script>
import { Form } from "vee-validate";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import generalInfoForm from "@/pages/Platforms/Forms/GeneralInfoForm.vue";
import generalInfoAdvancedForm from "@/pages/Platforms/Forms/GeneralInfoAdvancedForm.vue";
import { mapGetters } from "vuex";


export default {
    props: ["label", "edb", "catalogues", "isReadOnly", "tabIndex"],
    mixins: [platformMixins],
    methods:{

    },
    components: {
        Form,
        generalInfoForm,
        generalInfoAdvancedForm,
    },
    computed: {
        formType() {

            return this.userGroups.includes('CAT') ? 'general-info-advanced-form' : 'general-info-form';
        },
        ...mapGetters("authentication", ['userGroups']),
    }
};
</script>