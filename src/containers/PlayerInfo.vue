<template>
  <div class="d-flex flex-column h-100">
    <v-nav v-model="tab" :items="tabs" tabs class="px-2"/>
    <div class="flex-grow-1 bg-white overflow-auto">
      <template v-if="tab === 'song'">
        <div class="d-flex justify-content-center py-3">
          <b-img v-if="artwork" :src="artwork" width="128" class="shadow" @error="onLoadArtworkError"/>
          <img v-else src="../assets/default_artwork.svg" width="128" class="shadow p-2" style="background-color: #e8e8e8;"/>
        </div>
        <div v-if="song" class="text-center">
          <h4 class="mb-1">{{ song.title }}</h4>
        </div>
        <div v-if="song" class="text-center overflow-auto">
          <small>
            <span>{{ song.artist }} / {{ song.album }}</span><span v-if="song.year">({{ song.year }})</span>
          </small>
          <small v-if="lyrics" class="lyrics d-block pre mt-2">
            {{ lyrics }}
          </small>
        </div>
      </template>
      <b-list-group v-else-if="tab === 'queue'" flush :class="{ 'border-bottom': queue.length }">
        <b-list-group-item v-for="song in queue" :key="song.id">{{ song.title }}</b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as mm from 'music-metadata-browser';
import { find } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { VNav } from '@/components';

@Component({
  components: {
    VNav,
  },
})
export default class PlayerInfo extends Vue {
  private tab = 'song';
  private tag: mm.IAudioMetadata | null = null;
  private artwork: string | null = null;

  get tabs() {
    return [
      { key: 'song', title: 'Song' },
      { key: 'queue', title: 'Queue' },
    ];
  }

  get song() {
    if (musicModule.filename) {
      mm.fetchFromUrl(musicModule.filename, { native: true, duration: true }).then((metadata) => {
        this.tag = metadata;
      }).catch(() => {
        musicModule.SET_CURRENT(null);
      });
    }
    return musicModule.current;
  }

  get lyrics() {
    if (this.tag) {
      const uslt = find(this.tag.native['ID3v2.3'], { id: 'USLT' });
      if (uslt) {
        return uslt.value.text;
      }
    }
  }

  get queue() {
    return musicModule.queue;
  }

  @Watch('tag')
  private onTagUpdated(tag: mm.IAudioMetadata | null) {
    if (this.tag) {
      const art = find(this.tag.native['ID3v2.3'], { id: 'APIC' });
      if (art) {
        const type = art.value.format.includes('image/jpeg') ? 'image/jpeg' : 'image/png';
        const blob = new Blob([art.value.data], { type });
        const oURL = URL.createObjectURL(blob);
        this.artwork = oURL;
        return;
      }
    }
    this.artwork = null;
  }

  private onLoadArtworkError() {
    this.artwork = null;
  }
}
</script>
<style lang="scss" scoped>
.lyrics {
  font-size: 11px;
}
</style>
