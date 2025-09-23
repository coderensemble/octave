<template>
    <div class="fr-col-8">
        <custom-input
            :name="`edb.serveur[${serverKey}].description`"
            label="Description"
            is-required
            :max=40
            v-model="serverData.description"
            :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-4">
        <custom-input
            :name="`edb.serveur[${serverKey}].alias`"
            label="Alias de nom"
            v-model="serverData.alias"
            :max="7"
            :rules="{ uniqueAlias: edb.serveur, alphanumeric: true }"
            :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-4">
        <custom-select
            label="Socle"
            is-required
            :name="`edb.serveur[${serverKey}].os`"
            :options="getOS(serverData)"
            :unSelectable="true"
            v-model="serverData.os"
            :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-4">
        <custom-select
            label="Logiciel"
            :name="`edb.serveur[${serverKey}].soft`"
            :options="getSoftwares(serverData)"
            :unSelectable="false"
            v-model="serverData.soft"
            :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-4">
        <custom-select
            label="Version"
            :name="`edb.serveur[${serverKey}].version`"
            :options="softwareVersions"
            :unSelectable="true"
            v-model="serverData.version"
            :isReadOnly="isReadOnly"

        />
    </div>
    <div class="fr-col-12 fr-h6 fr-mb-0 fr-pb-0">Nombre de serveurs</div>
    <div class="fr-col-3">
        <custom-input :name="`edb.serveur[${serverKey}].nombre.production`"
                      label="Production"
                      validateOnInput
                      v-model="serverData.nombre.production"
                      type="number"
                      :min=1
                      :rules="{ max_total: serverData.nombre.stock }"
                      :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-3">
        <custom-input :name="`edb.serveur[${serverKey}].nombre.stock`"
                      label="Stock"
                      v-model="serverData.nombre.stock"
                      type="number"
                      :min="0"
                      :rules="{ max_total: serverData.nombre.production }"
                      :isReadOnly="isReadOnly"
        />
    </div>
    <div class="fr-col-3">
        <custom-input :name="`edb.serveur[${serverKey}].nombre.iia`"
                      label="IIA"
                      :isReadOnly="!edb.plateforme.iia"
                      v-model="serverData.nombre.iia"
                      :min="0"
                      type="number"
        />
    </div>
    <div class="fr-col-3">
        <custom-input
            label="Intex"
            :name="`edb.serveur[${serverKey}].nombre.intex`"
            :isReadOnly="!edb.plateforme.intex"
            :min="0"
            v-model="serverData.nombre.intex"
            type="number"
        />
    </div>

    <div class="fr-col-12 fr-h6 fr-m-0 fr-pb-0">Outils</div>

    <div class="fr-col-12 fr-py-0">
        <custom-checkbox
            columns=6
            v-model="serverData.outils"
            :options="availableTools(serverData)"
            size="sm"
            class="fr-my-0"
            :isInline="true"
            :isReadOnly="isReadOnly"
        />
    </div>
</template>
<script>

import { defineRule } from "vee-validate";

defineRule("max_total", (value, [targetValue]) => {
    if (Number(value) + Number(targetValue) <= 100) {
        return true;
    }

    return `La somme des deux champs (production et stock) ne doit pas dépasser 100`;
});

defineRule('uniqueAlias', (value, servers) => {
    if(!value) {
        return true;
    }
    const aliasCount = Object.values(servers).filter(server => server.alias === value).length;
    return aliasCount <= 1 || 'Cet alias est déjà utilisé.';
});



import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";
import { getSoftVersions } from "@/services/fastapi.js";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";

export default {
    data() {
        return {
            softwareVersions: [],
        };
    },
    methods: {
        getOS(serverData) {
            const catalogue = this.catalogues?.serveur[serverData.modele];
            const soft = catalogue?.soft;
            const keys = soft ? Object.keys(soft) : [];

            return [...new Set(keys)].sort().map(key => ({ label: key, value: key }));
        },
        getSoftwares(serverData) {
            const server = this.catalogues?.serveur[serverData.modele];
            const softOs = server?.soft[serverData.os];

            const sortedSoft = softOs ? softOs.sort() : [];
            return sortedSoft.map(software => ({ label: software, value: software }));
        },
        async getVersions() {
            if (this.serverData.os && this.serverData.soft) {
                const softwares = await getSoftVersions(this.serverData.os, this.serverData.soft);
                this.softwareVersions = softwares.data.map(software => ({
                    label: software.version,
                    value: software.version,
                }));
            }
        },
        availableTools(serverData) {
            let outils = this.edb.plateforme.outils || {};
            if (this.catalogues && this.catalogues.serveur[serverData.modele]) {
                if (this.catalogues.serveur[serverData.modele].outils) {
                    let tools = Object.keys(this.catalogues.serveur[serverData.modele].outils);
                    return tools.map(tool => {
                        // When tools is not configure in generalInfo then we put serverData to false
                        let isDisabled = outils[tool] === "";
                        if (isDisabled) {
                            serverData.outils[tool] = false;
                        }
                        return {
                            label: tool.charAt(0).toUpperCase() + tool.slice(1),
                            value: tool,
                            description: this.edb.plateforme.outils[tool],
                            disabled: isDisabled,
                        };
                    });
                }
            }
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
    watch: {
        'serverData.nombre.production': function(newVal) {
            // Only update Intex if it is not manually editable
            if (!this.edb.plateforme.intex) {
                this.serverData.nombre.intex = newVal;
            }
        },
        "serverData.os": "getVersions",
        "serverData.soft": "getVersions",
        "serverData.outils": {
            deep: true,
            handler(newVal, oldVal) {
                this.updateNetworks();
            },
        },
        "serverData.nombre": {
            deep: true,
            handler(newVal, oldVal) {
                //this.updateHosts();
            },
        },
    },
    mixins: [platformMixins],

    components: {
        CustomCheckbox,
        CustomSelect,
        CustomInput,
    },
    mounted() {
        this.getVersions();
    },
};
</script>