<template>
  <b-list-group v-show="shown" class="context-menu shadow" :style="style" @mousedown.stop @click="destroy">
    <template v-for="item in items">
      <b-list-group-item v-if="item.action" :key="item.key" href="#" :class="itemClass" @click="item.action">
        {{ item.text }}
      </b-list-group-item>
      <b-list-group-item v-else-if="item.children" :key="item.key" href="#" class="p-0" :class="itemClass" @mouseover="showChildren(item)" @mouseleave="hideChildren(item)">
        <b-dropdown :ref="`dd-toggle-${item.key}`" dropright :text="item.text" variant="outline-light" toggle-class="menu-parent border-0">
          <b-dropdown-item v-for="ic in item.children" :key="ic.key" :class="itemClass" @click="ic.action">
            {{ ic.text }}
          </b-dropdown-item>
        </b-dropdown>
      </b-list-group-item>
    </template>
  </b-list-group>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Prop } from 'vue-property-decorator';
import { Dictionary } from 'lodash';
import { DialogMixin } from '@/utils';
import { ContextMenuItem } from '@/types';

@Component
export default class ContextMenu extends Mixins(DialogMixin) {
  @Prop({ type: [String, Array, Object], default: () => ({}) })
  private itemClass!: string | string[] | object;

  private shown = false;
  private items: ContextMenuItem[] = [];
  private style: Dictionary<string> = {
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

  public show(options: { items: ContextMenuItem[], position: { x: number, y: number } }) {
    this.shown = true;
    this.items = options.items;
    const { x, y } = options.position;
    this.$nextTick(() => {
      if (this.$el.clientWidth + x > window.innerWidth) {
        this.style.left = `${x - this.$el.clientWidth}px`;
      } else {
        this.style.left = `${x}px`;
      }
      if (this.$el.clientHeight + y > window.innerHeight) {
        this.style.top = `${y - this.$el.clientHeight}px`;
      } else {
        this.style.top = `${y}px`;
      }
    });
  }

  private showChildren(item: ContextMenuItem) {
    // @ts-ignore
    this.$refs[`dd-toggle-${item.key}`][0].show();
  }

  private hideChildren(item: ContextMenuItem) {
    // @ts-ignore
    this.$refs[`dd-toggle-${item.key}`][0].hide();
  }
}
</script>
<style lang="scss" scoped>
.context-menu {
  position: absolute;
  z-index: 1000;
}

</style>
<style lang="scss">
.dropdown-toggle.menu-parent {
  color: inherit !important;
  background-color: transparent !important;
  padding: 0.75rem 1.25rem !important;
}
</style>
