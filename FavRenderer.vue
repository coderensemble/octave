<template>
    <div class="renderer" @click="toggleFavorites()">
        <span>
            {{ isStarred }}
            <fr-icon :key="isStarred" :name="isStarred ? selectedIcon : unselectedIcon" />
        </span>
    </div>
</template>
<script>
export default {
    name: "FavRenderer",
    data() {
        return {
            isStarred: this.initialIsStarred(this.currentMetaRecord)
        }
    },
    props: {
        currentMetaRecord: {
            type: Object,
            default: () => ({}),
        },
        selectedIcon: String,
        unselectedIcon: String,
        initialIsStarred: Function,
        onStar: Function,
        onUnstar: Function,
    },
    methods: {
        async toggleFavorites() {
            if (this.isStarred) {
                await this.onUnstar(this.currentMetaRecord.id);
            } else {
                await this.onStar(this.currentMetaRecord.id);
            }
            this.isStarred = !this.isStarred;
        }
    }
};
</script>