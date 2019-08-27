<template>
  <b-modal ref="modal" title="Add new song" ok-only @hidden="$nextTick($destroy)">
    <v-nav v-model="nav" :items="navItems" pills/>
    <div v-if="nav === 'upload'" class="pt-3">
      <b-input-group class="mb-2">
        <template #prepend>
          <b-dropdown variant="outline-success" :text="isFile ? 'File' : 'Folder'">
            <b-dropdown-item @click="isFile = true">File</b-dropdown-item>
            <b-dropdown-item @click="isFile = false">Folder</b-dropdown-item>
          </b-dropdown>
        </template>
        <b-form-file v-model="files" accept="audio/*" multiple :directory="!isFile"
                     :placeholder="`No ${isFile ? 'File'  : 'Folder'} chosen`"/>
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
      <div class="d-flex align-items-center">
        <b-button variant="outline-danger" @click="uReset">Reset</b-button>
        <span v-if="uploading" class="ml-auto">
          {{ uploadProgress }}%
        </span>
        <b-button class="ml-auto" variant="success" :disabled="uploading" @click="upload">
          <b-spinner v-if="uploading" small/>
          <span>{{ uploading ? 'Uploading...' : 'Upload' }}</span>
        </b-button>
      </div>
    </div>
    <div v-else class="pt-3">
      <v-form ref="downloadForm">
        <v-field>
          <v-input v-model="url" type="url" placeholder="url(ex. https://www.youtube.com/watch?v=0YF8vecQWYs)" required/>
        </v-field>
        <v-field>
          <v-input v-model="dTitle" placeholder="Title"/>
        </v-field>
        <v-field>
          <v-input v-model="dArtist" placeholder="Artist"/>
        </v-field>
        <v-field>
          <v-input v-model="dAlbumArtist" placeholder="Album Artist"/>
        </v-field>
        <v-field>
          <v-input v-model="dAlbum" placeholder="Album"/>
        </v-field>
      </v-form>
      <div class="d-flex align-items-center">
        <b-button variant="outline-danger" @click="dReset">Reset</b-button>
        <b-button class="ml-auto" variant="success" :disabled="downloading" @click="download">
          <b-spinner v-if="downloading" small/>
          <span>{{ downloading ? 'Downloading...' : 'Download' }}</span>
        </b-button>
      </div>
    </div>
  </b-modal>
</template>
<script lang="ts">
import { mixins } from 'vue-class-component';
import { Component, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { isEmpty, omitBy } from 'lodash';
import { musicModule } from '@/store';
import { DialogMixin, waitUntil } from '@/utils';
import { VNav, VForm } from '@/components';

@Component({
  components: {
    VNav,
    VForm,
  },
})
export default class AddSongDialog extends mixins(DialogMixin) {
  private nav = 'upload';
  private navItems = [
    { key: 'upload', title: 'Upload' },
    { key: 'download', title: 'Download' },
  ];

  private files: File[] | null = null;
  private isFile = true;

  private uploading = false;
  private uploadProgress = 0;
  private uploadButtonText = 'Upload';
  private uArtist = '';
  private uAlbumArtist = '';
  private uAlbum = '';
  private uTitle = '';

  private downloading = false;
  private url = '';
  private dArtist = '';
  private dAlbumArtist = '';
  private dAlbum = '';
  private dTitle = '';

  @Ref() private modal!: BModal;
  @Ref() private downloadForm!: VForm;

  @Watch('uArtist')
  private onUArtistChanged(val: string, oldVal: string) {
    if (this.uAlbumArtist === oldVal) {
      this.uAlbumArtist = this.uArtist;
    }
  }

  @Watch('dArtist')
  private onDArtistChanged(val: string, oldVal: string) {
    if (this.dAlbumArtist === oldVal) {
      this.dAlbumArtist = this.dArtist;
    }
  }

  private async open() {
    await waitUntil(() => !!this.modal);
    this.modal.show();
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
      musicModule.FetchSongs();
    }).catch(() => {
      this.$message.error('Failed to upload');
      this.uReset(false);
    });
  }

  private download() {
    if (!this.downloadForm.validate()) return;
    const metadata = omitBy({
      artist: this.dArtist,
      album_artist: this.dAlbumArtist,
      album: this.dAlbum,
      title: this.dTitle,
    }, isEmpty);
    const data = {
      url: this.url,
      metadata,
    };
    this.downloading = true;
    musicModule.Download(data).then(() => {
      this.dReset();
      musicModule.FetchSongs();
      this.$message.success('Completed');
    }).catch(() => {
      this.$message.error('Failed to download');
      this.dReset(false);
    });
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
    }
  }

  private dReset(success: boolean = true) {
    this.downloading = false;
    if (success) {
      this.url = '';
      this.dArtist = '';
      this.dAlbumArtist = '';
      this.dAlbum = '';
      this.dTitle = '';
    }
  }
}
</script>
