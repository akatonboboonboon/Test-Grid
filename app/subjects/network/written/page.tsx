"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  NETWORK_WRITTEN_CATEGORIES,
  NETWORK_WRITTEN_TERMS,
  evaluateNetworkWrittenAnswer,
  networkWrittenCategoryMatches,
  networkWrittenCharacterCount,
  type NetworkWrittenEvaluation,
  type NetworkWrittenCategory,
  type NetworkWrittenLayerChoice,
} from "../../../network-written-data";
import { storageRead, storageWrite } from "../../../protocols";
import NetworkWrittenMocks from "../../../network-written-mocks";
import styles from "../../../network-written.module.css";

type WrittenProgress = {
  attempts: number;
  qualified: number;
  completedIds: string[];
  lastTermId: string;
};

const STORAGE_KEY = "test-grid:network-written:v1";
const DEFAULT_TERM_ID = NETWORK_WRITTEN_TERMS[0]?.id ?? "";
const EMPTY_PROGRESS: WrittenProgress = {
  attempts: 0,
  qualified: 0,
  completedIds: [],
  lastTermId: DEFAULT_TERM_ID,
};

const LAYER_CHOICES: { value: NetworkWrittenLayerChoice; short: string; label: string }[] = [
  { value: 1, short: "L1", label: "物理層" },
  { value: 2, short: "L2", label: "データリンク層" },
  { value: 3, short: "L3", label: "ネットワーク層" },
  { value: 4, short: "L4", label: "トランスポート層" },
  { value: 5, short: "L5", label: "セッション層" },
  { value: 6, short: "L6", label: "プレゼンテーション層" },
  { value: 7, short: "L7", label: "アプリケーション層" },
];

function normalizeProgress(value: unknown): WrittenProgress {
  if (!value || typeof value !== "object") return EMPTY_PROGRESS;
  const saved = value as Partial<WrittenProgress>;
  const completedIds = Array.isArray(saved.completedIds)
    ? [...new Set(saved.completedIds.filter((id): id is string => typeof id === "string" && NETWORK_WRITTEN_TERMS.some((term) => term.id === id)))]
    : [];
  const number = (item: unknown) => typeof item === "number" && Number.isFinite(item) ? Math.max(0, Math.floor(item)) : 0;
  const lastTermId = typeof saved.lastTermId === "string" && NETWORK_WRITTEN_TERMS.some((term) => term.id === saved.lastTermId)
    ? saved.lastTermId
    : EMPTY_PROGRESS.lastTermId;
  return {
    attempts: number(saved.attempts),
    qualified: number(saved.qualified),
    completedIds,
    lastTermId,
  };
}

export default function NetworkWrittenPracticePage() {
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<WrittenProgress>(EMPTY_PROGRESS);
  const [selectedId, setSelectedId] = useState(EMPTY_PROGRESS.lastTermId);
  const [category, setCategory] = useState<NetworkWrittenCategory>("すべて");
  const [query, setQuery] = useState("");
  const [layerChoice, setLayerChoice] = useState<NetworkWrittenLayerChoice | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<NetworkWrittenEvaluation | null>(null);
  const feedbackRef = useRef<HTMLElement>(null);

  /* Device-local progress can only be restored after the client mounts. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const restored = normalizeProgress(storageRead<unknown>(STORAGE_KEY, EMPTY_PROGRESS));
    setProgress(restored);
    setSelectedId(restored.lastTermId);
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    storageWrite(STORAGE_KEY, progress);
  }, [hydrated, progress]);

  const current = useMemo(
    () => NETWORK_WRITTEN_TERMS.find((term) => term.id === selectedId) ?? NETWORK_WRITTEN_TERMS[0],
    [selectedId],
  );

  const filteredTerms = useMemo(() => {
    const needle = query.normalize("NFKC").toLocaleLowerCase("ja-JP").trim();
    return NETWORK_WRITTEN_TERMS.filter((term) => {
      const categoryMatches = networkWrittenCategoryMatches(term, category);
      if (!categoryMatches) return false;
      if (!needle) return true;
      return [term.term, term.category, term.keywords.join(" "), term.modelAnswer]
        .join(" ")
        .normalize("NFKC")
        .toLocaleLowerCase("ja-JP")
        .includes(needle);
    });
  }, [category, query]);

  const characterCount = networkWrittenCharacterCount(answer);
  const answerReady = characterCount >= 20;

  function resetResponse(nextId: string) {
    setSelectedId(nextId);
    setLayerChoice(null);
    setAnswer("");
    setEvaluation(null);
    setProgress((previous) => ({ ...previous, lastTermId: nextId }));
  }

  function selectRandomTerm() {
    const pool = filteredTerms.length ? filteredTerms : NETWORK_WRITTEN_TERMS;
    const candidates = pool.length > 1 ? pool.filter((term) => term.id !== current.id) : pool;
    const next = candidates[Math.floor(Math.random() * candidates.length)] ?? NETWORK_WRITTEN_TERMS[0];
    resetResponse(next.id);
  }

  function submitAnswer(event: React.FormEvent) {
    event.preventDefault();
    const result = evaluateNetworkWrittenAnswer(current, answer, layerChoice);
    setEvaluation(result);
    setProgress((previous) => ({
      attempts: previous.attempts + 1,
      qualified: previous.qualified + (result.qualified ? 1 : 0),
      completedIds: result.qualified && !previous.completedIds.includes(current.id)
        ? [...previous.completedIds, current.id]
        : previous.completedIds,
      lastTermId: current.id,
    }));
    window.requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function editResponse() {
    setEvaluation(null);
    window.requestAnimationFrame(() => document.getElementById("network-written-answer")?.focus());
  }

  const completion = Math.round((progress.completedIds.length / NETWORK_WRITTEN_TERMS.length) * 100);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/subjects/network">
          <span aria-hidden="true">NW</span>
          <strong>NETWORK / WRITTEN</strong>
        </Link>
        <nav aria-label="ネットワーク学習メニュー">
          <Link href="/subjects/network/cards">暗記帳</Link>
          <Link href="/rapid/network">追試用・層即答</Link>
          <Link href="/">9教科ホーム</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="network-written-title">
          <div>
            <p>MAIN EXAM / NEW FORMAT</p>
            <h1 id="network-written-title">好きなプロトコルを選び、<br /><em>層＋20文字</em>で説明する。</h1>
          </div>
          <div className={styles.examRule}>
            <strong>過去問相当の10点基準</strong>
            <ol>
              <li>該当するOSIの層を正しく選ぶ</li>
              <li>空白を除き20文字以上で書く（未満は0点）</li>
              <li>対象・動作・固有の特徴から必要観点を満たす</li>
              <li>「何を・どうする」を具体的な動作として書く</li>
              <li>別プロトコルとの混同や中心的な矛盾を含めない</li>
            </ol>
            <small>添付の「ネットワーク形式1・2」は20文字記述という形式だけを参照し、印字された用語は今回の範囲へ追加していません。</small>
          </div>
        </section>

        <section className={styles.progressPanel} aria-label="記述練習の進捗">
          <div><span>挑戦</span><strong>{progress.attempts}</strong><small>回</small></div>
          <div><span>満点基準クリア</span><strong>{progress.qualified}</strong><small>回</small></div>
          <div><span>確認済み用語</span><strong>{progress.completedIds.length}</strong><small> / {NETWORK_WRITTEN_TERMS.length}</small></div>
          <div className={styles.progressBar} aria-label={`用語確認率 ${completion}%`}><i style={{ width: `${completion}%` }} /><b>{completion}%</b></div>
        </section>

        <NetworkWrittenMocks />

        <section className={styles.picker} aria-labelledby="term-picker-title">
          <div className={styles.sectionHeading}>
            <span>01 / SELECT</span>
            <h2 id="term-picker-title">説明するプロトコルを選ぶ</h2>
            <p>最初の層別写真から読み込んだ既存96プロトコルだけを出題します。</p>
          </div>
          <div className={styles.pickerControls}>
            <label>
              <span>範囲</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as NetworkWrittenCategory)}>
                {NETWORK_WRITTEN_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>プロトコル・キーワード検索</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例：経路、暗号、フレーム" />
            </label>
            <label>
              <span>プロトコル（{filteredTerms.length}件）</span>
              <select
                value={filteredTerms.some((term) => term.id === current.id) ? current.id : ""}
                onChange={(event) => event.target.value && resetResponse(event.target.value)}
              >
                {!filteredTerms.some((term) => term.id === current.id) && <option value="">候補から選択</option>}
                {filteredTerms.map((term) => <option key={term.id} value={term.id}>{term.term}</option>)}
              </select>
            </label>
            <button type="button" onClick={selectRandomTerm}>ランダムに選ぶ →</button>
          </div>
        </section>

        <form className={styles.practice} onSubmit={submitAnswer}>
          <article className={styles.termCard}>
            <div>
              <span>元写真の出題範囲</span>
              <small>層は解答後に表示</small>
            </div>
            <h2>{current.term}</h2>
            <p>このプロトコルが何層で、何をするものかを自分の言葉で説明してください。</p>
          </article>

          <section className={styles.answerSection} aria-labelledby="layer-answer-title">
            <div className={styles.sectionHeading}>
              <span>02 / LAYER</span>
              <h2 id="layer-answer-title">該当する層を選ぶ</h2>
              <p>複数層の用語は、該当する層のどれか一つで正解です。</p>
            </div>
            <div className={styles.layerGrid} role="radiogroup" aria-label="OSI層">
              {LAYER_CHOICES.map((choice) => {
                const selected = layerChoice === choice.value;
                return (
                  <button
                    key={String(choice.value)}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={selected ? styles.selectedLayer : ""}
                    onClick={() => {
                      setLayerChoice(choice.value);
                      setEvaluation(null);
                    }}
                  >
                    <strong>{choice.short}</strong><span>{choice.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.answerSection} aria-labelledby="description-answer-title">
            <div className={styles.sectionHeading}>
              <span>03 / EXPLAIN</span>
              <h2 id="description-answer-title">20〜100文字で具体的に説明</h2>
              <p>20文字は提出条件にすぎません。満点には「対象・動作・固有の特徴」を入れてください。</p>
            </div>
            <label className={styles.textareaLabel} htmlFor="network-written-answer">
              <textarea
                id="network-written-answer"
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setEvaluation(null);
                }}
                rows={7}
                placeholder={`${current.term}は、……するための……です。`}
              />
              <span className={answerReady ? styles.counterReady : ""} aria-live="polite">
                <strong>{characterCount}</strong>文字 {answerReady ? "（提出可・内容採点あり）" : `（最低条件まであと${20 - characterCount}文字）`}
              </span>
            </label>
            <button className={styles.submit} type="submit" disabled={layerChoice === null || characterCount === 0}>
              採点して模範解答を見る →
            </button>
          </section>
        </form>

        {evaluation && (
          <section
            ref={feedbackRef}
            className={`${styles.feedback} ${evaluation.qualified ? styles.feedbackQualified : styles.feedbackRetry}`}
            tabIndex={-1}
            aria-labelledby="written-feedback-title"
          >
            <div className={styles.scoreBlock}>
              <span>AUTO CHECK</span>
              <strong>{evaluation.estimatedScore}<small> / 10点目安</small></strong>
              <h2 id="written-feedback-title">{evaluation.qualified ? "過去問の満点基準クリア" : "部分点です・答案を修正"}</h2>
              <p>20文字だけでは満点になりません。過去問と同じく、層・働きの核・具体性・矛盾を0／3／5／8／10点で判定します。</p>
            </div>
            <div className={styles.checks}>
              <div data-ok={evaluation.enoughCharacters}><b>{evaluation.enoughCharacters ? "✓" : "×"}</b><span>最低20文字</span><small>{evaluation.characterCount}文字・未満は0点</small></div>
              <div data-ok={evaluation.layerCorrect}><b>{evaluation.layerCorrect ? "✓" : "×"}</b><span>層の選択</span><small>{evaluation.layerCorrect ? "一致" : "誤層は最大3点"}</small></div>
              <div data-ok={evaluation.detailMatched}><b>{evaluation.detailMatched ? "✓" : "×"}</b><span>必須観点</span><small>{evaluation.matchedRubricItems.length} / {evaluation.requiredRubricItems}：{evaluation.matchedRubricItems.join("・") || "該当なし"}</small></div>
              <div data-ok={evaluation.actionMatched}><b>{evaluation.actionMatched ? "✓" : "×"}</b><span>具体的な動作</span><small>{evaluation.actionMatched ? "何を・どうするが明確" : "汎用説明だけでは不足"}</small></div>
              <div data-ok={evaluation.contradictions.length === 0}><b>{evaluation.contradictions.length === 0 ? "✓" : "×"}</b><span>矛盾・混同</span><small>{evaluation.contradictions.length ? evaluation.contradictions.join("・") : "検出なし"}</small></div>
            </div>
            <div className={styles.answerGuide}>
              <section>
                <span>正しい層</span>
                <h3>{current.layerLabel}</h3>
                <p>{current.layerReason}</p>
              </section>
              <section>
                <span>模範解答</span>
                {current.fullName && (
                  <p className={styles.formalName}><b>正式名称</b>{current.fullName}</p>
                )}
                <p className={styles.modelAnswer}>{current.modelAnswer}</p>
                <div className={styles.keywords} aria-label="説明へ入れたいキーワード">
                  {evaluation.expectedRubricItems.map((item) => <b key={item} data-matched={evaluation.matchedRubricItems.includes(item)}>{item}</b>)}
                </div>
              </section>
            </div>
            <div className={styles.feedbackActions}>
              <button type="button" onClick={editResponse}>同じ用語を書き直す</button>
              <button type="button" onClick={selectRandomTerm}>次の用語へ →</button>
            </div>
          </section>
        )}

        <aside className={styles.retestNote}>
          <div><span>RETEST TRAINING</span><h2>旧フラッシュ形式も残しています</h2></div>
          <p>フラッシュ暗算と層即答は追試対策として引き続き利用できます。本試験対策は、この記述練習を優先してください。</p>
          <Link href="/subjects/network">フラッシュ暗算</Link>
          <Link href="/rapid/network">層即答</Link>
        </aside>
      </main>
    </div>
  );
}
