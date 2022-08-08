<template>
  <v-sheet class="h-100 overflow-y-auto pa-4">
    <div class="text-h5 text-center mb-4">
      <span class="font-weight-medium">{{ song.title }}</span>
      <span class="font-weight-light"> - {{ song.artist.name }}</span>
    </div>
    <div class="pre">
      {{ lyrics }}
    </div>
  </v-sheet>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { musicModule } from '@/store';

@Component
export default class LyricsView extends Vue {
  get song() {
    return musicModule.current;
  }

  get metadata() {
    return musicModule.audioMetadata;
  }

  get lyrics() {
    return this.metadata?.tags.lyrics;
  }
}
</script>
