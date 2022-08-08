<template>
  <v-container class="overflow-y-auto h-100">
    <v-sheet v-if="displaySongs.length" class="pa-4">
      <div class="d-flex align-center">
        <span class="text-h5 mr-auto">曲</span>
        <v-btn v-if="type === 'all' && songs.length > 3" small text color="info" @click="showAll('song')">
          すべて表示({{ songs.length }}件)
        </v-btn>
        <span v-else class="text--secondary mr-4">
          {{ songs.length }}件
        </span>
      </div>
      <song-list context="song" :songs="displaySongs" @refresh="fetch"/>
    </v-sheet>

    <v-sheet v-if="displayArtists.length" class="pa-4 mt-4">
      <div class="d-flex align-center">
        <span class="text-h5 mr-auto">アーティスト</span>
        <v-btn v-if="type === 'all' && artists.length > 3" small text color="info" @click="showAll('artist')">
          すべて表示({{ artists.length }}件)
        </v-btn>
        <span v-else class="text--secondary mr-4">
          {{ artists.length }}件
        </span>
      </div>
      <v-list dense>
        <v-list-item v-for="artist in displayArtists" :key="artist.id" :to="`/music/artist/${artist.id}`">
          <v-list-item-content>
            <v-list-item-title>{{ artist.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-sheet>

    <v-sheet v-if="displayAlbums.length" class="pa-4 mt-4">
      <div class="d-flex align-center">
        <span class="text-h5 mr-auto">アルバム</span>
        <v-btn v-if="type === 'all' && albums.length > 3" small text color="info" @click="showAll('album')">
          すべて表示({{ albums.length }}件)
        </v-btn>
        <span v-else class="text--secondary mr-4">
          {{ albums.length }}件
        </span>
      </div>
      <v-list dense>
        <v-list-item v-for="album in displayAlbums" :key="album.id" :to="`/music/album/${album.id}`">
          <v-list-item-content>
            <v-list-item-title>{{ album.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-sheet>

    <v-sheet v-if="displayPlaylists.length" class="pa-4 mt-4">
      <div class="d-flex align-center">
        <span class="text-h5 mr-auto">プレイリスト</span>
        <v-btn v-if="type === 'all' && playlists.length > 3" small text color="info" @click="showAll('playlist')">
          すべて表示({{ playlists.length }}件)
        </v-btn>
        <span v-else class="text--secondary mr-4">
          {{ playlists.length }}件
        </span>
      </div>
      <v-list dense>
        <v-list-item v-for="playlist in displayPlaylists" :key="playlist.id" :to="`/music/playlist/${playlist.id}`">
          <v-list-item-content>
            <v-list-item-title>{{ playlist.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-sheet>
  </v-container>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { MusicApi } from '@/api';
import { Album, Artist, Playlist, Song } from '@/api/music';
import { SongList } from '@/components/music';
import { musicModule } from '@/store';

type ResultType = 'all' | 'song' | 'artist' | 'album' | 'playlist';

@Component({
  components: {
    SongList,
  },
})
export default class SearchResultView extends Vue {
  private type: ResultType = 'all';
  private songs: Song[] = [];
  private artists: Artist[] = [];
  private albums: Album[] = [];
  private playlists: Playlist[] = [];

  get displaySongs() {
    return this.type === 'song' ? this.songs : this.songs.slice(0, 3);
  }

  get displayArtists() {
    return this.type === 'artist' ? this.artists : this.artists.slice(0, 3);
  }

  get displayAlbums() {
    return this.type === 'album' ? this.albums : this.albums.slice(0, 3);
  }

  get displayPlaylists() {
    return this.type === 'playlist' ? this.playlists : this.playlists.slice(0, 3);
  }

  @Watch('$route', { immediate: true })
  private onRouteChanged() {
    if (this.$route.name !== 'music-search-result') return;
    this.type = this.$route.query.type as ResultType || 'all';
    this.fetch();
  }

  private async fetch() {
    this.songs = (await MusicApi.fetchSongs(this.$route.query)).data;
  }

  private showAll(type: ResultType) {
    this.$router.push({
      query: {
        ...this.$route.query,
        type,
      },
    });
  }

  private play(song: Song) {
    musicModule.Play(song);
  }
}
</script>
