"use client";

import type { AvatarImageProps } from "@radix-ui/react-avatar";
import { Avatar as AvatarRoot, Fallback, Image } from "@radix-ui/react-avatar";
import type { PropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { RxAvatar } from "react-icons/rx";
import { tv } from "tailwind-variants";

const avatar = tv({
  base: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border",
});

const avatarImage = tv({
  base: "aspect-square h-full w-full",
});

const avatarFallback = tv({
  base: "bg-muted flex h-full w-full items-center justify-center rounded-full",
});

type Props = Omit<PropsWithoutRef<AvatarImageProps>, "children"> & {
  fallback?: ReactNode;
  fallbackDelayMs?: number;
};

export const Avatar = forwardRef<HTMLSpanElement, Props>(function Avatar(
  { fallback, fallbackDelayMs, className, ...props },
  ref,
) {
  return (
    <AvatarRoot ref={ref} className={avatar()}>
      <Image {...props} className={avatarImage({ className })} />
      <Fallback className={avatarFallback()} delayMs={fallbackDelayMs}>
        {fallback ?? <RxAvatar className="h-5/6 w-5/6 opacity-60" />}
      </Fallback>
    </AvatarRoot>
  );
});
