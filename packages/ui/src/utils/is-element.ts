import type { ReactElement, ReactNode } from "react";
import { Fragment } from "react";

export const isElement = (value: ReactNode): value is ReactElement => {
  if (Array.isArray(value) || value == null) {
    return false;
  }

  if (typeof value === "object") {
    if ("type" in value && value.type === Fragment) {
      return false;
    }

    return true;
  }

  return false;
};
