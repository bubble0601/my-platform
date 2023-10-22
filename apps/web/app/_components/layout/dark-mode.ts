import { atom, useAtom } from "jotai";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
} from "react";
import { cookieStore } from "~/_utils/cookie-store";

const darkModeAtom = atom<boolean | undefined>(undefined);

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  const toggleDarkMode = () => {
    if (darkMode == null) return;

    const next = !darkMode;
    document.documentElement.classList.toggle("dark", next);
    setDarkMode(next);
    void cookieStore.set("darkMode", `${next}`);
  };

  const onLoad = useEffectEvent(async () => {
    const fromCookie = (await cookieStore.get("darkMode"))?.value;
    const initialDarkMode = fromCookie != null ? fromCookie === "true" : false;
    setDarkMode(initialDarkMode);
  });

  useEffect(() => {
    void onLoad();
  }, [onLoad]);

  return [darkMode, toggleDarkMode] as const;
};
