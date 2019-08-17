<template>
  <div class="d-inline-block">
    <v-icon ref="help" name="question-circle"/>
    <b-tooltip :target="() => $refs.help" placement="bottom">
      <slot/>
    </b-tooltip>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {}
</script>
