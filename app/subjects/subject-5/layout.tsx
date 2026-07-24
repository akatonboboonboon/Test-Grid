import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "材料力学・定期テスト演習 | TEST//GRID",
  description: "材料力学の範囲資料15枚（ZIP13枚＋補足2枚）を正本に、ねじり・軸設計・コイルばね・はり計算と補足指定問2・5・7・10を学ぶ専用ページ。補足プリントの他設問と、EIたわみ・曲率・カスティリアーノの定理は対象外。",
};

export default function MaterialMechanicsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
