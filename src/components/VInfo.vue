<template>
  <div class="d-inline-block">
    <v-icon ref="info" name="info-circle"/>
    <b-tooltip :target="() => $refs.info" placement="bottom">
      <slot/>
    </b-tooltip>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class VInfo extends Vue {}
</script>
