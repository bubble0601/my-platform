<template>
  <b-form-input v-bind="attrs" v-on="$listeners"/>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  model: {
    prop: 'value',
    event: 'update',
  },
})
export default class VInput extends Vue {
  public focus!: () => void;
  public blur!: () => void;
  public select!: () => void;

  get attrs() {
    return {
      autocomplete: 'off',
      ...this.$attrs,
    };
  }
}
</script>
