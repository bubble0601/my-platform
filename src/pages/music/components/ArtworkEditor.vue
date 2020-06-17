<template>
  <div>
    <h5>Artwork</h5>
    <div id="artwork-search">
      <div class="py-3">
        <b-img v-if="coverArtUrl" :src="coverArtUrl" width="128" alt="Cover art" class="shadow"/>
        <img v-else src="@/assets/default_cover_art.svg" width="128" height="128" alt="default" class="shadow p-2" style="background-color: #e8e8e8;"/>
      </div>
      <div class="d-md-flex">
        <b-input v-model.trim="title" placeholder="Title"/>
        <b-input v-model.trim="album" placeholder="Album" class="mt-2 mt-md-0 ml-md-2"/>
        <b-input v-model.trim="artist" placeholder="Artist" class="mt-2 mt-md-0 ml-md-2"/>
      </div>
      <b-button variant="info" class="d-block mt-2 mb-3" :disabled="searching" @click="searchArtwork">
        <b-spinner v-if="searching" type="grow" small class="mr-2"/>
        <span>Search Artwork</span>
      </b-button>
      <div class="d-flex flex-wrap mt-1">
        <div v-for="(src, i) in searchResults" :key="i" class="m-2">
          <b-img-lazy :src="src" class="shadow cursor-pointer" :class="{ 'border border-primary': selected === src }" :style="imgStyle" @click.native="selected = src"/>
        </div>
        <div class="m-2">
          <b-button v-if="searchCount > 0" variant="outline-secondary" class="h-100" @click="searchArtwork">More</b-button>
        </div>
      </div>
    </div>
    <div class="d-flex mt-2">
      <b-button variant="outline-danger" class="ml-auto" @click="reset">Reset</b-button>
      <b-button variant="success" class="ml-2" @click="save">Save</b-button>
      <b-button variant="success" class="ml-2" @click="saveToAlbum">Save to album</b-button>
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
export default class ArtworkEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, default: null })
  private metadata!: Metadata | null;

  private coverArtUrl: string = '';
  private title = '';
  private album = '';
  private artist = '';
  private selected: string | null = null;
  private searching = false;
  private searchCount = 0;
  private searchResults: string[] = [];

  private readonly imgStyle = {
    'max-width': '150px',
    'height': 'auto',
  };

  @Watch('song', { immediate: true })
  private onSongChanged(newSong: Song, oldSong: Song | null) {
    if (oldSong && newSong.id !== oldSong.id) this.reset();
    else this.setQueries();
  }

  @Watch('metadata')
  private onMetadataChanged() {
    this.coverArtUrl = '';
    if (!this.metadata || !this.metadata.tags.cover_art) return;
    const picture = this.metadata.tags.cover_art;
    this.coverArtUrl = `data:${picture.mime};base64,${picture.data}`;
  }

  private setQueries() {
    if (this.song.album.id) this.album = this.song.album.title;
    else this.album = '';
    this.title = this.song.title;
    this.artist = this.song.album.artist || this.song.artist.name;
  }

  private async searchArtwork() {
    if (!this.title && !this.album) {
      this.$message.error('Please input title or album title');
      return;
    }
    this.searching = true;
    const params: Dictionary<string | null> = {
      title: this.title || null,
      album: this.album || null,
    };
    if (this.artist) params.artist = this.artist;
    if (this.searchCount) params.page = this.searchCount.toString();
    axios.get('/api/music/tools/searchartwork', { params }).then((res) => {
      if (this.searchCount > 0) this.searchResults.push(...res.data);
      else this.searchResults = res.data;
      this.searchCount++;
    }).finally(() => {
      this.searching = false;
    });
  }

  private reset() {
    this.selected = null;
    this.searchCount = 0;
    this.searchResults = [];
    this.setQueries();
  }

  private save() {
    if (!this.selected) {
      this.$message.error('Prease select image');
      return;
    }
    axios.put(`/api/music/songs/${this.song.id}/artwork`, { artwork: this.selected }).then(() => {
      this.$message.success('Saved');
      this.$emit('updated');
    });
  }

  private saveToAlbum() {
    if (!this.selected) {
      this.$message.error('Prease select image');
      return;
    }
    axios.put<number[]>(`/api/music/songs/${this.song.id}/albumartwork`, { artwork: this.selected }).then((res) => {
      this.$message.success('Saved');
      this.$emit('updated', res.data);
    });
  }
}
</script>
<style lang="scss" scoped>
#artwork-search {
  max-height: 60vh;
  overflow-x: auto;
}
</style>
