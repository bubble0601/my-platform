<template>
  <div>
    <v-app-bar app dense flat>
      <template v-if="$mobile && searchExpanded">
        <v-btn icon @click="searchExpanded = false">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </template>
      <template v-else>
        <app-bar-hamburger v-if="$mobile"/>
        <div v-else class="mr-4">
          <v-icon>mic</v-icon>
        </div>

        <v-toolbar-title>アーティスト</v-toolbar-title>
      </template>

      <app-bar-search v-model="query" :expanded.sync="searchExpanded" placeholder="アーティストを検索" class="flex-grow-1" @blur="$mobile && query && (searchExpanded = false)"/>
    </v-app-bar>

    <artist-list :artists="artists" :loading="loading" :search="query"/>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { MusicApi } from '@/api';
import { Artist } from '@/api/music';
import { ArtistList } from '@/components/music';

export default Vue.extend({
  name: 'ArtistListView',
  components: {
    ArtistList,
  },
  data() {
    return {
      artists: [] as Artist[],
      loading: false,
      searchExpanded: false,
      query: '',
    };
  },
  async created() {
    this.loading = true;
    this.artists = (await MusicApi.fetchArtists()).data;
    this.loading = false;
  },
});
</script>
