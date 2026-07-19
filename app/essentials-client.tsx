"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ESSENTIAL_SUBJECTS, type EssentialKind } from "./essentials-catalog";
import { DisplayMath, RichMathText } from "./statistics-math";
import type { SubjectId } from "./study-data";

type SubjectSelection = SubjectId | "all";
type KindSelection = EssentialKind | "all";

const SUBJECT_IDS = new Set<SubjectId>(ESSENTIAL_SUBJECTS.map((subject) => subject.id));
const KIND_OPTIONS: Array<{ id: KindSelection; label: string }> = [
  { id: "all", label: "すべて" },
  { id: "term", label: "単語" },
  { id: "formula", label: "公式" },
  { id: "rule", label: "見分け方" },
  { id: "check", label: "手順" },
];
const KIND_LABELS: Record<EssentialKind, string> = {
  term: "TERM",
  formula: "FORMULA",
  rule: "RULE",
  check: "CHECK",
};

function isSubjectId(value: string | null): value is SubjectId {
  return Boolean(value && SUBJECT_IDS.has(value as SubjectId));
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\s　]+/g, "")
    .replace(/[()（）［］\[\]{}\\,，.。・:：;；]/g, "");
}

export default function EssentialsClient() {
  const [subjectId, setSubjectId] = useState<SubjectSelection>("all");
  const [kind, setKind] = useState<KindSelection>("all");
  const [query, setQuery] = useState("");

  /* The URL only chooses the initial subject; the guide itself is static. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("subject");
    if (isSubjectId(selected)) setSubjectId(selected);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const normalizedQuery = normalizeSearch(query);
  const visibleSubjects = useMemo(() => ESSENTIAL_SUBJECTS
    .filter((subject) => subjectId === "all" || subject.id === subjectId)
    .map((subject) => ({
      ...subject,
      items: subject.items.filter((item) => {
        if (kind !== "all" && item.kind !== kind) return false;
        if (!normalizedQuery) return true;
        const searchable = [
          item.title,
          item.value,
          item.cue,
          item.pitfall,
          ...(item.math ?? []).flatMap((formula) => [formula.label ?? "", formula.tex]),
          ...(item.keywords ?? []),
        ].join(" ");
        return normalizeSearch(searchable).includes(normalizedQuery);
      }),
    }))
    .filter((subject) => subject.items.length > 0), [kind, normalizedQuery, subjectId]);

  const visibleItemCount = visibleSubjects.reduce((sum, subject) => sum + subject.items.length, 0);
  const totalItemCount = ESSENTIAL_SUBJECTS.reduce((sum, subject) => sum + subject.items.length, 0);
  const activeSubject = subjectId === "all"
    ? null
    : ESSENTIAL_SUBJECTS.find((subject) => subject.id === subjectId) ?? null;

  function selectSubject(nextSubjectId: SubjectSelection) {
    setSubjectId(nextSubjectId);
    const url = new URL(window.location.href);
    if (nextSubjectId === "all") url.searchParams.delete("subject");
    else url.searchParams.set("subject", nextSubjectId);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  const pageStyle = {
    "--essential-accent": activeSubject?.accent ?? "#c7ff5e",
  } as CSSProperties;

  return (
    <div className="app-frame essentials-page" style={pageStyle}>
      <header className="topbar essentials-topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark essentials-brand-mark" aria-hidden="true">E/9</span>
          <span><strong>TEST//GRID</strong><small>EXAM EVE ESSENTIALS</small></span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {totalItemCount} ESSENTIALS</span>
          <Link className="outline-button header-link" href="/cards">暗記帳検索</Link>
          <Link className="outline-button header-link" href="/foundations?subject=subject-7">詳しい基礎公式</Link>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="essentials-main">
        <nav className="subject-breadcrumb essentials-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">これだけは覚える</strong>
        </nav>

        <section className="essentials-hero" aria-labelledby="essentials-title">
          <div>
            <p><span>EXAM EVE / 9 SUBJECTS</span><span>TERM · FORMULA · RULE</span></p>
            <h1 id="essentials-title">これだけは、<br /><em>落とさない。</em></h1>
          </div>
          <div className="essentials-hero-note">
            <strong>試験直前の最小セット</strong>
            <p>教材と過去問から、得点に直結する単語・公式・見分け方だけを選びました。各カードは「何を覚えるか」「いつ使うか」「何を間違えるか」を一画面で確認できます。</p>
          </div>
        </section>

        <section className="essentials-subject-picker" aria-label="科目を選ぶ">
          <button
            className="essentials-all-button"
            type="button"
            aria-pressed={subjectId === "all"}
            onClick={() => selectSubject("all")}
          >
            <span>ALL 9</span><strong>全教科</strong><small>{totalItemCount}項目</small>
          </button>
          {ESSENTIAL_SUBJECTS.map((subject) => (
            <button
              key={subject.id}
              type="button"
              aria-pressed={subject.id === subjectId}
              style={{ "--picker-accent": subject.accent } as CSSProperties}
              onClick={() => selectSubject(subject.id)}
            >
              <span>{String(subject.order).padStart(2, "0")}</span>
              <strong>{subject.name}</strong>
              <small>{subject.items.length}項目</small>
            </button>
          ))}
        </section>

        <section className="essentials-toolbar" aria-label="要点集を絞り込む">
          <label>
            <span>単語・公式・使い方を検索</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例：分散、断熱、TCP、外積、JK"
            />
          </label>
          <div role="group" aria-label="種類で絞り込む">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={kind === option.id}
                onClick={() => setKind(option.id)}
              >{option.label}</button>
            ))}
          </div>
          <div className="essentials-toolbar-status">
            <p><strong>{visibleItemCount}</strong> / {subjectId === "all" ? totalItemCount : activeSubject?.items.length ?? 0} 項目</p>
            <button type="button" onClick={() => window.print()}>印刷する</button>
          </div>
        </section>

        {visibleSubjects.length ? (
          <div className="essentials-subject-list">
            {visibleSubjects.map((subject) => (
              <section
                className="essentials-subject-section"
                id={`essentials-${subject.id}`}
                key={subject.id}
                style={{ "--subject-accent": subject.accent } as CSSProperties}
                aria-labelledby={`essentials-title-${subject.id}`}
              >
                <header className="essentials-subject-heading">
                  <div>
                    <span>SUBJECT {String(subject.order).padStart(2, "0")} / {subject.englishName}</span>
                    <h2 id={`essentials-title-${subject.id}`}>{subject.name}</h2>
                    <p>{subject.description}</p>
                  </div>
                  <div>
                    <time dateTime={subject.examDate}>TEST {subject.examDateLabel}</time>
                    <Link href={`/subjects/${subject.id}`}>演習へ進む →</Link>
                  </div>
                </header>

                <div className="essentials-card-grid">
                  {subject.items.map((item, index) => (
                    <article className={`essential-card kind-${item.kind}`} key={item.id}>
                      <header>
                        <span>{KIND_LABELS[item.kind]}</span>
                        <small>{String(index + 1).padStart(2, "0")}</small>
                      </header>
                      <h3>{item.title}</h3>
                      <p className="essential-value"><RichMathText text={item.value} /></p>
                      {item.math?.length ? (
                        <div className="essential-math-list">
                          {item.math.map((formula) => (
                            <div key={`${item.id}-${formula.label ?? formula.tex}`}>
                              {formula.label ? <span>{formula.label}</span> : null}
                              <DisplayMath tex={formula.tex} ariaLabel={`${item.title}${formula.label ? `：${formula.label}` : ""}`} />
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <dl>
                        <div><dt>この合図で使う</dt><dd><RichMathText text={item.cue} /></dd></div>
                        <div><dt>落とし穴</dt><dd><RichMathText text={item.pitfall} /></dd></div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="essentials-empty">
            <span>NO MATCH</span><h2>一致する項目がありません。</h2><p>検索を短くするか、種類を「すべて」に戻してください。</p>
            <button type="button" onClick={() => { setQuery(""); setKind("all"); }}>絞り込みを解除</button>
          </div>
        )}
      </main>

      <footer><span>TEST//GRID</span><p>EXAM EVE ESSENTIALS · 9 SUBJECTS</p><span>INDEX E/9</span></footer>
    </div>
  );
}
