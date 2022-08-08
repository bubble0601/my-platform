<template>
  <div class="pa-3">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field v-model.trim="title" label="タイトル" hide-details/>
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model.trim="artist" label="アーティスト" hide-details/>
      </v-col>
    </v-row>
    <div class="mt-2">
      <v-btn :loading="searching" color="info" @click="searchLyrics">
        歌詞検索
      </v-btn>
    </div>
    <div class="mt-2">
      <v-btn-toggle dense mandatory>
        <v-btn v-for="r in searchResults" :key="r.text" @click="lyrics = r.value">
          {{ r.text }}
        </v-btn>
        <v-btn v-if="searchResults.length === 0" disabled>
          結果なし
        </v-btn>
      </v-btn-toggle>
    </div>
    <div class="mt-2">
      <v-textarea v-model="lyrics" outlined :rows="15" no-resize hide-details/>
    </div>
    <div class="d-flex mt-2">
      <v-btn color="secondary" class="ml-auto" @click="reset">
        リセット
      </v-btn>
      <v-btn color="primary" class="ml-2" @click="save">
        保存
      </v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import axios from 'axios';
import { Dictionary } from 'lodash';
import { Song, Metadata } from '@/api/music';

@Component
export default class LyricsEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, default: null })
  private metadata!: Metadata | null;

  private lyrics = '';
  private title = '';
  private artist = '';
  // private selected: string | null = null;
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

  // @Watch('selected')
  // private onSelected() {
  //   if (this.selected) {
  //     this.lyrics = this.selected;
  //   }
  // }

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
      this.$snackbar.error('Please input title');
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
      this.$snackbar.success('Saved');
      this.$emit('updated');
    });
  }
}
</script>
