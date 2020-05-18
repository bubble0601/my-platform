<template>
  <main v-if="$pc" class="d-flex flex-column" :style="mainStyle">
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
      <div class="center-block flex-grow-1 overflow-auto">
        <router-view/>
      </div>
      <div class="sidemenu-right">
        <player-info class="h-100"/>
      </div>
    </div>
    <audio-player ref="player"/>
  </main>
  <main v-else-if="mOpened" class="d-flex flex-column" :style="mainStyle">
    <player-info class="overflow-auto" @close="mOpened = false"/>
    <audio-player ref="player"/>
  </main>
  <main v-else class="d-flex flex-column" :style="mainStyle">
    <v-nav :items="mTabs" tabs justified do-routing/>
    <router-view class="overflow-auto"/>
    <audio-player ref="player" reduced @click.native="mOpened = true"/>
  </main>
</template>
<script lang="ts">
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { musicModule } from '@/store';
import { SizeMixin } from '@/utils';
import { VNav } from '@/components';
import { AddSongDialog, AudioPlayer, PlayerInfo } from './components';

@Component({
  components: {
    AudioPlayer,
    PlayerInfo,
    VNav,
  },
})
export default class Music extends mixins(SizeMixin) {
  private mainStyle = {
    'height': 'auto',
    'padding-bottom': '0',
  };

  private baseTitle = '';
  private tabs = [
    { key: 'all', name: 'All' },
    { key: 'artist', name: 'Artist' },
    { key: 'playlist', name: 'Playlist' },
    { key: 'div1' },
    { key: 'playlist/new', name: 'New' },
    { key: 'playlist/fabulous', name: 'Fabulous' },
    { key: 'playlist/excellent', name: 'Excellent' },
    { key: 'playlist/great', name: 'Great' },
    { key: 'playlist/good', name: 'Good' },
    { key: 'playlist/unrated', name: 'Unrated' },
    { key: 'space' },
    { key: 'settings', name: 'Settings' },
  ];

  private mOpened = true;
  private mTabs = [
    { key: 'artist', to: '/music/artist', title: 'Artist' },
    { key: 'playlist', to: '/music/playlist', title: 'Playlist' },
  ];

  get currentSong() {
    return musicModule.current;
  }

  @Ref() private player!: AudioPlayer;

  @Watch('currentSong')
  private onSongChanged() {
    if (this.currentSong) {
      document.title = `♪${this.currentSong.title} - ${this.baseTitle}`;
    } else {
      document.title = this.baseTitle;
    }
  }

  protected created() {
    this.baseTitle = document.title;
    if (this.$pc) {
      this.addSizingCallback(() => {
        if (this.$el instanceof HTMLElement) {
          this.mainStyle.height = `${window.innerHeight - this.$el.offsetTop}px`;
        }
      });
    } else {
      this.addSizingCallback(() => {
        this.mainStyle['padding-bottom'] = `${this.player.$el.clientHeight}px`;
      });
    }
  }

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
  overflow-x: auto;
}
.center-block {
  border-right: 2px solid #dee2e6;
}
</style>
