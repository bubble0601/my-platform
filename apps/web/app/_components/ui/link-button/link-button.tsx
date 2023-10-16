import { Button } from "@internal/ui";
import Link from "next/link";
import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ForwardedRef,
} from "react";
import { forwardRef } from "react";

type ButtonProps = Pick<
  ComponentPropsWithoutRef<typeof Button>,
  "icon" | "variant" | "color" | "size" | "rounded" | "fullWidth" | "disabled"
>;

type LinkButtonProps<T = unknown> = Omit<ComponentProps<"a">, "href"> &
  ButtonProps &
  (
    | {
        href: string;
        to?: never;
      }
    | {
        href?: never;
        to: ComponentProps<typeof Link<T>>["href"];
        scroll?: ComponentProps<typeof Link<T>>["scroll"];
        replace?: ComponentProps<typeof Link<T>>["replace"];
        prefetch?: ComponentProps<typeof Link<T>>["prefetch"];
      }
  );

const _LinkButton = function LinkButton<T>(
  {
    children,
    className,
    disabled,
    icon,
    variant,
    color,
    size,
    rounded,
    fullWidth,
    to,
    ...props
  }: LinkButtonProps<T>,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  const anchorProps = {
    ...props,
    "aria-disabled": disabled,
    tabIndex: disabled ? -1 : undefined,
  };
  const renderButton = (element: JSX.Element) => (
    <Button
      asChild
      className={className}
      disabled={disabled}
      icon={icon}
      variant={variant}
      color={color}
      size={size}
      rounded={rounded}
      fullWidth={fullWidth}
    >
      {element}
    </Button>
  );

  if (to != null) {
    return renderButton(
      <Link ref={ref} {...anchorProps} href={to}>
        {children}
      </Link>,
    );
  }

  return renderButton(
    <a ref={ref} {...anchorProps}>
      {children}
    </a>,
  );
};

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  _LinkButton,
) as typeof _LinkButton;
