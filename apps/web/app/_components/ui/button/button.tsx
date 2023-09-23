import Link from "next/link";
import type { ComponentProps, ForwardedRef } from "react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { isTruthy } from "~/_utils/guard";

type ButtonVariant = "filled" | "outline" | "subtle";

type ButtonColor = "default" | "indigo" | "red" | "green" | "amber";

const baseButton = tv({
  base: `
    inline-flex select-none items-center justify-center font-medium transition-colors
    hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 active:translate-y-px
    active:opacity-80
    `,
  variants: {
    size: {
      xs: "h-6 px-3 text-xs",
      sm: "h-8 px-4 text-sm",
      md: "h-9 px-6",
      lg: "h-10 px-8",
      xl: "h-12 px-10",
      "icon-xs": "h-6 w-6 text-xs",
      "icon-sm": "h-8 w-8 text-sm",
      "icon-md": "h-9 w-9",
      "icon-lg": "h-10 w-10",
      "icon-xl": "h-12 w-12",
    },
    rounded: {
      none: "rounded-none",
      default: "rounded-md",
      pill: "rounded-full",
    },
    disabled: {
      true: "pointer-events-none cursor-default opacity-50",
    },
  },
});

const filledButton = tv({
  extend: baseButton,
  variants: {
    color: {
      default: "bg-zinc-300 text-zinc-950 dark:bg-zinc-600 dark:text-white",
      indigo: "bg-indigo-500 text-white dark:bg-indigo-700",
      red: "bg-red-600 text-white dark:bg-red-800",
      green: "bg-green-600 text-white dark:bg-green-800",
      amber: "bg-amber-600 text-white dark:bg-amber-800",
    },
  },
});

const outlineButton = tv({
  extend: baseButton,
  base: "border",
  variants: {
    color: {
      default:
        "border-zinc-600 text-zinc-600 hover:bg-zinc-600/5 dark:border-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-400/5",
      indigo: "border-indigo-500 text-indigo-500 hover:bg-indigo-500/5",
      red: "border-red-600 text-red-600 hover:bg-red-600/5",
      green: "border-green-600 text-green-600 hover:bg-green-600/5",
      amber: "border-amber-600 text-amber-600 hover:bg-amber-600/5",
    },
  },
});

const subtleButton = tv({
  extend: baseButton,
  variants: {
    color: {
      default:
        "text-zinc-600 hover:bg-zinc-600/20 dark:text-zinc-400 dark:hover:bg-zinc-400/20",
      indigo:
        "text-indigo-600 hover:bg-indigo-600/20 dark:text-indigo-400 dark:hover:bg-indigo-400/20",
      red: "text-red-700 hover:bg-red-700/20 dark:text-red-500 dark:hover:bg-red-500/20",
      green:
        "text-green-700 hover:bg-green-700/20 dark:text-green-500 dark:hover:bg-green-500/20",
      amber:
        "text-amber-700 hover:bg-amber-700/20 dark:text-amber-500 dark:hover:bg-amber-500/20",
    },
  },
});

const button = ({
  variant,
  ...props
}: { variant: ButtonVariant; color: ButtonColor } & Parameters<
  typeof baseButton
>[0]) => {
  switch (variant) {
    case "filled": {
      return filledButton(props);
    }
    case "outline": {
      return outlineButton(props);
    }
    case "subtle": {
      return subtleButton(props);
    }
    default: {
      return baseButton(props);
    }
  }
};

type BaseButtonProps = {
  icon?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rounded?: true | keyof typeof baseButton.variants.rounded;
  fullWidth?: boolean;
};

type ButtonProps = ComponentProps<"button"> & BaseButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      type = "button",
      disabled,
      icon = false,
      variant = "filled",
      color = "default",
      size = "md",
      rounded = "default",
      fullWidth = false,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        // eslint-disable-next-line react/button-has-type
        type={type}
        className={button({
          disabled,
          variant,
          color,
          size: icon ? `icon-${size}` : size,
          rounded: rounded === true ? "pill" : rounded,
          className: [className, fullWidth && "w-full"]
            .filter(isTruthy)
            .join(" "),
        })}
        disabled={disabled}
        {...props}
      />
    );
  },
);

type LinkButtonProps<T = unknown> = Omit<ComponentProps<"a">, "href"> &
  BaseButtonProps & {
    disabled?: boolean;
  } & (
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
    icon = false,
    variant = "filled",
    color = "default",
    size = "md",
    rounded = "default",
    fullWidth = false,
    to,
    ...props
  }: LinkButtonProps<T>,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  const element = (
    <a
      ref={ref}
      className={button({
        disabled,
        variant,
        color,
        size: icon ? `icon-${size}` : size,
        rounded: rounded === true ? "pill" : rounded,
        className: ["cursor-pointer", fullWidth && "w-full", className]
          .filter(isTruthy)
          .join(" "),
      })}
      {...props}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </a>
  );

  if (to != null) {
    return (
      <Link href={to} passHref legacyBehavior>
        {element}
      </Link>
    );
  }

  return element;
};

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  _LinkButton,
) as typeof _LinkButton;
