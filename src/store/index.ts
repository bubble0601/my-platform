import Vue from 'vue';
import Vuex from 'vuex';
import { getModule } from 'vuex-module-decorators';
import createPersistedState from 'vuex-persistedstate';
import audio, { paths as audioPaths } from './audio';
import auth from './auth';
import music from './music';

Vue.use(Vuex);

const paths = [
  ...audioPaths,
];

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    audio,
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
export const audioModule = getModule(audio, store);
export const authModule = getModule(auth, store);
export const musicModule = getModule(music, store);
