<template>
  <b-button v-b-tooltip="tooltip ? { title: tooltip, delay: { show: 1000, hide: 0 } } : tooltip"
                variant="link" class="icon-button" @click="$emit('click', $event)">
    <b-icon :icon="icon"/>
  </b-button>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class IconButton extends Vue {
  @Prop({ type: String, required: true })
  private icon!: string;

  @Prop({ default: null })
  private tooltip!: string | null;
}
</script>
<style lang="scss" scoped>
.icon-button {
  text-decoration: none!important;
}
</style>
