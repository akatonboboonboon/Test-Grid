import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "材料力学・定期テスト演習 | TEST//GRID",
  description: "材料力学の範囲ZIP13ページを正本に、ねじり・軸設計・コイルばね・はり反力・SFD/BMD・曲げ応力・長方形/中空円断面のI/Zを学ぶ専用ページ。形式2 Q4は出典に使わず、EIによるたわみ・曲率・カスティリアーノの定理は対象外。",
};

export default function MaterialMechanicsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
