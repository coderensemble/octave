<template>
    <custom-accordion label="Console" :open="true">
        <div class="console-container">
            <pre class="consoleOutput" ref="consoleOutput">
              <span v-if="consoleData">{{ consoleData }}</span>
              <span v-else>Exécution en cours...</span>
            </pre>
        </div>
    </custom-accordion>
</template>

<script lang="ts">
import { ref, watch, nextTick } from "vue";
import CustomAccordion from "@/components/Octave/CustomAccordion.vue";

export default {
    name: "ConsoleComponent",
    components: { CustomAccordion },
    props: {
        consoleData: {
            type: String,
            default: "",
        },
    },
    setup(props) {
        const consoleOutput = ref(null);

        watch(
            () => props.consoleData,
            () => {
                nextTick(() => {
                    if (consoleOutput.value) {
                        consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight;
                    }
                });
            },
        );

        return {
            consoleOutput,
        };
    },
};
</script>

<style scoped>
.console-container {
    background-color: #000;
    color: #fff;
    padding: 1em;
    overflow-y: auto;
    max-height: 300px;
}

.consoleOutput {
    background-color: black;
    color: white;
    overflow: auto;
    height: 200px;
    padding: 10px;
    border-radius: 5px;
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>