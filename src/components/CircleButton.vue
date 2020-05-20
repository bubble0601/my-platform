<template>
  <b-button :variant="variant" class="circle-button rounded-circle" :class="`circle-button-${size}`" v-on="$listeners">
    <slot/>
  </b-button>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class CircleButton extends Vue {
  @Prop({ type: String, default: 'primary' })
  private variant!: string;

  @Prop({ type: String, default: 'md' })
  private size!: string;
}
</script>
<style lang="scss" scoped>
.circle-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 3.2rem;
  height: 3.2rem;
  &-sm {
    width: 2.4rem;
    height: 2.4rem;
  }
}
</style>
