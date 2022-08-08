<template>
  <v-list v-if="true" dense class="sortable-list" :class="{ dragging: !!targetItem }">
    <v-list-item
      v-for="(item, i) in items"
      :key="item.key"
      class="sortable-item pl-0"
      :class="{ dragging: item === targetItem }"
      :style="{
        height: `${itemHeight}px`,
        transform: `translateY(${item.y}px)`,
      }"
    >
      <div class="grab px-4" @mousedown="onDragStart($event, i, item)" @touchstart="onDragStart($event, i, item)">
        <slot name="grab">
          <v-icon color="secondary">reorder</v-icon>
        </slot>
      </div>
      <slot name="item" :index="i" :item="item.value"/>
    </v-list-item>
  </v-list>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { clamp } from 'lodash';

interface Item {
  key: number;
  y: number;
  minY: number;
  maxY: number;
  value:  unknown;
}

@Component
export default class SortableList extends Vue {
  // @VModel({ type: Array }) givenItems!: unknown[];
  @Prop({ type: Array, required: true })
  private value!: unknown[];

  @Prop({ type: Number, default: 40 })
  private itemHeight!: number;

  private items: Item[] = [];
  private internalItems: Item[] = [];

  private targetIndex = -1;
  private targetItem: Item | null = null;

  private raf = 0;
  private originY = 0;
  private pointerY = 0;
  private scrollAmount = 0;
  private scrollerElement: Element | null = null;
  private scrollerHeight = 0;

  get scrollerRect() {
    return this.scrollerElement?.getBoundingClientRect();
  }

  @Watch('value', { immediate: true })
  private onValueChanged(newVal: unknown[]) {
    const l = newVal.length;
    this.items = newVal.map((item, i) => {
      return {
        key: i,
        y: 0,
        minY: - i * this.itemHeight,
        maxY: (l - i - 1) * this.itemHeight,
        value: item,
      };
    });
    this.internalItems = [...this.items];
    this.onRelease();
  }

  private onDragStart(e: MouseEvent | TouchEvent, i: number, item: Item) {
    e.preventDefault();

    if (this.targetItem) return;

    this.targetItem = item;
    this.targetIndex = i;

    let element: Element | null = this.$el;
    while (element) {
      if (element.scrollHeight > element.clientHeight) {
        this.scrollerElement = element;
        this.scrollerHeight = element.scrollHeight - element.clientHeight;
      }
      element = element.parentElement;
    }

    const scrollTop = this.scrollerElement?.scrollTop || 0;
    this.originY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    this.originY += scrollTop;

    this.addMoveListeners();
    this.addReleaseListeners();

    this.onDragMove(e);

    this.raf = requestAnimationFrame(this.onAnimationFrame);
  }

  private addMoveListeners() {
    document.addEventListener('mousemove', this.onDragMove, { passive: true });
    document.addEventListener('touchmove', this.onDragMove, { passive: true });
  }

  private removeMoveListeners() {
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('touchmove', this.onDragMove);
  }

  private addReleaseListeners() {
    ['mouseup', 'touchend', 'touchcancel'].forEach((t) => {
      document.addEventListener(t, this.onRelease, { passive: true });
    });
  }

  private removeReleaseListeners() {
    ['mouseup', 'touchend', 'touchcancel'].forEach((t) => {
      document.removeEventListener(t, this.onRelease);
    });
  }

  private onAnimationFrame() {
    const el = this.scrollerElement;

    if (this.targetItem) {
      const y = this.pointerY - this.originY + (el?.scrollTop || 0);
      this.targetItem.y = clamp(y, this.targetItem.minY, this.targetItem.maxY);
      this.reorder();
    }

    const top = this.scrollerRect?.top;
    const btm = this.scrollerRect?.bottom;
    if (top && this.pointerY - top < this.itemHeight) {
      this.scrollAmount = - (this.itemHeight - (this.pointerY - top)) / 10;
    } else if (btm && btm - this.pointerY < this.itemHeight) {
      this.scrollAmount = (this.itemHeight - (btm - this.pointerY)) / 10;
    } else {
      this.scrollAmount = 0;
    }

    if (el) {
      const isTop = el.scrollTop <= 0;
      const isBottom = el.scrollTop >= this.scrollerHeight;
      if (!(this.scrollAmount > 0 && isBottom) && !(this.scrollAmount < 0 && isTop)) {
        el.scrollBy({
          top: this.scrollAmount,
          left: 0,
        });
      }
    }
    this.raf = requestAnimationFrame(this.onAnimationFrame);
  }

  private reorder() {
    if (!this.targetItem) return;

    const rect = this.$el.getBoundingClientRect();
    const pointerInnerY = this.pointerY - rect.top;
    const pointerIndex = Math.floor(pointerInnerY / this.itemHeight);
    if (pointerIndex < 0 || pointerIndex >= this.items.length) return;
    if (this.targetIndex === pointerIndex) return;

    if (this.targetIndex > pointerIndex) { // upward
      for (let i = this.targetIndex; i > pointerIndex; i--) {
        if (this.internalItems[i - 1]) {
          this.internalItems[i] = this.internalItems[i - 1];
          this.internalItems[i].y += this.itemHeight;
        }
      }
    } else { // downward
      for (let i = this.targetIndex; i < pointerIndex; i++) {
        if (this.internalItems[i + 1]) {
          this.internalItems[i] = this.internalItems[i + 1];
          this.internalItems[i].y -= this.itemHeight;
        }
      }
    }
    this.internalItems[pointerIndex] = this.targetItem;
    this.targetIndex = pointerIndex;
  }

  private onDragMove(e: MouseEvent | TouchEvent) {
    if (!this.targetItem) return;

    this.pointerY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  }

  private onRelease(e?: Event) {
    if (!this.targetItem) return;

    this.removeMoveListeners();
    this.removeReleaseListeners();

    this.targetItem = null;
    this.targetIndex = -1;
    this.scrollAmount = 0;
    cancelAnimationFrame(this.raf);

    if (e) {
      if (e.type === 'touchcancel') this.onValueChanged(this.value);
      else this.$emit('input', this.internalItems.map((item) => item.value));
    }
  }
}
</script>
<style lang="scss" scoped>
.sortable-list {
  padding-top: 0;
  padding-bottom: 0;
  user-select: none;

  .sortable-item {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    z-index: 1;

    &.dragging {
      background-color: #80808040;
      opacity: 0.8;
      z-index: 2;
      transition: none !important;
    }

    .grab {
      display: flex;
      height: 100%;
      align-items: center;
      cursor: grab;
    }
    &.dragging .grab {
      cursor: grabbing;
    }
  }
  &.dragging .sortable-item {
    transition: transform .25s;
  }
}
</style>
