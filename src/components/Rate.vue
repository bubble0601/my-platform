<template>
  <div class="d-flex rate" @click.stop>
    <b-icon v-for="i in 5" :key="i"
            :icon="(i <= value || i <= hover) ? 'star-fill' : 'star'"
            :font-scale="size" :class="{ enabled: i <= value, hovered: i <= hover }"
            @click="setRate(i)" @mouseenter="hover = i" @mouseleave="hover = -1"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';

@Component
export default class Rate extends Vue {
  @Prop({ type: Number, default: 0 })
  private value!: number;

  @Prop({ type: Number, default: 1 })
  private size!: number;

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
  color: lightslategray;
  .enabled {
    color: #efc20f;
  }
  .hovered:not(.enabled) {
    color: #efc20faa;
  }
  .icon {
    cursor: pointer;
  }
}
</style>
