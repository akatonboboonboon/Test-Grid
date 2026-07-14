import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "LAYER//SUM — プロトコル層フラッシュ暗算";
const description = "Pで終わるネットワーク用語をOSI層番号へ瞬時に変換し、フラッシュ暗算で鍛える練習サイト。";

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
      images: [`${origin}/og.png`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
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
