<template>
  <span class="icon" :class="size ? size : ''">
    <i class="fas" :class="classes"/>
  </span>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

type Size = 'sm' | 'lg' | 'xl';

@Component
export default class VIcon extends Vue {
  @Prop({ required: true })
  private name!: string;

  @Prop({ default: null })
  private size!: Size | null;

  get classes() {
    const classes: string[] = [];
    classes.push(`fa-${this.name}`);
    if (this.size) {
      if (this.size === 'lg') classes.push('fa-lg');
      else if (this.size === 'xl') classes.push('fa-2x');
    }
    return classes;
  }
}
</script>
<style lang="scss" scoped>
.icon {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
  &.sm {
    height: 1rem;
    width: 1rem;
  }
  &.lg {
    height: 2rem;
    width: 2rem;
  }
  &.xl {
    height: 3rem;
    width: 3rem;
  }
}
</style>
