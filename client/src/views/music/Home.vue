<template>
  <div class="d-flex">
    <music-nav-menu/>
    <div class="pa-3">
      <v-btn color="success" to="/music/songs/new">
        新規追加
      </v-btn>
      <v-btn color="secondary" to="/music/settings" class="ml-2">
        設定
      </v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { MusicNavMenu } from '@/components/music';

@Component({
  components: {
    MusicNavMenu,
  },
})
export default class Home extends Vue {

}
</script>
<style lang="scss" scoped>

</style>
