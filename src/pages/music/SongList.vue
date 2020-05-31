<template>
  <div class="d-flex flex-column">
    <div class="d-flex align-items-center">
      <icon-button v-if="$mobile" icon="chevron-left" @click="$router.push(`/music/${context === 'tab' ? 'playlist' : context}`)"/>
      <icon-button icon="check-box" tooltip="check all / clear check" @click="toggleSelection"/>
      <icon-button icon="shuffle" tooltip="shuffle and play" class="mr-auto" @click="shuffleAndPlay"/>
      <b-button v-if="context === 'playlist'" size="sm" variant="danger" class="lh-1 mr-2" @click="removeSong">Remove song</b-button>
      <b-dropdown v-else size="sm" toggle-class="lh-1" variant="primary" text="Add to list" class="mr-2">
        <b-dropdown-item v-for="l in playlists" :key="l.id" class="small px-0" @click="addSong(l.id)">
          {{ l.name }}
        </b-dropdown-item>
        <b-dropdown-item class="small px-0" @click="createPlaylist">
          Create new playlist
        </b-dropdown-item>
      </b-dropdown>
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
      <template #cell(rate)="{ item, value }">
        <rate :value="value" @input="updateRate(item.id, $event)"/>
      </template>
      <template #cell(weight)="{ item, value }">
        <icon-button icon="dash" class="p-0" @click="updateWeight(item.id, value - 1)"/>
        <span class="mx-2">{{ value }}</span>
        <icon-button icon="plus" class="p-0" @click="updateWeight(item.id, value + 1)"/>
      </template>
    </b-table>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { BTable, BvTableFieldArray } from 'bootstrap-vue';
import { isNumber, sample } from 'lodash';
import { musicModule } from '@/store';
import { Song, REPEAT, getFilepath } from '@/store/music';
import { ContextMenu, IconButton, Rate } from '@/components';
import { EditSongDialog } from './components';
import { formatTime, download } from '@/utils';

@Component({
  components: {
    IconButton,
    Rate,
  },
})
export default class SongList extends Vue {
  @Prop({ type: String, default: '' })
  private tab!: string;

  @Prop({ type: String, default: 'tab' })
  private context!: string;

  private selected: Song[] = [];
  private currentPage = 1;
  private perPage = 100;

  @Ref() private table!: BTable;

  get fields() {
    const fields: BvTableFieldArray = [
      { key: 'checkbox', label: '', sortable: false, tdClass: 'px-1' },
      { key: 'title', sortable: true },
      { key: 'artist', formatter: (value) => value.name , sortable: true, sortByFormatted: true },
    ];
    if (this.$pc) {
      fields.push({ key: 'album', formatter: (value) => value.title, sortable: true, sortByFormatted: true });
    }
    fields.push({ key: 'rate', sortable: true });
    if (this.$pc) {
      fields.push({ key: 'time', sortable: true, formatter: formatTime });
      fields.push({ key: 'year', sortable: true });
      // fields.push({ key: 'created_at', sortable: true });
    }
    if (this.context === 'playlist' && isNumber(musicModule.playlistId)) {
      fields.push({ key: 'weight', sortable: true, tdClass: this.$pc ? '' : 'px-0' });
    }
    return fields;
  }

  get songs() {
    return musicModule.songs;
  }

  get playlists() {
    return musicModule.playlists;
  }

  get displayedSongs() {
    return musicModule.displayedSongs;
  }
  set displayedSongs(val: Song[]) {
    musicModule.SET_DISPLAYED_SONGS(val);
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

  private addSong(id: number) {
    musicModule.AddPlaylistSong({ id, songs: this.selected });
  }

  private removeSong() {
    musicModule.RemovePlaylistSong({ songs: this.selected });
  }

  private play(item: Song) {
    musicModule.PlayAndSet(item);
  }

  public shuffleAndPlay() {
    if (this.songs.length === 0) return;
    musicModule.SetControl({ shuffle: true });
    if (musicModule.repeat === REPEAT.ONE) musicModule.SetControl({ repeat: REPEAT.NONE });
    musicModule.PlayAndSet(sample(this.songs));
  }

  private insertIntoNext(item: Song) {
    musicModule.InsertIntoNext(item);
  }

  private async updateRate(id: number, val: number) {
    await musicModule.UpdateSong({ id, data: { rate: val } });
    if (this.context === 'playlist' && isNumber(musicModule.playlistId)) {
      musicModule.ReloadPlaylistSong(id);
    } else {
      musicModule.ReloadSong(id);
    }
  }

  private async updateWeight(id: number, val: number) {
    if (val < 0) return;
    await musicModule.UpdatePlaylistSong({ id, data: { weight: val } });
    await musicModule.ReloadPlaylistSong(id);
  }

  private showContextMenu(item: Song, n: number, e: MouseEvent) {
    e.preventDefault();
    new ContextMenu().show({
      items: [
        { text: '再生', action: () => { this.play(item); } },
        { text: '次に再生', action: () => { this.insertIntoNext(item); } },
        { text: `"${item.artist.name}"へ`, action: () =>  { this.$router.push(`/music/artist/${item.artist.id}`); } },
        {
          text: '編集',
          action: () => {
            const dialog = new EditSongDialog({
              parent: this,
              propsData: {
                getNeighborSong: (current?: Song) => {
                  if (!current) return {};
                  const i = this.displayedSongs.indexOf(current);
                  return {
                    prevSong: this.displayedSongs[i - 1],
                    nextSong: this.displayedSongs[i + 1],
                  };
                },
              },
            });
            dialog.open(item);
          },
        },
        { text: 'ダウンロード', action: () => { download(getFilepath(item)); } },
      ],
      event: e,
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
