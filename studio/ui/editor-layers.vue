<template>
    <div :style="{width: leftAsideWidth+'px'}" id="editor-layers">
        layers
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        props: ['extends', 'pages'],
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #editor-layers {
        height: 100%;
        background-color: #252c38;
        overflow: hidden;
        overflow-y: auto;
    }
</style>
