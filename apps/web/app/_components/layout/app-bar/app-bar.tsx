import { tv } from "tailwind-variants";
import { ClientOnly } from "../client-only";
import { AppBarTitle } from "./app-bar-title";
import { AppBarUserMenu } from "./app-bar-user-menu";
import { DarkModeToggle } from "./dark-mode-toggle";

const appBar = tv({
  base: "flex flex-row items-center border-b border-zinc-400/20 dark:border-b-0 dark:bg-zinc-900",
});

type Props = {
  className?: string;
};

export const AppBar = ({ className }: Props) => {
  return (
    <header className={appBar({ className })}>
      <AppBarTitle />
      <div className="grow" />
      <ClientOnly>
        <DarkModeToggle className="mr-2" />
      </ClientOnly>
      <AppBarUserMenu />
    </header>
  );
};
