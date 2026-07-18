import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "材料力学・定期テスト演習 | TEST//GRID",
  description: "材料力学の範囲ZIP9枚と形式2の範囲一致部を、公式カード、図付き計算演習、保存できるランダム模試、A4想定試験で学ぶ専用ページ。",
};

export default function MaterialMechanicsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
