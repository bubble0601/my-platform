<template>
  <div>
    <v-app-bar v-if="!selecting" app dense flat>
      <v-btn icon to="/music/artists">
        <v-icon>chevron_left</v-icon>
      </v-btn>

      <v-toolbar-title>
        {{ title }}
      </v-toolbar-title>

      <v-spacer/>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on" @click="play">
            <v-icon>play_arrow</v-icon>
          </v-btn>
        </template>
        <span>再生</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on" @click="shufflePlay">
            <v-icon>shuffle</v-icon>
          </v-btn>
        </template>
        <span>シャッフル再生</span>
      </v-tooltip>

      <v-menu bottom offset-y>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item @click="fetchSongs">
            <v-list-item-icon>
              <v-icon>refresh</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>更新</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-app-bar v-else app dense flat>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on" @click="selecting = false">
            <v-icon>clear</v-icon>
          </v-btn>
        </template>
        <span>選択解除</span>
      </v-tooltip>

      <v-spacer/>

      <v-menu bottom offset-y open-on-hover>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on">
            <v-icon>playlist_add</v-icon>
          </v-btn>
        </template>
        <v-list dense subheader>
          <v-subheader class="font-weight-bold">プレイリストに追加</v-subheader>
          <v-list-item v-for="p in playlists" :key="p.id" class="px-4" @click="addToPlaylist(p)">
            <v-list-item-content>
              <v-list-item-title>{{ p.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>新規作成</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on" @click="play">
            <v-icon>play_arrow</v-icon>
          </v-btn>
        </template>
        <span>再生</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on" @click="shufflePlay">
            <v-icon>shuffle</v-icon>
          </v-btn>
        </template>
        <span>シャッフル再生</span>
      </v-tooltip>

      <v-menu bottom offset-y>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item @click="selectAll">
            <v-list-item-icon>
              <v-icon>select_all</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>すべて選択</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="deleteSongs">
            <v-list-item-icon>
              <v-icon>delete</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>曲を削除</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <song-list v-model="selectedSongs" context="artist" :selecting.sync="selecting" :loading="loading" :songs="songs">
      <template #contextmenu>

      </template>
    </song-list>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import MusicApi, { Artist, Playlist, Song } from '@/api/music';
import Music from '@/services/music';
import { SongList } from '@/components/music';
import { musicModule } from '@/store';
import { without } from 'lodash';

export default Vue.extend({
  name: 'ArtistView',
  components: {
    SongList,
  },
  props: {
    artistId: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      loading: false,
      artist: null as Artist | null,
      songs: [] as Song[],
      selecting: false,
      selectedSongs: [] as Song[],
    };
  },
  computed: {
    title(): string {
      if (this.loading) return '';
      return this.artist?.name || '不明なアーティスト';
    },
    playlists(): Playlist[] {
      if (!musicModule.playlists.length) {
        musicModule.FetchPlaylists();
      }
      return musicModule.playlists;
    },
    activeSongs(): Song[] {
      return this.selecting ? this.selectedSongs : this.songs;
    },
  },
  async beforeRouteUpdate(to, from, next) {
    this.load();
    next();
  },
  activated() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      await Promise.all([
          this.fetchArtist(),
          this.fetchSongs(),
      ]);
      this.loading = false;
    },

    async fetchArtist() {
      this.artist = (await MusicApi.fetchArtist(this.artistId)).data;
    },

    async fetchSongs() {
      this.songs = (await MusicApi.fetchArtistSongs(this.artistId)).data;
    },

    selectAll() {
      this.selectedSongs = this.songs;
    },

    play() {
      musicModule.SET_SHUFFLE(false);
      musicModule.PlaySongs(this.activeSongs);
    },

    shufflePlay() {
      musicModule.SET_SHUFFLE(true);
      musicModule.PlaySongs(this.activeSongs);
    },

    createAndAddToPlaylist() {
      const c = this.selectedSongs.length;
      this.$prompt({ title: 'プレイリスト名' }).then(async(res) => {
        const playlist = (await MusicApi.createPlaylist(res)).data;
        await MusicApi.addSongToPlaylist(playlist.id, this.selectedSongs.map(song => song.id));
        this.$snackbar.success(`プレイリスト「${res}」を作成し、${c}曲を追加しました`);
      });
    },

    async addToPlaylist(playlist: Playlist) {
      const c = this.selectedSongs.length;
      const res = await MusicApi.addSongToPlaylist(playlist.id, this.selectedSongs.map(song => song.id));
      if (res && res.data.error_message) {
        this.$snackbar.error(res.data.error_message);
      } else {
        this.$snackbar.success(`${c}曲を追加しました`);
      }
    },

    deleteSongs() {
      this.$confirm({ message: `本当に${this.selectedSongs.length}件の楽曲を削除してもよろしいですか？` }).then(async() => {
        this.loading = true;
        await Promise.all(this.selectedSongs.map((song) => musicModule.DeleteSong(song.id)));
        this.songs = without(this.songs, ...this.selectedSongs);
        this.loading = false;
      });
    },
  },
});
</script>
