import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CommonLayout } from "~/_components/layout/common-layout";
import { getSession } from "~/_utils/server";

type Props = {
  children: ReactNode;
};

export default async function Layout({ children }: Props) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return <CommonLayout>{children}</CommonLayout>;
}
