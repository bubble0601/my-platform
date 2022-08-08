<template>
  <div class="w-100">
    <audio
      ref="audio"
      :src="audioSrc"
      :loop="repeat === REPEAT.ONE"
      class="d-none"
      @loadeddata="onLoad"
      @timeupdate="onUpdate"
      @ended="onEnd"
      @pause="onPause"
    />

    <!-- pc -->
    <div v-if="$pc" class="player px-2">
      <div class="song-info">
        <cover-art/>
        <div v-if="song" class="d-flex flex-column justify-center ml-2">
          <div>{{ song.title }}</div>
          <div class="text-subtitle-2 text--secondary">
            {{ song.artist.name  }}
          </div>
        </div>
      </div>

      <v-btn icon @click="prev">
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn :loading="loading" x-large icon @click="playing = !playing">
        <v-icon x-large>{{ playing ? 'pause_circle' : 'play_circle' }}</v-icon>
      </v-btn>
      <v-btn icon @click="next">
        <v-icon>skip_next</v-icon>
      </v-btn>

      <v-slider :disabled="audioSrc === null" :value="progress" :max="max" thumb-label thumb-size="20" hide-details class="px-2" @change="seek">
        <template #prepend>
          <span class="text-subtitle-2 text--secondary">
            {{ formatTime(currentTime) }}
          </span>
        </template>
        <template #thumb-label="{ value }">
          {{ convertPosToTime(value) }}
        </template>
        <template #append>
          <span class="text-subtitle-2 text--secondary">
            {{ formatTime(duration) }}
          </span>
        </template>
      </v-slider>

      <v-btn icon :class="shuffle ? 'primary--text' : 'text--disabled'" @click="shuffle = !shuffle">
        <v-icon>shuffle</v-icon>
      </v-btn>
      <v-btn icon :class="repeat !== REPEAT.NONE ? 'primary--text' : 'text--disabled'" @click="repeat = (repeat + 1) % 3">
        <v-icon>{{ repeat === REPEAT.ONE ? 'repeat_one' : 'repeat' }}</v-icon>
      </v-btn>
      <v-menu :disabled="mute" top offset-y open-on-hover :close-on-content-click="false">
        <v-sheet class="d-flex flex-column align-center">
          <v-slider v-model="volume" :disabled="mute" vertical hide-details/>
          <div class="text-caption text--secondary secondary--text">
            {{ volume }}
          </div>
        </v-sheet>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" icon v-on="on" @click="mute = !mute">
            <v-icon v-if="mute" color="secondary">volume_mute</v-icon>
            <v-icon v-else color="primary">volume_up</v-icon>
          </v-btn>
        </template>
      </v-menu>
      <v-btn v-if="$route.name === 'music-queue'" key="queue-active" icon color="primary" @click="$router.go(-1)">
        <v-icon>queue_music</v-icon>
      </v-btn>
      <v-btn v-else key="queue" icon :to="{ name: 'music-queue' }">
        <v-icon>queue_music</v-icon>
      </v-btn>
      <v-btn v-if="$route.name === 'music-info'" key="info-active" icon color="primary" @click="$router.go(-1)">
        <v-icon>info</v-icon>
      </v-btn>
      <v-btn v-else key="info" icon :to="{ name: 'music-info' }">
        <v-icon>info</v-icon>
      </v-btn>
    </div>

    <!-- mobile -->
    <div v-else v-ripple class="player px-2" @click="openPlayer">
      <v-progress-linear :value="progress100" absolute top/>

      <div class="song-info">
        <cover-art/>
        <div v-if="song" class="d-flex flex-column justify-center ml-2">
          <div>{{ song.title }}</div>
          <div class="text-subtitle-2 text--secondary">
            {{ song.artist.name  }}
          </div>
        </div>
      </div>

      <v-spacer/>

      <v-btn icon @click.stop="prev">
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn :loading="loading" x-large icon @click.stop="playing = !playing">
        <v-icon x-large>{{ playing ? 'pause_circle' : 'play_circle' }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="next">
        <v-icon>skip_next</v-icon>
      </v-btn>
    </div>

    <v-dialog v-if="$mobile" v-model="mobilePlayerOpened" fullscreen transition="dialog-bottom-transition">
      <v-card class="d-flex flex-column h-100">
        <v-toolbar flat color="transparent" class="flex-grow-0" v-touch="{ down: () => mobilePlayerOpened = false }">
          <v-btn icon @click="mobilePlayerOpened = false">
            <v-icon>keyboard_arrow_down</v-icon>
          </v-btn>
          <v-btn icon @click="mobileShowLyrics" class="ml-auto">
            <v-icon>chat</v-icon>
          </v-btn>
          <v-btn icon @click="mobileShowQueue">
            <v-icon>queue_music</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>more_vert</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="d-flex justify-center">
          <cover-art size="300px"/>
        </div>
        <template v-if="song">
          <div class="text-center mt-2">
            <v-rating :value="song.rating" clearable size="2rem" dense hover @input="updateRating($event)"/>
          </div>
          <div class="text-center">
            <span class="text-h5">{{ song.title }}</span>
          </div>
          <div class="text-center">
            <small>
              <span>{{ song.artist.name }} / {{ song.album.title }}</span>
              <span v-if="song.year">({{ song.year }})</span>
            </small>
          </div>
        </template>
        <template v-else>
          <div class="text-center mt-2">
            <v-rating :value="0" readonly background-color="grey"/>
          </div>
          <div class="mt-2">
            <span class="text-h5">&nbsp;</span>
          </div>
          <div>
            <small>&nbsp;</small>
          </div>
        </template>

        <div class="flex-grow-1 d-flex flex-column justify-space-evenly">
          <v-slider :disabled="audioSrc === null" :value="progress" :max="max" thumb-label thumb-size="20" hide-details class="flex-grow-0 px-1" @change="seek">
            <template #prepend>
              <span class="text-subtitle-2 text--secondary">
                {{ formatTime(currentTime) }}
              </span>
            </template>
            <template #thumb-label="{ value }">
              {{ convertPosToTime(value) }}
            </template>
            <template #append>
              <span class="text-subtitle-2 text--secondary">
                {{ formatTime(duration) }}
              </span>
            </template>
          </v-slider>

          <div class="d-flex align-center justify-space-between">
            <v-btn icon large class="ml-2" :class="shuffle ? 'primary--text' : 'text--disabled'" @click="shuffle = !shuffle">
              <v-icon large>shuffle</v-icon>
            </v-btn>
            <v-btn icon width="60" height="60" @click="prev">
              <v-icon size="60">skip_previous</v-icon>
            </v-btn>
            <v-btn :loading="loading" icon x-large width="120" height="120" @click="playing = !playing">
              <v-icon size="120">{{ playing ? 'pause_circle' : 'play_circle' }}</v-icon>
            </v-btn>
            <v-btn icon width="60" height="60" @click="next">
              <v-icon size="60">skip_next</v-icon>
            </v-btn>
            <v-btn icon large class="mr-2" :class="repeat !== REPEAT.NONE ? 'primary--text' : 'text--disabled'" @click="repeat = (repeat + 1) % 3">
              <v-icon>{{ repeat === REPEAT.ONE ? 'repeat_one' : 'repeat' }}</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
      <!-- <v-bottom-navigation absolute grow height="36">
        <v-btn text plain>キュー</v-btn>
        <v-btn text plain>歌詞</v-btn>
      </v-bottom-navigation> -->
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Ref, Prop, Watch } from 'vue-property-decorator';
import { throttle } from 'lodash';
import { musicModule } from '@/store';
import { REPEAT } from '@/store/music';
import CoverArt from './CoverArt.vue';
import { formatTime, stopRipple } from '@/utils';

const PROGRESS_MAX = 300;

@Component({
  components: {
    CoverArt,
  },
})
export default class AudioPlayer extends Vue {
  @Prop({ type: Boolean, default: false })
  private reduced!: boolean;

  private REPEAT = REPEAT;

  private loading = false;

  private max = PROGRESS_MAX;
  private progress = 0;     // 0 to PROGRESS_MAX
  private progress100 = 0;  // 0 to 100
  private currentTime = 0;  // 0 to duration(second)
  private duration = 0; // (second)
  private checkPoints: boolean[] = [];

  private formatTime = formatTime;
  private stopRipple = stopRipple;

  private mobilePlayerOpened = false;

  get playing() {
    return musicModule.playing;
  }
  set playing(val: boolean) {
    musicModule.SET_PLAYING(val);
  }

  get repeat() {
    return musicModule.repeat;
  }
  set repeat(val) {
    musicModule.SetControl({ repeat: val });
  }

  get shuffle() {
    return musicModule.shuffle;
  }
  set shuffle(val) {
    musicModule.SetControl({ shuffle: val });
  }

  get mute() {
    return musicModule.mute;
  }
  set mute(val) {
    musicModule.SET_MUTE(val);
  }

  get volume() {
    return musicModule.volume;
  }
  set volume(val) {
    if (val < 0) musicModule.SET_VOLUME(0);
    else if (val > 100) musicModule.SET_VOLUME(100);
    else musicModule.SET_VOLUME(val);
  }

  get audioSrc() {
    return musicModule.audioSrc;
  }
  // get metadata() {
  //   return musicModule.audioMetadata;
  // }

  get timeLabel() {
    return {
      [PROGRESS_MAX * 0.01]: formatTime(this.currentTime),
      [PROGRESS_MAX * 0.99]: formatTime(this.duration),
    };
  }

  get song() {
    return musicModule.current;
  }

  // get lyrics() {
  //   return this.metadata?.tags.lyrics;
  // }

  get prefetch() {
    return throttle(musicModule.Prefetch, 10);
  }

  @Ref() private audio!: HTMLAudioElement;

  @Watch('mute')
  private onMuteChanged = this.setVolume;

  @Watch('volume')
  private onVolumeChanged = this.setVolume;

  @Watch('playing')
  private onPlayingChanged(val: boolean) {
    if (val) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  @Watch('song')
  private onSongChanged() {
    if (this.song && musicModule.notifySong && Notification.permission === 'granted') {
      new Notification(`♪「${this.song.title}」 by ${this.song.artist.name}`);
    }
  }

  private mounted() {
    document.addEventListener('keydown', this.setKeyEvents);
    this.setVolume();
  }

  private activated() {
    document.addEventListener('keydown', this.setKeyEvents);
  }

  private deactivated() {
    document.removeEventListener('keydown', this.setKeyEvents);
  }

  private beforeDestroy() {
    document.removeEventListener('keydown', this.setKeyEvents);
  }

  private setKeyEvents(e: KeyboardEvent) {
    // console.log(document.activeElement);
    // if (e.target && e.target instanceof Element) {
    //   if (['input', 'select', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
    // }
    if (document.activeElement !== document.body) return;
    switch (e.key) {
      case ' ':
        this.playing = !this.playing;
        break;
      case 'ArrowLeft':
        this.audio.currentTime -= 5;
        break;
      case 'ArrowRight':
        this.audio.currentTime += 5;
        break;
    }
  }

  private onLoad() {
    if (this.audio.readyState >= this.audio.HAVE_CURRENT_DATA) {
      this.duration = Math.floor(this.audio.duration);
      this.progress = 0;
      this.progress100 = 0;
      this.checkPoints = [];
      if (this.playing) this.audio.play();
    }
  }

  private onUpdate() {
    if (this.duration <= 0) return;
    if (this.audio.duration > this.duration) {
      this.duration = Math.floor(this.audio.duration);
    }
    this.currentTime = Math.floor(this.audio.currentTime);
    const ratio = this.audio.currentTime / this.audio.duration;
    this.progress = Math.floor(ratio * PROGRESS_MAX);
    this.progress100 = Math.floor(ratio * 100);

    // const point = Math.floor(ratio * 4);
    this.checkPoints[Math.floor(ratio * 4)] = true;
    if (this.checkPoints[3] && this.checkPoints[0] && this.checkPoints[1] && this.checkPoints[2] && this.song) {
      const id = this.song.id;
      musicModule.IncrementPlayedCount(id).then(() => {
        musicModule.ReloadSong(id);
      });
      this.checkPoints = [];
    }

    if (this.duration - this.currentTime < 30) {
      this.prefetch();
    }
  }

  private onPause(e: Event) {
    // deactivateされたときのpauseイベントはwindowからではなくthis.$elから引き起こされる
    // @ts-ignore
    const path = e.path || e.composedPath();
    if (path.length === 2) {
      this.audio.play();
      return;
    }
    if (!this.loading) this.playing = false;
  }

  private onEnd() {
    this.next();
  }

  private seek(pos: number) {
    if (this.progress === pos) return;
    this.audio.currentTime = this.duration * pos / PROGRESS_MAX;
    this.progress = pos;
  }

  private setVolume() {
    this.audio.volume = this.mute ? 0 : this.volume / 100;
  }

  private next() {
    this.loading = true;
    this.audio.pause();
    musicModule.PlayNext()?.then(() => {
      musicModule.SET_PLAYING(true);
      this.audio.play();
      this.loading = false;
    });
  }

  private prev() {
    this.loading = true;
    if (this.playing) this.audio.pause();
    musicModule.PlayPrev()?.then(() => {
      if (this.playing) this.audio.play();
      this.loading = false;
    });
  }

  private mShowMenu() {
    // const el = this.$el as HTMLElement;
    // const menuitems: ContextMenuItem[] = [];
    // menuitems.push({
    //   key: 'add',
    //   text: this.$t('add') as string,
    //   children: [
    //     {
    //       key: 'song',
    //       text: this.$t('music.song') as string,
    //       action: () => {
    //         this.$router.push('/music/song/new');
    //       },
    //     },
    //     {
    //       key: 'temp',
    //       text: this.$t('music.temporaryPlaylist') as string,
    //       action: () => {
    //         this.$router.push('/music/temp');
    //       },
    //     },
    //   ],
    // });
    // if (!viewModule.footerFixed) {
    //   menuitems.push({
    //     key: 'hide',
    //     text: this.$t('hide') as string,
    //     action: () => {
    //       this.$emit('hide');
    //     },
    //   });
    // }
    // menuitems.push({
    //   key: 'settings',
    //   text: this.$t('settings') as string,
    //   action: () => {
    //     this.$router.push('/music/settings');
    //   },
    // });
    // new ContextMenu({
    //   propsData: {
    //     itemClass: 'bg-secondary text-light',
    //   },
    // }).show({
    //   items: menuitems,
    //   position: {
    //     x: el.clientWidth,
    //     y: window.innerHeight - el.clientHeight,
    //   },
    //   childDir: 'left',
    // });
  }

  private convertPosToTime(pos: number) {
    const time = this.duration * pos / PROGRESS_MAX;
    return formatTime(Math.floor(time));
  }

  private openPlayer() {
    if (this.$pc) return;
    if (!this.song) return;
    this.mobilePlayerOpened = true;
  }

  private mobileShowQueue() {
    this.mobilePlayerOpened = false;
    if (this.$route.name !== 'music-queue') {
      this.$router.push({ name: 'music-queue' });
    }
  }

  private mobileShowLyrics() {
    this.mobilePlayerOpened = false;
    if (this.$route.path !== 'music-lyrics') {
      this.$router.push({ name: 'music-lyrics' });
    }
  }

  private async updateRating(val: number) {
    if (this.song == null) return;
    const id = this.song.id;
    await musicModule.UpdateSong({ id, data: { rating: val } });
    await musicModule.ReloadSong(id);
  }
}
</script>
<style lang="scss" scoped>
.player {
  display: flex;
  align-items: center;
  height: 70px;
  position: relative;

  .song-info {
    display: flex;
    height: 100%;
    width: 210px;
    align-items: center;
    user-select: none;
  }
}
</style>
