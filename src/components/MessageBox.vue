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
      <v-input ref="input" v-model="value" :requried="required" :state="state" :placeholder="placeholder"/>
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
import Vue from 'vue';
import { DialogMixin } from '@/utils';

interface DataType {
  show: boolean;
  result: boolean | null;
  resolve: ((value?: any) => void) | null;
  reject: ((reason?: any) => void) | null;
  type: string | null;
  title: string | null;
  variant: string | null;
  message: string | null;
  value: string | null;
  state: boolean | null;
  label: string | null;
  required: boolean;
  placeholder: string | null;
}

export default Vue.extend({
  mixins: [DialogMixin],
  data(): DataType {
    return {
      show: false,
      result: null,
      resolve: null,
      reject: null,

      type: null,
      title: null,
      variant: null,
      message: null,

      value: null,
      state: null,
      label: null,
      required: true,
      placeholder: null,
    };
  },
  watch: {
    value(newVal) {
      if (newVal && this.state === false) this.state = true;
      else if (!newVal && this.state === true) this.state = false;
    },
  },
  methods: {
    open(options: { [key: string]: any }) {
      this.type = options.type === 'prompt' ? 'prompt' : 'confirm';
      this.title = options.title || (this.type === 'confirm' ? '確認' : '入力');
      this.variant = options.variant || (this.type === 'confirm' ? 'danger' : 'primary');
      this.message = options.message;
      this.value = options.value;
      this.label = options.label;
      this.placeholder = options.placeholder;
      this.required = options.required !== false;
      this.$nextTick(() => {
        // @ts-ignore
        this.$refs.modal.show();
      });
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    onOK() {
      if (this.type === 'confirm') {
        this.result = true;
        // @ts-ignore
        this.$refs.modal.hide();
      } else if (this.type === 'prompt') {
        if (this.required && !this.value) {
          this.state = false;
        } else {
          this.result = true;
          // @ts-ignore
          this.$refs.modal.hide();
        }
      }
    },
    onCancel() {
      // @ts-ignore
      this.$refs.modal.hide();
    },
    settle() {
      if (this.result) {
        if (this.type === 'confirm') this.resolve!();
        else this.resolve!(this.value);
      } else {
        this.reject!();
      }
      this.$destroy();
    },
  },
});
</script>
