"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import ComprehensiveChallenge from "./comprehensive-challenge";
import { ENGLISH_VOCAB } from "./english-data";
import { DEFAULT_CARDS, normalizeCards, storageRead } from "./protocols";
import { SMART_CONTROL_CARDS } from "./smart-control-data";
import { TEXTBOOK_RESPONSE_CARDS } from "./smart-control-textbook-data";
import { STATISTICS_FORMULAS } from "./statistics-data";
import { APPLIED_MATH_FORMULAS } from "./applied-math-data";
import { THERMODYNAMICS_FORMULAS } from "./thermodynamics-data";
import { MECHANICAL_DYNAMICS_FORMULAS } from "./mechanical-dynamics-data";
import {
  DEFAULT_SUBJECTS,
  EXAM_SCHEDULE,
  SUBJECT_ACCENTS,
  cardsStorageKey,
  loadSubjects,
  normalizeStudyCards,
  normalizeStudyProgress,
  progressStorageKey,
  saveSubjects,
  type StudySubject,
  type SubjectId,
} from "./study-data";

const SMART_CONTROL_ALL_CARDS = [...SMART_CONTROL_CARDS, ...TEXTBOOK_RESPONSE_CARDS];

type SubjectMetric = { cards: number; mastered: number };
type SubjectDraft = Pick<StudySubject, "id" | "name" | "testDate" | "memo" | "accent">;

function daysUntil(dateValue: string) {
  if (!dateValue) return null;
  const target = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  const todayAtNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  return Math.ceil((target.getTime() - todayAtNoon.getTime()) / 86_400_000);
}

function dateLabel(dateValue: string) {
  const days = daysUntil(dateValue);
  if (days === null) return "テスト日 未設定";
  if (days === 0) return "テスト当日";
  if (days > 0) return `テストまであと${days}日`;
  return `テスト日から${Math.abs(days)}日`;
}

function scheduleCountdownLabel(dateValue: string) {
  const days = daysUntil(dateValue);
  if (days === null) return "日程未設定";
  if (days === 0) return "本日";
  if (days > 0) return `あと${days}日`;
  return `${Math.abs(days)}日前に終了`;
}

function readMetrics(subjects: StudySubject[]) {
  return Object.fromEntries(subjects.map((subject) => {
    if (subject.module === "network") {
      const cards = normalizeCards(storageRead<unknown>("layer-sum-cards-v1", DEFAULT_CARDS))
        .filter((card) => card.enabled && card.label.trim());
      const progress = storageRead<Record<string, unknown>>("layer-sum-memory-v1", {});
      return [subject.id, {
        cards: cards.length,
        mastered: cards.filter((card) => progress[card.id] === "mastered").length,
      } satisfies SubjectMetric];
    }
    if (subject.id === "subject-2") {
      const progress = storageRead<Record<string, unknown>>("test-grid:english-memory:v1", {});
      return [subject.id, {
        cards: ENGLISH_VOCAB.length,
        mastered: ENGLISH_VOCAB.filter((card) => progress[card.id] === "mastered").length,
      } satisfies SubjectMetric];
    }
    if (subject.id === "subject-3") {
      const progress = storageRead<Record<string, unknown>>(progressStorageKey("subject-3"), {});
      return [subject.id, {
        cards: MECHANICAL_DYNAMICS_FORMULAS.length,
        mastered: MECHANICAL_DYNAMICS_FORMULAS.filter((card) => progress[card.id] === "mastered").length,
      } satisfies SubjectMetric];
    }
    if (subject.id === "subject-4") {
      const progress = storageRead<Record<string, unknown>>(progressStorageKey("subject-4"), {});
      return [subject.id, {
        cards: THERMODYNAMICS_FORMULAS.length,
        mastered: THERMODYNAMICS_FORMULAS.filter((card) => progress[card.id] === "mastered").length,
      } satisfies SubjectMetric];
    }
    if (subject.id === "subject-6") {
      const progress = storageRead<Record<string, unknown>>(progressStorageKey("subject-6"), {});
      return [subject.id, {
        cards: SMART_CONTROL_ALL_CARDS.length,
        mastered: SMART_CONTROL_ALL_CARDS.filter((card) => progress[card.id] === "mastered").length,
      } satisfies SubjectMetric];
    }
    if (subject.id === "subject-7") {
      const progress = storageRead<Record<string, unknown>>(progressStorageKey("subject-7"), {});
      return [subject.id, {
        cards: STATISTICS_FORMULAS.length,
        mastered: STATISTICS_FORMULAS.filter((card) => progress[card.id] === "mastered").length,
      } satisfies SubjectMetric];
    }
    if (subject.id === "subject-8") {
      const progress = storageRead<Record<string, unknown>>(progressStorageKey("subject-8"), {});
      return [subject.id, {
        cards: APPLIED_MATH_FORMULAS.length,
        mastered: APPLIED_MATH_FORMULAS.filter((card) => progress[card.id] === "mastered").length,
      } satisfies SubjectMetric];
    }
    const cards = normalizeStudyCards(
      storageRead<unknown>(cardsStorageKey(subject.id), []),
      subject.id,
    ).filter((card) => card.enabled);
    const progress = normalizeStudyProgress(
      storageRead<unknown>(progressStorageKey(subject.id), {}),
      cards,
    );
    return [subject.id, {
      cards: cards.length,
      mastered: cards.filter((card) => progress[card.id] === "mastered").length,
    } satisfies SubjectMetric];
  })) as Record<SubjectId, SubjectMetric>;
}

export default function StudyHub() {
  const [subjects, setSubjects] = useState<StudySubject[]>(DEFAULT_SUBJECTS);
  const [metrics, setMetrics] = useState<Record<string, SubjectMetric>>({});
  const [editing, setEditing] = useState<SubjectDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogOpen = Boolean(editing);

  /* Device-local study data is restored after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const restored = loadSubjects();
    setSubjects(restored);
    setMetrics(readMetrics(restored));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (hydrated) saveSubjects(subjects);
  }, [subjects, hydrated]);

  useEffect(() => {
    if (!dialogOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEditing(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [dialogOpen]);

  const configuredCount = subjects.filter((subject) => subject.configured).length;
  const totals = useMemo(() => subjects.reduce((result, subject) => {
    const metric = metrics[subject.id] ?? { cards: 0, mastered: 0 };
    return {
      cards: result.cards + metric.cards,
      mastered: result.mastered + metric.mastered,
    };
  }, { cards: 0, mastered: 0 }), [subjects, metrics]);

  function beginEdit(subject: StudySubject) {
    setEditing({
      id: subject.id,
      name: subject.name,
      testDate: subject.testDate,
      memo: subject.memo,
      accent: subject.accent,
    });
  }

  function saveSubject(event: React.FormEvent) {
    event.preventDefault();
    if (!editing?.name.trim()) return;
    setSubjects((current) => current.map((subject) => subject.id === editing.id
      ? {
        ...subject,
        name: editing.name.trim().slice(0, 32),
        testDate: editing.testDate,
        memo: editing.memo.trim().slice(0, 120),
        accent: editing.accent,
        configured: true,
      }
      : subject));
    setEditing(null);
  }

  return (
    <div className="app-frame hub-page">
      <header className="topbar hub-topbar">
        <Link className="brand" href="/" aria-label="9教科の学習一覧">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">T/9</span>
          <span>
            <strong>TEST//GRID</strong>
            <small>9-SUBJECT STUDY HUB</small>
          </span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {configuredCount} / 9 NAMED</span>
          <Link className="outline-button header-link hub-memory-header-link" href="/cards">全教科の暗記帳検索</Link>
        </div>
      </header>

      <main className="hub-main">
        <section className="hub-hero" aria-labelledby="hub-title">
          <div>
            <p className="eyebrow"><span>REGULAR EXAM / 9 SUBJECTS</span><span>LOCAL STUDY DESK</span></p>
            <h1 id="hub-title">9教科を、<br /><em>ひとつずつ潰す。</em></h1>
            <p>英語はZIP教材の専用演習、ネットワークは層の暗算・即答・暗記帳、熱・流体力学は熱力学7枚・6単元の公式と全範囲想定試験、確率統計・応用数学もA4想定試験まで収録。ほかの科目もここでまとめて回せます。</p>
          </div>
          <Link className="hub-primary-link" href="/subjects/network">
            <span>READY NOW</span>
            <strong>ネットワークから始める</strong>
            <b aria-hidden="true">→</b>
          </Link>
        </section>

        <Link className="hub-memory-launch" href="/cards">
          <span>
            <small>ALL SUBJECTS / MEMORY SEARCH</small>
            <strong>暗記帳と検索はここです。</strong>
            <em>全教科から検索。あやふやなら「もしかして？検索」</em>
          </span>
          <b aria-hidden="true">開く →</b>
        </Link>

        <section className="hub-summary" aria-label="全体の学習状況">
          <div><span>SUBJECTS NAMED</span><strong>{configuredCount}<small>/9</small></strong></div>
          <div><span>STUDY CARDS</span><strong>{totals.cards}<small>枚</small></strong></div>
          <div><span>MASTERED</span><strong>{totals.mastered}<small>枚</small></strong></div>
          <p>データはこの端末に自動保存。科目名も教材もあとから変更できます。</p>
        </section>

        <section className="hub-exam-schedule" aria-labelledby="exam-schedule-title">
          <div className="hub-exam-schedule-head">
            <div>
              <span>EXAM SCHEDULE / 2026</span>
              <h2 id="exam-schedule-title">定期試験の日程</h2>
            </div>
            <p>7月28日から8月3日まで。各日の科目と残り日数をまとめています。</p>
          </div>
          <ol className="hub-exam-schedule-list">
            {EXAM_SCHEDULE.map((entry, index) => {
              const remainingDays = daysUntil(entry.date);
              const scheduledSubjects = entry.subjectIds.map((subjectId) => ({
                id: subjectId,
                name: subjects.find((subject) => subject.id === subjectId)?.name ?? subjectId,
              }));
              return (
                <li
                  className={`hub-exam-schedule-item${remainingDays === 0 ? " is-today" : remainingDays !== null && remainingDays < 0 ? " is-past" : ""}`}
                  key={entry.date}
                >
                  <span className="hub-exam-schedule-order">DAY {String(index + 1).padStart(2, "0")}</span>
                  <time dateTime={entry.date}>{entry.displayDate}</time>
                  <div className="hub-exam-schedule-subjects">
                    {scheduledSubjects.map((subject) => <span key={subject.id}>{subject.name}</span>)}
                  </div>
                  <strong>{scheduleCountdownLabel(entry.date)}</strong>
                </li>
              );
            })}
          </ol>
        </section>
        <section className="hub-subject-section" aria-labelledby="subject-list-title">
          <div className="hub-section-heading">
            <div><span>SUBJECT GRID</span><h2 id="subject-list-title">科目別の勉強机</h2></div>
            <p>まず科目名を設定し、授業ノートやプリントから問題と答えを登録してください。</p>
          </div>

          <div className="subject-grid">
            {subjects.map((subject) => {
              const metric = metrics[subject.id] ?? { cards: 0, mastered: 0 };
              const completion = metric.cards ? Math.round((metric.mastered / metric.cards) * 100) : 0;
              const hasMaterial = subject.module === "network" || subject.id === "subject-3" || subject.id === "subject-4" || subject.id === "subject-6" || subject.id === "subject-7" || subject.id === "subject-8" || metric.cards > 0;
              const style = { "--subject-accent": subject.accent } as CSSProperties;
              return (
                <article className={`subject-tile ${subject.configured ? "is-configured" : "is-empty"}`} style={style} key={subject.id}>
                  <div className="subject-tile-top">
                    <span className="subject-number">{String(subject.order).padStart(2, "0")}</span>
                    <span className="subject-status">{!subject.configured ? "未設定" : hasMaterial ? "準備済み" : "教材待ち"}</span>
                  </div>
                  <h3>{subject.name}</h3>
                  <p>{subject.configured
                    ? subject.memo || (metric.cards ? `${metric.cards}枚の教材を登録済み` : "教材を追加して勉強を始めましょう")
                    : "科目名と教材を登録すると勉強を始められます。"}</p>

                  {subject.configured && (
                    <div className="subject-progress">
                      <div><span>{dateLabel(subject.testDate)}</span><strong>{metric.mastered} / {metric.cards} 暗記</strong></div>
                      <progress value={completion} max="100" aria-label={`${subject.name}の暗記進捗 ${completion}%`} />
                    </div>
                  )}

                  <div className="subject-actions">
                    {subject.module === "network" ? (
                      <>
                        <Link className="subject-primary subject-memory-link" href="/subjects/network/cards">暗記帳を開く</Link>
                        <Link className="subject-secondary" href="/subjects/network">暗算・層即答</Link>
                        <Link className="subject-secondary subject-rapid-link" href="/rapid/network">時間制限 即答</Link>
                      </>
                    ) : subject.configured ? (
                      <>
                        <Link className="subject-primary" href={`/subjects/${subject.id}`}>勉強を始める</Link>
                        <Link className="subject-secondary subject-rapid-link" href={`/rapid/${subject.id}`}>時間制限 即答</Link>
                      </>
                    ) : (
                      <button className="subject-primary" type="button" onClick={() => beginEdit(subject)}>科目を設定</button>
                    )}
                    <button className="subject-edit" type="button" onClick={() => beginEdit(subject)} aria-label={`${subject.name}の設定を編集`}>
                      設定
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <ComprehensiveChallenge subjects={subjects} />
      </main>

      <footer><span>TEST//GRID</span><p>9 SUBJECTS · AUTO SAVE · ACCOUNT SYNC</p><span>HUB 01</span></footer>

      {editing && (
        <div className="subject-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="subject-dialog-title">
          <div className="subject-dialog" ref={dialogRef} style={{ "--subject-accent": editing.accent } as CSSProperties}>
            <div className="subject-dialog-head">
              <div><span>SUBJECT {String(subjects.find((item) => item.id === editing.id)?.order ?? 0).padStart(2, "0")}</span><h2 id="subject-dialog-title">科目を設定</h2></div>
              <button ref={closeRef} type="button" onClick={() => setEditing(null)} aria-label="科目設定を閉じる">閉じる ×</button>
            </div>
            <form onSubmit={saveSubject}>
              <label>
                <span>科目名 <b>必須</b></span>
                <input autoComplete="off" maxLength={32} required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
              </label>
              <label>
                <span>テスト日 <small>任意</small></span>
                <input type="date" value={editing.testDate} onChange={(event) => setEditing({ ...editing, testDate: event.target.value })} />
              </label>
              <label>
                <span>ひとことメモ <small>任意</small></span>
                <textarea maxLength={120} rows={3} placeholder="例：教科書20〜48ページ、用語中心" value={editing.memo} onChange={(event) => setEditing({ ...editing, memo: event.target.value })} />
              </label>
              <fieldset>
                <legend>テーマカラー</legend>
                <div className="subject-color-options">
                  {SUBJECT_ACCENTS.map((accent, index) => (
                    <label key={accent} style={{ "--swatch": accent } as CSSProperties}>
                      <input type="radio" name="subject-accent" value={accent} checked={editing.accent === accent} onChange={() => setEditing({ ...editing, accent })} />
                      <span>色 {index + 1}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="subject-dialog-actions">
                <button type="button" onClick={() => setEditing(null)}>キャンセル</button>
                <button type="submit">保存する →</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
