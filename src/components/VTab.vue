<template>
  <b-nav tabs>
    <b-nav-item v-for="tab in tabs" :active="tab.key === currentTab" @click="currentTab = tab.key">
      {{ tab.title }}
    </b-nav-item>
  </b-nav>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class VTab extends Vue {
  @Prop({ required: true })
  private tabs!: Array<{ key: string, title: string }>;

  @Prop({ default: null })
  private value!: string | null;

  private currentTab: string | null = null;

  @Watch('value', { immediate: true })
  private onValueChanged() {
    this.currentTab = this.value;
  }

  @Watch('currentTab')
  private onTabChanged(val: string | null) {
    this.$emit('input', val);
  }
}
</script>
