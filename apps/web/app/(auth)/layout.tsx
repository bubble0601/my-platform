import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "~/_utils/server";

type Props = {
  children: ReactNode;
};

export default async function Layout({ children }: Props) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div>
      <h1>My App</h1>
      {children}
    </div>
  );
}
