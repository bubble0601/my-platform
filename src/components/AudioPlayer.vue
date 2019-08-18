<template>
  <div class="player">
    <audio ref="audio" :src="file" :loop="repeat === REPEAT.ONE" class="d-none"
           @loadeddata="onLoad" @timeupdate="onUpdate" @pause="playing = false" @ended="onEnd" @emptied="onEmpty"/>
    <div class="player-controls d-none d-sm-flex align-items-center">
      <div class="control-btn ml-4" @click="prev">
        <v-icon name="step-backward"/>
      </div>
      <div class="control-btn btn-play ml-3" @click="playing = !playing">
        <v-icon v-if="playing" name="pause"/>
        <v-icon v-else name="play"/>
      </div>
      <div class="control-btn ml-2 pl-1" @click="next">
        <v-icon name="step-forward"/>
      </div>
      <div class="player-progress ml-3">
        <vue-slider :value="progress" :max="max" lazy :marks="timeLabel" :tooltip-formatter="convertTime" :disabled="file === null" :labelStyle="labelStyle" @change="seek"/>
      </div>
      <div class="control-btn btn-repeat position-relative ml-3" :class="{ enabled: repeat !== REPEAT.NONE }" @click="repeat = (repeat + 1) % 3">
        <v-icon name="sync"/>
        <span v-show="repeat === REPEAT.ONE" class="repeat-one">1</span>
      </div>
      <div class="control-btn ml-3" :class="{ enabled: shuffle }" @click="shuffle = !shuffle">
        <v-icon name="random"/>
      </div>
      <div class="control-btn ml-3" @click="mute = !mute">
        <v-icon v-if="mute" name="volume-mute"/>
        <v-icon v-else-if="volume > 0" name="volume-up"/>
        <v-icon v-else name="volume-off"/>
      </div>
      <div class="volume-control ml-3 mr-4" style="width: 20vh;">
        <vue-slider v-model="volume" :disabled="mute"/>
      </div>
    </div>
    <div class="player-controls d-flex d-sm-none align-items-center position-relative">
      <div class="player-progress-mobile position-absolute px-3">
        <!-- <vue-slider v-model="progress" :height="3"/> -->
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator';
import { audioModule, musicModule } from '@/store';
import { Song } from '@/store/music';
import { REPEAT } from '@/store/audio';
import { convertTime } from '@/utils';

const PROGRESS_MAX = 300;

@Component
export default class AudioPlayer extends Vue {
  @Ref() private audio!: HTMLAudioElement;

  private canplay = false;
  private playing = false;
  private max = PROGRESS_MAX;
  private progress = 0; // 0 to PROGRESS_MAX
  private currentTime = 0;  // 0 to duration(second)
  private duration = 0; // (second)

  private REPEAT = REPEAT;
  // private repeat = REPEAT.NONE;
  // private shuffle = false;

  private mute = false;
  // private volume = 100;

  private convertTime = convertTime;

  private labelStyle = {
    'color': 'white',
    'margin-top': '.3rem',
  };

  get repeat() {
    return audioModule.repeat;
  }
  set repeat(val) {
    audioModule.SET_REPEAT(val);
  }

  get shuffle() {
    return audioModule.shuffle;
  }
  set shuffle(val) {
    audioModule.SET_SHUFFLE(val);
  }

  get volume() {
    return audioModule.volume;
  }
  set volume(val) {
    audioModule.SET_VOLUME(val);
  }

  get file() {
    return musicModule.filename;
  }

  get timeLabel() {
    return {
      [PROGRESS_MAX * 0.01]: convertTime(this.currentTime),
      [PROGRESS_MAX * 0.99]: convertTime(this.duration),
    };
  }

  @Watch('playing')
  private onPlayingChanged(val: boolean) {
    if (val) {
      if (this.canplay) this.audio.play();
      else this.playing = false;
    } else {
      this.audio.pause();
    }
  }

  @Watch('mute')
  private onMuteChanged = this.setVolume;

  @Watch('volume')
  private onVolumeChanged = this.setVolume;

  private onLoad() {
    if (this.audio.readyState >= this.audio.HAVE_CURRENT_DATA) {
      this.duration = Math.floor(this.audio.duration);
      this.progress = 0;
      this.canplay = true;
      this.playing = true;
    } else {
      this.canplay = false;
      this.playing = false;
    }
  }

  private onUpdate() {
    this.currentTime = Math.floor(this.audio.currentTime);
    this.progress = Math.floor(this.currentTime / this.duration * PROGRESS_MAX);
  }

  private onEnd() {
    this.next();
  }

  private onEmpty() {
    this.playing = false;
    this.canplay = false;
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
    // this.canplay = true;
  }

  private prev() {

  }

  private convertPosToTime(pos: number) {
    const time = this.duration * pos / PROGRESS_MAX;
    return convertTime(time);
  }
}
</script>
<style lang="scss" scoped>
.player {
  background-color: #567e;
  min-height: 4rem;
  height: 4rem;
  box-shadow: 0 -0.25rem .5rem rgba(0, 0, 0, 0.15);
}
.player-controls {
  height: 100%;
}
.control-btn {
  color: white;
  font-size: 1.3rem;
  &.btn-play {
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
  width: 100%;
  top: -8.5px;
}
</style>
