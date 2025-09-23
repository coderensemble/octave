export default {
    data() {
        return {
            allAccordionsState: 'clos',
        };
    },
    methods: {
        toggleAllAccordions() {
            if (this.allAccordionsState === 'open') {
                this.allAccordionsState = 'closed';
            } else {
                this.allAccordionsState = 'open';
            }
        },
    }
};