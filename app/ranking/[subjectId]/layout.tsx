import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "教科別・連続正解ランキング | TEST//GRID",
  description: "問題数の上限なく1問ごとの即時採点と解説で進み、中断後も連続正解数を引き継げる教科別ランキング。",
};

export default function OfficialRankingSubjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
