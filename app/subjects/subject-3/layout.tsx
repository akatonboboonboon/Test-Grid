import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "機械力学・定期テスト演習 | TEST//GRID",
  description: "機械力学の範囲ZIPと過去問を、公式カード、計算演習、保存できるランダム模試、A4想定試験で学ぶ専用ページ。",
};

export default function MechanicalDynamicsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
