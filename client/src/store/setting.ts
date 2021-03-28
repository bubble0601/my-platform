import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import { UserApi } from '@/api';

export type Theme = 'light' | 'dark';

@Module({ namespaced: true, name: 'setting' })
export default class SettingModule extends VuexModule {
  public isLocal = false;
  public theme: Theme = 'light';

  @Mutation
  private SET_IS_LOCAL(isLocal: boolean) {
    this.isLocal = isLocal;
  }

  @Mutation
  private SET_THEME(theme: Theme) {
    this.theme = theme;
  }

  @Action
  public async Init() {
    const res = await UserApi.initSettings();
    this.SET_IS_LOCAL(res.data.is_local);
  }

  @Action
  public SetTheme(theme: Theme) {
    this.SET_THEME(theme);
  }
}

// 永続化
const keys: string[] = [
  'theme',
];
export const paths = keys.map((k) => `setting.${k}`);
