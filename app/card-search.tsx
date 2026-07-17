"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DisplayMath, RichMathText } from "./statistics-math";
import { ENGLISH_QUESTIONS } from "./english-data";
import { MECHANICAL_DYNAMICS_QUESTIONS } from "./mechanical-dynamics-data";
import { THERMODYNAMICS_QUESTIONS } from "./thermodynamics-data";
import { SMART_CONTROL_QUESTIONS } from "./smart-control-data";
import { TEXTBOOK_RESPONSE_QUESTIONS } from "./smart-control-textbook-data";
import { STATISTICS_QUESTIONS } from "./statistics-data";
import { APPLIED_MATH_QUESTIONS } from "./applied-math-data";
import {
  RAPID_SUBJECTS,
  RAPID_SUBJECT_IDS,
  getStaticRapidPool,
  networkCardsToRapid,
  rapidSubjectMeta,
  studyCardsToRapid,
  type RapidQuestion,
} from "./rapid-quiz-data";
import { DEFAULT_CARDS, normalizeCards, storageRead } from "./protocols";
import {
  cardsStorageKey,
  normalizeStudyCards,
  type SubjectId,
} from "./study-data";

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
  } satisfies RapidQuestion));
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
    if (subjectId === "subject-5" || subjectId === "subject-9") {
      const cards = normalizeStudyCards(
        storageRead<unknown>(cardsStorageKey(subjectId), []),
        subjectId,
      ).filter((card) => card.enabled);
      result.push(...studyCardsToRapid(subjectId, cards));
      continue;
    }
    result.push(...getStaticRapidPool(subjectId));
  }

  result.push(
    ...reviewQuestionsToCards("subject-2", ENGLISH_QUESTIONS.filter((question) => question.unit !== "exam-sample" && question.unit !== "ch19")),
    ...reviewQuestionsToCards("subject-3", MECHANICAL_DYNAMICS_QUESTIONS),
    ...reviewQuestionsToCards("subject-4", THERMODYNAMICS_QUESTIONS),
    ...reviewQuestionsToCards("subject-6", [...SMART_CONTROL_QUESTIONS, ...TEXTBOOK_RESPONSE_QUESTIONS]),
    ...reviewQuestionsToCards("subject-7", STATISTICS_QUESTIONS),
    ...reviewQuestionsToCards("subject-8", APPLIED_MATH_QUESTIONS),
  );

  return Array.from(new Map(result.map((card) => [card.subjectId + ":" + card.id, card])).values());
}

type SubjectFilter = "all" | SubjectId;

export default function CardSearch({
  initialSubject,
  initialQuery,
}: {
  initialSubject: string;
  initialQuery: string;
}) {
  const validInitialSubject = RAPID_SUBJECT_IDS.includes(initialSubject as SubjectId)
    ? initialSubject as SubjectId
    : "all";
  const [cards, setCards] = useState<RapidQuestion[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>(validInitialSubject);
  const [query, setQuery] = useState(initialQuery);
  const [fuzzy, setFuzzy] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Device-local and account-synced cards are restored after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCards(loadAllCards());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filtered = useMemo(() => {
    const subjectCards = subjectFilter === "all"
      ? cards
      : cards.filter((card) => card.subjectId === subjectFilter);
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return subjectCards;
    if (!fuzzy) {
      return subjectCards.filter((card) => searchFields(card)
        .some((field) => normalizeSearchText(field).includes(normalizedQuery)));
    }
    const threshold = Math.max(1, Math.min(5, Math.floor(normalizedQuery.length * 0.42)));
    return subjectCards
      .map((card) => ({ card, score: fuzzyScore(card, normalizedQuery) }))
      .filter(({ score }) => score <= threshold)
      .sort((left, right) => left.score - right.score
        || left.card.prompt.localeCompare(right.card.prompt, "ja"))
      .map(({ card }) => card);
  }, [cards, subjectFilter, query, fuzzy]);

  const currentIndex = Math.max(0, filtered.findIndex((card) => card.id === currentId));
  const current = filtered[currentIndex];

  function selectCard(card: RapidQuestion) {
    setCurrentId(card.id);
    setFlipped(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function move(amount: number) {
    if (!filtered.length) return;
    const nextIndex = (currentIndex + amount + filtered.length) % filtered.length;
    setCurrentId(filtered[nextIndex].id);
    setFlipped(false);
  }

  function chooseRandom() {
    if (!filtered.length) return;
    const nextIndex = Math.floor(Math.random() * filtered.length);
    setCurrentId(filtered[nextIndex].id);
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
          <p>単語・公式・説明の一部から横断検索できます。綴りや名前があやふやなら「もしかして？検索」をオンにしてください。</p>
        </section>

        <section className="card-search-controls" aria-label="暗記カードの検索条件">
          <label>
            <span>キーワード</span>
            <input
              type="search"
              value={query}
              placeholder="例：TCP、平均、運動方程式"
              onChange={(event) => { setQuery(event.target.value); setFlipped(false); }}
            />
          </label>
          <button
            type="button"
            className={fuzzy ? "active" : ""}
            aria-pressed={fuzzy}
            onClick={() => { setFuzzy((value) => !value); setFlipped(false); }}
          >
            <span>FUZZY</span><strong>もしかして？検索</strong>
          </button>
          <button type="button" onClick={() => { setQuery(""); setFuzzy(false); setFlipped(false); }}>検索をクリア</button>
          <p aria-live="polite">{hydrated ? filtered.length + "件見つかりました" : "暗記帳を読み込み中…"}</p>
        </section>

        <div className="card-search-subjects" role="group" aria-label="教科で絞り込み">
          <button type="button" aria-pressed={subjectFilter === "all"} onClick={() => { setSubjectFilter("all"); setFlipped(false); }}>全教科 <small>{cards.length}</small></button>
          {RAPID_SUBJECTS.map((subject) => {
            const count = cards.filter((card) => card.subjectId === subject.id).length;
            return (
              <button type="button" key={subject.id} aria-pressed={subjectFilter === subject.id} onClick={() => { setSubjectFilter(subject.id); setFlipped(false); }}>
                {subject.name} <small>{count}</small>
              </button>
            );
          })}
        </div>

        {current ? (
          <>
            <section className="card-search-workspace" aria-live="polite">
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
                <Link href={"/rapid/" + current.subjectId}>時間制限つき即答へ</Link>
              </div>
            </section>

            <section className="card-search-results" aria-labelledby="card-search-results-title">
              <div><span>MATCHES</span><h2 id="card-search-results-title">検索候補</h2><p>候補を選ぶと上のカードに移動します。</p></div>
              <ol>
                {filtered.slice(0, 80).map((card) => (
                  <li key={card.subjectId + ":" + card.id}>
                    <button type="button" className={card.id === current.id ? "active" : ""} onClick={() => selectCard(card)}>
                      <span>{rapidSubjectMeta(card.subjectId).name}</span>
                      <strong><RichMathText text={card.prompt} /></strong>
                      <small>{card.topicLabel}</small>
                    </button>
                  </li>
                ))}
              </ol>
              {filtered.length > 80 && <p>先頭80件を表示中です。キーワードか教科でさらに絞り込んでください。</p>}
            </section>
          </>
        ) : hydrated ? (
          <section className="card-search-empty">
            <span>NO MATCH</span><h2>一致する暗記カードがありません。</h2>
            <p>表記があやふやなら「もしかして？検索」をオンにするか、教科の絞り込みを解除してください。</p>
            {!fuzzy && query && <button type="button" onClick={() => setFuzzy(true)}>もしかして？検索を試す</button>}
          </section>
        ) : null}
      </main>
      <footer><span>TEST//GRID</span><p>SEARCH · FUZZY MATCH · MEMORY</p><span>CARDS 01</span></footer>
    </div>
  );
}
