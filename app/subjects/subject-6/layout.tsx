import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スマート制御・定期テスト演習 | TEST//GRID",
  description: "範囲ZIPと過去問2の重複範囲を、数式カード、演習、保存できるランダム模試、A4想定試験で学ぶスマート制御専用ページ。",
};

export default function SmartControlLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
