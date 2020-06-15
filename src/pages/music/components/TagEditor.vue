<template>
  <div>
    <v-form-group v-for="t in basicTags" :key="t.key" :label="t.label" label-cols="4" label-cols-lg="2">
      <div class="d-flex align-items-center">
        <v-input v-model="edit[t.key]"/>
        <b-button-close class="ml-1" tabindex="-1" @click="deleteTag(t.key)"/>
      </div>
    </v-form-group>
    <div class="d-flex overflow-auto">
      <!-- <b-button variant="info" @click="addTag">Add tag</b-button> -->
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
import { omitBy, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song, Metadata } from '@/store/music';
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
  private metadata!: Metadata;

  private edit: Dictionary<string | null> = {
    title: '',
    artist: '',
    album_artist: '',
    album: '',
    year: '',
    track: '',
    disc: '',
  };
  private searchingInfo: boolean = false;

  get basicTags() {
    return [
      { key: 'title', label: 'Title' },
      { key: 'artist', label: 'Artist' },
      { key: 'album_artist', label: 'Album artist' },
      { key: 'album', label: 'Album' },
      { key: 'year', label: 'Year' },
      { key: 'track', label: 'Track' },
      { key: 'disc', label: 'Disc' },
    ];
  }

  @Watch('metadata', { immediate: true })
  private onMetadataChanged() {
    this.setEdit();
  }

  private setEdit() {
    if (this.metadata) {
      const tags = this.metadata.tags;
      this.$set(this.edit, 'title', tags.title);
      this.$set(this.edit, 'artist', tags.artist);
      this.$set(this.edit, 'album', tags.album);
      this.$set(this.edit, 'album_artist', tags.album_artist);
      this.$set(this.edit, 'year', tags.year);
      this.$set(this.edit, 'track', tags.track);
      this.$set(this.edit, 'disc', tags.disc);
    }
  }

  // private addTag() {
  //   this.$prompt('Add tag').then((tag) => {
  //     this.$set(this.edit, tag, '');
  //   });
  // }

  private deleteTag(k: string) {
    this.$set(this.edit, k, null);
  }

  private async searchInfo() {
    if (!this.song) return;
    const title = this.edit.tilte || this.song.title;
    const artist = this.edit.artist || this.song.artist.name;
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
    const title = this.edit.title || this.song.title;
    const artist = this.edit.artist || this.song.artist.name;

    window.open(encodeURI(`https://www.google.com/search?q=${title} ${artist}`));
  }

  private apply(selected: Array<Dictionary<string>>) {
    if (selected.length) {
      const info = selected[0];
      this.$set(this.edit, 'title', info.title);
      this.$set(this.edit, 'artist', info.artist);
      this.$set(this.edit, 'album', info.album);
      this.$set(this.edit, 'album_artist', info.album_artist || info.artist);
      this.$set(this.edit, 'year', info.year);
      this.$set(this.edit, 'track', info.track);
      this.$set(this.edit, 'disc', info.disc);
    }
  }

  private async save() {
    await musicModule.UpdateSongTag({ id: this.song.id, data: this.edit });
    this.$emit('updated');
  }
}
</script>
