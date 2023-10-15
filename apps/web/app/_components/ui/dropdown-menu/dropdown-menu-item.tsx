import { Item } from "@radix-ui/react-dropdown-menu";
import { tv } from "tailwind-variants";
import { wrap } from "~/_utils/client/wrap";

const menuItem = tv({
  base: `focus:bg-accent focus:text-accent-foreground relative flex
    cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
    aria-disabled:pointer-events-none aria-disabled:opacity-50`,
  variants: {
    inset: {
      true: "pl-8",
    },
  },
});

export const DropdownMenuItem = wrap(Item)<{ inset?: boolean }>(
  ({ inset, ...props }) => ({
    ...props,
    className: menuItem({ inset, className: props.className }),
  }),
);
