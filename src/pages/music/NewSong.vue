<template>
  <div class="py-3 px-2">
    <v-nav v-model="nav" :items="navItems" pills/>
    <div v-if="nav === 'download'" class="d-md-flex pt-3">
      <v-form ref="downloadForm" class="minw-50">
        <v-field>
          <v-input v-model="url" ref="urlInput" type="url" placeholder="url(ex. https://www.youtube.com/watch?v=0YF8vecQWYs)" autofocus required @blur="onURLChanged"/>
        </v-field>
        <v-field>
          <v-input v-model="dTitle" placeholder="Title" list="dl_d-title"/>
          <b-datalist id="dl_d-title" :options="titleCandidates"/>
        </v-field>
        <v-field>
          <v-input v-model="dArtist" placeholder="Artist" list="dl_d-artist"/>
          <b-datalist id="dl_d-artist" :options="artistCandidates"/>
        </v-field>
        <v-field>
          <v-input v-model="dAlbumArtist" placeholder="Album Artist"/>
        </v-field>
        <v-field>
          <v-input v-model="dAlbum" placeholder="Album"/>
        </v-field>
        <v-field>
          <v-input v-model="dYear" placeholder="Year"/>
        </v-field>
        <div class="d-flex align-items-center">
          <b-button class="ml-auto" variant="success" @click="download">
            Download
          </b-button>
        </div>
      </v-form>
      <b-card header="Results" no-body class="minw-50 mt-3 mt-md-0 mx-md-3">
        <b-list-group flush class="border-bottom">
          <b-list-group-item v-for="(d, i) in downloadQueue" :key="i" class="d-flex align-items-center">
            <b-spinner v-if="d.status === Status.Processing" type="grow" variant="primary" small/>
            <b-icon v-else-if="d.status === Status.Success" icon="check" scale="1.5" variant="success"/>
            <b-icon v-else-if="d.status === Status.Warning" icon="exclamation-triangle-fill" scale="1.5" variant="warning"/>
            <b-icon v-else icon="x-circle" scale="1.5" variant="danger"/>
            <div class="text-truncate mx-2">
              <span v-if="d.metadata.title && d.metadata.artist">{{ d.metadata.title }} / {{ d.metadata.artist }}</span>
              <span v-else>{{ d.url }}</span>
            </div>
            <div class="text-nowrap ml-auto">
              <span v-if="d.status === Status.Processing" class="text-primary">Downloading...</span>
              <div v-else-if="d.status === Status.Success">
                <b-button size="sm" variant="primary" @click="play(d.song)">
                  <b-icon icon="play"/>
                  <span v-if="$pc">Play</span>
                </b-button>
                <b-button size="sm" variant="success" class="ml-2" @click="edit(d)">
                  <b-icon icon="pencil"/>
                  <span v-if="$pc">Edit</span>
                </b-button>
              </div>
              <div v-else-if="d.status === Status.Warning" class="text-warning">
                <span>Already exists</span>
              </div>
              <div v-else>
                <b-button size="sm" variant="outline-danger" @click="retry(d)">Retry</b-button>
              </div>
            </div>
          </b-list-group-item>
        </b-list-group>
      </b-card>
    </div>
    <div v-else class="d-md-flex pt-3">
      <div class="minw-50">
        <b-input-group class="mb-2">
          <template #prepend>
            <b-dropdown variant="outline-success" :text="isFile ? 'File' : 'Folder'">
              <b-dropdown-item @click="isFile = true">File</b-dropdown-item>
              <b-dropdown-item @click="isFile = false">Folder</b-dropdown-item>
            </b-dropdown>
          </template>
          <b-form-file v-model="files" accept="audio/*" multiple :directory="!isFile"
                      :placeholder="`No ${isFile ? 'File'  : 'Folder'} chosen`"
                      class="overflow-hidden">
            <template #file-name>
              {{ filename }}
            </template>
          </b-form-file>
        </b-input-group>
        <v-field>
          <v-input v-model="uTitle" placeholder="Title"/>
        </v-field>
        <v-field>
          <v-input v-model="uArtist" placeholder="Artist"/>
        </v-field>
        <v-field>
          <v-input v-model="uAlbumArtist" placeholder="Album Artist"/>
        </v-field>
        <v-field>
          <v-input v-model="uAlbum" placeholder="Album"/>
        </v-field>
        <v-field>
          <v-input v-model="uYear" placeholder="Year"/>
        </v-field>
        <div class="d-flex align-items-center">
          <b-button class="ml-auto" variant="success" @click="upload">
            <span>Upload</span>
          </b-button>
        </div>
      </div>
      <b-card header="Results" no-body class="minw-50 mt-3 mt-md-0 mx-md-3">
        <b-list-group flush class="border-bottom">
          <template v-for="(u, i) in uploadQueue">
            <!-- multiple files result -->
            <b-list-group-item v-if="u.status === Status.Success && u.songs.length > 1" :key="i">
              <div class="d-flex text-truncate">
                <span class="text-secondary mr-3" @click="u.expanded = !u.expanded"><b-icon :icon="u.expanded ? 'caret-down-fill' : 'caret-right-fill'"/></span>
                <span v-if="u.metadata.title && u.metadata.artist">{{ u.metadata.title }} / {{ u.metadata.artist }}</span>
                <span v-else>{{ u.filename }}</span>
                <b-button size="sm" variant="primary" class="ml-auto" @click="play(u.songs)">
                  <b-icon icon="play"/>
                  <span>Play all</span>
                </b-button>
              </div>
              <b-collapse v-model="u.expanded">
                <b-list-group flush class="pl-2">
                  <b-list-group-item v-for="(f, i) in u.files" :key="f.name" class="d-flex align-items-center">
                    <b-icon v-if="u.songs[i]" icon="check" scale="1.5" variant="success"/>
                    <b-icon v-else icon="exclamation-triangle-fill" scale="1.5" variant="warning"/>
                    <div class="text-truncate mx-2">
                      {{ f.name }}
                    </div>
                    <div v-if="u.songs[i]" class="text-nowrap ml-auto">
                      <b-button size="sm" variant="primary" @click="play(u, i)">
                        <b-icon icon="play"/>
                        <span v-if="$pc">Play</span>
                      </b-button>
                      <b-button size="sm" variant="success" class="ml-2" @click="edit(u, i)">
                        <b-icon icon="pencil"/>
                        <span v-if="$pc">Edit</span>
                      </b-button>
                    </div>
                    <div v-else-if="u.songs[i] === null" class="text-nowrap text-warning ml-auto">
                      <span>Already exists</span>
                    </div>
                  </b-list-group-item>
                </b-list-group>
              </b-collapse>
            </b-list-group-item>
            <!-- single file -->
            <b-list-group-item v-else :key="i" class="d-flex align-items-center">
              <b-spinner v-if="u.status === Status.Processing" type="grow" variant="primary" small/>
              <b-icon v-else-if="u.status === Status.Success" icon="check" scale="1.5" variant="success"/>
              <b-icon v-else-if="u.status === Status.Warning" icon="exclamation-triangle-fill" scale="1.5" variant="warning"/>
              <b-icon v-else icon="x-circle" scale="1.5" variant="danger"/>
              <div class="text-truncate text-nowrap mx-2">
                <span v-if="u.metadata.title && u.metadata.artist">{{ u.metadata.title }} / {{ u.metadata.artist }}</span>
                <span v-else>{{ u.filename }}</span>
              </div>
              <div class="text-nowrap ml-auto">
                <span v-if="u.status === Status.Processing" class="text-primary">
                  Uploading...({{ u.progress }} / 100 )
                </span>
                <div v-else-if="u.status === Status.Success">
                  <b-button size="sm" variant="primary" @click="play(u.songs)">
                    <b-icon icon="play"/>
                    <span v-if="$pc">Play</span>
                  </b-button>
                  <b-button size="sm" variant="success" class="ml-2" @click="edit(u, 0)">
                    <b-icon icon="pencil"/>
                    <span v-if="$pc">Edit</span>
                  </b-button>
                </div>
                <div v-else-if="u.status === Status.Warning" class="text-warning">
                  <span>Already exists</span>
                </div>
                <div v-else>
                  <b-button size="sm" variant="outline-danger" @click="retry(u)">Retry</b-button>
                </div>
              </div>
            </b-list-group-item>
          </template>
        </b-list-group>
      </b-card>
    </div>
    <song-info-dialog ref="songInfoDialog"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import axios from 'axios';
import { Dictionary, findIndex, isArray, isEmpty, isNumber, omitBy } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { VNav, VForm, VInput } from '@/components';
import SongInfoDialog from './components/SongInfoDialog.vue';

enum Status {
  Processing,
  Success,
  Warning,
  Error,
}

interface DownloadStatus {
  status: Status;
  url: string;
  metadata: Dictionary<string>;
  song?: Song;
}

interface UploadStatus {
  status: Status;
  data: FormData;
  metadata: Dictionary<string>;
  filename: string;
  progress: number;
  songs?: Song[];
  expanded: boolean;
  files: File[];
}

@Component({
  components: {
    VNav,
    VForm,
    SongInfoDialog,
  },
})
export default class NewSong extends Vue {
  private nav = 'download';
  private navItems = [
    { key: 'download', title: 'Download' },
    { key: 'upload', title: 'Upload' },
  ];

  private Status = Status;

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
  private isFile = true;

  private uploadQueue: UploadStatus[] = [];
  private uTitle = '';
  private uArtist = '';
  private uAlbumArtist = '';
  private uAlbum = '';
  private uYear = '';

  @Ref() private downloadForm!: VForm;
  @Ref() private urlInput!: VInput;
  @Ref() private songInfoDialog!: SongInfoDialog;

  get filename() {
    if (this.files) {
      return this.files.length === 1 ? this.files[0].name : `${this.files.length} files`;
    }
    return '';
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

  private onClosed() {
    this.$destroy();
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
    axios.get<{ title: string[], artist: string[] }>('/api/music/tools/candidates', { params: { url: this.url } }).then((res) => {
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
    if (!this.downloadForm.validate()) return;
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
      status: Status.Processing,
    };
    this.downloadQueue.push(status);
    this.dReset();
    this.execDownload(status);
  }

  private execDownload(status: DownloadStatus) {
    status.status = Status.Processing;
    axios.post<Song | null>('/api/music/songs', {
      url: status.url,
      metadata: status.metadata,
    }).then((res) => {
      if (res.data) {
        status.status = Status.Success;
        status.song = res.data;
      } else {
        status.status = Status.Warning;
      }
    }).catch(() => {
      this.$message.error('Failed to download');
      status.status = Status.Error;
    });
  }

  private upload() {
    if (this.files === null || this.files.length === 0) {
      this.$message.warn('No file chosen');
      return;
    }

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
      status: Status.Processing,
      expanded: false,
      files: this.files,
    };
    this.uploadQueue.push(status);
    this.uReset();
    this.execUpload(status);
  }

  private execUpload(status: UploadStatus) {
    status.status = Status.Processing;
    axios.post<Song[] | null>('/api/music/songs', status.data, {
      onUploadProgress: (e: ProgressEvent) => {
        status.progress = Math.round((e.loaded * 100) / e.total);
      },
    }).then((res) => {
      musicModule.ReloadSongs();
      musicModule.FetchArtists();
      if (res.data && res.data.length) {
        status.status = Status.Success;
        status.songs = res.data;
      } else {
        status.status = Status.Warning;
      }
    }).catch(() => {
      this.$message.error('Failed to upload');
      status.status = Status.Error;
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
    }
  }

  private edit(status: DownloadStatus | UploadStatus, index?: number) {
    let reload: (song: Song) => void;
    if ('songs' in status && isNumber(index) && status.songs) {
      this.songInfoDialog.open(status.songs, index);
      reload = (song: Song) => {
        const i = findIndex(status.songs, (s) => s.id === song.id);
        this.$set(status.songs!, i, song);
      };
    } else if ('song' in status && status.song) {
      this.songInfoDialog.open([status.song], 0);
      reload = (song: Song) => {
        status.song = song;
      };
    } else {
      this.$message.error('Invalid arguments');
      return;
    }
    this.songInfoDialog.$on('updated', reload);
    this.songInfoDialog.$once('hidden', () => this.songInfoDialog.$off('updated', reload));
  }

  private dReset() {
    this.url = '';
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
    this.uArtist = '';
    this.uAlbumArtist = '';
    this.uAlbum = '';
    this.uTitle = '';
    this.uYear = '';
  }
}
</script>
