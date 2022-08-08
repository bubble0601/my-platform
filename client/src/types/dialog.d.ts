import { BtnProps, SnackbarProps, DialogProps } from './props';

export interface SnackbarOptions {
  message?: string;
  props?: SnackbarProps;
  closable?: boolean;
  closeType?: 'icon' | 'text';
}

export type SnackbarArgs = [string] | [SnackbarOptions] | [string, SnackbarOptions];

export type SnackbarCreator = ((...args: SnackbarArgs) => void) & {
  info: (...args: SnackbarArgs) => void;
  success: (...args: SnackbarArgs) => void;
  warn: (...args: SnackbarArgs) => void;
  error: (...args: SnackbarArgs) => void;
}

export interface ConfirmOptions {
  title?: string;
  message?: string;
  dialogProps?: DialogProps;
  okBtnText?: string;
  okBtnProps?: BtnProps;
  cancelBtnText?: string;
  cancelBtnProps?: BtnProps;
}

export interface PromptOptions {
  title?: string;
  message?: string;
  value?: string;
  dialogProps?: DialogProps;
  okBtnText?: string;
  okBtnProps?: BtnProps;
  cancelBtnText?: string;
  cancelBtnProps?: BtnProps;
}
