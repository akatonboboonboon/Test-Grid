import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "熱・流体力学・定期テスト演習 | TEST//GRID",
  description: "熱力学の試験範囲を、公式カード、単位付き計算演習、保存できるランダム模試、A4想定試験で学ぶ専用ページ。",
};

export default function ThermodynamicsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
