import { SubTrigger } from "@radix-ui/react-dropdown-menu";
import { RxChevronRight } from "react-icons/rx";
import { tv } from "tailwind-variants";
import { wrap } from "~/_utils/client/wrap";

const subTrigger = tv({
  base: "focus:bg-accent aria-expanded:bg-accent flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
  variants: {
    inset: {
      true: "pl-8",
    },
  },
});

export const DropdownMenuSubTrigger = wrap(SubTrigger)<{ inset?: boolean }>(
  ({ inset, ...props }) => ({
    ...props,
    className: subTrigger({ inset, className: props.className }),
    // eslint-disable-next-line react/jsx-key
    children: [props.children, <RxChevronRight className="ml-auto h-4 w-4" />],
  }),
);
