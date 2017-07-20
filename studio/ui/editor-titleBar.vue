<template>
    <div :style="[editTab ? {width: windowWidth - sideBarWidth + 'px', left: sideBarWidth + 'px'} : null]" id="editor-title-bar" v-show="!fullscreen">
        <div :class="{center: !editTab}" class="title">
            <span v-if="currentWebObject">{{currentWebObject.name}}</span>
        </div>
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
    #editor-title-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 36px;
        border-bottom: 1px solid #e7e7e7;
        background-color: rgba(249, 249, 249, 0.9);
        -webkit-app-region: drag;

        .title {
            margin-left: 12px;
            width: 60%;
            height: 36px;
            font-size: 12px;
            line-height: 36px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            Í &.center {
                margin-left: 20%;
                text-align: center;
            }
        }
    }
</style>
