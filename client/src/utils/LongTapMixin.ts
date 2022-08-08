import { Vue, Component } from 'vue-property-decorator';

@Component
export default class LongTapMixin extends Vue {
  public longTapHandlers: (() => void)[] = [];
  public longTapDuration = 500;
  private timer: number | null = null;

  public onTouchStart() {
    if (this.timer !== null) return;

    this.timer = window.setTimeout(() => {
      this.longTapHandlers.forEach((h) => h());
    }, this.longTapDuration);
  }

  private cancel() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public onTouchMove() {
    this.cancel();
  }

  public onTouchEnd() {
    this.cancel();
  }
}
