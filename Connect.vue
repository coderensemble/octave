<template>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-pt-10v fr-pt-md-14v fr-pb-6v fr-pb-md-10v">
                <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
                    <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
                        <fr-alert class="fr-mb-5v" v-model="error.display" :description="error.description" type="error" />

                        <h1 class="fr-h4">Se Connecter</h1>
                        <fr-input
                            v-model="login"
                            :label="loginInput.labelData"
                            :description="loginInput.descriptionData"
                            :iconName="loginInput.iconNameData"
                            :state="loginInput.stateData"
                            :stateDescription="loginInput.stateDescriptionData"
                            :maxlength="loginInput.maxlengthData"
                        />
                        <fr-input
                            v-model="password"
                            :label="passwordInput.labelData"
                            :description="passwordInput.descriptionData"
                            :iconName="passwordInput.iconNameData"
                            :state="passwordInput.stateData"
                            :stateDescription="passwordInput.stateDescriptionData"
                            :maxlength="passwordInput.maxlengthData"
                            :type="passwordInput.typeData"
                        />
                        <fr-button
                            label="Se Connecter"
                            :iconName="iconNameData"
                            :iconPosition="iconPositionData"
                            :title="titleData"
                            @click.prevent="submitForm"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
<script>

import { connectToGitLab } from "@/services/auth.js";
import { getUserGroups, getUser } from "@/services/gitlab.js";

export default {
    name: "Connect",
    data() {
        return {
            error: {
                description: "",
                display: false,
            },
            login: "",
            isAuthenticated: false,
            loginInput: {
                labelData: "Identifiant",
                descriptionData: "Format attendu : login@dgfip.finances.gouv.fr",
                iconName: "user-line",
            },
            password: "",
            passwordInput: {
                labelData: "Mot de Passe",
                iconName: "lock-line",
                typeData: "password",
            },
        };
    },
    methods: {
        cardBadges(el) {
            let badges = [];
            if (el.status === "released") badges.push(this.releasedBadge);
            if (el.status === "doing") badges.push(this.doingBadge);
            if (el.status === "todo") badges.push(this.todoBadge);
            if (el.hasVModel) badges.push(this.vModelBadge);
            return badges;
        },
        async submitForm() {
            if (this.validateForm()) {
                try {
                    await connectToGitLab(this.login, this.password);
                    const userGroups = await getUserGroups();
                    const userInfo = await getUser();
                    // On met à jour le store
                    this.$store.commit("setAuthenticated", true);
                    this.$store.commit("setUserGroups", userGroups);
                    this.$store.commit("setUserInfo", userInfo);
                    // On redirige sur la page demandé avant la connexion
                    const redirectRoute = this.$route.query.redirect || { name: "HomePage" };
                    this.$router.push(redirectRoute);
                } catch (error) {
                    this.error.description = "Une erreur s'est produite lors de la tentative de connexion. Veuillez vérifier vos identifiants et réessayer.";
                    this.error.display = true;
                }
            }
        },

        validateForm() {
            let isValid = true;
            // Effectuez une validation sur chaque champ et mettez à jour la valeur de isValid
            // Exemple basique :
            if (this.Login === "") {
                // Ajouter une erreur pour Login ici.
                isValid = false;
            }
            if (this.Password === "") {
                // Ajouter une erreur pour Password ici.
                isValid = false;
            }
            return isValid;
        },
    },
};
</script>