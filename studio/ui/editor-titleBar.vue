<template>
     <div :style="[showLayers ? {width: windowWidth - leftAsideWidth + 'px', left: leftAsideWidth + 'px'} : null]" id="editor-title-bar">
        <div :class="{center: !showLayers}" id="editor-title">
            <span>{{documentTitle}}</span>
            <em v-if="page">/{{page.routeExp}}</em>
            <span v-if="edited">— Edited</span>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        props: ['documentTitle', 'page', 'edited'],
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #editor-title-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 36px;
        background-color: rgba(255, 255, 255, 0.9);
        user-select: none;
        -webkit-app-region: drag;
    }
   
    #editor-title {
        margin-left: 12px;
        width: 60%;
        height: 36px;
        font-size: 12px;
        line-height: 36px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        user-select: none;
        -webkit-app-region: drag;

        &.center {
            margin-left: 20%;
            text-align: center;
        }
    }
</style>
