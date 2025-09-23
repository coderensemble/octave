<template>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div class="fr-col-12 fr-col-md-8">
            <div class='fr-input-group'>
                <CustomInput
                    name="description"
                    label="Description"
                    validateOnInput
                    v-model="edb.plateforme.description"
                    type="textarea"
                    :isReadOnly="isReadOnly"
                    isRequired
                />
            </div>
        </div>
        <div class="fr-col-12 fr-col-md-4">
            <CustomInput
                name="tarpf"
                label="Tar PF"
                :rules="{tarpf_format: true}"
                validateOnInput
                v-model="edb.plateforme.tarpf"
                :isReadOnly="isReadOnly"
                isRequired
            />
        </div>
        <div class="fr-col-12 fr-col-md-4">
            <fr-toggle label="IIA" description="Activez pour spécifier les infos pour l'IIA"
                       v-model="edb.plateforme.iia"
                       :is-disabled="isReadOnly"
            />
        </div>
        <div class="fr-col-12 fr-col-md-3">
            <fr-toggle label="Intex" description="Activez si l'Intex n'est pas ISO Production"
                       v-model="edb.plateforme.intex"
                       @click="updateIntexServerCount()"
                       :is-disabled="isReadOnly"
            />
        </div>
    </div>
    <h4 class="fr-mb-4w">Planning</h4>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div class="fr-col-12 fr-col-md-4">
            <CustomInput
                name="date-iia"
                label="Date IIA"
                type="date"
                validateOnInput
                :isReadOnly="isReadOnly"
                isRequired
                v-model="edb.plateforme.date.iia"
            />
        </div>
        <div class="fr-col-12 fr-col-md-4">
            <CustomInput
                name="date-intex"
                label="Date Intex"
                type="date"
                validateOnInput
                isRequired
                :isReadOnly="isReadOnly"
                :rules="{date_after: {after: edb.plateforme.date.iia, dateName: 'IIA'}}"
                v-model="edb.plateforme.date.intex"
            />
        </div>
        <div class="fr-col-12 fr-col-md-4">
            <CustomInput
                name="date-production"
                label="Date Production"
                type="date"
                validateOnInput
                isRequired
                :isReadOnly="isReadOnly"
                :rules="{date_after: {after: edb.plateforme.date.intex, dateName: 'Intex'}}"
                v-model="edb.plateforme.date.production"
            />

        </div>
    </div>
    <h4 class="fr-mb-4w">Outils</h4>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div class="fr-col-12 fr-col-md-4" v-for="(value, key) in catalogues?.plateforme?.[edb.plateforme.architecture].outils">
            <custom-select
                :label="key.charAt(0).toUpperCase() + key.slice(1)"
                :options="value.map(item => ({
                                label: item,
                                value: item
                            }))"
                :isReadOnly="isReadOnly"
                v-model="edb.plateforme.outils[key]"
                :name="`edb.plateforme.outils[${key}]`"
            />
        </div>
    </div>
    <h4 class="fr-mb-4w">Comptes Applicatifs et Exploitants</h4>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div class="fr-col-12 fr-col-md-8">
            <div class="fr-grid-row fr-grid-row--gutters">
                <div class="fr-col-12 fr-col-md-6">
                    <CustomInput
                        name="edb.projet.user"
                        label="Utilisateur"
                        isRequired
                        validateOnInput
                        :isReadOnly="isReadOnly"
                        v-model="edb.projet.user"
                    />
                </div>
                <div class="fr-col-12 fr-col-md-6">
                    <CustomSelect
                        label="EA"
                        :options="catalogues?.plateforme?.[edb.plateforme.architecture].ea.map(item => ({
                                label: item,
                                value: item
                            }))"
                        validateOnInput
                        :isReadOnly="isReadOnly"
                        v-model="edb.plateforme.ea"
                        name="edb.plateforme.ea"
                    />
                </div>
                <div class="fr-col-12 fr-col-md-6">
                    <CustomInput
                        name="edb.projet.group"
                        label="Groupes"
                        isRequired
                        validateOnInput
                        :isReadOnly="isReadOnly"
                        v-model="edb.projet.group"
                    />
                </div>
                <div class="fr-col-12 fr-col-md-6">
                    <CustomSelect
                        label="ES"
                        :options="catalogues?.plateforme?.[edb.plateforme.architecture].es.map(item => ({
                                label: item,
                                value: item
                            }))"
                        validateOnInput
                        :isReadOnly="isReadOnly"
                        v-model="edb.plateforme.es"
                        name="edb.plateforme.es"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { defineRule, Field, Form } from "vee-validate";
import moment from "moment";
import CustomInput from "@/components/Octave/CustomInput.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";


// define the tarpf_format rule
defineRule("tarpf_format", (value) => {
    const pattern = /^\d+\.\d{2}$/;
    return pattern.test(value) || "Le champ doit être au format A.BB";
});

defineRule("date_after", (value, { after, dateName }) => {
    return moment(value).isAfter(after) || `La date doit être après celle de ${dateName}`;
});


export default {
    props: ["edb", "catalogues", "isReadOnly", "errors"],
    mixins: [platformMixins],
    methods: {
        updateIntexServerCount() {
            if (!this.edb.plateforme.intex) {
                for (let key in this.edb.serveur) {
                    this.edb.serveur[key].nombre.intex = this.edb.serveur[key].nombre.production;
                }
            }
        },
    },
    components: {
        CustomSelect,
        CustomInput,
        Field,
        Form,
    },

};

</script>