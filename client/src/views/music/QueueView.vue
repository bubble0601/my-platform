<template>
  <div class="d-flex flex-column">
    <v-sheet class="d-flex align-center px-4 py-2">
      <!-- <div class="text-h5">キュー</div> -->
      <v-btn small icon class="ml-auto" @click="$router.go(-1)">
        <v-icon>close</v-icon>
      </v-btn>
    </v-sheet>
    <v-divider/>
    <sortable-list v-model="internalQueue" class="flex-grow-1">
      <template #item="{ item: song, index }">
        <div class="flex-grow-1 min-w-0 pr-4">
          <v-list-item-title>{{ song.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ song.artist.name }} - {{ song.album.title }}</v-list-item-subtitle>
        </div>
        <v-menu bottom offset-y>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" small plain icon v-on="on">
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item @click="play(index)">
              再生
            </v-list-item>
            <v-list-item @click="setNext(index)">
              次に再生
            </v-list-item>
            <v-list-item @click="remove(index)">
              キューから削除
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </sortable-list>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Song } from '@/api/music';
import { SortableList } from '@/components';
import { musicModule } from '@/store';

@Component({
  components: {
    SortableList,
  },
})
export default class QueueView extends Vue {
  private displayNum = 30;

  get queue() {
    return musicModule.queue;
  }

  get internalQueue() {
    return this.queue.slice(0, this.displayNum);
  }
  set internalQueue(val: Song[]) {
    musicModule.SET_QUEUE(val.concat(this.queue.slice(this.displayNum)));
  }

  private play(index: number) {
    musicModule.PlayFromQueue(index);
  }

  private setNext(index: number) {
    musicModule.MOVE_TO_HEAD(index);
  }

  private remove(index: number) {
    musicModule.REMOVE_FROM_QUEUE(index);
  }
}
</script>
