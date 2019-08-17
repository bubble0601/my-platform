import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators';
import axios from 'axios';
import store from '@/store';

type Status = '' | 'loading' | 'success' | 'fail' | 'signout';

export interface User {
  name: string;
}

@Module({ dynamic: true, store, name: 'auth' })
class Auth extends VuexModule {
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
    const res = await axios.get<{ user: User, token: string }>('/api/user/init');
    axios.interceptors.request.use((config) => {
      if (config.method && ['get', 'head', 'options'].includes(config.method.toLowerCase())) return config;
      config.headers['X-CSRF-TOKEN'] = res.data.token;
      return config;
    });
    if (res.data.user) this.SUCCESS(res.data.user);
    else this.SIGNOUT();
    return res;
  }

  @Action
  public async SignIn(data: { username: string, password: string }) {
    this.REQUEST();
    await axios.post<{ user: User }>('/api/user/signin', data).then((res) => {
      this.SUCCESS(res.data.user);
      return res;
    }).catch((err) => {
      this.FAIL();
      throw err;
    });
  }

  @Action
  public async SignOut() {
    await axios.get('/api/user/signout').then(() => {
      this.SIGNOUT();
    });
  }
}

export default getModule(Auth);
