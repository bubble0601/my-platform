import type { PropsWithChildren } from "react";
import { AppBar } from "./app-bar";

type Props = PropsWithChildren<{
  hideUserMenu?: boolean;
}>;

export const CommonLayout = ({ children, hideUserMenu }: Props) => {
  return (
    <div className="flex h-screen flex-col">
      <AppBar hideUserMenu={hideUserMenu} className="px-2 lg:px-10" />
      <main className="grow">{children}</main>
    </div>
  );
};
