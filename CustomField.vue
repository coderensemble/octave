<template>
    <custom-input v-if="type === 'input'"
                 isRequired
                 :modelValue="modelValue"
                 :label="label"
                 :tooltip="tooltip"
                 :is-required="mandatory"
                 type="text"
                 :name="name"
                 @update:modelValue="updateValue"
                 :rules="{regex: rules}"
                 validateOnChange

    />
    <custom-select v-else-if="type === 'select'"
                   v-bind="{...$attrs}"
                   :modelValue="modelValue"
                   :label="label"
                   :name="name"
                   @update:modelValue="updateValue"
                   :options="options? options.map(option => ({ label: option, value: option })) : []"
    />
    <fr-toggle v-else-if="type === 'toggle'"
               v-bind="{...$attrs}"
               :modelValue="modelValue.toString() === options[0].toString()"
               :label="label"
               @update:modelValue="updateValue"
               checkedLabel=""
               unCheckedLabel=""
    />
</template>


<script>
import CustomInput from "@/components/Octave/CustomInput.vue";
import CustomSelect from "@/components/Octave/CustomSelect.vue";
import { Form, defineRule, Field, useField } from "vee-validate";

defineRule("regex", (value, [regex, error]) => {
    return (!regex || new RegExp(`^${regex}$`).test(value)) || error;
});

export default {
    data() {
        return {};
    },
    components: { CustomInput, CustomSelect, Field },
    methods: {
        updateValue(value) {
            if (this.type === "toggle") {
                value = value === true ? this.options[0] : this.options[1];
            }
            this.$emit("update:modelValue", value);  // émet l'event update:modelValue
        },
    },

    props: {
        modelValue: {
            type: [String, Boolean],
            default: "",
        },
        name: {
            type: String,
            required: true,
        },
        tooltip: String,
        mandatory: Boolean,
        size: String,
        label: String,
        type: {
            type: String,
            validator: function(value) {
                return ["toggle", "input", "select", "checkbox"].includes(value);
            },
            required: true,
        },
        rules: {
            type: String,

        },
        options: [Array, Object],
    },
};
</script>