import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ネットワーク本試験・追試対策 | TEST//GRID",
  description: "本試験の層＋20文字記述へ進み、追試用のフラッシュ暗算と制限時間つき層即答も練習できるネットワーク対策ページ。",
};

export default function NetworkLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
