import "@internal/ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { env } from "./_utils/server";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: env.APP_NAME,
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  const isDarkMode = cookies().get("darkMode")?.value === "true";
  return (
    <html lang="ja" className={isDarkMode ? "dark" : undefined}>
      <body
        className={`${inter.className} bg-zinc-50 text-black dark:bg-zinc-950 dark:text-white`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
