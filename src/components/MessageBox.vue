<template>
  <b-modal ref="modal" v-if="type === 'confirm'" :title="title" @hidden="settle" @keydown.enter.native="onOK">
    <span>{{ message }}</span>
    <template #modal-footer>
      <div class="d-flex justify-content-end">
        <b-button variant="outline-secondary" class="mr-1" @click="onCancel">キャンセル</b-button>
        <b-button :variant="variant" @click="onOK">OK</b-button>
      </div>
    </template>
  </b-modal>
  <b-modal ref="modal" v-else :title="title" @shown="$refs.input.focus(); $refs.input.select()" @hidden="settle" @keydown.shift.enter.native="onOK">
    <p v-if="message">{{ message }}</p>
    <v-field :label="label" feedback="入力が必要です">
      <v-input ref="input" v-model="inputValue" :requried="required" :state="inputState" :placeholder="placeholder"/>
    </v-field>
    <template #modal-footer>
      <div class="d-flex justify-content-end">
        <b-button variant="outline-secondary" class="mr-1" @click="onCancel">キャンセル</b-button>
        <b-button :variant="variant" @click="onOK">OK</b-button>
      </div>
    </template>
  </b-modal>
</template>
<script lang="ts">
import { mixins } from 'vue-class-component';
import { Vue, Component, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { DialogMixin } from '@/utils';
import { Variant, MsgBoxOptions } from '@/types';

@Component
export default class extends mixins(DialogMixin) {
  private show = false;
  private result = false;
  private resolve: ((value?: any) => void) | null = null;
  private reject: ((reason?: any) => void) | null = null;
  private type: 'confirm' | 'prompt' = 'confirm';
  private title = '';
  private variant: Variant = '';
  private message = '';
  private inputLabel = '';
  private inputValue = '';
  private inputState: boolean | null = null;  // true: valid, false: invalid
  private required = false;
  private placeholder = '';

  @Ref() private modal!: BModal;

  @Watch('inputValue')
  private onValueChanged(val: string) {
    if (val && this.inputState === false) this.inputState = true;
    else if (!val && this.inputState === true) this.inputState = false;
  }

  public open(options: MsgBoxOptions) {
    this.type = options.type === 'prompt' ? 'prompt' : 'confirm';
    this.title = options.title || (this.type === 'confirm' ? '確認' : '入力');
    this.variant = options.variant || (this.type === 'confirm' ? 'danger' : 'primary');
    this.message = options.message || '';
    this.inputValue = options.inputValue || '';
    this.inputLabel = options.inputLabel || '';
    this.placeholder = options.placeholder || '';
    this.required = options.required !== false;
    this.$nextTick(() => {
      this.modal.show();
    });
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private onOK() {
    if (this.type === 'confirm') {
      this.result = true;
      this.modal.hide();
    } else if (this.type === 'prompt') {
      if (this.required && !this.inputValue) {
        this.inputState = false;
      } else {
        this.result = true;
        this.modal.hide();
      }
    }
  }

  private onCancel() {
    this.modal.hide();
  }

  private settle() {
    if (this.result) {
      if (this.type === 'confirm') this.resolve!();
      else this.resolve!(this.inputValue);
    } else {
      this.reject!();
    }
    this.$destroy();
  }
}
</script>
