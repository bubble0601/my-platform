<template>
  <v-app>
    <drawer/>

    <!-- <app-bar @toggledrawer="drawer = !drawer"/> -->

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
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
export default class DefaultLayout extends Vue {
  // private drawer = false;
  // private items: NavItem[] = [
  //   { icon: 'music_note', title: 'Music', to: '/music' },
  //   { icon: 'description', title: 'Note', to: '/note' },
  // ];
  private scrollable = false;
  private resizeObserver = new ResizeObserver(this.onBodySizeChanged);

  get mobile() {
    return this.$vuetify.breakpoint.mobile;
  }

  protected created() {
    // console.log(document.documentElement.scrollHeight);
    // document.documentElement.addEventListener('resize', () => console.log(document.documentElement.scrollHeight));
    // const resizeObserver = new ResizeObserver(() => {
    //   console.log(1);
    // });
    // this.onBodySizeChanged();
    // resizeObserver.observe(document.documentElement);
    // this.resizeObserver.observe(document.documentElement);
  }

  protected beforeDestroy() {
    this.resizeObserver.disconnect();
  }

  protected onBodySizeChanged() {
    const style = getComputedStyle(document.documentElement);
    const scrollable = document.documentElement.scrollHeight > document.documentElement.clientHeight && ['auto', 'scroll'].includes(style['overflowY']);
    if (scrollable) {
      document.documentElement.style.marginRight = '0';
      document.body.style.position = 'relative';
    } else {
      document.documentElement.style.marginRight = `15px`;
      document.body.style.position = 'relative';
    }
  }
}
</script>
<style lang="scss" scoped>
// #app.fit-height {
//   overflow-y: hidden;
//   max-height: 100vh;

//   .content {
//     overflow-y: auto;
//   }
// }
</style>
<style lang="scss">
// html, body, #app, .v-main {
//   height: 100%;
// }
</style>
