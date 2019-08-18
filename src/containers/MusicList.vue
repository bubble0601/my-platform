<template>
  <b-table
    v-model="displayedSongs"
    responsive
    small
    striped
    outlined
    hover
    selectable
    select-mode="range"
    class="music-list"
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

  private displayedSongs: Song[] = [];

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

  @Watch('tab', { immediate: true })
  private onTabChanged() {
    musicModule.FetchSongs(this.tab);
  }

  private play(item: Song) {
    musicModule.Play({ song: item, songs: this.displayedSongs });
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
