<template>
  <div>
    <h5>Artwork</h5>
    <div id="artwork-search">
      <div class="py-3">
        <b-img v-if="artwork" :src="artwork" width="128" class="shadow" @error="onLoadArtworkError"/>
        <img v-else src="@/assets/default_artwork.svg" width="128" class="shadow p-2" style="background-color: #e8e8e8;"/>
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
          <b-img :src="src" class="shadow cursor-pointer" :class="{ 'border border-primary': selected === src }" :style="imgStyle" @click="selected = src"/>
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
import { IAudioMetadata } from 'music-metadata-browser';
import { find, Dictionary } from 'lodash';
import { IconButton } from '@/components';
import { Song } from '@/store/music';

@Component({
  components: {
    IconButton,
  },
})
export default class ArtworkEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, default: null })
  private metadata!: IAudioMetadata | null;

  private artwork: string | null = null;
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

  get id3Version() {
    if (this.metadata) {
      if (this.metadata.native['ID3v2.4']) return 'ID3v2.4';
      else if (this.metadata.native['ID3v2.3']) return 'ID3v2.3';
    }
    return null;
  }

  @Watch('song', { immediate: true })
  private onSongChanged(newSong: Song, oldSong: Song | null) {
    if (oldSong && newSong.id !== oldSong.id) this.reset();
    else this.setQueries();
  }

  @Watch('metadata', { immediate: true })
  private onMetadataChanged() {
    this.setArtwork();
  }

  private setArtwork() {
    if (this.metadata && this.id3Version) {
      const apic = find(this.metadata.native[this.id3Version], { id: 'APIC' });
      if (apic) {
        const blob = new Blob([apic.value.data], { type: apic.value.format });
        const oURL = URL.createObjectURL(blob);
        this.artwork = oURL;
      } else {
        this.artwork = null;
      }
    }
  }

  private setQueries() {
    if (this.song.album.id) this.album = this.song.album.title;
    else this.album = '';
    this.title = this.song.title;
    this.artist = this.song.album.artist || this.song.artist.name;
  }

  private onLoadArtworkError() {
    this.artwork = null;
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
    if (this.searchCount) params.more = this.searchCount.toString();
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
    this.setArtwork();
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
