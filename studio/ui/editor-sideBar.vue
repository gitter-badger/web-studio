<template>
    <div :style="{width: sideBarWidth+'px'}" id="editor-sidebar">
        <div id="sidebar-topfill" v-show="!fullscreen"></div>
        <div id="press-button" class="icon-press" @click="$press()" title="Press" v-show="!fullscreen"></div>
        <div id="project-title" :style="{top: (fullscreen ? 18 : 48) + 'px'}">
            <div class="icon" :style="{borderColor: '#fff'}"></div>
            <div class="title">
                <span>{{web.title || documentName}}</span>
                <em v-if="edited"> &nbsp;—&nbsp; Edited</em>
                <em v-if="saving"> &nbsp;—&nbsp; Saving &middot;&middot;&middot;</em>
            </div>
        </div>
        <div id="edit-layer-tabs">
            <div class="icon icon-layers" :class="{current: editTab === 'pages'}" @click="$setEditTab('pages')" title="Pages"></div>
            <div class="icon icon-box" :class="{current: editTab === 'components'}" @click="$setEditTab('components')" title="Components"></div>
            <div class="icon icon-plugin" :class="{current: editTab === 'extensions'}" @click="$setEditTab('extensions')" title="Extensions"></div>
        </div>
        <div id="edit-layer-add" @click="$addWebObject">
            <span class="icon icon-plus-small"></span>
            <span class="text">New</span>
            <span class="text" v-if="editTab === 'pages'">Page</span>
            <span class="text" v-if="editTab === 'components'">Component</span>
            <span class="text" v-if="editTab === 'extensions'">Extension</span>
        </div>
        <div id="edit-layer-trees" :style="{width: sideBarWidth - 75 + 'px', height: windowHeight - (fullscreen ? 18 : 48+30) - 18 + 'px', top: (fullscreen ? 18 : 48+30) + 'px'}">
            <layerTree :layer="webObject" :root="webObject" :status-text="editTab === 'pages' ? webObject.routeExp : null" v-for="webObject in web[editTab]" :key="webObject.id">
                <span class="icon icon-input"></span>
                <span class="icon icon-settings"></span>
                <span class="icon icon-path"></span>
            </layerTree>
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
        },
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

            em {
                font-style: normal;
                color: #666;
            }
        }
    }

    #edit-layer-tabs {
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

    #edit-layer-add {
       position: absolute;
        top: 48px;
        left: 75px;
        width: 100%;
        height: 30px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.6);

        &:hover {
            color: #f7f7f7;
        }

        .icon {
            font-size: 16px;
            line-height: 16px;
            vertical-align: middle;
            transition: color 0.24s;
        }

        .text {
            font-size: 12px;
            transition: color 0.24s;
        }
    }

    #edit-layer-trees {
        position: absolute;
        left: 75px;
        overflow: hidden;
        overflow-y: auto;
    }
</style>
