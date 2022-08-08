<template>
  <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y bottom min-width="auto">
    <template #activator="{ on, attrs }">
      <v-text-field v-model="dateText" v-bind="mergeAttrs(attrs, defaultTextFieldProps, textFieldProps)" v-on="on"/>
    </template>

    <v-date-picker v-model="internalValue" v-bind="datePickerProps" :active-picker.sync="activePicker" :picker-date.sync="pickerDate" @input="menu = false">
      <template v-if="showToday">
        <v-btn text block color="primary" class="mx-auto" @click="goToday">Today</v-btn>
      </template>
    </v-date-picker>
  </v-menu>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

const TODAY = new Date().toISOString().substr(0, 10);

type DateValue = string | [string, string];

@Component
export default class DateInput extends Vue {
  @Prop({ type: [String, Array], default: '' })
  private value!: DateValue;

  @Prop({ type: Object, default: () => ({}) })
  private textFieldProps!: Record<string, unknown>;

  @Prop({ type: Boolean, default: false })
  private range!: boolean;

  @Prop({ type: Boolean, default: true })
  private showToday!: boolean;

  private internalValue: DateValue = '';
  private menu = false;

  private activePicker = '';
  private pickerDate = '';

  private defaultTextFieldProps = {
    dense: true,
    readonly: true,
    outlined: true,
  };

  get datePickerProps() {
    return {
      color: 'primary',
      dayFormat: (d: string) => Number(d.slice(-2)),
      showAdjacentMonths: true,
      noTitle: true,
      ...this.$attrs,
      range: this.range,
    };
  }

  get dateText() {
    if (this.internalValue instanceof Array) {
      return this.internalValue.join(' ~ ');
    } else {
      return this.internalValue;
    }
  }

  @Watch('menu')
  private onMenuToggled(val: boolean) {
    if (val) {
      if (this.internalValue instanceof Array) {
        this.pickerDate = this.internalValue[1];
      } else {
        this.pickerDate = this.internalValue;
      }
    }
  }

  @Watch('value')
  private onValueChanged(val: DateValue) {
    this.internalValue = val;
  }
  @Watch('internalValue')
  private onInternalValueChanged(val: DateValue) {
    this.$emit('input', val);
  }

  protected created() {
    if (this.value) {
      this.internalValue = this.value;
    } else {
      if (this.range) {
        this.internalValue = [TODAY, TODAY];
      } else {
        this.internalValue = TODAY;
      }
    }
  }

  private mergeAttrs(...attrsList: Record<string, unknown>[]) {
    let attrs: Record<string, unknown> = {};
    for (const e of attrsList) {
      attrs = Object.assign(attrs, e);
    }
    return attrs;
  }

  private goToday() {
    this.pickerDate = TODAY;
  }
}
</script>
