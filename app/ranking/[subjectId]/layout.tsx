import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "教科別・公式ランキングテスト | TEST//GRID",
  description: "固定20問・固定総時間・同一問題セットをサーバー採点する教科別の公式ランキングテスト。",
};

export default function OfficialRankingSubjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
