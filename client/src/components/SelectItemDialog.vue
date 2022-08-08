<template>
  <v-dialog v-model="show" scrollable class="pa-3">
    <v-card>
      <v-card-title>項目を選択</v-card-title>
      <div class="d-flex">
        <v-btn color="primary" outlined @click="selectAll">
          すべて選択
        </v-btn>
        <v-btn color="primary" outlined class="ml-2" @click="unselectAll">
          選択解除
        </v-btn>
      </div>
      <div v-for="item in filteredItems" :key="item.key">
        <v-subheader>{{ item.label }}</v-subheader>
        <v-checkbox v-for="(o, i) in item.options" :key="i" v-model="item.selected" :value="o" hide-details/>
      </div>
      <v-card-actions>
        <v-btn color="secondary" @click="show = false">キャンセル</v-btn>
        <v-btn color="primary" @click="onOK">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { filter } from 'lodash';

@Component
export default class SelectItemDialog extends Vue {
  @Prop({ type: Array, default: () => [] })
  private items!: Array<{ key: string, label?: string, options: string[], selected: string[] }>;

  private show = false;

  get filteredItems() {
    return filter(this.items, (i) => i.options.length > 0);
  }

  public open() {
    this.show = true;
  }

  private selectAll() {
    this.items.forEach((i) => {
      i.selected = i.options;
    });
  }

  private unselectAll() {
    this.items.forEach((i) => {
      i.selected = [];
    });
  }

  private onOK() {
    const result: Record<string, string[]> = {};
    this.filteredItems.forEach((i) => {
      result[i.key] = i.selected;
    });
    this.$emit('ok', result);
  }
}
</script>
