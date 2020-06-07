<template>
  <b-modal ref="modal" v-if="type === 'confirm'" :title="title" :scrollable="scrollable" @hidden="settle" @keydown.enter.native="onOK">
    <pre v-if="pre">{{ message }}</pre>
    <span v-else>{{ message }}</span>
    <template #modal-footer>
      <div class="d-flex justify-content-end">
        <b-button variant="outline-secondary" class="mr-1" @click="onCancel">{{ cancelText }}</b-button>
        <b-button :variant="variant" @click="onOK">{{ okText }}</b-button>
      </div>
    </template>
  </b-modal>
  <b-modal ref="modal" v-else :title="title" @shown="$refs.input.focus(); $refs.input.select()" @hidden="settle">
    <p v-if="message">{{ message }}</p>
    <v-field :label="inputLabel" feedback="入力が必要です">
      <v-input ref="input" v-model="inputValue" :requried="required" :state="inputState" :placeholder="placeholder" @keydown.shift.enter.native="onOK"/>
    </v-field>
    <template #modal-footer>
      <div class="d-flex justify-content-end">
        <b-button variant="outline-secondary" class="mr-1" @click="onCancel">{{ cancelText }}</b-button>
        <b-button :variant="variant" @click="onOK">{{ okText }}</b-button>
      </div>
    </template>
  </b-modal>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { DialogMixin } from '@/utils';
import { Variant, MsgBoxOptions } from '@/types';

@Component
export default class MessageBox extends Mixins(DialogMixin) {
  private show = false;
  private result = false;
  private resolve: ((value?: any) => void) | null = null;
  private reject: ((reason?: any) => void) | null = null;
  private type: 'confirm' | 'prompt' = 'confirm';
  private title = '';
  private variant: Variant = '';
  private scrollable: boolean = false;
  private message = '';
  private pre = false;
  private inputLabel = '';
  private inputValue = '';
  private inputState: boolean | null = null;  // true: valid, false: invalid
  private required = false;
  private placeholder = '';
  private okText = 'OK';
  private cancelText = 'キャンセル';

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
    this.scrollable = options.scrollable || false;
    this.message = options.message || '';
    this.pre = options.pre !== false;
    this.inputValue = options.inputValue || '';
    this.inputLabel = options.inputLabel || '';
    this.placeholder = options.placeholder || '';
    this.required = options.required !== false;
    this.okText = options.okText || 'OK';
    this.cancelText = options.cancelText || 'キャンセル';
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
