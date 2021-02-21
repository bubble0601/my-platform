import Vue from 'vue';
import { isObject } from 'lodash';
import { Message, MessageBox } from '@/components';
import { Variant, MsgOptions, MessageArgs, MsgBoxOptions, MsgBoxArgs } from '@/types';

const variants = ['primary', 'secondry', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

function isVariant(str: string): str is Variant {
  return variants.includes(str);
}

function makeMessage(variant?: Variant) {
  return (...args: MessageArgs) => {
    let options: MsgOptions = {};
    /**
     * $message(options)
     * $message(message, options?)
     * $message(variant, message, options?)
     * $message(title, message, options?)
     * $message(variant, title, message, options?)
     *
     * $message.info(options)
     * $message.info(message, options?)
     * $message.info(title, message, options?)
     */
    const a = args[0];
    const b = args[1];
    const c = args[2];
    const d = args[3];
    if (isObject(a)) {
      options = a;
    } else if (b === undefined) {
      options = {
        message: a,
      };
    } else if (isObject(b)) {
      options = {
        ...b,
        message: a,
      };
    } else if (c === undefined) {
      if (variant === undefined && isVariant(a)) {
        options = {
          variant: a,
          message: b,
        };
      } else {
        options = {
          title: a,
          message: b,
        };
      }
    } else if (isObject(c)) {
      if (variant === undefined && isVariant(a)) {
        options = {
          ...c,
          variant: a,
          message: b,
        };
      } else {
        options = {
          ...c,
          title: a,
          message: b,
        };
      }
    } else if (d === undefined) {
      options = {
        variant: isVariant(a) ? a : '',
        title: b,
        message: c,
      };
    } else if (isObject(d)) {
      options = {
        ...d,
        variant: isVariant(a) ? a : '',
        title: b,
        message: c,
      };
    }
    if (variant) options.variant = variant;
    // @ts-ignore
    new Message().open(options);
  };
}

export const message = Object.assign(makeMessage(), {
  info: makeMessage('info'),
  success: makeMessage('success'),
  warn: makeMessage('warning'),
  error: makeMessage('danger'),
});

function initMessage() {
  Vue.prototype.$message = message;
}

function makeMessageBox(type: 'confirm' | 'prompt') {
  return (...args: MsgBoxArgs) => {
    let options: MsgBoxOptions = {};
    const a = args[0];
    const b = args[1];
    const c = args[2];
    if (isObject(a)) {
      options = a;
    } else if (b === undefined) {
      options = {
        message: a,
      };
    } else if (isObject(b)) {
      if (type === 'confirm') {
        options = {
          ...b,
          message: a,
        };
      } else {
        options = {
          ...b,
          title: a,
        };
      }
    } else if (c === undefined) {
      options = {
        title: a,
        message: b,
      };
    } else if (isObject(c)) {
      options = {
        ...c,
        title: a,
        message: b,
      };
    }
    options.type = type;
    // @ts-ignore
    return new MessageBox().open(options);
  };
}

function initDialogs() {
  /**
   * $confirm(options)
   * $confirm(message, options?)
   * $confirm(title, message, options?)
   *
   * $prompt(options)
   * $prompt(title, options?)
   * $prompt(title, message, options?)
   */
  Vue.prototype.$confirm = makeMessageBox('confirm');
  Vue.prototype.$prompt = makeMessageBox('prompt');
}

export default function() {
  initMessage();
  initDialogs();
}
