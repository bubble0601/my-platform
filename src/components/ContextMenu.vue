<template>
  <b-list-group v-show="shown" class="context-menu shadow" :style="style" @mousedown.stop @click="destroy">
    <template v-for="item in items">
      <b-list-group-item v-if="item.action" :key="item.key" href="#" :class="itemClass" @click="item.action">
        {{ item.text }}
      </b-list-group-item>
      <b-list-group-item v-else-if="item.children" :key="item.key" href="#" class="p-0" :class="itemClass" @mouseover="showChildren(item)" @mouseleave="hideChildren(item)">
        <b-dropdown :ref="`dd-toggle-${item.key}`" :dropright="childDir === 'right'" :dropleft="childDir === 'left'"
                    :text="item.text" variant="outline-light" toggle-class="menu-parent border-0" menu-class="rounded py-0">
          <b-dropdown-item v-for="ic in item.children" :key="ic.key" :link-class="linkClass" @click="ic.action">
            {{ ic.text }}
          </b-dropdown-item>
        </b-dropdown>
      </b-list-group-item>
    </template>
  </b-list-group>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Dictionary, isArray } from 'lodash';
import { DialogMixin } from '@/utils';
import { ContextMenuItem } from '@/types';

@Component
export default class ContextMenu extends Mixins(DialogMixin) {
  @Prop({ type: [String, Array, Object], default: () => ({}) })
  private itemClass!: string | string[] | object;

  private shown = false;
  private items: ContextMenuItem[] = [];
  private childDir: string = 'right';
  private style: Dictionary<string> = {
    left: '0',
    top: '0',
  };

  get linkClass() {
    if (typeof this.itemClass === 'string') {
      return `${this.itemClass} child-link`;
    } else if (isArray(this.itemClass)) {
      return this.itemClass.concat(['child-link']);
    }
    return {
      ...this.itemClass,
      'child-link': true,
    };
  }

  protected created() {
    window.addEventListener('mousedown', this.destroy);
  }

  protected beforeDestroy() {
    window.removeEventListener('mousedown', this.destroy);
  }

  private destroy() {
    this.$destroy();
  }

  public show(options: { items: ContextMenuItem[], position: { x: number, y: number }, childDir?: string }) {
    this.shown = true;
    this.items = options.items;
    const { x, y } = options.position;
    const { childDir = 'right' } = options;
    this.childDir = childDir;
    this.$nextTick(() => {
      if (this.$el.clientWidth + x > window.innerWidth) {
        this.style.left = `${x - this.$el.clientWidth}px`;
      } else {
        this.style.left = `${x}px`;
      }
      if (this.$el.clientHeight + y > window.innerHeight && y - this.$el.clientHeight > 0) {
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
.dropdown-toggle {
  &.menu-parent {
    color: inherit !important;
    background-color: transparent !important;
    padding: 0.75rem 1.25rem !important;
  }
  &::after {
    margin-left: .75rem !important;
  }
}

.context-menu .child-link {
  padding-top: .75rem;
  padding-bottom: .75rem;
}
</style>
