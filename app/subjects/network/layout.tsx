import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ネットワーク専用ドリル | TEST//GRID",
  description: "Pで終わるネットワーク用語をOSI層番号へ変換し、フラッシュ暗算と即答で鍛える専用ドリル。",
};

export default function NetworkLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
