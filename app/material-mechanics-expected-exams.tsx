"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MATERIAL_MECHANICS_EXPECTED_EXAMS } from "./material-mechanics-data";
import MaterialMechanicsDiagram, { type MaterialMechanicsDiagramKind } from "./material-mechanics-diagrams";
import { DisplayMath, RichMathText } from "./statistics-math";
import styles from "./material-mechanics-expected-exams.module.css";

type SourceRef = { kind?: string; page?: number; note?: string; evidence?: string };
type ExpectedQuestion = {
  id: string;
  sub: number;
  genre: string;
  points: number;
  prompt: string;
  answer: string;
  accepted?: string[];
  numericAnswer?: number;
  tolerance?: number;
  expectedUnit?: string;
  acceptedUnits?: Record<string, number>;
  requiresUnit?: boolean;
  keywords?: string[];
  minKeywords?: number;
  formula?: string;
  steps: string[];
  explanation: string;
  sourcePages?: number[];
  sourceRefs?: SourceRef[];
  diagram?: MaterialMechanicsDiagramKind;
};
type ExpectedSection = {
  number: number;
  title: string;
  points: number;
  context?: string;
  topicIds?: string[];
  questions: ExpectedQuestion[];
};
type ExpectedExam = {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  totalPoints?: number;
  sections: ExpectedSection[];
};
type ExamPhase = "setup" | "active" | "paused" | "result";
type AnswerMap = Record<string, string>;
type PointMap = Record<string, number>;

type StoredMaterialMechanicsExam = {
  version: 1;
  examId: string;
  phase: "paused" | "result";
  answers: AnswerMap;
  awardedPoints: PointMap;
  remainingSeconds: number;
  practiceMinutes: number;
  savedAt: number;
};

export const MATERIAL_MECHANICS_EXPECTED_EXAM_STORAGE_KEY = "test-grid:subject-5:expected-exam:v1";
const DEFAULT_PRACTICE_MINUTES = 50;
const PASS_PERCENT = 60;
const SECTIONS_PER_PAGE = 2;
const EXAMS = MATERIAL_MECHANICS_EXPECTED_EXAMS as unknown as ExpectedExam[];
const EXAM_IDS = new Set(EXAMS.map((exam) => exam.id));

function questionsFor(exam: ExpectedExam) {
  return exam.sections.flatMap((section) => section.questions);
}

function pointsFor(exam: ExpectedExam) {
  const calculated = questionsFor(exam).reduce((sum, question) => sum + question.points, 0);
  return calculated || exam.totalPoints || 100;
}

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function clampMinutes(value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? Math.min(180, Math.max(1, Math.floor(parsed))) : DEFAULT_PRACTICE_MINUTES;
}

function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/\\\(|\\\)/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/[\s$、，,。．]/g, "")
    .trim();
}

function normalizeUnitToken(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, "").replace(/℃/g, "°c").replace(/[·・⋅*]/g, "").replace(/\^2/g, "2").replace(/\^3/g, "3");
}

function parseLooseNumber(question: ExpectedQuestion, response: string) {
  let normalized = response.normalize("NFKC").toLocaleLowerCase("en").replace(/[−–—]/g, "-").replace(/,/g, "").replace(/\s+/g, "").replace(/℃/g, "°c").replace(/[·・⋅*]/g, "").replace(/\^2/g, "2").replace(/\^3/g, "3").trim();
  const acceptedUnits = Object.entries(question.acceptedUnits ?? {})
    .map(([label, factor]) => ({ label: normalizeUnitToken(label), factor }))
    .sort((left, right) => right.label.length - left.label.length);
  const acceptedUnit = acceptedUnits.find((candidate) => normalized.endsWith(candidate.label));
  let unit = "";
  let factor = 1;

  if (acceptedUnit) {
    unit = acceptedUnit.label;
    factor = acceptedUnit.factor;
    normalized = normalized.slice(0, -unit.length);
  } else {
    const unitMatch = normalized.match(/([a-z°℃%][a-z0-9°℃³^/・*()%]*)$/i);
    const rawUnit = unitMatch?.[1] ?? "";
    unit = normalizeUnitToken(rawUnit);
    if (rawUnit) normalized = normalized.slice(0, -rawUnit.length);
    if (unit === "%") factor = 0.01;
  }

  if ((question.requiresUnit && !unit) || (unit && acceptedUnits.length > 0 && !acceptedUnit)) return Number.NaN;
  const value = Number(normalized);
  return Number.isFinite(value) ? value * factor : Number.NaN;
}
function isAutomaticallyCorrect(question: ExpectedQuestion, response: string) {
  const normalizedResponse = normalizeAnswer(response);
  if (!normalizedResponse) return false;
  const candidates = [question.answer, ...(question.accepted ?? [])].map(normalizeAnswer).filter(Boolean);
  if (candidates.some((candidate) => candidate === normalizedResponse)) return true;
  if (candidates.some((candidate) => candidate.length >= 5 && normalizedResponse.includes(candidate))) return true;

  if (typeof question.numericAnswer === "number") {
    const numeric = parseLooseNumber(question, response);
    const tolerance = question.tolerance ?? Math.max(0.000001, Math.abs(question.numericAnswer) * 0.001);
    if (Number.isFinite(numeric) && Math.abs(numeric - question.numericAnswer) <= tolerance) return true;
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

function sectionPages(sections: ExpectedSection[]) {
  return Array.from(
    { length: Math.ceil(sections.length / SECTIONS_PER_PAGE) },
    (_, index) => sections.slice(index * SECTIONS_PER_PAGE, (index + 1) * SECTIONS_PER_PAGE),
  );
}

function sourceLabel(question: ExpectedQuestion) {
  const sourcePages = question.sourceRefs?.flatMap((source) => (
    source.kind === "range-zip" && typeof source.page === "number" ? [source.page] : []
  )) ?? question.sourcePages ?? [];
  const pages = Array.from(new Set(sourcePages)).sort((left, right) => left - right);
  return pages.length ? `範囲ZIP13枚 p.${pages.join("・")}` : "範囲ZIP13枚";
}
function parseStoredExam(raw: string | null): StoredMaterialMechanicsExam | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredMaterialMechanicsExam>;
    if (parsed.version !== 1 || typeof parsed.examId !== "string" || !EXAM_IDS.has(parsed.examId)) return null;
    const exam = EXAMS.find((candidate) => candidate.id === parsed.examId);
    if (!exam) return null;
    const validQuestions = new Map(questionsFor(exam).map((question) => [question.id, question]));
    const answers = parsed.answers && typeof parsed.answers === "object" && !Array.isArray(parsed.answers)
      ? Object.fromEntries(Object.entries(parsed.answers).filter(([id, answer]) => validQuestions.has(id) && typeof answer === "string"))
      : {};
    const awardedPoints = parsed.awardedPoints && typeof parsed.awardedPoints === "object" && !Array.isArray(parsed.awardedPoints)
      ? Object.fromEntries(Object.entries(parsed.awardedPoints).filter(([id]) => validQuestions.has(id)).map(([id, value]) => [id, clampPoints(validQuestions.get(id) as ExpectedQuestion, value)]))
      : {};
    const practiceMinutes = clampMinutes(parsed.practiceMinutes);
    return {
      version: 1,
      examId: exam.id,
      phase: parsed.phase === "result" ? "result" : "paused",
      answers,
      awardedPoints,
      remainingSeconds: typeof parsed.remainingSeconds === "number"
        ? Math.min(practiceMinutes * 60, Math.max(0, Math.floor(parsed.remainingSeconds)))
        : practiceMinutes * 60,
      practiceMinutes,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function MaterialMechanicsExpectedExamLab({ firstExam }: { firstExam: ExpectedExam }) {
  const [selectedExamId, setSelectedExamId] = useState(firstExam.id);
  const [practiceMinutesDraft, setPracticeMinutesDraft] = useState(String(DEFAULT_PRACTICE_MINUTES));
  const [practiceMinutes, setPracticeMinutes] = useState(DEFAULT_PRACTICE_MINUTES);
  const [phase, setPhase] = useState<ExamPhase>("setup");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [awardedPoints, setAwardedPoints] = useState<PointMap>({});
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_PRACTICE_MINUTES * 60);
  const [savedExam, setSavedExam] = useState<StoredMaterialMechanicsExam | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [printAnswers, setPrintAnswers] = useState(false);
  const [statusMessage, setStatusMessage] = useState("練習時間を決めて開始すると、解答と残り時間を自動保存します。");
  const answersRef = useRef<AnswerMap>({});
  const examRef = useRef<ExpectedExam>(firstExam);

  const exam = useMemo(() => EXAMS.find((candidate) => candidate.id === selectedExamId) ?? firstExam, [firstExam, selectedExamId]);
  const questions = useMemo(() => questionsFor(exam), [exam]);
  const pages = useMemo(() => sectionPages(exam.sections), [exam]);
  const examPoints = pointsFor(exam);
  const answeredCount = questions.filter((question) => answers[question.id]?.trim()).length;
  const score = questions.reduce((sum, question) => sum + clampPoints(question, awardedPoints[question.id] ?? 0), 0);
  const convertedScore = examPoints ? Math.round((score / examPoints) * 100) : 0;

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { examRef.current = exam; }, [exam]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSavedExam(parseStoredExam(window.localStorage.getItem(MATERIAL_MECHANICS_EXPECTED_EXAM_STORAGE_KEY)));
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
          setStatusMessage("設定した練習時間が経過したため自動終了しました。部分点を確認してください。");
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
      const snapshot: StoredMaterialMechanicsExam = {
        version: 1,
        examId: exam.id,
        phase: phase === "result" ? "result" : "paused",
        answers,
        awardedPoints,
        remainingSeconds,
        practiceMinutes,
        savedAt: Date.now(),
      };
      try { window.localStorage.setItem(MATERIAL_MECHANICS_EXPECTED_EXAM_STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Continue without storage. */ }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [answers, awardedPoints, exam.id, hydrated, phase, practiceMinutes, remainingSeconds]);

  useEffect(() => () => document.body.classList.remove("material-mechanics-expected-printing"), []);

  function saveSnapshot(snapshotPhase: "paused" | "result") {
    const snapshot: StoredMaterialMechanicsExam = {
      version: 1, examId: exam.id, phase: snapshotPhase, answers, awardedPoints,
      remainingSeconds, practiceMinutes, savedAt: Date.now(),
    };
    try { window.localStorage.setItem(MATERIAL_MECHANICS_EXPECTED_EXAM_STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Continue without storage. */ }
    setSavedExam(snapshot);
    return snapshot;
  }

  function startExam(examId: string) {
    const minutes = clampMinutes(practiceMinutesDraft);
    setSelectedExamId(examId);
    setPracticeMinutes(minutes);
    setPracticeMinutesDraft(String(minutes));
    setAnswers({});
    setAwardedPoints({});
    setRemainingSeconds(minutes * 60);
    setPhase("active");
    setSavedExam(null);
    setStatusMessage(`${minutes}分の練習用タイマーで開始しました。正式な試験時間ではありません。`);
    window.setTimeout(() => document.getElementById("material-mechanics-expected-paper")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function resumeSavedExam() {
    if (!savedExam) return;
    setSelectedExamId(savedExam.examId);
    setPracticeMinutes(savedExam.practiceMinutes);
    setPracticeMinutesDraft(String(savedExam.practiceMinutes));
    setAnswers(savedExam.answers);
    setAwardedPoints(savedExam.awardedPoints);
    setRemainingSeconds(savedExam.remainingSeconds);
    setPhase(savedExam.phase === "result" ? "result" : "active");
    setStatusMessage(savedExam.phase === "result" ? "保存された採点結果を開きました。" : `${formatTime(savedExam.remainingSeconds)}から再開しました。`);
  }

  function pauseExam() {
    saveSnapshot("paused");
    setPhase("paused");
    setStatusMessage(`${formatTime(remainingSeconds)}で中断し、現在状況を保存しました。`);
  }

  function finishExam() {
    setAwardedPoints(initialPoints(exam, answers));
    setPhase("result");
    setStatusMessage("提出しました。自動判定を確認し、式・単位・線図の部分点を手動調整してください。");
  }

  function returnToSelector() {
    if (phase === "active" || phase === "paused") saveSnapshot("paused");
    if (phase === "result") saveSnapshot("result");
    setPhase("setup");
  }

  function deleteSavedExam() {
    try { window.localStorage.removeItem(MATERIAL_MECHANICS_EXPECTED_EXAM_STORAGE_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(null);
    setStatusMessage("保存データを削除しました。");
  }

  function updatePoints(question: ExpectedQuestion, value: unknown) {
    setAwardedPoints((current) => ({ ...current, [question.id]: clampPoints(question, value) }));
  }

  function printExam(includeAnswers: boolean) {
    setPrintAnswers(includeAnswers);
    const cleanup = () => document.body.classList.remove("material-mechanics-expected-printing");
    document.body.classList.add("material-mechanics-expected-printing");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(() => { try { window.print(); } catch { cleanup(); } }, 0);
  }

  if (phase === "setup") {
    return (
      <section className={styles.selector} id="material-mechanics-expected-selector" aria-labelledby="material-mechanics-expected-title">
        <header className={styles.selectorHeader}>
          <div><span>EXPECTED EXAM · PRACTICE SETTINGS</span><h2 id="material-mechanics-expected-title">材料力学 想定試験</h2></div>
          <p>資料から正式な試験時間と配点は確認できません。50分を初期値とし、1〜180分へ調整できます。練習用100点・60点ラインで確認します。</p>
        </header>
        <div className={styles.introStats} aria-label="想定試験の練習条件">
          <div><span>SETS</span><strong>{EXAMS.length}</strong><small>全範囲</small></div>
          <label><span>TIME</span><input type="number" min="1" max="180" inputMode="numeric" value={practiceMinutesDraft} onChange={(event) => setPracticeMinutesDraft(event.target.value)} /><small>分・標準50</small></label>
          <div><span>SCORE</span><strong>100</strong><small>点換算</small></div>
          <div><span>PASS</span><strong>60</strong><small>練習用</small></div>
        </div>
        <aside className={styles.scopeWarning}><strong>範囲境界</strong><p><b>範囲ZIP13枚だけが今回範囲の正本です。</b> ねじり・軸設計・コイルばね・はり反力・SFD/BMD・曲げ応力・長方形/中空円断面のI・Zを採用します。形式2は形式のみ参照し、問題内容・数値は使用していません。EIによるたわみ、曲率、カスティリアーノの定理は出題しません。</p></aside>

        {savedExam && (
          <aside className={styles.savedCard} aria-label="保存された想定試験">
            <div><span>SAVED SESSION</span><strong>{EXAMS.find((candidate) => candidate.id === savedExam.examId)?.title}</strong><p>残り {formatTime(savedExam.remainingSeconds)}・{new Date(savedExam.savedAt).toLocaleString("ja-JP")} 保存</p></div>
            <div className={styles.savedActions}><button className={styles.primary} type="button" onClick={resumeSavedExam}>{savedExam.phase === "result" ? "採点結果を開く" : "続きから再開"}</button><button type="button" onClick={deleteSavedExam}>保存データを削除</button></div>
          </aside>
        )}

        <div className={styles.examGrid}>
          {EXAMS.map((candidate) => (
            <article className={styles.examCard} key={candidate.id}>
              <span>{String(candidate.number).padStart(2, "0")} / {String(EXAMS.length).padStart(2, "0")}</span>
              <h3>{candidate.title}</h3><p>{candidate.subtitle ?? "材料力学・全範囲練習"}</p>
              <dl><div><dt>大問</dt><dd>{candidate.sections.length}</dd></div><div><dt>小問</dt><dd>{questionsFor(candidate).length}</dd></div><div><dt>練習配点</dt><dd>{pointsFor(candidate)}</dd></div></dl>
              <small>{candidate.sections.map((section) => section.title).join("／")}</small>
              <button type="button" onClick={() => startExam(candidate.id)}>このセットを始める →</button>
            </article>
          ))}
        </div>
        <p className={styles.statusMessage} aria-live="polite">{statusMessage}</p>
      </section>
    );
  }

  return (
    <section className={`${styles.lab} ${printAnswers ? styles.printAnswers : styles.printQuestions}`} aria-labelledby="material-mechanics-active-title">
      <div className={styles.toolbar}>
        <div className={styles.toolbarMeta}><span>{exam.title} · 練習{practiceMinutes}分</span><strong className={remainingSeconds <= 300 ? styles.urgent : ""}>{formatTime(remainingSeconds)}</strong><small>{answeredCount}/{questions.length} 小問に入力・自動保存</small></div>
        <div className={styles.toolbarActions}>
          {phase === "active" && <button type="button" onClick={pauseExam}>中断して保存</button>}
          {phase === "paused" && <button className={styles.primary} type="button" onClick={() => setPhase("active")}>続きから再開</button>}
          {phase === "active" && <button className={styles.primary} type="button" onClick={finishExam}>提出・採点</button>}
          <button type="button" onClick={() => printExam(false)}>A4問題のみ印刷</button>
          {phase === "result" && <button type="button" onClick={() => printExam(true)}>解答・解説込み印刷</button>}
          <button type="button" onClick={returnToSelector}>セット一覧</button>
        </div><p aria-live="polite">{statusMessage}</p>
      </div>

      {phase === "paused" && <div className={styles.pauseBanner}><span>PAUSED</span><strong>残り {formatTime(remainingSeconds)} を保存済み</strong><button type="button" onClick={() => setPhase("active")}>再開する →</button></div>}

      {phase === "result" && (
        <div className={`${styles.scoreStrip} ${convertedScore >= PASS_PERCENT ? styles.pass : styles.fail}`}>
          <div><span>練習得点</span><strong>{score}<small>/{examPoints}</small></strong></div>
          <div><span>100点換算</span><strong>{convertedScore}<small>/100</small></strong></div>
          <p>{convertedScore >= PASS_PERCENT ? "練習用60点ラインをクリア" : `練習用60点まであと${PASS_PERCENT - convertedScore}点`}<small>正式配点ではありません。途中式・単位・線図の部分点は下で調整できます。</small></p>
        </div>
      )}

      <div className={styles.paperStack} id="material-mechanics-expected-paper">
        {pages.map((pageSections, pageIndex) => (
          <article className={styles.paperPage} key={`${exam.id}-page-${pageIndex + 1}`}>
            <header className={styles.paperHeader}><div><span>MATERIAL MECHANICS · PRACTICE PAPER</span><h1 id={pageIndex === 0 ? "material-mechanics-active-title" : undefined}>{exam.title}</h1><p>{exam.subtitle ?? "範囲資料準拠・練習用想定問題"}</p></div><label><span>学生番号・氏名</span><input type="text" aria-label={`学生番号・氏名・${pageIndex + 1}ページ`} /></label></header>
            <div className={styles.paperMeta}><span>練習時間 {practiceMinutes}分</span><span>練習配点 {examPoints}点</span><span>100点換算60点ライン</span><span>PAGE {pageIndex + 1} / {pages.length}</span></div>
            {pageIndex === 0 && <p className={styles.instructions}>電卓の使用条件は年度で異なるため各自確認すること。答えだけでなく、式・単位・有効数字・途中計算を記入すること。本紙の時間と配点は練習用である。</p>}
            {pageSections.map((section) => (
              <section className={styles.examSection} key={`${exam.id}-section-${section.number}`}>
                <header className={styles.sectionHeader}><span>第{section.number}問</span><div><h2>{section.title}</h2><small>{section.topicIds?.join(" / ") ?? "MATERIAL_MECHANICS"}</small></div><strong>{section.points}点</strong></header>
                {section.context && <p className={styles.sectionContext}><RichMathText text={section.context} /></p>}
                {section.questions.map((question) => (
                  <article className={styles.paperQuestion} key={question.id}>
                    <header className={styles.questionHeader}><span>（{question.sub}）</span><strong>{question.genre}</strong><b>〔{question.points}点〕</b></header>
                    <p className={styles.prompt}><RichMathText text={question.prompt} /></p>
                    {question.diagram && <MaterialMechanicsDiagram className={styles.diagram} kind={question.diagram} title={`${question.genre}：解答用線図`} />}
                    <label className={styles.answerField}><span>解答・式・単位・途中計算</span><textarea rows={4} disabled={phase !== "active"} value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder={phase === "active" ? "式と単位を含めて入力（紙で解く場合は空欄で可）" : "中断中または採点済み"} /></label>
                  </article>
                ))}
              </section>
            ))}
            <footer className={styles.paperFooter}><span>TEST//GRID · RANGE-VERIFIED ONLY</span><strong>{exam.id.toUpperCase()}</strong><span>PAGE {pageIndex + 1} / {pages.length}</span></footer>
          </article>
        ))}
      </div>

      {phase === "active" && <div className={styles.finishBar}><div><span>REMAINING</span><strong>{formatTime(remainingSeconds)}</strong></div><button type="button" onClick={pauseExam}>中断して保存</button><button className={styles.primary} type="button" onClick={finishExam}>試験を終了して採点 →</button></div>}

      {phase === "result" && (
        <section className={styles.answerBook} aria-labelledby="material-mechanics-solutions-title">
          <header className={styles.resultHeader}><div><span>ANSWER · UNITS · STEPS · SOURCE</span><h2 id="material-mechanics-solutions-title">模範解答と途中式</h2><p>完全一致・数値・キーワードは仮採点済みです。同値な式、単位、有効数字、線図の部分点を各小問で調整してください。</p></div><strong>{convertedScore >= PASS_PERCENT ? "PASS" : "RETRY"}</strong></header>
          <div className={styles.answerSections}>
            {exam.sections.map((section) => (
              <section className={styles.answerSection} key={`solution-${exam.id}-${section.number}`}>
                <header><span>第{section.number}問</span><h3>{section.title}</h3><strong>{section.points}点</strong></header>
                {section.context && <p className={styles.sectionContext}><RichMathText text={section.context} /></p>}
                {section.questions.map((question) => {
                  const awarded = clampPoints(question, awardedPoints[question.id] ?? 0);
                  return (
                    <article className={styles.solutionCard} key={`solution-${question.id}`}>
                      <header className={styles.solutionHead}><span>（{question.sub}）{question.genre}</span><strong>{awarded}/{question.points}点</strong></header>
                      <h4><RichMathText text={question.prompt} /></h4>
                      <div className={styles.answerCompare}><div><span>あなたの解答</span><pre>{answers[question.id] || "未入力（紙の解答を確認）"}</pre></div><div><span>模範解答</span><p><RichMathText text={question.answer} /></p></div></div>
                      {question.diagram && <MaterialMechanicsDiagram className={styles.diagram} kind={question.diagram} solution title={`${question.genre}：模範線図`} />}
                      {question.formula && <div className={styles.formulaBox}><span>使う公式</span><DisplayMath tex={question.formula} /></div>}
                      <div className={styles.steps}><span>途中式・考え方</span><ol>{question.steps.map((step, index) => <li key={`${question.id}-step-${index}`}><RichMathText text={step} /></li>)}</ol><p><b>解説：</b><RichMathText text={question.explanation} /></p></div>
                      <p className={styles.sourcePages}><span>SOURCE</span>{sourceLabel(question)}</p>
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

export default function MaterialMechanicsExpectedExams() {
  const firstExam = EXAMS[0];
  if (!firstExam) return <section className={styles.selector}><h2>想定試験を準備中です</h2><p>範囲分析が確定すると、ここへ全範囲セットが追加されます。</p></section>;
  return <MaterialMechanicsExpectedExamLab firstExam={firstExam} />;
}
