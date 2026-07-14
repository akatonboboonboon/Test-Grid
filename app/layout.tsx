import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "TEST//GRID — 9教科の定期テスト対策ハブ";
const description = "9教科を科目別に整理し、暗記カード・一問一答・ネットワーク専用ドリルで繰り返せる定期テスト対策サイト。";

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3017";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [`${origin}/og-test-grid.png`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-test-grid.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
