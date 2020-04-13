import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sm = 576;
const md = 768;
const lg = 992;
const xl = 1200;

const getScreenSize: () => Size = () => {
  const w = window.innerWidth;
  if (w >= xl) return 'xl';
  if (w >= lg) return 'lg';
  if (w >= md) return 'md';
  if (w >= sm) return 'sm';
  return 'xs';
};

@Module({ name: 'screen' })
export default class ScreenModule extends VuexModule {
  private devices = {
    xs: 0,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  };

  public width = window.innerWidth;
  public size: Size = getScreenSize();

  get isMobile() {
    return this.devices[this.size] <= this.devices.sm;
  }

  get isPC() {
    return this.devices[this.size] >= this.devices.md;
  }

  get from() {
    return (device: Size) => this.devices[this.size] >= this.devices[device];
  }

  get until() {
    return (device: Size) => this.devices[this.size] <= this.devices[device];
  }

  @Mutation
  private RESIZE() {
    this.width = window.innerWidth;
    this.size = getScreenSize();
  }

  @Action
  public Resize() {
    this.RESIZE();
  }
}
