import './plugins/componentHooks';
import Vue from 'vue';
import vuetify from './plugins/vuetify';
import router from './router';
import store from './store';
import i18n from './i18n';
import './plugins';

import App from './App.vue';

Vue.config.productionTip = false;

// Vue.mixin({
//   created() {
//     // @ts-ignore
//     const name: string = this.name || this.$options.name || '';
//     if (name && !name.startsWith('v-') && !name.startsWith('V') && !name.endsWith('transition')) console.log(`[created] ${name}`);
//   },
// });

new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
