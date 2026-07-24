import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "暗記カード | ネットワーク | TEST//GRID",
  description: "2026-07-24正式範囲PDFのネットワーク50項目を1枚ずつめくり、OSI層番号・正式名称・働きを暗記するカードページ。",
};

export default function LegacyCardsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
