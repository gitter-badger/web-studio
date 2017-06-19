<template>
    <div id="ws-welcome">
        <p>{{msg}}</p>
    </div>
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    export default {
        name: 'ws-welcome',
        data() {
            return {
                msg: 'Hello, Welcome to use Web Studio!',
            }
        }
    } as ComponentOptions<Vue>
</script>

<style lang="less">
    #ws-welcome {
        width: 100%;
    }
</style>
