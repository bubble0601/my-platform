<template>
  <div>
    <v-sheet v-if="$pc" class="d-flex flex-column h-100">
      <v-sheet class="d-flex align-center px-4 py-2">
        <v-btn small icon class="ml-auto" @click="$router.go(-1)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-sheet>
      <div v-if="song" class="d-flex align-start min-h-0">
        <div class="d-flex justify-center w-50">
          <div>
            <cover-art size="300px"/>
            <div class="text-center mt-3">
              <v-rating :value="song.rating" clearable size="1.5rem" dense hover @input="updateRating($event)"/>
            </div>
            <div class="text-center">
              <v-btn large text color="info" class="text-h6" @click="openDetail">{{ song.title }}</v-btn>
            </div>
            <div class="text-center">
              <small>
                <span>{{ song.artist.name }} / {{ song.album.title }}</span>
                <span v-if="song.year">({{ song.year }})</span>
              </small>
            </div>
          </div>
        </div>
        <div class="flex-grow-1 h-100 overflow-auto">
          <div class="pre">
            {{ lyrics }}
          </div>
        </div>
      </div>
    </v-sheet>

    <v-sheet v-else class="d-flex flex-column h-100 overflow-auto">
      <v-sheet class="d-flex align-center px-4 py-2">
        <v-btn small icon class="ml-auto" @click="$router.go(-1)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-sheet>
      <div v-if="song" class="px-4">
        <div class="d-flex justify-center">
          <div>
            <cover-art size="300px"/>
            <div class="text-center mt-3">
              <v-rating :value="song.rating" clearable size="1.5rem" dense hover @input="updateRating($event)"/>
            </div>
            <div class="text-center">
              <v-btn large text color="info" class="text-h6" @click="openDetail">{{ song.title }}</v-btn>
            </div>
            <div class="text-center">
              <small>
                <span>{{ song.artist.name }} / {{ song.album.title }}</span>
                <span v-if="song.year">({{ song.year }})</span>
              </small>
            </div>
          </div>
        </div>
        <div class="pre mt-3">
          {{ lyrics }}
        </div>
      </div>
    </v-sheet>

    <song-info-dialog ref="songInfoDialog"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Ref } from 'vue-property-decorator';
import { musicModule } from '@/store';
import { CoverArt, SongInfoDialog } from '@/components/music';

@Component({
  components: {
    CoverArt,
    SongInfoDialog,
  },
})
export default class PlayingSongInfoView extends Vue {
  private tab: string | null = null;

  private coverArtUrl = '';

  get song() {
    return musicModule.current;
  }

  get metadata() {
    return musicModule.audioMetadata;
  }

  get lyrics() {
    return this.metadata?.tags.lyrics;
  }

  @Ref() private songInfoDialog!: SongInfoDialog;

  @Watch('metadata')
  private onMetadataChanged() {
    this.coverArtUrl = '';
    if (this.metadata?.tags.cover_art != null) {
      const picture = this.metadata.tags.cover_art;
      this.coverArtUrl = `data:${picture.mime};base64,${picture.data}`;
    }
  }

  private async updateRating(val: number) {
    if (this.song == null) return;
    const id = this.song.id;
    await musicModule.UpdateSong({ id, data: { rating: val } });
    await musicModule.ReloadSong(id);
  }

  private openDetail() {
    if (!this.song) return;
    const songs = [this.song].concat(musicModule.queue);
    this.songInfoDialog.open(songs, 0);
  }
}
</script>
<style lang="scss" scoped>
.music-info {
  height: 100%;
}
.music-info__body {
  flex-grow: 1;
  overflow: auto;
}
</style>
