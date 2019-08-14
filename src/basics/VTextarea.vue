<template>
  <b-form-textarea ref="input" v-bind="attrs" :style="textareaStyle" v-on="listeners"/>
</template>
<script lang="ts">
import Vue from 'vue';
import { calcTextareaHeight } from '@/utils';

export default Vue.extend({
  props: {
    autofocus: {
      type: Boolean,
      default: false,
    },
    autosize: {
      type: [Boolean, Object],
      default: true,
    },
    value: {
      type: String,
      default: null,
    },
    // disable auto height function of b-form-textarea
    rows: {
      type: [Number, String],
      default: 3,
    },
    maxRows: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      textareaStyle: {},
    };
  },
  computed: {
    attrs(): object {
      return {
        rows: 3,
        noResize: true,
        value: this.value,
        ...this.$attrs,
      };
    },
    listeners(): object {
      return {
        ...this.$listeners,
        keydown(e: Event) {
          e.stopPropagation();
        },
      };
    },
  },
  watch: {
    value() {
      if (this.autosize) this.$nextTick(this.resizeTextarea);
    },
  },
  mounted() {
    ['focus', 'blur', 'select'].forEach((method) => {
      // @ts-ignore
      this[method] = this.$refs.input[method];
    });
    if (this.autofocus) {
      // @ts-ignore
      this.focus();
    }
    if (this.autosize) {
      this.resizeTextarea();
    }
  },
  methods: {
    resizeTextarea() {
      const minRows = this.autosize.minRows || this.rows;
      const maxRows = this.autosize.maxRows || this.maxRows || null;
      this.textareaStyle = calcTextareaHeight(this.$el as HTMLTextAreaElement, minRows, maxRows);
    },
  },
});
</script>
