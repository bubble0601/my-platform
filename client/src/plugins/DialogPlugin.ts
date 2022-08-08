/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VueConstructor } from 'vue/types/umd';
import { Confirm, Prompt, Snackbar } from '@/components/dialog';
import { isString } from 'lodash';
import { ConfirmOptions, PromptOptions, SnackbarArgs, SnackbarCreator, SnackbarOptions } from '@/types';

const createShowSnackbar = (parent: Vue, color?: string) => {
  /**
   * $snackbar(message, options?)
   * $snackbar(options)
   *
   * $snackbar.info(message, options?)
   * $snackbar.info(options)
   */
  return (...args: SnackbarArgs) => {
    const arg1 = args[0];
    const arg2 = args[1];
    let options: SnackbarOptions = {};
    if (isString(arg1)) {
      options = {
        ...arg2,
        message: arg1,
      };
    } else {
      options = arg1;
    }
    if (color) {
      options.props = {
        ...options.props,
        color,
      };
    }
    console.log(options);
    // @ts-ignore
    new Snackbar({ parent }).open(options);
  };
};

function install(Vue: VueConstructor, _options: unknown) {
  let snackbarCreatorCache: SnackbarCreator | null = null;
  Object.defineProperty(Vue.prototype, '$snackbar', {
    get() {
      const app = this.$root.$children[0];
      if (snackbarCreatorCache === null) {
        snackbarCreatorCache = Object.assign(createShowSnackbar(app), {
          info: createShowSnackbar(app, 'info'),
          success: createShowSnackbar(app, 'success'),
          warn: createShowSnackbar(app, 'warning'),
          error: createShowSnackbar(app, 'error'),
        });
      }
      return snackbarCreatorCache;
    },
  });
  Object.defineProperty(Vue.prototype, '$confirm', {
    get() {
      return (options: ConfirmOptions) => {
        const app = this.$root.$children[0];
        // @ts-ignore
        return new Confirm({ parent: app }).open(options);
      };
    },
  });
  Object.defineProperty(Vue.prototype, '$prompt', {
    get() {
      return (options: PromptOptions) => {
        const app = this.$root.$children[0];
        const VM = Vue.extend(Prompt);
        // @ts-ignore
        return new VM({ parent: app, propsData: options }).open(options);
      };
    },
  });
}

export default {
  install,
};
