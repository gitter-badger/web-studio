<template>
    <div id="editor-inspector">
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #editor-inspector {
        position: absolute;
        top: 0;
        right: 0;
        width: 270px;
        height: 100%;
        background-color: #e7e7e7;
    }
</style>
