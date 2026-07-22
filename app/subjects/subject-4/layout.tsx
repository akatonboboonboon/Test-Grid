import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "熱・流体力学・定期テスト演習 | TEST//GRID",
  description: "熱力学9枚の試験範囲を、冷凍・逆カルノーを含む公式カード、図付き計算演習、保存できるランダム模試、A4想定試験で学ぶ専用ページ。",
};

export default function ThermodynamicsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
