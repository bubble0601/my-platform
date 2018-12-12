<template>
  <div id="app">
    <Navbar/>
    <section class="section py-2" :class="{ 'is-padding-less': $route.meta.fill }">
      <router-view/>
    </section>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Navbar from './containers/Navbar.vue';
import { AUTH_INIT } from './store/auth';

export default Vue.extend({
  components: {
    Navbar,
  },
});
</script>
<style lang="scss">
@import 'scss/common';
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app > .section {
  flex-grow: 1;
  background-color: #fafafa;
}
</style>
