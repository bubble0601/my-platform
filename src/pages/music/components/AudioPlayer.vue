<template>
  <div class="player" :class="{ 'player-mobile': $mobile, expanded: $mobile && !reduced }">
    <audio ref="audio" :src="audioSrc" :loop="repeat === REPEAT.ONE" class="d-none"
           @loadeddata="onLoad" @timeupdate="onUpdate" @ended="onEnd" @pause="onPause"/>
    <div v-if="$pc" class="player-controls d-flex align-items-center">
      <div class="control-btn btn-skip ml-4" @click="prev">
        <b-icon icon="skip-start-fill"/>
      </div>
      <div class="control-btn btn-play" @click="playing = !playing">
        <b-icon v-if="playing" icon="pause-fill"/>
        <b-icon v-else icon="caret-right-fill"/>
      </div>
      <div class="control-btn btn-skip" @click="next">
        <b-icon icon="skip-end-fill"/>
      </div>
      <div class="player-progress ml-3">
        <vue-slider :value="progress" :max="max" lazy :marks="timeLabel" :tooltip-formatter="convertPosToTime" :disabled="audioSrc === null" :labelStyle="labelStyle" @change="seek"/>
      </div>
      <div class="control-btn btn-repeat position-relative ml-3" :class="{ enabled: repeat !== REPEAT.NONE }" @click="repeat = (repeat + 1) % 3">
        <b-icon icon="arrow-repeat"/>
        <span v-show="repeat === REPEAT.ONE" class="repeat-one">1</span>
      </div>
      <div class="control-btn ml-3" :class="{ enabled: shuffle }" @click="shuffle = !shuffle">
        <b-icon icon="shuffle"/>
      </div>
      <div class="control-btn ml-3" @click="mute = !mute">
        <b-icon v-if="mute" icon="volume-mute-fill"/>
        <b-icon v-else-if="volume > 30" icon="volume-up-fill"/>
        <b-icon v-else icon="volume-down-fill"/>
      </div>
      <div class="volume-control ml-3 mr-4" style="width: 20vh;">
        <vue-slider v-model="volume" :disabled="mute"/>
      </div>
    </div>
    <div v-else-if="reduced" class="player-controls d-flex align-items-center position-relative">
      <div v-if="song" class="text-light ml-2">
        <h5 class="mb-1">{{ song.title }}</h5>
        <small>
          <span>{{ song.artist.name }} / {{ song.album.title }}</span>
        </small>
      </div>
      <div class="control-btn btn-skip ml-auto" @click.stop="prev">
        <b-icon icon="skip-start-fill"/>
      </div>
      <div class="control-btn btn-play" @click.stop="playing = !playing">
        <b-icon v-if="playing" icon="pause-fill"/>
        <b-icon v-else icon="caret-right-fill"/>
      </div>
      <div class="control-btn btn-skip mr-2" @click.stop="next">
        <b-icon icon="skip-end-fill"/>
      </div>
    </div>
    <div v-else class="player-controls d-flex align-items-center justify-content-center position-relative">
      <div class="player-progress-mobile px-3">
        <vue-slider :value="progress" :max="max" lazy :marks="timeLabel" :tooltip-formatter="convertPosToTime" :disabled="audioSrc === null" :labelStyle="labelStyle" @change="seek"/>
      </div>
      <div class="control-btn ml-3 mr-auto" :class="{ enabled: shuffle }" @click="shuffle = !shuffle">
        <b-icon icon="shuffle"/>
      </div>
      <div class="control-btn btn-skip" @click="prev">
        <b-icon icon="skip-start-fill" font-scale="1.8"/>
      </div>
      <div class="control-btn btn-play" @click="playing = !playing">
        <b-icon v-if="playing" icon="pause-fill" font-scale="2.5"/>
        <b-icon v-else icon="caret-right-fill" font-scale="2.5"/>
      </div>
      <div class="control-btn btn-skip" @click="next">
        <b-icon icon="skip-end-fill" font-scale="1.8"/>
      </div>
      <div class="control-btn btn-repeat position-relative ml-auto mr-3" :class="{ enabled: repeat !== REPEAT.NONE }" @click="repeat = (repeat + 1) % 3">
        <b-icon icon="arrow-repeat"/>
        <span v-show="repeat === REPEAT.ONE" class="repeat-one">1</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Ref, Prop, Watch } from 'vue-property-decorator';
import { throttle } from 'lodash';
import { musicModule } from '@/store';
import { Song, REPEAT } from '@/store/music';
import { formatTime } from '@/utils';

const PROGRESS_MAX = 300;

@Component
export default class AudioPlayer extends Vue {
  @Ref() private audio!: HTMLAudioElement;

  @Prop({ type: Boolean, default: false })
  private reduced!: boolean;

  private REPEAT = REPEAT;

  private loading: boolean = false;
  private max = PROGRESS_MAX;
  private progress = 0; // 0 to PROGRESS_MAX
  private currentTime = 0;  // 0 to duration(second)
  private duration = 0; // (second)

  private formatTime = formatTime;

  private labelStyle = {
    'color': 'white',
    'margin-top': '.3rem',
    'font-size': '1rem',
  };

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
    musicModule.SET_VOLUME(val);
  }

  get audioSrc() {
    return musicModule.audioSrc;
  }

  get timeLabel() {
    return {
      [PROGRESS_MAX * 0.01]: formatTime(this.currentTime),
      [PROGRESS_MAX * 0.99]: formatTime(this.duration),
    };
  }

  get song() {
    return musicModule.current;
  }

  get prefetch() {
    return throttle(musicModule.Prefetch, 10);
  }

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
    if (e.target && e.target instanceof Element) {
      if (['input', 'select', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
    }
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
      if (this.playing) this.audio.play();
    }
  }

  private onUpdate() {
    if (this.duration <= 0) return;
    this.currentTime = Math.floor(this.audio.currentTime);
    this.progress = Math.floor(this.currentTime / this.duration * PROGRESS_MAX);
    if (this.duration - this.currentTime < 30) {
      this.prefetch();
    }
  }

  private onPause() {
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

  private convertPosToTime(pos: number) {
    const time = this.duration * pos / PROGRESS_MAX;
    return formatTime(Math.floor(time));
  }
}
</script>
<style lang="scss" scoped>
.player {
  background-color: #567e;
  min-height: 4rem;
  height: 4rem;
  box-shadow: 0 -0.25rem .5rem rgba(0, 0, 0, 0.15);

  &.player-mobile {
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 110;
  }
  &.expanded {
    min-height: 6rem;
    height: 6rem;
  }
}
.player-controls {
  height: 100%;
}
.control-btn {
  color: white;
  font-size: 1.5rem;
  &.btn-play {
    font-size: 2.5rem;
  }
  &.btn-skip {
    font-size: 1.8rem;
  }
  &.btn-repeat {
    .repeat-one {
      position: absolute;
      left: 1.35rem;
      top: .9rem;
      font-size: .7rem;
      user-select: none;
    }
  }
  &.enabled {
    color: #1393d4;
  }
}
.player-progress {
  flex-grow: 1;
}
.player-progress-mobile {
  position: absolute;
  width: 100%;
  top: -8.5px;
}
</style>
