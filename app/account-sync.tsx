"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  RAPID_HISTORY_STORAGE_KEY,
  RAPID_PROFILE_STORAGE_KEY,
  clearRapidRankingName,
  loadRapidRankingProfile,
  mergeRapidHistories,
  saveRapidRankingName,
} from "./rapid-ranking-data";
import {
  RAPID_CLIENT_STORAGE_KEY,
  mergeRapidRankingProfiles,
  normalizeRankingName,
} from "./rapid-ranking-profile";

type AccountUser = {
  displayName: string;
  email: string;
  defaultRankingName: string | null;
};

type StudySnapshot = Record<string, string>;
type SyncState = "idle" | "syncing" | "synced" | "error";

const SYNC_ENDPOINT = "/api/study-sync";
const STORAGE_KEY_PATTERN = /^(?:test-grid(?::|-)|layer-sum-)/;

function readLocalSnapshot(): StudySnapshot {
  const snapshot: StudySnapshot = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || key === RAPID_CLIENT_STORAGE_KEY || !STORAGE_KEY_PATTERN.test(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) snapshot[key] = value;
  }
  return snapshot;
}

function parsedObject(value: string | undefined): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function mergeProgress(remoteValue: string, localValue: string) {
  const remote = parsedObject(remoteValue);
  const local = parsedObject(localValue);
  if (!remote || !local) return localValue;

  const merged: Record<string, unknown> = { ...remote, ...local };
  for (const key of new Set([...Object.keys(remote), ...Object.keys(local)])) {
    if (remote[key] === "mastered" || local[key] === "mastered") merged[key] = "mastered";
    else if (remote[key] === "learning" || local[key] === "learning") merged[key] = "learning";
  }
  return JSON.stringify(merged);
}

function mergeRawValue(key: string, remoteValue: string, localValue: string) {
  if (key === RAPID_HISTORY_STORAGE_KEY) {
    try {
      return JSON.stringify(mergeRapidHistories(JSON.parse(remoteValue), JSON.parse(localValue)));
    } catch {
      return localValue;
    }
  }
  if (key === RAPID_PROFILE_STORAGE_KEY) {
    try {
      const merged = mergeRapidRankingProfiles(JSON.parse(remoteValue), JSON.parse(localValue));
      return merged ? JSON.stringify(merged) : localValue;
    } catch {
      return localValue;
    }
  }
  if (key.includes(":progress:") || key.includes("-memory-") || key.includes(":english-memory:")) {
    return mergeProgress(remoteValue, localValue);
  }
  if (key.endsWith("mock-test:v1") || key.endsWith("expected-exam:v1")) {
    const remoteSavedAt = Number(parsedObject(remoteValue)?.savedAt ?? 0);
    const localSavedAt = Number(parsedObject(localValue)?.savedAt ?? 0);
    return remoteSavedAt > localSavedAt ? remoteValue : localValue;
  }
  if (key.endsWith("ch18-quiz18:v1")) {
    const remoteUpdatedAt = String(parsedObject(remoteValue)?.updatedAt ?? "");
    const localUpdatedAt = String(parsedObject(localValue)?.updatedAt ?? "");
    return remoteUpdatedAt > localUpdatedAt ? remoteValue : localValue;
  }
  return localValue;
}

function mergeSnapshots(remote: StudySnapshot, local: StudySnapshot) {
  const merged: StudySnapshot = { ...remote };
  for (const [key, localValue] of Object.entries(local)) {
    merged[key] = key in remote ? mergeRawValue(key, remote[key], localValue) : localValue;
  }
  return merged;
}

function stableSnapshot(snapshot: StudySnapshot) {
  return JSON.stringify(Object.fromEntries(Object.entries(snapshot).sort(([left], [right]) => left.localeCompare(right))));
}

function applySnapshot(snapshot: StudySnapshot) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (key !== RAPID_CLIENT_STORAGE_KEY) window.localStorage.setItem(key, value);
  }
}

export default function AccountSync({
  user,
  signInPath,
  signOutPath,
}: {
  user: AccountUser | null;
  signInPath: string;
  signOutPath: string;
}) {
  const defaultRankingName = normalizeRankingName(user?.defaultRankingName) ?? "";
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [statusText, setStatusText] = useState(user ? "進捗を確認中" : "端末内だけに保存中");
  const [rankingNameDraft, setRankingNameDraft] = useState(defaultRankingName);
  const [rankingNameStatus, setRankingNameStatus] = useState("公式ランキングテストの挑戦前に保存すると使われます");
  const inFlightRef = useRef(false);
  const lastSnapshotRef = useRef("");

  const syncNow = useCallback(async (reloadIfPulled = false) => {
    if (!user || inFlightRef.current) return;
    inFlightRef.current = true;
    setSyncState("syncing");
    setStatusText("同期中…");

    try {
      const remoteResponse = await fetch(SYNC_ENDPOINT, { cache: "no-store" });
      if (!remoteResponse.ok) throw new Error("remote read failed");
      const remotePayload = await remoteResponse.json() as { snapshot?: StudySnapshot };
      const local = readLocalSnapshot();
      const merged = mergeSnapshots(remotePayload.snapshot ?? {}, local);
      const pulled = stableSnapshot(merged) !== stableSnapshot(local);
      applySnapshot(merged);

      const saveResponse = await fetch(SYNC_ENDPOINT, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapshot: merged }),
      });
      if (!saveResponse.ok) throw new Error("remote write failed");

      lastSnapshotRef.current = stableSnapshot(merged);
      setSyncState("synced");
      setStatusText("別端末と同期済み");
      window.dispatchEvent(new CustomEvent("test-grid:sync-complete"));

      if (pulled && reloadIfPulled) {
        window.sessionStorage.setItem(`test-grid:sync-hydrated:${user.email}`, "1");
        window.location.reload();
      }
    } catch {
      setSyncState("error");
      setStatusText(navigator.onLine ? "同期できませんでした" : "オフライン・端末内に保存中");
    } finally {
      inFlightRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    const refreshRankingName = () => {
      setRankingNameDraft(loadRapidRankingProfile()?.rankingName ?? defaultRankingName);
    };
    refreshRankingName();
    window.addEventListener("test-grid:sync-complete", refreshRankingName);
    window.addEventListener("test-grid:ranking-profile-changed", refreshRankingName);
    return () => {
      window.removeEventListener("test-grid:sync-complete", refreshRankingName);
      window.removeEventListener("test-grid:ranking-profile-changed", refreshRankingName);
    };
  }, [defaultRankingName]);

  useEffect(() => {
    if (!user) return;
    const hydrationKey = `test-grid:sync-hydrated:${user.email}`;
    const reloadIfPulled = window.sessionStorage.getItem(hydrationKey) !== "1";
    window.sessionStorage.setItem(hydrationKey, "1");
    const initialSync = window.setTimeout(() => void syncNow(reloadIfPulled), 0);

    const interval = window.setInterval(() => {
      const current = stableSnapshot(readLocalSnapshot());
      if (current !== lastSnapshotRef.current) void syncNow(false);
    }, 12_000);
    const handleOnline = () => void syncNow(false);
    window.addEventListener("online", handleOnline);
    return () => {
      window.clearTimeout(initialSync);
      window.clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, [syncNow, user]);

  const saveRankingName = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeRankingName(rankingNameDraft);
    if (!normalized) {
      if (defaultRankingName && rankingNameDraft.trim() === "") {
        clearRapidRankingName();
        setRankingNameDraft(defaultRankingName);
        setRankingNameStatus("アカウントの氏名を初期表示名として使います");
        if (user) void syncNow(false);
        return;
      }
      setRankingNameStatus("1〜24文字で入力してください（制御文字は使えません）");
      return;
    }
    saveRapidRankingName(normalized);
    setRankingNameDraft(normalized);
    setRankingNameStatus(user ? "保存しました・別端末にも同期します" : "この端末に保存しました");
    if (user) void syncNow(false);
  };

  const rankingNameEditor = (
    <form
      onSubmit={saveRankingName}
      aria-label="公式ランキング表示名"
      style={{ alignItems: "end", display: "flex", flex: "1 1 280px", gap: 6, minWidth: 0 }}
    >
      <label style={{ display: "grid", flex: "1 1 180px", gap: 3, minWidth: 0 }}>
        <span>公式ランキング表示名（挑戦前に設定）</span>
        <input
          type="text"
          autoComplete="nickname"
          maxLength={24}
          value={rankingNameDraft}
          onChange={(event) => setRankingNameDraft(event.target.value)}
          placeholder="1〜24文字"
          aria-describedby="ranking-name-status"
          style={{ border: "1px solid currentColor", minHeight: 36, minWidth: 0, padding: "6px 8px" }}
        />
      </label>
      <button type="submit" style={{ minHeight: 36, padding: "6px 10px", whiteSpace: "nowrap" }}>名前を保存</button>
      <span id="ranking-name-status" role="status" style={{ maxWidth: 180 }}>{rankingNameStatus}</span>
    </form>
  );

  if (!user) {
    return (
      <aside className="account-sync-bar is-signed-out" aria-label="学習アカウント">
        <div><strong>別のスマホでも続きから</strong><span>アカウントで全科目の進捗を同期できます</span></div>
        {rankingNameEditor}
        <Link className="account-sign-in" href={signInPath}>アカウント作成・ログイン</Link>
      </aside>
    );
  }

  return (
    <aside className="account-sync-bar is-signed-in" data-state={syncState} data-default-ranking-name={defaultRankingName || undefined} aria-label="学習アカウント">
      <div className="account-identity">
        <strong>{user.displayName}</strong>
        <span><i aria-hidden="true" /> {statusText}</span>
      </div>
      {rankingNameEditor}
      <div className="account-actions">
        <button type="button" disabled={syncState === "syncing"} onClick={() => void syncNow(true)}>今すぐ同期</button>
        <Link href={signOutPath}>ログアウト</Link>
      </div>
    </aside>
  );
}
