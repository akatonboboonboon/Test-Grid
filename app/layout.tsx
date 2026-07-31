import type { Metadata } from "next";
import { headers } from "next/headers";
import AccountSync from "./account-sync";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";
import "./vendor/katex/katex.min.css";
import "./globals.css";

export const dynamic = "force-dynamic";

const title = "TEST//GRID — 1〜5年の試験・資格対策ハブ（TOEIC IP）";
const description = "1年から5年までの定期試験と資格・TOEIC IP対策を、学年と試験区分に分けて繰り返し学べる学習サイト。";

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
          user={user ? {
            displayName: user.displayName,
            email: user.email,
            defaultRankingName: user.fullName,
          } : null}
          signInPath={chatGPTSignInPath("/")}
          signOutPath={chatGPTSignOutPath("/")}
        />
        {children}
      </body>
    </html>
  );
}
