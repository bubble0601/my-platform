import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';

export enum REPEAT {
  NONE,
  ALL,
  ONE,
}

@Module({ name: 'audio' })
export default class Audio extends VuexModule {
  public shuffle = false;
  public repeat: REPEAT = REPEAT.NONE;
  public volume = 100;

  @Mutation
  public SET_SHUFFLE(val: boolean) {
    this.shuffle = val;
  }

  @Mutation
  public SET_REPEAT(val: REPEAT) {
    this.repeat = val;
  }

  @Mutation
  public SET_VOLUME(val: number) {
    this.volume = val;
  }
}

export const paths = ['shuffle', 'volume'].map((str) => `audio.${str}`);
