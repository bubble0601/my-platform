<template>
  <div class="p-2">
    <div>
      <b-button variant="info" :disabled="loadingSync" @click="sync">
        <b-spinner v-if="loadingSync" small type="grow" class="mr-1"/>
        <span>Sync with remote</span>
      </b-button>
    </div>
    <div class="mt-2">
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
import { Vue, Component } from 'vue-property-decorator';
import { musicModule } from '@/store';

@Component
export default class Settings extends Vue {
  private loadingSync = false;
  private scanning = false;
  // private organizing = false;

  private async sync() {
    let data;
    this.loadingSync = true;
    try {
      data = await musicModule.PrepareSync();
    } finally {
      this.loadingSync = false;
    }
    if (!data.output) return;

    this.$confirm('Sync Info', data.output, { pre: true, variant: 'success' }).then(async () => {
      this.$bvToast.toast('Syncing...', { title: 'Info', variant: 'info' });
      const result = await musicModule.Sync();
      const h = this.$createElement;
      this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [result.output])], {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
    });
  }

  private async scan() {
    this.scanning = true;
    const result = await musicModule.Scan();
    this.scanning = false;
    const h = this.$createElement;
    this.$bvToast.toast([h('pre', { style: 'max-height: 80vh; overflow-y: auto;' }, [result.output])], {
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
