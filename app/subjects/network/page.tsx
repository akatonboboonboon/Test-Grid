"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_LAYERS,
  DEFAULT_CARDS,
  cardLayerLabel,
  cardLayers,
  normalizeCards,
  shuffle,
  storageRead,
  storageWrite,
  type Layer,
  type ProtocolCard,
} from "../../protocols";

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
  chosen: Layer | null;
  correct: boolean;
  timedOut: boolean;
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
const MIN_IDENTIFY_LIMIT_MS = 500;
const MAX_IDENTIFY_LIMIT_MS = 30_000;
const DEFAULT_IDENTIFY_LIMIT_MS = 3_000;

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

function normalizeIdentifyLimit(value: string | number) {
  const seconds = Number(value);
  return Number.isFinite(seconds)
    ? clamp(Math.round(seconds * 1000), MIN_IDENTIFY_LIMIT_MS, MAX_IDENTIFY_LIMIT_MS)
    : DEFAULT_IDENTIFY_LIMIT_MS;
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

function formatTotals(values: number[]) {
  if (values.length === 0) return "0";
  if (values.length === 1) return String(values[0]);
  if (values.length <= 5) return values.join(" / ");
  const step = values[1] - values[0];
  const fixedStep = values.every((value, index) => index === 0 || value - values[index - 1] === step);
  return `${values[0]}〜${values.at(-1)}${fixedStep && step > 1 ? `（${step}刻み）` : ""}`;
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
  const [identifyLimit, setIdentifyLimit] = useState(DEFAULT_IDENTIFY_LIMIT_MS);
  const [identifyLimitDraft, setIdentifyLimitDraft] = useState("3");
  const [identifyRemaining, setIdentifyRemaining] = useState(DEFAULT_IDENTIFY_LIMIT_MS);
  const [sequence, setSequence] = useState<ProtocolCard[]>([]);
  const [index, setIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [termVisible, setTermVisible] = useState(true);
  const [answer, setAnswer] = useState("");
  const [sumCorrect, setSumCorrect] = useState<boolean | null>(null);
  const [identifyAnswers, setIdentifyAnswers] = useState<IdentifyAnswer[]>([]);
  const [feedback, setFeedback] = useState<{ chosen: Layer | null; correct: boolean; timedOut: boolean } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newLayer, setNewLayer] = useState<Layer>(2);
  const [resetArmed, setResetArmed] = useState(false);
  const answerRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorCloseRef = useRef<HTMLButtonElement>(null);
  const identifyLockedRef = useRef(false);

  /* Device-local preferences can only be restored after the client mounts. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCards(normalizeCards(storageRead<unknown>("layer-sum-cards-v1", DEFAULT_CARDS)));
    setStats(normalizeStats(storageRead<unknown>("layer-sum-stats-v1", EMPTY_STATS)));
    const savedSettings = storageRead<unknown>("layer-sum-settings-v1", null);
    const settings = savedSettings && typeof savedSettings === "object" ? savedSettings as {
      cardCount?: unknown;
      speed?: unknown;
      identifyLimit?: unknown;
    } : {
      cardCount: 5,
      speed: 600,
      identifyLimit: DEFAULT_IDENTIFY_LIMIT_MS,
    };
    const restoredCount = typeof settings.cardCount === "number"
      ? normalizeCardCount(settings.cardCount)
      : 5;
    const restoredSpeed = typeof settings.speed === "number"
      ? clamp(Math.round(settings.speed), MIN_SPEED_MS, MAX_SPEED_MS)
      : 600;
    const restoredIdentifyLimit = typeof settings.identifyLimit === "number"
      ? clamp(Math.round(settings.identifyLimit), MIN_IDENTIFY_LIMIT_MS, MAX_IDENTIFY_LIMIT_MS)
      : DEFAULT_IDENTIFY_LIMIT_MS;
    setCardCount(restoredCount);
    setCardCountDraft(String(restoredCount));
    setSpeed(restoredSpeed);
    setSpeedDraft(String(Number((restoredSpeed / 1000).toFixed(2))));
    setIdentifyLimit(restoredIdentifyLimit);
    setIdentifyLimitDraft(String(Number((restoredIdentifyLimit / 1000).toFixed(1))));
    setIdentifyRemaining(restoredIdentifyLimit);
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    storageWrite("layer-sum-cards-v1", cards);
    storageWrite("layer-sum-stats-v1", stats);
    storageWrite("layer-sum-settings-v1", { cardCount, speed, identifyLimit });
  }, [cards, stats, cardCount, speed, identifyLimit, hydrated]);

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

  const { expectedSums, runningTotals } = useMemo(() => {
    let totals = new Set([0]);
    const running = sequence.map((card) => {
      const next = new Set<number>();
      totals.forEach((total) => {
        cardLayers(card).forEach((layer) => next.add(total + layer));
      });
      totals = next;
      return [...totals].sort((left, right) => left - right);
    });
    return {
      expectedSums: [...totals].sort((left, right) => left - right),
      runningTotals: running,
    };
  }, [sequence]);
  const expectedLabel = formatTotals(expectedSums);

  const identifyScore = identifyAnswers.filter((item) => item.correct).length;
  const currentCard = sequence[index];

  const finishIdentify = useCallback((chosen: Layer | null) => {
    if (phase !== "identify" || feedback || !currentCard || identifyLockedRef.current) return;
    identifyLockedRef.current = true;
    const correct = chosen !== null && cardLayers(currentCard).includes(chosen);
    const timedOut = chosen === null;
    setFeedback({ chosen, correct, timedOut });
    setIdentifyAnswers((previous) => [...previous, { card: currentCard, chosen, correct, timedOut }]);
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
  }, [phase, feedback, currentCard]);

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

  useEffect(() => {
    if (phase !== "identify" || feedback || !currentCard) return;
    identifyLockedRef.current = false;
    const deadline = performance.now() + identifyLimit;
    setIdentifyRemaining(identifyLimit);
    const updateClock = () => {
      setIdentifyRemaining(Math.max(0, deadline - performance.now()));
    };
    const interval = window.setInterval(updateClock, 100);
    const timeout = window.setTimeout(() => {
      setIdentifyRemaining(0);
      finishIdentify(null);
    }, identifyLimit);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [phase, feedback, currentCard, identifyLimit, finishIdentify]);

  function startRound() {
    if (pool.length === 0) return;
    const nextCount = normalizeCardCount(cardCountDraft);
    const nextSpeed = normalizeSpeed(speedDraft);
    const nextIdentifyLimit = normalizeIdentifyLimit(identifyLimitDraft);
    setCardCount(nextCount);
    setCardCountDraft(String(nextCount));
    setSpeed(nextSpeed);
    setSpeedDraft(String(Number((nextSpeed / 1000).toFixed(2))));
    setIdentifyLimit(nextIdentifyLimit);
    setIdentifyLimitDraft(String(Number((nextIdentifyLimit / 1000).toFixed(1))));
    setIdentifyRemaining(nextIdentifyLimit);
    identifyLockedRef.current = false;
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
    const correct = expectedSums.includes(Number(answer));
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
    finishIdentify(chosen);
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
        fullName: newFullName.trim() || undefined,
        layer: newLayer,
        source: "custom",
        enabled: true,
      },
    ]);
    setNewLabel("");
    setNewFullName("");
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
      if (editorOpen) return;
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
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark" aria-hidden="true">L/S</span>
          <span>
            <strong>LAYER//SUM</strong>
            <small>PROTOCOL FLASH DRILL</small>
          </span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {cards.filter((card) => card.enabled).length} CARDS</span>
          <Link className="outline-button header-link" href="/subjects/network/cards">暗記カード</Link>
          <button className="outline-button" type="button" onClick={() => setEditorOpen(true)} disabled={!["idle", "result"].includes(phase)}>
            カードを編集
          </button>
        </div>
      </header>

      <main className={phase === "flash" || phase === "countdown" ? "main-layout focus-mode" : "main-layout"}>
        <section className="intro-block" aria-labelledby="page-title">
          <p className="eyebrow"><span>NETWORK LAYER TRAINING</span><span>PHOTO SET / 01—02</span></p>
          <h1 id="page-title">①〜⑦の用語を、<br /><em>瞬時に足す。</em></h1>
          <p className="lede">丸数字をそのままOSI層番号へ対応。写真内の99個の層別記載を同名ごとにまとめた96枚で、テスト仕様の速さまで叩き込みます。</p>
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
                <small>
                  {sequence.length} CARDS / {mode === "sum"
                    ? `${speed} MS`
                    : `${Number((identifyLimit / 1000).toFixed(1))} SEC / QUESTION`}
                </small>
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
                <p>表示された層番号をすべて足して入力。複数層の語は、写真にあるどちらで足しても正解です。</p>
              </div>
            )}

            {phase === "identify" && currentCard && (
              <div className="identify-stage">
                <div className="flash-meta"><span>CHOOSE THE LAYER</span><span>{String(index + 1).padStart(2, "0")} / {String(sequence.length).padStart(2, "0")}</span></div>
                <div
                  className={`identify-timer ${!feedback && identifyRemaining <= identifyLimit * 0.25 ? "urgent" : ""}`}
                  aria-hidden="true"
                >
                  <strong>{feedback?.timedOut ? "TIME UP" : `${(identifyRemaining / 1000).toFixed(1)}s`}</strong>
                  <span className="identify-timer-track">
                    <i style={{ width: `${Math.max(0, Math.min(100, (identifyRemaining / identifyLimit) * 100))}%` }} />
                  </span>
                </div>
                <p className="sr-announcement" aria-live="polite">
                  {`${currentCard.label}。制限時間は${Number((identifyLimit / 1000).toFixed(1))}秒です。`}
                </p>
                <div className={`identify-card ${feedback ? (feedback.correct ? "correct" : "wrong") : ""}`} data-layer={currentCard.layer}>
                  <strong>{currentCard.label}</strong>
                  {feedback && <small>{feedback.timedOut
                    ? `時間切れ — ${cardLayerLabel(currentCard)} が正解`
                    : feedback.correct
                      ? `正解 — ${cardLayerLabel(currentCard)}`
                      : `${cardLayerLabel(currentCard)} が正解`}</small>}
                </div>
                <div className="layer-keypad" aria-label="層番号を選ぶ">
                  {ALL_LAYERS.map((layer) => (
                    <button
                      type="button"
                      key={layer}
                      aria-label={`第${layer}層`}
                      onClick={() => answerLayer(layer)}
                      disabled={Boolean(feedback)}
                      className={feedback?.chosen === layer ? (feedback.correct ? "picked-correct" : "picked-wrong") : feedback && cardLayers(currentCard).includes(layer) ? "actual" : ""}
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
                  <strong>{expectedLabel}</strong>
                  <p>{sumCorrect ? "正解。変換も加算も完了。" : `あなたの回答：${answer || "—"}`}</p>
                </div>
                <div className="answer-breakdown" aria-label="出題の内訳">
                  {sequence.map((card, cardIndex) => {
                    return (
                      <div className="breakdown-item" key={`${card.id}-${cardIndex}`} data-layer={card.layer}>
                        <span>{card.label}</span><strong>{cardLayerLabel(card)}</strong><small>= {formatTotals(runningTotals[cardIndex])}</small>
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
                      <span>{item.card.label}</span><strong>{cardLayerLabel(item.card)}</strong>
                      {!item.correct && <small>{item.timedOut ? "時間切れ" : `回答 L${item.chosen}`}</small>}
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

            {mode === "identify" && (
              <fieldset>
                <legend><span>02</span> 1問の制限時間</legend>
                <div className="number-setting">
                  <div className="number-input-shell">
                    <input
                      id="identify-limit"
                      type="number"
                      inputMode="decimal"
                      min="0.5"
                      max="30"
                      step="0.1"
                      value={identifyLimitDraft}
                      onChange={(event) => {
                        setIdentifyLimitDraft(event.target.value);
                        const parsed = Number(event.target.value);
                        if (Number.isFinite(parsed) && parsed >= 0.5 && parsed <= 30) {
                          setIdentifyLimit(Math.round(parsed * 1000));
                        }
                      }}
                      onBlur={() => {
                        const next = normalizeIdentifyLimit(identifyLimitDraft);
                        setIdentifyLimit(next);
                        setIdentifyLimitDraft(String(Number((next / 1000).toFixed(1))));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                      aria-describedby="identify-limit-help"
                    />
                    <span>秒</span>
                  </div>
                  <small id="identify-limit-help">0.5〜30秒。1問ごとの制限時間です。</small>
                </div>
              </fieldset>
            )}

            <button type="button" className="start-button" onClick={startRound} disabled={pool.length === 0}>
              <span>{mode === "sum" ? "暗算を始める" : "即答を始める"}</span>
              <b>START →</b>
            </button>
            <p className="keyboard-hint">{mode === "sum"
              ? <><kbd>ENTER</kbd> で回答を確定</>
              : <><kbd>1</kbd>〜<kbd>7</kbd> キーでも回答</>}
            </p>
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
          <p><strong>丸数字①〜⑦を、そのまま第1〜第7層として再読解。</strong> 欄内の用語と実用的な括弧内表記を収録し、規格番号などの説明書きと③より上の欄外メモは除外しました。同じ表記は1枚へ統合し、イーサネット・SSH・TLSは写真どおり複数の層を正解にします。</p>
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
              <p>変更はこの端末に自動保存。表示名・正式名称・層・出題のON/OFFを編集できます。</p>
            </div>

            <form className="add-card-form" onSubmit={addCard}>
              <label><span>新しい略語</span><input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="例: BFD" /></label>
              <label className="add-full-name"><span>正式名称</span><input value={newFullName} onChange={(event) => setNewFullName(event.target.value)} placeholder="例: Bidirectional Forwarding Detection" /></label>
              <label><span>層</span><select value={newLayer} onChange={(event) => setNewLayer(Number(event.target.value) as Layer)}>{ALL_LAYERS.map((layer) => <option value={layer} key={layer}>L{layer}</option>)}</select></label>
              <button type="submit">追加する</button>
            </form>

            <div className="editor-groups">
              {ALL_LAYERS.map((layer) => {
                const layerCards = cards.filter((card) => cardLayers(card).includes(layer));
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
                            <select aria-label={`${card.label}の層`} value={layer} onChange={(event) => {
                              const nextLayer = Number(event.target.value) as Layer;
                              const nextLayers = [...new Set(
                                cardLayers(card).map((currentLayer) => currentLayer === layer ? nextLayer : currentLayer),
                              )].sort((left, right) => left - right);
                              updateCard(card.id, {
                                layer: nextLayers[0],
                                layers: nextLayers.length > 1 ? nextLayers : undefined,
                              });
                            }}>
                              {ALL_LAYERS.map((optionLayer) => <option value={optionLayer} key={optionLayer}>L{optionLayer}</option>)}
                            </select>
                            <button type="button" className={card.enabled ? "enabled" : "disabled"} onClick={() => updateCard(card.id, { enabled: !card.enabled })}>{card.enabled ? "出題ON" : "出題OFF"}</button>
                            <input
                              aria-label={`${card.label}の正式名称`}
                              className="editor-full-name"
                              value={card.fullName ?? ""}
                              onChange={(event) => updateCard(card.id, { fullName: event.target.value })}
                              placeholder="正式名称未登録"
                            />
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
              <button type="button" className={resetArmed ? "danger" : ""} onClick={resetCards}>{resetArmed ? "もう一度押すと初期化" : "初期96枚に戻す"}</button>
              <button type="button" className="primary-button" onClick={() => setEditorOpen(false)}>編集を完了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
