<template>
  <v-navigation-drawer v-model="drawer" app :permanent="$pc" height="100%" :class="$pc ? 'drawer--borderless' : ''">
    <div class="d-flex h-100">
      <div class="d-flex flex-column" :class="$dark ? 'grey darken-3' : 'grey lighten-2'" style="width: 48px">
        <v-sheet color="transparent" height="48" class="d-flex align-center justify-center">
          <router-link to="/" class="text-decoration-none" style="height: 32px;">
            <img src="@/assets/favicon.png" alt="Icon" class="h-100">
          </router-link>
        </v-sheet>
        <v-list class="py-0">
          <v-tooltip v-for="item in items" :key="item.key" right open-delay="50">
            <template #activator="{ on, attrs }">
              <v-btn v-bind="attrs" depressed tile :to="item.to" color="transparent" class="w-100 min-w-0" style="height: 48px;" v-on="on">
                <v-icon>{{ item.icon }}</v-icon>
              </v-btn>
            </template>
            <span>{{ item.title }}</span>
          </v-tooltip>
        </v-list>
        <div class="d-flex justify-center mt-auto mb-2">
          <drawer-user-menu class="mt-auto mb-2"/>
        </div>
      </div>

      <div v-if="currentItem" class="drawer__content-right flex-grow-1" :class="$dark ? 'grey darken-4' : 'grey lighten-3'">
        <v-toolbar dense flat color="transparent">
          <v-toolbar-title>
            {{ currentItem.title }}
          </v-toolbar-title>
        </v-toolbar>
        <!-- <v-divider/> -->
        <v-list dense rounded nav>
          <v-list-item v-for="item in currentItem.children" :key="item.key" :to="item.to" exact>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
              <v-icon v-if="item.subIcon" x-small style="position: absolute; transform: translateY(-.1rem) translateX(1.4rem);">{{ item.subIcon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </v-navigation-drawer>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { viewModule } from '@/store';
import DrawerUserMenu from './DrawerUserMenu.vue';

interface DrawerItem {
  key: string;
  title: string;
  icon: string;
  subIcon?: string;
  to: string;
  children?: DrawerItem[];
}

@Component({
  components: {
    DrawerUserMenu,
  },
})
export default class Drawer extends Vue {
  // @Prop({ type: Array, required: true })
  // private items!: Record<string, unknown>[];

  private items: DrawerItem[] = [
    {
      key: 'music',
      title: 'Music',
      icon: 'music_note',
      to: '/music',
      children: [
        { key: 'home', title: 'ホーム', icon: 'home', to: '/music' },
        { key: 'song', title: '曲', icon: 'music_note', to: '/music/songs' },
        { key: 'artist', title: 'アーティスト', icon: 'mic', to: '/music/artists' },
        { key: 'playlist', title: 'プレイリスト', icon: 'queue_music', to: '/music/playlists' },
        { key: 'smartlist', title: 'スマートリスト', icon: 'queue_music', subIcon: 'auto_awesome', to: '/music/smartlists' },
      ],
    },
    {
      key: 'note',
      title: 'Note',
      icon: 'description',
      to: '/note',
    },
  ];

  get drawer() {
    return viewModule.drawer;
  }

  set drawer(show: boolean) {
    viewModule.SET_DRAWER(show);
  }

  // get fixDrawer() {
  //   return settingModule.fixDrawer;
  // }

  // set fixDrawer(val: boolean) {
  //   if (!val) {
  //     this.drawer = false;
  //   }
  //   settingModule.SET_FIX_DRAWER(val);
  // }

  get currentItem() {
    for (const item of this.items) {
      if (this.$route.path.startsWith(item.to) && item.children) {
        return item;
      }
    }
    return null;
  }

  protected mounted() {
    // this.$snackbar.info(`${window.outerHeight},  ${window.innerHeight}`);
  }
}
</script>
<style lang="scss">
.drawer--borderless > .v-navigation-drawer__border {
  display: none;
}
</style>
