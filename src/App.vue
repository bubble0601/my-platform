<template>
  <div id="app">
    <Navbar/>
    <main>
      <router-view/>
    </main>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Navbar from './containers/Navbar.vue';

@Component({
  components: {
    Navbar,
  },
})
export default class extends Vue {}
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
