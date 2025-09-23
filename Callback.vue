
<template>
    <div>
        <!-- Vous pouvez mettre ici un message ou une animation de chargement pendant que l'authentification est en cours -->
        <p>Authenticating...</p>
    </div>
</template>

<script>
import store from "@/stores/index.js";

export default {
    name: "Callback",
    async mounted() {
        await store.dispatch('authentication/login');
        window.close();
        this.$router.push({ name: "HomePage" });

    },
};
</script>