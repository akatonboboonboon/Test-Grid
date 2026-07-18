"use client";

import { useEffect, useState } from "react";

export type PublicLeaderboardEntry = {
  rank: number;
  alias: string;
  correctCount: number;
  questionCount: number;
  bestStreak: number;
  durationMs: number;
};

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
        <div><span>PLAYER RANKING</span><h3 id="rapid-leaderboard-title">みんなのランキング</h3></div>
        <p>同じ問題数どうしで比較。挑戦前に決めた表示名と自己ベストを公開します。</p>
      </div>
      {state === "loading" ? (
        <p className="rapid-leaderboard-note">ランキングを読み込み中…</p>
      ) : state === "unavailable" ? (
        <p className="rapid-leaderboard-note">現在ランキングを取得できません。端末内の成績は保存されています。</p>
      ) : entries.length === 0 ? (
        <p className="rapid-leaderboard-note">まだ記録がありません。最初のランクインを狙えます。</p>
      ) : (
        <ol>
          {entries.slice(0, 10).map((entry) => (
            <li key={`${entry.rank}-${entry.alias}`}>
              <strong>{entry.rank}</strong>
              <span>{entry.alias}</span>
              <b>{entry.correctCount}/{entry.questionCount}</b>
              <small>連続 {entry.bestStreak}</small>
              <time>{(entry.durationMs / 1000).toFixed(1)}秒</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
