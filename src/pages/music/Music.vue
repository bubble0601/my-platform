<template>
  <div class="d-flex flex-column" :style="{ height }">
    <div class="d-flex flex-grow-1 overflow-hidden">
      <div class="sidemenu-left py-2">
        <div class="px-2 pb-2">
          <b-button pill variant="success" size="sm" @click="addSong">＋ Add</b-button>
        </div>
        <template v-for="t in tabs">
          <router-link v-if="t.name" :key="t.key" :to="`/music/${t.key}`" tag="div" class="menu-item px-3" active-class="active">
            {{ t.name }}
          </router-link>
          <div v-else-if="t.key === 'space'" class="mt-auto"/>
          <hr v-else class="mt-2 mb-1">
        </template>
      </div>
      <div class="flex-grow-1 overflow-auto">
        <router-view/>
      </div>
      <div class="sidemenu-right">
        <player-info/>
      </div>
    </div>
    <audio-player class="mt-auto"/>
  </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { musicModule } from '@/store';
import { HeightMixin } from '@/utils';
import { AddSongDialog, AudioPlayer, PlayerInfo } from './components';

@Component({
  components: {
    AudioPlayer,
    PlayerInfo,
  },
})
export default class Music extends mixins(HeightMixin) {
  private tabs = [
    { key: 'all', name: 'All' },
    { key: 'artist', name: 'Artist' },
    { key: 'playlist', name: 'Playlist' },
    { key: 'div1' },
    { key: 'fabulous', name: 'Fabulous' },
    { key: 'excellent', name: 'Excellent' },
    { key: 'great', name: 'Great' },
    { key: 'good', name: 'Good' },
    { key: 'unrated', name: 'Unrated' },
    { key: 'space' },
    { key: 'settings', name: 'Settings' },
  ];

  protected mounted() {
    if (musicModule.current) musicModule.FetchAudio(musicModule.current);
  }

  private addSong() {
    // @ts-ignore
    new AddSongDialog().open();
  }
}
</script>
<style lang="scss" scoped>
.sidemenu-left {
  display: flex;
  flex-direction: column;
  background-color: #dee2e655;
  .menu-item {
    display: block;
    color: #6c757d;
    cursor: pointer;
    &:hover {
      color: #595e63;
      background-color: #9993;
    }
    &.active {
      color: #494d50;
      background-color: #9995;
      cursor: default;
    }
  }
}
.table {
  font-size: smaller;
}
.sidemenu-right {
  width: 16rem;
  border-left: 2px solid #dee2e6;
  overflow-x: auto;
}
</style>
