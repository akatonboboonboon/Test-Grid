"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  ALL_LAYERS,
  cardLayers,
  cardLayerLabel,
  DEFAULT_CARDS,
  normalizeCards,
  shuffle,
  storageRead,
  storageWrite,
  type Layer,
  type ProtocolCard,
} from "../../../protocols";

type MemoryState = "learning" | "mastered";
type MemoryProgress = Record<string, MemoryState>;
type LayerFilter = "all" | Layer;

const LAYER_FILTER_STORAGE_KEY = "layer-sum-memory-filter-v1";

function normalizeLayerFilter(value: unknown): LayerFilter {
  return value === "all" || (typeof value === "number" && ALL_LAYERS.includes(value as Layer))
    ? value as LayerFilter
    : "all";
}

function filterCardsByLayer(cards: ProtocolCard[], layer: LayerFilter) {
  return layer === "all" ? cards : cards.filter((card) => cardLayers(card).includes(layer));
}

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/[\s\p{P}\p{S}]+/gu, "");
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      previous[rightIndex] = left[leftIndex - 1] === right[rightIndex - 1]
        ? diagonal
        : Math.min(diagonal, above, previous[rightIndex - 1]) + 1;
      diagonal = above;
    }
  }
  return previous[right.length];
}

function cardSearchFields(card: ProtocolCard) {
  return [card.label, card.fullName, card.description, card.note]
    .filter((value): value is string => Boolean(value?.trim()));
}

function fuzzyScore(card: ProtocolCard, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 0;
  let best = Number.POSITIVE_INFINITY;
  for (const field of cardSearchFields(card)) {
    const normalized = normalizeSearchText(field);
    if (normalized.includes(query)) return 0;
    const words = field.normalize("NFKC").toLocaleLowerCase("ja-JP").split(/[\s/・（）()［\][\],、。:：;；]+/u);
    for (const word of [normalized, ...words.map(normalizeSearchText)].filter(Boolean)) {
      const candidate = word.length > query.length + 4 ? word.slice(0, query.length + 4) : word;
      best = Math.min(best, editDistance(query, candidate));
    }
  }
  return best;
}

function protocolFieldScore(field: string | undefined, query: string, priority: number) {
  const normalized = normalizeSearchText(field ?? "");
  if (!normalized || !query) return Number.POSITIVE_INFINITY;
  if (normalized === query) return priority;
  if (normalized.startsWith(query)) return 20 + priority;
  if (normalized.includes(query)) return 40 + priority;
  return Number.POSITIVE_INFINITY;
}

function exactProtocolScore(card: ProtocolCard, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 0;
  return Math.min(
    protocolFieldScore(card.label, query, 0),
    protocolFieldScore(card.fullName, query, 1),
    protocolFieldScore(card.description, query, 100),
    protocolFieldScore(card.note, query, 101),
  );
}

function searchCards(cards: ProtocolCard[], query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return cards;
  return cards
    .map((card) => ({ card, score: exactProtocolScore(card, normalizedQuery) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((left, right) => left.score - right.score || left.card.label.localeCompare(right.card.label, "ja"))
    .map(({ card }) => card);
}

function suggestCards(cards: ProtocolCard[], query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const threshold = Math.max(1, Math.min(4, Math.floor(normalizedQuery.length * 0.4)));
  return cards
    .map((card) => {
      const exactScore = exactProtocolScore(card, normalizedQuery);
      if (Number.isFinite(exactScore)) return { card, score: exactScore };
      if (normalizedQuery.length < 2) return null;
      const distance = fuzzyScore(card, normalizedQuery);
      return distance <= threshold ? { card, score: 1000 + distance } : null;
    })
    .filter((entry): entry is { card: ProtocolCard; score: number } => entry !== null)
    .sort((left, right) => left.score - right.score || left.card.label.localeCompare(right.card.label, "ja"))
    .slice(0, 8)
    .map(({ card }) => card);
}

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
  const [selectedLayer, setSelectedLayer] = useState<LayerFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
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
    const savedLayer = normalizeLayerFilter(storageRead<unknown>(LAYER_FILTER_STORAGE_KEY, "all"));
    setCards(usableCards);
    setSelectedLayer(savedLayer);
    setDeck(shuffle(filterCardsByLayer(usableCards, savedLayer)));
    setProgress(normalizeProgress(storageRead<unknown>("layer-sum-memory-v1", {}), usableCards));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (hydrated) storageWrite("layer-sum-memory-v1", progress);
  }, [progress, hydrated]);

  useEffect(() => {
    if (hydrated) storageWrite(LAYER_FILTER_STORAGE_KEY, selectedLayer);
  }, [selectedLayer, hydrated]);

  const currentCard = deck[index];
  const currentLayerLabel = currentCard ? cardLayerLabel(currentCard) : "";
  const currentFullName = currentCard?.fullName?.trim() || "正式名称未登録";
  const currentDescription = currentCard?.description?.trim() || "このカードの働きはまだ登録されていません。";
  const layerCards = useMemo(
    () => filterCardsByLayer(cards, selectedLayer),
    [cards, selectedLayer],
  );
  const filteredCards = useMemo(
    () => searchCards(layerCards, searchQuery),
    [layerCards, searchQuery],
  );
  const searchSuggestions = useMemo(
    () => suggestCards(layerCards, searchQuery),
    [layerCards, searchQuery],
  );
  const showSearchSuggestions = hydrated
    && suggestionsOpen
    && Boolean(normalizeSearchText(searchQuery))
    && searchSuggestions.length > 0;
  const layerCounts = useMemo(
    () => Object.fromEntries(ALL_LAYERS.map((layer) => [
      layer,
      filterCardsByLayer(cards, layer).length,
    ])) as Record<Layer, number>,
    [cards],
  );
  const masteredCount = useMemo(
    () => filteredCards.filter((card) => progress[card.id] === "mastered").length,
    [filteredCards, progress],
  );
  const learningCount = useMemo(
    () => filteredCards.filter((card) => progress[card.id] === "learning").length,
    [filteredCards, progress],
  );
  const completion = filteredCards.length ? Math.round((masteredCount / filteredCards.length) * 100) : 0;

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

  function shuffleDeck(source: ProtocolCard[] = filteredCards) {
    if (!source.length) {
      setDeck([]);
      setIndex(0);
      setFlipped(false);
      return;
    }
    setDeck(shuffle(source));
    setIndex(0);
    setFlipped(false);
    setAnnouncement(`${source.length}枚をシャッフルしました。`);
    focusCard();
  }

  function changeLayerFilter(nextLayer: LayerFilter) {
    const nextCards = searchCards(filterCardsByLayer(cards, nextLayer), searchQuery);
    setSelectedLayer(nextLayer);
    setSuggestionsOpen(Boolean(normalizeSearchText(searchQuery)));
    setHighlightedSuggestion(0);
    setResetArmed(false);
    shuffleDeck(nextCards);
    setAnnouncement(nextLayer === "all"
      ? `全レイヤーの${nextCards.length}枚に切り替えました。`
      : `第${nextLayer}層の${nextCards.length}枚に絞り込みました。`);
  }

  function updateSearch(nextQuery: string) {
    const nextCards = searchCards(filterCardsByLayer(cards, selectedLayer), nextQuery);
    setSearchQuery(nextQuery);
    setSuggestionsOpen(Boolean(normalizeSearchText(nextQuery)));
    setHighlightedSuggestion(0);
    setDeck(nextCards);
    setIndex(0);
    setFlipped(false);
    setResetArmed(false);
    setAnnouncement(nextQuery.trim()
      ? nextCards.length
        ? `${nextCards.length}枚が見つかりました。先頭のカードを表示します。`
        : "完全一致はありません。入力欄の「もしかして？」候補を確認してください。"
      : "検索を解除しました。");
  }

  function selectSearchSuggestion(card: ProtocolCard) {
    setSearchQuery(card.label);
    setDeck([card]);
    setIndex(0);
    setFlipped(false);
    setSuggestionsOpen(false);
    setHighlightedSuggestion(0);
    setResetArmed(false);
    setAnnouncement(`${card.label}のカードを表示しました。`);
    focusCard();
  }

  function handleSearchInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || isComposing) return;
    if (event.key === "ArrowDown" && searchSuggestions.length) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setHighlightedSuggestion((value) => (value + 1) % searchSuggestions.length);
    } else if (event.key === "ArrowUp" && searchSuggestions.length) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setHighlightedSuggestion((value) => (value - 1 + searchSuggestions.length) % searchSuggestions.length);
    } else if (event.key === "Enter" && suggestionsOpen && searchSuggestions.length) {
      event.preventDefault();
      selectSearchSuggestion(searchSuggestions[Math.min(highlightedSuggestion, searchSuggestions.length - 1)]);
    } else if (event.key === "Escape") {
      setSuggestionsOpen(false);
    }
  }

  function reviewUnmastered() {
    const remaining = filteredCards.filter((card) => progress[card.id] !== "mastered");
    if (!remaining.length) {
      shuffleDeck(filteredCards);
      setAnnouncement(`${selectedLayer === "all" ? "全カード" : `第${selectedLayer}層`}は暗記済みです。${filteredCards.length}枚でもう一周します。`);
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
    shuffleDeck(filteredCards);
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
          <span className="card-count-label"><i aria-hidden="true" /> {selectedLayer === "all" ? cards.length : `${filteredCards.length} / ${cards.length}`} CARDS</span>
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

        <section className="memory-search" aria-labelledby="memory-search-title">
          <label htmlFor="memory-card-search">
            <span>SEARCH CARDS</span>
            <strong id="memory-search-title">カードを検索</strong>
          </label>
          <div className="memory-search-controls">
            <div className="memory-search-input-wrap">
              <input
                id="memory-card-search"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="memory-search-suggestions"
                aria-expanded={showSearchSuggestions}
                aria-activedescendant={showSearchSuggestions ? "memory-search-suggestion-" + highlightedSuggestion : undefined}
                autoComplete="off"
                spellCheck={false}
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                onFocus={() => setSuggestionsOpen(Boolean(normalizeSearchText(searchQuery)))}
                onBlur={() => setSuggestionsOpen(false)}
                onKeyDown={handleSearchInputKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="略語・正式名称・働きで検索"
              />
              {showSearchSuggestions && (
                <div className="memory-search-suggestions" id="memory-search-suggestions">
                  <span>入力候補 / もしかして？</span>
                  <ol role="listbox" aria-label="プロトコルカードの入力候補">
                    {searchSuggestions.map((card, suggestionIndex) => {
                      const exact = Number.isFinite(exactProtocolScore(card, searchQuery));
                      return (
                        <li
                          id={"memory-search-suggestion-" + suggestionIndex}
                          role="option"
                          aria-selected={highlightedSuggestion === suggestionIndex}
                          key={card.id}
                        >
                          <button
                            type="button"
                            onPointerDown={(event) => event.preventDefault()}
                            onClick={() => selectSearchSuggestion(card)}
                            onMouseEnter={() => setHighlightedSuggestion(suggestionIndex)}
                          >
                            <strong>{card.label}</strong>
                            <small>{card.fullName?.trim() || card.description?.trim() || "説明未登録"}</small>
                            <em>{exact ? "一致" : "もしかして？"}</em>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
            {searchQuery && <button type="button" className="clear" onClick={() => updateSearch("")}>検索を消す</button>}
          </div>
          <p aria-live="polite">
            <strong>{filteredCards.length}枚</strong>
            {searchQuery && !filteredCards.length && searchSuggestions.length
              ? " · 入力欄に近い候補があります"
              : "を表示中"}
          </p>
        </section>

        <section className="memory-layer-filter" aria-labelledby="memory-layer-filter-title">
          <div className="memory-layer-filter-copy">
            <span>FILTER DECK</span>
            <h2 id="memory-layer-filter-title">レイヤーで絞り込み</h2>
            <p>選んだ層のカードだけをシャッフル・復習します。複数層に属するカードは、どちらの層にも表示されます。</p>
          </div>
          <div className="memory-layer-filter-buttons" role="group" aria-label="出題するレイヤー">
            <button
              type="button"
              className={selectedLayer === "all" ? "active" : ""}
              aria-pressed={selectedLayer === "all"}
              onClick={() => changeLayerFilter("all")}
            >
              <strong>全レイヤー</strong><small>{cards.length}枚</small>
            </button>
            {ALL_LAYERS.map((layer) => (
              <button
                type="button"
                key={layer}
                className={selectedLayer === layer ? "active" : ""}
                aria-pressed={selectedLayer === layer}
                onClick={() => changeLayerFilter(layer)}
              >
                <strong>L{layer}</strong><small>{layerCounts[layer]}枚</small>
              </button>
            ))}
          </div>
        </section>

        <section className="memory-progress" aria-label="暗記進捗">
          <div className="memory-progress-copy">
            <span>{selectedLayer === "all" ? "ALL LAYERS" : `LAYER ${selectedLayer}`} · MASTERED</span>
            <strong>{masteredCount}<small> / {filteredCards.length}</small></strong>
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
              <aside className={`memory-explanation ${flipped ? "is-visible" : ""}`} aria-live="polite">
                <span>{flipped ? "WHAT IT DOES" : "FLIP TO LEARN"}</span>
                {flipped ? (
                  <>
                    <h2>{currentCard.label}の働き</h2>
                    <p>{currentDescription}</p>
                    {currentCard.note && <small>{currentCard.note}</small>}
                  </>
                ) : (
                  <>
                    <h2>カードを裏返す</h2>
                    <p>層と正式名称に加えて、このプロトコルが何をするものかをここで確認できます。</p>
                  </>
                )}
              </aside>

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
            <span>EMPTY DECK</span><h2>{selectedLayer === "all" ? "出題できるカードがありません。" : `第${selectedLayer}層に出題できるカードがありません。`}</h2><p>別のレイヤーを選ぶか、暗算ページの「カードを編集」で出題するカードをONにしてください。</p><Link href="/subjects/network">暗算ページへ戻る</Link>
            {searchQuery && <button type="button" onClick={() => updateSearch("")}>検索を解除して全カードを表示</button>}
          </section>
        )}

        <section className="memory-tools" aria-label="暗記デッキ操作">
          <button type="button" onClick={() => shuffleDeck(filteredCards)}><span>SHUFFLE</span><strong>選択中のカードを混ぜる</strong></button>
          <button type="button" onClick={reviewUnmastered}><span>REVIEW</span><strong>未暗記だけ復習</strong></button>
          <button type="button" className={resetArmed ? "danger" : ""} onClick={resetProgress}><span>RESET</span><strong>{resetArmed ? "もう一度押して初期化" : "進捗をリセット"}</strong></button>
        </section>
        <p className="sr-announcement" aria-live="polite">{announcement}</p>
      </main>

      <footer><span>LAYER//SUM</span><p>FLIP · RECALL · REPEAT</p><span>MEMORY 01</span></footer>
    </div>
  );
}
