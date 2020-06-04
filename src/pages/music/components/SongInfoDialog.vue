<template>
  <div>
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
        <!-- <tag-editor v-else-if="nav === 'tag'" :song="song" :metadata="metadata" class="pt-3" @updated="reload"/> -->
        <div v-else-if="nav === 'tag'" class="pt-3">
          <v-form-group v-for="(label, k) in basicTags" :key="k" :label="label" label-cols="4" label-cols-lg="2">
            <div class="d-flex align-items-center">
              <v-input v-model="edit[k]"/>
            </div>
          </v-form-group>
          <v-form-group v-for="(v, k) in otherTags" :key="k" :label="TAG_MAP[k] || k" label-cols="4" label-cols-lg="2">
            <div class="d-flex align-items-center">
              <v-input v-model="edit[k]"/>
              <b-button-close class="ml-1" @click="deleteTag(k)"/>
            </div>
          </v-form-group>
          <div class="d-flex">
            <b-button variant="info" :disabled="searchingInfo" @click="searchInfo">
              <b-spinner v-if="searchingInfo" type="grow" small class="mr-1"/>
              <span>Search info</span>
            </b-button>
            <b-button variant="info" class="ml-2" @click="addTag">Add tag</b-button>
            <b-button variant="success" class="ml-auto" @click="save">Save</b-button>
          </div>
        </div>
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
    <!-- Search Info -->
    <b-modal ref="searchInfoDialog" title="Result" size="lg" scrollable :ok-disabled="!selectedInfo.length" body-class="py-0" @ok="applyInfo" @hidden="resetSearchInfo">
      <b-table striped hover selectable select-mode="single" :items="searchInfoResults" class="mb-0" @row-selected="selectedInfo = $event">
        <template #thead-top>
          <b-tr class="text-muted">
            <b-th class="font-weight-light">{{ edit.TIT2 }}</b-th>
            <b-th class="font-weight-light">{{ edit.TPE1 }}</b-th>
            <b-th class="font-weight-light">{{ edit.TALB }}</b-th>
            <b-th class="font-weight-light">{{ edit.TPE2 }}</b-th>
            <b-th class="font-weight-light">{{ edit.TDRC || edit.TYER }}</b-th>
            <b-th class="font-weight-light">{{ edit.TRCK }}</b-th>
            <b-th class="font-weight-light">{{ edit.TPOS }}</b-th>
          </b-tr>
        </template>
      </b-table>
      <template #modal-ok>
        Apply
      </template>
    </b-modal>
  </div>
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
import { VNav, VFormGroup, Rate } from '@/components';
import AudioEditor from './AudioEditor.vue';
import LyricsEditor from './LyricsEditor.vue';
import ArtworkEditor from './ArtworkEditor.vue';
import i18n from '@/i18n/music';

@Component({
  components: {
    VNav,
    VFormGroup,
    Rate,
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
  private readonly TAG_MAP = {
    TSO2: 'Album artist sort',
    TSSE: 'Encode settings',
  };

  @Ref() private mainDialog!: BModal;

  private nav = 'info';
  private song: Song | null = null;
  private prevSong?: Song;
  private nextSong?: Song;
  private audioData: Blob | null = null;
  private metadata: mm.IAudioMetadata | null = null;

  private edit: Dictionary<string | null> = {};
  private searchingInfo: boolean = false;
  private searchInfoResults: Array<Dictionary<string>> = [];
  private selectedInfo: Array<Dictionary<string>> = [];

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

  // tag
  get id3Version() {
    if (this.metadata) {
      if (this.metadata.native['ID3v2.4']) return 'ID3v2.4';
      else if (this.metadata.native['ID3v2.3']) return 'ID3v2.3';
    }
    return null;
  }

  get tags() {
    if (this.metadata && this.id3Version) return this.metadata.native[this.id3Version];
    return null;
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

  @Ref() private searchInfoDialog!: BModal;

  @Watch('audioData')
  private onAudioDataChanged() {
    this.edit = {};
    if (this.audioData) {
      mm.parseBlob(this.audioData).then((metadata) => {
        this.metadata = metadata;
        this.setEdit();
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

  private async reload() {
    if (!this.song) return;
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

  // tag
  private setEdit() {
    this.edit = {};
    if (this.tags) {
      this.tags.forEach((t) => {
        if ('string' !== typeof t.value) return true;
        this.$set(this.edit, t.id, t.value);
      });
    }
  }

  private addTag() {
    this.$prompt('Add tag').then((tag) => {
      this.$set(this.edit, tag, '');
    });
  }

  private deleteTag(k: string) {
    this.edit[k] = null;
  }

  private async searchInfo() {
    if (!this.song) return;
    const title = this.edit.TIT2 || this.song.title;
    const artist = this.edit.TPE1 || this.song.artist.name;
    if (!title || !artist || artist === 'Unknown Artist') {
      this.$message.warn('Please input title and artist');
      return;
    }

    this.searchingInfo = true;
    axios.get<Array<Dictionary<string>>>('/api/music/tools/searchinfo', { params: { title, artist } }).then((res) => {
      this.searchingInfo = false;
      this.searchInfoResults = res.data;
      if (res.data.length > 0) {
        this.searchInfoDialog.show();
      } else {
        this.$message.warn('No results');
      }
    }).catch(() => {
      this.searchingInfo = false;
    });
  }

  private applyInfo() {
    if (this.selectedInfo.length) {
      const info = this.selectedInfo[0];
      const year = this.id3Version === 'ID3v2.4' ? 'TDRC' : 'TYER';
      this.edit.TIT2 = info.title;
      this.edit.TPE1 = info.artist;
      this.edit.TALB = info.album;
      this.edit.TPE2 = info.album_artist;
      this.edit[year] = info.year;
      this.edit.TRCK = info.track;
      this.edit.TPOS = info.disc;
    }
  }

  private resetSearchInfo() {
    this.selectedInfo = [];
    this.searchInfoResults = [];
  }

  private async save() {
    if (!this.song) return;
    await musicModule.UpdateSongTag({ id: this.song.id, data: this.edit });
    this.reload();
  }
}
</script>
