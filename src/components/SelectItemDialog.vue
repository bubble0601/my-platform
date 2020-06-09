<template>
  <b-modal ref="modal" v-bind="attrs" v-on="listeners">
    <div class="d-flex mb-2">
      <b-button variant="outline-primary" @click="selectAll">Select all</b-button>
      <b-button variant="outline-primary" class="ml-2" @click="unselectAll">Unselect all</b-button>
    </div>
    <b-form-group v-for="item in filteredItems" :key="item.key" :label="item.label">
      <b-form-checkbox-group v-model="item.selected" :options="item.options" stacked/>
    </b-form-group>
  </b-modal>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { Dictionary, filter } from 'lodash';

@Component
export default class SelectItemDialog extends Vue {
  @Prop({ type: Array, default: () => [] })
  private items!: Array<{ key: string, label?: string, options: string[], selected: string[] }>;

  get attrs() {
    return {
      title: 'Select items',
      ...this.$attrs,
    };
  }

  get listeners() {
    return {
      ...this.$listeners,
      ok: () => {
        const result: Dictionary<string[]> = {};
        this.filteredItems.forEach((i) => {
          result[i.key] = i.selected;
        });
        this.$emit('ok', result);
      },
    };
  }

  @Ref() private modal!: BModal;

  get filteredItems() {
    return filter(this.items as Array<{ key: string, label?: string, options: string[], selected: string[] }>, (i) => i.options.length > 0);
  }

  public show() {
    this.modal.show();
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
}
</script>
