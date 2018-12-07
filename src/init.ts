import Vue from 'vue';
import Buefy from 'buefy';
// @ts-ignore
import { Toast } from 'buefy/dist/components/toast';
import axios from 'axios';

Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

axios.interceptors.response.use(undefined, (err) => {
  Toast.open({
    type: 'is-danger',
    position: 'is-bottom',
    message: err.response.data.error_message,
  });
});

if (process.env.NODE_ENV !== 'production') {
  Vue.mixin({
    methods: {
      /* tslint:disable-next-line:no-console */
      $_log: console.log,
    },
  });
}
