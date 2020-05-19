<template>
  <b-nav :tabs="tabs" :pills="pills" :fill="fill" :justified="justified">
    <b-nav-text class="d-flex align-items-center">
      <slot name="nav-start"/>
    </b-nav-text>
    <template v-for="item in items">
      <b-nav-item v-if="doRouting" :key="item.key" :to="item.to" active-class="active">
        {{ item.title }}
      </b-nav-item>
      <b-nav-item v-else :key="item.key" :active="item.key === current" @click="current = item.key">
        {{ item.title }}
      </b-nav-item>
    </template>
    <b-nav-text class="d-flex align-items-center ml-auto">
      <slot name="nav-end"/>
    </b-nav-text>
  </b-nav>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class VNav extends Vue {
  @Prop({ required: true })
  private items!: Array<{ key: string, title: string }>;

  @Prop({ default: null })
  private value!: string | null;

  @Prop({ type: Boolean, default: false })
  private tabs!: boolean;

  @Prop({ type: Boolean, default: false })
  private pills!: boolean;

  @Prop({ type: Boolean, default: false })
  private fill!: boolean;

  @Prop({ type: Boolean, default: false })
  private justified!: boolean;

  @Prop({ type: Boolean, default: false })
  private doRouting!: boolean;

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
