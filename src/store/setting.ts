import { VuexModule, Module, Action, Mutation, config } from 'vuex-module-decorators';
import axios from 'axios';

config.rawError = true;

interface InitResponse {
  is_local: boolean;
}

const api = {
  init: () => axios.get<InitResponse>('/api/setting/init'),
};

@Module({ name: 'setting' })
export default class SettingModule extends VuexModule {
  public isLocal = false;

  @Mutation
  private SET_IS_LOCAL(isLocal: boolean) {
    this.isLocal = isLocal;
  }

  @Action
  public async Init() {
    const res = await api.init();
    this.SET_IS_LOCAL(res.data.is_local);
  }
}

// 永続化
const keys: string[] = [
];
export const paths = keys.map((k) => `setting.${k}`);
