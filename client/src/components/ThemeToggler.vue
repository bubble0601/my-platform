<template>
  <v-btn v-if="!listItem" icon @click="darkTheme = !darkTheme">
    <v-icon v-text="darkTheme ? 'dark_mode' : 'light_mode'"/>
  </v-btn>
  <v-list-item v-else link @click="darkTheme = !darkTheme">
    <v-list-item-icon>
      <v-icon v-text="darkTheme ? 'dark_mode' : 'light_mode'"/>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>ダークモード</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action class="my-0">
      <v-switch v-model="darkTheme" hide-details @click.stop/>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class ThemeToggler extends Vue {
  @Prop({ type: Boolean, default: false })
  private listItem!: boolean;

  get darkTheme() {
    return this.$vuetify.theme.dark;
  }

  set darkTheme(val) {
    this.$vuetify.theme.dark = val;
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
    localStorage.setItem('theme', val ? 'dark' : 'light');
  }
}
</script>
