import axios from 'axios';
import Vue, { VNode } from 'vue';

export default Vue.extend({
  props: {
    baseUrl: {
      type: String,
      default: '/api',
    },
    endpoint: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      api: axios.create({ baseURL: this.baseUrl }),
      data: null,
      error: null,
      loading: false,
    };
  },
  methods: {
    load() {
      this.loading = true;
      this.api.get(this.endpoint).then((res) => {
        this.data = res.data;
        this.error = null;
      }).catch((error) => {
        this.error = error;
      }).finally(() => {
        this.loading = false;
      });
    },
  },
  render(h): VNode {
    console.log(h());
    if (this.$scopedSlots.default) {
      const vnodes = this.$scopedSlots.default({
        data: this.data,
        error: this.error,
        loading: this.loading,
      });
      if (vnodes) {
        if (vnodes.length > 1) console.warn('Renderless component can accept only 1 element');
        else if (!vnodes.length) console.error('Empty element');
        return vnodes[0];
      }
    }
    return h();
  },
});
