<template>
  <div>
    music
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
  created() {
    axios.get('/api/music/all').then((res) => {
      console.log(res.data);
    });
  },
});
</script>
