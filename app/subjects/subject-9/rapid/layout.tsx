import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "デジタル回路・時間制限ドリル | TEST//GRID",
  description: "ゲート波形、フリップフロップ、カウンタ、状態遷移を時間内に即答し、連続正解とランキングを記録する。",
};

export default function DigitalCircuitRapidLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
