import type { PropsWithChildren } from "react";
import { CommonLayout } from "~/_components/layout/common-layout";

type Props = PropsWithChildren;

export default function Layout({ children }: Props) {
  return <CommonLayout>{children}</CommonLayout>;
}
