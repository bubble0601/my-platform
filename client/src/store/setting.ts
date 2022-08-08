import { VuexModule, Module, Action, Mutation, config } from 'vuex-module-decorators';
config.rawError = true;

import { UserApi } from '@/api';

@Module({ namespaced: true, name: 'setting' })
export default class SettingModule extends VuexModule {
  public isLocal = false;
  public fixDrawer = false;

  @Mutation
  private SET_IS_LOCAL(isLocal: boolean) {
    this.isLocal = isLocal;
  }

  @Mutation
  public SET_FIX_DRAWER(b: boolean) {
    this.fixDrawer = b;
  }

  @Action
  public async Init() {
    const res = await UserApi.initSettings();
    this.SET_IS_LOCAL(res.data.is_local);
  }
}

// 永続化
const keys: string[] = [
  'fixDrawer',
];
export const paths = keys.map((k) => `setting.${k}`);
