<template>
  <b-table
    v-model="displayedSongs"
    responsive
    small
    striped
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
import MusicModule, { Song } from '@/store/music';
import { convertTime } from '@/utils';

@Component
export default class extends Vue {
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
    return MusicModule.data;
  }

  @Watch('tab', { immediate: true })
  private onTabChanged() {
    MusicModule.FetchSongs(this.tab);
  }

  private play(item: Song) {
    MusicModule.Play({ song: item, songs: this.displayedSongs });
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
