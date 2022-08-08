<template>
  <component :is="component">
    <template #prepend>
      <v-app-bar-nav-icon v-if="$mobile || !fixDrawer" @click="$emit('toggledrawer')"/>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </template>
    <!-- <template #append>
      <app-bar-user-menu/>
    </template> -->
  </component>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { appbarModule, settingModule } from '@/store';
import AppBarUserMenu from './AppBarUserMenu.vue';

@Component({
  components: {
    AppBarUserMenu,
  },
})
export default class AppBar extends Vue {
  get component() {
    return appbarModule.appbars[appbarModule.appbars.length - 1];
  }

  get title() {
    return appbarModule.title;
  }

  get fixDrawer() {
    return settingModule.fixDrawer;
  }
}
</script>
<style lang="scss" scoped>
.nav-item {
  * {
    color: inherit;
    text-decoration: none;
  }

  &.router-link-active {
    color: blue;
  }
}
</style>
