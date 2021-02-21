import { Size } from '@/store/view';

export type Variant = '' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';

export interface MsgOptions {
  title?: string;
  message?: string;
  variant?: Variant;
  duration?: number;
  dismissible?: boolean;
}

type MessageArgs =
  [MsgOptions] |
  [string, MsgOptions?] |
  [string, string, MsgOptions?] |
  [Variant, string, string, MsgOptions?];


export interface MsgBoxOptions {
  type?: 'confirm' | 'prompt';
  title?: string;
  variant?: Variant;
  scrollable?: boolean;
  message?: string;
  pre?: boolean;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  okText?: string;
  cancelText?: string;
}

type MsgBoxArgs =
  [MsgBoxOptions] |
  [string, MsgBoxOptions?] |
  [string, string, MsgBoxOptions?];

declare module 'vue/types/vue' {
  interface Vue {
    // dialogs
    $message: {
      (...args: MessageArgs): void,
      info: (...args: MessageArgs) => void,
      success: (...args: MessageArgs) => void,
      warn: (...args: MessageArgs) => void,
      error: (...args: MessageArgs) => void,
    };
    $confirm: (...args: MsgBoxArgs) => Promise<undefined>;
    $prompt: (...args: MsgBoxArgs) => Promise<string>;

    // responsive
    $mobile: boolean;
    $pc: boolean;
    $from: (size: Size) => boolean;
    $until: (size: Size) => boolean;
  }
}

export interface ContextMenuItem {
  key: string | number;
  text: string;
  action?: () => void;
  children?: Array<{
    key: string | number,
    text: string,
    action: () => void,
  }>;
}
