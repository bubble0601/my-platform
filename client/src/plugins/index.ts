import Vue from 'vue';
import Component from 'vue-class-component';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import Vuelidate from 'vuelidate';
import VueSlider from 'vue-slider-component';
import axios, { AxiosError } from 'axios';
import { initDialogs, ResponsivePlugin } from '@/utils';
import { VField, VHelp, VInput } from '@/components';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate',
]);

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(Vuelidate);
Vue.use(ResponsivePlugin);
Vue.component('VueSlider', VueSlider);
Vue.component('VField', VField);
Vue.component('VHelp', VHelp);
Vue.component('VInput', VInput);

initDialogs();

if (process.env.NODE_ENV !== 'production') {
  axios.interceptors.response.use(undefined, (err: AxiosError) => {
    const res = err.response;
    if (res?.data.error_message) {
      Vue.prototype.$message.error(res.data.error_message);
    } else if (res) {
      Vue.prototype.$message.error(`${res.status} ${res.statusText}`);
    } else {
      Vue.prototype.$message.error('通信に失敗しました');
    }
    throw err;
  });

  Vue.mixin({
    methods: {
      /* tslint:disable-next-line:no-console */
      $_log: console.log,
    },
  });
}
