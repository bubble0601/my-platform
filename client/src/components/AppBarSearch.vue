<template>
  <div v-if="!syncedExpanded" class="d-flex">
    <v-btn key="expand" icon class="ml-auto" @click="syncedExpanded = true">
      <v-icon>search</v-icon>
    </v-btn>
  </div>

  <div v-else class="d-flex align-center" :class="$pc ? 'px-12' : 'px-2'">
    <v-text-field
      v-model="query"
      type="search"
      dense
      solo-inverted
      flat
      :autofocus="$mobile"
      :placeholder="placeholder"
      hide-details
      class="search-input ml-auto"
      @blur="$emit('blur')"
      @keydown.enter="$emit('submit')"
    >
      <template #prepend-inner>
        <v-icon color="grey" class="ml-1 mr-2">search</v-icon>
      </template>

      <template v-if="advanced" #append>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" :to="advanced" small icon v-on="on">
              <v-icon>tune</v-icon>
            </v-btn>
          </template>
          <span>高度な検索</span>
        </v-tooltip>
      </template>
    </v-text-field>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, VModel, PropSync } from 'vue-property-decorator';

@Component
export default class AppBarSearch extends Vue {
  @VModel({ type: String, default: '' })
  private query!: string;

  @PropSync('expanded', { type: Boolean, default: false })
  private syncedExpanded!: boolean;

  @Prop({ type: String, default: '' })
  private advanced!: string;

  @Prop({ type: String, default: '' })
  private placeholder!: string;

  protected created() {
    if (!this.$mobile) {
      this.syncedExpanded = true;
    }
  }
}
</script>
