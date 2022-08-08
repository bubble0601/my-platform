import { VueConstructor } from 'vue';
import { Vue, Component } from 'vue-property-decorator';
import UAParser from 'ua-parser-js';

const result = new UAParser().getResult();

@Component
class ResponsiveMixin extends Vue {
  get $pc() {
    return !this.$mobile;
  }

  get $mobile() {
    return this.$vuetify.breakpoint.mobile;
  }

  get $sm() {
    return this.$vuetify.breakpoint.smAndUp;
  }

  get $md() {
    return this.$vuetify.breakpoint.mdAndUp;
  }

  get $lg() {
    return this.$vuetify.breakpoint.lgAndUp;
  }

  get $xl(){
    return this.$vuetify.breakpoint.xl;
  }

  get $light() {
    return !this.$dark;
  }

  get $dark() {
    return this.$vuetify.theme.dark;
  }

  get $webkit() {
    return ['webkit', 'blink'].includes(result.engine.name?.toLowerCase() || '');
  }

  get $gecko() {
    return ['gecko'].includes(result.engine.name?.toLowerCase() || '');
  }

  get $scrollbarWidth() {
    if (this.$mobile) return 0;
    return this.$webkit || this.$gecko ? 8 : 16;
  }
}

export default {
  install(Vue: VueConstructor, _options: unknown) {
    Vue.mixin(ResponsiveMixin);
  },
};
