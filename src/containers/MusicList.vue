<template>
  <b-table
    v-model="displayedSongs"
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
  />
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { convertTime } from '@/utils';

@Component
export default class MusicList extends Vue {
  @Prop({ required: true })
  private tab!: string;

  get fields() {
    return [
      { key: 'title', sortable: true },
      { key: 'artist', sortable: true },
      { key: 'album', sortable: true },
      { key: 'time', sortable: true, formatter: convertTime },
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

  private play(item: Song) {
    musicModule.Play(item);
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
