import { Route } from 'vue-router';

interface SizeProps {
  height?: number | string;
  width?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
}

interface PlacementProps {
  elevation?: number | string;
  absolute?: boolean;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

interface StyleProps {
  color?: string;
  light?: boolean;
  dark?: boolean;
  outlined?: boolean;
  rounded?: boolean;
  shaped?: boolean;
}

interface LinkProps {
  href?: string;
  target?: string;

  to?: string | Route;
  // to?: string;
  activeClass?: string;
  exact?: boolean;
  exactActiveClass?: string;
  append?: boolean;
  replace?: boolean;
  nuxt?: boolean;
}

type BaseBtnProps = SizeProps & PlacementProps & StyleProps & LinkProps;

export interface BtnProps extends BaseBtnProps {
  tag?: string;
  text?: boolean;

  xSmall?: boolean;
  small?: boolean;
  large?: boolean;
  xLarge?: boolean;

  block?: boolean;
  depressed?: boolean;
  disabled?: boolean;
  fab?: boolean;
  fixed?: boolean;
  icon?: boolean;
  link?: boolean;
  loading?: boolean;
  plain?: boolean;
  retainFocusOnClick?: boolean;
  ripple?: boolean;
  tile?: boolean;
  type?: string;
}

type BaseSnackbarProps = SizeProps & PlacementProps & StyleProps;

export interface SnackbarProps extends BaseSnackbarProps {
  tag?: string;
  text?: boolean;

  app?: boolean;
  centered?: boolean;
  contentClass?: string;
  multiLine?: boolean;
  timeout?: number | string;
  transition?: boolean | string;
  vertical?: boolean;
}

export interface DialogProps {
  light?: boolean;
  dark?: boolean;
  width?: number | string;
  maxWidth?: number | string;

  closeDelay?: number | string;
  contentClass?: string;
  disabled?: boolean;
  eager?: boolean;
  fullscreen?: boolean;
  hideOverlay?: boolean;
  internalActivator?: boolean;
  noClickAnimation?: boolean;
  openDelay?: number | string;
  origin?: string;
  overlayColor?: string;
  overlayOpacity?: number | string;
  persistent?: boolean;
  retainFocus?: boolean;
  scrollable?: boolean;
  transition?: string | boolean;
}
