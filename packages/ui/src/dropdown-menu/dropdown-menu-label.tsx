"use client";

import { Label } from "@radix-ui/react-dropdown-menu";
import { tv } from "tailwind-variants";
import { wrap } from "../utils/wrap";

const menuLabel = tv({
  base: `text-muted-foreground px-2 py-1.5 text-sm font-semibold`,
  variants: {
    inset: {
      true: "pl-8",
    },
  },
});

export const DropdownMenuLabel = wrap(Label)<{ inset?: boolean }>(
  ({ inset, ...props }) => ({
    ...props,
    className: menuLabel({ inset, className: props.className }),
  }),
);
