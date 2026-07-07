import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "open letters — 每天早八,一封关于 AI 的信",
  description: "每天早上 8:00,一封关于 AI 的信。写给认真做产品的人。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
