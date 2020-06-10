import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from './common';

Vue.use(VueI18n);

export default new VueI18n({
  locale: 'ja',
  fallbackLocale: ['en', 'ja'],
  silentFallbackWarn: true,
  messages,
});
