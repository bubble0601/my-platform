import { VueConstructor } from 'vue/types/umd';
import { viewModule } from '@/store';

export default {
  // tslint:disable-next-line:variable-name
  install(Vue: VueConstructor, options: object) {
    Vue.mixin({
      computed: {
        $mobile() {
          return viewModule.isMobile;
        },
        $pc() {
          return viewModule.isPC;
        },
      },
      methods: {
        $from: viewModule.from,
        $until: viewModule.until,
      },
    });

    window.addEventListener('resize', viewModule.RESIZE);
  },
};
