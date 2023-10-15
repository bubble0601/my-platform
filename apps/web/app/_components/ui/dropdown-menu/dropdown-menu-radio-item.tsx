import { ItemIndicator, RadioItem } from "@radix-ui/react-dropdown-menu";
import { RxDotFilled } from "react-icons/rx";
import { tv } from "tailwind-variants";
import { composeEventHandlers } from "~/_utils/client/compose-handlers";
import { wrap } from "~/_utils/client/wrap";

const radioItem = tv({
  base: `focus:bg-accent focus:text-accent-foreground
    relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors
    aria-disabled:pointer-events-none aria-disabled:opacity-50`,
});

export const DropdownMenuRadioItem = wrap(RadioItem)<{
  closeOnClick?: boolean;
}>(({ closeOnClick = false, ...props }) => ({
  ...props,
  className: radioItem({ className: props.className }),
  children: [
    // eslint-disable-next-line react/jsx-key
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <RxDotFilled className="h-4 w-4 fill-current" />
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
