<template>
  <b-form-input ref="input" v-bind="$attrs" v-on="$listeners"/>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    autofocus: {
      type: Boolean,
      default: false,
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
  },
});
</script>
