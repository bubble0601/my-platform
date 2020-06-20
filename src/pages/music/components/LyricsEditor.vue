<template>
  <div>
    <h5>Lyrics</h5>
    <div class="d-md-flex">
      <b-input v-model.trim="title" placeholder="Title"/>
      <b-input v-model.trim="artist" placeholder="Artist" class="mt-2 mt-md-0 ml-md-2"/>
    </div>
    <b-button variant="info" class="d-block mt-2 mb-3" :disabled="searching" @click="searchLyrics">
      <b-spinner v-if="searching" type="grow" small class="mr-2"/>
      <span>Search lyrics</span>
    </b-button>
    <b-form-radio-group v-if="searchResults.length" v-model="selected" buttons button-variant="outline-primary" :options="searchResults"/>
    <b-form-radio-group v-else buttons button-variant="outline-primary" :options="[{ text: 'No results', value: 'none', disabled: true }]"/>
    <div class="d-flex mt-1">
      <b-form-textarea v-model="lyrics" rows="15" max-rows="15"/>
    </div>
    <div class="d-flex mt-2">
      <b-button variant="outline-danger" class="ml-auto" @click="reset">Reset</b-button>
      <b-button variant="success" class="ml-2" @click="save">Save</b-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import axios from 'axios';
import { find, Dictionary } from 'lodash';
import { IconButton } from '@/components';
import { Song, Metadata } from '@/store/music';

@Component({
  components: {
    IconButton,
  },
})
export default class LyricsEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, default: null })
  private metadata!: Metadata | null;

  private lyrics = '';
  private title = '';
  private artist = '';
  private selected: string | null = null;
  private searching = false;
  private searchResults: Array<{ text: string, value: string }> = [];

  @Watch('song', { immediate: true })
  private onSongChanged(newSong: Song, oldSong: Song | null) {
    if (oldSong && newSong.id !== oldSong.id) this.reset();
    else this.setQueries();
  }

  @Watch('metadata', { immediate: true })
  private onMetadataChanged() {
    this.setLyrics();
  }

  @Watch('selected')
  private onSelected() {
    if (this.selected) {
      this.lyrics = this.selected;
    }
  }

  private setLyrics() {
    if (this.metadata) {
      this.lyrics = this.metadata.tags.lyrics || '';
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
