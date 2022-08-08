<template>
  <router-view/>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { appbarModule, settingModule } from '@/store';
// import DefaultAppBar from '@/layouts/DefaultAppBar.vue';

@Component({
  // metaInfo: {
  //   titleTemplate: '%s | iBubble',
  // },
})
export default class App extends Vue {
  @Watch('$route', { immediate: true })
  private onRouteChanged() {
    for (let record of this.$route.matched.slice().reverse()) {
      const val = record.meta?.appbarTitle;
      if (typeof val === 'string') {
        appbarModule.SET_TITLE(val);
        break;
      }
    }
  }

  protected beforeCreate() {
    settingModule.Init();
    // appbarModule.PUSH(DefaultAppBar);
  }
}
</script>
<style lang="scss">
@import 'styles/main';
</style>
