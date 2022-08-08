<template>
  <v-app-bar-nav-icon @click="toggleDrawer"/>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { viewModule } from '@/store';

@Component
export default class AppBarHamburger extends Vue {
  private toggleDrawer() {
    viewModule.SET_DRAWER(!viewModule.drawer);
  }
}
</script>
