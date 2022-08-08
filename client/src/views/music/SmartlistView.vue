<template>
  <div class="d-flex">
    <music-nav-menu/>
    <div class="flex-grow-1">
      <smartlist-list v-if="smartlistId === -1"/>
      <song-list v-else context="smartlist" :loading="loading" :songs="songs" @refresh="fetch"/>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import MusicApi, { Song } from '@/api/music';
import { SmartlistList, SongList, MusicNavMenu } from '@/components/music';

@Component({
  components: {
    SmartlistList,
    SongList,
    MusicNavMenu,
  },
})
export default class SmartlistView extends Vue {
  @Prop({ type: Number, default: -1 })
  private smartlistId!: number;

  private loading = false;
  private songs: Song[] = [];

  @Watch('smartlistId', { immediate: true })
  private onSmartlistIdChanged() {
    if (this.smartlistId !== -1) this.fetch();
  }

  private created() {
    // musicModule.FetchSmartlists();
  }

  private async fetch() {
    this.loading = true;
    this.songs = (await MusicApi.fetchSmartlistSongs(this.smartlistId)).data;
    this.loading = false;
  }
}
</script>
