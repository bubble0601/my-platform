<template>
  <v-app-bar app dense flat>
    <slot v-if="!mobileShowSearch" name="prepend"/>

    <template v-if="!$mobile">
      <div class="flex-grow-1">
        <div style="position: absolute; width: 50%; left: 25%; transform: translateY(-50%);">
          <music-search/>
        </div>
      </div>
    </template>

    <template v-else>
      <v-btn v-if="!mobileShowSearch" key="expand" icon class="ml-auto" @click="mobileShowSearch = true">
        <v-icon>search</v-icon>
      </v-btn>
      <template v-else>
        <v-btn key="shrink" icon @click="mobileShowSearch = false">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <music-search @blur="onBlur"/>
      </template>
    </template>

    <slot name="append"/>
  </v-app-bar>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MusicSearch from './MusicSearch.vue';

@Component({
  components: {
    MusicSearch,
  },
})
export default class MusicAppBar extends Vue {
  private mobileShowSearch = false;

  private onBlur(query: string) {
    if (this.$mobile && !query) {
      this.mobileShowSearch = false;
    }
  }
}
</script>
