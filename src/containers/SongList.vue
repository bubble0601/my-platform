<template>
  <div class="d-flex flex-column">
    <div class="d-flex">
      <b-button v-b-tooltip="{ title: 'shuffle and play', delay: { show: 1000, hide: 0 } }"
                variant="link" class="shuffle-btn ml-auto" @click="shuffleAndPlay">
        <v-icon name="random"/>
      </b-button>
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
      @row-dblclicked="play"
    >
      <template slot="[rate]" slot-scope="{ item, value }">
        <rate :value="value" @input="updateRate(item.id, $event)"/>
      </template>
    </b-table>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { sample } from 'lodash';
import { musicModule } from '@/store';
import { Song, REPEAT } from '@/store/music';
import { Rate } from '@/components';
import { convertTime } from '@/utils';

@Component({
  components: {
    Rate,
  },
})
export default class SongList extends Vue {
  @Prop({ default: '' })
  private tab!: string;

  get fields() {
    return [
      { key: 'title', sortable: true },
      { key: 'artist', sortable: true },
      { key: 'album', sortable: true },
      { key: 'rate', sortable: true },
      { key: 'time', sortable: true, formatter: convertTime },
      { key: 'year', sortable: true },
    ];
  }

  get songs() {
    return musicModule.songs;
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

  private play(item: Song) {
    musicModule.Play(item);
  }

  public shuffleAndPlay() {
    if (this.songs.length === 0) return;
    musicModule.SetControl({ shuffle: true });
    if (musicModule.repeat === REPEAT.ONE) musicModule.SetControl({ repeat: REPEAT.NONE });
    musicModule.Play(sample(this.songs));
  }

  private updateRate(id: number, val: number) {
    musicModule.UpdateSong({ id, data: { rate: val } });
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
}
.shuffle-btn {
  text-decoration: none!important;
}
</style>
