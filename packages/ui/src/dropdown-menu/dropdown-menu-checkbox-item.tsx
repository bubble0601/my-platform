"use client";

import { CheckboxItem, ItemIndicator } from "@radix-ui/react-dropdown-menu";
import { RxCheck, RxDividerHorizontal } from "react-icons/rx";
import { tv } from "tailwind-variants";
import { composeEventHandlers } from "../utils/compose-handlers";
import { wrap } from "../utils/wrap";

const checkboxItem = tv({
  base: `focus:bg-accent focus:text-accent-foreground
    relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors
    aria-disabled:pointer-events-none aria-disabled:opacity-50`,
});

export const DropdownMenuCheckboxItem = wrap(CheckboxItem)<{
  closeOnClick?: boolean;
}>(({ closeOnClick = false, ...props }) => ({
  ...props,
  className: checkboxItem({ className: props.className }),
  children: [
    // eslint-disable-next-line react/jsx-key
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        {props.checked === "indeterminate" ? (
          <RxDividerHorizontal className="h-4 w-4" />
        ) : (
          <RxCheck className="h-4 w-4" />
        )}
      </ItemIndicator>
    </span>,
    props.children,
  ],
  onSelect: composeEventHandlers(props.onSelect, (e) => {
    if (!closeOnClick) {
      e.preventDefault();
    }
  }),
}));
