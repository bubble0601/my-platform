<template>
  <div v-if="$pc" class="d-flex h-100">
    <b-list-group flush class="playlists">
      <b-list-group-item v-if="playlists.length === 0" variant="secondary" class="text-muted border-0 px-3 py-1 cursor-default">
        <small>empty</small>
      </b-list-group-item>
      <b-list-group-item v-for="p in playlists" :key="p.id"
                        :to="`/music/playlist/${p.id}`" variant="secondary"
                        class="border-0 px-3 py-1" active-class="active"
                        @dblclick.native="shuffleAndPlay">
        <small>{{ p.name }}</small>
      </b-list-group-item>
    </b-list-group>
    <song-list v-if="tab" ref="songList" :tab="tab" class="w-100"/>
    <song-list v-else ref="songList" context="playlist" class="w-100"/>
  </div>
  <div v-else-if="tab">
    <song-list ref="songList" :tab="tab" class="w-100"/>
  </div>
  <div v-else-if="id > 0">
    <song-list ref="songList" context="playlist" class="w-100"/>
  </div>
  <div v-else>
    <b-list-group flush class="playlists">
      <b-list-group-item v-for="p in playlists" :key="p.id"
                         :to="`/music/playlist/${p.id}`" variant="light"
                         class="px-3 py-2" active-class="active"
                         @dblclick.native="shuffleAndPlay">
        <small>{{ p.name }}</small>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { NavigationGuard } from 'vue-router';
import { musicModule, screenModule } from '@/store';
import SongList from './SongList.vue';

@Component({
  components: {
    SongList,
  },
  beforeRouteEnter(to, from, next) {
    const id = Number(to.params.id);
    if (screenModule.isMobile && id > 0) {
      musicModule.FetchSongs({ playlist: id }).then(next);
    } else {
      next();
    }
  },
})
export default class Plylists extends Vue {
  private mPlaylists = [
    { id: 'new', name: 'New' },
    { id: 'fabulous', name: 'Fabulous' },
    { id: 'excellent', name: 'Excellent' },
    { id: 'great', name: 'Great' },
    { id: 'good', name: 'Good' },
    { id: 'unrated', name: 'Unrated' },
  ];

  @Prop({ type: Number, default: 0 })
  private id!: number;

  @Prop({ default: null })
  private tab!: string | null;

  @Ref() private songList!: SongList;

  get playlists() {
    const playlists: Array<{ id: number | string, name: string}> = musicModule.playlists;
    if (this.$mobile) {
      playlists.unshift(...this.mPlaylists);
    }
    return playlists;
  }

  @Watch('id', { immediate: true })
  private onIdChanged() {
    musicModule.FetchSongs({ playlist: this.id });
  }

  private created() {
    musicModule.FetchPlaylists();
  }

  private shuffleAndPlay() {
    this.songList.shuffleAndPlay();
  }
}
</script>
<style lang="scss" scoped>
.playlists {
  background-color: #9994;
  overflow-y: auto;
  overflow-x: hidden;
  word-break: keep-all;
}
</style>
