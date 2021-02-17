import { VuexModule, Module, Action, Mutation, config } from 'vuex-module-decorators';
import axios from 'axios';
import { AuthApi } from '@/api';
import { User } from '@/api/user';

config.rawError = true;

type Status = '' | 'loading' | 'success' | 'fail' | 'signout';

@Module({ name: 'auth' })
export default class Auth extends VuexModule {
  public status: Status = '';
  public user: User | null = null;

  get isInitialized() {
    return this.status !== '';
  }
  get isAuthenticated() {
    return this.status === 'success';
  }

  @Mutation
  private REQUEST() {
    this.status = 'loading';
  }

  @Mutation
  private SUCCESS(user: User) {
    this.status = 'success';
    this.user = user;
  }

  @Mutation
  private FAIL() {
    this.status = 'fail';
  }

  @Mutation
  private SIGNOUT() {
    this.status = 'signout';
    this.user = null;
  }

  @Action
  public async Init() {
    this.REQUEST();
    const res = await AuthApi.init();
    axios.interceptors.request.use((axiosRequestConfig) => {
      if (axiosRequestConfig.method && ['get', 'head', 'options'].includes(axiosRequestConfig.method.toLowerCase())) return axiosRequestConfig;
      axiosRequestConfig.headers['X-CSRF-TOKEN'] = res.data.token;
      return axiosRequestConfig;
    });
    if (res.data.user) this.SUCCESS(res.data.user);
    else this.SIGNOUT();
    return res;
  }

  @Action
  public async SignIn(data: { username: string, password: string }) {
    this.REQUEST();
    return AuthApi.signIn(data).then((res) => {
      this.SUCCESS(res.data.user);
      return res;
    }).catch((err) => {
      this.FAIL();
      throw err;
    });
  }

  @Action
  public async SignOut() {
    await AuthApi.signOut();
    this.SIGNOUT();
  }
}
