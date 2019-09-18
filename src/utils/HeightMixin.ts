import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  protected height = 'auto';

  protected mounted() {
    if (this.$el instanceof HTMLElement) {
      this.height = `calc(100vh - ${this.$el.offsetTop}px)`;
    }
  }
}
