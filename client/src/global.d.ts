import { ConfirmOptions, PromptOptions, SnackbarCreator } from '@/types';
import { Component } from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $snackbar: SnackbarCreator;
    $confirm: (options: ConfirmOptions) => Promise<undefined>;
    $prompt: (options: PromptOptions) => Promise<string>;

    $pc: boolean;
    $mobile: boolean;
    $sm: boolean;
    $md: boolean;
    $lg: boolean;
    $xl: boolean;
    $dark: boolean;
    $light: boolean;
    $webkit: boolean;
    $scrollbarWidth: number;
  }
}

declare module 'vuetify/lib/components' {
  type VForm = Component & {
    validate(): boolean;
    reset(): void;
    resetValidation(): void;
  }
}

// User-Agent Client Hints
interface NavigatorUABrandVersion {
  brand: string;
  version: string;
}

interface UADataValues {
  architecture: string;
  bitness: string;
  model: string;
  platform: string;
  platformVersion: string;
  uaFullVersion: string;
}

declare global {
  interface Navigator {
    readonly userAgentData?: {
      readonly brands?: NavigatorUABrandVersion[],
      readonly mobile: boolean,
      getHighEntropyValues<T extends keyof UADataValues>(hints: T[]): Promise<{ [key in T]: UADataValues[T] }>,
    };
  }
}
