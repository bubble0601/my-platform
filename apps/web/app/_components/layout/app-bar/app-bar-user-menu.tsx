import { LinkButton } from "~/_components/ui/button";
import { getSession } from "~/_utils/server";

export const AppBarUserMenu = async () => {
  const session = await getSession();

  if (!session) {
    return <LinkButton to="/login">ログイン</LinkButton>;
  }

  return <LinkButton to="/login">ログイン</LinkButton>;
};
