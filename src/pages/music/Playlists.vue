<template>
  <div v-if="$pc" class="d-flex h-100">
    <div class="playlists dropdown-menu overflow-hidden mt-0 py-0">
      <router-link v-for="p in playlists" :key="p.id" :to="`/music/playlist/${p.id}`"
                   class="dropdown-item px-3 py-1" active-class="active"
                   @dblclick.native="shuffleAndPlay">
        <small>{{ p.name }}</small>
      </router-link>
    </div>
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
    <div class="playlists dropdown-menu overflow-hidden mt-0 py-0 w-100">
      <router-link v-for="p in mPlaylists" :key="p.key" :to="`/music/playlist/${p.key}`"
                  class="dropdown-item px-3 py-1" active-class="active"
                  @dblclick.native="shuffleAndPlay">
        <small>{{ p.name }}</small>
      </router-link>
      <router-link v-for="p in playlists" :key="p.id" :to="`/music/playlist/${p.id}`"
                   class="dropdown-item px-3 py-1" active-class="active"
                   @dblclick.native="shuffleAndPlay">
        <small>{{ p.name }}</small>
      </router-link>
    </div>
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
    if (screenModule.isMobile && from.path.startsWith('/music/playlist')) {
      next();
      return;
    }
    const id = musicModule.playlistId;
    if (!to.params.id && !to.params.tab && id) next(`/music/playlist/${id}`);
    else next();
  },
})
export default class ArtistList extends Vue {
  private mPlaylists = [
    { key: 'new', name: 'New' },
    { key: 'fabulous', name: 'Fabulous' },
    { key: 'excellent', name: 'Excellent' },
    { key: 'great', name: 'Great' },
    { key: 'good', name: 'Good' },
    { key: 'unrated', name: 'Unrated' },
  ];

  @Prop({ type: Number, default: 0 })
  private id!: number;

  @Prop({ default: null })
  private tab!: string | null;

  @Ref() private songList!: SongList;

  get playlists() {
    return musicModule.playlists;
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
  display: block;
  position: static;
  min-width: 0;
  font-size: .9rem;
  border: none;
  border-radius: 0;
  background-color: #9994;
  .dropdown-item {
    border-top: 1px solid #0001;
    &:last-child {
      border-bottom: 1px solid #0001;
    }
    &:hover:not(.active) {
      background-color: #9996;
    }
  }
}
</style>
