import { cloneDeep } from "lodash";
import { calculateHostname, calculateHostStartIndex } from "@/services/octave.js";

export default {
    methods: {
        /* Permet d'ajouter un élément à l'edb (serveur, stockage, application) en calculant son id */
        newElementId(el, key) {
            if (!el || typeof el !== "object") {
                return 1;  // Retourner 1 si `el` est vide, undefined, ou n'est pas un objet
            } else {
                return Object.values(el).filter(item => item.modele.toLowerCase() === key.toLowerCase()).length + 1;
            }
        },
        getServers(value) {
            if (this.edb && this.edb.serveur) {
                return Object.entries(this.edb.serveur).map(([key, server]) => {
                    return {
                        description: `${key}`,
                        value: key,
                        label: server.description,
                    };
                });
            }
        },
        reorderObject(obj, newOrder) {
            const result = {};
            newOrder.forEach(key => {
                if (obj.hasOwnProperty(key)) {
                    result[key] = obj[key];
                }
            });
            return result;
        },

        countObject(catalogue, property, key) {
            return Object.values(this.edb[catalogue]).filter(el => el[property].toLowerCase() === key.toLowerCase()).length;
        },
        getData(catalogue, property, value) {
            if (!property || !value) {
                return this.edb[catalogue];
            }
            return Object.entries(this.edb[catalogue]).reduce((acc, [key, data]) => {
                if (data[property].toLowerCase() === value.toLowerCase()) {
                    acc[key] = data;
                }
                return acc;
            }, {});
        },
        filterData(el, source) {
            let obj = cloneDeep(source);
            for (let prop in obj) {
                if (prop in el) {
                    obj[prop] = el[prop];
                }
            }
            return obj;
        },
        sortedData(catalogue, property) {
            if (!this.catalogues || !this.catalogues[catalogue] || !this.edb || !this.edb[catalogue]) {
                return {};
            }

            // Collect all models from edb
            const models = Object.values(this.edb[catalogue]).map(app => app[property]);
            // Filter the keys in this.catalogues.application that exist in models
            const sortedKeys = Object.keys(this.catalogues[catalogue]).filter(key => models.some(modelKey => modelKey.toLowerCase() === key.toLowerCase())).sort();            // Map the sorted keys back into an object
            const sortedObj = {};

            sortedKeys.forEach(key => {
                sortedObj[key] = this.catalogues[catalogue][key];
            });

            return sortedObj;
        },
        validateForm() {
            this.$refs[`form-${this.tabIndex}`].validate().then(success => {
                // Émettez un événement avec les erreurs, que la validation soit réussie ou non
                this.$emit("validation-errors", this.$refs[`form-${this.tabIndex}`].errors);
            });
        },
        updateNetworks() {
            let list = [
                { name: "ADMIN", condition: () => true },
                { name: "APPLI", condition: () => true },
                {
                    name: "DATA",
                    condition: () => Object.values(this.edb.serveur).some(server => server.nom.startsWith("BD")),
                },
                {
                    name: "CLUSTER",
                    condition: () =>
                        Object.values(this.edb.serveur).some(server => server.mode === "Cluster" && server.nom !== "HAP"),
                },
                {
                    name: "REPLICATION",
                    condition: () =>
                        Object.values(this.edb.serveur).some(server => server.mode === "Cluster" && server.nom !== "HAP"),
                },
                {
                    name: "BACKUP",
                    condition: () =>
                        Object.values(this.edb.serveur).some(server => server.outils.sauvegarde === true),
                },
                {
                    name: "NAS",
                    condition: () =>
                        Object.values(this.edb.stockage).some(storage => storage.type === "nfs"),
                },
            ];

            this.edb.reseau = {};
            list.forEach((item) => {
                if (item.condition() && !this.edb.reseau[item.name]) {
                    this.edb.reseau[item.name] = { ...this.catalogues.reseau[item.name] };
                }
            });
        },
        // updateHosts() {
        //     const zone = this.edb.plateforme.zone;
        //     const servers = this.edb.serveur;
        //
        //     for (let server of Object.keys(servers)) {
        //         let hostnames = {};
        //
        //         let startIndex = calculateHostStartIndex(servers, server);
        //         for (let i = 0; i < Number(servers[server].nombre.production) + Number(servers[server].nombre.stock); i++) {
        //             const hostname = `${calculateHostname(this.edb.projet.code, zone, servers[server].code, startIndex + 1 + i)}.${this.edb.plateforme.code}`;
        //             hostnames[hostname] = {
        //                 stock: i >= Number(servers[server].nombre.production) ? 'yes' : 'no'
        //             };
        //         }
        //         servers[server].hosts = hostnames;
        //     }
        // }
    },

};
