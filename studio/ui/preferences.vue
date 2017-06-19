<template>
    <div id="ws-preferences">
        <ws-header :title="'Preferences'"></ws-header>
        <p>{{msg}}</p>
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'
    import wsHeader from './header.vue'

    export default {
        name: 'ws-preferences',
        components: {
            wsHeader
        },
        data() {
            return {
                msg: 'preferences...',
            }
        },
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #ws-preferences {
        width: 100%;
    }
</style>
