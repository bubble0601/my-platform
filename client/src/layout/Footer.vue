<template>
  <footer>
    <div v-show="footer">
      <keep-alive>
        <!-- TODO: use optional chaining in Vue3 -->
        <component ref="footerComponent" :is="(footer || {}).component" v-bind="props" v-on="listeners"/>
      </keep-alive>
    </div>
    <div v-if="$pc && !fixed" class="foot-menu pc d-flex justify-content-end text-light px-2">
      <div v-for="f in footers" :key="f.name" class="foot-menu-item px-2 py-1" :class="{ active: f.name === (footer || {}).name }" @click="toggleFooter(f)">
        <span>{{ f.name }}</span>
        <b-icon icon="x" font-scale="1.2" class="text-light font-weight-bold cursor-pointer ml-1" @click="deleteFooter(f)"/>
        <!-- <b-button-close class="text-light ml-2" @click="deleteFooter(f)"/> -->
      </div>
    </div>
    <div v-if="$mobile" v-show="!footer && footers.length" class="foot-menu mobile justify-content-end tetx-light px-2">
      <div v-for="f in footers" :key="f.name" class="foot-menu-item p-2" @click="setFooter(f)">
        <span>{{ f.name }}</span>
        <b-button-close class="text-light ml-2" @click="deleteFooter(f)"/>
      </div>
    </div>
  </footer>
</template>
<script lang="ts">
import { Vue, Mixins, Component, Ref, Watch } from 'vue-property-decorator';
import { each } from 'lodash';
import { viewModule } from '@/store';
import { Footer as FooterComponent } from '@/store/view';
import { SizeMixin } from '@/utils';

@Component
export default class Footer extends Mixins(SizeMixin) {
  get footer() {
    return viewModule.footer;
  }

  get footers() {
    return viewModule.footers;
  }

  get fixed() {
    return viewModule.footerFixed;
  }

  get props() {
    return {
      ...this.$attrs,
      ...(this.footer?.props || []),
    };
  }

  get listeners() {
    return {
      ...this.$listeners,
      ...(this.footer?.listeners || []),
      hide: () => {
        viewModule.SET_FOOTER(null);
      },
    };
  }

  get nativeListeners() {
    return this.footer?.nativeListeners || {};
  }

  @Ref() private footerComponent?: Vue;

  @Watch('footer')
  private onFooterChanged() {
    this.$nextTick(() => {
      if (this.footerComponent) {
        each(this.nativeListeners, (handler, type) => {
          this.footerComponent!.$el.addEventListener(type, handler);
        });
      }
    });
    this.$nextTick(this.calcHeight);
  }

  @Watch('props')
  private onFooterPropsChanged() {
    this.$nextTick(this.calcHeight);
  }

  @Watch('fixed')
  private onFixedChanged() {
    this.$nextTick(this.calcHeight);
  }

  protected created() {
    this.addSizingCallback(this.calcHeight);
  }

  private calcHeight() {
    viewModule.SET_FOOTER_HEIGHT(this.$el.clientHeight);
  }

  private setFooter(footer: FooterComponent) {
    viewModule.SET_FOOTER(footer);
  }

  private toggleFooter(footer: FooterComponent) {
    if (footer.name === this.footer?.name) {
      viewModule.SET_FOOTER(null);
    } else {
      viewModule.SET_FOOTER(footer);
    }
  }

  private deleteFooter(footer: FooterComponent) {
    viewModule.REMOVE_FOOTER(footer);
  }
}
</script>
<style lang="scss" scoped>
footer {
  position: fixed;
  bottom: 0;
  z-index: 110;
  width: 100%;
  box-shadow: 0 -0.25rem .5rem rgba(0, 0, 0, 0.15);

  @include theme('light') {
    background-color: var(--light);
  }
  @include theme('dark') {
    background-color: var(--dark);
  }

  .foot-menu {
    user-select: none;
    cursor: default;

    .foot-menu-item {
      display: flex;
      align-items: center;
      &:hover, &.active {
        background-color: #555;
      }
    }

    &.pc {
      background-color: #3c3f41d0;
    }

    &.mobile {
      display: flex;
    }
  }
}
</style>
