import { VuexModule, Module, Mutation, config } from 'vuex-module-decorators';
config.rawError = true;

import { VueConstructor } from 'vue/types/umd';

export interface Footer {
  name: string;
  component: VueConstructor;
  props: Record<string, unknown>;
  listeners?: Record<string, (...args: unknown[]) => unknown>;
  nativeListeners?: Record<string, (...args: unknown[]) => unknown>;
}

@Module({ namespaced: true, name: 'view' })
export default class ViewModule extends VuexModule {
  public drawer = false;

  public footerFixed = false;
  public footer: Footer | null = null;
  public footers: Footer[] = [];
  public footerHeight = 0;

  @Mutation
  public SET_DRAWER(show: boolean) {
    this.drawer = show;
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
  public SET_FOOTER_PROPS(props: Record<string, unknown>) {
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
