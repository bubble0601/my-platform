<template>
  <v-text-field
    v-model="query"
    type="search"
    dense
    solo-inverted
    flat
    :autofocus="!$sm"
    prepend-inner-icon="search"
    placeholder="Musicを検索"
    hide-details
    @blur="$emit('blur', query)"
    @keydown.enter="search"
  >
    <template #prepend-inner>
      <v-icon color="grey" class="ml-1 mr-2">search</v-icon>
    </template>
    <template #append>
      <v-tooltip bottom>
        <span>高度な検索</span>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" to="/music/advanced_search" small icon v-on="on">
            <v-icon>tune</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class MusicSearch extends Vue {
  private query = '';

  private search() {
    if (!this.query) return;
    const params = new URLSearchParams();
    params.append('q', this.query);
    const path = `/music/search?${params.toString()}`;
    console.log(this.$route);
    if (this.$route.fullPath !== path) {
      this.$router.push(path);
    }
  }
}
</script>
