<template>
    <b-modal ref="mainDialog" title="Edit song" size="lg" @hidden="$emit('hidden')">
      <v-nav v-model="nav" :items="navItems" pills no-wrap class="mb-3"/>
      <keep-alive>
        <!-- info -->
        <div v-if="nav === 'info'" class="container">
          <dl v-if="song" class="row">
            <dt class="col-sm-3">Title</dt>
            <dd class="col-sm-9">{{ song.title }}</dd>
            <dt class="col-sm-3">Artist</dt>
            <dd class="col-sm-9" :class="{ 'text-muted': song.artist.id === null }">{{ song.artist.name }}</dd>
            <dt class="col-sm-3">Album</dt>
            <dd class="col-sm-9" :class="{ 'text-muted': song.album.id === null }">{{ song.album.title }}</dd>
            <dt class="col-sm-3">Album artist</dt>
            <dd class="col-sm-9" :class="{ 'text-muted': !song.album.artist }">{{ song.album.artist }}</dd>
            <dt class="col-sm-3">Year</dt>
            <dd class="col-sm-9">{{ song.year || '&nbsp;' }}</dd>
            <dt class="col-sm-3">Rate</dt>
            <dd class="col-sm-9">
              <rate :value="song.rate" @input="updateRate"/>
            </dd>
            <dt class="col-sm-3">Play time</dt>
            <dd class="col-sm-9">{{ formatTime(song.time) }}</dd>
            <dt class="col-sm-3">Created date</dt>
            <dd class="col-sm-9">{{ song.created_at }}</dd>
            <dt class="col-sm-3">Filename</dt>
            <dd class="col-sm-9">
              <a :href="getFilepath(song)" :download="song.filename">{{ song.filename }}</a>
            </dd>
            <dt class="col-sm-3">File size</dt>
            <dd class="col-sm-9">{{ filesize ? filesize : '&nbsp;' }}</dd>
            <dt class="col-sm-3">Codec</dt>
            <dd class="col-sm-9">{{ format.codec }} / {{ format.codecProfile }}</dd>
            <dt class="col-sm-3">Bitrate</dt>
            <dd class="col-sm-9">{{ format.bitrate ? `${(format.bitrate / 1000).toFixed(1)}kbps` : '&nbsp;' }}</dd>
            <dt class="col-sm-3">Sampling rate</dt>
            <dd class="col-sm-9">{{ format.sampleRate ? `${format.sampleRate / 1000}kHz` : '&nbsp;' }}</dd>
            <dt class="col-sm-3">Tag types</dt>
            <dd class="col-sm-9">{{ format.tagTypes ? format.tagTypes.join(', ') : '&nbsp;' }}</dd>
          </dl>
        </div>
        <!-- tag -->
        <tag-editor v-else-if="nav === 'tag'" :song="song" :metadata="metadata" @updated="reload"/>
        <!-- edit -->
        <audio-editor v-else-if="nav === 'edit'" :song="song" :data="audioData" @updated="reload"/>
        <!-- lyrics -->
        <lyrics-editor v-else-if="nav === 'lyrics'" :song="song" :metadata="metadata" @updated="reload"/>
        <!-- artwork -->
        <artwork-editor v-else-if="nav === 'artwork'" :song="song" :metadata="metadata" @updated="reload"/>
      </keep-alive>
      <template #modal-footer="{ close }">
        <b-button-group class="mr-auto">
          <b-button :disabled="!prevSong" @click="prev">&lt;</b-button>
          <b-button :disabled="!nextSong" @click="next">&gt;</b-button>
        </b-button-group>
        <b-button variant="primary" @click="close">Close</b-button>
      </template>
    </b-modal>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Prop, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import axios from 'axios';
import * as mm from 'music-metadata-browser';
import { Dictionary, find, findIndex, isArray, isEmpty, omitBy } from 'lodash';
import { musicModule } from '@/store';
import { Song, getFilepath } from '@/store/music';
import { formatTime, formatBytes, waitUntil } from '@/utils';
import { VNav, Rate } from '@/components';
import TagEditor from './TagEditor.vue';
import AudioEditor from './AudioEditor.vue';
import LyricsEditor from './LyricsEditor.vue';
import ArtworkEditor from './ArtworkEditor.vue';

@Component({
  components: {
    VNav,
    Rate,
    TagEditor,
    AudioEditor,
    LyricsEditor,
    ArtworkEditor,
  },
  i18n: {
    messages: {
      ja: {
        info: '情報',
        tag: 'タグ',
        edit: '加工',
        lyrics: '歌詞',
        artwork: 'アートワーク',
      },
    },
  },
})
export default class SongInfoDialog extends Vue {
  private readonly formatTime = formatTime;
  private readonly formatBytes = formatBytes;
  private readonly getFilepath = getFilepath;

  @Ref() private mainDialog!: BModal;

  private nav = 'info';
  private songs: Song[] = [];
  private index: number = 0;
  private audioData: Blob | null = null;
  private metadata: mm.IAudioMetadata | null = null;

  get navItems() {
    return [
      { key: 'info', title: this.$t('info') },
      { key: 'tag', title: this.$t('tag') },
      { key: 'edit', title: this.$t('edit') },
      { key: 'lyrics', title: this.$t('lyrics') },
      { key: 'artwork', title: this.$t('artwork') },
    ];
  }

  get song() {
    return this.songs[this.index];
  }

  set song(song: Song) {
    this.$set(this.songs, this.index, song);
  }

  get prevSong(): Song | undefined {
    return this.songs[this.index - 1];
  }

  get nextSong(): Song | undefined {
    return this.songs[this.index + 1];
  }

  get format() {
    if (this.metadata) {
      return this.metadata.format;
    }
    return {};
  }

  get filesize() {
    if (this.audioData) {
      return formatBytes(this.audioData.size);
    }
  }

  @Ref() private searchInfoDialog!: BModal;

  @Watch('audioData')
  private onAudioDataChanged() {
    if (this.audioData) {
      mm.parseBlob(this.audioData).then((metadata) => {
        this.metadata = metadata;
      }).catch(() => {
        this.$message.error('Failed to load audio metadata');
      });
    } else {
      this.metadata = null;
    }
  }

  public async open(songs: Song[], i: number, nav = 'info') {
    if (i < 0 || i >= songs.length) {
      this.$message.error('Invalid operation');
      return;
    }
    this.songs = songs;
    this.index = i;
    this.nav = nav;
    const { data } = await musicModule.FetchAudio(this.song);
    this.audioData = data;
    this.mainDialog.show();
  }

  private async prev() {
    if (!this.prevSong) return;
    const { data } = await musicModule.FetchAudio(this.prevSong);
    this.audioData = data;
    this.index--;
  }

  private async next() {
    if (!this.nextSong) return;
    const { data } = await musicModule.FetchAudio(this.nextSong);
    this.audioData = data;
    this.index++;
  }

  private async reload(targetIds?: number[]) {
    if (targetIds) {
      targetIds.forEach(async (id) => {
        if (id === this.song.id) return;
        const song = await musicModule.ReloadSong(id);
        let i = findIndex(this.songs, (s) => s.id === id);
        do {
          this.$set(this.songs, i, song);
          i = findIndex(this.songs, (s) => s.id === id, i + 1);
        } while (i >= 0);
      });
    }
    const res1 = await musicModule.ReloadSong(this.song.id);
    this.song = res1;
    const res2 = await musicModule.FetchAudio(this.song);
    this.audioData = res2.data;
    this.$emit('updated', res1);
  }

  private async updateRate(val: number) {
    const id = this.song.id;
    await musicModule.UpdateSong({ id, data: { rate: val } });
    const song = await musicModule.ReloadSong(id);
    this.song = song;
  }
}
</script>
