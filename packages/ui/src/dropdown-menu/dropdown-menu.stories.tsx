import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuKeybind,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from ".";

const meta = {
  component: DropdownMenu,
  args: {
    buttonContent: "Dropdown",
  },
  parameters: {
    permutation: {
      // autoload: [],
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState<boolean | "indeterminate">(
      "indeterminate",
    );
    const [radioValue, setRadioValue] = useState("red");
    return (
      <DropdownMenu {...args}>
        <DropdownMenuItem onSelect={action("Select Item 1")}>
          Item 1
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={action("Select Item 2")}>
          Item 2
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={action("Select Item 3")}>
          Item 3
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub menu item</DropdownMenuItem>
              <DropdownMenuItem>Sub menu item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Label</DropdownMenuLabel>
        <DropdownMenuItem>
          Item
          <DropdownMenuKeybind>⇧⌘K</DropdownMenuKeybind>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Checkbox</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={checked}
          onCheckedChange={setChecked}
        >
          Checkbox item
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={checked} disabled>
          Disabled Checkbox item
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Radio</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={radioValue}
          onValueChange={setRadioValue}
        >
          <DropdownMenuRadioItem value="red">Red</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="blue">Blue</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="disabled" disabled>
            Disabled
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenu>
    );
  },
};

export const TriggerPosition: Story = {
  render: () => {
    return (
      <div>
        <DropdownMenu
          buttonContent="Top left"
          buttonProps={{ className: "absolute left-1 top-1" }}
        >
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenu>
        <DropdownMenu
          buttonContent="Top right"
          buttonProps={{ className: "absolute right-1 top-1" }}
        >
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenu>
        <DropdownMenu
          buttonContent="Bottom left"
          buttonProps={{ className: "absolute left-1 bottom-1" }}
        >
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenu>
        <DropdownMenu
          buttonContent="Bottom right"
          buttonProps={{ className: "absolute right-1 bottom-1" }}
        >
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
                <DropdownMenuItem>Sub menu item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenu>
      </div>
    );
  },
};

export const TriggerType: Story = {
  render: () => {
    return (
      <div>
        <div>
          <DropdownMenu triggerType="click" buttonContent="Click">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenu>
          <DropdownMenu
            triggerType="hover"
            modal={false}
            buttonContent="Hover"
            buttonProps={{ className: "ml-2" }}
          >
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenu>
          <DropdownMenu
            triggerType="click"
            modal
            buttonContent="Click Modal"
            buttonProps={{ className: "ml-2" }}
          >
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    );
  },
};
