import type { Metadata } from "next";
import { headers } from "next/headers";
import AccountSync from "./account-sync";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";
import "./vendor/katex/katex.min.css";
import "./globals.css";

export const dynamic = "force-dynamic";

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getChatGPTUser();
  return (
    <html lang="ja">
      <body>
        <AccountSync
          user={user ? { displayName: user.displayName, email: user.email } : null}
          signInPath={chatGPTSignInPath("/")}
          signOutPath={chatGPTSignOutPath("/")}
        />
        {children}
      </body>
    </html>
  );
}
