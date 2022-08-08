<template>
  <v-dialog ref="dialog" v-model="show" v-bind="dialogProps">
    <v-card>
      <v-card-title v-if="title">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="inputValue" autocomplete="off"/>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn v-bind="cancelBtnProps" @click="settle(false)">
          {{ cancelBtnText }}
        </v-btn>
        <v-btn v-bind="okBtnProps" @click="settle(inputValue)">
          {{ okBtnText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Ref, Watch } from 'vue-property-decorator';
import { PromptOptions, BtnProps, DialogProps } from '@/types';
import { DialogMixin, waitHideTransition } from '@/utils/DialogMixin';

@Component
export default class Prompt extends Mixins(DialogMixin) {
  private show = false;
  private inputValue = '';
  private title = '';
  private message = '';
  private dialogProps: DialogProps = {
    width: 500,
  };
  private okBtnText = 'OK';
  private okBtnProps: BtnProps = {};
  private cancelBtnText = 'Cancel';
  private cancelBtnProps: BtnProps = {};
  private resolve: ((value?: unknown) => void) | null = null;
  private reject: ((reason?: unknown) => void) | null = null;

  @Ref() private dialog!: Vue;

  @Watch('show')
  private async onVisibilityChanged(newVal: boolean) {
    if (newVal === false) {
      const target = this.dialog.$refs.content as HTMLElement;
      await waitHideTransition(target);
      this.$destroy();
    }
  }

  public open(options: PromptOptions) {
    this.title = options.title || this.title;
    this.message = options.message || this.message;
    this.inputValue = options.value || this.inputValue;
    this.dialogProps = options.dialogProps || this.dialogProps;
    this.okBtnText = options.okBtnText || this.okBtnText;
    this.okBtnProps = options.okBtnProps || this.okBtnProps;
    this.cancelBtnText = options.cancelBtnText || this.cancelBtnText;
    this.cancelBtnProps = options.cancelBtnProps || this.cancelBtnProps;
    this.show = true;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private settle(result: false | string) {
    if (result === false) {
      if (this.reject) this.reject();
    } else {
      if (this.resolve) this.resolve(this.inputValue);
    }
    this.close();
  }

  private close() {
    this.show = false;
  }
}
</script>
