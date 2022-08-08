<template>
  <v-container>
    <v-form>
      <v-container>
        <v-row v-for="t in basicTags" :key="t.key" align="center">
          <v-col cols="9" sm="10">
            <v-text-field v-model="edit[t.key]" :label="t.label" hide-details/>
          </v-col>
          <v-col>
            <v-btn icon @click="deleteTag(t.key)">
              <v-icon>close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <div class="d-flex">
      <v-btn :loading="searchingInfo" color="info" @click="searchInfo">
        楽曲情報を検索
      </v-btn>
      <v-btn class="ml-2" @click="searchGoogle">
        <span>Googleで検索</span>
        <v-icon>open_in_new</v-icon>
      </v-btn>
      <v-btn color="success" class="ml-auto" @click="save">
        保存
      </v-btn>
    </div>
  </v-container>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import axios from 'axios';
import { map, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song, Metadata } from '@/api/music';
import { SearchInfoDialog } from '@/components/music';

@Component
export default class TagEditor extends Vue {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Object, required: true })
  private metadata!: Metadata;

  private edit: Dictionary<string | null> = {
    title: '',
    artist: '',
    album_artist: '',
    album: '',
    year: '',
    track: '',
    disc: '',
  };
  private searchingInfo = false;

  get basicTags() {
    return [
      { key: 'title', label: 'タイトル' },
      { key: 'artist', label: 'アーティスト' },
      { key: 'album_artist', label: 'アルバムアーティスト' },
      { key: 'album', label: 'アルバム' },
      { key: 'year', label: '年' },
      { key: 'track', label: 'トラック' },
      { key: 'disc', label: 'ディスク' },
    ];
  }

  @Watch('metadata', { immediate: true })
  private onMetadataChanged() {
    this.setEdit();
  }

  private setEdit() {
    if (this.metadata) {
      const tags = this.metadata.tags;
      this.$set(this.edit, 'title', tags.title);
      this.$set(this.edit, 'artist', tags.artist);
      this.$set(this.edit, 'album', tags.album);
      this.$set(this.edit, 'album_artist', tags.album_artist);
      this.$set(this.edit, 'year', tags.year);
      this.$set(this.edit, 'track', tags.track);
      this.$set(this.edit, 'disc', tags.disc);
    }
  }

  // private addTag() {
  //   this.$prompt('Add tag').then((tag) => {
  //     this.$set(this.edit, tag, '');
  //   });
  // }

  private deleteTag(k: string) {
    this.$set(this.edit, k, null);
  }

  private async searchInfo() {
    if (!this.song) return;
    const title = this.edit.tilte || this.song.title;
    const artist = this.edit.artist || this.song.artist.name;
    if (!title || !artist || artist === 'Unknown Artist') {
      this.$snackbar.warn('Please input title and artist');
      return;
    }

    this.searchingInfo = true;
    axios.get<Array<Dictionary<string>>>('/api/music/tools/searchinfo', { params: { title, artist } }).then((res) => {
      this.searchingInfo = false;
      if (res.data.length > 0) {
        const dialog = new SearchInfoDialog({
          parent: this.$root,
          propsData: {
            searchResults: res.data,
          },
        });
        dialog.$on('apply', this.apply);
        dialog.open();
      } else {
        this.$snackbar.warn('No results');
      }
    }).catch(() => {
      this.searchingInfo = false;
    });
  }

  private searchGoogle() {
    if (!this.song) return;
    const title = this.edit.title || this.song.title;
    const artist = this.edit.artist || this.song.artist.name;

    window.open(encodeURI(`https://www.google.com/search?q=${title} ${artist}`));
  }

  private apply(selected: Array<Dictionary<string>>) {
    if (selected.length) {
      const info = selected[0];
      this.$set(this.edit, 'title', info.title);
      this.$set(this.edit, 'artist', info.artist);
      this.$set(this.edit, 'album', info.album);
      this.$set(this.edit, 'album_artist', info.album_artist || info.artist);
      this.$set(this.edit, 'year', info.year);
      this.$set(this.edit, 'track', info.track);
      this.$set(this.edit, 'disc', info.disc);
    }
  }

  private async save() {
    const res = await musicModule.UpdateSongTag({ id: this.song.id, data: this.edit });
    if (res.data && res.data.length) {
      const errorMessaages = map(res.data, (e) => `${e.err} ocurred when set ${e.key} to ${e.val}`).join('\n');
      this.$snackbar.warn(`Following errors ocurred:\n${errorMessaages}`);
    }
    this.$emit('updated');
  }
}
</script>
