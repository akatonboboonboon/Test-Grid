import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "確率統計・定期テスト演習 | TEST//GRID",
  description: "ZIPと演習PDF4冊の全範囲を、数式カード、計算演習、A4・50分・100点満点の想定試験12回で学ぶ確率統計専用ページ。",
};

export default function StatisticsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
