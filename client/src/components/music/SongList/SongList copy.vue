<template>
  <div class="h-100">
    <v-data-iterator
      v-model="selectedSongs"
      :loading="loading"
      :items="songs"
      :locale="$vuetify.lang.current"
      :items-per-page="-1"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      hide-default-footer
      class="song-list"
      @current-items="displayedSongs = $event"
    >
      <template #loading>
        <v-progress-linear indeterminate/>
      </template>

      <template #header>
        <template v-if="$pc">
          <!-- <v-sheet class="d-flex align-center px-2 py-1">
            <v-btn v-if="context !== 'song'" small plain icon @click="$router.go(-1)">
              <v-icon>arrow_back</v-icon>
            </v-btn>

            <v-btn small plain text class="ml-1" @click="shufflePlay">
              <v-icon>shuffle</v-icon>
              <span class="ml-1">シャッフル再生</span>
            </v-btn>

            <template v-if="selecting">
              <v-btn v-if="context === 'playlist'" small plain text @click="removeFromPlaylist">
                プレイリストから削除
              </v-btn>
              <v-menu v-else tile bottom offset-y>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" small plain text v-on="on">
                    <v-icon>playlist_add</v-icon>
                    <span class="ml-1">プレイリストに追加</span>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item v-for="pl in playlists" :key="pl.id" @click="addToPlaylist(pl.id)">
                    {{ pl.name }}
                  </v-list-item>
                  <v-list-item @click="createAndAddToPlaylist">
                    新規プレイリスト
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <v-tooltip v-if="!selecting" bottom open-delay="1000">
              <template #activator="{ on, attrs }">
                <v-btn v-bind="attrs" small plain icon rounded class="ml-auto" v-on="on" @click="refresh">
                  <v-icon>refresh</v-icon>
                </v-btn>
              </template>
              <span>更新</span>
            </v-tooltip>
          </v-sheet> -->

          <song-list-header :select-data="selectData" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"/>

          <v-divider/>
        </template>

        <template v-else>
          <!-- <v-sheet class="d-flex align-center pa-1">
            <v-btn v-if="context !== 'song'" small plain icon @click="$router.go(-1)">
              <v-icon>arrow_back</v-icon>
            </v-btn>

            <v-btn small plain text rounded class="ml-1" @click="shufflePlay">
              <v-icon>shuffle</v-icon>
              <span class="ml-1">シャッフル再生</span>
            </v-btn>

            <v-menu v-if="selecting" tile bottom offset-y>
              <template #activator="{ on, attrs }">
                <v-btn v-bind="attrs" small plain text v-on="on">
                  <v-icon>playlist_add</v-icon>
                  <span class="ml-1">プレイリストに追加</span>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item v-for="pl in playlists" :key="pl.id" link @click="addToPlaylist(pl.id)">
                  {{ pl.name }}
                </v-list-item>
                <v-list-item link @click="createAndAddToPlaylist">
                  新規プレイリスト
                </v-list-item>
              </v-list>
            </v-menu>

            <v-menu tile bottom offset-y>
              <template #activator="{ on, attrs }">
                <v-btn v-bind="attrs" small plain icon class="ml-auto" v-on="on">
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list dense class="pa-0">
                <v-list-item link @click="refresh">
                  <v-list-item-icon class="mr-2">
                    <v-icon>refresh</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>更新</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item id="song-sort-dialog-activator" link @click="songSortDialog = true">
                  <v-list-item-icon class="mr-2">
                    <v-icon>sort</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>ソート</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-sheet> -->

          <v-dialog v-model="songSortDialog" activator="#song-sort-dialog-activator">
            <v-card>
              <v-card-title>ソート</v-card-title>
              <v-divider/>
              <v-card-text>
                <v-radio-group v-model="sortBy" @change="songSortDialog = false">
                  <v-radio v-for="k in sortKeys" :key="k.value" :label="k.text" :value="k.value"/>
                </v-radio-group>
              </v-card-text>
              <v-divider/>
              <v-card-actions>
                <v-switch v-model="sortDesc" dense hide-details :label="sortDesc ? '降順' : '昇順'"/>
                <v-btn color="primary" class="ml-auto" @click="songSortDialog = false">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </template>

      <template #default="{ items, isSelected, select }">
        <v-virtual-scroll :bench="30" :item-height="rowHeight" :items="items" v-slot="{ item: song }" @scroll="contextMenu = false">
          <song-list-row
            :key="song.id"
            :song="song"
            :selecting="selecting"
            :is-selected="isSelected(song)"
            :style="`height: ${rowHeight}px;`"
            @click="onClickRow(song, isSelected(song))"
            @play="play"
            @select="select(song, $event)"
            @contextmenu="showContextMenu"
          />
        </v-virtual-scroll>
      </template>
    </v-data-iterator>

    <!-- context menu -->
    <v-menu v-model="contextMenu" :position-x="contextMenuX" :position-y="contextMenuY" absolute tile>
      <v-list v-if="contextMenuTarget" dense>
        <v-list-item @click="play2(contextMenuTarget)">再生</v-list-item>
        <v-list-item @click="playNext(contextMenuTarget)">
          <span>次に再生</span>
        </v-list-item>
        <v-list-item v-if="context === 'playlist'" @click="removeFromPlaylist([contextMenuTarget])">
          プレイリストから削除
        </v-list-item>
        <v-menu v-else open-on-hover right offset-x offset-overflow tile>
          <template #activator="{ on, attrs }">
            <v-list-item v-bind="attrs" v-on="on">
              <span>プレイリストに追加</span>
              <v-icon>arrow_right</v-icon>
            </v-list-item>
          </template>
          <v-list dense>
            <v-list-item v-for="pl in playlists" :key="pl.id" @click="addToPlaylist(pl.id)">
              {{ pl.name }}
            </v-list-item>
            <v-list-item @click="createAndAddToPlaylist">
              新規プレイリスト
            </v-list-item>
          </v-list>
        </v-menu>
        <v-list-item @click="deleteSong(contextMenuTarget)">曲を削除</v-list-item>
        <v-list-item v-if="context !== 'artist'" :to="`/music/artist/${contextMenuTarget.artist.id}`">アーティストへ移動</v-list-item>
        <v-list-item @click="openDetail(contextMenuTarget)">詳細を表示</v-list-item>
      </v-list>
    </v-menu>

    <song-info-dialog ref="songInfoDialog"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref } from 'vue-property-decorator';
import { without } from 'lodash';
import { Song } from '@/api/music';
import { musicModule } from '@/store';
import { REPEAT } from '@/store/music';
import { SongInfoDialog } from '@/components/music';
import SongListHeader from './SongListHeader.vue';
import SongListRow from './SongListRow.vue';

@Component({
  components: {
    SongInfoDialog,
    SongListHeader,
    SongListRow,
  },
})
export default class SongList extends Vue {
  @Prop({ type: String, default: 'song' })
  private context!: 'song' | 'artist' | 'playlist';

  @Prop({ type: Array, required: true })
  private songs!: Song[];

  @Prop({ type: Boolean, default: true })
  private loading!: boolean;

  // private selecting = false;
  private selectedSongs: Song[] = [];
  private sortKeys = [
    { value: 'title', text: 'タイトル' },
    { value: 'artist.name', text: 'アーティスト' },
    { value: 'album.title', text: 'アルバム' },
    { value: 'rating', text: 'レート' },
    { value: 'time', text: '時間' },
    { value: 'year', text: '年' },
    { value: 'played_count', text: '再生回数' },
  ];
  private songSortDialog = false;
  private sortBy = 'artist.name';
  private sortDesc = false;

  // private formatTime = formatTime;
  private contextMenu = false;
  private contextMenuTarget: Song | null = null;
  private contextMenuX = 0;
  private contextMenuY = 0;

  @Ref() private songInfoDialog!: SongInfoDialog;

  get rowHeight() {
    return this.$pc ? 36 : 48;
  }

  get playlists() {
    return musicModule.playlists;
  }

  get selecting() {
    return !!this.selectedSongs.length;
  }
  get selectData() {
    return {
      enabled: this.selecting,
      all: this.selectedSongs.length === this.songs.length,
      none: this.selectedSongs.length === 0,
      onInput: this.toggleSelect,
    };
  }

  get displayedSongs() {
    return musicModule.displayedSongs;
  }
  set displayedSongs(val: Song[]) {
    musicModule.SET_DISPLAYED_SONGS(val);
  }

  // @Watch('contextMenu')
  // private onContextMenuChanged(newVal: boolean) {
  //   if (!newVal) {
  //     this.contextMenuTarget = null;
  //   }
  // }

  private select(song: Song, to: boolean) {
    if (to) {
      this.selectedSongs.push(song);
    } else {
      this.selectedSongs = without(this.selectedSongs, song);
    }
  }

  private toggleSelect() {
    if (this.selectData.all) {
      this.selectedSongs = [];
    } else {
      this.selectedSongs = this.songs;
    }
  }

  private play(song: Song) {
    musicModule.PlayAndSet({
      song,
      songs: this.songs,
    });
  }

  private play2(song: Song) {
    if (this.selectedSongs.length) {
      musicModule.PlaySongs(this.selectedSongs);
    } else {
      this.play(song);
    }
  }

  private playNext(song: Song) {
    musicModule.InsertIntoNext([song]);
  }

  public shufflePlay() {
    if (this.songs.length === 0) return;
    musicModule.SetControl({ shuffle: true });
    if (musicModule.repeat === REPEAT.ONE) musicModule.SetControl({ repeat: REPEAT.NONE });
    if (this.selecting) {
      musicModule.PlaySongs(this.selectedSongs);
    } else {
      musicModule.PlaySongs(this.songs);
    }
  }

  public refresh() {
    this.$emit('refresh');
    // musicModule.ReloadSongs();
  }

  private createAndAddToPlaylist() {
    const c = this.selectedSongs.length;
    this.$prompt({ title: 'プレイリスト名' }).then(async(res) => {
      await musicModule.CreatePlaylist({ name: res, songs: this.selectedSongs });
      this.$snackbar.success(`プレイリスト「${res}」を作成しました`);
      this.$snackbar.success(`${c}曲を追加しました`);
    });
  }

  private async addToPlaylist(id: number) {
    const c = this.selectedSongs.length;
    const res = await musicModule.AddPlaylistSong({ id, songs: this.selectedSongs });
    if (res && res.data.error_message) {
      this.$snackbar.error(res.data.error_message);
    } else {
      this.$snackbar.success(`${c}曲を追加しました`);
    }
  }

  private async removeFromPlaylist(songs?: Song[]) {
    if (this.context === 'playlist') {
      await musicModule.RemovePlaylistSong({ songs: songs || this.selectedSongs });
      await musicModule.ReloadSongs();
    }
  }

  private openDetail(song: Song) {
    this.songInfoDialog.open([song], 0);
  }

  private deleteSong(song: Song) {
    this.$confirm({ message: `本当に"${song.title}"を削除してもよろしいですか？` }).then(() => {
      musicModule.DeleteSong(song.id);
    });
  }

  private onClickRow(song: Song, selected: boolean) {
    if (this.selecting) {
      this.select(song, !selected);
    } else if (this.$pc) {
      this.select(song, true);
    } else {
      this.play(song);
    }
  }

  private showContextMenu(song: Song, x: number, y: number) {
    this.contextMenu = true;
    this.contextMenuTarget = song;
    this.contextMenuX = x;
    this.contextMenuY = y;
  }
}
</script>
<style lang="scss" scoped>
.song-list {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
  user-select: none;
}
</style>
