<template>
    <fr-modal v-model="currentState.show" title="Historique de la plateforme">
        <div v-if="currentState.platform" class="fr-pt-4w">
            <div class="timeline">
                <div v-for="(event, index) in history" :key="index" class="timeline-item">
                    <!-- Styling each note as a bubble and line connected to it -->
                    <div class="timeline-info" v-if="event.type === 'note'">
                        <span>{{ fromNow(event.created_at) }}</span>
                        <div class="fr-text--xs">{{ formatDate(event.created_at) }}</div> <!-- Here -->

                    </div>
                    <div class="timeline-marker" v-if="event.type === 'note'"></div>
                    <div class="timeline-content">
                        <div v-if="event.type === 'step'">
                            <p class="fr-mb-0 fr-badge fr-badge--sm fr-badge--blue-ecume fr-badge--icon-left fr-icon-time-line">{{ steps[event.label.name] }}</p>
                        </div>
                        <div v-else>
                            <p class="fr-mb-0" v-html="event.body"></p>
                            <p class="timeline-author">{{ event.author.name }}</p>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    </fr-modal>
</template>
<script>
import { getIssueNotes, getResourceLabelEvents } from "@/services/gitlab.js";
import { dateMixin } from "@/mixins/date.js";
import { steps } from "@/datas/steps.js";

export default {
    name: "HistoryModal",
    props: ["modelValue"],
    emits: ["update:modelValue"],
    data() {
        return {
            history: null,
        };
    },
    computed: {
        steps() {
            return steps
        },
        currentState: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
    },
    watch: {
        "currentState": {
            handler: async function() {
                this.history = await this.getHistoryList();
            },
            deep: true,
        },
    },
    methods: {
        async getHistoryList() {
            const issue = this.currentState.platform.issues.find(issue => issue.title === `platform-${this.currentState.platform.id}`);
            const notes = await getIssueNotes(this.currentState.projectId, issue.iid);
            const events = await getResourceLabelEvents(this.currentState.projectId, issue.iid);
            const steps = events.filter(event => event.label.name.startsWith("STEP") && event.action === "add");
            notes.forEach(note => note.type = "note");
            steps.forEach(step => step.type = "step");
            const history = [...notes].concat(steps);
            // Trie le tableau d'historique par date de création
            history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return history;
        },
    },
    mixins: [dateMixin],

};
</script>


<style scoped>
.timeline {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
}

.timeline::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 40%;
    width: 2px;
    background: #c5c5c5;
}

.timeline-item {
    padding: 20px 0;
    position: relative;
}

.timeline-info {
    position: absolute;
    top: 0;
    width: 30%;
    right: 70%;
    text-align: right;
}

.timeline-author {
    font-size: 0.8rem;
    font-style: italic;
    color: #888;
}

.timeline-marker {
    position: absolute;
    top: 0;
    left: calc(40% - 8px);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--background-active-blue-france);
}

.timeline-content {
    margin-left: 60%;
    margin-top: -25px;
}

.timeline-title {
    font-weight: bold;
}
</style>