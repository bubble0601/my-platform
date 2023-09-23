import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
} from "react";

const initialValue =
  // eslint-disable-next-line unicorn/no-negated-condition
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

const darkModeAtom = atomWithStorage("darkMode", initialValue);

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const onLoad = useEffectEvent(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  });

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return [darkMode, toggleDarkMode] as const;
};
