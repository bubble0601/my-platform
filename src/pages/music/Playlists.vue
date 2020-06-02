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
    <song-list ref="songList" context="playlist" class="w-100"/>
  </div>
  <div v-else-if="id !== 0">
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
import { isString } from 'lodash';
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
export default class Playlists extends Vue {
  @Prop({ type: [Number, String], default: 0 })
  private id!: number | string;

  @Ref() private songList!: SongList;

  get playlists() {
    if (this.$pc) {
      return musicModule.playlists;
    }
    return this.livePlaylists.concat(musicModule.playlists);
  }

  get livePlaylists() {
    return musicModule.livePlaylists;
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
