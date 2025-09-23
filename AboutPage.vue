<template>
    <div class="fr-grid-row fr-grid-row--gutters fr-mt-5w fr-grid-row--center">
        <div class="fr-grid-row fr-grid-row--gutters ">
            <div class=" fr-col-4">
                <div class="fr-p-5w fr-mr-5w" style="background-color: var(--background-alt-blue-france)">
                    <h3>
                        Outil de<br />
                        Configuration<br />
                        Technique<br />
                        Automatisée et<br />
                        Versionnée
                    </h3>
                </div>
            </div>
            <div class="fr-col-8 fr-p-4v fr-mb-2w">


                <p>OCTAVe s’adresse aux projets qui ont une expression de besoins techniques à adresser pour
                    construire (nouvelle plateforme ou nouveau socle) ou faire évoluer une plateforme technique.
                </p>
                <p>
                    Dans sa première version constitue donc une alternative moderne et simplifiée à la FIDD.
                    <ul>
                        <li>Remplace la fiche FIDD</li>
                        <li>Démarche itérative pour construire la plateforme</li>
                        <li>La demande de IIA sera effectuée en fonction de la demande de PROD</li>
                    </ul>
                    L'architecture et l'implémentation technique de la plateforme sera réalisé par l'équipe CAT
                    du bureau de l'intégration.
                </p>
                <p>
                    Dans le cadre de l'amélioration continue de nos processus et afin de répondre aux exigences
                    croissantes en matière de conception des projets applicatifs, nous vous informons de la
                    généralisation du nouvel outil de saisie de l'expression de besoin de MOE à destination
                    du CAT: OCTAVe.
                </p>
                <p>
                    Pour rappel, cet outil a été conçu pour standardiser et faciliter le recueil des besoins
                    des MOE, et cela, en toute conformité avec les standards techniques de la DGFIP.
                    Cette approche garantie la construction d’une plateforme répondant aux exigences
                    normatives et aux standards convenus par les services techniques du bureau de
                    l’intégration et du bureau SI3.
                </p>
                <p>
                    A compter du 04 novembre 2024, la saisie via OCTAVe sera généralisée pour tous les projets
                    qui entrent dans un process CAI ou FQE, qu’ils fassent l’objet d’une construction ou d’une
                    modification majeure de leurs plateformes techniques.
                </p>
                <p>
                    La version OCTAVe V2 apporte :
                    <ul>
                        <li>
                            L’optimisation des processus de recueil des besoins : Standardisation et
                            homogénéisation de la saisie des besoins, garantissant une meilleure compréhension
                            entre les équipes métiers et techniques. La nouvelle interface migrée sur DSFR
                            améliore l’expérience utilisateur et la lisibilité des périmètres entre la MOE et
                            l’architecte technique.
                        </li>
                        <li>
                            Une meilleure efficacité : Réduction des risques d'erreurs de communication ou de
                            mauvaise interprétation grâce à des formulaires structurés, suivant les pratiques
                            et standards internes convenus entre les différents services techniques.
                        </li>
                        <li>
                            L’amélioration de la collaboration : Facilitation des échanges entre les
                            différentes équipes (MOE, CAT et SI3) autour de modèles d’architecture communs et
                            de plateformes techniques communes.
                        </li>
                        <li>
                            Un meilleur suivi de la construction des projets : Gestion automatique des
                            versions de fichiers de configuration et traçabilité des évolutions entre la MOE
                            et l’architecte.
                        </li>
                    </ul>
                </p>
                <p>
                    De nouvelles fonctionnalités désormais disponibles :
                    <ul>
                        <li>Enregistrement de la saisie en temps réel</li>
                        <li>Accès plus direct aux fiches FAST (Fiche d’Architecture et de Spécification
                            Technique)
                        </li>
                        <li>Amélioration du processus de remplissage des configurations</li>
                        <li>Détection des erreurs améliorée et messages plus compréhensibles</li>
                        <li>Amélioration de la navigation entre les différents onglets</li>
                        <li>Ajout d’un accueil personnalisé avec l’actualité des mises à jour</li>
                    </ul>
                </p>
                <p>
                    Déploiement et accompagnement : Votre premier interlocuteur demeure votre architecte
                    technique, toutefois pour toute difficulté propre à l’outil, une équipe d'assistance
                    sera disponible pour vous accompagner ou répondre à vos interrogations sur son
                    fonctionnement. Vous pourrez contacter l’équipe via le bouton
                    <a :href="`${documentationUrl}guide/index.html#support-et-demandes-specifiques`" target="_blank">
                        demande de support
                    </a>
                    disponible sur sur votre interface OCTAVe V2.
                </p>
                <p>
                    Accéder à la
                    <a :href="`${documentationUrl}index.html`" target="_blank">Documentation en ligne"
                    </a>
                </p>
                <p>
                    Consulter le
                    <a :href="`${documentationUrl}guide/index.html`" target="_blank">Guide utilisateur
                    </a>
                </p>
                <p>
                    Parcourir le
                    <a :href="`${documentationUrl}offre/index.html`" target="_blank">Catalogue pour l'offre
                        standardisée
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>
<style>
.highlight {
    color: rgb(201, 25, 30);
    /* color: rgb(0, 0, 145); */
}
</style>
<script>


export default {
    name: "AboutPage",
    data() {
        return {
            documentationUrl: `/doc/std/latest/`,

        };
    },

};
</script>

