<template>
  <div>
    <v-form-group v-for="(label, k) in basicTags" :key="k" :label="label" label-cols="4" label-cols-lg="2">
      <div class="d-flex align-items-center">
        <v-input v-model="edit[k]"/>
        <b-button-close class="ml-1" tabindex="-1" @click="deleteTag(k)"/>
      </div>
    </v-form-group>
    <v-form-group v-for="(v, k) in otherTags" :key="k" :label="TAG_MAP[k] || k" label-cols="4" label-cols-lg="2">
      <div class="d-flex align-items-center">
        <v-input v-model="edit[k]"/>
        <b-button-close class="ml-1" tabindex="-1" @click="deleteTag(k)"/>
      </div>
    </v-form-group>
    <div class="d-flex overflow-auto">
      <b-button variant="info" @click="addTag">Add tag</b-button>
      <b-button variant="info" :disabled="searchingInfo" class="ml-2" @click="searchInfo">
        <b-spinner v-if="searchingInfo" type="grow" small class="mr-1"/>
        <span>Search info</span>
      </b-button>
      <b-button variant="info" class="ml-2" @click="searchGoogle">
        <span>Search google</span>
        <b-icon icon="box-arrow-in-up-right" class="ml-1"/>
      </b-button>
      <b-button variant="success" class="ml-auto" @click="save">Save</b-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import axios from 'axios';
import { IAudioMetadata } from 'music-metadata-browser';
import { omitBy, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { VFormGroup } from '@/components';
import SearchInfoDialog from './SearchInfoDialog.vue';

@Component({
  components: {
    VFormGroup,
  },
})
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

  @Watch('metadata', { immediate: true })
  private onMetadataChanged() {
    this.setEdit();
  }

  private setEdit() {
    this.edit = {};
    if (this.tags) {
      this.tags.forEach((t) => {
        if ('string' !== typeof t.value) return;
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
    this.$set(this.edit, k, null);
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
      if (res.data.length > 0) {
        const dialog = new SearchInfoDialog({
          parent: this.$root,
          propsData: {
            edit: this.edit,
            searchResults: res.data,
          },
        });
        dialog.$on('apply', this.apply);
        dialog.open();
      } else {
        this.$message.warn('No results');
      }
    }).catch(() => {
      this.searchingInfo = false;
    });
  }

  private searchGoogle() {
    if (!this.song) return;
    const title = this.edit.TIT2 || this.song.title;
    const artist = this.edit.TPE1 || this.song.artist.name;

    window.open(encodeURI(`https://www.google.com/search?q=${title} ${artist}`));
  }

  private apply(selected: Array<Dictionary<string>>) {
    if (selected.length) {
      const info = selected[0];
      const year = this.id3Version === 'ID3v2.4' ? 'TDRC' : 'TYER';
      this.$set(this.edit, 'TIT2', info.title);
      this.$set(this.edit, 'TPE1', info.artist);
      this.$set(this.edit, 'TALB', info.album);
      this.$set(this.edit, 'TPE2', info.album_artist || info.artist);
      this.$set(this.edit, year, info.year);
      this.$set(this.edit, 'TRCK', info.track);
      this.$set(this.edit, 'TPOS', info.disc);
    }
  }

  private async save() {
    await musicModule.UpdateSongTag({ id: this.song.id, data: this.edit });
    this.$emit('updated');
  }
}
</script>
