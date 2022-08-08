<template>
  <v-list v-if="false" rounded dense :color="dark ? 'grey darken-4' : ''" class="min-h-100">
    <v-list-item v-for="item in items" :key="item.path" :to="item.path" exact>
      <v-list-item-icon class="ml-0 mr-2">
        <v-icon v-text="item.icon"/>
        <v-icon v-if="item.key === 'smartlist'" x-small style="position: absolute; transform: translateY(-.1rem) translateX(1.4rem);">auto_awesome</v-icon>
      </v-list-item-icon>
      <span>{{ item.name }}</span>
    </v-list-item>
  </v-list>
  <!-- <v-bottom-navigation v-else-if="false" app color="primary" height="48">
    <v-btn v-for="item in items" :key="item.path" :to="item.path" exact>
      <span>{{ item.name }}</span>
      <v-icon v-text="item.icon"/>
      <v-icon v-if="item.key === 'smartlist'" x-small style="position: absolute; transform: translateY(-1rem) translateX(.95rem);">auto_awesome</v-icon>
    </v-btn>
  </v-bottom-navigation>
  <v-bottom-navigation v-else-if="false" app color="primary" height="48">
    <v-btn v-for="item in items" :key="item.path" :to="item.path" exact>
      <span>{{ item.name }}</span>
      <v-icon v-text="item.icon"/>
      <v-icon v-if="item.key === 'smartlist'" x-small style="position: absolute; transform: translateY(-1rem) translateX(.95rem);">auto_awesome</v-icon>
    </v-btn>
  </v-bottom-navigation> -->
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class MusicNavMenu extends Vue {
  @Prop({ type: String, default: 'list' })
  private type!: string;

  get dark() {
    return this.$vuetify.theme.dark;
  }

  get items() {
    return [
      { type: 'item', key: 'home', path: '/music', name: this.$t('music.home'), icon: 'home' },
      { type: 'item', key: 'song', path: '/music/songs', name: this.$t('music.song'), icon: 'audiotrack' },
      { type: 'item', key: 'artist', path: '/music/artists', name: this.$t('music.artist'), icon: 'mic' },
      { type: 'item', key: 'playlist', path: '/music/playlists', name: this.$t('music.playlist'), icon: 'queue_music' },
      { type: 'item', key: 'smartlist', path: '/music/smartlists', name: this.$t('music.smartlist'), icon: 'queue_music' },
    ];
  }
}
</script>
