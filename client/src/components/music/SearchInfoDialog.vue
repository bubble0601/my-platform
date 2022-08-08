<template>
  <v-dialog v-model="visible" scrollable :overlay-opacity="0.7">
    <v-card outlined>
      <v-card-title>検索結果</v-card-title>
      <v-divider/>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        item-key="_key"
        :items-per-page="-1"
        single-select
        :mobile-breakpoint="0"
        hide-default-footer
        class="search-results"
        @click:row="onClickRow"
      />
      <v-divider/>
      <v-card-actions>
        <v-btn color="secondary" outlined class="ml-auto" @click="visible = false">キャンセル</v-btn>
        <v-btn :disabled="!selected.length" color="primary" class="ml-2" @click="apply">適用</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator';
import { DataTableItemProps } from 'vuetify';
import { DialogMixin } from '@/utils';

@Component
export default class SearchInfoDialog extends Mixins(DialogMixin) {
  @Prop({ type: Array, required: true })
  private searchResults!: Array<Record<string, string>>;

  private visible = false;
  private selected: Array<Record<string, string>> = [];

  get headers() {
    const keys = Object.keys(this.searchResults[0]);
    return keys.map(k => ({ text: this.keyToText(k), value: k }));
  }

  get items() {
    return this.searchResults.map((o, i) => ({ _key: i, ...o }));
  }

  @Watch('visible')
  private onVisibilityChanged(val: boolean) {
    if (!val) this.$destroy();
  }

  protected mounted() {
    this.visible = true;
  }

  public open() {
    // nop
  }

  private keyToText(key: string) {
    const s = key.replace('_', ' ');
    return s[0].toUpperCase() + s.slice(1);
  }

  private onClickRow(item: Record<string, string>, props: DataTableItemProps) {
    props.select(!props.isSelected);
  }

  private apply() {
    this.$emit('apply', this.selected);
  }
}
</script>
<style lang="scss" scoped>
.search-results {
  white-space: nowrap;
}
</style>
