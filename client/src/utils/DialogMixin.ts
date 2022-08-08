import { Vue, Component } from 'vue-property-decorator';

@Component
export class DialogMixin extends Vue {
  protected created() {
    this.attach();
  }

  protected destroyed() {
    this.detach();
  }

  protected attach() {
    try {
      this.$mount();
      this.$parent.$el.appendChild(this.$el);
    } catch(e) {
      this.$mount();
      document.body.appendChild(this.$el);
    }
  }

  protected detach() {
    if (this.$parent && this.$parent.$el.contains(this.$el)) {
      this.$parent.$el.removeChild(this.$el);
    } else {
      document.body.removeChild(this.$el);
    }
  }
}

export default DialogMixin;

export function waitHideTransition(target: HTMLElement) {
  let transitionCount = 0;
  return new Promise((resolve, _reject) => {
    const onTransitionEnd = () => {
      transitionCount -= 1;
      if (transitionCount === 0) {
        resolve(undefined);
      }
    };
    target.addEventListener('transitionstart', () => {
      transitionCount += 1;
    });
    target.addEventListener('transitioncancel', onTransitionEnd);
    target.addEventListener('transitionend', onTransitionEnd);
  });
}
