<template>
  <b-nav :tabs="tabs" :pills="pills">
    <b-nav-item v-for="item in items" :key="item.key" :active="item.key === current" @click="current = item.key">
      {{ item.title }}
    </b-nav-item>
  </b-nav>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class VTab extends Vue {
  @Prop({ required: true })
  private items!: Array<{ key: string, title: string }>;

  @Prop({ default: null })
  private value!: string | null;

  @Prop({ default: false })
  private tabs!: boolean;

  @Prop({ default: false })
  private pills!: boolean;

  private current: string | null = null;

  @Watch('value', { immediate: true })
  private onValueChanged() {
    this.current = this.value;
  }

  @Watch('current')
  private onCurrentChanged(val: string | null) {
    this.$emit('input', val);
  }
}
</script>
