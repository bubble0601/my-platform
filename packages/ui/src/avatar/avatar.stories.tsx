import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "./avatar";
import { AvatarButton } from "./avatar-button";

const meta = {
  component: Avatar,
} satisfies Meta<typeof Avatar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return (
      <div className="flex gap-x-1">
        <Avatar
          src="https://github.com/faker-js.png"
          alt="@faker-js"
          fallback="FB"
        />
        <Avatar fallback="FB" fallbackDelayMs={500} />
        <Avatar />
      </div>
    );
  },
};

export const Button: Story = {
  render: () => {
    return (
      <div className="flex gap-x-2">
        <AvatarButton>
          <Avatar
            src="https://github.com/faker-js.png"
            alt="@faker-js"
            fallback="FB"
          />
        </AvatarButton>
        <AvatarButton>
          <Avatar fallback="FB" fallbackDelayMs={500} />
        </AvatarButton>
        <AvatarButton>
          <Avatar />
        </AvatarButton>
      </div>
    );
  },
};
