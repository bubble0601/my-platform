<template>
  <div class="d-flex">
    <music-nav-menu/>
    <v-container class="pa-3">
      <!-- notification -->
      <v-row align="center">
        <v-col cols="4" sm="3">
          <h5>再生する曲を通知</h5>
        </v-col>
        <v-col>
          <v-switch v-model="notifySong" :disabled="notificationDisabled" :label="notifySong ? '有効' : '無効'" hide-details/>
        </v-col>
      </v-row>
      <!-- rsync -->
      <template v-if="isLocal">
        <v-row align="center">
          <v-col cols="3">
            <h5>同期</h5>
          </v-col>
          <v-col cols="3" sm="2">
            <b>Local &rarr; Remote</b>
          </v-col>
          <v-col cols="3" sm="2">
            <v-checkbox v-model="syncParams.local.delete" label="Delete" dense hide-details class="mt-0"/>
          </v-col>
          <v-col>
            <v-btn :loading="syncParams.local.loading" color="info" @click="sync('local')">
              Testrun
            </v-btn>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="3"/>
          <v-col cols="3" sm="2">
            <b>Local &larr; Remote</b>
          </v-col>
          <v-col cols="3" sm="2">
            <v-checkbox v-model="syncParams.remote.delete" label="Delete" dense hide-details class="mt-0"/>
          </v-col>
          <v-col>
            <v-btn :loading="syncParams.remote.loading" color="info" @click="sync('remote')">
              Testrun
            </v-btn>
          </v-col>
        </v-row>
      </template>
      <!-- scan -->
      <v-row v-if="isLocal">
        <v-col cols="4" sm="3">
          <h5>スキャン</h5>
        </v-col>
        <v-col>
          <v-btn :loading="scanning" color="info" @click="scan">
            実行
          </v-btn>
        </v-col>
      </v-row>
      <!-- organize -->
      <v-row>
        <v-col cols="4" sm="3">
          <h5>整理</h5>
        </v-col>
        <v-col>
          <v-btn :loading="organizing" color="info" @click="organize">
            実行
          </v-btn>
        </v-col>
      </v-row>
      <!-- normalize -->
      <v-row>
        <v-col cols="4" sm="3">
          <h5>ファイル名の正規化</h5>
        </v-col>
        <v-col>
          <v-btn :loading="normalizing" color="info" @click="normalize">
            実行
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <select-item-dialog ref="selectDialog" :items="selectItems" @ok="onSelectOK" @cancel="onSelectEnd"/>
  </div>
</template>
<script lang="ts">
import axios from 'axios';
import { Vue, Component, Ref } from 'vue-property-decorator';
import { settingModule, musicModule } from '@/store';
import { SelectItemDialog } from '@/components';
import { MusicNavMenu } from '@/components/music';
import { env } from '@/utils';

@Component({
  components: {
    SelectItemDialog,
    MusicNavMenu,
  },
})
export default class Settings extends Vue {
  private selectItems: Array<{ key: string, label?: string, options: string[], selected: string[] }> = [];
  private selectedHandler: ((selected: Record<string, string[]>) => unknown) | null = null;
  private selectEndHandler: (() => unknown) | null = null;

  private syncParams = {
    local: {
      loading: false,
      delete: false,
    },
    remote: {
      loading: false,
      delete: false,
    },
  };

  private scanning = false;

  private organizing = false;

  private normalizing = false;

  get isLocal() {
    return settingModule.isLocal;
  }

  get notificationDisabled() {
    return Notification.permission === 'denied';
  }

  get notifySong() {
    return musicModule.notifySong;
  }

  set notifySong(val) {
    if (val) {
      musicModule.EnableSongNotification();
    } else {
      musicModule.DisableSongNotification();
    }
  }

  get isMacOS() {
    return env.os.mac;
  }

  @Ref() private selectDialog!: SelectItemDialog;

  private onSelectOK(selected: Record<string, string[]>) {
    if (this.selectedHandler) {
      this.selectedHandler(selected);
      this.selectedHandler = null;
    }
    this.selectItems = [];
  }

  private onSelectEnd() {
    if (this.selectEndHandler) {
      this.selectEndHandler();
      this.selectedHandler = null;
    }
    this.selectItems = [];
  }

  private async sync(dir: 'local' | 'remote') {
    const p = this.syncParams[dir];
    p.loading = true;
    const params = {
      local: dir === 'local',
      delete: p.delete,
    };
    const res1 = await axios.get<{ output: string }>('/api/music/tools/sync', { params }).finally(() => {
      p.loading = false;
    });
    if (!res1.data.output) return;


    // this.$confirm('Sync Info', res1.data.output, { pre: true, variant: 'success', scrollable: true, okText: 'Run' })
    this.$confirm({
      title: 'Sync info',
      message: res1.data.output,
      dialogProps: {
        contentClass: 'pre',
        scrollable: true,
      },
      okBtnText: 'Run',
    }).then(async() => {
      this.$snackbar.info('Syncing...');
      // const res2 = await axios.post<{ output: string }>('/api/music/tools/sync', null, { params });
      // const h = this.$createElement;
      // this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res2.data.output])], {
      //   title: 'Completed',
      //   variant: 'success',
      //   solid: true,
      // });
      await axios.post<{ output: string }>('/api/music/tools/sync', null, { params });
      this.$snackbar.success('Completed');
    });
  }

  private async scan() {
    this.scanning = true;
    const res1 = await axios.get<{ targets: string[] }>('/api/music/tools/scan').catch(() => {
      this.scanning = false;
    });
    if (!res1) return;

    const targets = res1.data.targets;
    if (!targets.length) {
      this.$snackbar.info('Not found');
      this.scanning = false;
      return;
    }
    this.selectItems = [{ key: 'targets', label: 'Found:', options: targets, selected: targets }];
    this.selectedHandler = async(selected: Record<string, string[]>) => {
      if (!selected.targets.length) {
        this.scanning = false;
        return;
      }
      // const res2 = await axios.post<{ results: string[] }>('/api/music/tools/scan', selected.targets);
      // const h = this.$createElement;
      // this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res2.data.results.join('\n')])], {
      //   title: 'Completed',
      //   variant: 'success',
      //   solid: true,
      // });
      await axios.post<{ results: string[] }>('/api/music/tools/scan', selected.targets);
      this.$snackbar.success('Completed');
    };
    this.selectEndHandler = () => this.scanning = false;
    this.selectDialog.open();
  }

  private async organize() {
    this.organizing = true;
    const res1 = await axios.get<{ target_files: string[], target_dirs: string[], missing_files: string[] }>('/api/music/tools/organize').catch(() => {
      this.organizing = false;
    });
    if (!res1) return;

    // const h = this.$createElement;
    const d = res1.data;
    if (d.missing_files.length) {
      this.$snackbar.warn('Missing file');
      // this.$bvToast.toast(
      //   [h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res1.data.missing_files.join('\n')])],
      //   { title: 'Missing files', variant: 'warning', solid: true },
      // );
    }
    if (!d.target_files.length && !d.target_dirs.length) {
      this.$snackbar.info('Not found');
      this.organizing = false;
      return;
    }

    this.selectItems = [
      { key: 'target_files', label: 'Delete file', options: d.target_files, selected: d.target_files  },
      { key: 'target_dirs', label: 'Delete directory', options: d.target_dirs, selected: d.target_dirs },
    ];
    this.selectedHandler = async(selected: Record<string, string[]>) => {
      if (!selected.target_files.length && !selected.target_dirs.length) {
        this.organizing = false;
        return;
      }
      // const res2 = await axios.post<{ deleted_files: string[], deleted_dirs: string[] }>('/api/music/tools/organize', selected);
      // const vnode = h(
      //   'div',
      //   { style: 'max-height: 80vh; overflow-y: auto;' },
      //   [
      //     ...(
      //       res2.data.deleted_files.length
      //       ? ['Deleted files:\n', h('pre', { class: 'pl-3' }, res2.data.deleted_files.join('\n'))]
      //       : []
      //     ),
      //     ...(res2.data.deleted_files.length && res2.data.deleted_dirs.length ? [h('br')] : []),
      //     ...(
      //       res2.data.deleted_dirs.length
      //       ? ['Deleted directories:\n', h('pre', { class: 'pl-3' }, res2.data.deleted_dirs.join('\n'))]
      //       : []
      //     ),
      //   ],
      // );
      // this.$bvToast.toast(vnode, {
      //   title: 'Completed',
      //   variant: 'success',
      //   solid: true,
      // });
      await axios.post<{ deleted_files: string[], deleted_dirs: string[] }>('/api/music/tools/organize', selected);
      this.$snackbar.success('Completed');
    };
    this.selectEndHandler = () => this.organizing = false;
    this.selectDialog.open();
  }

  private async normalize() {
    this.normalizing = true;
    const res1 = await axios.get<Array<{ current: string, to: string }>>('/api/music/tools/normalize').catch(() => {
      this.normalizing = false;
    });
    if (!res1) return;

    const message = res1.data.map((r) => `${r.current} => ${r.to}`).join('\n');
    // this.$confirm('Normalize filenames', message, { pre: true, variant: 'success', scrollable: true, okText: 'Run' })
    this.$confirm({
      title: 'Files to be normalized',
      message,
      dialogProps: {
        contentClass: 'pre',
        scrollable: true,
      },
      okBtnText: 'Run',
    }).then(async() => {
      // const res2 = await axios.post<Array<{ current: string, to: string }>>('/api/music/tools/normalize');
      // this.normalizing = false;
      // const h = this.$createElement;
      // this.$bvToast.toast(
      //   [h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res2.data.map((r) => `${r.current} => ${r.to}`).join('\n')])],
      //   { title: 'Completed', variant: 'success', solid: true },
      // );
      await axios.post<Array<{ current: string, to: string }>>('/api/music/tools/normalize');
      this.normalizing = false;
      this.$snackbar('Completed');
    }).catch(() => {
      this.normalizing = false;
    });
  }
}
</script>
