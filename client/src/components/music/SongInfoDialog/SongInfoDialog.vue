<template>
  <v-dialog v-model="show" :fullscreen="$mobile" scrollable>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>楽曲を編集</v-toolbar-title>
        <v-spacer/>
        <v-btn icon @click="show = false">
          <v-icon>close</v-icon>
        </v-btn>
        <template #extension>
          <v-tabs v-model="tab">
            <v-tabs-slider/>
            <v-tab v-for="t in tabs" :key="t.key">{{ t.title }}</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-tabs-items v-model="tab" class="overflow-y-auto" style="height: calc(100% - 156px);">
        <v-tab-item key="info">
          <v-container>
            <v-row v-if="song">
              <template v-for="item in songDetails">
                <v-col :key="`${item.key}_h`" cols="12" sm="4" class="font-weight-bold">
                  {{ item.header }}
                </v-col>
                <v-col :key="`${item.key}_v`" cols="12" sm="8" :class="item.class">
                  <span v-if="item.type === 'simple'">
                    {{ item.value || song[item.key] }}
                  </span>
                  <v-rating v-else-if="item.type === 'rating'" :value="song.rating" @input="updateRating"/>
                  <a v-else-if="item.type === 'file'" :href="getFilepath(song)" :download="song.filename">
                    {{ song.filename }}
                  </a>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-tab-item>
        <v-tab-item key="tag">
          <tag-editor :song="song" :metadata="metadata" @updated="reload"/>
        </v-tab-item>
        <v-tab-item key="edit">
          <audio-editor :song="song" :data="audioData" @updated="reload"/>
        </v-tab-item>
        <v-tab-item key="lyrics">
          <lyrics-editor :song="song" :metadata="metadata" @updated="reload"/>
        </v-tab-item>
        <v-tab-item key="coverart">
          <cover-art-editor :song="song" :metadata="metadata" @updated="reload"/>
        </v-tab-item>
      </v-tabs-items>
      <v-divider/>
      <v-card-actions>
        <v-btn icon :disabled="!prevSong" @click="prev">
          <v-icon>arrow_back_ios</v-icon>
        </v-btn>
        <v-btn icon :disabled="!nextSong" @click="next">
          <v-icon>arrow_forward_ios</v-icon>
        </v-btn>
        <v-spacer/>
        <v-btn text color="primary" @click="show = false">閉じる</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { findIndex } from 'lodash';
import { musicModule } from '@/store';
import { Song, Metadata, getFilepath } from '@/api/music';
import { formatTime, formatBytes } from '@/utils';
import TagEditor from './TagEditor.vue';
import AudioEditor from './AudioEditor.vue';
import LyricsEditor from './LyricsEditor.vue';
import CoverArtEditor from './CoverArtEditor.vue';

@Component({
  components: {
    TagEditor,
    AudioEditor,
    LyricsEditor,
    CoverArtEditor,
  },
  i18n: {
    messages: {
      ja: {
        info: '情報',
        tag: 'タグ',
        edit: '加工',
        lyrics: '歌詞',
        coverart: 'アートワーク',
      },
    },
  },
})
export default class SongInfoDialog extends Vue {
  private readonly formatTime = formatTime;
  private readonly formatBytes = formatBytes;
  private readonly getFilepath = getFilepath;

  private show = false;
  private tab = 'info';
  private songs: Song[] = [];
  private index = 0;
  private audioData: Blob | null = null;
  private metadata: Metadata | null = null;

  get tabs() {
    return [
      { key: 'info', title: this.$t('info') },
      { key: 'tag', title: this.$t('tag') },
      { key: 'edit', title: this.$t('edit') },
      { key: 'lyrics', title: this.$t('lyrics') },
      { key: 'coverart', title: this.$t('coverart') },
    ];
  }

  get song() {
    return this.songs[this.index];
  }

  set song(song: Song) {
    this.$set(this.songs, this.index, song);
  }

  get prevSong(): Song | undefined {
    return this.songs[this.index - 1];
  }

  get nextSong(): Song | undefined {
    return this.songs[this.index + 1];
  }

  get songDetails() {
    const s = this.song;
    if (!s) return [];
    return [
      { type: 'simple', key: 'title', header: 'タイトル' },
      { type: 'simple', key: 'artist', header: 'アーティスト', value: s.artist.name, class: { 'grey--text': s.artist.id == null } },
      { type: 'simple', key: 'album', header: 'アルバム', value: s.album.title, class: { 'grey--text': s.album.id == null } },
      { type: 'simple', key: 'album_artist', header: 'アルバムアーティスト', value: s.album.artist, class: { 'grey--text': !s.album.artist } },
      { type: 'simple', key: 'year', header: '年' },
      { type: 'rating', key: 'rating', header: 'レート' },
      { type: 'simple', key: 'time', header: '再生時間', value: formatTime(s.time) },
      { type: 'simple', key: 'created_at', header: '追加日' },
      { type: 'file', key: 'filename', header: 'ファイル名' },
      { type: 'simple', key: 'size', header: 'ファイルサイズ', value: this.filesize },
      { type: 'simple', key: 'codec', header: 'コーデック', value: this.format.codec },
      { type: 'simple', key: 'bitrate', header: 'ビットレート', value: this.format.bitrate ? `${(this.format.bitrate / 1000).toFixed(1)}kbps`: '' },
      { type: 'simple', key: 'samipling_rate', header: 'サンプリングレート', value: `${this.format.sample_rate / 1000}kHz` },
      { type: 'simple', key: 'tag_type', header: 'タグフォーマット', value: this.format.tag_type },
    ];
  }

  get format(): Metadata["format"] | Record<string, never> {
    if (this.metadata) {
      return this.metadata.format;
    }
    return {};
  }

  get filesize() {
    if (this.audioData) {
      return formatBytes(this.audioData.size);
    }
    return '';
  }

  // @Ref() private searchInfoDialog!: BModal;

  private async changeSong(song: Song) {
    const res = await musicModule.FetchAudio(song);
    this.audioData = res.audio;
    this.metadata = res.meta;
  }

  public async open(songs: Song[], i: number, tab = 'info') {
    if (i < 0 || i >= songs.length) {
      this.$snackbar.error('Invalid operation');
      return;
    }
    this.songs = songs;
    this.index = i;
    this.tab = tab;
    await this.changeSong(this.song);
    this.show = true;
  }

  private async prev() {
    if (!this.prevSong) return;
    await this.changeSong(this.prevSong);
    this.index--;
  }

  private async next() {
    if (!this.nextSong) return;
    await this.changeSong(this.nextSong);
    this.index++;
  }

  private async reload(targetIds?: number[]) {
    if (targetIds) {
      targetIds.forEach(async(id) => {
        if (id === this.song.id) return;
        const song = await musicModule.ReloadSong(id);
        let i = findIndex(this.songs, (s) => s.id === id);
        do {
          this.$set(this.songs, i, song);
          i = findIndex(this.songs, (s) => s.id === id, i + 1);
        } while (i >= 0);
      });
    }
    const res1 = await musicModule.ReloadSong(this.song.id);
    this.song = res1;
    const res2 = await musicModule.FetchAudio(this.song);
    this.audioData = res2.audio;
    this.metadata = res2.meta;
    this.$emit('updated', res1);
  }

  private async updateRating(val: number) {
    const id = this.song.id;
    await musicModule.UpdateSong({ id, data: { rating: val } });
    const song = await musicModule.ReloadSong(id);
    this.song = song;
  }
}
</script>
