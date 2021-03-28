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
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Navbar, Footer as FooterComponent } from '@/layout';
import { settingModule } from '@/store';

@Component({
  components: {
    Navbar,
    FooterComponent,
  },
})
export default class App extends Vue {
  get theme() {
    return settingModule.theme;
  }

  @Watch('theme', { immediate: true })
  private onThemeChanged() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  protected beforeCreate() {
    settingModule.Init();
  }
}
</script>
<style lang="scss">
@import 'scss/main';

#app {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

#app > section {
  flex-grow: 1;
}
</style>
