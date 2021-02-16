import { Size } from '@/store/view';

declare module 'vue/types/vue' {
  interface Vue {
    $mobile: boolean;
    $pc: boolean;
    $from: (size: Size) => boolean;
    $until: (size: Size) => boolean;
  }
}

export type Variant = '' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';

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

export interface MsgOptions {
  title?: string;
  message?: string;
  variant?: Variant;
  duration?: number;
  dismissible?: boolean;
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
