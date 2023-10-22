"use client";

import { Button } from "@internal/ui";
import { BsMoonStars, BsSun } from "react-icons/bs";
import { useDarkMode } from "../dark-mode";

type Props = {
  className?: string;
};

export const DarkModeToggle = ({ className }: Props) => {
  const [darkMode, toggleDarkMode] = useDarkMode();

  if (darkMode == null) return null;

  return (
    <Button
      className={className}
      icon
      variant="subtle"
      onClick={toggleDarkMode}
    >
      {darkMode ? <BsMoonStars /> : <BsSun />}
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  );
};
