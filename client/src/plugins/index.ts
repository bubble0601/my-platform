import Vue from 'vue';
import VueMeta from 'vue-meta';
import Vuelidate from 'vuelidate';
import { AppBarHamburger, AppBarSearch } from '@/components';
import DialogPlugin from './DialogPlugin';
import ResponsivePlugin from './ResponsivePlugin';

Vue.use(VueMeta);
Vue.use(Vuelidate);
Vue.use(DialogPlugin);
Vue.use(ResponsivePlugin);

Vue.component('AppBarHamburger', AppBarHamburger);
Vue.component('AppBarSearch', AppBarSearch);

if (process.env.NODE_ENV !== 'production') {
  Vue.mixin({
    methods: {
      $_log: console.log,
    },
  });
}
