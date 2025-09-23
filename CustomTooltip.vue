<template>

        <button
            type="button"
            :id="`btn-${id}`"
            class="fr-btn fr-btn--tooltip"
            :aria-describedby="`span-${id}`"
            @click="toggleTooltip"
            ref="button"
        ></button>
        <span
            :id="`span-${id}`"
            :class=tooltipClasses
            role="tooltip"
            :style="tooltipStyle"
            :aria-hidden="`${!tooltipVisible}`"
            ref="tooltip"
            v-html="tooltipText"
        >
        </span>
</template>

<script>
export default {
    name: 'CustomTooltip',
    props: {
        tooltipText: {
            type: String,
            required: true,
        }
    },
    data() {
        return {
            tooltipVisible: false,
            id: this.generateUid(),
            tooltipStyle: {},
            placement: 'top'

        }
    },
    computed: {
        tooltipClasses() {
            let classes = 'fr-tooltip fr-placement';
            classes += ` fr-placement--${this.placement}`;  // Use the data property for placement
            classes += this.tooltipVisible ? ' fr-tooltip--shown' : '';
            return classes;
        },

    },
    mounted() {
        window.addEventListener('scroll', this.updateTooltipPosition);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.updateTooltipPosition);
    },
    methods: {
        toggleTooltip() {
            this.tooltipVisible = !this.tooltipVisible;
            if (this.tooltipVisible) {
                this.updateTooltipPosition();
                document.addEventListener('click', this.hideTooltip);
            }

        },
        hideTooltip(event) {
            // Vérifier si le clic n'a pas eu lieu sur la tooltip ou le bouton
            if (
                event.target !== this.$refs.button &&
                event.target !== this.$refs.tooltip
            ) {
                this.tooltipVisible = false;
                document.removeEventListener('click', this.hideTooltip);
                // Event need to be removed after it is used
            }
        },
        updateTooltipPosition() {
            if(this.tooltipVisible) {
                this.$nextTick(() => {
                    const buttonRect = this.$refs.button.getBoundingClientRect();

                    let modalTop = 0;
                    const modalElement = this.$refs.button.closest('.fr-modal');
                    if (modalElement) {
                        const modalRect = modalElement.getBoundingClientRect();
                        modalTop = modalRect.top;
                    }

                    const tooltipRect = this.$refs.tooltip.getBoundingClientRect();

                    let translateY = buttonRect.top - tooltipRect.height - modalTop;

                    // If the tooltip would go off the top of the screen, set placement to 'bottom'
                    if (translateY < 0) {
                        this.placement = 'bottom';
                        translateY = buttonRect.bottom - modalTop;
                    } else {
                        this.placement = 'top';
                    }

                    const translateX = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;

                    this.tooltipStyle = {
                        transform: `translate(${translateX}px, ${translateY}px)`,
                        opacity: 1,
                        '--arrow-x': `0px`
                    };
                });
            }
        },

        generateUid() {
            return 'id-' + Math.random().toString(36).substr(2, 16);
        }
    },

}
</script>

<style scoped>
</style>