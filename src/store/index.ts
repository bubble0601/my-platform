import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import { getModule, config } from 'vuex-module-decorators';

config.rawError = true;

import auth from './auth';
import view from './view';
import music, { paths as musicPaths } from './music';
import setting, { paths as settingPaths } from './setting';

Vue.use(Vuex);

const paths = musicPaths.concat(settingPaths);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    auth,
    view,
    music,
    setting,
  },
  plugins: [
    createPersistedState({
      paths,
    }),
  ],
});

export default store;
export const authModule = getModule(auth, store);
export const viewModule = getModule(view, store);
export const musicModule = getModule(music, store);
export const settingModule = getModule(setting, store);
