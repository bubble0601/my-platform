import {
  Avatar,
  AvatarButton,
  DropdownMenu,
  DropdownMenuItem,
} from "@internal/ui";
import { LinkButton } from "~/_components/ui/link-button";
import { getSession } from "~/_utils/server";

export const AppBarUserMenu = async () => {
  const session = await getSession();

  if (!session) {
    return <LinkButton to="/login">ログイン</LinkButton>;
  }

  return (
    <DropdownMenu
      trigger={
        <AvatarButton>
          <Avatar />
        </AvatarButton>
      }
      triggerProps={{ asChild: true }}
    >
      <DropdownMenuItem>item 1</DropdownMenuItem>
      <DropdownMenuItem>item 2</DropdownMenuItem>
    </DropdownMenu>
  );
};
