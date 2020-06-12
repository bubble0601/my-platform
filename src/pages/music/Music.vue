<template>
  <main v-if="$pc" class="d-flex flex-column" :style="mainStyle">
    <div class="d-flex flex-grow-1 overflow-hidden">
      <!-- side menu -->
      <div class="sidemenu-left py-2">
        <div class="px-2 pb-2">
          <b-button pill variant="success" size="sm" @click="add">＋ <span v-t="'add'"/></b-button>
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
      <!-- center content -->
      <div class="center-block flex-grow-1 overflow-auto">
        <keep-alive :include="['NewSong', 'TemporaryPlaylist', 'Settings']">
          <router-view/>
        </keep-alive>
      </div>
      <!-- player info -->
      <div class="sidemenu-right">
        <player-info class="h-100"/>
      </div>
    </div>
  </main>
  <main v-else class="d-flex flex-column" :style="mMainStyle">
    <player-info v-show="mOpened"
                 class="overflow-auto"
                 @close="mOpened = false"
                 @touchstart.native="mOnTouchStart"
                 @touchmove.native="mOnTouchMove"
                 @touchend.native="mOnTouchEnd"/>
    <v-nav v-show="!mOpened" :items="mTabs" tabs justified do-routing/>
    <router-view v-show="!mOpened" class="overflow-auto"/>
  </main>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator';
import { musicModule, viewModule } from '@/store';
import { SizeMixin } from '@/utils';
import { FloatingButton, VNav, ContextMenu } from '@/components';
import { ContextMenuItem } from '@/types';
import { AudioPlayer, PlayerInfo } from './components';
import music from '../../i18n/music';

@Component({
  components: {
    FloatingButton,
    PlayerInfo,
    VNav,
  },
  beforeRouteLeave(to, from, next) {
    viewModule.SET_FOOTER_PROPS({ reduced: true });
    viewModule.UNFIX_FOOTER();
    next();
  },
})
export default class Music extends Mixins(SizeMixin) {
  private mainStyle = {
    height: 'auto',
  };
  private mMainStyle = {
    'padding-bottom': '6rem',
  };

  private baseTitle = '';

  private mOpened = false;
  private mScrollPos: number = 0;
  private mTouchPath: Touch[] = [];

  get tabs() {
    const tabs: object[] = [
      { key: 'all', name: this.$t('music.all') },
    ];
    if (musicModule.temporaryPlaylist) {
      tabs.push({
        key: 'temp', name: this.$t('music.temporary'),
      });
    }
    tabs.push(
      { key: 'artist', name: this.$t('music.artist') },
      { key: 'playlist', name: this.$t('music.playlist') },
      {
        key: 'smartlist',
        name: this.$t('music.smartlist'),
        expanded: this.$route.path.startsWith('/music/smartlist'),
        children: musicModule.smartlists.map((sl) => ({
          key: `smartlist/${sl.id}`,
          name: sl.name,
        })),
      },
      { key: 'div1' },
      { key: 'space' },
      { key: 'settings', name: this.$t('settings') },
    );
    return Vue.observable(tabs);
  }

  get currentSong() {
    return musicModule.current;
  }

  get footerHeight() {
    return viewModule.footerHeight;
  }

  get mTabs() {
    return [
      { key: 'artist', to: '/music/artist', title: this.$t('music.artist') },
      { key: 'playlist', to: '/music/playlist', title: this.$t('music.playlist') },
    ];
  }

  @Watch('currentSong')
  private onSongChanged() {
    if (this.currentSong) {
      if (this.currentSong.artist.name) {
        document.title = `♪「${this.currentSong.title}」 by ${this.currentSong.artist.name} | ${this.baseTitle}`;
      } else {
        document.title = `♪「${this.currentSong.title}」 | ${this.baseTitle}`;
      }
    } else {
      document.title = this.baseTitle;
    }
  }

  @Watch('footerHeight')
  private onfooterHeightChanged() {
    this.callSizingCallbacks();
  }

  @Watch('mOpened')
  private onMOpenedChanged(val: boolean) {
    this.$nextTick(this.callSizingCallbacks);
    viewModule.SET_FOOTER_PROPS({ reduced: !this.mOpened });
  }

  protected created() {
    this.baseTitle = document.title;
    this.addSizingCallback(() => {
      if (this.$el instanceof HTMLElement) {
        this.mainStyle.height = `${window.innerHeight - this.$el.offsetTop - this.footerHeight}px`;
        // this.mainStyle.height = `${window.innerHeight - this.$el.offsetTop}px`;
        // this.leftMenuStyle.height = `${window.innerHeight - this.$el.offsetTop - this.footerHeight}px`;
        // this.contentStyle['padding-bottom'] = `${this.footerHeight}px`;
        // this.rightMenuStyle['padding-bottom'] = `${this.footerHeight}px`;
        this.mMainStyle['padding-bottom'] = `${this.footerHeight}px`;
      }
    });
    this.initAudioPlayer();
    musicModule.FetchPlaylists();
    musicModule.FetchSmartlists();
  }

  protected mounted() {
    if (musicModule.current && !musicModule.audioData) musicModule.FetchAudioForPlay(musicModule.current);
  }

  private initAudioPlayer() {
    viewModule.SET_FOOTER({
      name: 'Audio',
      component: AudioPlayer,
      props: {
        reduced: !this.mOpened,
      },
      nativeListeners: {
        click: () => {
          this.mOpened = true;
        },
        touchstart: this.mOnTouchStart,
        touchmove: this.mOnTouchStart,
        touchend: this.mOnTouchStart,
      },
    });
    viewModule.FIX_FOOTER();
  }

  private add(e: MouseEvent) {
    const t = e.target as HTMLElement;
    const menuItems: ContextMenuItem[] = [];
    menuItems.push({
      key: 'song',
      text: this.$t('music.song') as string,
      action: () => this.$router.push('/music/song/new'),
    }, {
      key: 'temp',
      text: this.$t('music.temporaryPlaylist') as string,
      action: () => this.$router.push('/music/temp'),
    });
    new ContextMenu().show({ items: menuItems, position: { x: t.offsetLeft + t.offsetWidth, y: t.offsetTop - 5 }});
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
  width: 9rem;
  min-width: 9rem;
  overflow-x: auto;
  user-select: none;

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
.center-block {
  border-right: 2px solid #dee2e6;
  overflow: auto;
}
.sidemenu-right {
  width: 16rem;
  min-width: 16rem;
  overflow-x: auto;
}
</style>
