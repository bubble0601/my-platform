import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import './init';

Vue.config.productionTip = false;

// i18n merging
router.beforeEach((to, from, next) => {
  if (to.meta.i18n) {
    const messages = to.meta.i18n.default;
    Object.keys(messages).forEach((locale) => i18n.mergeLocaleMessage(locale, messages[locale]));
  }
  next();
});

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
