<template>
  <div v-if="$pc" class="d-flex h-100">
    <div class="artists pc">
      <b-input-group class="search_input-group">
        <b-input-group-prepend is-text>
          <b-icon icon="search"/>
        </b-input-group-prepend>
        <b-form-input v-model.trim="query" autofocus class="search_input"/>
      </b-input-group>
      <b-list-group flush>
        <b-list-group-item v-for="artist in artists" :key="artist.id"
                          :to="`/music/artist/${artist.id}`"
                          class="border-0 px-3 py-1 user-select-none" active-class="active"
                          @dblclick.native="shuffleAndPlay"
                          @click.native.right.prevent="showContextMenu($event, artist)">
          <small>{{ artist.name }}</small>
        </b-list-group-item>
      </b-list-group>
    </div>
    <song-list ref="songList" context="artist" class="w-100"/>
  </div>
  <div v-else-if="id >= 0">
    <song-list ref="songList" context="artist" class="w-100" @back="$router.push('/music/artist')"/>
  </div>
  <div v-else class="artists">
    <b-input-group class="search_input-group">
      <b-input-group-prepend is-text>
        <b-icon icon="search"/>
      </b-input-group-prepend>
      <b-form-input v-model.trim="query" class="search_input"/>
    </b-input-group>
    <b-list-group flush>
      <b-list-group-item v-for="artist in artists" :key="artist.id"
                         :to="`/music/artist/${artist.id}`" variant="light"
                         class="px-3 py-2 user-select-none" active-class="active"
                         @dblclick.native="shuffleAndPlay"
                         @click.native.right.prevent="showContextMenu($event, artist)">
        <small>{{ artist.name }}</small>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import axios from 'axios';
import { musicModule, viewModule } from '@/store';
import { Artist } from '@/api/music';
import { ContextMenu } from '@/components';
import SongList from './SongList.vue';

@Component({
  components: {
    SongList,
  },
  beforeRouteEnter(to, from, next) {
    const id = Number(to.params.id);
    if (viewModule.isPC && !id && musicModule.artistId) {
      next(`/music/artist/${musicModule.artistId}`);
    } else if (viewModule.isMobile && id >= 0) {
      musicModule.FetchArtistSongs(id).then(next);
    } else {
      next();
    }
  },
})
export default class Artists extends Vue {
  @Prop({ type: Number, default: -1 })
  private id!: number;

  private query: string = '';

  @Ref() private songList!: SongList;

  get artists() {
    if (!this.query) return musicModule.artists;
    return musicModule.artists.filter((artist) => artist.name.toUpperCase().includes(this.query.toUpperCase()));
  }

  @Watch('id', { immediate: true })
  private onIdChanged() {
    musicModule.FetchArtistSongs(this.id);
  }

  private created() {
    musicModule.FetchArtists();
  }

  private shuffleAndPlay() {
    this.songList.shuffleAndPlay();
  }

  private showContextMenu(e: MouseEvent, artist: Artist) {
    new ContextMenu().show({
      items: [
        {
          key: 'editRuby',
          text: 'ふりがなを編集',
          action: () => {
            this.$prompt({ title: 'ふりがなを入力', value: artist.ruby }).then(async (res) => {
              await axios.put(`/api/music/artists/${artist.id}`, { ruby: res });
              musicModule.FetchArtists();
            });
          },
        },
      ],
      position: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  }
}
</script>
<style lang="scss" scoped>
@import '@/scss/theme/default';
.artists {
  overflow-y: auto;
  overflow-x: hidden;
  word-break: keep-all;
  &.pc {
    width: 14rem;
  }

  @include theme('light') {
    background-color: $gray-400;
  }
  @include theme('dark') {
    background-color: $gray-600;
  }
}

.search_input:focus {
  border-color: #ced4da;
  border-bottom-color: #80bdff;
  box-shadow: 0 -0.08rem 0 0 rgba(0, 123, 255, 0.125) inset;
}
</style>
<style lang="scss">
.artists .search_input-group {
  .search_input, .input-group-text {
    border-radius: 0;
  }
}
</style>
