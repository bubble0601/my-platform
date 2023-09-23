import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  useState,
  type ComponentProps,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
import { tv } from "tailwind-variants";
import { Button } from "../button";

type Props = Omit<
  ComponentProps<typeof DropdownMenuPrimitive.Root>,
  "children"
> &
  PropsWithChildren<{
    className?: string;
    trigger?: ReactElement;
    buttonProps?: ComponentProps<typeof Button>;
    buttonContent?: ReactNode;
  }>;

const dropDownMenu = tv({
  base: "",
});

const DropDownMenu = ({
  children,
  className,
  trigger,
  buttonProps,
  buttonContent,
  ...props
}: Props) => {1
  const [open, setOpen] = useState(false);

  const rootProps: ComponentProps<typeof DropdownMenuPrimitive.Root> =
    props.open === undefined
      ? {
          ...props,
          open,
          onOpenChange: setOpen,
        }
      : props;

  return (
    <DropdownMenuPrimitive.Root {...rootProps}>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger ?? <Button {...buttonProps}>{buttonContent}</Button>}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content className={dropDownMenu({ className })}>
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

const _DropdownMenu = Object.assign(DropDownMenu, {
  Portal: DropdownMenuPrimitive.Portal,
  Label: DropdownMenuPrimitive.Label,
  Item: DropdownMenuPrimitive.Item,
  Group: DropdownMenuPrimitive.Group,
  CheckboxItem: DropdownMenuPrimitive.CheckboxItem,
  ItemIndicator: DropdownMenuPrimitive.ItemIndicator,
  RadioGroup: DropdownMenuPrimitive.RadioGroup,
  RadioItem: DropdownMenuPrimitive.RadioItem,
  Sub: DropdownMenuPrimitive.Sub,
  SubTrigger: DropdownMenuPrimitive.SubTrigger,
  SubContent: DropdownMenuPrimitive.SubContent,
  Separator: DropdownMenuPrimitive.Separator,
  Arrow: DropdownMenuPrimitive.Arrow,
});

export { _DropdownMenu as DropdownMenu };
