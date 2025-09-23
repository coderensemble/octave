export default {
    methods: {
        addRow(app, appKey) {
            // Let's get the model structure of a row from our catalogues
            const code = this.getDefaultCode(this.catalogues?.application?.[app.modele.toUpperCase()].params, { "class": app.modele.toLowerCase() });
            app.code.push(code);
            this.$emit('validateRow');
        },
        deleteRow(app, appKey, lineIndex) {
            // Remove the row at lineIndex
            app.code.splice(lineIndex, 1);
            this.$emit('validateRow');
        },
        getDefaultCode(params, kwargs) {
            // Obtenez la liste des clés de `params`
            const params_keys = Object.keys(params);

            // Créez un nouvel objet `defaultCode` en réduisant les `params_keys`
            const defaultCode = params_keys.reduce((obj, key) => {
                // Vérifiez si le type est 'toggle' et si c'est le cas, utilisez la deuxième valeur de 'options' comme valeur par défaut
                if (params[key].type === 'toggle' && Array.isArray(params[key].options) && params[key].options.length === 2) {
                    if (params[key].default){
                        obj[key] = params[key].default;
                    }
                    else {
                        obj[key] = params[key].options[1];
                    }

                } else {
                    // Assignez la valeur par défaut si elle existe, sinon assignez une chaîne vide
                    obj[key] = params[key].default ? params[key].default.toString() : "";
                }
                return obj;
            }, {});

            // Renvoyez un nouvel objet combinant `kwargs` et `defaultCode`
            return { ...kwargs, ...defaultCode };
        }
    },
};