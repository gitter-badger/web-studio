<template>
    <header id="ws-header" style="-webkit-app-region: drag">
        <h1>
            <strong>{{title}}</strong>
            <span v-if="edited">Edited</span>
        </h1>
    </header>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        props: ['title', 'edited'],
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #ws-header {
        width: 100%;
        height: 36px;
        text-align: center;
    
        h1 {
            line-height: 36px;
        }
    }
</style>
