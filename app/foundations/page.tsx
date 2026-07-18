import type { Metadata } from "next";
import "../math-foundations.css";
import MathFoundationsClient from "../math-foundations-client";

export const metadata: Metadata = {
  title: "基礎情報一覧 — TEST//GRID",
  description: "数学・力学・制御・回路で使う公式、記号、適用条件、解法手順、間違えやすい点を科目別に確認できます。",
};

export default function MathFoundationsPage() {
  return <MathFoundationsClient />;
}
