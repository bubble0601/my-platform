import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BsCheck } from "react-icons/bs";
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
    const [checked, setChecked] = useState(false);
    const [radioValue, setRadioValue] = useState("red");
    return (
      <DropdownMenu {...args}>
        <DropdownMenu.Item
          onSelect={() => {
            console.log("Item 1");
          }}
        >
          Item 1
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => {
            console.log("Item 2");
          }}
        >
          Item 2
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => {
            console.log("Item 3");
          }}
        >
          Item 3
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Sub menu →</DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
              <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
              <DropdownMenu.Arrow />
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Label</DropdownMenu.Label>
        <DropdownMenu.Item>Item</DropdownMenu.Item>
        <DropdownMenu.Item>Item</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem
          checked={checked}
          onCheckedChange={setChecked}
        >
          <DropdownMenu.ItemIndicator>
            <BsCheck />
          </DropdownMenu.ItemIndicator>
          Checkbox item
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.RadioGroup
          value={radioValue}
          onValueChange={setRadioValue}
        >
          <DropdownMenu.RadioItem value="red">
            <DropdownMenu.ItemIndicator>
              <BsCheck />
            </DropdownMenu.ItemIndicator>
            Red
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="blue">
            <DropdownMenu.ItemIndicator>
              <BsCheck />
            </DropdownMenu.ItemIndicator>
            Blue
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="green">
            <DropdownMenu.ItemIndicator>
              <BsCheck />
            </DropdownMenu.ItemIndicator>
            Green
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu>
    );
  },
};

export const TriggerPosition: Story = {
  render: (args) => {
    return (
      <div>
        <DropdownMenu
          {...args}
          buttonContent="Top left"
          buttonProps={{ className: "absolute left-1 top-1" }}
        >
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu →</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Arrow />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu>
        <DropdownMenu
          {...args}
          buttonContent="Top right"
          buttonProps={{ className: "absolute right-1 top-1" }}
        >
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu →</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Arrow />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu>
        <DropdownMenu
          {...args}
          buttonContent="Bottom left"
          buttonProps={{ className: "absolute left-1 bottom-1" }}
        >
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu →</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Arrow />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu>
        <DropdownMenu
          {...args}
          buttonContent="Bottom right"
          buttonProps={{ className: "absolute right-1 bottom-1" }}
        >
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Sub menu →</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Item>Sub menu item</DropdownMenu.Item>
                <DropdownMenu.Arrow />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu>
      </div>
    );
  },
};
