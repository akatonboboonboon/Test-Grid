import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "時間制限つき即答 | TEST//GRID",
  description: "教科別の制限時間つき即答、連続正解、全問振り返り、表示名つきランキング。",
};

export default function RapidSubjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
