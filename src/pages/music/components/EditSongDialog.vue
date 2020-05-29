<template>
  <b-modal ref="modal" title="Edit song" hide-footer @hidden="$nextTick($destroy)">
    <v-nav v-model="nav" :items="navItems" pills/>
    <div v-if="nav === 'info'" class="pt-3">

    </div>
    <div v-else-if="nav === 'tag'" class="pt-3">
    </div>
  </b-modal>
</template>
<script lang="ts">
import { Component, Mixins, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import axios from 'axios';
import { isArray, isEmpty, omitBy, Dictionary } from 'lodash';
import { musicModule } from '@/store';
import { Song } from '@/store/music';
import { DialogMixin, waitUntil } from '@/utils';
import { VNav, VForm, VInput } from '@/components';
import i18n from '@/i18n/music';

@Component({
  components: {
    VNav,
    VForm,
  },
  i18n,
})
export default class EditSongDialog extends Mixins(DialogMixin) {
  private nav = 'info';

  get navItems() {
    return [
      { key: 'info', title: this.$t('navs.info') },
      { key: 'tag', title: this.$t('navs.tag') },
      { key: 'edit', title: this.$t('navs.edit') },
      { key: 'lyrics', title: this.$t('navs.lyrics') },
      { key: 'artwork', title: this.$t('navs.artwork') },
    ];
  }

  @Ref() private modal!: BModal;

  public async open(song: Song) {
    await waitUntil(() => !!this.modal);
    this.modal.show();
  }

  private play(s: Song[] | Song | null) {
    if (s) {
      if (isArray(s)) {
        if (s.length === 0) return;
        musicModule.Insert(s.slice(1));
        musicModule.Play(s[0]);
      } else {
        musicModule.Play(s);
      }
    }
  }
}
</script>
