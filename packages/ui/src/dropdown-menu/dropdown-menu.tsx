"use client";

import type {
  DropdownMenuContentProps,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuPortal,
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  useRef,
  useState,
  type ComponentProps,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { tv } from "tailwind-variants";
import { Button } from "../button";
import { composeEventHandlers } from "../utils/compose-handlers";
import { DropdownMenuContent } from "./dropdown-menu-content";

type Props = Omit<DropdownMenuProps, "children" | "modal"> &
  PropsWithChildren<
    {
      className?: string;
      triggerProps?: DropdownMenuTriggerProps;
      contentProps?: DropdownMenuContentProps;
    } & Xor<
      {
        trigger?: JSX.Element;
      },
      {
        buttonProps?: ComponentProps<typeof Button>;
        buttonContent?: ReactNode;
      }
    > &
      (
        | {
            triggerType?: "click";
            modal?: boolean;
          }
        | {
            triggerType: "hover";
            modal?: false;
          }
      )
  >;

const dropDownMenu = tv({
  base: "",
});

export const DropdownMenu = ({
  children,
  className,
  trigger,
  triggerType = "click",
  triggerProps,
  buttonProps,
  buttonContent,
  contentProps,
  modal = false,
  ...props
}: Props) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const rootProps: DropdownMenuProps =
    props.open === undefined
      ? {
          ...props,
          open,
          onOpenChange: setOpen,
          modal: triggerType === "hover" ? false : modal,
        }
      : {
          ...props,
          modal: triggerType === "hover" ? false : modal,
        };

  return (
    <DropdownMenuRoot {...rootProps}>
      <DropdownMenuTrigger
        {...triggerProps}
        ref={triggerRef}
        asChild={trigger ? triggerProps?.asChild : true}
        onPointerEnter={composeEventHandlers(
          triggerProps?.onPointerEnter,
          () => {
            if (triggerType === "hover") {
              setOpen(true);
            }
          },
        )}
        onPointerLeave={composeEventHandlers(
          triggerProps?.onPointerLeave,
          (e) => {
            if (
              triggerType === "hover" &&
              !(
                e.relatedTarget instanceof Node &&
                contentRef.current?.contains(e.relatedTarget)
              )
            ) {
              setOpen(false);
            }
          },
        )}
        onClick={composeEventHandlers(triggerProps?.onClick, () => {
          if (triggerType === "click") {
            setOpen((prev) => !prev);
          }
        })}
        onPointerDown={composeEventHandlers(
          triggerProps?.onPointerDown,
          (e) => {
            e.preventDefault();
          },
        )}
      >
        {trigger ?? <Button {...buttonProps}>{buttonContent}</Button>}
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          {...contentProps}
          ref={contentRef}
          className={dropDownMenu({ className })}
          onPointerDownOutside={composeEventHandlers(
            contentProps?.onPointerDownOutside,
            (e) => {
              if (
                !modal &&
                e.target instanceof Node &&
                triggerRef.current?.contains(e.target)
              ) {
                e.preventDefault();
              }
            },
          )}
          onFocusOutside={composeEventHandlers(
            contentProps?.onFocusOutside,
            (e) => {
              if (!modal) {
                e.preventDefault();
              }
            },
          )}
          onPointerLeave={composeEventHandlers(
            contentProps?.onPointerLeave,
            (e) => {
              if (
                triggerType === "hover" &&
                e.relatedTarget !== triggerRef.current
              ) {
                setOpen(false);
              }
            },
          )}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
