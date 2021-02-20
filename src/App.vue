<template>
  <div id="app">
    <navbar/>
    <section>
      <router-view/>
    </section>
    <footer-component/>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Navbar, Footer as FooterComponent } from '@/layout';
import { settingModule } from '@/store';

@Component({
  components: {
    Navbar,
    FooterComponent,
  },
})
export default class App extends Vue {
  protected beforeCreate() {
    settingModule.Init();
  }
}
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
