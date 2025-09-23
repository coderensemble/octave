export const formatMixin = {
    methods: {
        upperCaseFirstLetter(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        },
    },
};