"use client";

import { Button } from "@internal/ui";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <Button
        onClick={() => {
          reset();
        }}
      >
        Try again
      </Button>
    </div>
  );
}