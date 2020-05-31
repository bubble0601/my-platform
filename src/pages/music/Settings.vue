<template>
  <div class="p-2">
    <div v-if="isLocal">
      <b-button variant="info" :disabled="loadingSync" @click="sync">
        <b-spinner v-if="loadingSync" small type="grow" class="mr-1"/>
        <span>Sync with remote</span>
      </b-button>
    </div>
    <div v-if="isLocal" class="mt-2">
      <b-button variant="info" :disabled="scanning" @click="scan">
        <b-spinner v-if="scanning" small type="grow" class="mr-1"/>
        <span>Scan music directory</span>
      </b-button>
    </div>
    <!-- <div class="mt-2">
      <b-button variant="info" :disabled="organizing" @click="scan">
        <b-spinner v-if="organizing" small type="grow" class="mr-1"/>
        <span>Organize music directory</span>
      </b-button>
    </div> -->
  </div>
</template>
<script lang="ts">
import axios from 'axios';
import { Vue, Component } from 'vue-property-decorator';
import { settingModule } from '@/store';

@Component
export default class Settings extends Vue {
  private loadingSync = false;
  private scanning = false;
  // private organizing = false;

  get isLocal() {
    return settingModule.isLocal;
  }

  protected created() {
    settingModule.init();
  }

  private async sync() {
    let res;
    this.loadingSync = true;
    try {
      res = await axios.get<{ output: string }>('/api/music/sync/testrun');
    } finally {
      this.loadingSync = false;
    }
    if (!res.data.output) return;

    this.$confirm('Sync Info', res.data.output, { pre: true, variant: 'success' }).then(async () => {
      this.$bvToast.toast('Syncing...', { title: 'Info', variant: 'info' });
      res = await axios.post<{ output: string }>('/api/music/sync/run');
      const h = this.$createElement;
      this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res.data.output])], {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
    });
  }

  private async scan() {
    this.scanning = true;
    const res = await axios.post<{ output: string }>('/api/music/scan');
    this.scanning = false;
    const h = this.$createElement;
    this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [res.data.output])], {
      title: 'Completed',
      variant: 'success',
      solid: true,
    });
  }

  // private async organize() {
  //   this.organizing = true;
  //   const result = await musicModule.Organize();
  //   this.organizing = false;
  // }
}
</script>
