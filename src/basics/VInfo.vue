<template>
  <div class="d-inline-block">
    <v-icon ref="info" name="info-circle"/>
    <b-tooltip :target="() => $refs.info" placement="bottom">
      <slot/>
    </b-tooltip>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({});
</script>
