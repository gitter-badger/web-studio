<template>
  <div id="app">
    <h1>{{msg}}</h1>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data () {
      return {
        msg: 'preferences...'
      }
    }
  }
</script>

<style>
  h1 {
    font-size: 12px;
  }
</style>
