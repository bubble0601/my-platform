<template>
  <div class="d-flex rate" @click.stop>
    <v-icon v-for="i in 5" :key="i" name="star" :class="{ enabled: i <= value, hovered: i <= hover }"
            @click.native="setRate(i)" @mouseenter.native="hover = i" @mouseleave.native="hover = -1"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';

@Component
export default class Rate extends Vue {
  @Prop({ default: 0 })
  private value!: number;

  private hover: number = -1;

  @Emit('input')
  private setRate(i: number) {
    if (this.value === i) return 0;
    return i;
  }
}
</script>
<style lang="scss" scoped>
.rate {
  color: lightgray;
  .enabled {
    color: yellow;
  }
  .hovered:not(.enabled) {
    color: lightyellow;
  }
  .icon {
    cursor: pointer;
  }
}
</style>
