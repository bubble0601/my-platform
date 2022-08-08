import Vue from 'vue';
import Vuex from 'vuex';

import { getModule } from 'vuex-module-decorators';
import createPersistedState from 'vuex-persistedstate';

import auth from './auth';
import appbar from './appbar';
import view from './view';
import music, { paths as musicPaths } from './music';
import setting, { paths as settingPaths } from './setting';

Vue.use(Vuex);

const paths = musicPaths.concat(settingPaths);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    auth,
    appbar,
    view,
    music,
    setting,
  },
  plugins: [
    createPersistedState({ paths }),
  ],
});

export default store;
export const authModule = getModule(auth, store);
export const appbarModule = getModule(appbar, store);
export const viewModule = getModule(view, store);
export const musicModule = getModule(music, store);
export const settingModule = getModule(setting, store);
