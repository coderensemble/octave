<template>

    <div class="fr-container">
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
            <div class="fr-col-4">
                <h1 class="fr-mb-0">
                    FAST {{ platformId }}
                </h1>
            </div>
            <div class="fr-col-8"
                 style="display: flex; justify-content: flex-end; flex-wrap: wrap; align-items: center;">
                <p class="fr-text--xs" style="display: flex; align-items: center;">
                    <fr-button
                        label="Télécharger"
                        iconPosition="left"
                        class="fr-mr-1w"

                        title="Télécharger la FAST"
                        iconName="download-fill"
                        level="secondary"
                        @click="downloadFast()"
                    />
                    <fr-button
                        label="Publier"
                        iconPosition="left"
                        title="Publier la FAST"
                        iconName="article-line"
                        level="primary"
                        v-if="temp === true && userGroups.includes('CAT')"
                        @click="confirmPublishModal.show=true"
                    />

                </p>

            </div>
        </div>
    </div>
    <div class="fr-container--fluid">
        <div class="fr-grid-row fr-mx-10w">
            <div class="fr-col-12">
                <div class="iframe">
                    <iframe ref="fastIframe" :src="url" width="100%" height="800"></iframe>
                </div>
            </div>
        </div>
    </div>
    <confirm-modal
        v-model="confirmPublishModal.show"
        title="Confirmer la publication"
        @confirm="publishFast"
        :message="`Voulez vous vraiment publier la FAST ${this.version} ?`"
    />
</template>
<script>
import { getTags, deleteTag, createTag } from "@/services/gitlab";
import { manageIssue } from "@/services/octave.js";
import { mapGetters } from "vuex";
import ConfirmModal from "@/components/Octave/ConfirmModal.vue";
import { mailPublish } from "@/services/mail.js";
import { notifyProject } from "@/services/fastapi.js";

export default {
    name: "Fast",
    components: { ConfirmModal },
    data() {
        return {
            url: decodeURIComponent(this.$route.query.url),
            temp: this.$route.query.temp === "true",
            version: this.$route.query.version,
            confirmPublishModal: {
                show: false,
            }
        };
    },
    props: ["projectId", "platformId"],
    // mounted() {
    //     this.$nextTick(() => {
    //         const iframe = this.$refs.fastIframe;
    //         iframe.onload = () => {
    //             const doc = iframe.contentDocument || iframe.contentWindow.document;
    //
    //             doc.documentElement.style.overflow = 'hidden';
    //
    //             const anchors = doc.querySelectorAll('a[href^="#"]');
    //             for (let i = 0; i < anchors.length; i++) {
    //                 anchors[i].addEventListener('click', (e) => {
    //                     e.preventDefault();
    //
    //                     const targetId = this.getAttribute('href');
    //                     const targetElement = doc.querySelector(targetId);
    //                     if (targetElement) {
    //                         targetElement.scrollIntoView();
    //                     }
    //                 });
    //             }
    //
    //             const observer = new MutationObserver(() => {
    //                 setTimeout(() => {
    //                     const newHeight = doc.documentElement.scrollHeight;
    //                     const footerHeight = document.querySelector('footer') ? document.querySelector('footer').offsetHeight : 0;
    //
    //                     // Ajoutez la hauteur du pied de page à la hauteur de l'iframe
    //                     const totalHeight = newHeight + footerHeight + 'px';
    //
    //                     if (iframe.style.height !== totalHeight) {
    //                         iframe.style.height = totalHeight;
    //                     }
    //
    //                 }, 200);
    //             });
    //
    //             observer.observe(doc, {childList: true, subtree: true});
    //         };
    //     });
    // },
    computed: {
        ...mapGetters("authentication", ["userGroups", "user"]),
    },
    methods: {
        downloadFast() {
            const tagName = `FAST-${this.platformId}-${this.version}`;
            const projectTrigram = this.platformId.slice(0, -1);
            const downloadFastLink = `/gitlab/cat/${projectTrigram}/-/archive/${tagName}${this.temp ? '-tmp': ''}/${projectTrigram}-${tagName}.tar.gz?path=fast/html`;
            window.location.href = downloadFastLink;
        },

        async publishFast() {
            const tagName = `FAST-${this.platformId}-${this.version}`;
            const tags = await getTags(this.projectId, `${tagName}-tmp`);
            for (const tag of tags) {

                await deleteTag(this.projectId, tag.name);
            }
            await createTag(this.projectId, tagName, `edb-${this.platformId}`);
            await manageIssue(this.projectId, this.platformId, ["GRP_CAT", "STEP_VALIDATED", `VER_${this.version}`], `Publication de la FAST ${this.version}`);

            // Send a notifications to project users
            const {subject, body} = await mailPublish(this.platformId, this.user, this.version, this.$router);
            await notifyProject(this.projectId, encodeURIComponent(subject), encodeURIComponent(body));

            this.$router.push({
                name: "ProjectView",
                params: {
                    project_id: this.projectId,
                    project_path: this.platformId,
                },
            }).catch(err => console.log(err));
        },
    },

};
</script>
<!--<style scoped>-->
<!--.iframe iframe {-->
<!--    overflow: hidden;-->
<!--    border: none;-->
<!--}-->
<!--</style>-->