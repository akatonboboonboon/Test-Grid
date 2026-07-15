import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ネットワーク専用ドリル | TEST//GRID",
  description: "手書き資料の①〜⑦に並ぶネットワーク用語をOSI層番号へ変換し、フラッシュ暗算と制限時間つき即答で鍛える専用ドリル。",
};

export default function NetworkLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
