export default {
    name: "IconeAleatoire",
    methods: {
        getIconeAleatoire(family) {
            const thefamily = family || "all";
            return Object.values(this.$dsfr.icons[thefamily])[
                Math.floor(Math.random() * Object.keys(this.$dsfr.icons[thefamily]).length)
            ];
        }
    }
}