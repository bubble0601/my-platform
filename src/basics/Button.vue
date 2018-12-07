<template>
  <button class="button" :type="type" v-on="$listeners">
    <slot/>
  </button>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    type: {
      type: String,
      default: 'is-primary',
      validator(v: string) {
        return ['is-primary', 'is-danger'].includes(v);
      },
    },
  },
  // computed: {
  //   listeners(): object {
  //     return this.$listeners;
  //   },
  // },
});
</script>
