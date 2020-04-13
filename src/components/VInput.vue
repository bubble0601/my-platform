<template>
  <b-form-input ref="input" v-bind="$attrs" v-on="$listeners"/>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref } from 'vue-property-decorator';
import { BFormInput } from 'bootstrap-vue';

@Component
export default class VInput extends Vue {
  public focus!: () => void;
  public blur!: () => void;
  public select!: () => void;

  @Prop({ type: Boolean, default: false })
  private autofocus!: boolean;

  @Ref() private input!: BFormInput;

  private mounted() {
    this.focus = this.input.focus;
    this.blur = this.input.blur;
    this.select = this.input.select;
    if (this.autofocus) {
      this.focus();
    }
  }
}
</script>
