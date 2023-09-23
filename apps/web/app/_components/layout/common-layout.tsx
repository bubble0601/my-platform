import type { PropsWithChildren } from "react";
import { AppBar } from "./app-bar";

type Props = PropsWithChildren;

export const CommonLayout = ({ children }: Props) => {
  return (
    <div className="flex h-screen flex-col">
      <AppBar className="p-2 lg:px-10" />
      <main>{children}</main>
    </div>
  );
};
