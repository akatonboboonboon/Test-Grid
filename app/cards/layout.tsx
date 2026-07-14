import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "暗記カード | LAYER//SUM",
  description: "Pで終わるネットワーク用語を1枚ずつめくり、OSI層番号を暗記するカードページ。",
};

export default function CardsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
