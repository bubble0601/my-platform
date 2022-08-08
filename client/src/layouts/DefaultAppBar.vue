<template>
  <v-app-bar v-bind="$attrs" app dense>
    <slot name="prepend"/>
    <v-spacer/>
    <slot name="append"/>
  </v-app-bar>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class DefaultAppBar extends Vue {

}
</script>
