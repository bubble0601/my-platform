<template>
  <div class="d-flex h-100">
    <div class="playlists dropdown-menu overflow-hidden mt-0 py-0">
      <router-link v-for="playlist in playlists" :key="playlist.id" :to="`/music/playlist/${playlist.id}`"
                   class="dropdown-item px-3 py-1" active-class="active"
                   @dblclick.native="shuffleAndPlay">
        <small>{{ playlist.name }}</small>
      </router-link>
    </div>
    <song-list ref="songList" context="playlist" class="w-100"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { NavigationGuard } from 'vue-router';
import { musicModule } from '@/store';
import SongList from './SongList.vue';

@Component({
  components: {
    SongList,
  },
  beforeRouteEnter(to, from, next) {
    const id = musicModule.playlistId;
    if (!to.params.id && id) next(`/music/playlist/${id}`);
    else next();
  },
})
export default class ArtistList extends Vue {
  @Prop({ default: 0 })
  private id!: number;

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
