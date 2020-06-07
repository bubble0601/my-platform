<template>
  <main v-if="$pc" class="d-flex flex-column" :style="mainStyle">
    <div class="d-flex flex-grow-1 overflow-hidden">
      <!-- side menu -->
      <div class="sidemenu-left py-2">
        <div class="px-2 pb-2">
          <b-button pill variant="success" size="sm" @click="addSong">＋ Add</b-button>
        </div>
        <template v-for="t in tabs">
          <template v-if="t.children">
            <div class="menu-item cursor-pointer px-3" :class="{ active: $route.path.startsWith(`/music/${t.key}`) }" @click="t.expanded = !t.expanded">
              {{ t.name }}
            </div>
            <b-collapse v-model="t.expanded">
              <router-link v-for="tc in t.children" :key="tc.key" :to="`/music/${tc.key}`" tag="div" class="menu-item pl-4 pr-2" active-class="active">
                {{ tc.name }}
              </router-link>
            </b-collapse>
          </template>
          <router-link v-else-if="t.name" :key="t.key" :to="`/music/${t.key}`" tag="div" class="menu-item px-3" active-class="active">
            {{ t.name }}
          </router-link>
          <div v-else-if="t.key === 'space'" class="mt-auto"/>
          <hr v-else class="mt-2 mb-1">
        </template>
      </div>
      <!-- main -->
      <div class="center-block flex-grow-1 overflow-auto">
        <keep-alive include="Settings">
          <router-view/>
        </keep-alive>
      </div>
      <!-- player info -->
      <div class="sidemenu-right">
        <player-info class="h-100"/>
      </div>
    </div>
    <audio-player ref="player"/>
  </main>
  <main v-else class="d-flex flex-column" :style="mMainStyle">
    <player-info v-show="mOpened"
                 class="overflow-auto"
                 @close="mOpened = false"
                 @touchstart.native="mOnTouchStart"
                 @touchmove.native="mOnTouchMove"
                 @touchend.native="mOnTouchEnd"/>

    <floating-button v-show="!mOpened" icon="plus" :offset="4" @click="addSong"/>
    <v-nav v-show="!mOpened" :items="mTabs" tabs justified do-routing/>
    <router-view v-show="!mOpened" class="overflow-auto"/>

    <audio-player ref="player" :reduced="!mOpened"
                  @click.native="mOpened = true"
                  @touchstart.native="mOnTouchStart"
                  @touchmove.native="mOnTouchMove"
                  @touchend.native="mOnTouchEnd"/>
  </main>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator';
import { musicModule } from '@/store';
import { SizeMixin } from '@/utils';
import { FloatingButton, VNav } from '@/components';
import { AddSongDialog, AudioPlayer, PlayerInfo } from './components';

@Component({
  components: {
    AudioPlayer,
    FloatingButton,
    PlayerInfo,
    VNav,
  },
})
export default class Music extends Mixins(SizeMixin) {
  private readonly mainStyle = {
    height: 'auto',
  };
  private readonly mMainStyle = {
    'padding-bottom': '6rem',
  };

  private baseTitle = '';

  private tabs: object[] = [];

  private mOpened = true;
  private mTabs = [
    { key: 'artist', to: '/music/artist', title: 'Artist' },
    { key: 'playlist', to: '/music/playlist', title: 'Playlist' },
  ];
  private mScrollPos: number = 0;
  private mTouchPath: Touch[] = [];

  get currentSong() {
    return musicModule.current;
  }

  @Ref() private player!: AudioPlayer;

  @Watch('currentSong')
  private onSongChanged() {
    if (this.currentSong) {
      if (this.currentSong.artist.name) {
        document.title = `♪${this.currentSong.title} - ${this.currentSong.artist.name} | ${this.baseTitle}`;
      } else {
        document.title = `♪${this.currentSong.title} | ${this.baseTitle}`;
      }
    } else {
      document.title = this.baseTitle;
    }
  }

  @Watch('mOpened')
  private onMOpenedChanged(val: boolean) {
    if (val) this.mMainStyle['padding-bottom'] = '6rem';
    else this.mMainStyle['padding-bottom'] = '4rem';
  }

  protected async created() {
    this.baseTitle = document.title;
    this.addSizingCallback(() => {
      if (this.$el instanceof HTMLElement) {
        this.mainStyle.height = `${window.innerHeight - this.$el.offsetTop}px`;
      }
    });
    const sl: Array<{ key: string, name: string }> = [];
    this.tabs = [
      { key: 'all', name: 'All' },
      { key: 'artist', name: 'Artist' },
      { key: 'playlist', name: 'Playlist' },
      {
        key: 'smartlist',
        name: 'Smartlist',
        expanded: this.$route.path.startsWith('/music/smartlist'),
        children: sl,
      },
      { key: 'div1' },
      { key: 'space' },
      { key: 'settings', name: 'Settings' },
    ];
    await musicModule.FetchSmartlists();
    sl.push(...musicModule.smartlists.map((l) => ({
      key: `smartlist/${l.id}`,
      name: l.name,
    })));
  }

  protected mounted() {
    if (musicModule.current) musicModule.FetchAudioForPlay(musicModule.current);
  }

  private addSong() {
    new AddSongDialog({
      parent: this,
    }).open();
  }

  private mOnTouchStart(e: TouchEvent) {
    this.mScrollPos = window.scrollY;
    this.mTouchPath.push(e.changedTouches[0]);
  }

  private mOnTouchMove(e: TouchEvent) {
    this.mTouchPath.push(e.changedTouches[0]);
    // const touchY = e.changedTouches[0].clientY;
    // const movedDistance = touchY - this.mTouchPos;
    // if (movedDistance < 0) {
    //   this.mScrollPos = -1;
    //   this.mTop = 0;
    // } else {
    //   this.mTop = movedDistance;
    // }
  }

  private mOnTouchEnd(e: TouchEvent) {
    if (this.mScrollPos > 0) return;
    const last = this.mTouchPath.pop();
    const beforeLast = this.mTouchPath.pop();
    if (last && beforeLast) {
      if (last.clientY - beforeLast.clientY > 0) {
        this.mOpened = false;
      } else {
        this.mOpened = true;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.sidemenu-left {
  display: flex;
  flex-direction: column;
  background-color: #dee2e655;
  width: 7rem;
  overflow-x: auto;

  .menu-item {
    display: block;
    color: #6c757d;
    cursor: pointer;
    white-space: nowrap;
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
