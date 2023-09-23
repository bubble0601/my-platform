"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

export const ClientOnly = ({ children }: PropsWithChildren) => {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  if (isFirstRender) {
    return null;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
