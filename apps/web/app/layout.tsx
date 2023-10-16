import "@internal/ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { env } from "./_utils/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: env.APP_NAME,
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} bg-zinc-50 text-black dark:bg-zinc-950 dark:text-white`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
