<template>
  <div id="app">
    <Navbar/>
    <section class="section">
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
  created() {
    this.$store.dispatch(AUTH_INIT);
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
}
</style>
