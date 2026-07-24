"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { APPLIED_MATH_EXPECTED_EXAMS } from "./applied-math-data";
import { DisplayMath, RichMathText } from "./statistics-math";
import styles from "./applied-math-expected-exams.module.css";

type ExpectedExam = (typeof APPLIED_MATH_EXPECTED_EXAMS)[number];
type ExpectedSection = ExpectedExam["sections"][number];
type ExpectedQuestion = ExpectedSection["questions"][number];
type ExamPhase = "setup" | "active" | "paused" | "result";
type AnswerMap = Record<string, string>;
type PointMap = Record<string, number>;

type StoredAppliedMathExam = {
  version: 1;
  examId: string;
  phase: "paused" | "result";
  answers: AnswerMap;
  awardedPoints: PointMap;
  remainingSeconds: number;
  updatedAt: string;
};

export const APPLIED_MATH_EXPECTED_EXAM_STORAGE_KEY = "test-grid:subject-8:expected-exam:v1";
const FULL_DURATION_SECONDS = 50 * 60;
const PASS_POINTS = 48;
const EXAM_POINTS = 80;
const SECTIONS_PER_PAGE = 2;
const EXAM_IDS = new Set(APPLIED_MATH_EXPECTED_EXAMS.map((exam) => exam.id));

function questionsFor(exam: ExpectedExam) {
  return exam.sections.flatMap((section) => section.questions);
}

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/\\\(|\\\)/g, "")
    .replace(/[\s$、，,。．.]/g, "")
    .trim();
}

function isAutomaticallyCorrect(question: ExpectedQuestion, response: string) {
  const normalizedResponse = normalizeAnswer(response);
  if (!normalizedResponse) return false;

  const candidates = [question.answer, ...(question.accepted ?? [])]
    .map(normalizeAnswer)
    .filter(Boolean);
  if (candidates.some((candidate) => candidate === normalizedResponse)) return true;
  if (candidates.some((candidate) => candidate.length >= 5 && normalizedResponse.includes(candidate))) return true;

  if (typeof question.numericAnswer === "number") {
    const numericResponse = Number(response.trim());
    const tolerance = question.tolerance ?? 0.000001;
    if (Number.isFinite(numericResponse) && Math.abs(numericResponse - question.numericAnswer) <= tolerance) return true;
  }

  if (question.keywords?.length) {
    const hits = question.keywords.filter((keyword) => normalizedResponse.includes(normalizeAnswer(keyword))).length;
    return hits >= (question.minKeywords ?? question.keywords.length);
  }
  return false;
}

function initialPoints(exam: ExpectedExam, answers: AnswerMap) {
  return Object.fromEntries(questionsFor(exam).map((question) => [
    question.id,
    isAutomaticallyCorrect(question, answers[question.id] ?? "") ? question.points : 0,
  ]));
}

function clampPoints(question: ExpectedQuestion, value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(question.points, Math.max(0, Math.floor(parsed))) : 0;
}

function sectionPages(sections: ExpectedExam["sections"]) {
  return Array.from(
    { length: Math.ceil(sections.length / SECTIONS_PER_PAGE) },
    (_, index) => sections.slice(index * SECTIONS_PER_PAGE, (index + 1) * SECTIONS_PER_PAGE),
  );
}

function sourcePageLabel(question: ExpectedQuestion) {
  const pages = Array.from(new Set(question.sourcePages)).sort((left, right) => left - right);
  return pages.length ? `範囲資料 p.${pages.join("・")}` : "範囲資料（ページ確認中）";
}

function parseStoredExam(raw: string | null): StoredAppliedMathExam | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAppliedMathExam>;
    if (parsed.version !== 1 || typeof parsed.examId !== "string" || !EXAM_IDS.has(parsed.examId)) return null;
    const exam = APPLIED_MATH_EXPECTED_EXAMS.find((candidate) => candidate.id === parsed.examId);
    if (!exam) return null;
    const validQuestions = new Map(questionsFor(exam).map((question) => [question.id, question]));
    const answers = parsed.answers && typeof parsed.answers === "object" && !Array.isArray(parsed.answers)
      ? Object.fromEntries(Object.entries(parsed.answers).filter(([id, answer]) => validQuestions.has(id) && typeof answer === "string"))
      : {};
    const awardedPoints = parsed.awardedPoints && typeof parsed.awardedPoints === "object" && !Array.isArray(parsed.awardedPoints)
      ? Object.fromEntries(Object.entries(parsed.awardedPoints).filter(([id]) => validQuestions.has(id)).map(([id, value]) => [id, clampPoints(validQuestions.get(id) as ExpectedQuestion, value)]))
      : {};
    return {
      version: 1,
      examId: exam.id,
      phase: parsed.phase === "result" ? "result" : "paused",
      answers,
      awardedPoints,
      remainingSeconds: typeof parsed.remainingSeconds === "number"
        ? Math.min(FULL_DURATION_SECONDS, Math.max(0, Math.floor(parsed.remainingSeconds)))
        : FULL_DURATION_SECONDS,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export default function AppliedMathExpectedExams() {
  const [selectedExamId, setSelectedExamId] = useState(APPLIED_MATH_EXPECTED_EXAMS[0].id);
  const [phase, setPhase] = useState<ExamPhase>("setup");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [awardedPoints, setAwardedPoints] = useState<PointMap>({});
  const [remainingSeconds, setRemainingSeconds] = useState(FULL_DURATION_SECONDS);
  const [savedExam, setSavedExam] = useState<StoredAppliedMathExam | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [printAnswers, setPrintAnswers] = useState(false);
  const [statusMessage, setStatusMessage] = useState("開始すると解答と残り時間を自動保存します。");
  const answersRef = useRef<AnswerMap>({});
  const examRef = useRef<ExpectedExam>(APPLIED_MATH_EXPECTED_EXAMS[0]);

  const exam = useMemo(
    () => APPLIED_MATH_EXPECTED_EXAMS.find((candidate) => candidate.id === selectedExamId) ?? APPLIED_MATH_EXPECTED_EXAMS[0],
    [selectedExamId],
  );
  const questions = useMemo(() => questionsFor(exam), [exam]);
  const pages = useMemo(() => sectionPages(exam.sections), [exam]);
  const answeredCount = questions.filter((question) => answers[question.id]?.trim()).length;
  const score = questions.reduce((sum, question) => sum + clampPoints(question, awardedPoints[question.id] ?? 0), 0);
  const convertedScore = Math.round((score / EXAM_POINTS) * 100);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { examRef.current = exam; }, [exam]);

  /* Restored work always waits for an explicit resume so the timer cannot run unnoticed. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSavedExam(parseStoredExam(window.localStorage.getItem(APPLIED_MATH_EXPECTED_EXAM_STORAGE_KEY)));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setAwardedPoints(initialPoints(examRef.current, answersRef.current));
          setPhase("result");
          setStatusMessage("50分が経過したため自動終了しました。自己採点を確認してください。");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (!hydrated || phase === "setup") return;
    const timer = window.setTimeout(() => {
      const snapshot: StoredAppliedMathExam = {
        version: 1,
        examId: exam.id,
        phase: phase === "result" ? "result" : "paused",
        answers,
        awardedPoints,
        remainingSeconds,
        updatedAt: new Date().toISOString(),
      };
      try {
        window.localStorage.setItem(APPLIED_MATH_EXPECTED_EXAM_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // The exam remains usable when storage is blocked.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [answers, awardedPoints, exam.id, hydrated, phase, remainingSeconds]);

  useEffect(() => () => document.body.classList.remove("applied-math-expected-printing"), []);

  function saveSnapshot(snapshotPhase: "paused" | "result") {
    const snapshot: StoredAppliedMathExam = {
      version: 1,
      examId: exam.id,
      phase: snapshotPhase,
      answers,
      awardedPoints,
      remainingSeconds,
      updatedAt: new Date().toISOString(),
    };
    try { window.localStorage.setItem(APPLIED_MATH_EXPECTED_EXAM_STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Continue without storage. */ }
    setSavedExam(snapshot);
    return snapshot;
  }

  function startExam(examId: string) {
    setSelectedExamId(examId);
    setAnswers({});
    setAwardedPoints({});
    setRemainingSeconds(FULL_DURATION_SECONDS);
    setPhase("active");
    setSavedExam(null);
    setStatusMessage("試験を開始しました。解答と残り時間は自動保存中です。");
    window.setTimeout(() => document.getElementById("applied-math-expected-paper")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function resumeSavedExam() {
    if (!savedExam) return;
    setSelectedExamId(savedExam.examId);
    setAnswers(savedExam.answers);
    setAwardedPoints(savedExam.awardedPoints);
    setRemainingSeconds(savedExam.remainingSeconds);
    setPhase(savedExam.phase === "result" ? "result" : "active");
    setStatusMessage(savedExam.phase === "result" ? "保存された採点結果を開きました。" : `${formatTime(savedExam.remainingSeconds)}から再開しました。`);
    window.setTimeout(() => document.getElementById("applied-math-expected-paper")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function pauseExam() {
    saveSnapshot("paused");
    setPhase("paused");
    setStatusMessage(`${formatTime(remainingSeconds)}で中断し、現在状況を保存しました。`);
  }

  function resumeCurrentExam() {
    setPhase("active");
    setStatusMessage(`${formatTime(remainingSeconds)}から再開しました。`);
  }

  function finishExam() {
    const points = initialPoints(exam, answers);
    setAwardedPoints(points);
    setPhase("result");
    setStatusMessage("提出しました。自動判定を確認し、途中式の部分点を各問で調整してください。");
  }

  function returnToSelector() {
    if (phase === "active" || phase === "paused") saveSnapshot("paused");
    if (phase === "result") saveSnapshot("result");
    setPhase("setup");
    window.setTimeout(() => document.getElementById("applied-math-expected-selector")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function deleteSavedExam() {
    try { window.localStorage.removeItem(APPLIED_MATH_EXPECTED_EXAM_STORAGE_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(null);
    setStatusMessage("保存データを削除しました。");
  }

  function updatePoints(question: ExpectedQuestion, value: unknown) {
    setAwardedPoints((current) => ({ ...current, [question.id]: clampPoints(question, value) }));
  }

  function printExam(includeAnswers: boolean) {
    setPrintAnswers(includeAnswers);
    const cleanup = () => document.body.classList.remove("applied-math-expected-printing");
    document.body.classList.add("applied-math-expected-printing");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(() => {
      try { window.print(); } catch { cleanup(); }
    }, 0);
  }

  if (phase === "setup") {
    return (
      <section className={styles.selector} id="applied-math-expected-selector" aria-labelledby="applied-math-expected-title">
        <header className={styles.selectorHeader}>
          <div><span>EXPECTED EXAM · 6 SETS</span><h2 id="applied-math-expected-title">応用数学 予想模試</h2></div>
          <p>当初範囲16枚・追加範囲6枚・追加範囲2の5枚、全27枚から9単元を毎回すべて出題。実際の形式に合わせた50分・80点・大問6問のA4問題用紙です。</p>
        </header>

        <div className={styles.introStats} aria-label="予想模試の条件">
          <div><span>SETS</span><strong>6</strong><small>全範囲セット</small></div>
          <div><span>TIME</span><strong>50</strong><small>分</small></div>
          <div><span>FULL</span><strong>80</strong><small>点</small></div>
          <div><span>PASS</span><strong>48</strong><small>点・60%</small></div>
        </div>

        {savedExam && (
          <aside className={styles.savedCard} aria-label="保存された予想模試">
            <div><span>SAVED SESSION</span><strong>{APPLIED_MATH_EXPECTED_EXAMS.find((candidate) => candidate.id === savedExam.examId)?.title}</strong><p>残り {formatTime(savedExam.remainingSeconds)}・{new Date(savedExam.updatedAt).toLocaleString("ja-JP")} 保存</p></div>
            <div className={styles.savedActions}>
              <button className={styles.primary} type="button" onClick={resumeSavedExam}>{savedExam.phase === "result" ? "採点結果を開く" : "続きから再開"}</button>
              <button type="button" onClick={deleteSavedExam}>保存データを削除</button>
            </div>
          </aside>
        )}

        <div className={styles.examGrid}>
          {APPLIED_MATH_EXPECTED_EXAMS.map((candidate) => (
            <article className={styles.examCard} key={candidate.id}>
              <span>{String(candidate.number).padStart(2, "0")} / 06</span>
              <h3>{candidate.title}</h3>
              <p>{candidate.subtitle}</p>
              <dl><div><dt>大問</dt><dd>{candidate.sections.length}</dd></div><div><dt>小問</dt><dd>{questionsFor(candidate).length}</dd></div><div><dt>配点</dt><dd>{candidate.totalPoints}</dd></div></dl>
              <small>内積・外積／ベクトル関数／曲線・線積分／曲面・面積分／勾配／発散・回転／グリーン</small>
              <button type="button" onClick={() => startExam(candidate.id)}>このセットを始める →</button>
            </article>
          ))}
        </div>
        <p className={styles.statusMessage} aria-live="polite">{statusMessage}</p>
      </section>
    );
  }

  return (
    <section className={`${styles.lab} ${printAnswers ? styles.printAnswers : styles.printQuestions}`} aria-labelledby="applied-math-active-title">
      <div className={styles.toolbar}>
        <div className={styles.toolbarMeta}><span>{exam.title}</span><strong className={remainingSeconds <= 300 ? styles.urgent : ""}>{formatTime(remainingSeconds)}</strong><small>{answeredCount}/{questions.length} 小問に入力・自動保存</small></div>
        <div className={styles.toolbarActions}>
          {phase === "active" && <button type="button" onClick={pauseExam}>中断して保存</button>}
          {phase === "paused" && <button className={styles.primary} type="button" onClick={resumeCurrentExam}>続きから再開</button>}
          {phase === "active" && <button className={styles.primary} type="button" onClick={finishExam}>提出・採点</button>}
          <button type="button" onClick={() => printExam(false)}>A4問題のみ印刷</button>
          {phase === "result" && <button type="button" onClick={() => printExam(true)}>解答・解説込み印刷</button>}
          <button type="button" onClick={returnToSelector}>6セット一覧</button>
        </div>
        <p aria-live="polite">{statusMessage}</p>
      </div>

      {phase === "paused" && <div className={styles.pauseBanner}><span>PAUSED</span><strong>残り {formatTime(remainingSeconds)} を保存済み</strong><button type="button" onClick={resumeCurrentExam}>再開する →</button></div>}

      {phase === "result" && (
        <div className={`${styles.scoreStrip} ${score >= PASS_POINTS ? styles.pass : styles.fail}`}>
          <div><span>RESULT</span><strong>{score}<small>/80</small></strong></div>
          <div><span>100点換算</span><strong>{convertedScore}<small>/100</small></strong></div>
          <p>{score >= PASS_POINTS ? "合格ライン48点（60%）をクリア" : `合格ライン48点まであと${PASS_POINTS - score}点`}<small>紙で解いた問題と途中式の部分点は、下の解答欄で手動調整できます。</small></p>
        </div>
      )}

      <div className={styles.paperStack} id="applied-math-expected-paper">
        {pages.map((pageSections, pageIndex) => (
          <article className={styles.paperPage} key={`${exam.id}-page-${pageIndex + 1}`}>
            <header className={styles.paperHeader}>
              <div><span>2026 · APPLIED MATHEMATICS</span><h1 id={pageIndex === 0 ? "applied-math-active-title" : undefined}>{exam.title}</h1><p>{exam.subtitle}</p></div>
              <label><span>氏名</span><input type="text" aria-label={`氏名・${pageIndex + 1}ページ`} /></label>
            </header>
            <div className={styles.paperMeta}><span>試験時間 50分</span><span>80点満点</span><span>合格ライン 48点</span><span>PAGE {pageIndex + 1} / {pages.length}</span></div>
            {pageIndex === 0 && <p className={styles.instructions}>各問とも答えだけでなく、使用した公式・式変形・途中計算を解答欄に残すこと。数式はベクトル記号と積分区間を明記すること。</p>}

            {pageSections.map((section) => (
              <section className={styles.examSection} key={`${exam.id}-section-${section.number}`}>
                <header className={styles.sectionHeader}><span>第{section.number}問</span><div><h2>{section.title}</h2><small>{section.topicIds.join(" / ")}</small></div><strong>{section.points}点</strong></header>
                <p className={styles.sectionContext}><RichMathText text={section.context} /></p>
                <div className={styles.questionList}>
                  {section.questions.map((question) => (
                    <article className={styles.paperQuestion} key={question.id}>
                      <header className={styles.questionHeader}><span>（{question.sub}）</span><strong>{question.genre}</strong><b>〔{question.points}点〕</b></header>
                      <p className={styles.prompt}><RichMathText text={question.prompt} /></p>
                      <label className={styles.answerField}>
                        <span>解答・途中式</span>
                        <textarea rows={4} disabled={phase !== "active"} value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder={phase === "active" ? "式と答えを入力（紙で解く場合は空欄で可）" : "中断中または採点済み"} />
                      </label>
                    </article>
                  ))}
                </div>
              </section>
            ))}
            <footer className={styles.paperFooter}><span>TEST//GRID · RANGE P.1–16</span><strong>{exam.id.toUpperCase()}</strong><span>PAGE {pageIndex + 1} / {pages.length}</span></footer>
          </article>
        ))}
      </div>

      {phase === "active" && <div className={styles.finishBar}><div><span>REMAINING</span><strong>{formatTime(remainingSeconds)}</strong></div><button type="button" onClick={pauseExam}>中断して保存</button><button className={styles.primary} type="button" onClick={finishExam}>試験を終了して採点 →</button></div>}

      {phase === "result" && (
        <section className={styles.answerBook} aria-labelledby="applied-math-solutions-title">
          <header className={styles.resultHeader}><div><span>ANSWER · STEPS · SOURCE</span><h2 id="applied-math-solutions-title">模範解答と途中式</h2><p>完全一致・数値・キーワードは自動採点済みです。記述の同値変形と途中式の部分点は各問の得点欄で調整してください。</p></div><strong>{score >= PASS_POINTS ? "PASS" : "RETRY"}</strong></header>
          <div className={styles.answerSections}>
            {exam.sections.map((section) => (
              <section className={styles.answerSection} key={`solution-${exam.id}-${section.number}`}>
                <header><span>第{section.number}問</span><h3>{section.title}</h3><strong>{section.points}点</strong></header>
                <p className={styles.sectionContext}><RichMathText text={section.context} /></p>
                {section.questions.map((question) => {
                  const awarded = clampPoints(question, awardedPoints[question.id] ?? 0);
                  return (
                    <article className={styles.solutionCard} key={`solution-${question.id}`}>
                      <header className={styles.solutionHead}><span>（{question.sub}）{question.genre}</span><strong>{awarded}/{question.points}点</strong></header>
                      <h4><RichMathText text={question.prompt} /></h4>
                      <div className={styles.answerCompare}><div><span>あなたの解答</span><pre>{answers[question.id] || "未入力（紙の解答を確認）"}</pre></div><div><span>模範解答</span><p><RichMathText text={question.answer} /></p></div></div>
                      {question.formula && <div className={styles.formulaBox}><span>使う公式</span><DisplayMath tex={question.formula} /></div>}
                      <div className={styles.steps}><span>途中式・考え方</span><ol>{question.steps.map((step, index) => <li key={`${question.id}-step-${index}`}><RichMathText text={step} /></li>)}</ol><p><b>解説：</b><RichMathText text={question.explanation} /></p></div>
                      <p className={styles.sourcePages}><span>SOURCE</span>{sourcePageLabel(question)}</p>
                      <div className={styles.grading}><button type="button" className={awarded === question.points ? styles.fullPoint : ""} onClick={() => updatePoints(question, awarded === question.points ? 0 : question.points)}>{awarded === question.points ? "満点を取り消す" : "この小問を満点にする"}</button><label><span>得点</span><input type="number" inputMode="numeric" min="0" max={question.points} value={awarded} onChange={(event) => updatePoints(question, event.target.value)} /><b>/ {question.points}点</b></label></div>
                    </article>
                  );
                })}
              </section>
            ))}
          </div>
          <div className={styles.resultActions}><button type="button" onClick={() => printExam(true)}>解答・解説込みで印刷</button><button className={styles.primary} type="button" onClick={() => startExam(exam.id)}>同じセットを解き直す</button><button type="button" onClick={returnToSelector}>別のセットへ</button></div>
        </section>
      )}
    </section>
  );
}
