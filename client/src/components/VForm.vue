<template>
  <b-form v-bind="attrs" v-on="$listeners" @submit.prevent>
    <slot/>
  </b-form>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class VForm extends Vue {
  private validated = false;

  get attrs() {
    const attrs = {
      novalidate: true,
      validated: false,
      ...this.$attrs,
    };
    if (this.validated) attrs.validated = true;
    return attrs;
  }

  public validate() {
    if (this.checkValidity()) return true;
    this.validated = true;
    return false;
  }

  public checkValidity(): boolean {
    return (this.$el as HTMLFormElement).checkValidity();
  }

  public reset() {
    this.validated = false;
  }
}
</script>
