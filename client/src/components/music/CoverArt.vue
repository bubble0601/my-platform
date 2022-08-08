<template>
  <v-sheet elevation="4" class="d-inline-flex" :style="`width: ${computedSize}; height: ${computedSize};`">
    <v-img v-if="coverArtSrc" :src="coverArtSrc" alt="Cover art" :width="computedSize" :height="computedSize">
      <template #placeholder>
        <v-skeleton-loader type="image" boilerplate tile :width="computedSize" :height="computedSize" elevation="0"/>
      </template>
    </v-img>
    <v-skeleton-loader v-else type="image" boilerplate tile :width="computedSize" :height="computedSize" elevation="0"/>
  </v-sheet>
</template>
<script lang="ts">
import { musicModule } from '@/store';
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class CoverArt extends Vue {
  @Prop({ type: String, default: '' })
  private src!: string;

  @Prop({ type: String, default: '56px' })
  private size!: string;

  get computedSize() {
    if (this.size.endsWith('%')) {
      const r = parseInt(this.size);
      const rect = this.$el.getBoundingClientRect();
      const inline = window.getComputedStyle(this.$el).display.includes('inline');
      return `${(inline ? rect.height : rect.width) * r / 100}px`;
    } else if (/^[0-9]+$/.test(this.size)) {
      return `${this.size}px`;
    } else {
      return this.size;
    }
  }

  get coverArtSrc() {
    if (this.src) return this.src;
    const picture = musicModule.audioMetadata?.tags.cover_art;
    if (picture == null) return '';
    return `data:${picture.mime};base64,${picture.data}`;
  }
}
</script>
