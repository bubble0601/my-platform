import Vue from 'vue';
import Vuex from 'vuex';
import { getModule } from 'vuex-module-decorators';
import createPersistedState from 'vuex-persistedstate';
import { concat } from 'lodash';
import auth from './auth';
import music, { paths as musicPaths } from './music';

Vue.use(Vuex);

const paths = concat(musicPaths);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    auth,
    music,
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
