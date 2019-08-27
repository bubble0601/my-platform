<template>
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
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { Rate } from '@/components';
import { convertTime } from '@/utils';

@Component({
  components: {
    Rate,
  },
})
export default class MusicList extends Vue {
  @Prop({ required: true })
  private tab!: string;

  get fields() {
    return [
      { key: 'title', sortable: true },
      { key: 'artist', sortable: true },
      { key: 'album', sortable: true },
      { key: 'time', sortable: true, formatter: convertTime },
      { key: 'rate', sortable: true },
    ];
  }

  get songs() {
    return musicModule.data;
  }

  get displayedSongs() {
    return musicModule.displayedSongs;
  }
  set displayedSongs(val: Song[]) {
    musicModule.SET_DISPLAYED_SONGS(val);
  }

  @Watch('tab', { immediate: true })
  private onTabChanged() {
    musicModule.FetchSongs(this.tab);
  }

  @Watch('songs')
  private onChanged() {
    // @ts-ignore
    this.$refs.table.refresh();
  }

  private play(item: Song) {
    musicModule.Play(item);
  }

  private updateRate(id: number, val: number) {
    musicModule.UpdateRate({ id, val });
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
</style>
