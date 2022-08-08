<template>
  <div id="music-root">
    <!-- <v-navigation-drawer permanent>
      <v-list>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>ホーム</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer> -->

    <keep-alive :max="10">
      <router-view id="music-content"/>
    </keep-alive>
    <v-footer app :elevation="12" class="pa-0">
      <audio-player/>
    </v-footer>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { musicModule } from '@/store';
import { AudioPlayer } from '@/components/music';

@Component({
  metaInfo: {
    title: 'Music',
  },
  components: {
    AudioPlayer,
  },
  beforeRouteEnter(to, from, next) {
    next();
    if (musicModule.currentSong && !musicModule.currentAudio) musicModule.FetchAudioForPlay(musicModule.currentSong);
  },
})
export default class Music extends Vue {}
</script>
<style lang="scss" scoped>
#music-root {
  display: flex;
  // overflow: hidden;
  height: 100%;
}

#music-content {
  // overflow-y: auto;
  flex-grow: 1;
  max-width: 100%;
}

.overlay {
  position: absolute;
  width: 100%;
}
</style>
