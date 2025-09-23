<template>
    <section class="fr-accordion">
        <h3 class="fr-accordion__title">
            <button
                :class="['fr-accordion__btn', {'fr-accordion__btn--error': state === 'error'},
                caretPosition ? `fr-accordion__btn-${caretPosition}` : '',
                `fr-accordion__btn fr-btn--${size}`, 'fr-py-0']"
                data-fr-js-collapse-button="true"
                type="button" data-fr-js-accordion-button-actionee="true"
                :aria-expanded="isOpen"
                :aria-controls="`accordion-${uid}`"
                @click="toggleAccordion">
                <div style="display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 0;
                    padding: 0;
                    width: 100%;">
                    <div class="fr-col-6">
                        <i v-if="iconName" :class="[ iconName,  'fr-mr-1w' ]"></i>
                        {{ label }}
                    </div>

                    <div class="fr-col-4 fr-text--xs" style="text-align: right;" v-html="description">
                    </div>
                    <div style="display: inline-block; justify-content: flex-end;">
                        <slot name="buttons" :class="{'fr-accordion__btn--error': state === 'error'}"></slot>
                    </div>
                </div>
                <!--                <div v-if="error" class="fr-col-1 fr-text-secondary"><fr-icon name="warning-line" /></div>-->
            </button>
        </h3>
        <div :id="`accordion-${uid}`" :class="{'fr-collapse': true, 'fr-collapse--expanded': isOpen}"
             :style="(isOpen ? 'max-height: none;' : '') + ' padding: 0; margin: 0;'">
            <slot></slot>
        </div>
    </section>
</template>
<style scoped>
.fr-accordion__btn.fr-accordion__btn--error {
    color: var(--text-active-red-marianne)
}

.fr-accordion__btn.fr-accordion__btn--error[aria-expanded="true"] {
    background-color: var(--background-action-low-red-marianne);
}
.fr-accordion__btn::before,.fr-accordion__btn::after {
    display: none;
}
.fr-accordion__btn-before::before, .fr-accordion__btn-after::after {
    --icon-size: 1rem;
    background-color: currentColor;
    content: "";
    display: inline-block;
    flex: 0 0 auto;
    height: var(--icon-size);
    margin-left: auto;
    margin-right: 10px;
    -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJtMTIgMTMuMTcyIDQuOTUtNC45NSAxLjQxNCAxLjQxNEwxMiAxNiA1LjYzNiA5LjYzNiA3LjA1IDguMjIybDQuOTUgNC45NVoiLz48L3N2Zz4=);
    mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJtMTIgMTMuMTcyIDQuOTUtNC45NSAxLjQxNCAxLjQxNEwxMiAxNiA1LjYzNiA5LjYzNiA3LjA1IDguMjIybDQuOTUgNC45NVoiLz48L3N2Zz4=);
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    transition: transform .3s;
    vertical-align: calc((.75em - var(--icon-size)) * .5);
    width: var(--icon-size);
}


.fr-accordion__btn[aria-expanded="true"]::after,
.fr-accordion__btn[aria-expanded="true"]::before {
    /* Appliquer une transformation pour "tourner" l'icône lorsqu'elle est ouverte */
    transform: scaleY(-1);
}
</style>
<script>

export default {
    props: {
        label: { type: String, required: true },
        description: String,
        state: {
            type: String,
            validator: function(value) {
                const validStates = ["error", ""];
                return validStates.includes(value);
            },
        },
        iconName: { type: String, default: "" },
        error: Boolean,
        size: { type: String, default: "md" },
        caretPosition: {
            type: String,
            default: 'after', // Par défaut, le caret est après le texte
            validator: function(value) {
                return ['before', 'after', ''].includes(value);
            },
        },
        open: { type: Boolean, default: false },
        allAccordionsState: String,
    },
    data() {
        return {
            uid: Math.random().toString(36).substr(2, 16),
            isOpen: this.open,
        };
    },
    methods: {
        toggleAccordion() {
            this.isOpen = !this.isOpen;
        },
    },
    watch: {
        allAccordionsState(newVal) {
            this.isOpen = newVal === 'open';
        },
    },

};
</script>