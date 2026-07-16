import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "応用数学・定期テスト演習 | TEST//GRID",
  description: "範囲ZIPの16画像を、数式カード、計算演習、A4・50分・80点満点の予想試験6回で学ぶ応用数学専用ページ。",
};

export default function AppliedMathLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
