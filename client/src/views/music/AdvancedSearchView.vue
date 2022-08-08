<template>
  <v-sheet class="h-100 overflow-y-auto">
    <v-form @keydown.native.enter="search">
      <v-container>
        <v-row align="center" dense>
          <v-col cols="12" sm="3" lg="2">
            <span class="text-h6">タイトル</span>
          </v-col>
          <v-col>
            <v-text-field v-model="title" dense outlined hide-details/>
          </v-col>
          <v-col cols="5" sm="3" lg="2">
            <v-select v-model="titleMatch" :items="matchOptions" dense outlined hide-details/>
          </v-col>
        </v-row>
        <v-row align="center" dense>
          <v-col cols="12" sm="3" lg="2">
            <span class="text-h6">アーティスト</span>
          </v-col>
          <v-col>
            <v-text-field v-model="artist" dense outlined hide-details/>
          </v-col>
          <v-col cols="5" sm="3" lg="2">
            <v-select v-model="artistMatch" :items="matchOptions" dense outlined hide-details/>
          </v-col>
        </v-row>
        <v-row align="center" dense>
          <v-col cols="12" sm="3" lg="2">
            <span class="text-h6">アルバム</span>
          </v-col>
          <v-col>
            <v-text-field v-model="album" dense outlined hide-details/>
          </v-col>
          <v-col cols="5" sm="3" lg="2">
            <v-select v-model="albumMatch" :items="matchOptions" dense outlined hide-details/>
          </v-col>
        </v-row>
        <v-row align="center" dense>
          <v-col cols="12" sm="3" lg="2">
            <span class="text-h6">レート</span>
          </v-col>
          <v-col class="d-flex justify-center">
            <v-rating v-model="rateMin" dense clearable hover/>
          </v-col>
          <v-col class="flex-grow-0">
            <span class="text-h5">~</span>
          </v-col>
          <v-col class="d-flex justify-center">
            <v-rating v-model="rateMax" dense clearable hover/>
          </v-col>
        </v-row>
        <v-row align="center" dense>
          <v-col cols="12" sm="3" lg="2">
            <span class="text-h6">追加日</span>
          </v-col>
          <v-col class="d-flex justify-center">
            <date-input v-model="dateFrom" :text-field-props="{ hideDetails: true }" :max="dateTo"/>
          </v-col>
          <v-col class="flex-grow-0">
            <span class="text-h5">~</span>
          </v-col>
          <v-col class="d-flex justify-center">
            <date-input v-model="dateTo" :text-field-props="{ hideDetails: true }" :min="dateFrom"/>
          </v-col>
        </v-row>
        <v-divider class="my-4"/>
        <v-row align="center" dense>
          <v-col cols="12" sm="3" lg="2">
            <v-checkbox v-model="hasLimit" label="上限" dense hide-details class="mt-0"/>
          </v-col>
          <v-col>
            <v-text-field v-model.number="limit" type="number" :disabled="!hasLimit" dense outlined hide-details>
              <template #append-outer>
                <span>件</span>
              </template>
            </v-text-field>
          </v-col>
          <v-col>
            <v-select v-model="sortBy" :items="sortOptions" :disabled="!hasLimit" label="ソート" dense outlined hide-details/>
          </v-col>
        </v-row>
        <v-divider class="my-4"/>
        <v-row>
          <v-col cols="auto" class="ml-auto">
            <v-btn color="secondary" @click="reset">
              リセット
            </v-btn>
            <v-btn color="primary" class="ml-4" @click="search">
              検索
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-sheet>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { DateInput } from '@/components';

const BEGIN = '2010-01-01';
const TODAY = new Date().toISOString().substr(0, 10);

@Component({
  components: {
    DateInput,
  },
})
export default class AdvancedSearchView extends Vue {
  private matchOptions = [
    { value: 'contains', text: 'を含む' },
    { value: 'prefix', text: 'で始まる' },
    { value: 'suffix', text: 'で終わる' },
    { value: 'exact', text: 'に一致する' },
  ];

  private sortOptions = [
    { text: 'レートが高い', value: 'rating__desc' },
    { text: 'レートが低い', value: 'rating__asc' },
    { text: '追加日が新しい', value: 'created_at__desc' },
    { text: '追加日が古い', value: 'created_at__asc' },
  ];

  private title = '';
  private titleMatch = this.matchOptions[0].value;
  private artist = '';
  private artistMatch = this.matchOptions[0].value;
  private album = '';
  private albumMatch = this.matchOptions[0].value;
  private rateMin = 0;
  private rateMax = 5;

  private dateFrom = BEGIN;
  private dateTo = TODAY;

  private hasLimit = false;
  private limit = 100;

  private sortBy = this.sortOptions[0].value;

  private reset() {
    this.title = '';
    this.titleMatch = this.matchOptions[0].value;
    this.artist = '';
    this.artistMatch = this.matchOptions[0].value;
    this.album = '';
    this.albumMatch = this.matchOptions[0].value;
    this.rateMin = 0;
    this.rateMax = 5;
    this.dateFrom = BEGIN;
    this.dateTo = TODAY;

    this.hasLimit = false;
    this.limit = 100;

    this.sortBy = this.sortOptions[0].value;
  }

  private search() {
    const params = new URLSearchParams();
    if (this.title) {
      params.append('title', this.title);
      params.append('title_m', this.titleMatch);
    }
    if (this.artist) {
      params.append('artist', this.artist);
      params.append('artist_m', this.artistMatch);
    }
    if (this.album) {
      params.append('album', this.album);
      params.append('album_m', this.albumMatch);
    }
    if (this.rateMin > 0) {
      params.append('rate_min', this.rateMin.toString());
    }
    if (this.rateMax < 5) {
      params.append('rate_max', this.rateMax.toString());
    }
    if (this.dateFrom !== BEGIN) {
      params.append('from', this.dateFrom);
    }
    if (this.dateTo !== TODAY) {
      params.append('to', this.dateTo);
    }
    if (this.hasLimit) {
      params.append('limit', this.limit.toString());
      params.append('sort', this.sortBy);
    }
    const ps = params.toString();
    if (!ps) return;
    this.$router.push(`/music/search?type=song&${ps}`);
  }
}
</script>
<style lang="scss" scoped>
.row {
  min-height: 48px;
}
</style>
