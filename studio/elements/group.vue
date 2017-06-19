<template>
    
</template>

<script lang="ts">
    import Vue, { ComponentOptions } from 'vue'

    interface GroupElement extends Vue {
        layer: WebLayer
    }

    export default {
        prop: ['layer'],
        data() {
            return {

            }
        },
        created() {
            
        }
    } as ComponentOptions<GroupElement>
</script>

<style lang="less">
    
</style>
