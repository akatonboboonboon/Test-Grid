"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import CardFaceList from "./card-face-list";
import { DisplayMath, RichMathText } from "./statistics-math";
import { ENGLISH_QUESTIONS } from "./english-data";
import { MECHANICAL_DYNAMICS_QUESTIONS } from "./mechanical-dynamics-data";
import { THERMODYNAMICS_FORMULAS, THERMODYNAMICS_QUESTIONS } from "./thermodynamics-data";
import { SMART_CONTROL_QUESTIONS } from "./smart-control-data";
import { TEXTBOOK_RESPONSE_QUESTIONS } from "./smart-control-textbook-data";
import { STATISTICS_FORMULAS, STATISTICS_QUESTIONS } from "./statistics-data";
import { APPLIED_MATH_QUESTIONS } from "./applied-math-data";
import { DIGITAL_CIRCUIT_ALL_QUESTIONS } from "./digital-circuits-extra-data";
import { MATERIAL_MECHANICS_FORMULAS, MATERIAL_MECHANICS_QUESTIONS } from "./material-mechanics-data";
import {
  RAPID_SUBJECTS,
  RAPID_SUBJECT_IDS,
  getStaticRapidPool,
  networkCardsToRapid,
  rapidSubjectMeta,
  type RapidQuestion,
} from "./rapid-quiz-data";
import { DEFAULT_CARDS, normalizeCards, storageRead } from "./protocols";
import { type SubjectId } from "./study-data";

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s。、，,.!?！？「」『』（）()[\]{}:：;；・]+/gu, "");
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

function searchFields(card: RapidQuestion) {
  const subject = rapidSubjectMeta(card.subjectId);
  return [
    subject.name,
    card.topicLabel,
    card.prompt,
    card.answer,
    card.explanation,
    ...card.acceptedOptions,
  ].filter(Boolean);
}

function fuzzyScore(card: RapidQuestion, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 0;
  let best = Number.POSITIVE_INFINITY;
  for (const field of searchFields(card)) {
    const normalized = normalizeSearchText(field);
    if (normalized.includes(query) || query.includes(normalized)) return 0;
    const words = field.split(/[\s/・（）()[\]、。,:：;；]+/u).map(normalizeSearchText).filter(Boolean);
    for (const word of [normalized, ...words]) {
      const candidate = word.length > query.length + 5 ? word.slice(0, query.length + 5) : word;
      best = Math.min(best, editDistance(query, candidate));
    }
  }
  return best;
}

function cardKey(card: RapidQuestion) {
  return card.subjectId + ":" + card.id;
}

function fieldMatchScore(field: string, query: string, priority: number) {
  const normalized = normalizeSearchText(field);
  if (!normalized || !query) return Number.POSITIVE_INFINITY;
  if (normalized === query) return priority;
  if (normalized.startsWith(query)) return 20 + priority;
  if (normalized.includes(query)) return 40 + priority;
  return Number.POSITIVE_INFINITY;
}

function exactMatchScore(card: RapidQuestion, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 0;
  const primary = [card.prompt, card.answer, ...card.acceptedOptions, card.topicLabel];
  const secondary = [rapidSubjectMeta(card.subjectId).name, card.explanation];
  return Math.min(
    ...primary.map((field, index) => fieldMatchScore(field, query, index)),
    ...secondary.map((field, index) => fieldMatchScore(field, query, 100 + index)),
  );
}

function suggestionInputValue(card: RapidQuestion, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  const candidates = [card.prompt, card.answer, ...card.acceptedOptions, card.topicLabel]
    .map((field, index) => ({ field, score: fieldMatchScore(field, query, index) }))
    .sort((left, right) => left.score - right.score);
  return Number.isFinite(candidates[0]?.score) ? candidates[0].field : card.prompt;
}

type ReviewQuestionSeed = {
  id: string;
  prompt: string;
  answer: string;
  explanation?: string;
  accepted?: string[];
  options?: string[];
  group?: string;
  genre?: string;
};

function reviewQuestionsToCards(
  subjectId: SubjectId,
  questions: readonly ReviewQuestionSeed[],
) {
  const meta = rapidSubjectMeta(subjectId);
  return questions.map((question) => ({
    id: "review-" + question.id,
    subjectId,
    topicLabel: question.group ?? question.genre ?? "演習の振り返り",
    prompt: question.prompt,
    answer: question.answer,
    acceptedOptions: [question.answer, ...(question.accepted ?? [])],
    options: question.options?.length ? [...question.options] : [question.answer],
    explanation: question.explanation || "正解は「" + question.answer + "」です。教科ページの解説と途中式も確認してください。",
    studyHref: meta.cardHref,
    difficulty: 2,
    recommendedSeconds: 60,
    steps: ["問題の条件を整理する。", "答えを再現して選択肢と照合する。", "教科ページの解説と途中式を確認する。"],
    sourceBasis: "各教科ページの収録問題・振り返りカード",
  } satisfies RapidQuestion));
}
const MATERIAL_FORMULA_SEARCH_IDS = new Set(
  MATERIAL_MECHANICS_FORMULAS.map((card) => `rapid-card-${card.id}`),
);

type FormulaSearchSeed = {
  id: string;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
};

function formulaCardsToSearchCards(
  subjectId: SubjectId,
  cards: readonly FormulaSearchSeed[],
  sourceBasis: string,
): RapidQuestion[] {
  const meta = rapidSubjectMeta(subjectId);
  return cards.map((card) => ({
    id: `rapid-card-${card.id}`,
    subjectId,
    topicLabel: `${card.title} / 暗記・公式`,
    prompt: `${card.title}：${card.prompt}`,
    answer: card.formula,
    acceptedOptions: [card.formula],
    options: [card.formula],
    explanation: `${card.explanation} 覚え方：${card.cue}`,
    studyHref: meta.cardHref,
    mathOptions: true,
    difficulty: 3,
    recommendedSeconds: 45,
    steps: [
      "表面のタイトルと問いから、対象となる条件・記号を整理する。",
      `手掛かり「${card.cue}」から公式を再現する。`,
      "裏面の公式と解説を照合し、適用条件まで確認する。",
    ],
    sourceBasis,
  }));
}

function materialFormulaCardsToSearchCards(): RapidQuestion[] {
  return formulaCardsToSearchCards(
    "subject-5",
    MATERIAL_MECHANICS_FORMULAS,
    "材料力学範囲資料15枚 / 暗記・公式カード",
  );
}


function loadAllCards() {
  const result: RapidQuestion[] = [];
  for (const subjectId of RAPID_SUBJECT_IDS) {
    if (subjectId === "network") {
      const cards = normalizeCards(storageRead<unknown>("layer-sum-cards-v1", DEFAULT_CARDS))
        .filter((card) => card.enabled && card.label.trim());
      result.push(...networkCardsToRapid(cards));
      continue;
    }

    const staticCards = getStaticRapidPool(subjectId);
    result.push(...(subjectId === "subject-5"
      ? staticCards.filter((card) => !MATERIAL_FORMULA_SEARCH_IDS.has(card.id))
      : staticCards));
  }

  result.push(
    ...reviewQuestionsToCards("subject-2", ENGLISH_QUESTIONS.filter((question) => question.unit !== "exam-sample" && question.unit !== "ch19")),
    ...reviewQuestionsToCards("subject-3", MECHANICAL_DYNAMICS_QUESTIONS),
    ...reviewQuestionsToCards("subject-4", THERMODYNAMICS_QUESTIONS),
    ...formulaCardsToSearchCards("subject-4", THERMODYNAMICS_FORMULAS, "熱力学範囲ZIP9ページ / 暗記・公式カード"),
    ...reviewQuestionsToCards("subject-5", MATERIAL_MECHANICS_QUESTIONS),
    ...materialFormulaCardsToSearchCards(),
    ...reviewQuestionsToCards("subject-6", [...SMART_CONTROL_QUESTIONS, ...TEXTBOOK_RESPONSE_QUESTIONS]),
    ...reviewQuestionsToCards("subject-7", STATISTICS_QUESTIONS),
    ...formulaCardsToSearchCards("subject-7", STATISTICS_FORMULAS, "確率統計範囲ZIP＋追加範囲5ページ / 暗記・公式カード"),
    ...reviewQuestionsToCards("subject-8", APPLIED_MATH_QUESTIONS),
    ...reviewQuestionsToCards("subject-9", DIGITAL_CIRCUIT_ALL_QUESTIONS),
  );

  return Array.from(new Map(result.map((card) => [card.subjectId + ":" + card.id, card])).values());
}

type SubjectFilter = SubjectId[];

export default function CardSearch({
  initialSubject,
  initialQuery,
}: {
  initialSubject: string;
  initialQuery: string;
}) {
  const validInitialSubjects: SubjectFilter = RAPID_SUBJECT_IDS.includes(initialSubject as SubjectId)
    ? [initialSubject as SubjectId]
    : [];
  const [cards, setCards] = useState<RapidQuestion[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectFilter>(validInitialSubjects);
  const [query, setQuery] = useState(initialQuery);
  const [currentKey, setCurrentKey] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Device-local and account-synced cards are restored after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCards(loadAllCards());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const subjectCards = useMemo(
    () => selectedSubjects.length === 0
      ? cards
      : cards.filter((card) => selectedSubjects.includes(card.subjectId)),
    [cards, selectedSubjects],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return subjectCards;
    return subjectCards
      .map((card) => ({ card, score: exactMatchScore(card, normalizedQuery) }))
      .filter(({ score }) => Number.isFinite(score))
      .sort((left, right) => left.score - right.score
        || left.card.prompt.localeCompare(right.card.prompt, "ja"))
      .map(({ card }) => card);
  }, [subjectCards, query]);

  const suggestions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return [];
    const threshold = Math.max(1, Math.min(5, Math.floor(normalizedQuery.length * 0.42)));
    return subjectCards
      .map((card) => {
        const exactScore = exactMatchScore(card, normalizedQuery);
        if (Number.isFinite(exactScore)) return { card, score: exactScore };
        if (normalizedQuery.length < 2) return null;
        const distance = fuzzyScore(card, normalizedQuery);
        return distance <= threshold ? { card, score: 1000 + distance } : null;
      })
      .filter((entry): entry is { card: RapidQuestion; score: number } => entry !== null)
      .sort((left, right) => left.score - right.score
        || left.card.prompt.localeCompare(right.card.prompt, "ja"))
      .slice(0, 8)
      .map(({ card }) => card);
  }, [subjectCards, query]);

  const currentIndex = Math.max(0, filtered.findIndex((card) => cardKey(card) === currentKey));
  const current = filtered[currentIndex];
  const showSuggestions = hydrated && suggestionsOpen && Boolean(normalizeSearchText(query)) && suggestions.length > 0;
  const searchStatus = !hydrated
    ? "暗記帳を読み込み中…"
    : !normalizeSearchText(query)
      ? subjectCards.length + "枚から検索できます"
      : filtered.length
        ? filtered.length + "件一致。カードを表示しました"
        : suggestions.length
          ? "近い候補があります。入力欄から選んでください"
          : "一致するカードも近い候補もありません";

  function selectSuggestion(card: RapidQuestion) {
    setQuery(suggestionInputValue(card, query));
    setCurrentKey(cardKey(card));
    setSuggestionsOpen(false);
    setHighlightedSuggestion(0);
    setFlipped(false);
    window.setTimeout(() => {
      document.getElementById("card-search-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setCurrentKey("");
    setSuggestionsOpen(Boolean(normalizeSearchText(nextQuery)));
    setHighlightedSuggestion(0);
    setFlipped(false);
  }

  function clearSearch() {
    setQuery("");
    setCurrentKey("");
    setSuggestionsOpen(false);
    setHighlightedSuggestion(0);
    setFlipped(false);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || isComposing) return;
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setHighlightedSuggestion((value) => (value + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setHighlightedSuggestion((value) => (value - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && suggestionsOpen && suggestions.length) {
      event.preventDefault();
      selectSuggestion(suggestions[Math.min(highlightedSuggestion, suggestions.length - 1)]);
    } else if (event.key === "Escape") {
      setSuggestionsOpen(false);
    }
  }

  function changeSubjects(nextSubjects: SubjectFilter) {
    setSelectedSubjects(nextSubjects);
    setCurrentKey("");
    setSuggestionsOpen(Boolean(normalizeSearchText(query)));
    setHighlightedSuggestion(0);
    setFlipped(false);
  }

  function toggleSubject(subject: SubjectId) {
    changeSubjects(selectedSubjects.includes(subject)
      ? selectedSubjects.filter((selectedSubject) => selectedSubject !== subject)
      : RAPID_SUBJECT_IDS.filter((subjectId) => subjectId === subject || selectedSubjects.includes(subjectId)));
  }

  function move(amount: number) {
    if (!filtered.length) return;
    const nextIndex = (currentIndex + amount + filtered.length) % filtered.length;
    setCurrentKey(cardKey(filtered[nextIndex]));
    setFlipped(false);
  }

  function chooseRandom() {
    if (!filtered.length) return;
    const nextIndex = Math.floor(Math.random() * filtered.length);
    setCurrentKey(cardKey(filtered[nextIndex]));
    setFlipped(false);
  }

  return (
    <div className="app-frame card-search-page">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">C/S</span>
          <span><strong>TEST//GRID</strong><small>CARD SEARCH</small></span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {cards.length} CARDS</span>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="card-search-main">
        <nav className="subject-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">全教科の暗記帳検索</strong>
        </nav>

        <section className="card-search-hero">
          <div><span>SEARCH / MEMORY</span><h1>暗記帳を、<br /><em>すぐ見つける。</em></h1></div>
          <p>単語や公式を入力すると、一致度が最も高いカードをすぐ表示します。綴りや名前があやふやでも、入力中の「もしかして？」候補から選べます。</p>
        </section>

        <section className="card-search-controls" aria-label="暗記カードの検索条件">
          <div className="card-search-input-wrap">
            <label className="card-search-input" htmlFor="all-card-search">
              <span>キーワード</span>
              <input
                id="all-card-search"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="card-search-suggestions"
                aria-expanded={showSuggestions}
                aria-activedescendant={showSuggestions ? "card-search-suggestion-" + highlightedSuggestion : undefined}
                autoComplete="off"
                spellCheck={false}
                value={query}
                placeholder="例：TCP、平均、運動方程式"
                onChange={(event) => updateQuery(event.target.value)}
                onFocus={() => setSuggestionsOpen(Boolean(normalizeSearchText(query)))}
                onBlur={() => setSuggestionsOpen(false)}
                onKeyDown={handleSearchKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
              />
            </label>
            {showSuggestions && (
              <div className="card-search-suggestions" id="card-search-suggestions">
                <span>入力候補 / もしかして？</span>
                <ol role="listbox" aria-label="暗記カードの入力候補">
                  {suggestions.map((card, suggestionIndex) => {
                    const exact = Number.isFinite(exactMatchScore(card, query));
                    return (
                      <li
                        id={"card-search-suggestion-" + suggestionIndex}
                        role="option"
                        aria-selected={highlightedSuggestion === suggestionIndex}
                        key={cardKey(card)}
                      >
                        <button
                          type="button"
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={() => selectSuggestion(card)}
                          onMouseEnter={() => setHighlightedSuggestion(suggestionIndex)}
                        >
                          <strong><RichMathText text={card.prompt} /></strong>
                          <small>{rapidSubjectMeta(card.subjectId).name} · {card.topicLabel}</small>
                          <em>{exact ? "一致" : "もしかして？"}</em>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
          <button type="button" className="card-search-clear" disabled={!query} onClick={clearSearch}>検索をクリア</button>
          <p aria-live="polite">{searchStatus}</p>
        </section>

        <div className="card-search-subjects" role="group" aria-label="教科で絞り込み（複数選択可）">
          <span className="card-search-subjects-label">教科タグ · 複数選択可（いずれかに一致）</span>
          <button type="button" aria-pressed={selectedSubjects.length === 0} onClick={() => changeSubjects([])}>全教科 <small>{cards.length}</small></button>
          {RAPID_SUBJECTS.map((subject) => {
            const count = cards.filter((card) => card.subjectId === subject.id).length;
            return (
              <button type="button" key={subject.id} aria-pressed={selectedSubjects.includes(subject.id)} onClick={() => toggleSubject(subject.id)}>
                {subject.name} <small>{count}</small>
              </button>
            );
          })}
        </div>

        <CardFaceList
          items={filtered.map((card) => ({
            id: cardKey(card),
            eyebrow: rapidSubjectMeta(card.subjectId).name,
            meta: card.topicLabel,
            front: <RichMathText text={card.prompt} />,
            back: card.mathOptions
              ? <DisplayMath tex={card.answer} />
              : <RichMathText text={card.answer} />,
            explanation: <RichMathText text={card.explanation} />,
          }))}
          title="全教科のカード表・裏一覧"
          description="選択中の教科と検索語に一致するカードだけを、表面・裏面・解説までまとめて表示します。"
          pageSize={50}
          onSelect={(key) => {
            setCurrentKey(key);
            setFlipped(false);
            window.setTimeout(() => {
              document.getElementById("card-search-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 0);
          }}
        />

        {current ? (
            <section className="card-search-workspace" id="card-search-workspace" aria-live="polite">
              <div className="card-search-meta">
                <span>{rapidSubjectMeta(current.subjectId).name}</span>
                <strong>{current.topicLabel}</strong>
                <small>{currentIndex + 1} / {filtered.length}</small>
              </div>
              <button type="button" className={"card-search-card " + (flipped ? "is-flipped" : "")} onClick={() => setFlipped((value) => !value)}>
                <span>{flipped ? "ANSWER / EXPLANATION" : "QUESTION"}</span>
                {!flipped ? (
                  <h2><RichMathText text={current.prompt} /></h2>
                ) : (
                  <div>
                    {current.mathOptions ? <DisplayMath tex={current.answer} /> : <h2><RichMathText text={current.answer} /></h2>}
                    <p><RichMathText text={current.explanation} /></p>
                  </div>
                )}
                <small>{flipped ? "タップして問題へ" : "タップして答えと解説を見る"}</small>
              </button>
              <div className="card-search-nav">
                <button type="button" onClick={() => move(-1)}>← 前へ</button>
                <button type="button" onClick={chooseRandom}>ランダム</button>
                <button type="button" onClick={() => move(1)}>次へ →</button>
              </div>
              <div className="card-search-links">
                <Link href={rapidSubjectMeta(current.subjectId).cardHref}>この教科の暗記帳を開く</Link>
                <Link href={"/rapid/" + current.subjectId}>時間制限つき即答練習へ</Link>
                <Link href={"/ranking/" + current.subjectId}>この教科の公式ランキングテストへ</Link>
              </div>
            </section>
        ) : hydrated ? (
          <section className="card-search-empty">
            <span>{suggestions.length ? "DID YOU MEAN?" : "NO MATCH"}</span>
            <h2>{suggestions.length ? "入力欄の候補からカードを選んでください。" : "一致する暗記カードがありません。"}</h2>
            <p>{suggestions.length ? "綴りの近いカードを「もしかして？」として表示しています。" : "別の言葉で入力するか、教科の絞り込みを解除してください。"}</p>
          </section>
        ) : null}
      </main>
      <footer><span>TEST//GRID</span><p>SEARCH · AUTOCOMPLETE · MEMORY</p><span>CARDS 01</span></footer>
    </div>
  );
}
