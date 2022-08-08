<template>
  <default-layout title="Home" fit-height>
    <!-- <div v-t="'message'" class="container"/> -->
    <v-container fluid>
      <v-row v-if="false" dense>
        <v-col v-for="c in themeColors" :key="c" cols="4" md="3" lg="2">
          <v-card outlined tile :color="c">
            <v-card-title>{{ c }}</v-card-title>
            <v-list dense color="transparent" class="py-0">
              <v-list-item v-for="v in variations2" :key="v" :class="[c, v]">
                <span :class="['l', 'a'].includes(v[0]) ? 'black--text' : 'whiet--text'">{{ v }}</span>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col v-for="c in materialColors2" :key="c" cols="4" md="3" lg="2">
          <v-card outlined tile :color="c">
            <v-card-title>{{ c }}</v-card-title>
            <v-list dense color="transparent" class="py-0">
              <v-list-item v-for="v in variations2" :key="v" :class="[c, v]">
                <span :class="['l', 'a'].includes(v[0]) ? 'black--text' : 'whiet--text'">{{ v }}</span>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col v-for="c in materialColors" :key="c" cols="4" md="3" lg="2">
          <v-card outlined tile :color="c">
            <v-card-title>{{ c }}</v-card-title>
            <v-list dense color="transparent" class="py-0">
              <v-list-item v-for="v in variations" :key="v" :class="[c, v]">
                <span :class="['l', 'a'].includes(v[0]) ? 'black--text' : 'whiet--text'">{{ v }}</span>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="4" md="3" lg="2">
          <v-card outlined tile color="black">
            <v-card-title class="white--text">black</v-card-title>
          </v-card>
        </v-col>
        <v-col cols="4" md="3" lg="2">
          <v-card outlined tile color="white">
            <v-card-title class="black--text">white</v-card-title>
          </v-card>
        </v-col>
      </v-row>

      <v-row no-gutters class="mt-4">
        <v-col v-for="c in themeColors" :key="c" class="overflow-hidden" style="flex: 1 0 0;">
          <div v-for="v in variations2" :key="v" class="text-center" :class="[c, v, ['l', 'a'].includes(v[0]) ? 'black--text' : 'white--text']" style="white-space: nowrap;">
            {{ v === 'base' ? c : `${v[0]}-${v[v.length - 1]}` }}
            <!-- <template v-if="v === 'base'">
              <div>{{ c }}</div>
              <div>{{ theme[c] }}</div>
            </template>
            <template v-else>
              {{ `${v[0]}-${v[v.length - 1]}` }}
            </template> -->
          </div>
        </v-col>
        <v-col v-for="c in materialColors" :key="c" class="overflow-hidden" style="flex: 1 0 0;">
          <div v-for="v in variations" :key="v" class="text-center" :class="[c, v, ['l', 'a'].includes(v[0]) ? 'black--text' : 'white--text']" style="white-space: nowrap;">
            {{ v === 'base' ? c : `${v[0]}-${v[v.length - 1]}` }}
          </div>
        </v-col>
        <v-col v-for="c in materialColors2" :key="c" class="overflow-hidden" style="flex: 1 0 0;">
          <div v-for="v in variations2" :key="v" class="text-center" :class="[c, v, ['l', 'a'].includes(v[0]) ? 'black--text' : 'white--text']" style="white-space: nowrap;">
            {{ v === 'base' ? c : `${v[0]}-${v[v.length - 1]}` }}
          </div>
        </v-col>
      </v-row>
    </v-container>
  </default-layout>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

@Component({
  metaInfo: {
    title: 'Home',
  },
  components: {
    DefaultLayout,
  },
  i18n: {
    messages: {
      en: {
        message: 'Comming soon',
      },
    },
  },
})
export default class Home extends Vue {
  // private themeColors = ['primary', 'secondary', 'accent', 'error', 'info', 'success', 'warning'];
  private materialColors = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange'];
  private materialColors2 = ['brown', 'blue-grey', 'grey'];
  private variations = ['base', 'lighten-1', 'lighten-2', 'lighten-3', 'lighten-4', 'lighten-5', 'darken-1', 'darken-2', 'darken-3', 'darken-4', 'accent-1', 'accent-2', 'accent-3', 'accent-4'];
  private variations2 = ['base', 'lighten-1', 'lighten-2', 'lighten-3', 'lighten-4', 'lighten-5', 'darken-1', 'darken-2', 'darken-3', 'darken-4'];

  get theme() {
    return this.$vuetify.theme.currentTheme;
  }

  get themeColors() {
    return Object.keys(this.theme);
  }
}
</script>
