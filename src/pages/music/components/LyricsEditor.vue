<template>
  <div>
    <h5>Lyrics</h5>
    <b-card class="mt-2 mb-3">
      <div class="d-md-flex">
        <b-input v-model.trim="title" placeholder="Title"/>
        <b-input v-model.trim="artist" placeholder="Artist" class="mt-2 mt-md-0 ml-md-2"/>
      </div>
      <b-button variant="info" class="d-block my-2" @click="searchLyrics">
        <b-spinner v-if="searching" type="grow" small class="mr-2"/>
        <span>Search Lyrics</span>
      </b-button>
      <b-form-radio-group v-if="searchResults.length" v-model="selected" buttons button-variant="outline-primary" :options="searchResults"/>
      <b-form-radio-group v-else buttons button-variant="outline-primary" :options="[{ text: 'No results', value: 'none', disabled: true }]"/>
    </b-card>
    <div class="d-flex">
      <b-form-textarea v-model="lyrics" rows="15" max-rows="15"/>
      <template v-if="$pc">
        <icon-button icon="arrow-left" @click="lyrics = lyricsPreview"/>
        <b-form-textarea v-model="lyricsPreview" readonly rows="15" max-rows="15"/>
      </template>
    </div>
    <div class="d-flex mt-2">
      <b-button variant="outline-danger" class="ml-auto" @click="setLyrics">Reset</b-button>
      <b-button variant="success" class="ml-2" @click="save">Save</b-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import axios from 'axios';
import { IAudioMetadata } from 'music-metadata-browser';
import { find, Dictionary } from 'lodash';
import { IconButton } from '@/components';
import { Song } from '@/store/music';

@Component({
  components: {
    IconButton,
  },
})
export default class LyricsEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, default: null })
  private metadata!: IAudioMetadata | null;

  private lyrics = '';
  private title = '';
  private artist = '';
  private selected: string | null = null;
  private lyricsPreview = '';
  private searching = false;
  private searchResults: Array<{ text: string, value: string }> = [];

  get id3Version() {
    if (this.metadata) {
      if (this.metadata.native['ID3v2.4']) return 'ID3v2.4';
      else if (this.metadata.native['ID3v2.3']) return 'ID3v2.3';
    }
    return null;
  }

  @Watch('song', { immediate: true })
  private onSongChanged() {
    this.setQueries();
  }

  @Watch('metadata', { immediate: true })
  private onMetadataChanged() {
    this.setLyrics();
  }

  @Watch('selected')
  private onSelected() {
    if (this.selected) {
      this.lyricsPreview = this.selected;
      if (this.$mobile) {
        this.$confirm(this.lyricsPreview, { variant: 'primary' }).then(() => {
          this.lyrics = this.lyricsPreview;
        });
      }
    }
  }

  private setLyrics() {
    if (this.metadata && this.id3Version) {
      const uslt = find(this.metadata.native[this.id3Version], { id: 'USLT' });
      if (uslt) this.lyrics = uslt.value.text;
      else this.lyrics = '';
    }
  }

  private setQueries() {
    this.title = this.song.title;
    this.artist = this.song.artist.name;
  }

  private async searchLyrics() {
    if (!this.title) {
      this.$message.error('Please input title');
      return;
    }
    this.searching = true;
    const params: Dictionary<string> = {
      title: this.title,
    };
    if (this.artist) params.artist = this.artist;
    axios.get('/api/music/tools/searchlyrics', { params }).then((res) => {
      this.searchResults = res.data;
    }).finally(() => {
      this.searching = false;
    });
  }

  private reset() {
    this.searchResults = [];
    this.setLyrics();
    this.setQueries();
  }

  private save() {
    axios.put(`/api/music/songs/${this.song.id}/lyrics`, { lyrics: this.lyrics }).then(() => {
      this.$message.success('Saved');
      this.$emit('updated');
    });
  }
}
</script>
