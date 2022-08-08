<template>
  <div class="h-100">
    <v-data-iterator
      :loading="loading"
      :items="smartlists"
      :locale="$vuetify.lang.current"
      :items-per-page="-1"
      hide-default-footer
      class="smartlist-list"
    >
      <template #loading>
        <v-progress-linear indeterminate/>
      </template>

      <template #default="{ items }">
        <div class="smartlist-list__body">
          <v-row
              v-for="smartlist in items"
              :key="smartlist.id"
              v-ripple
              dense
              align="center"
              class="smartlist-list__row"
              @click="$router.push(`/music/smartlist/${smartlist.id}`)"
              @contextmenu.prevent="showContextMenu(smartlist, $event.clientX, $event.clientY)"
          >
            <v-col cols="2" sm="1" class="text-center">
              <v-avatar size="32">
                <v-icon>list</v-icon>
              </v-avatar>
            </v-col>
            <v-col>
              <div>{{ smartlist.name }}</div>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-data-iterator>

    <v-menu v-model="contextMenu" :position-x="contextMenuX" :position-y="contextMenuY">
      <v-list v-if="contextMenuTarget" dense>
        <v-list-item @click="play">再生</v-list-item>
        <v-list-item @click="deleteSmartlist">削除</v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Smartlist } from '@/api/music';
import { musicModule } from '@/store';
import { MusicApi } from '@/api';

@Component
export default class SmartlistList extends Vue {
  private loading = false;
  // private view: 'grid' | 'list' = 'list';

  private contextMenu = false;
  private contextMenuTarget: Smartlist | null = null;
  private contextMenuX = 0;
  private contextMenuY = 0;

  get smartlists() {
    return musicModule.smartlists;
  }

  // @Watch('view')
  // protected saveView() {
  //   localStorage.setItem('smartlist-list.view', this.view);
  // }

  protected async created() {
    // this.view = localStorage.getItem('smartlist-list.view') || 'list';
    this.loading = true;
    await musicModule.FetchSmartlists();
    this.loading = false;
  }

  private showContextMenu(smartlist: Smartlist, x: number, y: number) {
    this.contextMenu = true;
    this.contextMenuTarget = smartlist;
    this.contextMenuX = x;
    this.contextMenuY = y;
  }

  private async play() {
    if (this.contextMenuTarget?.id != null) {
      const songs = (await MusicApi.fetchSmartlistSongs(this.contextMenuTarget.id)).data;
      musicModule.PlaySongs(songs);
    }
  }

  private async deleteSmartlist() {
    // if (this.contextMenuTarget?.id != null) {
    //   MusicApi.deleteSmartlist(this.contextMenuTarget.id);
    // }
    this.$snackbar.warn('Not implemented');
  }
}
</script>
<style lang="scss" scoped>
.smartlist-list {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  user-select: none;

  .smartlist-list__body {
    flex-grow: 1;
    overflow: auto;
  }

  .smartlist-list__row {
    margin: 0;
    cursor: pointer;
    &:hover {
      background-color: #80808020;
    }
  }
}
</style>
