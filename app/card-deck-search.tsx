"use client";

import { useId, useMemo, useRef, useState } from "react";

export type CardDeckSearchItem = {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  searchText?: readonly (string | null | undefined)[];
};

type RankedItem = {
  item: CardDeckSearchItem;
  kind: "match" | "fuzzy";
  score: number;
};

type CardDeckSearchProps = {
  items: readonly CardDeckSearchItem[];
  currentId?: string;
  label?: string;
  placeholder?: string;
  onSelect: (id: string) => void;
};

export function normalizeDeckSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .replace(/[{}_^$]/g, " ")
    .replace(/[「」『』【】［］\[\]（）()、。・，,.!?！？:：;；/\\|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function itemFields(item: CardDeckSearchItem) {
  return [item.label, item.description, item.meta, ...(item.searchText ?? [])]
    .filter((value): value is string => Boolean(value?.trim()))
    .flatMap((value) => {
      const normalized = normalizeDeckSearchText(value);
      return normalized ? [normalized, ...normalized.split(" ").filter((token) => token.length > 1)] : [];
    });
}

function editDistance(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(previous[rightIndex] + 1, current[rightIndex - 1] + 1, substitution);
    }
    for (let index = 0; index < current.length; index += 1) previous[index] = current[index];
  }
  return previous[right.length];
}

function fuzzyDistance(query: string, field: string) {
  const compactQuery = query.replace(/\s/g, "").slice(0, 48);
  const compactField = field.replace(/\s/g, "").slice(0, 240);
  if (!compactQuery || !compactField) return Number.POSITIVE_INFINITY;
  if (compactField.length <= compactQuery.length + 2) return editDistance(compactQuery, compactField);

  // Approximate substring distance in O(query × field), so large English decks
  // stay responsive while the user types on a phone.
  let previous = Array.from({ length: compactField.length + 1 }, () => 0);
  for (let queryIndex = 1; queryIndex <= compactQuery.length; queryIndex += 1) {
    const current = [queryIndex];
    for (let fieldIndex = 1; fieldIndex <= compactField.length; fieldIndex += 1) {
      const substitution = previous[fieldIndex - 1]
        + (compactQuery[queryIndex - 1] === compactField[fieldIndex - 1] ? 0 : 1);
      current[fieldIndex] = Math.min(
        previous[fieldIndex] + 1,
        current[fieldIndex - 1] + 1,
        substitution,
      );
    }
    previous = current;
  }
  return Math.min(...previous);
}

export function rankDeckSearchItems(items: readonly CardDeckSearchItem[], rawQuery: string): RankedItem[] {
  const query = normalizeDeckSearchText(rawQuery);
  if (!query) return [];

  const matches: RankedItem[] = [];
  const fuzzy: RankedItem[] = [];
  for (const item of items) {
    const fields = itemFields(item);
    let bestMatch = Number.POSITIVE_INFINITY;
    for (const field of fields) {
      if (field === query) bestMatch = Math.min(bestMatch, 0);
      else if (field.startsWith(query)) bestMatch = Math.min(bestMatch, 10 + field.length - query.length);
      else {
        const position = field.indexOf(query);
        if (position >= 0) bestMatch = Math.min(bestMatch, 30 + position);
      }
    }
    if (Number.isFinite(bestMatch)) {
      matches.push({ item, kind: "match", score: bestMatch });
      continue;
    }

    if (query.replace(/\s/g, "").length < 2) continue;
    const distance = Math.min(...fields.map((field) => fuzzyDistance(query, field)));
    const threshold = Math.max(1, Math.floor(query.replace(/\s/g, "").length * 0.34));
    if (distance <= threshold) fuzzy.push({ item, kind: "fuzzy", score: 100 + distance });
  }

  return [...matches.sort((left, right) => left.score - right.score || left.item.label.localeCompare(right.item.label, "ja")),
    ...fuzzy.sort((left, right) => left.score - right.score || left.item.label.localeCompare(right.item.label, "ja"))]
    .slice(0, 10);
}

export default function CardDeckSearch({
  items,
  currentId,
  label = "この暗記帳を検索",
  placeholder = "単語・公式・説明を入力",
  onSelect,
}: CardDeckSearchProps) {
  const generatedId = useId().replace(/:/g, "");
  const inputId = `deck-search-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ranked = useMemo(() => rankDeckSearchItems(items, query), [items, query]);
  const exactResults = ranked.filter((entry) => entry.kind === "match");
  const fuzzyResults = ranked.filter((entry) => entry.kind === "fuzzy");
  const visible = open && Boolean(query.trim());

  function selectItem(entry: RankedItem) {
    setQuery(entry.item.label);
    setOpen(false);
    setActiveIndex(0);
    onSelect(entry.item.id);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!ranked.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (
        event.key === "ArrowDown"
          ? (index + 1) % ranked.length
          : (index - 1 + ranked.length) % ranked.length
      ));
    } else if (event.key === "Enter" && visible) {
      event.preventDefault();
      selectItem(ranked[Math.min(activeIndex, ranked.length - 1)]);
    }
  }

  return (
    <div
      className="deck-search"
      data-card-deck-search
      ref={rootRef}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={inputId}>{label}<small>{items.length}枚から検索</small></label>
      <div className="deck-search-input-row">
        <input
          id={inputId}
          type="search"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={listboxId}
          aria-activedescendant={visible && ranked.length ? `${inputId}-option-${activeIndex}` : undefined}
          onFocus={() => setOpen(Boolean(query.trim()))}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
        {query && <button type="button" onClick={() => { setQuery(""); setOpen(false); setActiveIndex(0); }}>クリア</button>}
      </div>

      {visible && (
        <div className="deck-search-popover">
          {ranked.length ? (
            <ul id={listboxId} role="listbox" aria-label="暗記カードの検索候補">
              {ranked.map((entry, index) => {
                const startsFuzzySection = entry.kind === "fuzzy" && (index === 0 || ranked[index - 1].kind !== "fuzzy");
                const startsMatchSection = entry.kind === "match" && index === 0;
                return (
                  <li key={entry.item.id} role="presentation">
                    {startsMatchSection && <span className="deck-search-group-label">検索結果 {exactResults.length}件</span>}
                    {startsFuzzySection && <span className="deck-search-group-label is-fuzzy">もしかして？ {fuzzyResults.length}件</span>}
                    <button
                      id={`${inputId}-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={index === activeIndex ? "is-active" : ""}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectItem(entry)}
                    >
                      <span><strong>{entry.item.label}</strong>{entry.item.description && <small>{entry.item.description}</small>}</span>
                      <em>{entry.item.id === currentId ? "表示中" : entry.item.meta || "このカードへ"}</em>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p id={listboxId} className="deck-search-no-result" role="status">一致するカードがありません。別の表記も試してください。</p>
          )}
        </div>
      )}
    </div>
  );
}
