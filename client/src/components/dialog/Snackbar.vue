<template>
  <v-theme-provider :root="false">
    <v-snackbar v-model="show" v-bind="props" @click.stop>
      <span>{{ message }}</span>
      <template v-if="closable" #action="{ attrs }">
        <v-btn v-if="closeType === 'icon'" icon v-bind="attrs" @click="close">
          <v-icon>close</v-icon>
        </v-btn>
        <v-btn v-else text v-bind="attrs" @click="close">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-theme-provider>
</template>
<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import { DialogMixin, waitHideTransition } from '@/utils/DialogMixin';
import { SnackbarOptions, SnackbarProps } from '@/types';

@Component
export default class Snackbar extends Mixins(DialogMixin) {
  private show = false;
  private message = '';
  private props: SnackbarProps = {};
  private closable = true;
  private closeType: 'icon' | 'text' = 'icon';

  @Watch('show')
  private async onVisibilityChanged(newVal: boolean) {
    if (newVal === false) {
      await waitHideTransition(this.$el as HTMLElement);
      this.$destroy();
    }
  }

  public open(rawOptions: SnackbarOptions) {
    this.message = rawOptions.message || '';
    this.props = rawOptions.props || {};
    this.mergePropsWithDefault();
    this.closable = rawOptions.closable || this.closable;
    this.closeType = rawOptions.closeType || this.closeType;
    this.show = true;
  }

  private mergePropsWithDefault() {
    if (!this.props.top && !this.props.left && !this.props.right && !this.props.bottom) {
      this.props.right = true;
      this.props.bottom = true;
    }
  }

  public close() {
    this.show = false;
  }
}
</script>
