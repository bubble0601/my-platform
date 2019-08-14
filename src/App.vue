<template>
  <div id="app">
    <Navbar/>
    <main>
      <router-view/>
    </main>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Navbar from './containers/Navbar.vue';

export default Vue.extend({
  components: {
    Navbar,
  },
});
</script>
<style lang="scss">
@import 'assets/scss/common';
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app > main {
  flex-grow: 1;
  background-color: #fafafa;
}
</style>
