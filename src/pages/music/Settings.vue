<template>
  <b-container class="p-2">
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
    <b-row>
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
    <!-- <b-row v-if="isMacOS">

    </b-row> -->
  </b-container>
</template>
<script lang="ts">
import axios from 'axios';
import { Vue, Component } from 'vue-property-decorator';
import { settingModule } from '@/store';
import { env } from '@/utils';

@Component
export default class Settings extends Vue {
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

  get isLocal() {
    return settingModule.isLocal;
  }

  get isMacOS() {
    return env.os.mac;
  }

  protected created() {
    settingModule.init();
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
    const res = await axios.post<{ output: string }>('/api/music/tools/scan');
    this.scanning = false;
    const h = this.$createElement;
    this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res.data.output])], {
      title: 'Completed',
      variant: 'success',
      solid: true,
    });
  }

  private async organize() {
    this.organizing = true;
    const res1 = await axios.get<{ output: string }>('/api/music/tools/organize').catch(() => {
      this.organizing = false;
    });
    if (!res1) return;

    this.$confirm('Organize Info', res1.data.output, { pre: true, variant: 'success', scrollable: true, okText: 'Run' }).then(async () => {
      this.$bvToast.toast('Organizing...', { title: 'Info', variant: 'info' });
      const res2 = await axios.post<{ output: string }>('/api/music/tools/organize');
      const h = this.$createElement;
      this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res2.data.output])], {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
    }).finally(() => {
      this.organizing = false;
    });
  }
}
</script>
