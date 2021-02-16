import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { proper } from '@/utils';
import common from './common';
import music from './music';

Vue.use(VueI18n);

export default new VueI18n({
  locale: 'ja',
  fallbackLocale: ['en', 'ja'],
  silentFallbackWarn: true,
  missing(locale, path) {
    if (locale === 'en') {
      return proper(path.split('.').pop() || '');
    } else {
      return path;
    }
  },
  messages: {
    ...common,
    ...music,
  },
});
