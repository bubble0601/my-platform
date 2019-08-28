import Vue from 'vue';

export interface Dict<T = any> {
  [key: string]: T;
}
export type Variant = '' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';

export interface MsgBoxOptions {
  type?: 'confirm' | 'prompt';
  title?: string;
  variant?: Variant;
  message?: string;
  inputLabel?: string;
  inputValue?: string;
  placeholder?: string;
  required?: boolean;
}

export interface MsgOptions {
  title?: string;
  message?: string;
  variant?: Variant;
  duration?: number;
  dismissible?: boolean;
}
