<template>
  <div class="p-2">
    <div>
      <b-button variant="success" :disabled="loading" @click="sync">
        <b-spinner v-if="loading" small type="grow" class="mr-1"/>
        <span>Sync with remote</span>
      </b-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { musicModule } from '@/store';

@Component
export default class Settings extends Vue {
  private loading = false;

  private async sync() {
    this.loading = true;
    const { output } = await musicModule.PrepareSync();
    this.loading = false;
    this.$confirm('Sync Info', output, { pre: true, variant: 'success' }).then(async () => {
      this.$bvToast.toast('Syncing...', { title: 'Info', variant: 'info' });
      const data = await musicModule.Sync();
      const h = this.$createElement;
      this.$bvToast.toast([h('pre', {}, [data.output])], {
        title: 'Completed',
        variant: 'success',
        solid: true,
      });
    });
  }
}
</script>
