import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";

const keybind = tv({
  base: `ml-auto text-xs tracking-widest opacity-60`,
});

export const DropdownMenuKeybind = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<"span">
>(function DropdownMenuKeybind({ children, className, ...props }, ref) {
  return (
    <span ref={ref} className={keybind({ className })} {...props}>
      {children}
    </span>
  );
});
