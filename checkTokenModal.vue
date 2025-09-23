<template>
    <fr-modal v-bind="connectionModal" v-model="connectionModal.showModal">
        <div class="fr-mb-5w">
            {{ connectionModal.text }}
        </div>
        <div class="fr-btns-group--center">
            <fr-button label="Renouveller" @click="renewToken" />
        </div>
    </fr-modal>
<!--    <confirm-modal-->
<!--        v-model="accessTokenModal.showModal"-->
<!--        title="Access Token"-->
<!--        @confirm="redirectProfilPage"-->
<!--        no-cancel-button-->
<!--        message="Afin de pouvoir utiliser Octave,-->
<!--        vous devez renseigner un access token valide dans votre profil utilisateur."-->
<!--    />-->
</template>

<script>
import { getUser, verifyAccessToken } from "@/services/gitlab.js";
import store from "@/stores/index.js";
import { mapGetters } from "vuex";
import ConfirmModal from "@/components/Octave/ConfirmModal.vue";
import { getUserToken } from "@/services/fastapi.js";

export default {
    name: "checkTokenModal",
    components: { ConfirmModal },
    data() {
        return {
            connectionModal: {
                showModal: false,
                closable: false,
                size: "md",
                title: "Jeton d'authentification Expiré",
                text: "Votre jeton d'authentification a expiré, veuillez le renouveller.",
            },
            accessTokenModal:{
                showModal: false,
            }
        };
    },
    watch: {
        isLoading(newVal) {
            this.$emit("loaded", newVal);
        },
    },
    methods: {
        redirectProfilPage(){
            this.$router.push({name: 'profil'})
            this.accessTokenModal.showModal = false;
        },
        renewToken() {
            const renewalUrl = `/gitlab/users/sign_in`;
            this.window = window.open(renewalUrl, "_blank");
        },
        // Vérifie de manière régulière si le token est valide sinon reconecte
        async checkToken() {
            // Vérifiez périodiquement si le token doit être renouvelé
            setInterval(async () => {
                if (this.$route.meta.requiresAuth) {
                    const userInfo = await getUser();
                    if (!userInfo) {
                        // Affiche la modale si l'utilisateur n'est pas connecté
                        this.connectionModal.showModal = true;
                    } else {
                        // Ferme la modale si l'utilisateur est connecté
                        await store.dispatch("authentication/login", userInfo);
                        await store.dispatch("authentication/setToken");
                        this.connectionModal.showModal = false;
                        if (this.window) {
                            this.window.close();
                        }

                    }
                }
            }, 5000); // vérifiez toutes les secondes, par exemple
        },
    },
    computed: {
        ...mapGetters("authentication", ["token"]),
    },
    async mounted() {
        await this.checkToken();
    },
};
</script>