<template>
  <v-fade-transition>
    <div v-if="sortable" class="header-item sortable" :class="{ sorting }" @click="$emit('click')">
      <slot/>
      <v-fade-transition>
        <v-icon small class="sort-icon">{{ (sorting && sortDesc) ? 'arrow_downward' : 'arrow_upward' }}</v-icon>
      </v-fade-transition>
    </div>
    <div v-else class="header-item">
      <slot/>
    </div>
  </v-fade-transition>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class HeaderItem extends Vue {
  @Prop({ type: Boolean, default: false })
  private sortable!: boolean;

  @Prop({ type: Boolean, default: false })
  private sorting!: boolean;

  @Prop({ type: Boolean, default: false })
  private sortDesc!: boolean;
}
</script>
<style lang="scss" scoped>
.header-item {
  white-space: nowrap;
  opacity: 0.7;

  &.sortable {
    display: flex;
    align-items: center;
    cursor: pointer;

    .sort-icon {
      opacity: 0;
    }

    &:hover:not(.sorting) {
      opacity: 1;

      .sort-icon {
        opacity: 0.7;
      }
    }

    &.sorting {
      opacity: 1;

      .sort-icon {
        opacity: 1;
      }
    }
  }
}
</style>
