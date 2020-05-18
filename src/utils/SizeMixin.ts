import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  private sizingCallbacks: Array<() => void> = [];

  protected mounted() {
    this.sizingCallbacks.forEach((f) => {
      f();
      window.addEventListener('resize', f);
    });
  }

  protected beforeDestroy() {
    this.sizingCallbacks.forEach((f) => {
      window.removeEventListener('resize', f);
    });
  }

  protected addSizingCallback(f: () => void) {
    this.sizingCallbacks.push(f);
  }
}
