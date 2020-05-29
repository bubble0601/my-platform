import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  protected created() {
    this.attach();
  }

  protected destroyed() {
    this.detach();
  }

  protected attach() {
    if (!this.$parent) {
      this.$mount();
      document.body.appendChild(this.$el);
    } else {
      this.$mount();
      this.$parent.$el.appendChild(this.$el);
    }
  }

  protected detach() {
    if (!this.$parent) {
      document.body.removeChild(this.$el);
      this.$destroy();
    } else {
      this.$parent.$el.removeChild(this.$el);
      this.$destroy();
    }
  }
}
