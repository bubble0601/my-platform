<template>
  <b-form v-bind="attrs" v-on="$listeners" @submit.prevent>
    <slot/>
  </b-form>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      validated: false,
    };
  },
  computed: {
    attrs(): object {
      const attrs = {
        novalidate: true,
        validated: false,
        ...this.$attrs,
      };
      if (this.validated) attrs.validated = true;
      return attrs;
    },
  },
  methods: {
    validate() {
      if (this.checkValidity()) return true;
      this.validated = true;
      return false;
    },
    checkValidity(): boolean {
      return (this.$el as HTMLFormElement).checkValidity();
    },
    reset() {
      this.validated = false;
    },
  },
});
</script>
