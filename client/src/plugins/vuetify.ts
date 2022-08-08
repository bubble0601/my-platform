import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import colors from 'vuetify/lib/util/colors';
import ja from 'vuetify/src/locale/ja';

Vue.use(Vuetify);

const darkTheme = localStorage.getItem('theme') === 'dark';

export default new Vuetify({
  lang: {
    locales: { ja },
    current: 'ja',
  },
  breakpoint: {
    mobileBreakpoint: 'sm',
  },
  icons: {
    iconfont: 'md',
  },
  theme: {
    dark: darkTheme,
    themes: {
      dark: {
        primary: colors.indigo,
        accent: colors.blueGrey.darken2,
      },
    },
    options: {
      customProperties: true,
    },
  },
});

document.documentElement.setAttribute('data-theme', darkTheme ? 'dark' : 'light');
