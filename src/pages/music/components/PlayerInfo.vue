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
          <b-img v-if="coverArtUrl" :src="coverArtUrl" width="128" class="shadow"/>
          <img v-else src="@/assets/default_cover_art.svg" width="128" class="shadow p-2" style="background-color: #e8e8e8;"/>
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
        <b-list-group-item v-for="(song, i) in partQueue" :key="`${i}-${song.id}`" href="#"
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
        <b-list-group-item v-if="queue.length === 0" class="text-muted mt-2">
          Empty queue
        </b-list-group-item>
      </b-list-group>
      <div v-else-if="tab === 'info'" class="p-2">
        <dl v-if="song">
          <dt>Title</dt>
          <dd>{{ song.title }}</dd>
          <dt>Artist</dt>
          <dd :class="{ 'text-muted': song.artist.id === null }">{{ song.artist.name }}</dd>
          <dt>Album</dt>
          <dd :class="{ 'text-muted': song.album.id === null }">{{ song.album.title }}</dd>
          <dt>Album artist</dt>
          <dd :class="{ 'text-muted': !song.album.artist }">{{ song.album.artist }}</dd>
          <dt>Year</dt>
          <dd>{{ song.year || '&nbsp;' }}</dd>
          <dt>Play time</dt>
          <dd>{{ formatTime(song.time) }}</dd>
          <dt>Created date</dt>
          <dd>{{ song.created_at }}</dd>
          <dt>File size</dt>
          <dd>{{ filesize || '&nbsp;' }}</dd>
          <dt>Codec</dt>
          <dd>{{ format.codec }}</dd>
          <dt>Bitrate</dt>
          <dd>{{ format.bitrate ? `${(format.bitrate / 1000).toFixed(1)}kbps` : '&nbsp;' }}</dd>
          <dt>Sampling rate</dt>
          <dd>{{ format.sample_rate ? `${format.sample_rate / 1000}kHz` : '&nbsp;' }}</dd>
          <dt>Tag types</dt>
          <dd>{{ format.tag_type || '&nbsp;' }}</dd>
        </dl>
        <div class="mt-1">
          <b-dropdown split variant="success" text="Edit" @click="editSong()">
            <b-dropdown-item @click="editSong('tag')">Tag</b-dropdown-item>
            <b-dropdown-item @click="editSong('lyrics')">Lyrics</b-dropdown-item>
            <b-dropdown-item @click="editSong('artwork')">Artwork</b-dropdown-item>
          </b-dropdown>
        </div>
        <div class="my-2">
          <b-button variant="danger" @click="deleteSong">Delete</b-button>
        </div>
      </div>
    </div>
    <song-info-dialog ref="songInfoDialog"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator';
import { Dictionary, clone, find, isEmpty, omitBy, pick, toInteger } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { VNav, Rate } from '@/components';
import { formatTime, formatBytes } from '@/utils';
import SongInfoDialog from './SongInfoDialog.vue';

@Component({
  components: {
    VNav,
    Rate,
    SongInfoDialog,
  },
})
export default class PlayerInfo extends Vue {
  private readonly formatTime = formatTime;
  private tab = 'song';
  private readonly tabs = [
      { key: 'song', title: 'Song' },
      { key: 'queue', title: 'Queue' },
      { key: 'info', title: 'Info' },
  ];

  private queue: Song[] = [];
  private dragging: { index: number, song: Song } | null = null;

  get song() {
    return musicModule.current;
  }

  get audioData() {
    return musicModule.audioData;
  }

  get metadata() {
    return musicModule.audioMetadata;
  }

  // TODO: load on scroll
  get partQueue() {
    return this.queue.slice(0, 100);
  }

  get realQueue() {
    return musicModule.queue;
  }

  get format() {
    if (this.metadata) {
      return this.metadata.format;
    }
    return {};
  }

  get coverArtUrl() {
    if (this.metadata) {
      return this.metadata.tags.cover_art_url;
    }
    return null;
  }

  get lyrics() {
    if (this.metadata) {
      return this.metadata.tags.lyrics;
    }
    return null;
  }

  get duration() {
    if (this.metadata) {
      const d = Math.floor(this.metadata.format.length);
      return formatTime(d);
    }
  }

  get filesize() {
    if (this.audioData) {
      return formatBytes(this.audioData.size);
    }
  }

  @Ref() private songInfoDialog!: SongInfoDialog;

  @Watch('realQueue', { immediate: true })
  private onQueueChanged() {
    this.queue = clone(this.realQueue);
  }

  // Song
  private async updateRate(val: number) {
    if (!this.song) return;
    const id = this.song.id;
    await musicModule.UpdateSong({ id, data: { rate: val } });
    musicModule.ReloadSong(id);
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
  private editSong(nav = 'info') {
    if (!this.song) return;
    const songs = [this.song].concat(this.queue);
    this.songInfoDialog.open(songs, 0, nav);
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
