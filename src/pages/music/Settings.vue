<template>
  <div>
    <b-container class="p-2">
      <!-- rsync -->
      <b-row v-if="isLocal" class="mb-2">
        <b-col cols="3" md="2">
          <h5 class="mb-0">Sync</h5>
        </b-col>
        <b-col>
          <b-form-group>
            <b>Local &rarr; Remote</b>
            <div class="ml-3">
              <b-form-checkbox v-model="syncParams.local.delete">Delete</b-form-checkbox>
            </div>
            <b-button variant="info" :disabled="syncParams.local.loading" @click="sync('local')">
              <b-spinner v-if="syncParams.local.loading" small type="grow" class="mr-1"/>
              <span>Testrun</span>
            </b-button>
          </b-form-group>
          <b-form-group>
            <b>Local &larr; Remote</b>
            <div class="ml-3">
              <b-form-checkbox v-model="syncParams.remote.delete">Delete</b-form-checkbox>
            </div>
            <b-button variant="info" :disabled="syncParams.remote.loading" @click="sync('remote')">
              <b-spinner v-if="syncParams.remote.loading" small type="grow" class="mr-1"/>
              <span>Testrun</span>
            </b-button>
          </b-form-group>
        </b-col>
      </b-row>
      <!-- scan -->
      <b-row v-if="isLocal" class="mb-2">
        <b-col cols="3" md="2">
          <h5 class="mb-0">Scan</h5>
        </b-col>
        <b-col>
          <b-button variant="info" :disabled="scanning" @click="scan">
            <b-spinner v-if="scanning" small type="grow" class="mr-1"/>
            <span>Scan music directory</span>
          </b-button>
        </b-col>
      </b-row>
      <!-- orgaanize -->
      <b-row class="mb-2">
        <b-col cols="3" md="2">
          <h5 class="mb-0">Organize</h5>
        </b-col>
        <b-col>
          <b-button variant="info" :disabled="organizing" @click="organize">
            <b-spinner v-if="organizing" small type="grow" class="mr-1"/>
            <span>Organize music directory</span>
          </b-button>
        </b-col>
      </b-row>
      <!-- normalize -->
      <b-row>
        <b-col cols="3" md="2">
          <h5 class="mb-0">Normalize</h5>
        </b-col>
        <b-col>
          <b-button variant="info" :disabled="normalizing" @click="normalize">
            <b-spinner v-if="normalizing" small type="grow" class="mr-1"/>
            <span>Normalize audio filename</span>
          </b-button>
        </b-col>
      </b-row>
      <!-- <b-row v-if="isMacOS">

      </b-row> -->
    </b-container>
    <select-item-dialog ref="selectDialog" :items="selectItems" scrollable @ok="onSelectOK" @hidden="onSelectEnd"/>
  </div>
</template>
<script lang="ts">
import axios from 'axios';
import { Vue, Component, Ref } from 'vue-property-decorator';
import { Dictionary } from 'lodash';
import { settingModule } from '@/store';
import { SelectItemDialog } from '@/components';
import { env } from '@/utils';

@Component({
  components: {
    SelectItemDialog,
  },
})
export default class Settings extends Vue {
  private selectItems: Array<{ key: string, label?: string, options: string[], selected: string[] }> = [];
  private selectedHandler: ((selected: Dictionary<string[]>) => any) | null = null;
  private selectEndHandler: (() => any) | null = null;

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

  get isMacOS() {
    return env.os.mac;
  }

  @Ref() private selectDialog!: SelectItemDialog;

  private onSelectOK(selected: Dictionary<string[]>) {
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

    this.$confirm('Sync Info', res1.data.output, { pre: true, variant: 'success', scrollable: true, okText: 'Run' }).then(async () => {
      this.$bvToast.toast('Syncing...', { title: 'Info', variant: 'info' });
      const res2 = await axios.post<{ output: string }>('/api/music/tools/sync', null, { params });
      const h = this.$createElement;
      this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res2.data.output])], {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
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
      this.$bvToast.toast('Not found', { variant: 'info' });
      this.scanning = false;
      return;
    }
    this.selectItems = [{ key: 'targets', label: 'Found:', options: targets, selected: targets }];
    this.selectedHandler = async (selected: Dictionary<string[]>) => {
      if (!selected.targets.length) {
        this.scanning = false;
        return;
      }
      const res2 = await axios.post<{ results: string[] }>('/api/music/tools/scan', selected.targets);
      const h = this.$createElement;
      this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res2.data.results.join('\n')])], {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
    };
    this.selectEndHandler = () => this.scanning = false;
    this.selectDialog.show();
  }

  private async organize() {
    this.organizing = true;
    const res1 = await axios.get<{ target_files: string[], target_dirs: string[] }>('/api/music/tools/organize').catch(() => {
      this.organizing = false;
    });
    if (!res1) return;

    const d = res1.data;
    if (!d.target_files.length && !d.target_dirs.length) {
      this.$bvToast.toast('Not found', { variant: 'info' });
      this.organizing = false;
      return;
    }
    this.selectItems = [
      { key: 'target_files', label: 'Delete file', options: d.target_files, selected: d.target_files  },
      { key: 'target_dirs', label: 'Delete directory', options: d.target_dirs, selected: d.target_dirs },
    ];
    this.selectedHandler = async (selected: Dictionary<string[]>) => {
      if (!selected.target_files.length && !selected.target_dirs.length) {
        this.organizing = false;
        return;
      }
      const res2 = await axios.post<{ deleted_files: string[], deleted_dirs: string[] }>('/api/music/tools/organize', selected);
      const h = this.$createElement;
      const vnode = h(
        'div',
        { style: 'max-height: 80vh; overflow-y: auto;' },
        [
          ...(
            res2.data.deleted_files.length
            ? ['Deleted files:\n', h('pre', { class: 'pl-3' }, res2.data.deleted_files.join('\n'))]
            : []
          ),
          ...(res2.data.deleted_files.length && res2.data.deleted_dirs.length ? [h('br')] : []),
          ...(
            res2.data.deleted_dirs.length
            ? ['Deleted directories:\n', h('pre', { class: 'pl-3' }, res2.data.deleted_dirs.join('\n'))]
            : []
          ),
        ],
      );
      this.$bvToast.toast(vnode, {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
    };
    this.selectEndHandler = () => this.organizing = false;
    this.selectDialog.show();
  }

  private async normalize() {
    this.normalizing = true;
    const res1 = await axios.get<Array<{ current: string, to: string }>>('/api/music/tools/normalize').catch(() => {
      this.normalizing = false;
    });
    if (!res1) return;

    const message = res1.data.map((r) => `${r.current} => ${r.to}`).join('\n');
    this.$confirm('Normalize filenames', message, { pre: true, variant: 'success', scrollable: true, okText: 'Run' }).then(async () => {
      const res2 = await axios.post<Array<{ current: string, to: string }>>('/api/music/tools/normalize');
      this.normalizing = false;
      const h = this.$createElement;
      this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res2.data.map((r) => `${r.current} => ${r.to}`).join('\n')])], {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
    }).catch(() => {
      this.normalizing = false;
    });
  }
}
</script>
