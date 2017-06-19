<template>
    <div id="ws-canvas">
        let's draw!
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    interface CanvasComponent extends Vue {
        selection: WebLayer
        page: WebPage
    }

    export default {
        prop: ['page'],
        data() {
            return {}
        },
        created() {
            this.page
        },
    } as ComponentOptions<CanvasComponent>
</script>

<style lang="less">
    #ws-canvas {
        width: 100%;
    }
</style>
