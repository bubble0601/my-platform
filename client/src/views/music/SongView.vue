<template>
  <div class="d-flex">
    <music-nav-menu/>
    <div class="flex-grow-1">
      <song-list :loading="loading" :songs="songs" @refresh="fetch"/>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MusicApi, { Song } from '@/api/music';
import { SongList, MusicNavMenu } from '@/components/music';

@Component({
  metaInfo: {
    title: 'Songs',
  },
  components: {
    SongList,
    MusicNavMenu,
  },
})
export default class SongView extends Vue {
  private loading = false;
  private songs: Song[] = [];

  protected created() {
    this.fetch();
  }

  private async fetch() {
    this.loading = true;
    this.songs = (await MusicApi.fetchSongs()).data;
    this.loading = false;
    // if (this.songs.length) {
    //   this.songs = (await MusicApi.fetchSongs()).data;
    // } else {
    //   this.songs = (await MusicApi.fetchSongs()).data.slice(0, 5);
    // }
  }
}
</script>
