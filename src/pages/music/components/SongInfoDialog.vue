<template>
    <!-- main -->
    <b-modal ref="mainDialog" title="Edit song" size="lg" @hidden="onClosed">
      <v-nav v-model="nav" :items="navItems" pills no-wrap/>
      <keep-alive>
        <!-- info -->
        <div v-if="nav === 'info'" class="container pt-3">
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
        <tag-editor v-else-if="nav === 'tag'" :song="song" :metadata="metadata" class="pt-3" @updated="reload"/>
        <!-- edit -->
        <audio-editor v-else-if="nav === 'edit'" :song="song" :data="audioData" class="pt-3" @updated="reload"/>
        <!-- lyrics -->
        <lyrics-editor v-else-if="nav === 'lyrics'" :song="song" :metadata="metadata" class="pt-3" @updated="reload"/>
        <!-- artwork -->
        <artwork-editor v-else-if="nav === 'artwork'" :song="song" :metadata="metadata" class="pt-3" @updated="reload"/>
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
import { Component, Mixins, Prop, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import axios from 'axios';
import * as mm from 'music-metadata-browser';
import { find, isArray, isEmpty, omitBy, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song, getFilepath } from '@/store/music';
import { DialogMixin, formatTime, formatBytes, waitUntil } from '@/utils';
import { VNav, Rate } from '@/components';
import TagEditor from './TagEditor.vue';
import AudioEditor from './AudioEditor.vue';
import LyricsEditor from './LyricsEditor.vue';
import ArtworkEditor from './ArtworkEditor.vue';
import i18n from '@/i18n/music';

@Component({
  components: {
    VNav,
    Rate,
    TagEditor,
    AudioEditor,
    LyricsEditor,
    ArtworkEditor,
  },
  i18n,
})
export default class SongInfoDialog extends Mixins(DialogMixin) {
  @Prop({ type: Function, default: null })
  private getNeighborSong!: ((current: Song | null) => ({ prevSong?: Song, nextSong?: Song })) | null;

  private readonly formatTime = formatTime;
  private readonly formatBytes = formatBytes;
  private readonly getFilepath = getFilepath;

  @Ref() private mainDialog!: BModal;

  private nav = 'info';
  private song: Song | null = null;
  private prevSong?: Song;
  private nextSong?: Song;
  private audioData: Blob | null = null;
  private metadata: mm.IAudioMetadata | null = null;

  get navItems() {
    return [
      { key: 'info', title: this.$t('navs.info') },
      { key: 'tag', title: this.$t('navs.tag') },
      { key: 'edit', title: this.$t('navs.edit') },
      { key: 'lyrics', title: this.$t('navs.lyrics') },
      { key: 'artwork', title: this.$t('navs.artwork') },
    ];
  }

  // info
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

  // dialog
  public async open(song: Song, nav = 'info') {
    this.nav = nav;
    await this.changeSong(song);
    await waitUntil(() => !!this.mainDialog, 500);
    this.mainDialog.show();
  }

  private onClosed() {
    this.$destroy();
  }

  private async changeSong(song: Song) {
    const { data } = await musicModule.FetchAudio(song);
    this.audioData = data;
    this.song = song;
    this.setNeighbors();
  }

  private prev() {
    if (!this.prevSong) return;
    this.changeSong(this.prevSong);
  }

  private next() {
    if (!this.nextSong) return;
    this.changeSong(this.nextSong);
  }

  private setNeighbors() {
    if (!this.getNeighborSong) return;
    const ns = this.getNeighborSong(this.song);
    this.prevSong = ns?.prevSong;
    this.nextSong = ns?.nextSong;
  }

  private async reload(targetIds: number[]) {
    console.log(targetIds);
    if (!this.song) return;
    if (targetIds) {
      targetIds.forEach((id) => {
        if (id === this.song?.id) return;
        musicModule.ReloadSong(id);
      });
    }
    const res1 = await musicModule.ReloadSong(this.song.id);
    this.song = res1;
    const res2 = await musicModule.FetchAudio(this.song);
    this.audioData = res2.data;
  }

  // info
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
}
</script>
