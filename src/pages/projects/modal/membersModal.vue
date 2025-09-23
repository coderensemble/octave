<template>
    <fr-modal v-model="currentState.show" title="Membres du projet" size="xl">
        <div v-if="userGroups.includes('CAT')" class="fr-p-4v fr-mb-2w fr-grid-row">
            <div class="fr-col-12">
                <p>
                    Si l'utilisateur recherché n'existe pas vous pouvez le créer en saisissant son adresse email.<br />
                    Une invitation lui sera envoyé.
                </p>
                <div class="fr-col-6">
                    <SearchBar
                        name="membre"
                        label="Membre à ajouter"
                        :getOptions="filteredOptionsForQuery"
                        v-model="selectedMember"
                    />
                </div>
                <div class="fr-col-12">
                    <fr-button
                        label="Ajouter"
                        type="button"
                        :is-disabled="
                            !(
                                (selectedMember &&
                                    formattedOptions.some((option) => option.value === selectedMember)) ||
                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedMember.trim())
                            )
                        "
                        @click="addMember"
                    />
                </div>

                <div v-if="usersArray.records.length === 0" class="fr-error-text fr-col-12">
                    Il n'y a aucun utilisateur autre que le CAT.
                </div>

                <div v-else class="fr-col-12">
                    <clir-auto-table
                        v-if="usersArray.records.length > 0"
                        v-model:state="usersArray.state"
                        v-bind="usersArray"
                        :sortable="false"
                        :filtrable="false"
                        :withPagination="false"
                        :withHoverEffect="false"
                        :caption="'Membres du projet'"
                    >
                        <template #customLineActions="{ currentMetaRecord }">
                            <fr-button
                                :level="4"
                                size="sm"
                                label="Supprimer"
                                type="button"
                                icon-name="delete-bin-line"
                                @click="openDeleteUserModal(currentMetaRecord.$datas)"
                            />
                        </template>
                    </clir-auto-table>
                </div>
            </div>
        </div>
    </fr-modal>
    <fr-modal
        v-if="modalDeleteUser"
        v-model="modalDeleteUser.show"
        title="Suppression d'un membre du projet"
        :size="'sm'"
    >
        <p>
            Vous souhaitez supprimer <b>{{ modalDeleteUser.user.userName }}</b> des collaborateurs du projet.
            <br /><br />
        </p>
        <div class="fr-my-3v">
            <fr-button
                v-if="userGroups && userGroups.includes('CAT')"
                class="fr-mr-2w"
                iconPosition="left"
                label="Confirmer"
                @click="delMember(modalDeleteUser.user.userName)"
            />

            <fr-button iconPosition="" label="Annuler" level="secondary" @click="modalDeleteUser.show = false" />
        </div>
    </fr-modal>
</template>
<script>
import { mapGetters } from "vuex";
import { getProjectUsers, addProjectUser, removeProjectUser, getUsers } from "@/services/fastapi.js";
import SearchBar from "@/components/Octave/SearchBar.vue";

export default {
    name: "MembersModal",
    components: { SearchBar },
    props: ["modelValue", "projectId"],
    emits: ["update:modelValue"],
    data() {
        return {
            selectedMember: "",
            isEmailValid: false,
            formattedOptions: [],
            usersArray: {
                state: new this.$clir.TableState({ rowsByPage: 50 }),
                fields: [
                    { key: "userName", label: "Collaborateur", type: "string" },
                    { key: "userEmail", label: "Email", type: "string" },
                    { key: "addedBy", label: "Ajouté par", type: "string" },
                    { key: "status", label: "Statut", type: "string" },
                ],
                records: [],
            },
            usersData: [],
            modalDeleteUser: {
                user: {},
                show: false,
            },
        };
    },
    created() {
        this.refreshUsers();
    },
    watch: {
        async "currentState.show"(newValue) {
            if (newValue) {
                //await this.refreshUsers();
            }
        },
    },
    computed: {
        currentState: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
        filteredOptionsForQuery() {
            return async (query) => {
                const options = this.formattedOptions.filter((option) =>
                    option.label.toLowerCase().includes(query.toLowerCase())
                );
                if (this.validateEmail(query.trim())) {
                    options.push({
                        value: query.trim(),
                        label: query.trim(),
                        isEmail: true,
                    });
                }
                return options;
            };
        },
        ...mapGetters("authentication", ["userGroups", "user"]),
    },
    methods: {
        validateEmail(email) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(email);
        },
        async refreshUsers() {
            const fetchedUsers = await getProjectUsers(this.projectId);
            this.usersData = fetchedUsers.users || [];
            this.updateUsersArray();
            await this.refreshOptions();
        },
        async refreshOptions() {
            const existingMember = this.usersArray.records.map((record) => record.$datas.userName);
            const allUsers = await getUsers();

            if (!Array.isArray(allUsers)) {
                return;
            }

            this.formattedOptions = allUsers
                .filter((user) => !existingMember.includes(user.name))
                .map((user) => ({
                    label: user.name,
                    username: user.username,
                    email: user.email,
                    value: user.name,
                }));
        },
        updateUsersArray() {
            this.usersArray.records = this.usersData.map((user) => ({
                $datas: {
                    userName: user.name,
                    userEmail: user.email || "",
                    addedBy: user.added_by,
                    status: user.type === "invitation" ? "Invité" : "Membre",
                    id: user.id,
                },
            }));
        },
        async addMember() {
            const newMemberDetails = this.isEmailValid
                ? { name: this.selectedMember.trim(), type: "invitation" }
                : { name: this.selectedMember, type: "member" };

            this.$store.commit("loading/SET_LOADING", true);
            const response = await addProjectUser(this.projectId, newMemberDetails);

            if (response) {
                await this.refreshUsers();
            }

            this.selectedMember = "";
            this.isEmailValid = false;
            this.$store.commit("loading/SET_LOADING", false);
        },
        async delMember(userName) {
            const userIndex = this.usersData.findIndex((user) => user.name === userName);
            if (userIndex !== -1) {
                let identifier =
                    this.usersArray.records[userIndex].$datas.status === "Membre"
                        ? this.usersData[userIndex].username
                        : this.usersArray.records[userIndex].$datas.userEmail;

                this.modalDeleteUser.show = false;
                this.$store.commit("loading/SET_LOADING", true);
                await removeProjectUser(this.projectId, identifier);
                await this.refreshUsers();
                this.$store.commit("loading/SET_LOADING", false);
            }
        },

        openDeleteUserModal(userName) {
            this.modalDeleteUser.user = userName;
            this.modalDeleteUser.show = true;
        },
    },
};
</script>
