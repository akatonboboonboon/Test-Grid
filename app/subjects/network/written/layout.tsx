import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ネットワーク本試験・20文字記述練習 | TEST//GRID",
  description: "ネットワーク範囲.pdf（2026-07-24）の正式50語から選び、OSI層と20文字以上の日本語説明を答える本試験形式の練習ページ。",
};

export default function NetworkWrittenLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
