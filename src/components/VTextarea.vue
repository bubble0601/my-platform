<template>
  <b-form-textarea ref="input" v-bind="attrs" :style="textareaStyle" v-on="listeners"/>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { calcTextareaHeight } from '@/utils';
import { Dict } from '@/types';

@Component
export default class VTextarea extends Vue {
  public focus!: () => void;
  public blur!: () => void;
  public select!: () => void;

  @Prop({ default: false })
  private autofocus!: boolean;

  @Prop({ default: true })
  private autosize!: boolean;

  @Prop({ default: '' })
  private value!: string;

  @Prop({ default: 3 })
  private rows!: number;

  @Prop({ default: 0 })
  private maxRows!: number;

  @Ref() private input!: HTMLInputElement;

  private textareaStyle = {};

  get attrs() {
    return {
      rows: 3,
      noResize: true,
      value: this.value,
      ...this.$attrs,
    };
  }

  get listeners() {
    return {
      ...this.$listeners,
      keydown(e: Event) {
        e.stopPropagation();
      },
    };
  }

  @Watch('value')
  private onValueChanged() {
    if (this.autosize) this.$nextTick(this.resizeTextarea);
  }

  private mounted() {
    this.focus = this.input.focus;
    this.blur = this.input.blur;
    this.select = this.input.select;
    if (this.autofocus) {
      this.focus();
    }
    if (this.autosize) {
      this.resizeTextarea();
    }
  }
  private resizeTextarea() {
    const minRows = this.rows;
    const maxRows = this.maxRows || null;
    this.textareaStyle = calcTextareaHeight(this.$el as HTMLTextAreaElement, minRows, maxRows);
  }
}
</script>
