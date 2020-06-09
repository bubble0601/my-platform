import { Vue, Component, Watch } from 'vue-property-decorator';
import { viewModule } from '@/store';

@Component
export default class extends Vue {
  protected sizingCallbacks: Array<() => void> = [];

  protected mounted() {
    this.callSizingCallbacks();
    window.addEventListener('resize', this.callSizingCallbacks);
  }

  protected beforeDestroy() {
    window.removeEventListener('resize', this.callSizingCallbacks);
  }

  protected addSizingCallback(f: () => void) {
    this.sizingCallbacks.push(f);
  }

  protected callSizingCallbacks() {
    this.sizingCallbacks.forEach((f) => f());
  }
}
