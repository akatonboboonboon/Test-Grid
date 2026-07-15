import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "英語・定期テスト実戦ドリル | TEST//GRID",
  description: "試験形式に合わせた語順整序、穴埋め、選択問題、長文読解と、日本語から英語を答える暗記帳をまとめた英語専用ページ。",
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
