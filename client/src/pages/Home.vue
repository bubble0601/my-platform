<template>
  <div v-t="'message'" class="container"/>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  i18n: {
    messages: {
      en: {
        message: 'Comming soon',
      },
    },
  },
})
export default class Home extends Vue {}
</script>
