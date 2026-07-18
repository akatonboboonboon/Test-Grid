import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "時間制限つき即答練習 | TEST//GRID",
  description: "問題数と制限時間を自由に設定できる、教科別の即答練習。ランキングは固定条件の公式ランキングテストで競います。",
};

export default function RapidSubjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
