<template>
  <div class="wrapper" :style="`bottom: ${bottom}rem;`">
    <circle-button id="fab-main" variant="success" class="shadow" @click="onClick">
      <b-icon :icon="mainIcon"/>
    </circle-button>
    <b-popover v-if="pop" target="fab-main" :show="showPop" placement="left">
      <div v-html="pop"/>
    </b-popover>
    <b-tooltip v-if="tip" target="fab-main" :show="showPop" placement="left">
      <div class="small text-nowrap text-left" v-html="tip"/>
    </b-tooltip>
    <template  v-for="(button, i) in buttons">
      <transition name="slide" @after-enter="showPop = true" @before-leave="showPop = false">
        <div v-if="isActive" :key="button.icon" class="fab-sub position-absolute" :style="`bottom: ${3.2 + 2.5 * i + (i + 1) * 0.5}rem;`">
          <circle-button :id="`fab-${button.icon}`" variant="success" size="sm"
                          class="sub-floating-button shadow" @click="button.onClick() === false && (isActive = false)">
            <b-icon :icon="button.icon"/>
          </circle-button>
          <b-popover :target="`fab-${button.icon}`" :show="showPop" placement="left">
            {{ button.text }}
          </b-popover>
        </div>
      </transition>
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { isString } from 'lodash';
import { env } from '@/utils';
import { CircleButton } from '@/components';

@Component({
  components: {
    CircleButton,
  },
})
export default class FloatingButton extends Vue {
  @Prop({ type: [String, Function], required: true })
  private icon!: string | ((isActive: boolean) => string);

  @Prop({ type: String, default: null })
  private pop!: string | null;

  @Prop({ type: String, default: null })
  private tip!: string | null;

  @Prop({ type: Array, default: null })
  private buttons!: string[] | null;

  @Prop({ type: Number, default: 0 })
  private offset!: number;

  @Prop({ type: Boolean, default: false })
  private noHide!: boolean;

  private isActive = false;
  private showPop = false;
  private btm = 1;
  private rem: number | undefined;

  get bottom() {
    return this.offset + (this.noHide ? 1 : this.btm);
  }
  set bottom(val) {
    this.btm = val;
  }
  get mainIcon() {
    if (isString(this.icon)) return this.icon;
    return this.icon(this.isActive);
  }

  protected mounted() {
    this.rem = env.rem();
    window.addEventListener('scroll', this.onScroll);
  }

  protected destroyed() {
    window.removeEventListener('scroll', this.onScroll);
  }

  private onClick() {
    if (this.buttons) this.isActive = !this.isActive;
    else this.$emit('click');
  }

  private onScroll() {
    if (this.rem) {
      this.bottom = (this.rem - window.scrollY) / this.rem;
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  position: fixed;
  right: 1rem;
  z-index: 100;
}
.fab-sub {
  width: 3.2rem;
  text-align: center;
  z-index: -1;
}
.slide-enter, .slide-leave-to {
  bottom: 1rem !important;
  opacity: 0;
}
.slide-enter-active, .slide-leave-active {
  transition: all .3s;
}
</style>
