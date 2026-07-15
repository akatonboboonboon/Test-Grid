import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "暗記カード | ネットワーク | TEST//GRID",
  description: "手書き資料の①〜⑦に並ぶネットワーク用語を1枚ずつめくり、OSI層番号と正式名称を暗記するカードページ。",
};

export default function LegacyCardsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
