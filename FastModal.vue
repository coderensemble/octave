<template>
    <fr-modal v-model="modelValue.show" title="Liste des Fiches Fast">
        <div v-if="temporaryFasts.length > 0">
            <div class="fr-h6 fr-mb-0">En attente de validation</div>
            <div class="fr-table--sm fr-table fr-table" id="table-sm-component">
                <div class="fr-table__wrapper">
                    <div class="fr-table__container">
                        <div class="fr-table__content">
                            <table id="table-sm">
                                <thead>
                                <tr>
                                    <th scope="col">Version</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Auteur</th>
                                    <th scope="col">Lien</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr
                                    v-for="(tag, index) in temporaryFasts">
                                    <td>{{ tag.name.split("-")[2] }}</td>
                                    <td>{{ formatDate(tag.commit.committed_date) }}</td>
                                    <td>{{ tag.commit.author_name }}</td>
                                    <td>
                                        <fr-button :level="4" size="sm" iconName="external-link-line"
                                                   @click="showFast(currentState.projectId, currentState.platformId, tag.name.split('-')[2], true)" />
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="historicalFasts.length > 0">
            <div class="fr-h6 fr-mb-0">Historique</div>
            <div class="fr-table--sm fr-table fr-table" id="table-sm-component">
                <div class="fr-table__wrapper">
                    <div class="fr-table__container">
                        <div class="fr-table__content">
                            <table id="table-sm">
                                <thead>
                                <tr>
                                    <th scope="col">Version</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Auteur</th>
                                    <th scope="col">Lien</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr
                                    v-for="(tag, index) in historicalFasts">
                                    <td>{{ tag.name.split("-")[2] }}</td>
                                    <td>{{ formatDate(tag.commit.committed_date) }}</td>
                                    <td>{{ tag.commit.author_name }}</td>
                                    <td>
                                        <fr-button :level="4" size="sm" iconName="external-link-line"
                                                   @click="showFast(currentState.projectId, currentState.platformId, tag.name.split('-')[2])" />
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </fr-modal>
</template>
<script>
import {
    getDocumentationStd,
    getFastUrl,
    getPlatformVersion,
    getStandardTags,
} from "@/services/octave.js";
import { dateMixin } from "@/mixins/date.js";

export default {
    name: "FastModal",
    data() {
        return {
            temporaryFasts: [],
            historicalFasts: []
        };
    },
    props: ["modelValue"],
    emits: ["update:modelValue"],

    watch: {
        "currentState": {
            handler: async function() {
                this.temporaryFasts = await this.getTemporaryFastFiles();
                this.historicalFasts = await this.getFastFiles();
            },
            deep: true,
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
    },
    methods: {
        async showFast(projectId, platformId, version, temp) {
            const fastUrl = await getFastUrl(platformId, version);
            if (fastUrl) {
                this.currentState.show = false;
                this.$router.push({
                    name: "FastView",
                    params: {
                        project_id: projectId,
                        platform_id: platformId,
                    },
                    query: {
                        url: encodeURIComponent(fastUrl),
                        version: version,
                        temp: temp,
                    },
                });
            }
        },
        getTemporaryFastFiles: async function() {
            const platform = this.modelValue.platform;
            return platform.tags.filter(tag => tag.name.startsWith("FAST") && tag.name.endsWith("tmp")).map(tag => ({
                ...tag,
            }));
        },
        getFastFiles: function() {
            const platform = this.modelValue.platform;
            return platform.tags.filter(tag => tag.name.startsWith("FAST") && !tag.name.endsWith("tmp"));
        },

    },
    mixins: [dateMixin],
};
</script>