<template>
  <b-list-group v-show="shown" class="context-menu shadow" :style="style" @mousedown.stop @click="destroy">
    <b-list-group-item v-for="item in items" :key="item.text" href="#" @click="item.action">
      {{ item.text }}
    </b-list-group-item>
  </b-list-group>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Prop } from 'vue-property-decorator';
import { DialogMixin } from '@/utils';
import { Dict } from '@/types';

export interface MenuItem {
  text: string;
  action: () => void;
}

@Component
export default class ContextMenu extends Mixins(DialogMixin) {
  private shown = false;
  private items: MenuItem[] = [];
  private style: Dict<string> = {
    left: '0',
    top: '0',
  };

  protected created() {
    window.addEventListener('mousedown', this.destroy);
  }

  protected beforeDestroy() {
    window.removeEventListener('mousedown', this.destroy);
  }

  private destroy() {
    this.$destroy();
  }

  public show(options: { items: MenuItem[], event: MouseEvent }) {
    this.shown = true;
    this.items = options.items;
    const e = options.event;
    this.$nextTick(() => {
      if (this.$el.clientWidth + e.clientX > window.innerWidth) {
        this.style.left = `${e.clientX - this.$el.clientWidth}px`;
      } else {
        this.style.left = `${e.clientX}px`;
      }
      this.style.top = `${e.clientY}px`;
    });
  }
}
</script>
<style lang="scss" scoped>
.context-menu {
  position: absolute;
}
</style>
