<template>
  <div class="d-flex h-100">
    <music-nav-menu/>

    <div class="d-flex flex-column flex-grow-1">
      <v-tabs v-model="tab" class="flex-grow-0">
        <v-tab to="#download" replace>ダウンロード</v-tab>
        <v-tab to="#upload" replace>アップロード</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab" class="flex-grow-1 pa-4 overflow-y-auto">
        <v-tab-item value="download">
          <div class="d-md-flex">
            <v-form class="new-song-form min-w-50">
              <v-text-field v-model="$v.url.$model" type="url" label="URL" placeholder="https://www.youtube.com/watch?v=xxxxxxxxxx" autofocus :error-messages="urlErrors" hide-details="auto" @blur="onURLChanged"/>
              <v-combobox v-model="dTitle" label="タイトル" :items="titleCandidates" hide-details :append-icon="titleCandidates.length ? '$dropdown' : null"/>
              <v-combobox v-model="dArtist" label="アーティスト" :items="artistCandidates" hide-details :append-icon="artistCandidates.length ? '$dropdown' : null"/>
              <v-text-field v-model="dAlbumArtist" label="アルバムアーティスト" hide-details/>
              <v-text-field v-model="dAlbum" label="アルバム" hide-details/>
              <v-text-field v-model="dYear" label="年" hide-details/>
              <div class="d-flex align-center mt-3">
                <v-btn color="success" class="ml-auto" @click="download">
                  ダウンロード
                </v-btn>
              </div>
            </v-form>
            <div v-if="downloadQueue.length" class="min-w-50 mt-3 mt-md-0 px-md-3">
              <v-list dense outlined rounded subheader>
                <v-subheader>結果</v-subheader>
                <v-list-item v-for="(d, i) in downloadQueue" :key="`item${i}`">
                  <v-list-item-icon>
                    <v-progress-circular v-if="d.status === Status.Processing" indeterminate color="primary" size="24"/>
                    <v-icon v-else-if="d.status === Status.Success" color="success">done</v-icon>
                    <v-icon v-else-if="d.status === Status.Warning" color="warning">warning_amber</v-icon>
                    <v-icon v-else color="error">error_outline</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="text-truncate">
                      {{ d.metadata.title && d.metadata.artist ? `${d.metadata.title } / ${d.metadata.artist}` : d.url }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <span v-if="d.status === Status.Processing" class="info--text">
                      ダウンロード中...
                    </span>
                    <div v-else-if="d.status === Status.Success">
                      <v-btn small color="primary" @click="play(d.song)">
                        <v-icon small>play_arrow</v-icon>
                        <span v-if="$pc">再生</span>
                      </v-btn>
                      <v-btn small color="success" class="ml-2" @click="edit(d)">
                        <v-icon small>edit</v-icon>
                        <span v-if="$pc">編集</span>
                      </v-btn>
                    </div>
                    <div v-else-if="d.status === Status.Warning" class="warning--text">
                      その楽曲は既に存在します
                    </div>
                    <div v-else>
                      <v-btn small color="primary" @click="retry(d)">
                        リトライ
                      </v-btn>
                    </div>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </v-tab-item>
        <v-tab-item value="upload">
          <div class="d-md-flex">
            <v-form class="new-song-form min-w-50">
              <v-switch v-if="$webkit" v-model="directory" :label="directory ? 'フォルダ' : 'ファイル'"/>
              <v-file-input
                v-model="files"
                :label="`${directory ? 'フォルダ' : 'ファイル'}を選択`"
                dense
                outlined
                accept="audio/*"
                multiple
                counter
                show-size
                :error-messages="filesErrors"
                :webkitdirectory="directory"
              />
              <div class="d-flex align-center mt-2">
                <v-switch v-model="showDataFields" hide-details class="mt-0 pt-0">
                  <template #label>
                    <span class="mr-2">楽曲情報を入力</span>
                  </template>
                </v-switch>
                <v-tooltip bottom>
                  <template #activator="{ on, attr }">
                    <v-icon v-bind="attr" small v-on="on">help</v-icon>
                  </template>
                  <span>入力しなかった場合はファイルから情報を読み取ります</span>
                </v-tooltip>
              </div>
              <div v-show="showDataFields">
                <v-text-field v-model="uTitle" label="タイトル" hide-details/>
                <v-text-field v-model="uArtist" label="アーティスト" hide-details/>
                <v-text-field v-model="uAlbumArtist" label="アルバムアーティスト" hide-details/>
                <v-text-field v-model="uAlbum" label="アルバム" hide-details/>
                <v-text-field v-model="uYear" label="年" hide-details/>
              </div>
              <div class="d-flex align-center mt-3">
                <v-btn color="success" class="ml-auto" @click="upload">
                  アップロード
                </v-btn>
              </div>
            </v-form>
            <div v-if="uploadQueue.length" class="min-w-50 mt-3 mt-md-0 px-md-3">
              <v-list dense outlined rounded subheader>
                <v-subheader>結果</v-subheader>
                <template v-for="(u, i) in uploadQueue">
                  <!-- multiple files -->
                  <v-list-group v-if="u.status === Status.Success && u.songs.length > 1" :key="`group${i}`">
                    <template #activator>
                      <v-list-item-content>
                        <span class="text-truncate">
                          {{ u.metadata.title && u.metadata.artist ? `${u.metadata.title } / ${u.metadata.artist}` : u.filename }}
                        </span>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn small color="primary" @click.stop="play(u.songs)">
                          <v-icon small>play_arrow</v-icon>
                          <span>全て再生</span>
                        </v-btn>
                      </v-list-item-action>
                    </template>
                    <v-list-item v-for="(f, i) in u.files" :key="f.name">
                      <v-list-item-icon>
                        <v-icon v-if="u.songs[i]" color="success">done</v-icon>
                        <v-icon v-else color="warning">warning_amber</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title class="text-truncate">{{ f.name }}</v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-action v-if="u.songs[i]">
                        <div>
                          <v-btn small color="primary" @click="play(u.songs[i])">
                            <v-icon small>play_arrow</v-icon>
                            <span v-if="$pc">再生</span>
                          </v-btn>
                          <v-btn small color="success" class="ml-2" @click="edit(u, i)">
                            <v-icon small>edit</v-icon>
                            <span v-if="$pc">編集</span>
                          </v-btn>
                        </div>
                      </v-list-item-action>
                      <v-list-item-action v-else-if="u.songs[i] === null">
                        その楽曲は既に存在します
                      </v-list-item-action>
                    </v-list-item>
                  </v-list-group>

                  <!-- single file -->
                  <v-list-item v-else :key="`item${i}`">
                    <v-list-item-icon>
                      <v-progress-circular v-if="u.status === Status.Processing" indeterminate color="primary" size="24"/>
                      <v-icon v-else-if="u.status === Status.Success" color="success">done</v-icon>
                      <v-icon v-else-if="u.status === Status.Warning" color="warning">warning_amber</v-icon>
                      <v-icon v-else color="error">error_outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-truncate">
                        {{ u.metadata.title && u.metadata.artist ? `${u.metadata.title } / ${u.metadata.artist}` : u.filename }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <span v-if="u.status === Status.Processing" class="info--text">
                        アップロード中...( {{ u.progress }} / 100 )
                      </span>
                      <div v-else-if="u.status === Status.Success">
                        <v-btn small color="primary" @click="play(u.songs)">
                          <v-icon small>play_arrow</v-icon>
                          <span v-if="$pc">再生</span>
                        </v-btn>
                        <v-btn small color="success" class="ml-2" @click="edit(u, 0)">
                          <v-icon small>edit</v-icon>
                          <span v-if="$pc">編集</span>
                        </v-btn>
                      </div>
                      <div v-else-if="u.status === Status.Warning" class="warning--text">
                        その楽曲は既に存在します
                      </div>
                      <div v-else>
                        <v-btn small color="primary" @click="retry(u)">
                          リトライ
                        </v-btn>
                      </div>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-list>
            </div>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </div>

    <song-info-dialog ref="songInfoDialog"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Ref } from 'vue-property-decorator';
import { required } from 'vuelidate/lib/validators';
import { isArray, isEmpty, omitBy } from 'lodash';
import { musicModule } from '@/store';
import { MusicApi } from '@/api';
import { Song, NetworkStatus, DownloadStatus, UploadStatus } from '@/api/music';
import { MusicNavMenu, SongInfoDialog } from '@/components/music';

@Component({
  components: {
    MusicNavMenu,
    SongInfoDialog,
  },
  validations: {
    url: {
      required,
    },
    files: {
      required,
    },
  },
})
export default class NewSong extends Vue {
  private tab = '';

  private nav = 'download';
  private navItems = [
    { key: 'download', title: 'Download' },
    { key: 'upload', title: 'Upload' },
  ];

  private Status = NetworkStatus;

  private downloadQueue: DownloadStatus[] = [];
  private url = '';
  private dTitle = '';
  private dArtist = '';
  private dAlbumArtist = '';
  private dAlbum = '';
  private dYear = '';
  private titleCandidates: string[] = [];
  private artistCandidates: string[] = [];

  private files: File[] | null = null;
  private directory = false;

  private uploadQueue: UploadStatus[] = [];
  private showDataFields = false;
  private uTitle = '';
  private uArtist = '';
  private uAlbumArtist = '';
  private uAlbum = '';
  private uYear = '';

  @Ref() private songInfoDialog!: SongInfoDialog;

  get urlErrors() {
    const v = this.$v.url;
    if (!v.$dirty) return [];
    const errors: string[] = [];
    !v.required && errors.push('URLは入力必須です');
    return errors;
  }

  get filesErrors() {
    const v = this.$v.files;
    if (!v.$dirty) return [];
    const errors: string[] = [];
    !v.required && errors.push(`${this.directory ? 'フォルダ' : 'ファイル'}が選択されていません`);
    return errors;
  }

  get filename() {
    if (this.files) {
      return this.files.length === 1 ? this.files[0].name : `${this.files.length} ファイル`;
    }
    return '';
  }

  @Watch('tab')
  private onTabChanged() {
    this.$v.$reset();
  }

  @Watch('dArtist')
  private onDArtistChanged(val: string, oldVal: string) {
    if (this.dAlbumArtist === oldVal) {
      this.dAlbumArtist = this.dArtist;
    }
  }

  @Watch('uArtist')
  private onUArtistChanged(val: string, oldVal: string) {
    if (this.uAlbumArtist === oldVal) {
      this.uAlbumArtist = this.uArtist;
    }
  }

  private onURLChanged() {
    this.titleCandidates = [];
    this.artistCandidates = [];
    if (!this.url) return;
    if (this.url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      this.url = `https://www.youtube.com/?v=${this.url}`;
    } else if (this.url.match(/^youtube.com/)) {
      this.url = `https://www.${this.url}`;
    } else if (!this.url.match(/^https?:\/\//)) {
      this.url = `http://${this.url}`;
    }
    if (this.url.startsWith('https://www.youtube.com')) {
      let matched = /&?list=[a-zA-Z0-9_-]+/.exec(this.url);
      if (matched) {
        this.url = this.url.replace(matched[0], '');
      }
      matched = /&?index=[0-9]+/.exec(this.url);
      if (matched) {
        this.url = this.url.replace(matched[0], '');
      }
      matched = /&?t=[0-9]+s/.exec(this.url);
      if (matched) {
        this.url = this.url.replace(matched[0], '');
      }
    }
    MusicApi.getCandidates(this.url).then((res) => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement) {
        el.blur();
      }
      this.titleCandidates = res.data.title;
      this.artistCandidates = res.data.artist;
      this.$nextTick(() => {
        if (el instanceof HTMLInputElement) {
          el.focus();
        }
      });
    });
  }

  private download() {
    this.$v.url.$touch();
    if (this.$v.$invalid) return;

    const metadata = omitBy({
      title: this.dTitle,
      artist: this.dArtist,
      album_artist: this.dAlbumArtist,
      album: this.dAlbum,
      year: this.dYear,
    }, isEmpty);
    const status: DownloadStatus = {
      url: this.url,
      metadata,
      status: NetworkStatus.Processing,
    };
    this.downloadQueue.push(status);
    this.dReset();
    this.execDownload(status);
  }

  private execDownload(status: DownloadStatus) {
    status.status = NetworkStatus.Processing;
    MusicApi.downloadSong(status).then((res) => {
      if (res.data) {
        status.status = NetworkStatus.Success;
        status.song = res.data;
      } else {
        status.status = NetworkStatus.Warning;
      }
    }).catch(() => {
      this.$snackbar.error('Failed to download');
      status.status = NetworkStatus.Error;
    });
  }

  private upload() {
    // if (this.files === null || this.files.length === 0) {
    //   this.$snackbar.warn('No file chosen');
    //   return;
    // }
    this.$v.files.$touch();
    if (this.$v.files.$invalid) return;
    if (this.files == null) return;

    const data = new FormData();
    this.files.forEach((f) => {
      data.append('file[]', f);
    });
    const metadata = omitBy({
      artist: this.uArtist,
      album_artist: this.uAlbumArtist,
      album: this.uAlbum,
      title: this.uTitle,
      year: this.uYear,
    }, isEmpty);
    if (!isEmpty(metadata)) data.append('data', JSON.stringify(metadata));

    const status: UploadStatus = {
      data,
      metadata,
      filename: this.filename,
      progress: 0,
      status: NetworkStatus.Processing,
      expanded: false,
      files: this.files,
    };
    this.uploadQueue.push(status);
    this.uReset();
    this.execUpload(status);
  }

  private execUpload(status: UploadStatus) {
    status.status = NetworkStatus.Processing;
    MusicApi.uploadSong(status).then((res) => {
      musicModule.ReloadSongs();
      musicModule.FetchArtists();
      if (res.data) {
        if (res.data.length === 1 && res.data[0] == null) {
          status.status = NetworkStatus.Warning;
        } else {
          status.status = NetworkStatus.Success;
          status.songs = res.data;
        }
      } else {
        status.status = NetworkStatus.Warning;
      }
    }).catch(() => {
      this.$snackbar.error('Failed to upload');
      status.status = NetworkStatus.Error;
    });
  }

  private retry(status: DownloadStatus | UploadStatus) {
    if ('url' in status) {
      this.execDownload(status);
    } else {
      this.execUpload(status);
    }
  }

  private play(s: Song[] | Song | null) {
    if (s) {
      if (isArray(s)) {
        if (s.length === 0) return;
        musicModule.InsertIntoNext(s.slice(1));
        musicModule.Play(s[0]);
      } else {
        musicModule.Play(s);
      }
    } else {
      this.$snackbar.error('Failed to play the audio.');
    }
  }

  private edit(_status: DownloadStatus | UploadStatus, _index?: number) {
    // let reload: (song: Song) => void;
    // if ('songs' in status && isNumber(index) && status.songs) {
    //   this.songInfoDialog.open(status.songs, index);
    //   reload = (song: Song) => {
    //     const i = findIndex(status.songs, (s) => s.id === song.id);
    //     this.$set(status.songs!, i, song);
    //   };
    // } else if ('song' in status && status.song) {
    //   this.songInfoDialog.open([status.song], 0);
    //   reload = (song: Song) => {
    //     status.song = song;
    //   };
    // } else {
    //   this.$message.error('Invalid arguments');
    //   return;
    // }
    // this.songInfoDialog.$on('updated', reload);
    // this.songInfoDialog.$once('hidden', () => this.songInfoDialog.$off('updated', reload));
  }

  private dReset() {
    this.url = '';
    this.$v.url.$reset();
    this.dArtist = '';
    this.dAlbumArtist = '';
    this.dAlbum = '';
    this.dTitle = '';
    this.dYear = '';
    this.titleCandidates = [];
    this.artistCandidates = [];
  }

  private uReset() {
    this.files = null;
    this.$v.files.$reset();
    this.uArtist = '';
    this.uAlbumArtist = '';
    this.uAlbum = '';
    this.uTitle = '';
    this.uYear = '';
  }
}
</script>
<style lang="scss" scoped>
.new-song-form {
  width: 80%;
  max-width: 560px;
}
</style>
