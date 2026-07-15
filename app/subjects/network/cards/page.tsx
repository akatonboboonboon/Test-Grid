"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  cardLayerLabel,
  DEFAULT_CARDS,
  normalizeCards,
  shuffle,
  storageRead,
  storageWrite,
  type ProtocolCard,
} from "../../../protocols";

type MemoryState = "learning" | "mastered";
type MemoryProgress = Record<string, MemoryState>;

function normalizeProgress(value: unknown, cards: ProtocolCard[]): MemoryProgress {
  if (!value || typeof value !== "object") return {};
  const saved = value as Record<string, unknown>;
  return Object.fromEntries(
    cards.flatMap((card) => saved[card.id] === "learning" || saved[card.id] === "mastered"
      ? [[card.id, saved[card.id] as MemoryState]]
      : []),
  );
}

export default function CardsPage() {
  const [cards, setCards] = useState<ProtocolCard[]>(DEFAULT_CARDS);
  const [deck, setDeck] = useState<ProtocolCard[]>(DEFAULT_CARDS);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<MemoryProgress>({});
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [resetArmed, setResetArmed] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  /* Device-local cards and progress are restored after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const usableCards = normalizeCards(storageRead<unknown>("layer-sum-cards-v1", DEFAULT_CARDS))
      .filter((card) => card.enabled && card.label.trim());
    setCards(usableCards);
    setDeck(shuffle(usableCards));
    setProgress(normalizeProgress(storageRead<unknown>("layer-sum-memory-v1", {}), usableCards));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (hydrated) storageWrite("layer-sum-memory-v1", progress);
  }, [progress, hydrated]);

  const currentCard = deck[index];
  const currentLayerLabel = currentCard ? cardLayerLabel(currentCard) : "";
  const currentFullName = currentCard?.fullName?.trim() || "正式名称未登録";
  const masteredCount = useMemo(
    () => cards.filter((card) => progress[card.id] === "mastered").length,
    [cards, progress],
  );
  const learningCount = useMemo(
    () => cards.filter((card) => progress[card.id] === "learning").length,
    [cards, progress],
  );
  const completion = cards.length ? Math.round((masteredCount / cards.length) * 100) : 0;

  function focusCard() {
    window.setTimeout(() => cardRef.current?.focus(), 0);
  }

  function move(delta: number) {
    if (!deck.length) return;
    setIndex((current) => (current + delta + deck.length) % deck.length);
    setFlipped(false);
    setAnnouncement("");
    focusCard();
  }

  function markCard(state: MemoryState) {
    if (!currentCard) return;
    setProgress((previous) => ({ ...previous, [currentCard.id]: state }));
    setAnnouncement(state === "mastered"
      ? `${currentCard.label}を「覚えた」にしました。次のカードです。`
      : `${currentCard.label}を復習に残しました。次のカードです。`);
    setIndex((current) => (current + 1) % deck.length);
    setFlipped(false);
    focusCard();
  }

  function shuffleDeck(source: ProtocolCard[] = cards) {
    if (!source.length) return;
    setDeck(shuffle(source));
    setIndex(0);
    setFlipped(false);
    setAnnouncement(`${source.length}枚をシャッフルしました。`);
    focusCard();
  }

  function reviewUnmastered() {
    const remaining = cards.filter((card) => progress[card.id] !== "mastered");
    if (!remaining.length) {
      shuffleDeck(cards);
      setAnnouncement(`全カード暗記済みです。全${cards.length}枚でもう一周します。`);
      return;
    }
    shuffleDeck(remaining);
    setAnnouncement(`未暗記の${remaining.length}枚だけで復習を始めます。`);
  }

  function resetProgress() {
    if (!resetArmed) {
      setResetArmed(true);
      window.setTimeout(() => setResetArmed(false), 3500);
      return;
    }
    setProgress({});
    setResetArmed(false);
    setAnnouncement("暗記進捗をリセットしました。");
    shuffleDeck(cards);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.code === "Space" && !target?.matches("button, a")) {
        event.preventDefault();
        setFlipped((value) => !value);
      } else if (flipped && event.key === "1") {
        markCard("learning");
      } else if (flipped && event.key === "2") {
        markCard("mastered");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="app-frame memory-page">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark" aria-hidden="true">L/S</span>
          <span>
            <strong>LAYER//SUM</strong>
            <small>MEMORY CARD DECK</small>
          </span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {cards.length} CARDS</span>
          <Link className="outline-button header-link" href="/subjects/network">暗算へ戻る</Link>
        </div>
      </header>

      <main className="memory-main">
        <section className="memory-hero">
          <div>
            <p className="eyebrow"><span>MEMORY MODE</span><span>FRONT → BACK</span></p>
            <h1>まず覚える。<br /><em>それから、足す。</em></h1>
          </div>
          <p>表の略語を見て層番号と正式名称を思い出し、カードをめくって確認。覚えたカードと復習カードは、この端末に記録されます。</p>
        </section>

        <section className="memory-progress" aria-label="暗記進捗">
          <div className="memory-progress-copy">
            <span>MASTERED</span>
            <strong>{masteredCount}<small> / {cards.length}</small></strong>
          </div>
          <div className="memory-progress-track" aria-hidden="true"><i style={{ width: `${completion}%` }} /></div>
          <div className="memory-progress-meta"><span>{completion}% 完了</span><span>復習 {learningCount}枚</span></div>
        </section>

        {currentCard ? (
          <section className="memory-workspace" aria-label="暗記カード">
            <div className="memory-deck-meta">
              <span>DECK {String(index + 1).padStart(2, "0")} / {String(deck.length).padStart(2, "0")}</span>
              <span className={`memory-status status-${progress[currentCard.id] ?? "new"}`}>
                {progress[currentCard.id] === "mastered" ? "覚えた" : progress[currentCard.id] === "learning" ? "復習" : "未判定"}
              </span>
            </div>

            <div className="memory-card-area">
              <button
                ref={cardRef}
                type="button"
                className={`memory-card ${flipped ? "is-flipped" : ""}`}
                data-layer={currentCard.layer}
                onClick={() => setFlipped((value) => !value)}
                aria-pressed={flipped}
                aria-label={flipped
                  ? `${currentCard.label}。正式名称は${currentFullName}。層は${currentLayerLabel}。表面に戻す`
                  : `${currentCard.label}の層と正式名称を表示`}
              >
                {!flipped ? (
                  <span className="memory-card-face memory-front" key="front">
                    <small>PROTOCOL</small>
                    <strong>{currentCard.label}</strong>
                    <em>タップして層と正式名称を確認</em>
                  </span>
                ) : (
                  <span className="memory-card-face memory-back" key="back">
                    <small>OSI LAYER</small>
                    <strong className="memory-layer-answer">{currentLayerLabel}</strong>
                    <span className="memory-answer-label">{currentCard.label}</span>
                    <span className="memory-full-name">{currentFullName}</span>
                    <em>タップして表に戻る</em>
                  </span>
                )}
              </button>
            </div>

            <div className="memory-side">
              <div className="memory-nav">
                <button type="button" onClick={() => move(-1)} aria-label="前のカード">← <span>PREV</span></button>
                <button type="button" onClick={() => move(1)} aria-label="次のカード"><span>NEXT</span> →</button>
              </div>

              <div className="memory-judge" aria-label="暗記状態を記録">
                <button type="button" className="learning" disabled={!flipped} onClick={() => markCard("learning")}>
                  <span>1</span><strong>もう一度</strong><small>復習に残す</small>
                </button>
                <button type="button" className="mastered" disabled={!flipped} onClick={() => markCard("mastered")}>
                  <span>2</span><strong>覚えた</strong><small>暗記済みにする</small>
                </button>
              </div>
            </div>

            <p className="memory-hint">カードは <kbd>SPACE</kbd> で反転 · <kbd>←</kbd><kbd>→</kbd> で移動 · 裏面で <kbd>1</kbd>/<kbd>2</kbd></p>
          </section>
        ) : (
          <section className="memory-empty">
            <span>EMPTY DECK</span><h2>出題できるカードがありません。</h2><p>暗算ページの「カードを編集」で、出題するカードをONにしてください。</p><Link href="/subjects/network">暗算ページへ戻る</Link>
          </section>
        )}

        <section className="memory-tools" aria-label="暗記デッキ操作">
          <button type="button" onClick={() => shuffleDeck(cards)}><span>SHUFFLE</span><strong>全カードを混ぜる</strong></button>
          <button type="button" onClick={reviewUnmastered}><span>REVIEW</span><strong>未暗記だけ復習</strong></button>
          <button type="button" className={resetArmed ? "danger" : ""} onClick={resetProgress}><span>RESET</span><strong>{resetArmed ? "もう一度押して初期化" : "進捗をリセット"}</strong></button>
        </section>
        <p className="sr-announcement" aria-live="polite">{announcement}</p>
      </main>

      <footer><span>LAYER//SUM</span><p>FLIP · RECALL · REPEAT</p><span>MEMORY 01</span></footer>
    </div>
  );
}
