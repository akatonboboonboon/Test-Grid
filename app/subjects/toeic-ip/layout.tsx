import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TOEIC IP対策｜全Part・音声・模試 | TEST//GRID",
  description: "2026年12月25日のTOEIC L&R IPに向けた、Part 1〜7、語彙・文法、音声付きListening、Reading、紙200問／オンライン90問対策。",
};

export default function ToeicIpLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}