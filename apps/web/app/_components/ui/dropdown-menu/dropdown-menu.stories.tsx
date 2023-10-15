import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DropdownMenu } from ".";

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
        <DropdownMenu.Item onSelect={action("Select Item 1")}>
          Item 1
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={action("Select Item 2")}>
          Item 2
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={action("Select Item 3")}>
          Item 3
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Sub menu</DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
              <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Label</DropdownMenu.Label>
        <DropdownMenu.Item>
          Item
          <DropdownMenu.Keybind>⇧⌘K</DropdownMenu.Keybind>
        </DropdownMenu.Item>
        <DropdownMenu.Item disabled>Disabled item</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Checkbox</DropdownMenu.Label>
        <DropdownMenu.CheckboxItem
          checked={checked}
          onCheckedChange={setChecked}
        >
          Checkbox item
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem checked={checked} disabled>
          Disabled Checkbox item
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Radio</DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={radioValue}
          onValueChange={setRadioValue}
        >
          <DropdownMenu.RadioItem value="red">Red</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="blue">Blue</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="disabled" disabled>
            Disabled
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
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
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu>
        <DropdownMenu
          buttonContent="Top right"
          buttonProps={{ className: "absolute right-1 top-1" }}
        >
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu>
        <DropdownMenu
          buttonContent="Bottom left"
          buttonProps={{ className: "absolute left-1 bottom-1" }}
        >
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu>
        <DropdownMenu
          buttonContent="Bottom right"
          buttonProps={{ className: "absolute right-1 bottom-1" }}
        >
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
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
            <DropdownMenu.Item>Item 1</DropdownMenu.Item>
            <DropdownMenu.Item>Item 2</DropdownMenu.Item>
            <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          </DropdownMenu>
          <DropdownMenu
            triggerType="hover"
            modal={false}
            buttonContent="Hover"
            buttonProps={{ className: "ml-2" }}
          >
            <DropdownMenu.Item>Item 1</DropdownMenu.Item>
            <DropdownMenu.Item>Item 2</DropdownMenu.Item>
            <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          </DropdownMenu>
          <DropdownMenu
            triggerType="click"
            modal
            buttonContent="Click Modal"
            buttonProps={{ className: "ml-2" }}
          >
            <DropdownMenu.Item>Item 1</DropdownMenu.Item>
            <DropdownMenu.Item>Item 2</DropdownMenu.Item>
            <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          </DropdownMenu>
        </div>
      </div>
    );
  },
};
