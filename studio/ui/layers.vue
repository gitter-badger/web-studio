<template>
    <div id="ws-layers">
        layers
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        prop: ['extends', 'pages'],
        data() {
            return {}
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #ws-layers {
        width: 100%;
    }
</style>
