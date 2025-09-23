<template>
    <Form @input="validateForm" v-slot="{ errors }" :ref="`form-${tabIndex}`">
        <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-col-8">
                <h2 class="fr-h2">{{ label }}</h2>
            </div>
            <div class="fr-col-4">
                <ul class="fr-btns-group--right">
                    <fr-button
                        v-if="!isReadOnly"
                        type="button"
                        label="Ajouter un Serveur"
                        iconName="add-line"
                        iconPosition="left"
                        @click="() => { modal.show = true; }"
                    />
                </ul>
            </div>
            <div class="fr-p-4v fr-col-12">
                <div class="fr-mb-4w"
                     v-for="(className, classCode) in catalogues.classe"
                     :key="className"
                >
                    <div v-if="serversOfClass(classCode).length">
                        <div class="fr-h6" style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <i class="fr-mr-2w"></i>
                                {{ className }}
                            </div>
                            <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
                                type="button"

                                @click="toggleAllAccordions"
                            >{{ allAccordionsState === 'open' ? 'Fermer les accordéons' : 'Ouvrir les accordéons'}}</button>
                        </div>
                        <custom-accordion
                            :key="serverKey"
                            :label="`${serverKey} - ${edb.serveur[serverKey].description} - ${edb.serveur[serverKey].mode}`"
                            :iconName="catalogues?.serveur?.[edb.serveur[serverKey]?.modele]?.icone  || ''"
                            :description="generateLabel(serverKey) || ''"
                            :state="Object.keys(errors).some(error => error.includes(serverKey)) ? 'error': ''"
                            caretPosition="before"
                            :allAccordionsState="allAccordionsState"

                            v-for="serverKey in serversOfClass(classCode)"
                        >
                            <template v-slot:buttons>
                                <fr-button
                                    v-if="!isReadOnly"
                                    type="button"
                                    size="sm"
                                    class="fr-mr-1w"
                                    level="tertiary-no-outline"
                                    iconPosition=""
                                    label="Monter"
                                    iconName="arrow-up-line"
                                    title="Monter"
                                    @click.stop="moveServerUp(serverKey)"
                                />
                                <fr-button
                                    v-if="!isReadOnly"
                                    type="button"
                                    size="sm"
                                    class="fr-mr-1w"
                                    level="tertiary-no-outline"
                                    iconPosition=""
                                    label="Descendre"
                                    iconName="arrow-down-line"
                                    title="Descendre"
                                    @click.stop="moveServerDown(serverKey)"
                                />
                                <fr-button
                                    v-if="!isReadOnly"
                                    type="button"
                                    size="sm"
                                    level="tertiary-no-outline"
                                    iconPosition=""
                                    label="Supprimer"
                                    @click.stop="openModal(serverKey)"
                                    iconName="delete-bin-line"
                                    title="Supprimer"
                                />
                            </template>
                            <div class="block-element">
                                <div class="block-header fr-col-12">
                                    <div class="fr-col-auto">

                                    </div>
                                    <div class="fr-col-auto fr-col--top">
                                    </div>
                                </div>
                                <div class="block-body fr-grid-row--gutters fr-grid-row">
                                        <component
                                            :is="userGroups.includes('CAT') ? 'server-advanced-form' : 'server-form'"
                                            :edb="edb"
                                            :server-key="serverKey"
                                            :server-data="edb.serveur[serverKey]"
                                            :catalogues="catalogues"
                                            :is-read-only="isReadOnly"
                                        />
                                </div>

                            </div>
                        </custom-accordion>
                    </div>
                </div>
            </div>

        </div>
    </Form>
    <!-- Le modal qui s'affiche lorsque l'utilisateur clique sur "Ajouter un serveur" -->
    <create-server-modal
        :catalogues="catalogues"
        :edb="edb"
        v-model="modal.show"
        v-bind="modal"
        @add-server="addServer"
    />
    <!-- Le modal qui s'affiche lorsque l'utilisateur clique sur "Supprimer" un serveur. -->
    <confirm-modal
        :modelValue="confirmModalKey !== false"
        @update:modelValue="confirmModalKey = $event"
        @confirm="deleteServer(confirmModalKey)"
        :message="`Voulez-vous supprimer le serveur ${confirmModalKey} ? `"
    />


</template>

<script>
import CustomInput from "@/components/Octave/CustomInput.vue";
import CreateServerModal from "@/pages/Platforms/Modal/CreateServerModal.vue";
import { mapGetters } from "vuex";
import CreateProjectModal from "@/pages/Projects/CreateProjectModal.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import CustomAccordion from "@/components/Octave/CustomAccordion.vue";
import platformMixins from "@/pages/Platforms/mixins/platformMixins.js";
import CustomCheckbox from "@/components/Octave/CustomCheckbox.vue";
import serverForm from "@/pages/Platforms/Forms/ServerForm.vue";
import { Form } from "vee-validate";
import ConfirmModal from "@/components/Octave/ConfirmModal.vue";
import serverAdvancedForm from "@/pages/Platforms/Forms/ServerAdvancedForm.vue";
import { edb, server } from "@/pages/Platforms/data.js";
import { generateHostsRangeFromHosts } from "@/services/octave.js";
import accordionsMixins from "@/pages/Platforms/mixins/accordionsMixins.js";

export default {
    data() {
        return {
            confirmModalKey: false,
            modal: {
                show: false,
            },
        };
    },
    mixins: [platformMixins, accordionsMixins],
    components: {
        ConfirmModal,
        Form,
        serverForm,
        serverAdvancedForm,
        CustomAccordion,
        CustomCheckbox,
        CustomSelect,
        CreateProjectModal,
        CustomInput,
        CreateServerModal,
    },
    props: ["label", "edb", "catalogues", "isReadOnly", "tabIndex", "projectId", "platformId", "project"],
    computed: {
        serverOrder() {
            return Object.keys(this.edb.serveur);
        },
        ...mapGetters("authentication", ["userGroups"]),
    },
    // watch: {
    //     'edb.serveur': {
    //         deep: true,
    //         handler() {
    //             Object.keys(this.edb.serveur).forEach(serverKey => this.updateServerHostsAndLabels(serverKey));
    //         }
    //     }
    // },
    methods: {
        serversOfClass(classCode) {
            return this.serverOrder.filter(serverKey => this.edb.serveur[serverKey].code === classCode);
        },
        // generateLabel(serverKey) {
        //     return generateHostsRangeFromHosts(this.edb.serveur[serverKey].hosts);
        // },
        generateLabel(serverKey) {
            return this.generateAlias(serverKey) ? `${this.generateHosts(serverKey)} | ${this.generateAlias(serverKey)}` : this.generateHosts(serverKey);
        },
        generateHosts(serverKey){
            // récupère les informations du serveur
            const server = this.edb.serveur[serverKey];
            const trigram = this.platformId.slice(0,3);
            const zone = this.edb.plateforme.zone;
            const code = server.code;
            // calcul l'indice de départ
            const startIndex = Number(this.calculateStartIndex(serverKey));

            // hostname de départ
            const hostnameStart = this.calculateHostname(trigram, zone, code, startIndex + 1);
            // hostname de fin
            const hostnameEnd = this.calculateHostname(trigram, zone, code, Number(startIndex) + Number(server.nombre.production) + Number(server.nombre.stock));
            // label construit a partir des infos précédentes
            return hostnameEnd !== hostnameStart ?
                `${hostnameStart} - ${hostnameEnd}`
                : `${hostnameStart}`;
        },
        generateAlias(serverKey) {
            const server = this.edb.serveur[serverKey];
            const aliasUnique = server.alias || "";

            if (!aliasUnique) return null; // If aliasUnique is not exist it reasonable to return from function

            const indexStartFormatted = (1).toString().padStart(3, "0");
            const endIndex = Number(server.nombre.production) + Number(server.nombre.stock);
            const indexEndFormatted = endIndex.toString().padStart(3, "0");

            const aliasWithStartIndex = aliasUnique + indexStartFormatted;
            const aliasWithEndIndex = aliasUnique + indexEndFormatted;

            return indexStartFormatted !== indexEndFormatted ?
                `${aliasWithStartIndex} - ${aliasWithEndIndex}` :
                `${aliasWithStartIndex}`
        },

        // Calcule l'indice de départ en fonction du nombre total de serveur de production déjà défini.
        calculateStartIndex(key) {
            const serverCode = this.edb.serveur[key].code;
            return this.serverOrder
                .slice(0, this.serverOrder.indexOf(key))
                .reduce((startIndex, orderKey) => {
                    const otherServerCode = this.edb.serveur[orderKey].code;
                    return otherServerCode === serverCode
                        ? startIndex + Number(this.edb.serveur[orderKey].nombre.production) + Number(this.edb.serveur[orderKey].nombre.stock)
                        : startIndex;
                }, 0);
        },
        //genère la base de construction standard des hostnames
        calculateHostname(trigram, zone, code, order) {
            const step = "p";
            const zoneMap = {
                "agents": "g",
                "administration": "b",
            };

            // Utilise le mappage s'il existe, sinon utilise zone tel quel.
            const zoneCode = zoneMap[zone] || "u";


            return `${trigram}${step}${zoneCode}s${code}${(order + (this.edb.plateforme.numnoms ? parseInt(this.edb.plateforme.numnoms) : 0)).toString().padStart(3, "0")}`;
        },
        openModal(serverKey) {
            this.confirmModalKey = serverKey;
        },
        closeModal() {
            this.confirmModalKey = false;
        },
        deleteServer(key) {
            delete this.edb.serveur[key];
            // Met à jour les réseaux
            this.updateNetworks();
            // Met à jour les hosts
            //this.updateHosts();
            this.closeModal();
        },
        addServer(server, key) {
            this.edb.serveur = this.edb.serveur || edb.serveur;
            this.edb.serveur[key] = server;

            // Met à jour les réseaux
            this.updateNetworks();
            // Met à jour les hosts
            //this.updateHosts();

            this.modal.show = false;
        },
        moveServerUp(serverKey) {
            const serverClass = this.edb.serveur[serverKey].code;
            const serversOfClass = this.serversOfClass(serverClass);
            const index = serversOfClass.indexOf(serverKey);

            // Verify if the server is not already the first one in its class
            if (index > 0) {
                // Swap positions with the previous server of the same class
                const previousServerKey = serversOfClass[index - 1];
                this.swapServerOrder(serverKey, previousServerKey);
            }
        },
        moveServerDown(serverKey) {
            const serverClass = this.edb.serveur[serverKey].code;
            const serversOfClass = this.serversOfClass(serverClass);
            const index = serversOfClass.indexOf(serverKey);

            // Verify if the server is not already the last one in its class
            if (index < serversOfClass.length - 1) {
                // Swap positions with the next server of the same class
                const nextServerKey = serversOfClass[index + 1];
                this.swapServerOrder(serverKey, nextServerKey);
            }
        },

        // Method used to swap order of two servers
        swapServerOrder(serverKey1, serverKey2) {

            const index1 = this.serverOrder.indexOf(serverKey1);
            const index2 = this.serverOrder.indexOf(serverKey2);

            [this.serverOrder[index1], this.serverOrder[index2]] = [this.serverOrder[index2], this.serverOrder[index1]];
            this.edb.serveur = this.reorderObject(this.edb.serveur, this.serverOrder);

            // Met à jour les hosts
            //this.updateHosts();
        },
    },
};
</script>
<style scoped>
@import '@/assets/octave.css';
</style>