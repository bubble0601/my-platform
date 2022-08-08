<template>
  <v-app>
    <drawer/>

    <!-- <v-slide-y-transition>
      <contextual-app-bar v-if="showCab" @toggledrawer="drawer = !drawer"/>

      <app-bar v-else :title="title" :items="items" @toggledrawer="drawer = !drawer"/>
    </v-slide-y-transition> -->
    <!-- <app-bar @toggledrawer="drawer = !drawer"/> -->

    <v-main>
      <!-- <slot/> -->
      <router-view :style="contentStyle"/>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import AppBar from '@/layouts/AppBar.vue';
import Drawer from '@/layouts/Drawer.vue';

// interface NavItem {
//   icon: string;
//   title: string;
//   to: string;
// }

@Component({
  components: {
    AppBar,
    Drawer,
  },
})
export default class FillHeightLayout extends Vue {
  // private drawer = false;
  // private items: NavItem[] = [
  //   { icon: 'music_note', title: 'Music', to: '/music' },
  //   { icon: 'description', title: 'Note', to: '/note' },
  // ];
  private contentStyle: Record<string, unknown> = {};

  get mobile() {
    return this.$vuetify.breakpoint.mobile;
  }

  @Watch('$vuetify.application', { immediate: true, deep: true })
  private onApplicationSizingChanged() {
    this.updateHeight();
  }

  protected created() {
    window.addEventListener('resize', this.updateHeight);
  }

  protected beforeDestroy() {
    window.removeEventListener('resize', this.updateHeight);
  }

  private updateHeight() {
    const app = this.$vuetify.application;
    const h = app.top + app.bottom + app.footer + app.insetFooter;
    this.$set(this.contentStyle, 'height', `${window.innerHeight - h}px`);
  }
}
</script>
<style lang="scss" scoped>
#app {
  overflow-y: hidden;
}
</style>
