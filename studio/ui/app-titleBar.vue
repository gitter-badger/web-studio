<template>
    <div id="app-title-bar" style="-webkit-app-region: drag">
        <div id="app-title">
            <span>{{title}}</span>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        props: ['title'],
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #app-title-bar {
        width: 100%;
        height: 36px;
        background-color: rgba(255, 255, 255, 0.9);
        user-select: none;
        -webkit-app-region: drag;
    }
   
    #app-title {
        width: 60%;
        height: 36px;
        margin-left: 20%;
        font-size: 12px;
        text-align: center;
        line-height: 36px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        user-select: none;
        -webkit-app-region: drag;
    }
</style>
