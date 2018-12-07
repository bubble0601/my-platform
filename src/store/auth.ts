import { ActionContext } from 'vuex';
import axios, { AxiosRequestConfig } from 'axios';

export const AUTH_INIT = 'AUTH_INIT';
export const AUTH_REQUEST = 'AUTH_REQUEST';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_ERROR = 'AUTH_ERROR';
export const AUTH_SIGNOUT = 'AUTH_SIGNOUT';

export interface User {
  name: string;
}

interface State {
  status: string;
  user: User;
}

export default {
  state: {
    status: '',
    user: null,
  },
  getters: {
    isAuthenticated(state: State): boolean {
      return state.status === 'success';
    },
    getUser(state: State): User {
      return state.user;
    },
  },
  mutations: {
    [AUTH_REQUEST](state: State) {
      state.status = 'loading';
    },
    [AUTH_SUCCESS](state: State, user: User) {
      state.status = 'success';
      state.user = user;
    },
    [AUTH_ERROR](state: State) {
      state.status = 'error';
    },
    [AUTH_SIGNOUT](state: State) {
      state.status = '';
    },
  },
  actions: {
    [AUTH_INIT]({ commit }: ActionContext<State, any>, data: any) {
      return new Promise((resolve) => {
        axios.get('/api/user/init').then((res) => {
          axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
            if (config.method && ['get', 'head', 'options'].includes(config.method.toLowerCase())) return config;
            config.headers['X-CSRF-TOKEN'] = res.data.token;
            return config;
          });
          if (res.data.user) commit(AUTH_SUCCESS, res.data.user);
          resolve(res);
        });
      });
    },
    [AUTH_REQUEST]({ commit }: ActionContext<State, any>, data: any) {
      return new Promise((resolve, reject) => {
        commit(AUTH_REQUEST);
        axios.post('/api/user/signin', data).then((res) => {
          commit(AUTH_SUCCESS, res.data.user);
          resolve(res);
        }).catch((err) => {
          commit(AUTH_ERROR);
          reject(err);
        });
      });
    },
    [AUTH_SIGNOUT]({ commit }: ActionContext<State, any>) {
      return new Promise((resolve, reject) => {
        axios.get('/api/user/signout').then(() => {
          commit(AUTH_SIGNOUT);
          resolve();
        }).catch((err) => {
          reject(err);
        });
      });
    },
  },
};
