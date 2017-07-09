<template>
    <div :style="{width: leftAsideWidth+'px'}" id="editor-layers">
        <div id="editor-layers-topfill"></div>
        <div id="editor-press-button" class="icon-press" @click="$emit('press')" title="Press"></div>
        <div id="editor-project-title">
            <div id="project-icon" :style="{borderColor: '#fff'}"></div>
            <div id="project-title">
                {{documentName}}
                <span v-if="edited"> &nbsp;—&nbsp; Edited</span>
            </div>
        </div>
        <div id="editor-project-layer" :style="{width: leftAsideWidth - 90 + 'px'}">
            <div id="editor-project-pages" class="project-layer-tree">
                <div class="layer-tree-header">
                    <div class="title" @click="$noRecordUpdateWeb(web, 'pagesCollapsed', !web.pagesCollapsed)">
                        <span :class="'icon-arrow-' + (web.pagesCollapsed ? 'collapse' : 'expand')"></span>
                        <strong>Pages</strong>
                    </div>
                    <div class="actions"></div>
                </div>
                <div class="layer-tree">
                </div>
            </div>
    
            <strong>Components</strong>
            <br>
            <strong>Extends</strong>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        props: ['web'],
        data() {
            return {
                pagesTreeCollapsed: true,
                componentsTreeCollapsed: true,
                extendsTreeCollapsed: true,
            }
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #editor-layers {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-color: #212121;
        overflow: hidden;
        overflow-y: auto;
    }
    
    #editor-layers-topfill {
        width: 100%;
        height: 50px;
        background-color: transparent;
        -webkit-app-region: drag;
    }
    
    #editor-press-button {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 15px;
        color: #ccc;
        cursor: pointer;
        transition: color 0.3s;
    
        &:hover {
            color: #fff;
        }
    }
    
    #editor-project-title {
        position: absolute;
        top: 50px;
        left: 15px;
    }
    
    #project-icon {
        display: inline-block;
        width: 32px;
        height: 32px;
        border: 2px solid #fff;
        border-radius: 21px;
        background-color: #ccc;
        overflow: hidden;
    }
    
    #project-title {
        margin-top: 9px;
        line-height: 36px;
        font-size: 14px;
        writing-mode: vertical-rl;
        color: rgba(255, 255, 255, 0.6);
    
        span {
            color: rgba(255, 255, 255, 0.33);
        }
    }
    
    #editor-project-layer {
        position: absolute;
        top: 50px;
        left: 75px;
        color: rgba(255, 255, 255, 0.6);
    }
</style>
