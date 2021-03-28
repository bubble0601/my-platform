<template>
  <div>
    <song-list context="smartlist" @back="$router.push('/music/smartlist')"/>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { musicModule, viewModule } from '@/store';
import SongList from './SongList.vue';

@Component({
  components: {
    SongList,
  },
  beforeRouteEnter(to, from, next) {
    const id = Number(to.params.id);
    if (viewModule.isPC && !id && musicModule.smartlistId) {
      next(`/music/smartlist/${musicModule.smartlistId}`);
    } else if (viewModule.isMobile && id > 0) {
      musicModule.FetchSmartlistSongs(id).then(next);
    } else {
      next();
    }
  },
})
export default class Smartlist extends Vue {
  @Prop({ type: Number, required: true })
  private id!: number;

  @Watch('id', { immediate: true })
  private onIdChanged() {
    musicModule.FetchSmartlistSongs(this.id);
  }
}
</script>
