import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { env } from "./_utils/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: env.APP_NAME,
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default RootLayout;
