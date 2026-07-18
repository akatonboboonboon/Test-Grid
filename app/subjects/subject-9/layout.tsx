import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "デジタル回路・定期テスト演習 | TEST//GRID",
  description: "現行範囲17ページを、図付き暗記帳、通常演習、解付き自動生成、ランダム模試、A4・50分の予想試験で学ぶデジタル回路専用ページ。",
};

export default function DigitalCircuitLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
