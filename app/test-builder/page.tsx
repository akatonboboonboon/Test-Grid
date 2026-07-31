import type { Metadata } from "next";
import TestBuilderClient from "../test-builder-client";

export const metadata: Metadata = {
  title: "テスト作成室 | TEST//GRID",
  description: "入力した範囲だけを使い、解答・解説・出典付きのテストを端末内で作成します。",
};

export default function TestBuilderPage() {
  return <TestBuilderClient />;
}
