"use client";

import { BsMoonStars, BsSun } from "react-icons/bs";
import { Button } from "~/_components/ui/button";
import { useDarkMode } from "../dark-mode";

type Props = {
  className?: string;
};

export const DarkModeToggle = ({ className }: Props) => {
  const [darkMode, toggleDarkMode] = useDarkMode();

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
