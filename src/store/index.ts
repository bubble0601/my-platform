import Vue from 'vue';
import Vuex from 'vuex';
import { getModule } from 'vuex-module-decorators';
import createPersistedState from 'vuex-persistedstate';
import { concat } from 'lodash';
import auth from './auth';
import music, { paths as musicPaths } from './music';
import screen from './screen';
import setting, { paths as settingPaths } from './setting';

Vue.use(Vuex);

const paths = musicPaths.concat(settingPaths);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    auth,
    music,
    screen,
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
export const musicModule = getModule(music, store);
export const screenModule = getModule(screen, store);
export const settingModule = getModule(setting, store);
