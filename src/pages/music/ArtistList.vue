<template>
  <div v-if="$pc" class="d-flex h-100">
    <div class="artist-list dropdown-menu mt-0 py-0">
      <router-link v-for="artist in artists" :key="artist.id" :to="`/music/artist/${artist.id}`"
                   class="dropdown-item px-3 py-1" active-class="active"
                   @dblclick.native="shuffleAndPlay">
        <small>{{ artist.name }}</small>
      </router-link>
    </div>
    <song-list ref="songList" context="artist" class="w-100"/>
  </div>
  <div v-else-if="id > 0">
    <song-list ref="songList" context="artist" class="w-100"/>
  </div>
  <div v-else>
    <div class="artist-list dropdown-menu mt-0 py-0 w-100">
      <router-link v-for="artist in artists" :key="artist.id" :to="`/music/artist/${artist.id}`"
                   class="dropdown-item px-3 py-1" active-class="active"
                   @dblclick.native="shuffleAndPlay">
        <small>{{ artist.name }}</small>
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
    if (screenModule.isMobile && from.path.startsWith('/music/artist')) {
      next();
      return;
    }
    const id = musicModule.artistId;
    if (!to.params.id && id) next(`/music/artist/${id}`);
    else next();
  },
})
export default class ArtistList extends Vue {
  @Prop({ type: Number, default: 0 })
  private id!: number;

  @Ref() private songList!: SongList;

  get artists() {
    return musicModule.artists;
  }

  @Watch('id', { immediate: true })
  private onIdChanged() {
    musicModule.FetchSongs({ artist: this.id });
  }

  private created() {
    musicModule.FetchArtists();
  }

  private shuffleAndPlay() {
    this.songList.shuffleAndPlay();
  }
}
</script>
<style lang="scss" scoped>
.artist-list {
  display: block;
  position: static;
  min-width: 0;
  font-size: .9rem;
  border: none;
  border-radius: 0;
  background-color: #9994;
  overflow-y: auto;
  overflow-x: hidden;
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
