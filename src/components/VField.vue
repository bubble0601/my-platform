<template>
  <div class="form-group" :class="{ horizontal, 'mb-1': size === 'sm' }">
    <label v-if="label" :for="labelFor" :class="{ 'mb-0': size === 'sm' }">
      <span v-if="size === 'md'">{{ label }}</span>
      <small v-else-if="size === 'sm'">{{ label }}</small>
    </label>
    <slot/>
    <small v-if="help" class="form-text text-muted">{{ help }}</small>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { noop } from 'lodash';
import { waitUntil } from '@/utils';

@Component
export default class VField extends Vue {
  @Prop({ type: String, default: '' })
  private label!: string;

  @Prop({ type: String, default: '' })
  private help!: string;

  @Prop({ type: Boolean, default: false })
  private horizontal!: boolean;

  @Prop({ type: String, default: 'md' })
  private size!: string;

  private labelFor = '';

  private mounted() {
    // set labelFor
    if (this.$slots.default) {
      const inputTags = ['input', 'select', 'textarea'];
      const slotElm = this.$slots.default[0].elm as HTMLElement;
      if (inputTags.includes(slotElm.tagName.toLowerCase())) {
        waitUntil(() => slotElm.id !== '', 1000).then(() => {
          this.labelFor = slotElm.id;
        }, noop);
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.horizontal {
  label {
    display: inline-block;
    margin-right: .25rem;
  }
  input, select {
    display: inline-block;
    width: auto;
  }
}
</style>
