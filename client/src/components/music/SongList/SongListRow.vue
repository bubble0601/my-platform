<template>
  <v-row v-if="$pc" dense align="center" class="song-list__row" :class="{ selected: isSelected }" @click="onClick" @contextmenu.prevent="$emit('contextmenu', song, $event.clientX, $event.clientY)">
    <v-col class="colr-2 text-center">
      <v-btn v-if="!selecting" key="play" icon plain small class="show-on-row-hover" @click.stop="$emit('play', song)">
        <v-icon>play_arrow</v-icon>
      </v-btn>
      <v-btn v-else-if="isSelected" key="selectd" icon x-small @click.stop="select(false)">
        <v-icon>check_circle</v-icon>
      </v-btn>
      <v-btn v-else key="unselectd" icon x-small color="grey" @click.stop="select(true)">
        <v-icon>radio_button_unchecked</v-icon>
      </v-btn>
    </v-col>
    <v-col class="colr-12">{{ song.title }}</v-col>
    <v-col class="colr-12">{{ song.artist.name }}</v-col>
    <v-col class="colr-12">{{ song.album.title }}</v-col>
    <v-col class="colr-4">
      <v-rating :value="song.rating" clearable size="1rem" dense hover @input="updateRating(song.id, $event)" @click.native.stop/>
    </v-col>
    <v-col class="colr-3">{{ formatTime(song.time) }}</v-col>
    <v-col class="colr-3">{{ song.year }}</v-col>
    <v-col class="colr-3">{{ song.played_count }}</v-col>
    <v-col class="colr-2 text-center">
      <v-btn small icon plain class="show-on-row-hover" @click.stop="showContextMenu">
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-col>
  </v-row>

  <v-row v-else dense align="center" v-ripple class="song-list__mobile-row" :class="{ selected: isSelected }" @click="onClick" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @contextmenu.prevent>
    <v-col v-if="selecting" cols="1" class="text-center">
      <v-btn icon x-small :color="isSelected ? '' : 'grey'" v-on.native="stopRipple" @click.stop="select(!isSelected)">
        <v-icon>{{ isSelected ? 'check_circle' : 'radio_button_unchecked' }}</v-icon>
      </v-btn>
    </v-col>
    <v-col v-else cols="1"/>
    <v-col>
      <div>{{ song.title }}</div>
      <div class="text-subtitle-2 text--secondary">{{ song.artist.name }}</div>
    </v-col>
    <v-col cols="2" class="text-center">
      <v-btn small icon :color="`blue-grey ${$dark ? 'lighten-3' : 'darken-2'}`" v-on.native="stopRipple" @click.stop="showContextMenu">
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { Song } from '@/api/music';
import { musicModule } from '@/store';
import { LongTapMixin, formatTime, stopRipple } from '@/utils';

@Component
export default class SongListRow extends Mixins(LongTapMixin) {
  @Prop({ type: Object, required: true })
  private song!: Song;

  @Prop({ type: Boolean, default: false })
  private selecting!: boolean;

  @Prop({ type: Boolean, default: false })
  private isSelected!: boolean;

  private formatTime = formatTime;
  private stopRipple = stopRipple;

  protected created() {
    this.longTapHandlers.push(this.onLongTap);
  }

  private select(selected: boolean) {
    this.$emit('select', selected);
  }

  private async updateRating(id: number, val: number) {
    await musicModule.UpdateSong({ id, data: { rating: val } });
    await musicModule.ReloadSong(id);
  }

  // private async updateWeight(id: number, val: number) {
  //   if (val < 0) return;
  //   await musicModule.UpdatePlaylistSong({ id, data: { weight: val } });
  //   await musicModule.ReloadSong(id);
  // }

  private onClick() {
    // if (this.selecting) {
    //   this.select(!this.isSelected);
    // }
    this.$emit('click');
  }

  private onLongTap() {
    this.select(!this.isSelected);
  }

  private showContextMenu(e: PointerEvent) {
    if (e.target instanceof HTMLElement) {
      const t = e.target;
      const rect = t.getBoundingClientRect();
      this.$emit('contextmenu', this.song, rect.left + t.clientWidth, rect.top + t.clientHeight);
    } else {
      this.$emit('contextmenu', this.song, e.clientX, e.clientY);
    }
  }
}
</script>
<style lang="scss" scoped>
$width-action: 5%;
$width-title: 20%;

.song-list__row {
  margin: 0;
  border-bottom: 1px solid #80808020;

  .v-rating {
    display: flex;
    align-items: center;
  }

  &:hover {
    background-color: #80808020;
  }
  &.selected {
    background-color: #80808040;

    &:hover {
      background-color: #80808060;
    }
  }

  .show-on-row-hover {
    visibility: hidden;
  }

  &:hover .show-on-row-hover {
    visibility: visible;
  }

  .play-btn {
    visibility: hidden;

  }
  &:hover .play-btn {
    visibility: visible;
  }

  .more-btn {
    visibility: hidden;
    // cursor: pointer;
    // opacity: 0.4;

    // &:hover {
    //   opacity: 0.9;
    // }
  }
  &:hover .more-btn {
    visibility: visible;
  }
}

.song-list__mobile-row {
  margin: 0;

  &.selected {
    background-color: #80808040;
  }
}
</style>
