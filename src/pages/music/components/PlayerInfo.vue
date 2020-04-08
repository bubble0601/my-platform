<template>
  <div class="d-flex flex-column h-100">
    <v-nav v-model="tab" :items="tabs" tabs class="px-2"/>
    <div class="flex-grow-1 bg-white overflow-auto px-2">
      <template v-if="tab === 'song'">
        <div class="d-flex justify-content-center py-3">
          <b-img v-if="artwork" :src="artwork" width="128" class="shadow" @error="onLoadArtworkError"/>
          <img v-else src="@/assets/default_artwork.svg" width="128" class="shadow p-2" style="background-color: #e8e8e8;"/>
        </div>
        <div v-if="song">
          <rate :value="song.rate" :size="1.5" class="justify-content-center" @input="updateRate"/>
        </div>
        <div v-if="song" class="text-center">
          <h4 class="mb-1">{{ song.title }}</h4>
        </div>
        <div v-if="song" class="text-center overflow-auto pb-3">
          <small>
            <span>{{ song.artist }} / {{ song.album }}</span><span v-if="song.year">({{ song.year }})</span>
          </small>
          <small v-if="lyrics" class="lyrics d-block pre mt-2">
            {{ lyrics }}
          </small>
        </div>
      </template>
      <b-list-group v-else-if="tab === 'queue'" flush :class="{ 'border-bottom': queue.length }">
        <b-list-group-item v-for="(song, i) in queue" :key="`${i}-${song.id}`" href="#"
                           draggable="true" class="d-flex align-items-center py-2 pl-1 pr-3"
                           @dragstart="dragging = { index: i, song }"
                           @dragenter.self="onDragEnter(i)"
                           @dragend="onDragOver">
          <b-icon icon="list" font-scale="1.6" class="mover text-muted mr-1"/>
          <div class="song-info" @mousedown.prevent @click="play(i)">
            <span>{{ song.title }}</span>
            <br>
            <small class="text-muted">{{ song.artist }} - {{ song.album }}</small>
          </div>
          <b-button-close class="ml-auto" @mousedown.prevent @click="remove(i)"/>
        </b-list-group-item>
      </b-list-group>
      <div v-else-if="tab === 'edit'" class="p-2">
        <v-field v-for="(label, k) in basicTags" :key="k" :label="cap(label)" size="sm">
          <div class="d-flex align-items-center">
            <v-input v-model="edit[k]" size="sm"/>
          </div>
        </v-field>
        <v-field v-for="(v, k) in filteredEdit" :key="k" :label="k" size="sm">
          <div class="d-flex align-items-center">
            <v-input v-model="edit[k]" size="sm"/>
            <b-button-close class="ml-1" @click="deleteTag(k)"/>
          </div>
        </v-field>
        <div class="d-flex my-2">
          <b-button variant="outline-danger" class="mr-auto" @click="setEdit">Cancel</b-button>
          <b-button variant="success" @click="save">Save</b-button>
        </div>
        <div class="mt-1 mb-2">
          <b-button variant="warning" class="mr-2" @click="fix">Fix</b-button>
          <b-button variant="danger" class="mr-2" @click="deleteSong">Delete</b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as mm from 'music-metadata-browser';
import { capitalize, clone, find, isEmpty, omitBy, pick } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { VNav, VForm, Rate } from '@/components';
import { Dict } from '@/types';

@Component({
  components: {
    VNav,
    VForm,
    Rate,
  },
})
export default class PlayerInfo extends Vue {
  private tab = 'song';
  private tag: mm.IAudioMetadata | null = null;
  private artwork: string | null = null;
  private queue: Song[] = [];
  private dragging: { index: number, song: Song } | null = null;
  private edit: Dict<string> = {};
  private readonly basicTags = {
    TIT2: 'title',
    TPE1: 'artist',
    TPE2: 'album_artist',
    TALB: 'album',
    TYER: 'year',
    TRCK: 'track',
    TPOS: 'disc',
  };
  private readonly cap = capitalize;

  get tabs() {
    return [
      { key: 'song', title: 'Song' },
      { key: 'queue', title: 'Queue' },
      { key: 'edit', title: 'Edit' },
    ];
  }

  get song() {
    return musicModule.current;
  }

  get audioData() {
    return musicModule.audioData;
  }

  get lyrics() {
    if (this.tag) {
      const uslt = find(this.tag.native['ID3v2.3'], { id: 'USLT' });
      if (uslt) {
        return uslt.value.text;
      }
    }
  }

  get realQueue() {
    return musicModule.queue;
  }

  get filteredEdit() {
    // TSSE(Software/Hardware and settings used for encoding) is automatically added by ffmpeg
    const excludedTags = Object.keys(this.basicTags).concat(['TSSE']);
    return omitBy(this.edit, (v, k) => excludedTags.includes(k));
  }

  @Watch('audioData')
  private onDataChanged() {
    if (this.audioData) {
      mm.parseBlob(this.audioData).then((metadata: mm.IAudioMetadata) => {
        this.tag = metadata;
        this.setEdit();
      }).catch(() => {
        musicModule.SET_CURRENT(null);
      });
    } else {
      this.tag = null;
    }
  }

  @Watch('realQueue', { immediate: true })
  private onQueueChanged() {
    this.queue = clone(this.realQueue);
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

  // Song
  private onLoadArtworkError() {
    this.artwork = null;
  }

  private async updateRate(val: number) {
    if (!this.song) return;
    const id = this.song.id;
    await musicModule.UpdateSong({ id, data: { rate: val } });
    if (musicModule.playlistId === null) {
      musicModule.ReloadSong(id);
    } else {
      musicModule.ReloadPlaylistSong(id);
    }
  }

  // Queue
  private play(i: number) {
    musicModule.PlayFromQueue(i);
  }

  private remove(i: number) {
    musicModule.REMOVE_FROM_QUEUE(i);
  }

  private onDragEnter(i: number) {
    if (!this.dragging) return;
    const temp = this.queue[i];
    this.$set(this.queue, i, this.queue[this.dragging.index]);
    this.$set(this.queue, this.dragging.index, temp);
    this.dragging.index = i;
  }

  private onDragOver() {
    musicModule.SET_QUEUE(this.queue);
  }

  // Edit
  private setEdit() {
    this.edit = {};
    if (this.tag) {
      const tags = this.tag.native['ID3v2.3'] || this.tag.native['ID3v2.4'];
      if (!tags) return;
      tags.forEach((t) => {
        if ('string' !== typeof t.value) return true;
        this.$set(this.edit, t.id, t.value);
      });
    }
  }

  private deleteTag(k: string) {
    this.$delete(this.edit, k);
  }

  private async save() {
    const song = musicModule.current;
    if (!song) return;
    await musicModule.UpdateSongTag({ id: song.id, data: this.edit });
    if (musicModule.playlistId === null) {
      await musicModule.ReloadSong(song.id);
    } else {
      await musicModule.ReloadPlaylistSong(song.id);
    }
  }

  private fix() {
    if (!this.song) return;
    musicModule.Fix(this.song.id);
  }

  private deleteSong() {
    this.$confirm('Do you really delete this song?').then(() => {
      if (!this.song) return;
      musicModule.DeleteSong(this.song.id);
      musicModule.PlayNext();
    });
  }
}
</script>
<style lang="scss" scoped>
.lyrics {
  font-size: 11px;
}
.list-group-item {
  cursor: default;
  .mover {
    cursor: move;
  }
  .song-info {
    cursor: pointer;
    line-height: 1.2;
    width: 85%;
  }
  form {
    font-size: 12px;
  }
  small {
    font-size: 11px;
  }
}
</style>
