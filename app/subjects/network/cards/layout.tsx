import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "暗記カード | ネットワーク | TEST//GRID",
  description: "手書き資料の①〜⑦に並ぶネットワーク用語を1枚ずつめくり、OSI層番号を暗記するカードページ。",
};

export default function CardsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
