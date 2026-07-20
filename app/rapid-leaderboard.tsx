"use client";

import { useEffect, useState } from "react";

export type PublicLeaderboardEntry = {
  rank: number;
  alias: string;
  bestStreak: number;
  totalAnswered?: number;
  totalCorrect?: number;
  updatedAt?: number;
};

function formatRankingDate(updatedAt: number | undefined) {
  if (!updatedAt || !Number.isFinite(updatedAt)) return "記録更新中";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(updatedAt);
}

export default function RapidLeaderboard({ boardKey, refreshToken = 0 }: { boardKey: string; refreshToken?: number }) {
  const [entries, setEntries] = useState<PublicLeaderboardEntry[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const controller = new AbortController();
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- a new board starts a new request state */
    setState("loading");
    fetch(`/api/leaderboard?board=${encodeURIComponent(boardKey)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("leaderboard unavailable");
        const payload = await response.json() as { entries?: PublicLeaderboardEntry[] };
        setEntries(Array.isArray(payload.entries) ? payload.entries : []);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("unavailable");
      });
    return () => controller.abort();
  }, [boardKey, refreshToken]);

  return (
    <section className="rapid-leaderboard" aria-labelledby="rapid-leaderboard-title">
      <div className="rapid-leaderboard-head">
        <div><span>OFFICIAL STREAK RANKING</span><h3 id="rapid-leaderboard-title">教科別・連続正解ランキング</h3></div>
        <p>最高連続正解数で順位を決めます。中断しても現在の連続数は保存され、自己ベストを更新した時点でランキングへ反映されます。</p>
      </div>
      {state === "loading" ? (
        <p className="rapid-leaderboard-note">ランキングを読み込み中…</p>
      ) : state === "unavailable" ? (
        <p className="rapid-leaderboard-note">現在ランキングを取得できません。少し待ってから再読み込みしてください。</p>
      ) : entries.length === 0 ? (
        <p className="rapid-leaderboard-note">まだ記録がありません。最初の連続正解記録を作りましょう。</p>
      ) : (
        <ol>
          {entries.slice(0, 10).map((entry) => (
            <li key={`${entry.rank}-${entry.alias}`}>
              <strong>{entry.rank}</strong>
              <span>{entry.alias}</span>
              <b><em>{entry.bestStreak}</em> 連続</b>
              <small>{typeof entry.totalAnswered === "number" ? `${entry.totalCorrect ?? 0}/${entry.totalAnswered} 正解` : "自己ベスト"}</small>
              <time>{formatRankingDate(entry.updatedAt)}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
