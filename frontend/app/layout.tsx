import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ChatFlow — Real-time chat for remote teams",
  description: "Fast, minimal team chat. Built with Next.js & Socket.io.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-zinc-900 dark:bg-background dark:text-zinc-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
