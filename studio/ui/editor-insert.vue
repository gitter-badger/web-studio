<template>
    <div id="editor-insert">
        <div class="mask" @click="collapsed=false"></div>
        <ul>
            <li>
            </li>
        </ul>
        <div class="add" @click="collapsed=!collapsed"></div>
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    interface InsertComponent extends Vue {
        collapsed: boolean
    }

    export default {
        data() {
            return {
                collapsed: false
            }
        }
    } as ComponentOptions<InsertComponent>
</script>

<style lang="less">
    #editor-insert {
        width: auto;
    }
</style>
