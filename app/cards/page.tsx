import type { Metadata } from "next";
import CardSearch from "../card-search";

export const metadata: Metadata = {
  title: "全教科の暗記帳検索 — TEST//GRID",
  description: "9教科の暗記カードを、教科・単語・公式・説明から検索。あやふやな入力にも対応します。",
};

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const subject = Array.isArray(params.subject) ? params.subject[0] : params.subject;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  return <CardSearch initialSubject={subject ?? "all"} initialQuery={query ?? ""} />;
}
