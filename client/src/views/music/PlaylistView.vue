<template>
  <div class="d-flex">
    <music-nav-menu/>
    <div class="flex-grow-1">
      <playlist-list v-if="playlistId === -1"/>
      <song-list v-else context="playlist" :loading="loading" :songs="songs" @refresh="fetch"/>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import MusicApi, { Song } from '@/api/music';
import { PlaylistList, SongList, MusicNavMenu } from '@/components/music';

@Component({
  components: {
    PlaylistList,
    SongList,
    MusicNavMenu,
  },
})
export default class PlaylistView extends Vue {
  @Prop({ type: Number, default: -1 })
  private playlistId!: number;

  private loading = false;
  private songs: Song[] = [];

  @Watch('playlistId', { immediate: true })
  private onPlaylistIdChanged() {
    if (this.playlistId !== -1) this.fetch();
  }

  private created() {
    // musicModule.FetchPlaylists();
  }

  private async fetch() {
    this.loading = true;
    this.songs = (await MusicApi.fetchPlaylistSongs(this.playlistId)).data;
    this.loading = false;
  }
}
</script>
