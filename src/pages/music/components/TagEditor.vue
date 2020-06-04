<template>
  <div>
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
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import axios from 'axios';
import { IAudioMetadata } from 'music-metadata-browser';
import { omitBy, Dictionary } from 'lodash';
import { Song } from '@/store/music';

@Component
export default class TagEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, required: true })
  private metadata!: IAudioMetadata;

  private readonly TAG_MAP = {
    TSO2: 'Album artist sort',
    TSSE: 'Encode settings',
  };
  private edit: Dictionary<string | null> = {};
  private searchingInfo: boolean = false;
  private searchInfoResults: Array<Dictionary<string>> = [];
  private selectedInfo: Array<Dictionary<string>> = [];

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
}
</script>
