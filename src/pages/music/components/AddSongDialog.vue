<template>
  <b-modal ref="modal" title="Add new song" ok-only @shown="urlInput.focus()" @hidden="$nextTick($destroy)">
    <v-nav v-model="nav" :items="navItems" pills/>
    <div v-if="nav === 'download'" class="pt-3">
      <v-form ref="downloadForm">
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
        <v-field>
          <v-input v-model="dTrack" placeholder="Track Number"/>
        </v-field>
        <v-field>
          <v-input v-model="dDisc" placeholder="Disc Number"/>
        </v-field>
      </v-form>
      <div class="d-flex align-items-center">
        <b-button class="ml-auto" variant="success" @click="download">
          Download
        </b-button>
      </div>
      <b-list-group class="mt-3">
        <b-list-group-item v-for="(d, i) in downloadQueue" :key="i" class="d-flex align-items-center">
          <b-spinner v-if="d.status === Status.Processing" type="grow" variant="primary" small/>
          <b-icon v-else-if="d.status === Status.Success" icon="check" scale="1.5" variant="success"/>
          <b-icon v-else-if="d.status === Status.Warning" icon="exclamation-triangle-fill" scale="1.5" variant="warning"/>
          <b-icon v-else icon="x-circle" scale="1.5" variant="danger"/>
          <div class="text-truncate text-nowrap ml-2">
            <span v-if="d.metadata.title && d.metadata.artist">{{ d.metadata.title }} / {{ d.metadata.artist }}</span>
            <span v-else>{{ d.url }}</span>
          </div>
          <div class="ml-auto">
            <span v-if="d.status === Status.Processing" class="text-primary">...Downloading</span>
            <div v-else-if="d.status === Status.Success">
              <b-button size="sm" variant="primary">
                <b-icon icon="play"/>
                <span v-if="$pc" @click="play(d.song)">Play</span>
              </b-button>
              <b-button size="sm" variant="success" class="ml-2">
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
    </div>
    <div v-else class="pt-3">
      <b-input-group class="mb-2">
        <template #prepend>
          <b-dropdown variant="outline-success" :text="isFile ? 'File' : 'Folder'">
            <b-dropdown-item @click="isFile = true">File</b-dropdown-item>
            <b-dropdown-item @click="isFile = false">Folder</b-dropdown-item>
          </b-dropdown>
        </template>
        <b-form-file v-model="files" accept="audio/*" multiple :directory="!isFile"
                     :placeholder="`No ${isFile ? 'File'  : 'Folder'} chosen`"
                     class="overflow-hidden text-nowrap">
          <template #file-name="{ files }">
            {{ files.length === 1 ? files[0].name : `${files.length} files selected` }}
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
      <v-field>
        <v-input v-model="uTrack" placeholder="Track Number"/>
      </v-field>
      <v-field>
        <v-input v-model="uDisc" placeholder="Disc Number"/>
      </v-field>
      <div class="d-flex align-items-center">
        <b-button variant="outline-danger" @click="uReset">Reset</b-button>
        <span v-if="uploading" class="ml-auto">
          {{ uploadProgress }}%
        </span>
        <b-button class="ml-auto" variant="success" :disabled="uploading" @click="upload">
          <b-spinner v-if="uploading" small class="mr-2"/>
          <span>{{ uploading ? 'Uploading...' : 'Upload' }}</span>
        </b-button>
      </div>
    </div>
  </b-modal>
</template>
<script lang="ts">
import { mixins } from 'vue-class-component';
import { Component, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import axios from 'axios';
import { isEmpty, omitBy, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { DialogMixin, waitUntil } from '@/utils';
import { VNav, VForm, VInput } from '@/components';

enum Status {
  Processing,
  Success,
  Warning,
  Error,
}

interface DownloadStatus {
  url: string;
  status: Status;
  metadata: Dictionary<string>;
  song?: Song;
}

@Component({
  components: {
    VNav,
    VForm,
  },
})
export default class AddSongDialog extends mixins(DialogMixin) {
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
  private dTrack = '';
  private dDisc = '';
  private titleCandidates: string[] = [];
  private artistCandidates: string[] = [];

  private files: File[] | null = null;
  private isFile = true;

  private uploading = false;
  private uploadProgress = 0;
  private uploadButtonText = 'Upload';
  private uTitle = '';
  private uArtist = '';
  private uAlbumArtist = '';
  private uAlbum = '';
  private uYear = '';
  private uTrack = '';
  private uDisc = '';

  @Ref() private modal!: BModal;
  @Ref() private downloadForm!: VForm;
  @Ref() private urlInput!: VInput;

  @Watch('dArtist')
  private onDArtistChanged(val: string, oldVal: string) {
    if (this.dAlbumArtist === oldVal) {
      this.dAlbumArtist = this.dArtist;
    }
  }

  @Watch('dAlbum')
  private onDAlbumChanged(val: string) {
    if (this.dDisc === '') {
      this.dDisc = '1/1';
    }
  }

  @Watch('uArtist')
  private onUArtistChanged(val: string, oldVal: string) {
    if (this.uAlbumArtist === oldVal) {
      this.uAlbumArtist = this.uArtist;
    }
  }

  @Watch('uAlbum')
  private onUAlbumChanged(val: string) {
    if (this.uDisc === '') {
      this.uDisc = '1/1';
    }
  }

  private async open() {
    await waitUntil(() => !!this.modal);
    this.modal.show();
  }

  private onURLChanged() {
    this.titleCandidates = [];
    this.artistCandidates = [];
    if (this.url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      this.url = `https://www.youtube.com?v=${this.url}`;
    } else if (this.url.startsWith('https://www.youtube.com')) {
      let matched = /&?list=[a-zA-Z0-9_-]+/.exec(this.url);
      if (matched) {
        this.url = this.url.replace(matched[0], '');
      }
      matched = /&?index=[0-9]+/.exec(this.url);
      if (matched) {
        this.url = this.url.replace(matched[0], '');
      }
    }
    musicModule.GetCandidatesFromURL(this.url).then((res) => {
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
      track: this.dTrack,
      disc: this.dDisc,
    }, isEmpty);
    const data = {
      url: this.url,
      metadata,
    };
    const status: DownloadStatus = {
      ...data,
      status: Status.Processing,
    };
    this.downloadQueue.push(status);
    this.dReset();
    musicModule.Download(data).then((res) => {
      musicModule.ReloadSongs();
      musicModule.FetchArtists();
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

  private retry(data: DownloadStatus) {
    data.status = Status.Processing;
    musicModule.Download({
      url: data.url,
      metadata: data.metadata,
    }).then(() => {
      musicModule.ReloadSongs();
      musicModule.FetchArtists();
      data.status = Status.Success;
    }).catch(() => {
      this.$message.error('Failed to download');
      data.status = Status.Error;
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
      track: this.uTrack,
      disc: this.uDisc,
    }, isEmpty);
    if (!isEmpty(metadata)) data.append('data', JSON.stringify(metadata));

    this.uploading = true;
    musicModule.Upload({
      data,
      onUploadProgress: (e: ProgressEvent) => {
        this.uploadProgress = Math.round((e.loaded * 100) / e.total);
      },
    }).then(() => {
      this.uReset();
      musicModule.ReloadSongs();
      musicModule.FetchArtists();
    }).catch(() => {
      this.$message.error('Failed to upload');
      this.uReset(false);
    });
  }

  private play(s: Song | null) {
    if (s) {
      musicModule.Play(s);
    }
  }

  private dReset() {
    this.url = '';
    this.dArtist = '';
    this.dAlbumArtist = '';
    this.dAlbum = '';
    this.dTitle = '';
    this.dYear = '';
    this.dTrack = '';
    this.dDisc = '';
    this.titleCandidates = [];
    this.artistCandidates = [];
  }

  private uReset(success: boolean = true) {
    this.uploading = false;
    this.uploadProgress = 0;
    if (success) {
      this.files = null;
      this.uArtist = '';
      this.uAlbumArtist = '';
      this.uAlbum = '';
      this.uTitle = '';
      this.uYear = '';
      this.uTrack = '';
      this.uDisc = '';
    }
  }
}
</script>
