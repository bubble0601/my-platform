<template>
  <div class="pa-3">
    <div class="d-flex">
      <cover-art :src="coverArtUrl" size="128"/>
    </div>
    <v-row class="mt-2">
      <v-col cols="12" sm="4">
        <v-text-field v-model.trim="title" label="タイトル"/>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.trim="album" label="アルバム"/>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.trim="artist" label="アーティスト"/>
      </v-col>
    </v-row>
    <div class="mt-2">
      <v-btn :loading="searching" color="info" @click="searchCoverArt">
        アートワークを検索
      </v-btn>
    </div>
    <div class="d-flex flex-wrap mt-2">
      <v-lazy v-for="(src, i) in searchResults" :key="i" class="ma-2">
        <v-sheet elevation="4" class="search-result__item" :class="{ selected: selected === src }" @click.native="selected = src">
          <v-img :src="src" :style="imgStyle"/>
        </v-sheet>
      </v-lazy>
    </div>
    <div class="d-flex mt-2">
      <v-btn color="secondary" class="ml-auto" @click="reset">
        リセット
      </v-btn>
      <v-btn color="primary" class="ml-2" @click="save">
        保存
      </v-btn>
      <v-btn color="primary" class="ml-2" @click="saveToAlbum">
        アルバム全体へ保存
      </v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import axios from 'axios';
import { Dictionary } from 'lodash';
import { CoverArt } from '@/components/music';
import { Song, Metadata } from '@/api/music';

@Component({
  components: {
    CoverArt,
  },
})
export default class CoverArtEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, default: null })
  private metadata!: Metadata | null;

  private coverArtUrl = '';
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

  @Watch('metadata', { immediate: true })
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

  private async searchCoverArt() {
    if (!this.title && !this.album) {
      this.$snackbar.error('Please input title or album title');
      return;
    }
    this.searching = true;
    const params: Dictionary<string | null> = {
      title: this.title || null,
      album: this.album || null,
    };
    if (this.artist) params.artist = this.artist;
    if (this.searchCount) params.page = this.searchCount.toString();
    axios.get('/api/music/tools/searchcoverart', { params }).then((res) => {
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
      this.$snackbar.error('Prease select image');
      return;
    }
    axios.put(`/api/music/songs/${this.song.id}/coverart`, { cover_art: this.selected }).then(() => {
      this.$snackbar.success('Saved');
      this.$emit('updated');
    });
  }

  private saveToAlbum() {
    if (!this.selected) {
      this.$snackbar.error('Prease select image');
      return;
    }
    axios.put<number[]>(`/api/music/songs/${this.song.id}/albumcoverart`, { cover_art: this.selected }).then((res) => {
      this.$snackbar.success('Saved');
      this.$emit('updated', res.data);
    });
  }
}
</script>
<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';
// #cover_art-search {
//   max-height: 60vh;
//   overflow-x: auto;
// }
.search-result__item {
  cursor: pointer;
  &.selected {
    border: 1px solid var(--v-primary-base);
  }
}
</style>
