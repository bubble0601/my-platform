<template>
  <div class="h-100">
    <v-data-iterator
      :loading="loading"
      :items="artists"
      :locale="$vuetify.lang.current"
      :items-per-page="-1"
      :search="search"
      hide-default-footer
      class="artist-list"
    >
      <template #loading>
        <v-progress-linear indeterminate/>
      </template>

      <template #default="{ items }">
        <div class="artist-list__body" @scroll="contextMenu = false">
          <v-row
              v-for="artist in items"
              :key="artist.id"
              v-ripple
              dense
              align="center"
              class="artist-list__row"
              @click="$router.push(`/music/artist/${artist.id}`)"
              @contextmenu.prevent="showContextMenu(artist, $event.clientX, $event.clientY)"
          >
            <v-col cols="2" sm="1" class="text-center">
              <v-avatar size="32">
                <v-icon>person</v-icon>
              </v-avatar>
            </v-col>
            <v-col>
              <div>{{ artist.name }}</div>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-data-iterator>

    <v-menu v-model="contextMenu" :position-x="contextMenuX" :position-y="contextMenuY">
      <v-list v-if="contextMenuTarget" dense>
        <v-list-item @click="editRuby">ふりがなを編集</v-list-item>
        <v-list-item @click="play">再生</v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Artist } from '@/api/music';
import { musicModule } from '@/store';
import { MusicApi } from '@/api';

@Component
export default class ArtistList extends Vue {
  @Prop({ type: Array, required: true })
  private artists!: Artist[];

  @Prop({ type: Boolean, default: false })
  private loading!: boolean;

  @Prop({ type: String, default: '' })
  private search!: string;

  // private view: 'grid' | 'list' = 'list';

  private contextMenu = false;
  private contextMenuTarget: Artist | null = null;
  private contextMenuX = 0;
  private contextMenuY = 0;

  // @Watch('view')
  // protected saveView() {
  //   localStorage.setItem('artist-list.view', this.view);
  // }

  private showContextMenu(artist: Artist, x: number, y: number) {
    this.contextMenu = true;
    this.contextMenuTarget = artist;
    this.contextMenuX = x;
    this.contextMenuY = y;
  }

  private editRuby() {
    const artist = this.contextMenuTarget;
    if (artist == null) return;
    this.$prompt({ title: 'ふりがなを入力', value: artist.ruby }).then(async(res) => {
      await MusicApi.updateArtist(artist.id, { ruby: res });
    });
  }

  private async play() {
    if (this.contextMenuTarget?.id != null) {
      const songs = (await MusicApi.fetchArtistSongs(this.contextMenuTarget.id)).data;
      musicModule.PlaySongs(songs);
    }
  }
}
</script>
<style lang="scss" scoped>
.artist-list {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  user-select: none;

  .artist-list__body {
    flex-grow: 1;
    overflow: auto;
  }

  .artist-list__row {
    margin: 0;
    cursor: pointer;
    &:hover {
      background-color: #80808020;
    }
  }
}
</style>
