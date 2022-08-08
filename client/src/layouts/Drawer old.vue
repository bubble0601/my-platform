<template>
  <v-navigation-drawer v-if="$mobile || !fixDrawer" v-show="show" v-model="drawer" app temporary touchless>
    <div class="d-flex my-2 pl-4" style="height: 32px;">
      <router-link to="/" class="d-flex align-center text-decoration-none" style="height: 32px;">
        <img class="h-100" src="@/assets/favicon.png" alt="Logo">
        <span class="text-h5 font-italic light-blue--text text--lighten-2 ml-1">iBubble</span>
      </router-link>
    </div>
    <v-list>
      <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router>
        <v-list-item-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <template v-if="!$mobile" #append>
      <div class="d-flex">
        <v-tooltip left open-delay="500">
          <span>サイドに固定</span>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" icon class="ml-auto" v-on="on" @click="fixDrawer = true">
              <v-icon>push_pin</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-navigation-drawer>

  <v-navigation-drawer v-else app permanent mini-variant mini-variant-width="48">
    <router-link to="/" class="d-flex align-center justify-center text-decoration-none mt-2 mb-3" style="height: 32px;">
      <img src="@/assets/favicon.png" alt="Icon" class="h-100">
    </router-link>

    <v-list dense class="py-0">
      <v-tooltip v-for="(item, i) in items" :key="i" right open-delay="300">
        <template #activator="{ on, attrs }">
          <v-list-item v-bind="attrs" :to="item.to" v-on="on">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ item.title }}</span>
      </v-tooltip>
      <!-- <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router>
        <v-list-item-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->
    </v-list>

    <template #append>
      <div class="d-flex justify-center">
        <v-tooltip right open-delay="500">
          <span>隠す</span>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" icon v-on="on" @click="fixDrawer = false">
              <v-icon>chevron_left</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-navigation-drawer>
</template>
<script lang="ts">
import { Vue, Component, Prop, VModel } from 'vue-property-decorator';
import { settingModule } from '@/store';

@Component
export default class Drawer extends Vue {
  @VModel() private drawer!: boolean | null;

  @Prop({ type: Array, required: true })
  private items!: Record<string, unknown>[];

  private show = true;

  get fixDrawer() {
    return settingModule.fixDrawer;
  }

  set fixDrawer(val: boolean) {
    if (!val) {
      this.drawer = false;
      this.show = false;
      this.$nextTick(() => { this.show = true; });
    }
    settingModule.SET_FIX_DRAWER(val);
  }
}
</script>
