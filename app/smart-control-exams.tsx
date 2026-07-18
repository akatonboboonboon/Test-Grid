"use client";

import { useEffect, useMemo, useState } from "react";
import SmartControlDiagram from "./smart-control-diagrams";
import { SMART_CONTROL_EXAMS } from "./smart-control-data";
import { smartControlDiagramIdFor } from "./smart-control-figure-data";
import { DisplayMath, RichMathText } from "./statistics-math";
import styles from "./smart-control-exams.module.css";

type SavedExpectedExam = {
  version: 1;
  examId: string;
  responses: Record<string, string>;
  elapsedSeconds: number;
  savedAt: number;
};

const STORAGE_KEY = "test-grid:subject-6:expected-exam:v1";
const EXAM_IDS = new Set(SMART_CONTROL_EXAMS.map((exam) => exam.id));

function ExpectedExamDiagram({
  questionId,
  solution = false,
}: {
  questionId: string;
  solution?: boolean;
}) {
  const diagramId = smartControlDiagramIdFor({ id: questionId });
  return diagramId ? (
    <SmartControlDiagram
      className={styles.diagram}
      diagramId={diagramId}
      solution={solution}
      title={solution ? "模範図・注記" : "解答用の問題図"}
    />
  ) : null;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function restoreSavedExam(): SavedExpectedExam | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedExpectedExam>;
    if (parsed.version !== 1 || typeof parsed.examId !== "string" || !EXAM_IDS.has(parsed.examId)) return null;
    const responses = parsed.responses && typeof parsed.responses === "object" && !Array.isArray(parsed.responses)
      ? Object.fromEntries(Object.entries(parsed.responses).filter(([, value]) => typeof value === "string"))
      : {};
    return {
      version: 1,
      examId: parsed.examId,
      responses,
      elapsedSeconds: typeof parsed.elapsedSeconds === "number" ? Math.max(0, Math.floor(parsed.elapsedSeconds)) : 0,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export default function SmartControlExams() {
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSolutions, setShowSolutions] = useState(false);
  const [savedExam, setSavedExam] = useState<SavedExpectedExam | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSavedExam(restoreSavedExam());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeExam = useMemo(
    () => SMART_CONTROL_EXAMS.find((exam) => exam.id === activeExamId),
    [activeExamId],
  );

  useEffect(() => {
    if (!activeExam || showSolutions) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [activeExam, showSolutions]);

  useEffect(() => {
    if (!hydrated || !activeExam || showSolutions) return;
    const snapshot: SavedExpectedExam = {
      version: 1,
      examId: activeExam.id,
      responses,
      elapsedSeconds,
      savedAt: Date.now(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // A blocked localStorage must not prevent the exam from running.
    }
  }, [activeExam, elapsedSeconds, hydrated, responses, showSolutions]);

  function startExam(examId: string) {
    setActiveExamId(examId);
    setResponses({});
    setElapsedSeconds(0);
    setShowSolutions(false);
    window.setTimeout(() => document.getElementById("smart-expected-paper")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function resumeExam() {
    if (!savedExam) return;
    setActiveExamId(savedExam.examId);
    setResponses(savedExam.responses);
    setElapsedSeconds(savedExam.elapsedSeconds);
    setShowSolutions(false);
  }

  function pauseExam() {
    if (!activeExam) return;
    const snapshot: SavedExpectedExam = {
      version: 1,
      examId: activeExam.id,
      responses,
      elapsedSeconds,
      savedAt: Date.now(),
    };
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(snapshot);
    setActiveExamId(null);
    setShowSolutions(false);
  }

  function printPaper() {
    const cleanup = () => document.body.classList.remove("smart-control-printing");
    document.body.classList.add("smart-control-printing");
    window.addEventListener("afterprint", cleanup, { once: true });
    try {
      window.print();
    } catch {
      cleanup();
    }
  }

  function returnToSelector() {
    if (!showSolutions) {
      pauseExam();
      return;
    }
    setActiveExamId(null);
  }

  function deleteSavedExam() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(null);
    if (activeExamId) {
      setActiveExamId(null);
      setResponses({});
      setElapsedSeconds(0);
      setShowSolutions(false);
    }
  }

  function finishExam() {
    setShowSolutions(true);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(null);
  }

  if (!activeExam) {
    return (
      <section className={styles.selector} aria-labelledby="smart-expected-title">
        <div className="english-panel-heading statistics-panel-heading">
          <div><span>PREDICTED PAPERS</span><h2 id="smart-expected-title">A4想定試験</h2></div>
          <p>過去問1・2・3の紙面構成だけを参考に、現在の範囲5単元を毎回100点で組み直した6セットです。試験時間は資料に記載がないため固定していません。</p>
        </div>

        {savedExam && (
          <div className="generic-test-answer english-test-feedback english-saved-test statistics-saved-test">
            <strong>途中の想定試験があります</strong>
            <p><span>セット</span>{SMART_CONTROL_EXAMS.find((exam) => exam.id === savedExam.examId)?.title}</p>
            <p><span>経過</span>{formatTime(savedExam.elapsedSeconds)}・保存 {new Date(savedExam.savedAt).toLocaleString("ja-JP")}</p>
            <div className="english-result-actions statistics-saved-actions">
              <button type="button" onClick={resumeExam}>続きから再開</button>
              <button type="button" onClick={deleteSavedExam}>保存データを削除</button>
            </div>
          </div>
        )}

        <div className={styles.grid}>
          {SMART_CONTROL_EXAMS.map((exam, index) => {
            const total = exam.questions.reduce((sum, question) => sum + question.points, 0);
            return (
              <article key={exam.id}>
                <span>{String(index + 1).padStart(2, "0")} / 06</span>
                <h3>{exam.title}</h3>
                <p>{exam.subtitle}</p>
                <small>大問{exam.questions.length}・{total}点・範囲内で構成</small>
                <button type="button" onClick={() => startExam(exam.id)}>この問題用紙を始める →</button>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  const answeredCount = activeExam.questions.filter((question) => responses[question.id]?.trim()).length;

  return (
    <section className={styles.active} aria-labelledby="smart-active-exam-title">
      <div className={styles.toolbar}>
        <div><span>{activeExam.title}</span><strong>{formatTime(elapsedSeconds)}</strong><small>{answeredCount} / {activeExam.questions.length} 大問に入力</small></div>
        {!showSolutions && <button type="button" onClick={printPaper}>A4問題用紙を印刷</button>}
        {!showSolutions && <button type="button" onClick={pauseExam}>中断して保存</button>}
        <button type="button" onClick={returnToSelector}>セット一覧</button>
      </div>

      <div id="smart-expected-paper" className={styles.paper}>
        <header>
          <div><span>TEST//GRID · SMART CONTROL</span><strong>{activeExam.title}</strong></div>
          <p>氏名 ____________________</p>
        </header>
        <div className={styles.paperMeta}>
          <span>100点満点</span><span>大問4</span><span>持込条件・制限時間は担当教員の指示を確認</span>
        </div>
        <h1 id="smart-active-exam-title">{activeExam.subtitle}</h1>
        <p className={styles.instructions}>式変形・部分分数分解・極の計算は途中式を残すこと。安定性は極の位置を根拠に答えること。</p>

        <div className={styles.questions}>
          {activeExam.questions.map((question) => (
            <article key={question.id}>
              <header><strong>{question.section}</strong><span>{question.points}点</span></header>
              <p><RichMathText text={question.prompt} /></p>
              <ExpectedExamDiagram questionId={question.id} />
              {!showSolutions && (
                <label>
                  <span>解答・途中式</span>
                  <textarea
                    rows={6}
                    value={responses[question.id] ?? ""}
                    onChange={(event) => setResponses((current) => ({ ...current, [question.id]: event.target.value }))}
                    placeholder="ここに入力。紙で解く場合は空欄のままで構いません。"
                  />
                </label>
              )}
              {showSolutions && (
                <div className={styles.solution}>
                  <span>模範解答</span>
                  {question.formula && <DisplayMath tex={question.formula} />}
                  <ExpectedExamDiagram questionId={question.id} solution />
                  <p><RichMathText text={question.answer} /></p>
                  <ol>{question.steps.map((step, index) => <li key={`${question.id}-step-${index}`}><RichMathText text={step} /></li>)}</ol>
                  <details><summary>自分の解答を確認</summary><pre>{responses[question.id] || "未入力（紙の解答を確認）"}</pre></details>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className={styles.finishBar}>
        {!showSolutions
          ? <button type="button" onClick={finishExam}>解答を終了して模範解答を見る</button>
          : <><strong>模範解答を表示中</strong><button type="button" onClick={() => startExam(activeExam.id)}>同じセットを解き直す</button><button type="button" onClick={returnToSelector}>別のセットへ</button></>}
      </div>
    </section>
  );
}
