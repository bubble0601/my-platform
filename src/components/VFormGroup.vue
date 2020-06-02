<template>
  <b-form-group v-bind="attrs" v-on="$listeners">
    <slot/>
  </b-form-group>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { noop } from 'lodash';
import { waitUntil } from '@/utils';

@Component
export default class VField extends Vue {
  private labelFor = '';

  get attrs() {
    return {
      ...this.$attrs,
      labelFor: this.labelFor,
    };
  }

  private mounted() {
    // set labelFor
    if (this.$slots.default && this.$slots.default.length === 1) {
      const setLabelFor = (el: HTMLElement) => {
        const inputTags = ['input', 'select', 'textarea'];
        if (inputTags.includes(slotElm.tagName.toLowerCase())) {
          waitUntil(() => slotElm.id != null, 500).then(() => {
            this.labelFor = slotElm.id;
          }, noop);
        }
      };
      let slotElm = this.$slots.default[0].elm as HTMLElement;
      setLabelFor(slotElm);
      if (!this.labelFor) {
        slotElm = slotElm.children[0] as HTMLElement;
        if (slotElm) setLabelFor(slotElm);
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
