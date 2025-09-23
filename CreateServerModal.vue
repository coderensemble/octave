<template>
    <fr-modal
        v-bind="$attrs"
        v-model="modal.show"
        :size="modal.size"
        :title="modal.title"
        :iconName="modal.iconName"
    >
        <Form v-slot="{ errors, validate }" ref="createServerForm" @submit="handleSubmit">
            <div class="fr-grid-row fr-grid-row--gutters">
                <div class="fr-col-12 fr-col-md-5">
                    <CustomSelect
                        name="serverName"
                        @change="resetServer()"
                        :options="serverNames"
                        :unSelectable="true"
                        unSelectText="Sélectionner un type de Serveur"
                        :rules="{required: true }"
                        v-model="server.nom"
                    />
                </div>
                <div class="fr-col-12 fr-col-md-5">
                    <CustomSelect
                        name="serverMode"
                        :options="serverModes(server.nom)"
                        v-model="server.mode"
                        :rules="{required: true }"
                        :unSelectable="true"
                        unSelectText="Sélectionner le fonctionnement"
                    />
                </div>
                <div class="fr-col-12 fr-col-md-2 fr-mt-1w">
                    <fr-button
                        type="submit"
                        label="Ajouter"
                        @click="validate"
                    />
                </div>
            </div>
            <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                <div class="fr-col-12">
                    <div class="fr-card" v-if="server.mode && server.modele">
                        <div class="fr-card__body">
                            <div class="fr-card__content fr-p-3w">
                                <h3 class="fr-card__title"><i
                                    :class="[ catalogues.serveur[server.modele].icone,  'fr-mr-2w' ]"></i>
                                    {{ key }} - {{ server.titre }}</h3>
                                <p class="fr-card__desc">
                                    <div class="fr-grid-row fr-grid-row--gutters">
                                        <component
                                            :is="userGroups.includes('CAT') ? 'server-advanced-form' : 'server-form'"
                                            :edb="edb"
                                            :server-key="key"
                                            :server-data="server"
                                            :catalogues="catalogues"
                                        />
                                    </div>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    </fr-modal>
</template>

<script>
import ServerForm from "@/pages/Platforms/Forms/ServerForm.vue";
import CustomInput from "@/components/Octave/CustomInput.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import { catalogues, edb, server } from "@/pages/Platforms/data.js";
import { Form } from "vee-validate";
import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import { cloneDeep } from "lodash";
import { mergeMatchingObject } from "@/services/octave.js";
import { mapGetters } from "vuex";
import ServerAdvancedForm from "@/pages/Platforms/Forms/ServerAdvancedForm.vue";
import { getSoftVersions } from "@/services/fastapi.js";
import * as events from "node:events";

export default {
    components: { CustomCheckbox, CustomInput, CustomSelect, server, Form, ServerForm, ServerAdvancedForm },
    mixins: [platformMixins],
    computed: {
        events() {
            return events
        },
        serverNames() {
            if (this.catalogues && this.catalogues.serveur) {
                const uniqueServerNames = [...new Set(Object.values(this.catalogues.serveur).map(server => server.nom))].sort();
                return uniqueServerNames.map(name => ({ label: name, value: name }));
            } else {
                return [];  // or whatever default value you want
            }
        },
        serverModes() {
            return (serverName) => {
                if (serverName) {
                    const foundServers = Object.values(this.catalogues?.serveur || {}).filter(server => server.nom === serverName);
                    return foundServers ? foundServers.map(server => ({
                        label: server.mode,
                        value: server.mode,
                    })).sort() : [];
                }
                return [];
            };
        },
        ...mapGetters("authentication", ["userGroups"]),

    },
    data() {
        return {
            modal: {
                title: "Ajouter un serveur",
                iconName: "add-line",
                size: "lg",
            },
            server: cloneDeep(server),
            key: "",
        };
    },
    methods: {

        resetServer() {
            this.server = cloneDeep(server);
        },
        async handleSubmit() {
            const validation = await this.$refs.createServerForm.validate();
            if (validation.valid) {
                this.$emit("add-server", this.server, this.key);
                this.$refs.createServerForm.resetForm();
                this.resetServer();
            }
        },
    },

    name: "CreateServerModal",
    props: ["catalogues", "edb"],
    watch: {
        "server.mode": async function(newVal, oldVal) {
            if (newVal) {
                const foundServer = Object.values(this.catalogues.serveur).find(
                    server => server.nom === this.server.nom &&
                        server.mode === this.server.mode);
                if (foundServer) {
                    mergeMatchingObject(foundServer, this.server);
                    this.server.os = Object.keys(foundServer.soft)[0];
                    this.server.soft = foundServer.soft[this.server.os][0];
                    if (this.server.os && this.server.soft) {
                        this.server.versions = await getSoftVersions(this.server.os, this.server.soft);
                    }
                    this.server.modele = Object.keys(this.catalogues.serveur).find(key => this.catalogues.serveur[key] === foundServer);
                    this.key = this.server.nom + this.newElementId(this.edb.serveur, this.server.modele);
                }
            }
        },
    },
};
</script>