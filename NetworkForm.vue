<template>
    <div class="fr-col-12">
        <custom-input
            :name="`edb.reseau[${networkKey}].description`"
            label="Description"
            v-model="networkData.description"
            :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-12 fr-col-md-2">
        <custom-input
            :name="`edb.reseau[${networkKey}].ipstock`"
            label="IP en Stock"
            v-model="networkData.ipstock"
            :isReadOnly="isReadOnly"
            description="Nombre d'adresses IP en stock en pourcentage (%)"
            type="number"
            :min=0
        />
    </div>
    <div class="fr-col-12 fr-col-md-3">
        <custom-input
            :name="`edb.reseau[${networkKey}].vlan`"
            label="VLAN"
            description="Si le VLAN existe déjà sinon pour en créer un laisser auto"
            v-model="networkData.vlan"
            :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-12 fr-col-md-4">
        <custom-input
            :name="`edb.reseau[${networkKey}].cidr`"
            label="CIDR"
            description="Taille du réseau (consulter le standard ou laisser auto pour calculer automatiquement)"
            v-model="networkData.cidr"
            :isReadOnly="isReadOnly"
        />
    </div>
<!--    <div class="fr-col-12 fr-col-md-2">-->
<!--        <custom-input-->
<!--            :name="`edb.reseau[${networkKey}].dhcp`"-->
<!--            label="DHCP"-->
<!--            v-model="networkData.dhcp"-->
<!--            :isReadOnly="isReadOnly"-->
<!--            type="number"-->
<!--            :min=0-->
<!--        />-->
<!--    </div>-->
    <div class="fr-col-12 fr-col-md-3">
        <custom-input
            :name="`edb.reseau[${networkKey}].mtu`"
            label="MTU"
            description="Taille max de paquets IP (consulter le standard : 9000 pour 10Gb sinon 1500)"
            v-model="networkData.mtu"
            :isReadOnly="isReadOnly"
            type="number"
            :min=0
        />
    </div>

</template>
<script>


import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";

export default {
    data() {
        return {};
    },
    methods: {},
    props: {
        networkData: { type: Object, required: true },
        networkKey: { type: [String, Number], required: true },
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
    },
};
</script>