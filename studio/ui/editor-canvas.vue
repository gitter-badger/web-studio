<template>
    <div id="editor-canvas">
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    interface CanvasComponent extends Vue {
        selection: WebLayer
        page: WebPage
    }

    export default {
        props: ['page'],
        data() {
            return {}
        },
    } as ComponentOptions<CanvasComponent>
</script>

<style lang="less">
    #editor-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
