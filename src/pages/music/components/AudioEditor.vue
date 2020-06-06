<template>
  <div class="d-flex flex-column">
    <audio ref="audio" :src="audioSrc" controls class="w-100 mb-3" @play="onPlay"/>
    <b-card>
      <template #header>
        <h5 class="mb-0">エフェクト</h5>
      </template>
      <b-button variant="primary" :disabled="!!processing" @click="removeNoise">
        <b-spinner v-if="processing === 'noisered'" type="grow" small class="mr-2"/>
        <span>ノイズ除去</span>
      </b-button>
      <b-button variant="primary" :disabled="!!processing" class="ml-2" @click="normalize">
        <b-spinner v-if="processing === 'norm'" type="grow" small class="mr-2"/>
        <span>正規化</span>
      </b-button>
    </b-card>
    <b-card class="mt-2">
      <template #header>
        <h5 class="mb-0">切り出し</h5>
      </template>
      <vue-slider v-model="cutRange" :min="0" :max="duration" :interval="0.1" :tooltip-formatter="formatTime" class="mb-3"/>
      <div class="d-flex">
        <b-button variant="primary" class="ml-auto" :disabled="!!processing" @click="cut">
          <b-spinner v-if="processing === 'trim'" type="grow" small class="mr-2"/>
          <span>OK</span>
        </b-button>
      </div>
    </b-card>
    <b-card class="mt-2">
      <template #header>
        <h5 class="mb-0">差し替え</h5>
      </template>
      <b-input-group class="mb-2">
        <template #prepend>
          <b-dropdown variant="outline-success" :text="isDownload ? 'Download' : 'Upload'">
            <b-dropdown-item @click="isDownload = true">Download</b-dropdown-item>
            <b-dropdown-item @click="isDownload = false">Upload</b-dropdown-item>
          </b-dropdown>
        </template>
        <v-input v-if="isDownload" v-model="url" @blur="onURLChanged"/>
        <b-form-file v-else v-model="file" accept="audio/*" placeholder="No File chosen" class="overflow-hidden text-nowrap">
          <template #file-name>
            {{ filename }}
          </template>
        </b-form-file>
      </b-input-group>
      <div class="d-flex">
        <b-button variant="primary" class="ml-auto" :disabled="!!processing" @click="isDownload ? download() : upload()">
          <b-spinner v-if="processing === 'download' || processing === 'upload'" type="grow" small class="mr-2"/>
          <span>OK</span>
        </b-button>
      </div>
    </b-card>
    <div class="d-flex mt-3">
      <b-button variant="outline-danger" class="ml-auto" :disabled="!!processing" @click="setData(null)">Reset</b-button>
      <b-button variant="success" class="ml-2" :disabled="!!processing || audioSrc === originalSrc" @click="save">Save</b-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from 'vue-property-decorator';
import * as mm from 'music-metadata-browser';
import { floor, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { formatTime } from '@/utils';
import axios from 'axios';

@Component
export default class AudioEditor extends Vue {
  @Prop({ type: Object, required: true })
  private readonly song!: Song;

  @Prop({ type: Blob, required: true })
  private readonly data!: Blob;

  private readonly formatTime = formatTime;
  private isPaused = false;

  private originalSrc!: string;
  private audioSrc!: string;
  private audioData!: Blob;
  private metadata!: mm.IAudioMetadata;
  private duration: number = 0;
  private cutRange = [0, 0];
  private isDownload = true;
  private url = '';
  private file: File | null = null;
  private processing: string | null = null;

  @Ref() private audio!: HTMLAudioElement;

  get filename() {
    if (!this.file) return '';
    return this.file.name;
  }

  @Watch('data', { immediate: true })
  private onDataChanged() {
    this.originalSrc = URL.createObjectURL(this.data);
    this.setData();
  }

  private async setData(data?: Blob) {
    if (data) {
      this.audioData = data;
      this.audioSrc = URL.createObjectURL(this.audioData);
    } else {
      this.audioData = this.data;
      this.audioSrc = this.originalSrc;
    }
    this.metadata = await mm.parseBlob(this.audioData);
    const d = floor(this.metadata.format.duration || 0, 1);
    if (d > this.duration) {
      this.duration = d;
      this.$nextTick(() => {
        this.cutRange = [0, d];
      });
    } else {
      this.cutRange = [0, d];
      this.$nextTick(() => {
        this.duration = d;
      });
    }
  }

  private onPlay() {
    musicModule.Pause();
  }

  private async getProcessed(params: Dictionary<string>) {
    if (!params.kind) {
      this.$message.error('Invalid operation');
      return;
    }
    this.processing = params.kind;
    if (this.audioSrc === this.originalSrc) params.reset = 'true';
    axios.get<Blob>(`/static/music/temp/${this.song.digest}/${this.song.filename}`, { params, responseType: 'blob' }).then((res) => {
      this.setData(res.data);
    }).finally(() => {
      this.processing = null;
    });
  }

  private async removeNoise() {
    const params: Dictionary<string> = {
      kind: 'noisered',
    };
    await this.getProcessed(params);
  }

  private async normalize() {
    const params: Dictionary<string> = {
      kind: 'norm',
    };
    await this.getProcessed(params);
  }

  private async cut() {
    const params: Dictionary<string> = {
      kind: 'trim',
    };
    if (this.cutRange[0] > 0) {
      params.start = this.cutRange[0].toString();
    }
    if (this.cutRange[1] < this.duration) {
      params.end = this.cutRange[1].toString();
    }
    await this.getProcessed(params);
  }

  private onURLChanged() {
    if (this.url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      this.url = `https://www.youtube.com/?v=${this.url}`;
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
  }

  private async download() {
    if (!this.url) return;
    const params: Dictionary<string> = {
      kind: 'download',
      url: this.url,
    };
    this.getProcessed(params).catch(() => {
      this.$message.error('Failed to download from the url');
    });
  }

  private async upload() {
    if (this.file === null) {
      this.$message.warn('No file chosen');
      return;
    }

    const data = new FormData();
    data.append('file', this.file);
    this.processing = 'upload';
    axios.post<Blob>(`/static/music/temp/${this.song.digest}/${this.song.filename}`, data, { responseType: 'blob' }).then((res) => {
      this.setData(res.data);
      this.processing = null;
      this.file = null;
    }).catch(() => {
      this.$message.error('Failed to upload');
    });
  }

  private async save() {
    axios.put(`/api/music/songs/${this.song.id}/file`).then(() => {
      this.$message.success('Completed');
      this.$emit('updated');
    }).catch(() => {
      this.$message.error('Failed to update file');
    });
  }
}
</script>
