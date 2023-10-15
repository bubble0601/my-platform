import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Button } from "../button";

const button = tv({
  base: "h-auto w-auto",
});

type Props = Omit<
  ComponentPropsWithoutRef<typeof Button>,
  "icon" | "variant" | "rounded" | "size" | "color" | "fullWidth"
>;

export const AvatarButton = forwardRef<HTMLButtonElement, Props>(
  function AvatarButton({ className, ...props }, ref) {
    return (
      <Button
        ref={ref}
        {...props}
        icon
        rounded
        className={button({ className })}
      />
    );
  },
);
