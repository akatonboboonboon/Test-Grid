"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ENGINEERING_FOUNDATIONS } from "./math-foundations-engineering-reference";
import { STATISTICS_APPLIED_FOUNDATIONS } from "./math-foundations-statistics-catalog";
import { DisplayMath, RichMathText } from "./statistics-math";
import {
  MATH_FOUNDATION_SUBJECT_IDS,
  type MathFoundationEntry,
  type MathFoundationSubjectId,
} from "./math-foundations-types";

const SUBJECTS = [...ENGINEERING_FOUNDATIONS, ...STATISTICS_APPLIED_FOUNDATIONS]
  .sort((left, right) => MATH_FOUNDATION_SUBJECT_IDS.indexOf(left.id) - MATH_FOUNDATION_SUBJECT_IDS.indexOf(right.id));
const KNOWN_SUBJECTS = new Set<MathFoundationSubjectId>(MATH_FOUNDATION_SUBJECT_IDS);

function isFoundationSubjectId(value: string | null): value is MathFoundationSubjectId {
  return Boolean(value && KNOWN_SUBJECTS.has(value as MathFoundationSubjectId));
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\s　]+/g, "")
    .replace(/[()（）［］\[\]{}\\,，.。・:：;；]/g, "");
}

function searchableText(entry: MathFoundationEntry) {
  return [
    entry.title,
    entry.category,
    entry.overview,
    ...entry.formulas.flatMap((formula) => [formula.label, formula.tex, formula.expandedTex ?? "", formula.note ?? ""]),
    ...(entry.symbols ?? []).flatMap((symbol) => [symbol.symbol, symbol.meaning, symbol.unit ?? ""]),
    ...entry.conditions,
    ...entry.workflow,
    ...entry.pitfalls,
    ...(entry.keywords ?? []),
  ].join(" ");
}

export default function MathFoundationsClient() {
  const [subjectId, setSubjectId] = useState<MathFoundationSubjectId>("subject-7");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");

  /* The query string is only a deep-link hint; the reference itself is fully static. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("subject");
    if (isFoundationSubjectId(selected)) setSubjectId(selected);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const subject = SUBJECTS.find((candidate) => candidate.id === subjectId) ?? SUBJECTS[0];
  const categories = useMemo(
    () => ["すべて", ...Array.from(new Set(subject.entries.map((entry) => entry.category)))],
    [subject],
  );
  const normalizedQuery = normalizeSearch(query);
  const filteredEntries = useMemo(() => subject.entries.filter((entry) => {
    if (category !== "すべて" && entry.category !== category) return false;
    if (!normalizedQuery) return true;
    return normalizeSearch(searchableText(entry)).includes(normalizedQuery);
  }), [category, normalizedQuery, subject]);

  function selectSubject(nextSubjectId: MathFoundationSubjectId) {
    setSubjectId(nextSubjectId);
    setCategory("すべて");
    setQuery("");
    const url = new URL(window.location.href);
    url.searchParams.set("subject", nextSubjectId);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  const pageStyle = {
    "--subject-accent": subject.accent,
    "--english-yellow": subject.accent,
  } as CSSProperties;

  return (
    <div className="app-frame math-foundations-page" style={pageStyle}>
      <header className="topbar math-foundations-topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">F/X</span>
          <span><strong>TEST//GRID</strong><small>FORMULA REFERENCE</small></span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {SUBJECTS.reduce((sum, item) => sum + item.entries.length, 0)} REFERENCES</span>
          <Link className="outline-button header-link" href="/cards">暗記帳検索</Link>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="math-foundations-main">
        <nav className="subject-breadcrumb math-foundations-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">基礎情報一覧</strong>
        </nav>

        <section className="math-foundations-hero" aria-labelledby="math-foundations-title">
          <div>
            <p><span>FOUNDATION INDEX</span><span>FORMULA · CONDITION · METHOD</span></p>
            <h1 id="math-foundations-title">基礎情報を、<br /><em>解く前に確認。</em></h1>
          </div>
          <p>問題文に公式が載っていなくても困らないように、計算式だけでなく「いつ使えるか」「記号は何か」「どう立式するか」まで科目別にまとめています。試験範囲外の項目は、範囲内問題を解くための前提知識として明記しています。</p>
        </section>

        <section className="math-foundations-subjects" aria-label="科目を選ぶ">
          {SUBJECTS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={candidate.id === subject.id}
              style={{ "--foundation-accent": candidate.accent } as CSSProperties}
              onClick={() => selectSubject(candidate.id)}
            >
              <span>SUBJECT {candidate.id.slice(-1).padStart(2, "0")}</span>
              <strong>{candidate.name}</strong>
              <small>{candidate.entries.length}項目</small>
            </button>
          ))}
        </section>

        <section className="math-foundations-workspace" aria-labelledby="math-foundations-subject-title">
          <div className="math-foundations-heading">
            <div><span>{subject.englishName}</span><h2 id="math-foundations-subject-title">{subject.name}の基礎情報</h2></div>
            <p>{subject.description}</p>
            <Link href={`/subjects/${subject.id}`}>この教科の演習へ →</Link>
          </div>

          <div className="math-foundations-tools">
            <label>
              <span>公式・記号・用途を検索</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例：分散、期待値、慣性モーメント、極、JK"
              />
            </label>
            <div role="group" aria-label="カテゴリで絞り込む">
              {categories.map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  aria-pressed={candidate === category}
                  onClick={() => setCategory(candidate)}
                >{candidate}</button>
              ))}
            </div>
            <p><strong>{filteredEntries.length}</strong> / {subject.entries.length} 項目を表示</p>
          </div>

          {filteredEntries.length ? (
            <div className="math-foundations-list">
              {filteredEntries.map((entry, index) => (
                <article id={entry.id} className="math-foundation-card" key={entry.id}>
                  <div className="math-foundation-card-heading">
                    <span>{String(index + 1).padStart(2, "0")} / {entry.category}</span>
                    <h3>{entry.title}</h3>
                    <p><RichMathText text={entry.overview} /></p>
                  </div>

                  <div className="math-foundation-formulas">
                    {entry.formulas.map((formula) => (
                      <section key={`${entry.id}-${formula.label}`}>
                        <span>{formula.label}</span>
                        <DisplayMath tex={formula.tex} ariaLabel={`${entry.title}：${formula.label}`} />
                        {formula.expandedTex && (
                          <div className="math-foundation-expanded">
                            <small>Σなし・展開した形</small>
                            <DisplayMath tex={formula.expandedTex} ariaLabel={`${entry.title}を展開した形`} />
                          </div>
                        )}
                        {formula.note && <p><RichMathText text={formula.note} /></p>}
                      </section>
                    ))}
                  </div>

                  <details className="math-foundation-details">
                    <summary>記号・使い方・注意点を見る</summary>
                    <div className="math-foundation-details-grid">
                      {entry.symbols?.length ? (
                        <section>
                          <h4>記号と単位</h4>
                          <dl>{entry.symbols.map((symbol) => (
                            <div key={`${entry.id}-${symbol.symbol}`}>
                              <dt><RichMathText text={symbol.symbol} /></dt>
                              <dd>{symbol.meaning}{symbol.unit ? <small>{symbol.unit}</small> : null}</dd>
                            </div>
                          ))}</dl>
                        </section>
                      ) : null}
                      <section><h4>使える条件</h4><ul>{entry.conditions.map((item) => <li key={item}><RichMathText text={item} /></li>)}</ul></section>
                      <section><h4>解く順番</h4><ol>{entry.workflow.map((item) => <li key={item}><RichMathText text={item} /></li>)}</ol></section>
                      <section className="math-foundation-warning"><h4>間違えやすい点</h4><ul>{entry.pitfalls.map((item) => <li key={item}><RichMathText text={item} /></li>)}</ul></section>
                    </div>
                    {entry.example && (
                      <section className="math-foundation-example">
                        <span>MINI EXAMPLE</span>
                        <h4><RichMathText text={entry.example.prompt} /></h4>
                        <ol>{entry.example.steps.map((step) => <li key={step}><RichMathText text={step} /></li>)}</ol>
                        <strong>答え：<RichMathText text={entry.example.result} /></strong>
                      </section>
                    )}
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <div className="math-foundations-empty">
              <span>NO MATCH</span><h3>一致する基礎情報がありません。</h3><p>表記を短くするか、カテゴリを「すべて」に戻してください。</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("すべて"); }}>絞り込みを解除</button>
            </div>
          )}
        </section>
      </main>

      <footer><span>TEST//GRID</span><p>FOUNDATION REFERENCE · 7 SUBJECTS</p><span>INDEX F/X</span></footer>
    </div>
  );
}
