<template>
    <div id="ws-inspector">
        inspector
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        prop: ['selection'],
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #ws-inspector {
        width: 100%;
    }
</style>
