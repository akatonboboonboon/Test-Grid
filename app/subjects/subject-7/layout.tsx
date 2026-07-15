import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "確率統計・定期テスト演習 | TEST//GRID",
  description: "試験範囲の公式暗記、単元別計算演習、保存して再開できる模擬テストをまとめた確率統計専用ページ。",
};

export default function StatisticsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
