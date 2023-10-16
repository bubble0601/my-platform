import type { Meta, StoryObj } from "@storybook/react";
import { Button } from ".";

import { FaComment } from "react-icons/fa6";

const meta = {
  component: Button,
  argTypes: {
    disabled: { control: "boolean" },
    rounded: {
      options: ["none", "default", "pill"],
    },
    onClick: { action: "clicked" },
  },
  parameters: {
    permutation: {
      deactivate: ["type", "icon", "variant", "fullWidth", "asChild"],
      autoload: "all",
    },
  },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  args: {
    children: "Button",
    variant: "filled",
  },
};

export const Outline: Story = {
  args: {
    children: "Button",
    variant: "outline",
  },
};

export const Subtle: Story = {
  args: {
    children: "Button",
    variant: "subtle",
  },
};

export const FullWidth: Story = {
  args: {
    children: "Button",
  },
  parameters: {
    permutation: {
      autoload: false,
    },
  },
  render: (args) => (
    <div className="w-full">
      <Button {...args}>Default width</Button>
      <div className="my-2" />
      <Button {...args} fullWidth>
        Full width
      </Button>
    </div>
  ),
};

export const FilledIcon: Story = {
  args: {
    children: <FaComment />,
    icon: true,
    variant: "filled",
  },
};

export const OutlineIcon: Story = {
  args: {
    children: <FaComment />,
    icon: true,
    variant: "outline",
  },
};

export const SubtleIcon: Story = {
  args: {
    children: <FaComment />,
    icon: true,
    variant: "subtle",
  },
};

export const Withicon: Story = {
  args: {
    children: [<FaComment />, "Button"],
  },
};
