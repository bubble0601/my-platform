<template>
  <div id="app">
    <Navbar/>
    <section>
      <router-view/>
    </section>
    <Footer/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Navbar, Footer } from './layout';

@Component({
  components: {
    Navbar,
    Footer,
  },
})
export default class App extends Vue {}
</script>
<style lang="scss">
@import 'assets/scss/common';
#app {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

#app > section {
  flex-grow: 1;
  background-color: #fafafa;
}
</style>
