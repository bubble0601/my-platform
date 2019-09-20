<template>
  <div class="d-flex flex-column">
    <div class="d-flex align-items-center">
      <icon-button icon="check-square" tooltip="check all / clear check" @click="toggleSelection"/>
      <icon-button icon="random" tooltip="shuffle and play" class="mr-auto" @click="shuffleAndPlay"/>
      <b-button v-if="context === 'playlist'" size="sm" variant="danger" class="lh-1 mr-2" @click="removeSong">Remove song</b-button>
      <b-dropdown v-else size="sm" toggle-class="lh-1" variant="primary" text="Add to list" class="mr-2">
        <b-dropdown-item v-for="l in playlists" :key="l.id" class="small px-0" @click="addSong(l.id)">
          {{ l.name }}
        </b-dropdown-item>
        <b-dropdown-item class="small px-0" @click="createPlaylist">
          Create new playlist
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <b-table
      v-model="displayedSongs"
      ref="table"
      responsive
      small
      striped
      hover
      selectable
      select-mode="range"
      class="music-list border-bottom"
      :items="songs"
      :fields="fields"
      @row-selected="onSelectedRows"
      @row-dblclicked="play"
    >
      <template slot="[rate]" slot-scope="{ item, value }">
        <rate :value="value" @input="updateRate(item.id, $event)"/>
      </template>
      <template slot="[weight]" slot-scope="{ item, value }">
        <icon-button icon="minus" class="p-0" @click="updateWeight(item.id, value - 1)"/>
        <span class="mx-2">{{ value }}</span>
        <icon-button icon="plus" class="p-0" @click="updateWeight(item.id, value + 1)"/>
      </template>
    </b-table>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { BTable } from 'bootstrap-vue';
import { sample } from 'lodash';
import { musicModule } from '@/store';
import { Song, REPEAT } from '@/store/music';
import { IconButton, Rate } from '@/components';
import { convertTime } from '@/utils';

@Component({
  components: {
    IconButton,
    Rate,
  },
})
export default class SongList extends Vue {
  @Prop({ default: '' })
  private tab!: string;

  @Prop({ default: 'tab' })
  private context!: string;

  private selected: Song[] = [];

  @Ref() private table!: BTable;

  get fields() {
    const fields = [
      { key: 'title', sortable: true },
      { key: 'artist', sortable: true },
      { key: 'album', sortable: true },
      { key: 'rate', sortable: true },
      { key: 'time', sortable: true, formatter: convertTime },
      { key: 'year', sortable: true },
    ];
    if (this.context === 'playlist') {
      fields.push({ key: 'weight', sortable: true });
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

  @Watch('tab', { immediate: true })
  private onTabChanged() {
    if (this.tab) musicModule.FetchSongs({ tab: this.tab });
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

  public shuffleAndPlay() {
    if (this.songs.length === 0) return;
    musicModule.SetControl({ shuffle: true });
    if (musicModule.repeat === REPEAT.ONE) musicModule.SetControl({ repeat: REPEAT.NONE });
    musicModule.Play(sample(this.songs));
  }

  private play(item: Song) {
    musicModule.Play(item);
  }

  private async updateRate(id: number, val: number) {
    await musicModule.UpdateSong({ id, data: { rate: val } });
    if (this.context === 'playlist') {
      musicModule.ReloadPlaylistSong(id);
    } else {
      musicModule.ReloadSong(id);
    }
  }

  private updateWeight(id: number, val: number) {
    if (val < 0) return;
    musicModule.UpdatePlaylistSong({ id, data: { weight: val } });
    musicModule.ReloadPlaylistSong(id);
  }
}
</script>
<style lang="scss" scoped>
.music-list {
  font-size: 11px;
}
</style>
<style lang="scss">
.music-list td {
  padding: .1rem .3rem;
  vertical-align: middle;
}
</style>
