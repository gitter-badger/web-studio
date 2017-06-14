<template>
  <div id="ws-preferences">
    <h1>{{msg}}</h1>
  </div>
</template>

<script lang="ts">
  import Vue from "vue"

  export default Vue.extend({
    name: 'ws-preferences',
    data () {
      return {
        msg: 'preferences...'
      }
    }
  })
</script>

<style>

</style>
