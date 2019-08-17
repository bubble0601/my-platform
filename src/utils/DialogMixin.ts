import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  protected created() {
    document.body.appendChild(this.$mount().$el);
  }

  protected destroyed() {
    document.body.removeChild(this.$el);
  }
}
