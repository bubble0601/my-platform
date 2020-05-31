<template>
  <div class="player-info">
    <v-nav v-model="tab" :items="tabs" tabs class="bg-light px-2">
      <template #nav-start v-if="$mobile">
        <b-icon icon="chevron-down" font-scale="1.5" class="text-secondary ml-2 mr-3" @click="$emit('close')"/>
      </template>
    </v-nav>
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
            <span>{{ song.artist.name }} / {{ song.album.title }}</span><span v-if="song.year">({{ song.year }})</span>
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
            <small class="text-muted">{{ song.artist.name }} - {{ song.album.title }}</small>
          </div>
          <b-button-close class="ml-auto" @mousedown.prevent @click="remove(i)"/>
        </b-list-group-item>
      </b-list-group>
      <div v-else-if="tab === 'info'" class="p-2">
        <v-field v-for="(label, k) in basicTags" :key="k" :label="label" size="sm">
          <div class="d-flex align-items-center">
            <v-input v-model="edit[k]" size="sm"/>
          </div>
        </v-field>
        <v-field v-for="(v, k) in otherTags" :key="k" :label="k" size="sm">
          <div class="d-flex align-items-center">
            <v-input v-model="edit[k]" size="sm"/>
            <b-button-close class="ml-1" @click="deleteTag(k)"/>
          </div>
        </v-field>
        <div class="d-flex my-2">
          <b-button variant="outline-danger" class="mr-auto" @click="setEdit">Cancel</b-button>
          <b-button variant="success" @click="save">Save</b-button>
        </div>
        <div v-if="tag" class="my-2">
          <b-button variant="info" @click="formatInfoVisible = !formatInfoVisible">
            {{ formatInfoVisible ? 'Hide' : 'Show' }} format info
          </b-button>
          <b-collapse v-model="formatInfoVisible" class="mt-2">
            <b-card no-body class="p-2">
              <b-card-text>
                <span>{{ tag.format.codec }} / {{ tag.format.codecProfile }}</span><br>
                <span>{{ (tag.format.bitrate / 1000).toFixed(1) }}kbps / {{ tag.format.sampleRate / 1000 }}kHz</span><br>
                <span>{{ duration }} / {{ filesize }}</span><br>
                <span>Tags: {{ tag.format.tagTypes.join(', ') }}</span>
              </b-card-text>
            </b-card>
          </b-collapse>
        </div>
        <div class="mt-1 mb-2">
          <!-- <b-button v-b-tooltip.hover title="Fix playtime or bitrate" variant="warning" class="mr-2" @click="fix">Fix</b-button> -->
          <b-button variant="danger" class="mr-2" @click="deleteSong">Delete</b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as mm from 'music-metadata-browser';
import { clone, find, isEmpty, omitBy, pick, toInteger } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { VNav, Rate } from '@/components';
import { Dict } from '@/types';
import { formatTime, formatBytes } from '@/utils';

@Component({
  components: {
    VNav,
    Rate,
  },
})
export default class PlayerInfo extends Vue {
  private tab = 'song';
  private readonly tabs = [
      { key: 'song', title: 'Song' },
      { key: 'queue', title: 'Queue' },
      { key: 'info', title: 'Info' },
  ];
  private tag: mm.IAudioMetadata | null = null;

  private artwork: string | null = null;

  private queue: Song[] = [];
  private dragging: { index: number, song: Song } | null = null;

  private formatInfoVisible = false;
  private edit: Dict<string | null> = {};

  get song() {
    return musicModule.current;
  }

  get audioData() {
    return musicModule.audioData;
  }

  get id3Version() {
    if (this.tag) {
      if (this.tag.native['ID3v2.4']) return 'ID3v2.4';
      else if (this.tag.native['ID3v2.3']) return 'ID3v2.3';
    }
    return null;
  }

  get lyrics() {
    if (this.tag && this.id3Version) {
      const uslt = find(this.tag.native[this.id3Version], { id: 'USLT' });
      if (uslt) {
        return uslt.value.text;
      }
    }
  }

  get realQueue() {
    return musicModule.queue;
  }

  get basicTags() {
    if (this.id3Version === 'ID3v2.3') {
      return {
        TIT2: 'Title',
        TPE1: 'Artist',
        TPE2: 'Album artist',
        TALB: 'Album',
        TYER: 'Year',
        TRCK: 'Track',
        TPOS: 'Disc',
      };
    }
    return {
      TIT2: 'Title',
      TPE1: 'Artist',
      TPE2: 'Album artist',
      TALB: 'Album',
      TDRC: 'Year',
      TRCK: 'Track',
      TPOS: 'Disc',
    };
  }

  get otherTags() {
    const excludedTags = Object.keys(this.basicTags);
    return omitBy(this.edit, (v, k) => excludedTags.includes(k) || v === null);
  }

  get duration() {
    if (this.tag?.format.duration) {
      const d = Math.floor(this.tag.format.duration);
      return formatTime(d);
    }
  }

  get filesize() {
    if (this.audioData) {
      return formatBytes(this.audioData.size);
    }
  }

  @Watch('audioData')
  private onDataChanged() {
    if (this.audioData) {
      mm.parseBlob(this.audioData).then((metadata) => {
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
    if (this.tag && this.id3Version) {
      const art = find(this.tag.native[this.id3Version], { id: 'APIC' });
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

  // Info
  private setEdit() {
    this.edit = {};
    if (this.tag && this.id3Version) {
      const tags = this.tag.native[this.id3Version];
      if (!tags) return;
      tags.forEach((t) => {
        if ('string' !== typeof t.value) return true;
        this.$set(this.edit, t.id, t.value);
      });
    }
  }

  private deleteTag(k: string) {
    this.edit[k] = null;
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

  // private fix() {
  //   if (!this.song) return;
  //   musicModule.Fix(this.song.id);
  // }

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
.player-info {
  display: flex;
  flex-direction: column;
}
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
