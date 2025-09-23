<script lang="ts">
import { defineComponent } from "vue";
import GeneralInfoForm from "@/pages/Platforms/Forms/GeneralInfoForm.vue";
import platformMixins from "@/pages/Platforms/mixins/platformMixins";
import { Field, Form } from "vee-validate";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import { getInventoryStandardFiles } from "@/services/octave";
import CustomInput from "@/components/Octave/CustomInput.vue";
import { defineRule } from 'vee-validate';

defineRule('isHundred', value => {
    return Number(value) % 100 === 0 ? true : 'La valeur doit être un multiple de 100';
});

export default defineComponent({
    name: "GeneralInfoAdvancedForm",
    components: {
        CustomInput,
        CustomSelect,
        GeneralInfoForm,
        Form,
        Field,
    },
    props: ["edb", "catalogues", "isReadOnly", "errors"],
    mixins: [platformMixins],
    data() {
        return {
            infrastructures: {  },
        };
    },
    async created() {
        this.infrastructures = this.getInfrastructures();
    },
    methods: {
        getInfrastructures(){
            return Object.keys(this.catalogues.infras || {}).map(key => ({
                label: `${this.catalogues.infras[key].name} - ${this.catalogues.infras[key].description}`,
                value: key,
            }));
        }
    },

});
</script>

<template>
    <general-info-form
        :edb="edb"
        :catalogues="catalogues"
        :is-read-only="isReadOnly"
    />

    <h4 class="fr-mb-4w">Paramètres Avancés <p class="fr-badge fr-badge--sm fr-badge--orange-terre-battue fr-badge--icon-left fr-icon-group-fill">CAT</p></h4>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div class="fr-col-12 fr-col-md-4">
            <custom-select
                label="Infrastructure"
                is-required
                :options="getInfrastructures()"
                :isReadOnly="isReadOnly"
                un-selectable
                validateOnInput
                description="Sur quelle infrastructure est hébergée la plateforme"
                v-model="edb.plateforme.infrastructure"
                name="edb.plateforme.infrastructure"
            />
        </div>
    </div>
<!--    <div class="fr-grid-row fr-grid-row&#45;&#45;gutters fr-mb-4w">-->
<!--        <div class="fr-col-12 fr-col-md-3">-->
<!--            <custom-input name="edb.plateforme.numnoms"-->
<!--                          label="Numérotation"-->
<!--                          is-required-->
<!--                          description="A quelle centaine commence la numérotation des noms de serveurs"-->
<!--                          validateOnInput-->
<!--                          v-model="edb.plateforme.numnoms"-->
<!--                          type="number"-->
<!--                          :min=0-->
<!--                          :isReadOnly="isReadOnly"-->
<!--                          :rules="{isHundred: true}"-->

<!--            />-->
<!--        </div>-->
<!--        <div class="fr-col-12 fr-col-md-3">-->
<!--            <custom-input name="edb.plateforme.var"-->
<!--                          label="Taille /var"-->
<!--                          is-required-->
<!--                          description="Taille du point de montage /var"-->
<!--                          validateOnInput-->
<!--                          v-model="edb.plateforme.var"-->
<!--                          type="number"-->
<!--                          :min=0-->
<!--                          :isReadOnly="isReadOnly"-->

<!--            />-->
<!--        </div>-->
<!--        <div class="fr-col-12 fr-col-md-3">-->
<!--            <custom-input name="edb.plateforme.varlog"-->
<!--                          label="Taille /var/log"-->
<!--                          is-required-->
<!--                          description="Taille du point de montage /var/log"-->
<!--                          validateOnInput-->
<!--                          v-model="edb.plateforme.varlog"-->
<!--                          type="number"-->
<!--                          :min=0-->
<!--                          :isReadOnly="isReadOnly"-->

<!--            />-->
<!--        </div>-->
<!--    </div>-->
</template>
