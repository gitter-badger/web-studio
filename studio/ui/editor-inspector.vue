<template>
    <div id="editor-inspector">
        inspector
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        props: ['selection'],
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #editor-inspector {
        width: 100%;
    }
</style>
