import { Content } from "@radix-ui/react-dropdown-menu";
import { tv } from "tailwind-variants";
import { wrap } from "~/_utils/client/wrap";

const content = tv({
  base: `bg-popover text-popover-foreground
    data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95
    data-bottom:slide-in-from-top-2 data-left:slide-in-from-right-2 data-right:slide-in-from-left-2 data-top:slide-in-from-bottom-2
    min-w-32 z-50 overflow-hidden rounded-md border p-1 shadow-md`,
});

export const DropdownMenuContent = wrap(Content)((props) => ({
  ...props,
  className: content({ className: props.className }),
}));
