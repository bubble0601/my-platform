import { Component } from 'vue';
import { VuexModule, Module, Mutation, config } from 'vuex-module-decorators';
config.rawError = true;

@Module({ namespaced: true, name: 'appbar' })
export default class AppbarModule extends VuexModule {
  public title = '';
  public appbars: Component[] = [];

  @Mutation
  public SET_TITLE(title: string) {
    this.title = title;
  }

  @Mutation
  public PUSH(component: Component) {
    this.appbars.push(component);
  }

  @Mutation
  public POP() {
    this.appbars.pop();
  }
}
