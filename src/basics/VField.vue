<template>
  <div class="form-group" :class="{ horizontal }">
    <label v-if="label" :for="labelFor">{{ label }}</label>
    <slot/>
    <small v-if="help" class="form-text text-muted">{{ help }}</small>
    <div v-if="validFeedback" class="valid-feedback">{{ validFeedback }}</div>
    <div v-if="invalidFeedback" class="invalid-feedback">{{ invalidFeedback }}</div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { noop } from 'lodash';
import { waitUntil } from '@/utils';

@Component
export default class extends Vue {
  @Prop({ default: '' })
  private label!: string;

  @Prop({ default: '' })
  private help!: string;

  @Prop({ default: null })
  private feedback!: string | { valid: string, invalid: string } | null;

  @Prop({ default: false })
  private horizontal!: boolean;

  private labelFor = '';

  get validFeedback() {
    if (this.feedback && 'string' !== typeof this.feedback) {
      return this.feedback.valid;
    }
    return null;
  }

  get invalidFeedback() {
    if (this.feedback) {
      if ('string' === typeof this.feedback) {
        return this.feedback;
      } else {
        return this.feedback.invalid;
      }
    }
    return null;
  }

  private mounted() {
    // set labelFor
    if (this.$slots.default && this.$slots.default.length === 1) {
      const inputTags = ['input', 'select', 'textarea'];
      const slotElm = this.$slots.default[0].elm as HTMLElement;
      if (inputTags.includes(slotElm.tagName.toLowerCase())) {
        waitUntil(() => slotElm.id != null, 500).then(() => {
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
