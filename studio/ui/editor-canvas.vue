<template>
    <div id="editor-canvas">
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
        props: ['page'],
        data() {
            return {}
        },
    } as ComponentOptions<CanvasComponent>
</script>

<style lang="less">
    #editor-canvas {
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
