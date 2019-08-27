<template>
  <div class="d-flex flex-column" :style="{ height }">
    <div class="d-flex flex-grow-1 overflow-hidden">
      <div class="sidemenu-left">
        <div class="p-2">
          <b-button pill variant="success" size="sm" @click="addSong">＋ Add</b-button>
        </div>
        <router-link v-for="t in tabs" :key="t.key" :to="`/music/${t.key}`" tag="div" class="menu-item px-3" active-class="active">
          {{ t.name }}
        </router-link>
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
import { Vue, Component, Prop } from 'vue-property-decorator';
import { AddSongDialog, AudioPlayer, PlayerInfo } from '@/containers';

@Component({
  components: {
    AudioPlayer,
    PlayerInfo,
  },
})
export default class Music extends Vue {
  private height = 'auto';
  private tabs = [
    { key: 'all', name: 'All' },
    { key: 'fav', name: 'Favorite' },
  ];

  private mounted() {
    if (this.$el instanceof HTMLElement) {
      this.height = `calc(100vh - ${this.$el.offsetTop}px)`;
    }
  }

  private addSong() {
    // @ts-ignore
    new AddSongDialog().open();
  }
}
</script>
<style lang="scss" scoped>
.sidemenu-left {
  border-right: 2px solid #dee2e6;
  .menu-item {
    display: block;
    color: #6c757d;
    cursor: pointer;
    &:hover {
      color: #595e63;
    }
    &.active {
      color: #494d50;
      background-color: #9999;
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
