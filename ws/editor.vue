<template>
  <div id="ws-editor">
    <h1>{{msg}}</h1>
  </div>
</template>

<script lang="ts">
  import Vue from "vue"
  
  export default Vue.extend({
    name: 'ws-editor',
    data () {
      return {
        msg: 'let\'s draw!',
      }
    }
  })
</script>

<style>

</style>
