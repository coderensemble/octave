<template>
    <fr-modal
        :modelValue="modelValue"
        title="Charger un fichier"

        @update:modelValue="updateModelValue"
    >
        <Form @input="validateForm" v-slot="{ errors, submitForm }" ref="form-upload">

            <div class="fr-upload-group">
                <p class="fr-label" for="file-upload">
                    <span class="fr-hint-text">
                        Taille maximale : {{ maxSize }} Mo. Formats supportés : {{ supportedExt.join(", ") }}. Plusieurs fichiers possibles.
                    </span>
                </p>
                <Field
                    name="file-upload"
                    type="file"
                    id="file-upload"
                    style="display: none"
                    v-on:change="loadSelectedFiles"
                    class="fr-upload"
                    :rules="{ size: maxSize, ext: supportedExt }"
                />

                <button class="fr-btn fr-btn--sm" type="button" id="upload-button" @click="uploadFile">Charger un
                    fichier
                </button>
                <p class="fr-error-text" v-if="errors && errors['file-upload']">
                    {{ errors["file-upload"] }}
                </p>
            </div>

        </Form>
        <!-- Handle existing files from the server -->
        <div v-if="attachments" class="fr-table fr-table--bordered">
            <table>
                <thead>
                <tr>
                    <th>Fichier</th>
                    <th>Supprimer</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(file, fileName) in attachments" :key="fileName">
                    <td>{{ file.name }}</td>
                    <td>
                        <fr-button label="Delete" iconName="delete-line" size="sm"
                                   @click="deleteFile(file.path, file.name)" />
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <fr-button label="Valider" @click="this.updateModelValue(false)" />

    </fr-modal>
</template>

<script lang="ts">

import { Field, Form, defineRule, validate } from "vee-validate";

defineRule("ext", (value, expected) => {
    if (!value || !expected || expected.length === 0)
        return true;

    // Assuming that value is a File object
    let fileExtension = value.name.split(".").pop();

    if (expected.includes(`.${fileExtension}`)) // prefix with dot
        return true;

    return `Le fichier doit être de l'un des types suivants : ${expected.join(", ")}.`;
});

defineRule("size", (value, [expectedSize]) => {
    if (!value) {
        return true;
    }

    let fileSizeInMB = value.size / 1048576; // convert size to MB
    return fileSizeInMB <= expectedSize ? true : `La taille du fichier devrait être inférieure à ${expectedSize} Mo`;
});

export default {
    name: "FileUploader",
    components: {
        Field,
        Form,
    },
    props: {
        modelValue: { type: Boolean, default: false },
        projectId: String,
        platformId: String,
        uploadDir: String,
        maxSize: {
            type: Number,
            default: 1, // Mo
        },
        supportedExt: {
            type: Array,
            default: [],
        },
    },
    data() {
        return {
        };
    },
    computed: {
        attachments() {
            let attachments = this.$store.getters["platforms/getAttachments"](this.platformId);
            return Object.fromEntries(
                Object.entries(attachments).filter(([key, file]) => file.action !== "delete"),
            );
        },
    },
    methods: {
        updateModelValue(newValue) {
            this.$emit("update:modelValue", newValue);
        },
        deleteFile(filePath, fileName) {
            this.$store.commit("platforms/deleteAttachment", {
                platformId: this.platformId,
                path: filePath,
                name: fileName,
            });
        },

        uploadFile() {
            document.getElementById("file-upload").click();
        },

        async loadSelectedFiles(event) {
            let selectedFiles = event.target.files;
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                // validate file
                const { valid } = await validate(file, { size: this.maxSize * 1024 * 1024, ext: this.supportedExt });

                // check if validation is successful, if not, skip this file and go to the next one
                if (!valid) {
                    continue;
                }

                // if the file passes validation, we can read it
                let reader = new FileReader();

                const fileContent = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result);
                    reader.readAsText(file);
                });

                this.$store.commit("platforms/addAttachment", {
                    platformId: this.platformId,
                    name: file.name,
                    path: `${this.uploadDir}/${file.name}`,
                    content: fileContent,
                });
            }
        }

    },
    mounted() {
        // this.$store.dispatch("platforms/getAttachments", {
        //     projectId: this.projectId,
        //     platformId: this.platformId,
        //     uploadDir: this.uploadDir,
        // });
    },
};
</script>
