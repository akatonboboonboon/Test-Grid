import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "デジタル回路・時間制限ドリル練習 | TEST//GRID",
  description: "ゲート波形、フリップフロップ、カウンタ、状態遷移を、問題数と制限時間を調整して練習するページ。",
};

export default function DigitalCircuitRapidLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
