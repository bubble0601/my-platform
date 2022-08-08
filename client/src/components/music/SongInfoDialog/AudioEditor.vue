<template>
  <v-container>
    <audio ref="audio" :src="audioSrc" controls class="w-100 mb-3" @loadeddata="onLoad" @play="onPlay" @keydown.stop/>
    <!-- <b-card class="mb-2">
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
    </b-card> -->
    <v-card outlined class="mb-2">
      <v-card-title>切り出し</v-card-title>
      <v-container>
        <v-range-slider v-model="cutRange" :min="0" :max="duration" :step="0.5" thumb-size="48" hide-details>
          <template #thumb-label="{ value }">
            {{ formatTime(value) }}
          </template>
        </v-range-slider>
      </v-container>
      <v-card-actions>
        <v-btn :disabled="!!processing" color="primary" outlined class="ml-auto" @click="testplay">
          テスト再生
        </v-btn>
        <v-btn :disabled="!!processing" :loading="processing === 'trim'" color="primary" class="ml-2" @click="cut">
          実行
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card outlined class="mb-2">
      <v-card-title>差し替え</v-card-title>
      <v-form class="pa-3">
        <v-switch v-model="isDownload" :label="isDownload ? 'ダウンロード' : 'アップロード'" hide-details class="mb-2"/>
        <template v-if="isDownload">
          <v-text-field v-model="$v.url.$model" type="url" dense outlined label="URL" placeholder="https://www.youtube.com/watch?v=xxxxxxxxxx" :error-messages="urlErrors" hide-details="auto" @blur="onURLChanged"/>
        </template>
        <template v-else>
          <v-file-input
            v-model="file"
            label="ファイルを選択"
            dense
            outlined
            accept="audio/*"
            show-size
            :error-messages="fileErrors"
            hide-details="auto"
          />
        </template>
      </v-form>
      <v-card-actions>
        <v-btn :disabled="!!processing" :loading="processing === 'download' || processing === 'upload'" color="primary" class="ml-2" @click="isDownload ? download() : upload()">
          実行
        </v-btn>
      </v-card-actions>
    </v-card>
    <div class="d-flex">
      <v-btn :disabled="!!processing" color="seconadry" class="ml-auto" @click="setData(null)">
        リセット
      </v-btn>
      <v-btn :disabled="!!processing || audioSrc === originalSrc" color="primary" class="ml-2" @click="save">
        保存
      </v-btn>
    </div>
  </v-container>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { required } from 'vuelidate/lib/validators';
import axios from 'axios';
import { floor } from 'lodash';
import * as mm from 'music-metadata-browser';
import { musicModule } from '@/store';
import { Song } from '@/api/music';
import { formatTime } from '@/utils';

@Component({
  validations: {
    url: {
      required,
    },
    file: {
      required,
    },
  },
})
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
  private duration = 0;
  private cutRange = [0, 0];
  private isDownload = true;
  private url = '';
  private file: File | null = null;
  private processing: string | null = null;

  @Ref() private audio!: HTMLAudioElement;

  get urlErrors() {
    const v = this.$v.url;
    if (!v.$dirty) return [];
    const errors: string[] = [];
    !v.required && errors.push('URLは入力必須です');
    return errors;
  }

  get fileErrors() {
    const v = this.$v.file;
    if (!v.$dirty) return [];
    const errors: string[] = [];
    !v.required && errors.push('ファイルが選択されていません');
    return errors;
  }

  get filename() {
    if (!this.file) return '';
    return this.file.name;
  }

  @Watch('data', { immediate: true })
  private onDataChanged() {
    this.originalSrc = URL.createObjectURL(this.data);
    this.setData();
  }

  protected mounted() {
    this.audio.addEventListener('pause', (e) => {
      // deactivateされたときのpauseイベントはwindowからではなくthis.$elから引き起こされる
      // @ts-ignore
      const path = e.path || e.composedPath();
      if (path.length === 2) {
        this.audio.play();
      }
    });
  }

  protected beforeDestroy() {
    this.audio.pause();
  }

  private async setDuration(duration: number) {
    const d = floor(duration, 1);
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

  private async setData(data?: Blob) {
    if (data) {
      this.audioData = data;
      this.audioSrc = URL.createObjectURL(this.audioData);
    } else {
      this.audioData = this.data;
      this.audioSrc = this.originalSrc;
    }
    const metadata = await mm.parseBlob(this.audioData);
    this.setDuration(metadata.format.duration || 0);
  }

  private onLoad() {
    if (this.duration === 0) {
      this.setDuration(this.audio.duration);
    }
  }

  private onPlay() {
    musicModule.Pause();
  }

  private async getProcessed(params: Record<string, string>) {
    if (!params.kind) {
      this.$snackbar.error('Invalid operation');
      return;
    }
    this.processing = params.kind;
    if (this.audioSrc === this.originalSrc) params.reset = 'true';
    const { data } = await axios.get<Blob>(`/static/music/temp/${this.song.digest}/${this.song.filename}`, { params, responseType: 'blob' }).finally(() => {
      this.processing = null;
    });
    this.setData(data);
  }

  // private async removeNoise() {
  //   const params: Dictionary<string> = {
  //     kind: 'noisered',
  //   };
  //   await this.getProcessed(params);
  // }

  // private async normalize() {
  //   const params: Dictionary<string> = {
  //     kind: 'norm',
  //   };
  //   await this.getProcessed(params);
  // }

  private testplay() {
    this.audio.currentTime = this.cutRange[0];
    this.audio.play();
    const stopTestplay = () => {
      if (this.audio.currentTime >= this.cutRange[1]) {
        this.audio.pause();
        this.audio.removeEventListener('timeupdate', stopTestplay);
      }
    };
    this.audio.addEventListener('timeupdate', stopTestplay);
  }

  private async cut() {
    const params: Record<string, string> = {
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
  }

  private async download() {
    this.$v.url.$touch();
    if (this.$v.url.$invalid) return;
    const params: Record<string, string> = {
      kind: 'download',
      url: this.url,
    };
    this.getProcessed(params).then(() => {
      this.url = '';
    }).catch(() => {
      this.$snackbar.error('Failed to download from the url');
    });
  }

  private async upload() {
    this.$v.file.$touch();
    if (this.$v.file.$invalid) return;
    if (this.file == null) return;

    const data = new FormData();
    data.append('file', this.file);
    this.processing = 'upload';
    axios.post<Blob>(`/static/music/temp/${this.song.digest}/${this.song.filename}`, data, { responseType: 'blob' }).then((res) => {
      this.setData(res.data);
      this.processing = null;
      this.file = null;
    }).catch(() => {
      this.$snackbar.error('Failed to upload');
    });
  }

  private async save() {
    axios.put(`/api/music/songs/${this.song.id}/file`).then(() => {
      this.$snackbar.success('Completed');
      this.$emit('updated');
    }).catch(() => {
      this.$snackbar.error('Failed to update file');
    });
  }
}
</script>
