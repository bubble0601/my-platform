<template>
  <b-modal v-model="visible" title="Edit song" size="lg" @hidden="onClosed">
    <v-nav v-model="nav" :items="navItems" pills no-wrap/>
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
    <div v-else-if="nav === 'tag'" class="pt-3">
    </div>
    <template #modal-footer="{ cancel, ok }">
      <b-button-group>
        <b-button :disabled="!prevSong" @click="prev">&lt;</b-button>
        <b-button :disabled="!nextSong" @click="next">&gt;</b-button>
      </b-button-group>
      <b-button variant="secondary" class="ml-auto" @click="cancel">Cancel</b-button>
      <b-button variant="primary" @click="ok">OK</b-button>
    </template>
  </b-modal>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import axios from 'axios';
import * as mm from 'music-metadata-browser';
import { isArray, isEmpty, omitBy, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song, getFilepath } from '@/store/music';
import { DialogMixin, formatTime, formatBytes } from '@/utils';
import { VNav, Rate } from '@/components';
import i18n from '@/i18n/music';

@Component({
  components: {
    VNav,
    Rate,
  },
  i18n,
})
export default class EditSongDialog extends Mixins(DialogMixin) {
  @Prop({ type: Function, default: null })
  private getNeighborSong!: ((current: Song | null) => ({ prevSong?: Song, nextSong?: Song })) | null;

  private readonly formatTime = formatTime;
  private readonly formatBytes = formatBytes;
  private readonly getFilepath = getFilepath;
  private readonly TAG_MAP = {
    TSSE: 'Encode settings',
  };

  private visible = false;
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

  @Watch('song')
  private onSongChanged() {
    this.audioData = null;
    this.metadata = null;
    if (!this.song) return;
    musicModule.FetchAudio(this.song).then((res) => {
      this.audioData = res.data;
    });
  }

  @Watch('audioData')
  private onAudioDataChanged() {
    if (this.audioData) {
      mm.parseBlob(this.audioData).then((metadata) => {
        this.metadata = metadata;
        // this.setEdit();
      }).catch(() => {
        this.$message.error('Failed to load audio metadata');
      });
    } else {
      this.metadata = null;
    }
  }

  protected mounted() {
    this.visible = true;
  }

  // dialog
  public async open(song: Song, nav = 'info') {
    this.nav = nav;
    this.song = song;
    this.setNeighbors();
  }

  private onClosed() {
    this.$destroy();
  }

  private prev() {
    this.song = this.prevSong || null;
    this.setNeighbors();
  }

  private next() {
    this.song = this.nextSong || null;
    this.setNeighbors();
  }

  private setNeighbors() {
    if (!this.getNeighborSong) return;
    const ns = this.getNeighborSong(this.song);
    this.prevSong = ns?.prevSong;
    this.nextSong = ns?.nextSong;
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

  // edit
  private play(s: Song[] | Song | null) {
    if (s) {
      if (isArray(s)) {
        if (s.length === 0) return;
        musicModule.Insert(s.slice(1));
        musicModule.Play(s[0]);
      } else {
        musicModule.Play(s);
      }
    }
  }
}
</script>
