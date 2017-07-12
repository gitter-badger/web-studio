<template>
    <div :style="{width: sideBarWidth+'px'}" id="editor-sidebar">
        <div id="sidebar-topfill" v-show="!fullscreen"></div>
        <div id="press-button" class="icon-press" @click="$emit('press')" title="Press" v-show="!fullscreen"></div>
        <div id="project-title" :style="{top: (fullscreen ? 18 : 48) + 'px'}">
            <div class="icon" :style="{borderColor: '#fff'}"></div>
            <div class="title">
                {{web.title || documentName}}
                <span v-if="edited"> &nbsp;—&nbsp; Edited</span>
            </div>
        </div>
        <div id="edit-layers-nav">
            <div class="icon icon-layers" :class="{current: showLayers === 'pages'}" @click="$showLayers('pages')"></div>
            <div class="icon icon-box" :class="{current: showLayers === 'components'}" @click="$showLayers('components')"></div>
            <div class="icon icon-plugin" :class="{current: showLayers === 'extends'}" @click="$showLayers('extends')"></div>
        </div>
        <div id="edit-layers" :style="{width: sideBarWidth - 90 + 'px', top: (fullscreen ? 18 : 48) + 'px'}">
            <div class="layer-tree" v-for="layer in web[showLayers]" :key="layer">
                <span class="icon" :class="'icon-arrow-' + (layer.collapsed ? 'collapse' : 'expand')" @click="$noRecordUpdateWeb(layer, 'collapsed', !layer.collapsed)"></span>
                <span class="title">{{layer.title}}</span>
                <div class="actions"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import layerTree from "./editor-layerTree.vue"
    import Vue, { ComponentOptions } from 'vue'

    export default {
        components: {
            layerTree,
        },
        data() {
            return {

            }
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #editor-sidebar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-color: #212121;
        overflow: hidden;
        overflow-y: auto;
    }

    #sidebar-topfill {
        width: 100%;
        height: 48px;
        background-color: transparent;
        -webkit-app-region: drag;
    }

    #press-button {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 15px;
        color: #ccc;
        cursor: pointer;
        transition: color 0.24s;

        &:hover {
            color: #fff;
        }
    }

    #project-title {
        position: absolute;
        top: 48px;
        left: 18px;

        .icon {
            width: 32px;
            height: 32px;
            border: 2px solid #fff;
            border-radius: 18px;
            background-color: #ccc;
            overflow: hidden;
        }
        .title {
            margin-top: 12px;
            line-height: 36px;
            font-size: 13px;
            writing-mode: vertical-rl;
            color: #ccc;

            span {
                color: #666;
            }
        }
    }

    #edit-layers-nav {
        position: absolute;
        bottom: 18px;
        left: 18+2px;

        .icon {
            width: 32px;
            height: 32px;
            font-size: 16px;
            line-height: 32px;
            text-align: center;
            overflow: hidden;
            color: #666;
            cursor: pointer;
            transition: color 0.24s;

            &:hover,
            &.current {
                color: #fff;
            }
        }
    }

    #edit-layers {
        position: absolute;
        top: 48px;
        left: 75px;

        .layer-tree {
            margin-bottom: 3px;

            .header {
                position: relative;
                width: 100%;

                .icon {
                    font-size: 16px;
                    line-height: 16px;
                    vertical-align: middle;
                    color: rgba(255, 255, 255, 0.6);
                    transition: color 0.24s;
                    cursor: pointer;
                }

                .text {
                    font-size: 12px;
                    line-height: 16px;
                    vertical-align: middle;
                    text-transform: uppercase;
                }

                .title {
                    color: rgba(255, 255, 255, 0.6);
                    transition: color 0.24s;



                    &:hover,
                    &.current {
                        color: #fff;
                    }
                }
            }
        }
    }
</style>
