import Vue from 'vue';

export default Vue.extend({
  created() {
    document.body.appendChild(this.$mount().$el);
  },
  destroyed() {
    document.body.removeChild(this.$el);
  },
});
