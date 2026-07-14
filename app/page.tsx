"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_LAYERS,
  DEFAULT_CARDS,
  normalizeCards,
  shuffle,
  storageRead,
  storageWrite,
  type Layer,
  type ProtocolCard,
} from "./protocols";

type Mode = "sum" | "identify";
type Phase = "idle" | "countdown" | "flash" | "answer" | "identify" | "result";

type Stats = {
  sumSessions: number;
  sumCorrect: number;
  identifyAnswers: number;
  identifyCorrect: number;
  streak: number;
  bestStreak: number;
};

type IdentifyAnswer = {
  card: ProtocolCard;
  chosen: Layer;
  correct: boolean;
};

const EMPTY_STATS: Stats = {
  sumSessions: 0,
  sumCorrect: 0,
  identifyAnswers: 0,
  identifyCorrect: 0,
  streak: 0,
  bestStreak: 0,
};

const MIN_CARD_COUNT = 1;
const MAX_CARD_COUNT = 100;
const MIN_SPEED_MS = 100;
const MAX_SPEED_MS = 10_000;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeCardCount(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(Math.floor(parsed), MIN_CARD_COUNT, MAX_CARD_COUNT) : 5;
}

function normalizeSpeed(value: string | number) {
  const seconds = Number(value);
  return Number.isFinite(seconds) ? clamp(Math.round(seconds * 1000), MIN_SPEED_MS, MAX_SPEED_MS) : 600;
}

function buildSequence(items: ProtocolCard[], count: number) {
  const result: ProtocolCard[] = [];
  while (result.length < count) {
    const batch = shuffle(items);
    if (result.length && batch.length > 1 && result.at(-1)?.id === batch[0]?.id) {
      [batch[0], batch[1]] = [batch[1], batch[0]];
    }
    result.push(...batch);
  }
  return result.slice(0, count);
}

function normalizeStats(value: unknown): Stats {
  if (!value || typeof value !== "object") return EMPTY_STATS;
  const saved = value as Partial<Stats>;
  const safeNumber = (item: unknown) => typeof item === "number" && Number.isFinite(item) ? Math.max(0, Math.floor(item)) : 0;
  return {
    sumSessions: safeNumber(saved.sumSessions),
    sumCorrect: safeNumber(saved.sumCorrect),
    identifyAnswers: safeNumber(saved.identifyAnswers),
    identifyCorrect: safeNumber(saved.identifyCorrect),
    streak: safeNumber(saved.streak),
    bestStreak: safeNumber(saved.bestStreak),
  };
}

export default function Home() {
  const [cards, setCards] = useState<ProtocolCard[]>(DEFAULT_CARDS);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>("sum");
  const [phase, setPhase] = useState<Phase>("idle");
  const [cardCount, setCardCount] = useState(5);
  const [cardCountDraft, setCardCountDraft] = useState("5");
  const [speed, setSpeed] = useState(600);
  const [speedDraft, setSpeedDraft] = useState("0.6");
  const [sequence, setSequence] = useState<ProtocolCard[]>([]);
  const [index, setIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [termVisible, setTermVisible] = useState(true);
  const [answer, setAnswer] = useState("");
  const [sumCorrect, setSumCorrect] = useState<boolean | null>(null);
  const [identifyAnswers, setIdentifyAnswers] = useState<IdentifyAnswer[]>([]);
  const [feedback, setFeedback] = useState<{ chosen: Layer; correct: boolean } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLayer, setNewLayer] = useState<Layer>(2);
  const [resetArmed, setResetArmed] = useState(false);
  const answerRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorCloseRef = useRef<HTMLButtonElement>(null);

  /* Device-local preferences can only be restored after the client mounts. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCards(normalizeCards(storageRead<unknown>("layer-sum-cards-v1", DEFAULT_CARDS)));
    setStats(normalizeStats(storageRead<unknown>("layer-sum-stats-v1", EMPTY_STATS)));
    const savedSettings = storageRead<unknown>("layer-sum-settings-v1", null);
    const settings = savedSettings && typeof savedSettings === "object" ? savedSettings as {
      cardCount?: unknown;
      speed?: unknown;
    } : {
      cardCount: 5,
      speed: 600,
    };
    const restoredCount = typeof settings.cardCount === "number"
      ? normalizeCardCount(settings.cardCount)
      : 5;
    const restoredSpeed = typeof settings.speed === "number"
      ? clamp(Math.round(settings.speed), MIN_SPEED_MS, MAX_SPEED_MS)
      : 600;
    setCardCount(restoredCount);
    setCardCountDraft(String(restoredCount));
    setSpeed(restoredSpeed);
    setSpeedDraft(String(Number((restoredSpeed / 1000).toFixed(2))));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    storageWrite("layer-sum-cards-v1", cards);
    storageWrite("layer-sum-stats-v1", stats);
    storageWrite("layer-sum-settings-v1", { cardCount, speed });
  }, [cards, stats, cardCount, speed, hydrated]);

  useEffect(() => {
    if (!editorOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    editorCloseRef.current?.focus();

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const focusable = editorRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", trapFocus);
    return () => {
      window.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [editorOpen]);

  const pool = useMemo(
    () => cards.filter((card) => card.enabled && card.label.trim().length > 0),
    [cards],
  );

  const expectedSum = useMemo(
    () => sequence.reduce((total, card) => total + card.layer, 0),
    [sequence],
  );

  const runningTotals = useMemo(() => {
    let total = 0;
    return sequence.map((card) => {
      total += card.layer;
      return total;
    });
  }, [sequence]);

  const identifyScore = identifyAnswers.filter((item) => item.correct).length;
  const currentCard = sequence[index];

  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown((value) => value - 1);
      } else {
        setIndex(0);
        setTermVisible(true);
        setPhase(mode === "sum" ? "flash" : "identify");
      }
    }, 560);
    return () => window.clearTimeout(timer);
  }, [phase, countdown, mode]);

  useEffect(() => {
    if (phase !== "flash" || !currentCard) return;
    const blankMs = Math.max(20, Math.round(speed * 0.22));
    const visibleMs = Math.max(20, speed - blankMs);
    const timer = window.setTimeout(
      () => {
        if (termVisible) {
          setTermVisible(false);
          return;
        }
        if (index < sequence.length - 1) {
          setIndex((value) => value + 1);
          setTermVisible(true);
        } else {
          setPhase("answer");
        }
      },
      termVisible ? visibleMs : blankMs,
    );
    return () => window.clearTimeout(timer);
  }, [phase, currentCard, speed, termVisible, index, sequence.length]);

  useEffect(() => {
    if (phase === "answer") answerRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "identify" || !feedback) return;
    const timer = window.setTimeout(() => {
      if (index < sequence.length - 1) {
        setIndex((value) => value + 1);
        setFeedback(null);
      } else {
        setFeedback(null);
        setPhase("result");
      }
    }, 680);
    return () => window.clearTimeout(timer);
  }, [phase, feedback, index, sequence.length]);

  function startRound() {
    if (pool.length === 0) return;
    const nextCount = normalizeCardCount(cardCountDraft);
    const nextSpeed = normalizeSpeed(speedDraft);
    setCardCount(nextCount);
    setCardCountDraft(String(nextCount));
    setSpeed(nextSpeed);
    setSpeedDraft(String(Number((nextSpeed / 1000).toFixed(2))));
    setSequence(buildSequence(pool, nextCount));
    setIndex(0);
    setCountdown(3);
    setTermVisible(true);
    setAnswer("");
    setSumCorrect(null);
    setIdentifyAnswers([]);
    setFeedback(null);
    setPhase("countdown");
  }

  function submitSum(event: React.FormEvent) {
    event.preventDefault();
    if (answer.trim() === "") return;
    const correct = Number(answer) === expectedSum;
    setSumCorrect(correct);
    setStats((previous) => {
      const streak = correct ? previous.streak + 1 : 0;
      return {
        ...previous,
        sumSessions: previous.sumSessions + 1,
        sumCorrect: previous.sumCorrect + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(previous.bestStreak, streak),
      };
    });
    setPhase("result");
  }

  function answerLayer(chosen: Layer) {
    if (phase !== "identify" || feedback || !currentCard) return;
    const correct = chosen === currentCard.layer;
    setFeedback({ chosen, correct });
    setIdentifyAnswers((previous) => [...previous, { card: currentCard, chosen, correct }]);
    setStats((previous) => {
      const streak = correct ? previous.streak + 1 : 0;
      return {
        ...previous,
        identifyAnswers: previous.identifyAnswers + 1,
        identifyCorrect: previous.identifyCorrect + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(previous.bestStreak, streak),
      };
    });
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setPhase("idle");
    setSequence([]);
  }

  function updateCard(id: string, patch: Partial<ProtocolCard>) {
    setCards((previous) => previous.map((card) => (card.id === id ? { ...card, ...patch } : card)));
  }

  function addCard(event: React.FormEvent) {
    event.preventDefault();
    const label = newLabel.trim().toUpperCase();
    if (!label) return;
    setCards((previous) => [
      ...previous,
      {
        id: `custom-${Date.now()}`,
        label,
        layer: newLayer,
        source: "custom",
        enabled: true,
      },
    ]);
    setNewLabel("");
  }

  function resetCards() {
    if (!resetArmed) {
      setResetArmed(true);
      window.setTimeout(() => setResetArmed(false), 3500);
      return;
    }
    setCards(DEFAULT_CARDS);
    setResetArmed(false);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && editorOpen) {
        setEditorOpen(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea, button")) return;
      if (phase === "identify" && /^[1-7]$/.test(event.key)) {
        answerLayer(Number(event.key) as Layer);
      }
      if ((phase === "idle" || phase === "result") && event.code === "Space") {
        event.preventDefault();
        startRound();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const totalAccuracy = stats.identifyAnswers
    ? Math.round((stats.identifyCorrect / stats.identifyAnswers) * 100)
    : 0;

  const stageClass = `stage stage-${phase}`;

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="暗算トレーニングへ戻る">
          <span className="brand-mark" aria-hidden="true">L/S</span>
          <span>
            <strong>LAYER//SUM</strong>
            <small>PROTOCOL FLASH DRILL</small>
          </span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {cards.filter((card) => card.enabled).length} CARDS</span>
          <Link className="outline-button header-link" href="/cards">暗記カード</Link>
          <button className="outline-button" type="button" onClick={() => setEditorOpen(true)} disabled={!["idle", "result"].includes(phase)}>
            カードを編集
          </button>
        </div>
      </header>

      <main className={phase === "flash" || phase === "countdown" ? "main-layout focus-mode" : "main-layout"}>
        <section className="intro-block" aria-labelledby="page-title">
          <p className="eyebrow"><span>NETWORK LAYER TRAINING</span><span>PHOTO SET / 01—02</span></p>
          <h1 id="page-title">Pで終わるプロトコルを、<br /><em>瞬時に足す。</em></h1>
          <p className="lede">略語を層番号へ変換して、そのまま合計。写真から読み取った40語を、テスト仕様の速さまで叩き込みます。</p>
        </section>

        <section className="practice-panel" aria-label="練習エリア">
          <div className="mode-switch" role="tablist" aria-label="練習モード">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "sum"}
              className={mode === "sum" ? "active" : ""}
              onClick={() => changeMode("sum")}
            >
              <span>01</span> フラッシュ暗算
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "identify"}
              className={mode === "identify" ? "active" : ""}
              onClick={() => changeMode("identify")}
            >
              <span>02</span> 層を即答
            </button>
          </div>

          <div className={stageClass} aria-live="polite">
            {phase === "idle" && (
              <div className="idle-stage">
                <div className="sample-stack" aria-hidden="true">
                  <div className="sample-card sample-back">HTTP</div>
                  <div className="sample-card sample-middle">TCP</div>
                  <div className="sample-card sample-front">EIGRP<span>?</span></div>
                </div>
                <div className="idle-copy">
                  <span className="ready-pill"><i /> READY</span>
                  <h2>{mode === "sum" ? "見えた層を、頭の中で加算。" : "考える前に、1〜7を押す。"}</h2>
                  <p>{mode === "sum" ? "略語だけが順番に現れます。最後に層番号の合計を入力してください。" : "略語を見たら対応する層番号を選択。反射速度で定着させます。"}</p>
                </div>
              </div>
            )}

            {phase === "countdown" && (
              <div className="countdown-stage">
                <span>FOCUS</span>
                <strong key={countdown}>{countdown}</strong>
                <small>{sequence.length} CARDS / {speed} MS</small>
              </div>
            )}

            {phase === "flash" && (
              <div className="flash-stage">
                <div className="flash-meta"><span>ADD THE LAYERS</span><span>{String(index + 1).padStart(2, "0")} / {String(sequence.length).padStart(2, "0")}</span></div>
                <div className={`flash-card ${termVisible ? "is-visible" : "is-blank"}`}>
                  <span>{termVisible ? currentCard?.label : ""}</span>
                </div>
                <div className="progress-track" aria-hidden="true"><i style={{ width: `${((index + (termVisible ? 0.72 : 1)) / sequence.length) * 100}%` }} /></div>
              </div>
            )}

            {phase === "answer" && (
              <div className="answer-stage">
                <span className="stage-index">INPUT / TOTAL</span>
                <h2>合計はいくつ？</h2>
                <form onSubmit={submitSum} className="answer-form">
                  <input
                    ref={answerRef}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={sequence.length * 7}
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    aria-label="層番号の合計"
                    placeholder="?"
                  />
                  <button type="submit" disabled={answer.trim() === ""}>判定する <span>↵</span></button>
                </form>
                <p>表示された層番号をすべて足して入力</p>
              </div>
            )}

            {phase === "identify" && currentCard && (
              <div className="identify-stage">
                <div className="flash-meta"><span>CHOOSE THE LAYER</span><span>{String(index + 1).padStart(2, "0")} / {String(sequence.length).padStart(2, "0")}</span></div>
                <div className={`identify-card ${feedback ? (feedback.correct ? "correct" : "wrong") : ""}`} data-layer={currentCard.layer}>
                  <strong>{currentCard.label}</strong>
                  {feedback && <small>{feedback.correct ? `正解 — L${currentCard.layer}` : `L${currentCard.layer} が正解`}</small>}
                </div>
                <div className="layer-keypad" aria-label="層番号を選ぶ">
                  {ALL_LAYERS.map((layer) => (
                    <button
                      type="button"
                      key={layer}
                      onClick={() => answerLayer(layer)}
                      disabled={Boolean(feedback)}
                      className={feedback?.chosen === layer ? (feedback.correct ? "picked-correct" : "picked-wrong") : feedback && currentCard.layer === layer ? "actual" : ""}
                    >
                      <span>{layer}</span><small>LAYER</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === "result" && mode === "sum" && (
              <div className="result-stage">
                <div className={`result-banner ${sumCorrect ? "correct" : "wrong"}`}>
                  <span>{sumCorrect ? "PERFECT" : "ONE MORE"}</span>
                  <strong>{expectedSum}</strong>
                  <p>{sumCorrect ? "正解。変換も加算も完了。" : `あなたの回答：${answer || "—"}`}</p>
                </div>
                <div className="answer-breakdown" aria-label="出題の内訳">
                  {sequence.map((card, cardIndex) => {
                    return (
                      <div className="breakdown-item" key={`${card.id}-${cardIndex}`} data-layer={card.layer}>
                        <span>{card.label}</span><strong>L{card.layer}</strong><small>= {runningTotals[cardIndex]}</small>
                      </div>
                    );
                  })}
                </div>
                <div className="result-actions">
                  <button type="button" className="primary-button" onClick={startRound}>同じ設定でもう一度</button>
                  <button type="button" className="text-button" onClick={() => setPhase("idle")}>設定に戻る</button>
                </div>
              </div>
            )}

            {phase === "result" && mode === "identify" && (
              <div className="result-stage identify-result">
                <div className={`result-banner ${identifyScore === sequence.length ? "correct" : "mixed"}`}>
                  <span>RESULT</span>
                  <strong>{identifyScore}<small>/{sequence.length}</small></strong>
                  <p>{identifyScore === sequence.length ? "全問正解。反射で取れています。" : "間違えた語だけ、もう一度確認。"}</p>
                </div>
                <div className="identify-review">
                  {identifyAnswers.map((item, answerIndex) => (
                    <div key={`${item.card.id}-${answerIndex}`} className={item.correct ? "correct" : "wrong"}>
                      <span>{item.card.label}</span><strong>L{item.card.layer}</strong>
                      {!item.correct && <small>回答 L{item.chosen}</small>}
                    </div>
                  ))}
                </div>
                <div className="result-actions">
                  <button type="button" className="primary-button" onClick={startRound}>もう一度</button>
                  <button type="button" className="text-button" onClick={() => setPhase("idle")}>設定に戻る</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {!["countdown", "flash", "answer", "identify"].includes(phase) && (
          <aside className="control-panel" aria-label="練習設定">
            <div className="control-heading"><span>SESSION SETUP</span><strong>練習設定</strong></div>

            <fieldset>
              <legend><span>01</span> 枚数</legend>
              <div className="number-setting">
                <div className="number-input-shell">
                  <input
                    id="card-count"
                    type="number"
                    inputMode="numeric"
                    min={MIN_CARD_COUNT}
                    max={MAX_CARD_COUNT}
                    step="1"
                    value={cardCountDraft}
                    onChange={(event) => {
                      setCardCountDraft(event.target.value);
                      const parsed = Number(event.target.value);
                      if (Number.isFinite(parsed) && parsed >= MIN_CARD_COUNT && parsed <= MAX_CARD_COUNT) {
                        setCardCount(Math.floor(parsed));
                      }
                    }}
                    onBlur={() => {
                      const next = normalizeCardCount(cardCountDraft);
                      setCardCount(next);
                      setCardCountDraft(String(next));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    aria-describedby="card-count-help"
                  />
                  <span>枚</span>
                </div>
                <small id="card-count-help">1〜100枚。カード数を超えると重複して出題。</small>
              </div>
            </fieldset>

            {mode === "sum" && (
              <fieldset>
                <legend><span>02</span> 1枚の表示時間</legend>
                <div className="number-setting">
                  <div className="number-input-shell">
                    <input
                      id="flash-speed"
                      type="number"
                      inputMode="decimal"
                      min="0.1"
                      max="10"
                      step="0.05"
                      value={speedDraft}
                      onChange={(event) => {
                        setSpeedDraft(event.target.value);
                        const parsed = Number(event.target.value);
                        if (Number.isFinite(parsed) && parsed >= 0.1 && parsed <= 10) {
                          setSpeed(Math.round(parsed * 1000));
                        }
                      }}
                      onBlur={() => {
                        const next = normalizeSpeed(speedDraft);
                        setSpeed(next);
                        setSpeedDraft(String(Number((next / 1000).toFixed(2))));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                      aria-describedby="flash-speed-help"
                    />
                    <span>秒</span>
                  </div>
                  <small id="flash-speed-help">0.1〜10秒。小数で自由に指定できます。</small>
                </div>
              </fieldset>
            )}

            <button type="button" className="start-button" onClick={startRound} disabled={pool.length === 0}>
              <span>{mode === "sum" ? "暗算を始める" : "即答を始める"}</span>
              <b>START →</b>
            </button>
            <p className="keyboard-hint"><kbd>ENTER</kbd> で回答を確定</p>
          </aside>
        )}

        <section className="stats-strip" aria-label="学習記録">
          <div><span>BEST STREAK</span><strong>{stats.bestStreak}<small>連続</small></strong></div>
          <div><span>LAYER ACCURACY</span><strong>{totalAccuracy}<small>%</small></strong></div>
          <div><span>SUM SESSIONS</span><strong>{stats.sumSessions}<small>回</small></strong></div>
          <p>記録はこの端末だけに保存されます。</p>
        </section>

        <section className="source-note">
          <span>READING NOTE</span>
          <p><strong>写真から厳密に「P」で終わる40語を抽出。</strong> RIPv2・OSPF・POP3など、末尾がPではない表記は除外しています。FHRPは写真の補助見出しですが、テスト対策用に収録しました。</p>
        </section>
      </main>

      <footer><span>LAYER//SUM</span><p>NO LOGIN · LOCAL SAVE · KEYBOARD READY</p><span>BUILD 01</span></footer>

      {editorOpen && (
        <div className="editor-overlay" role="dialog" aria-modal="true" aria-labelledby="editor-title">
          <div className="editor-panel" ref={editorRef}>
            <div className="editor-header">
              <div><span>CARD DATABASE</span><h2 id="editor-title">カードを編集</h2></div>
              <button ref={editorCloseRef} type="button" onClick={() => setEditorOpen(false)} aria-label="カード編集を閉じる">閉じる ×</button>
            </div>
            <div className="editor-notice">
              <strong>読み取り違いがあれば、ここで直接直せます。</strong>
              <p>変更はこの端末に自動保存。表示名・層・出題のON/OFFを編集できます。</p>
            </div>

            <form className="add-card-form" onSubmit={addCard}>
              <label><span>新しい略語</span><input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="例: BFD" /></label>
              <label><span>層</span><select value={newLayer} onChange={(event) => setNewLayer(Number(event.target.value) as Layer)}>{ALL_LAYERS.map((layer) => <option value={layer} key={layer}>L{layer}</option>)}</select></label>
              <button type="submit">追加する</button>
            </form>

            <div className="editor-groups">
              {ALL_LAYERS.map((layer) => {
                const layerCards = cards.filter((card) => card.layer === layer);
                return (
                  <section key={layer} className="editor-group">
                    <div className="layer-heading" data-layer={layer}><span>L{layer}</span><strong>{layerCards.length}語</strong></div>
                    {layerCards.length === 0 ? <p className="empty-layer">対象語なし</p> : (
                      <div className="editor-rows">
                        {layerCards.map((card) => (
                          <div className="editor-row" key={card.id}>
                            <input
                              aria-label={`${card.label}の表示名`}
                              value={card.label}
                              className={card.label.trim() ? "" : "invalid"}
                              onChange={(event) => updateCard(card.id, { label: event.target.value.toUpperCase() })}
                              onBlur={() => {
                                if (!card.label.trim()) updateCard(card.id, { enabled: false });
                              }}
                            />
                            <select aria-label={`${card.label}の層`} value={card.layer} onChange={(event) => updateCard(card.id, { layer: Number(event.target.value) as Layer })}>
                              {ALL_LAYERS.map((optionLayer) => <option value={optionLayer} key={optionLayer}>L{optionLayer}</option>)}
                            </select>
                            <button type="button" className={card.enabled ? "enabled" : "disabled"} onClick={() => updateCard(card.id, { enabled: !card.enabled })}>{card.enabled ? "出題ON" : "出題OFF"}</button>
                            {card.note && <small>{card.note}</small>}
                            {card.source === "custom" && <button type="button" className="delete-card" onClick={() => setCards((previous) => previous.filter((item) => item.id !== card.id))}>削除</button>}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <div className="editor-footer">
              <button type="button" className={resetArmed ? "danger" : ""} onClick={resetCards}>{resetArmed ? "もう一度押すと初期化" : "初期40語に戻す"}</button>
              <button type="button" className="primary-button" onClick={() => setEditorOpen(false)}>編集を完了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
