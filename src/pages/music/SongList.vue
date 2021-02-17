<template>
  <div class="d-flex flex-column">
    <div class="d-flex align-items-center">
      <icon-button v-if="$mobile" icon="chevron-left" @click="$emit('back')"/>
      <icon-button icon="check-square" tooltip="全チェック / クリア" @click="toggleSelection"/>
      <icon-button icon="shuffle" tooltip="シャッフル再生" @click="shuffleAndPlay"/>
      <icon-button icon="arrow-clockwise" rotate="45" tooltip="更新" @click="reloadSongs"/>
      <div class="ml-auto"/>
      <template v-if="$pc">
        <b-button v-if="context === 'playlist' || context === 'temp'" size="sm" variant="danger" class="lh-1 mr-2" @click="removeFromPlaylist">プレイリストから削除</b-button>
        <b-dropdown v-else size="sm" toggle-class="lh-1" variant="primary" text="プレイリストに追加" class="mr-2">
          <b-dropdown-item v-if="temporaryPlaylist" v-t="'music.temporary'" class="small px-0" @click="addToTemplist"/>
          <b-dropdown-item v-for="l in playlists" :key="l.id" class="small px-0" @click="addToPlaylist(l.id)">
            {{ l.name }}
          </b-dropdown-item>
          <b-dropdown-item class="small px-0" @click="createPlaylist">
            新規作成
          </b-dropdown-item>
        </b-dropdown>
      </template>
      <b-pagination v-model="currentPage" :total-rows="songs.length" :per-page="perPage" size="sm" class="my-0 mr-2"/>
    </div>
    <b-table
      v-model="displayedSongs"
      ref="table"
      responsive
      :small="$pc"
      striped
      hover
      selectable
      select-mode="range"
      class="music-list border-bottom mb-0"
      :class="{ 'music-list-pc': $pc }"
      :items="songs"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage"
      @row-selected="onSelectedRows"
      @row-dblclicked="play"
      @row-contextmenu="showContextMenu"
    >
      <template #cell(checkbox)="{ rowSelected, selectRow, unselectRow }">
        <b-form-checkbox :checked="rowSelected" @change="$event ? selectRow() : unselectRow()"/>
      </template>
      <template #cell(rating)="{ item, value }">
        <rating :value="value" @input="updateRating(item.id, $event)"/>
      </template>
      <template #cell(weight)="{ item, value }">
        <icon-button icon="dash" class="p-0" @click="updateWeight(item.id, value - 1)"/>
        <span class="mx-2">{{ value }}</span>
        <icon-button icon="plus" class="p-0" @click="updateWeight(item.id, value + 1)"/>
      </template>
    </b-table>
    <!-- dialog -->
    <song-info-dialog ref="songInfoDialog"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { BTable, BvTableFieldArray } from 'bootstrap-vue';
import { musicModule } from '@/store';
import { REPEAT } from '@/store/music';
import { Song } from '@/api/music';
import { formatTime } from '@/utils';
import { ContextMenu, IconButton, Rating } from '@/components';
import { ContextMenuItem } from '@/types';
import { SongInfoDialog } from './components';

@Component({
  components: {
    IconButton,
    Rating,
    SongInfoDialog,
  },
})
export default class SongList extends Vue {
  @Prop({ type: String, default: 'tab' })
  private context!: string;

  private selected: Song[] = [];
  private currentPage = 1;
  private perPage = 100;

  @Ref() private table!: BTable;
  @Ref() private songInfoDialog!: SongInfoDialog;

  get fields() {
    const fields: BvTableFieldArray = [
      { key: 'checkbox', label: '', sortable: false, tdClass: 'px-1' },
      { key: 'title', label: this.$t('music.fields.title') as string, sortable: true },
      { key: 'artist', label: this.$t('music.fields.artist') as string, formatter: (value) => value.name , sortable: true, sortByFormatted: true },
    ];
    if (this.$pc) {
      fields.push({ key: 'album', label: this.$t('music.fields.album') as string, formatter: (value) => value.title, sortable: true, sortByFormatted: true });
    }
    fields.push({ key: 'rating', label: this.$t('music.fields.rating') as string, sortable: true });
    if (this.$pc) {
      fields.push({ key: 'time', label: this.$t('music.fields.time') as string, sortable: true, formatter: formatTime });
      fields.push({ key: 'year', label: this.$t('music.fields.year') as string, sortable: true });
      fields.push({ key: 'played_count', label: this.$t('music.fields.played_count') as string, sortable: true });
      // fields.push({ key: 'created_at', label: this.$t('music.fields.created_at') as string, sortable: true });
    }
    if (this.context === 'playlist') {
      fields.push({ key: 'weight', label: this.$t('music.fields.weight') as string, sortable: true, tdClass: this.$pc ? '' : 'px-0' });
    }
    return fields;
  }

  get songs() {
    return musicModule.songs;
  }

  get playlists() {
    return musicModule.playlists;
  }

  get temporaryPlaylist() {
    return musicModule.temporaryPlaylist;
  }

  get displayedSongs() {
    return musicModule.displayedSongs;
  }
  set displayedSongs(val: Song[]) {
    musicModule.SET_DISPLAYED_SONGS(val);
  }

  @Watch('context', { immediate: true })
  private onContextChanged() {
    if (this.context === 'all') musicModule.FetchAll();
  }

  private created() {
    musicModule.FetchPlaylists();
  }

  private createPlaylist() {
    this.$prompt('Playlist name').then((res) => {
      musicModule.CreatePlaylist({ name: res, songs: this.selected });
    });
  }

  private onSelectedRows(items: Song[]) {
    this.selected = items;
  }

  private toggleSelection() {
    if (this.selected.length > 0) {
      this.table.clearSelected();
    } else {
      this.table.selectAllRows();
    }
  }

  private async addToPlaylist(id: number) {
    const res = await musicModule.AddPlaylistSong({ id, songs: this.selected });
    if (res && res.data.error_message) {
      this.$message.warn(res.data.error_message);
    }
  }

  private addToTemplist(id: number) {
    musicModule.ADD_TO_TEMPORARY_PLAYLIST(this.selected);
  }

  private async removeFromPlaylist() {
    if (this.context === 'playlist') {
      await musicModule.RemovePlaylistSong({ songs: this.selected });
      await musicModule.ReloadSongs();
    } else {
      musicModule.REMOVE_FROM_TEMPORARY_PLAYLIST(this.selected);
      if (musicModule.temporaryPlaylist) musicModule.SET_SONGS(musicModule.temporaryPlaylist);
    }
  }

  private play(item: Song) {
    musicModule.PlayAndSet(item);
  }

  public shuffleAndPlay() {
    if (this.songs.length === 0) return;
    musicModule.SetControl({ shuffle: true });
    if (musicModule.repeat === REPEAT.ONE) musicModule.SetControl({ repeat: REPEAT.NONE });
    if (this.selected.length) {
      musicModule.PlaySongs(this.selected);
    } else {
      musicModule.PlaySongs(this.songs);
    }
  }

  public reloadSongs() {
    musicModule.ReloadSongs();
  }

  private async updateRating(id: number, val: number) {
    await musicModule.UpdateSong({ id, data: { rating: val } });
    await musicModule.ReloadSong(id);
  }

  private async updateWeight(id: number, val: number) {
    if (val < 0) return;
    await musicModule.UpdatePlaylistSong({ id, data: { weight: val } });
    await musicModule.ReloadSong(id);
  }

  private showContextMenu(item: Song, n: number, e: MouseEvent) {
    e.preventDefault();

    const menuItems: ContextMenuItem[] = [];
    const songs = this.selected.length ? this.selected : [item];
    menuItems.push(
      { key: 'play', text: '再生', action: () => {
        if (this.selected.length) {
          musicModule.PlaySongs(this.selected);
        } else {
          this.play(item);
        }
      } },
      { key: 'playNext', text: '次に再生', action: () => { musicModule.InsertIntoNext(songs); } },
      { key: 'jumpToArtist', text: `"${item.album.artist}"へ`, action: () =>  { this.$router.push(`/music/artist/${item.artist.id}`); } },
    );
    if (this.context === 'playlist' || this.context === 'temp') {
      menuItems.push({
        key: 'removeFromPlaylist',
        text: 'プレイリストから削除',
        action: async () => {
          if (this.context === 'playlist') {
            await musicModule.RemovePlaylistSong({ songs });
            await musicModule.ReloadSongs();
          } else {
            musicModule.REMOVE_FROM_TEMPORARY_PLAYLIST(songs);
            if (musicModule.temporaryPlaylist) musicModule.SET_SONGS(musicModule.temporaryPlaylist);
          }
        },
      });
    } else {
      menuItems.push({
        key: 'addToPlaylist',
        text: 'プレイリストに追加',
        children: [
          {
            key: 'temp',
            text: this.$t('music.temporary') as string,
            action: () => {
              musicModule.ADD_TO_TEMPORARY_PLAYLIST(songs);
            },
          },
          ...this.playlists.map((l) => ({
            key: l.id,
            text: l.name,
            action: () => {
              musicModule.AddPlaylistSong({ id: l.id, songs });
            },
          })),
          {
            key: 'create',
            text: 'Create new playlist',
            action: () => {
              this.$prompt('Playlist name').then((res) => {
                musicModule.CreatePlaylist({ name: res, songs });
              });
            },
          },
        ],
      });
    }
    menuItems.push({
      key: 'delete',
      text: '曲を削除',
      action: () => {
        if (this.selected.length) {
          const songsStr = this.selected.map((s) => `  ${s.title} by ${s.artist.name}`).join('\n');
          this.$confirm(`Do you really delete these songs?\n${songsStr}`).then(() => {
            songs.forEach((s) => {
              musicModule.DeleteSong(s.id);
            });
          });
        } else {
          this.$confirm(`Do you really delete '${item.title}' by ${item.artist.name}?`).then(() => {
            musicModule.DeleteSong(item.id);
          });
        }
      },
    });
    menuItems.push({
      key: 'showDetail',
      text: '詳細を表示',
      action: () => {
        this.songInfoDialog.open(this.displayedSongs, n);
      },
    });

    new ContextMenu().show({
      items: menuItems,
      position: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  }
}
</script>
<style lang="scss" scoped>
.music-list {
  font-size: 11px;
}
</style>
<style lang="scss">
.music-list.music-list-pc td {
  padding: .1rem .3rem;
}
.music-list td {
  vertical-align: middle;
  user-select: none;
  padding: .2rem .1rem;
}
</style>
