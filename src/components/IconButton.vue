<template>
  <b-button v-if="type === 'link'" v-b-tooltip="tooltip ? { title: tooltip, delay: { show: 1000, hide: 0 } } : tooltip"
                variant="link" class="link-button" @click="$emit('click', $event)">
    <b-icon v-bind="attrs"/>
  </b-button>
  <div v-else-if="type === 'square'" class="square-button" @click="$emit('click')">
    <b-icon v-bind="attrs" font-scale="1.5"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class IconButton extends Vue {
  @Prop({ type: String, required: true })
  private icon!: string;

  @Prop({ type: String, default: 'link' })
  private type!: string;

  @Prop({ default: null })
  private tooltip!: string | null;

  get attrs() {
    return {
      ...this.$attrs,
      icon: this.icon,
    };
  }
}
</script>
<style lang="scss" scoped>
.link-button {
  text-decoration: none!important;
}
.square-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  height: 100%;

  &:hover, &:active {
    background-color: #22252944;
  }
}
</style>
