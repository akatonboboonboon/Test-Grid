import type { Metadata } from "next";
import "../essentials.css";
import EssentialsClient from "../essentials-client";

export const metadata: Metadata = {
  title: "試験直前・これだけは覚える — TEST//GRID",
  description: "9教科の最重要単語・公式・見分け方・間違えやすい点を、試験直前に一目で確認できる要点集。",
};

export default function EssentialsPage() {
  return <EssentialsClient />;
}
