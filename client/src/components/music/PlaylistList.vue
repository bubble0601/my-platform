<template>
  <div class="h-100">
    <v-data-iterator
      :loading="loading"
      :items="playlists"
      :locale="$vuetify.lang.current"
      :items-per-page="-1"
      hide-default-footer
      class="playlist-list"
    >
      <template #loading>
        <v-progress-linear indeterminate/>
      </template>

      <template #default="{ items }">
        <div class="playlist-list__body">
          <v-row
              v-for="playlist in items"
              :key="playlist.id"
              v-ripple
              dense
              align="center"
              class="playlist-list__row"
              @click="$router.push(`/music/playlist/${playlist.id}`)"
              @contextmenu.prevent="showContextMenu(playlist, $event.clientX, $event.clientY)"
          >
            <v-col cols="2" sm="1" class="text-center">
              <v-avatar size="32">
                <v-icon>list</v-icon>
              </v-avatar>
            </v-col>
            <v-col>
              <div>{{ playlist.name }}</div>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-data-iterator>

    <v-menu v-model="contextMenu" :position-x="contextMenuX" :position-y="contextMenuY">
      <v-list v-if="contextMenuTarget" dense>
        <v-list-item @click="play">再生</v-list-item>
        <v-list-item @click="deletePlaylist">削除</v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Playlist } from '@/api/music';
import { musicModule } from '@/store';
import { MusicApi } from '@/api';

@Component
export default class PlaylistList extends Vue {
  private loading = false;
  // private view: 'grid' | 'list' = 'list';

  private contextMenu = false;
  private contextMenuTarget: Playlist | null = null;
  private contextMenuX = 0;
  private contextMenuY = 0;

  get playlists() {
    return musicModule.playlists;
  }

  // @Watch('view')
  // protected saveView() {
  //   localStorage.setItem('playlist-list.view', this.view);
  // }

  protected async created() {
    // this.view = localStorage.getItem('playlist-list.view') || 'list';
    this.loading = true;
    await musicModule.FetchPlaylists();
    this.loading = false;
  }

  private showContextMenu(playlist: Playlist, x: number, y: number) {
    this.contextMenu = true;
    this.contextMenuTarget = playlist;
    this.contextMenuX = x;
    this.contextMenuY = y;
  }

  private async play() {
    if (this.contextMenuTarget?.id != null) {
      const songs = (await MusicApi.fetchPlaylistSongs(this.contextMenuTarget.id)).data;
      musicModule.PlaySongs(songs);
    }
  }

  private async deletePlaylist() {
    // if (this.contextMenuTarget?.id != null) {
    //   MusicApi.deletePlaylist(this.contextMenuTarget.id);
    // }
    this.$snackbar.warn('Not implemented');
  }
}
</script>
<style lang="scss" scoped>
.playlist-list {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  user-select: none;

  .playlist-list__body {
    flex-grow: 1;
    overflow: auto;
  }

  .playlist-list__row {
    margin: 0;
    cursor: pointer;
    &:hover {
      background-color: #80808020;
    }
  }
}
</style>
