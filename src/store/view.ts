import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import { VueConstructor } from 'vue/types/umd';
import { Dictionary } from 'lodash';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface Footer {
  name: string;
  component: VueConstructor;
  props: Dictionary<any>;
  listeners?: Dictionary<(...args: any) => any>;
  nativeListeners?: Dictionary<(...args: any) => any>;
}

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
  private readonly devices = {
    xs: 0,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  };

  public width = window.innerWidth;
  public size: Size = getScreenSize();

  public footerFixed = false;
  public footer: Footer | null = null;
  public footers: Footer[] = [];
  public footerHeight: number = 0;

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
  public RESIZE() {
    this.width = window.innerWidth;
    this.size = getScreenSize();
  }

  @Mutation
  public SET_FOOTER(payload: VueConstructor | Footer | null) {
    if (!payload) {
      this.footer = null;
      return;
    }
    let footer: Footer;
    if ('props' in payload) {
      footer = payload;
    } else {
      footer = { component: payload, name: payload.name, props: {} };
    }
    if (!this.footers.find((c) => c.component === footer.component)) {
      this.footers.push(footer);
    }
    this.footer = footer;
  }

  @Mutation
  public SET_FOOTER_PROPS(props: Dictionary<any>) {
    if (this.footer) this.footer.props = props;
  }

  @Mutation
  public REMOVE_FOOTER(footer: Footer) {
    this.footers = this.footers.filter((f) => f.name !== footer.name);
  }

  @Mutation
  public FIX_FOOTER() {
    this.footerFixed = true;
  }

  @Mutation
  public UNFIX_FOOTER() {
    this.footerFixed = false;
  }

  @Mutation
  public SET_FOOTER_HEIGHT(h: number) {
    this.footerHeight = h;
  }
}
