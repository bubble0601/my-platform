<template>
  <v-row dense align="center" class="song-list__header" :style="$pc ? { 'margin-right': `${$scrollbarWidth}px` } : {}">
    <v-col v-if="$lg" class="colr-2">
      <header-item class="d-flex align-center justify-center">
        <template v-if="selectData.enabled">
          <v-btn icon x-small :color="selectData.none ? 'grey' : ''" @click="selectData.onInput">
            <v-icon>
              <template v-if="selectData.all">check_circle</template>
              <template v-else-if="selectData.none">radio_button_unchecked</template>
              <template v-else>radio_button_checked</template>
            </v-icon>
          </v-btn>
        </template>
        <template v-else>#</template>
      </header-item>
    </v-col>
    <v-col class="colr-12">
      <header-item sortable :sorting="sortBy === 'title'" :sortDesc="sortDesc" @click="toggleSort('title')">
        タイトル
      </header-item>
    </v-col>
    <v-col class="colr-12">
      <header-item sortable :sorting="sortBy === 'artist.name'" :sortDesc="sortDesc" @click="toggleSort('artist.name')">
        アーティスト
      </header-item>
    </v-col>
    <v-col v-if="$md" class="colr-12">
      <header-item sortable :sorting="sortBy === 'album.title'" :sortDesc="sortDesc" @click="toggleSort('album.title')">
        アルバム
      </header-item>
    </v-col>
    <v-col v-if="$md" class="colr-4">
      <header-item sortable :sorting="sortBy === 'rating'" :sortDesc="sortDesc" @click="toggleSort('rating')">
        レート
      </header-item>
    </v-col>
    <v-col class="colr-3">
      <header-item sortable :sorting="sortBy === 'time'" :sortDesc="sortDesc" @click="toggleSort('time')">
        時間
      </header-item>
    </v-col>
    <v-col v-if="$md" class="colr-3">
      <header-item sortable :sorting="sortBy === 'year'" :sortDesc="sortDesc" @click="toggleSort('year')">
        年
      </header-item>
    </v-col>
    <v-col v-if="$md" class="colr-3">
      <header-item sortable :sorting="sortBy === 'played_count'" :sortDesc="sortDesc" @click="toggleSort('played_count')">
        再生回数
      </header-item>
    </v-col>
    <!-- menu -->
    <v-col class="colr-2"/>
  </v-row>
</template>
<script lang="ts">
import { Vue, Component, Prop, PropSync } from 'vue-property-decorator';
import HeaderItem from './HeaderItem.vue';

@Component({
  components: {
    HeaderItem,
  },
})
export default class SongListHeader extends Vue {
  @Prop({ type: Object, required: true })
  private selectData!: {
    enabled: boolean,
    all: boolean,
    none: boolean,
    onInput: () => void,
  };

  @PropSync('sortBy', { type: String, required: true })
  private _sortBy!: string;

  @PropSync('sortDesc', { type: Boolean, required: true })
  private _sortDesc!: boolean;

  private toggleSort(key: string) {
    if (this._sortBy === key) {
      if (this._sortDesc) {
        this._sortBy = '';
        this._sortDesc = false;
      } else {
        this._sortDesc = true;
      }
    } else {
      this._sortBy = key;
      this._sortDesc = false;
    }
  }
}
</script>
<style lang="scss" scoped>
.song-list__header {
  margin: 0;
}
</style>
