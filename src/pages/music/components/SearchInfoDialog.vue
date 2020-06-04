<template>
  <b-modal v-model="visible" title="Result" size="lg" scrollable :ok-disabled="!selected.length" body-class="py-0" @ok="ok" @hidden="onClosed">
    <b-table striped hover selectable select-mode="single" :items="searchResults" class="mb-0" @row-selected="selected = $event">
      <template #thead-top>
        <b-tr class="text-muted">
          <b-th class="font-weight-light">{{ edit.TIT2 }}</b-th>
          <b-th class="font-weight-light">{{ edit.TPE1 }}</b-th>
          <b-th class="font-weight-light">{{ edit.TALB }}</b-th>
          <b-th class="font-weight-light">{{ edit.TPE2 }}</b-th>
          <b-th class="font-weight-light">{{ edit.TDRC || edit.TYER }}</b-th>
          <b-th class="font-weight-light">{{ edit.TRCK }}</b-th>
          <b-th class="font-weight-light">{{ edit.TPOS }}</b-th>
        </b-tr>
      </template>
    </b-table>
    <template #modal-ok>
      Apply
    </template>
  </b-modal>
</template>
<script lang="ts">
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { Dictionary } from 'lodash';
import { DialogMixin } from '@/utils';

@Component
export default class SeaarchInfoDialog extends Mixins(DialogMixin) {
  @Prop({ type: Object, required: true })
  private edit!: Dictionary<string | null>;

  @Prop({ type: Array, required: true })
  private searchResults!: Array<Dictionary<string>>;

  private visible = false;
  private selected: Array<Dictionary<string>> = [];

  protected mounted() {
    this.visible = true;
  }

  public open() {
    // nop
  }

  private onClosed() {
    this.$destroy();
  }

  private ok() {
    this.$emit('apply', this.selected);
  }
}
</script>
