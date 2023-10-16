"use client";

import { Separator } from "@radix-ui/react-dropdown-menu";
import { tv } from "tailwind-variants";
import { wrap } from "../utils/wrap";

const separator = tv({
  base: `bg-muted -mx-1 my-1 h-px`,
});

export const DropdownMenuSeparator = wrap(Separator)((props) => ({
  ...props,
  className: separator({ className: props.className }),
}));
