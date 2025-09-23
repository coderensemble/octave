<template>
    <server-form
        :catalogues="catalogues"
        :edb="edb"
        :server-data="serverData"
        :server-key="serverKey"
        :is-read-only="isReadOnly">
    </server-form>
    <div class="fr-col-12 fr-h6 fr-pb-0 fr-m-0">
        Paramètres Avancés <p class="fr-badge fr-badge--sm fr-badge--orange-terre-battue fr-badge--icon-left fr-icon-group-fill">CAT</p>
    </div>
    <div class="fr-col-12 fr-col-md-3">
        <custom-select :name="`edb.serveur[${serverKey}].hard`"
                       label="Hardware"
                       is-required
                       un-selectable
                       description="Quel modèle de serveur utiliser"
                       v-model="serverData.hard"
                       :isReadOnly="isReadOnly"
                       :options="getHardware()"
        />
    </div>
    <div class="fr-col-12 fr-col-md-3">

        <custom-select :name="`edb.serveur[${serverKey}].emplacement`"
                       label="Emplacement"
                       un-selectable
                       description="Ou sont placés ces serveurs selon l'infra"
                       v-model="serverData.emplacement"
                       :isReadOnly="isReadOnly"
                       :options="getServerLocations()"
        />
    </div>
    <!--    <div class="fr-col-6">-->
    <!--        <custom-input name="edb.plateforme.numnoms"-->
    <!--                      label="Numérotation"-->
    <!--                      is-required-->
    <!--                      description="A quelle centaine commence la numérotation des noms de serveurs"-->
    <!--                      validateOnInput-->
    <!--                      v-model="edb.plateforme.numnoms"-->
    <!--                      type="number"-->
    <!--                      :min=0-->
    <!--                      :isReadOnly="isReadOnly"-->
    <!--                      :rules="{isHundred: true}"-->

    <!--        />-->
    <!--    </div>-->
    <div class="fr-col-12 fr-col-md-3">
        <custom-input :name="`edb.serveur[${serverKey}].var`"
                      label="Taille /var"
                      description="Taille du point de montage /var"
                      validateOnInput
                      v-model="serverData.var"
                      type="number"
                      :min=0
                      :isReadOnly="isReadOnly"

        />
    </div>
    <div class="fr-col-12 fr-col-md-3">
        <custom-input :name="`edb.serveur[${serverKey}].varlog`"
                      label="Taille /var/log"
                      description="Taille du point de montage /var/log"
                      validateOnInput
                      v-model="serverData.varlog"
                      type="number"
                      :min="0"
                      :isReadOnly="isReadOnly"
        />
    </div>
</template>
<script>

import { defineRule } from "vee-validate";

import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";
import ServerForm from "@/pages/Platforms/Forms/ServerForm.vue";

export default {
    data() {
        return {};
    },
    methods: {
        getHardware() {
            return Object.keys(this.catalogues.hardwares).map(key => ({
                label: `${this.catalogues.hardwares[key].name}`,
                value: key,
            }));
        },
        getServerLocations() {
            const infra = this.catalogues?.infras?.[this.edb?.plateforme?.infrastructure];

            if (infra && infra.cluster) {
                return infra.cluster.map(item => ({ label: item.nom, value: item.nom }));
            }

            // Return an empty array if 'infra' or 'cluster' is not defined
            return [];
        },

    },
    props: {
        serverData: { type: Object, required: true },
        serverKey: { type: [String, Number], required: true },
        edb: { type: Object, required: true },
        catalogues: { type: Object, required: true },
        isReadOnly: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        CustomCheckbox,
        CustomSelect,
        CustomInput,
        ServerForm,
    },
    mounted() {
        // if (this.serverData.emplacement === null || this.serverData.emplacement === '') {
        //     const locations = this.getServerLocations();
        //
        //     if(locations.length > 0) {
        //         this.serverData.emplacement = locations[0].value;
        //     }
        // }
    },
};
</script>