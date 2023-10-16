import type { Meta, StoryObj } from "@storybook/react";
import { LinkButton } from ".";

const meta = {
  component: LinkButton,
  argTypes: {
    disabled: { control: "boolean" },
    rounded: {
      options: ["none", "default", "pill"],
    },
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof LinkButton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "LinkButton",
    href: "https://example.com",
    target: "_blank",
  },
};

export const Disabled: Story = {
  args: {
    children: "LinkButton",
    href: "https://example.com",
    target: "_blank",
    disabled: true,
  },
};
