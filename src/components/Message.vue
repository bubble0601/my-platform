<template>
  <div class="wrapper mt-3">
    <transition name="slide" appear @after-leave="onClosed">
      <b-alert v-if="opened" class="message shadow-sm mx-auto" :class="{ 'alert-dismissible': dismissible }" :variant="variant" show>
        <h4 v-if="title" class="alert-heading">{{ title }}</h4>
        <span>{{ message }}</span>
        <b-button-close v-if="dismissible" class="close" @click="close"/>
      </b-alert>
    </transition>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch, Ref } from 'vue-property-decorator';
import { DialogMixin } from '@/utils';
import { Variant, MsgOptions } from '@/types';

@Component
export default class Message extends Mixins(DialogMixin) {
  private opened = false;
  private container = null;
  private title = '';
  private message = '';
  private variant: Variant = '';
  private dismissible = false;

  public open(rawOptions: MsgOptions) {
    const defaultOptions = {
      duration: 5000,
      dismissible: false,
    };
    const options: MsgOptions = {
      ...defaultOptions,
      ...rawOptions,
    };
    this.title = options.title || '';
    this.message = options.message || '';
    this.variant = options.variant || '';
    this.dismissible = options.dismissible === true;
    setTimeout(this.close, options.duration);
    this.opened = true;
  }

  public close() {
    this.opened = false;
  }

  private onClosed() {
    this.$destroy();
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 1500;
  pointer-events: none;
}
.message {
  width: 380px;
  max-width: 95%;
  opacity: .95;
}
.close {
  pointer-events: auto;
}

.slide-enter, .slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
.slide-enter-active, .slide-leave-active {
  transition: all .5s;
}
</style>
