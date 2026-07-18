"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  STATISTICS_TOPICS,
  type StatisticsQuestion,
} from "./statistics-data";
import { DisplayMath, RichMathText } from "./statistics-math";
import {
  EXAM_SECONDS,
  EXPECTED_EXAM_DEFINITIONS_BY_ID,
  EXPECTED_PAPERS_BY_ID,
  EXPECTED_SUBQUESTION_COUNT,
  PASS_SCORE,
  STATISTICS_EXPECTED_EXAMS,
  type ExpectedExamDefinition,
  type ExpectedExamPaper,
  type ExpectedExamQuestion,
} from "./statistics-expected-exams-data";
import styles from "./statistics-expected-exams.module.css";

export { STATISTICS_EXPECTED_EXAMS, STATISTICS_EXPECTED_EXAM_AUDIT } from "./statistics-expected-exams-data";

type ExamPhase = "catalog" | "active" | "result";

type SavedExpectedExam = {
  version: 2;
  examId: string;
  questionIds: string[];
  index: number;
  responses: Record<string, string>;
  remainingSeconds: number;
  savedAt: number;
};

const EXPECTED_EXAM_KEY = "test-grid:subject-7:expected-exam:v1";
function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[−–—]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/[「」『』（）()。、，,.!！?？・\s]/g, "")
    .trim();
}

function parseNumericResponse(value: string) {
  let normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[−–—]/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/^約/, "");

  const percent = normalized.includes("%");
  normalized = normalized.replace(/%/g, "");
  const pieces = normalized.split(/(?:=|≈|≒)/).filter(Boolean);
  normalized = pieces.at(-1) ?? normalized;
  normalized = normalized.replace(/(?:通り|個|人|点|回|本|枚|以上|以下)$/u, "");

  const fraction = normalized.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
  let parsed: number;
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    parsed = Number(fraction[1]) / denominator;
  } else if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) {
    parsed = Number(normalized);
  } else {
    return null;
  }

  if (!Number.isFinite(parsed)) return null;
  return percent ? parsed / 100 : parsed;
}

function isCorrectAnswer(question: ExpectedExamQuestion, response: string) {
  if (question.format === "number") {
    const parsed = parseNumericResponse(response);
    if (parsed === null || question.numericAnswer === undefined) return false;
    const tolerance = question.tolerance ?? Math.max(1e-9, Math.abs(question.numericAnswer) * 1e-9);
    return Math.abs(parsed - question.numericAnswer) <= tolerance;
  }

  const normalized = normalizeText(response);
  const references = [question.answer, ...(question.accepted ?? [])];
  if (references.some((answer) => normalizeText(answer) === normalized)) return true;
  if (question.format === "choice") return false;

  const keywords = question.keywords ?? [];
  if (!keywords.length) return false;
  const matched = keywords.filter((keyword) => normalized.includes(normalizeText(keyword))).length;
  return matched >= (question.minKeywords ?? keywords.length);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function restoreSavedExam(): SavedExpectedExam | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EXPECTED_EXAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedExpectedExam>;
    if (parsed.version !== 2 || typeof parsed.examId !== "string") return null;
    const paper = EXPECTED_PAPERS_BY_ID.get(parsed.examId);
    if (!paper || !Array.isArray(parsed.questionIds)) return null;
    const expectedIds = paper.questions.map((question) => question.id);
    if (parsed.questionIds.length !== expectedIds.length || parsed.questionIds.some((id, index) => id !== expectedIds[index])) return null;
    const knownIds = new Set(expectedIds);
    return {
      version: 2,
      examId: parsed.examId,
      questionIds: expectedIds,
      index: typeof parsed.index === "number" ? Math.max(0, Math.min(expectedIds.length - 1, Math.floor(parsed.index))) : 0,
      responses: parsed.responses && typeof parsed.responses === "object" && !Array.isArray(parsed.responses)
        ? Object.fromEntries(Object.entries(parsed.responses).filter((entry): entry is [string, string] => knownIds.has(entry[0]) && typeof entry[1] === "string"))
        : {},
      remainingSeconds: typeof parsed.remainingSeconds === "number"
        ? Math.max(0, Math.min(EXAM_SECONDS, Math.floor(parsed.remainingSeconds)))
        : EXAM_SECONDS,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function SigmaAwareFormula({ question }: { question: Pick<StatisticsQuestion, "formula" | "expandedFormula"> }) {
  if (!question.formula) return null;
  return (
    <>
      <div className="statistics-solution-formula">
        <span>{question.expandedFormula ? "Σを使う書き方" : "使う公式"}</span>
        <DisplayMath tex={question.formula} />
      </div>
      {question.expandedFormula && (
        <div className="statistics-solution-formula">
          <span>Σなしで書くと</span>
          <DisplayMath tex={question.expandedFormula} />
        </div>
      )}
    </>
  );
}

function ExamPaper({ paper }: { paper: ExpectedExamPaper }) {
  return (
    <article className={styles.paper}>
      <header className={styles.paperHeader}>
        <div><h2>確率統計　予想問題 第{paper.definition.number}回</h2><p>全範囲実戦問題用紙</p></div>
        <div className={styles.paperMeta}><span>試験時間</span><strong>50分</strong><span>満点</span><strong>100点</strong><span>合格</span><strong>60点</strong></div>
        <div className={styles.identityLine}><span>学籍番号：</span><span>氏名：</span></div>
      </header>
      <div className={styles.paperInstructions}>電卓のみ使用可。数値の丸め指定がない場合は、小数第4位までを目安に答えること。大問11題・小問{paper.questions.length}問。途中式も採点対象とする。</div>
      <div className={styles.paperColumns}>
        {paper.sections.map((section) => (
          <section className={styles.majorSection} key={section.number}>
            <h3 className={styles.majorHeading}><span>第{section.number}問　{section.title}</span><small>{section.questions.reduce((sum, question) => sum + question.points, 0)}点</small></h3>
            <p className={styles.sectionContext}><RichMathText text={section.context} /></p>
            {section.questions.map((question) => (
              <div className={styles.paperQuestion} key={question.id}>
                <div className={styles.paperQuestionHeader}><span>({question.sub})</span><span><RichMathText text={question.prompt} /></span><span>〔{question.points}点〕</span></div>
                <div className={`${styles.answerLine} ${question.format === "text" ? styles.isLong : ""}`} />
              </div>
            ))}
          </section>
        ))}
      </div>
      <footer className={styles.paperFooter}><span>確率統計・全範囲</span><span>第{paper.definition.number}回　問題用紙</span></footer>
    </article>
  );
}

function AnswerBooklet({ paper }: { paper: ExpectedExamPaper }) {
  return (
    <article className={styles.answerBooklet}>
      <header><h2>第{paper.definition.number}回　解答・途中式・解説</h2><p>問題用紙とは別ページです。各小問の配点合計：{paper.totalPoints}点</p></header>
      <div className={styles.answerColumns}>
        {paper.sections.map((section) => (
          <section className={styles.answerSection} key={section.number}>
            <h3 className={styles.answerHeading}><span>第{section.number}問　{section.title}</span><small>{section.questions.reduce((sum, question) => sum + question.points, 0)}点</small></h3>
            {section.questions.map((question) => (
              <div className={styles.answerItem} key={question.id}>
                <h4>({question.sub}) 正答：<RichMathText text={question.answer} />〔{question.points}点〕</h4>
                <SigmaAwareFormula question={question} />
                <ol>{question.steps.map((step, index) => <li key={`${question.id}-print-${index}`}><RichMathText text={step} /></li>)}</ol>
                <p><b>解説：</b><RichMathText text={question.explanation} /></p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

function PrintableBundle({ paper, includeAnswers }: { paper: ExpectedExamPaper; includeAnswers: boolean }) {
  return <div className={styles.printBundle}><ExamPaper paper={paper} />{includeAnswers && <AnswerBooklet paper={paper} />}</div>;
}

export default function StatisticsExpectedExams() {
  const [phase, setPhase] = useState<ExamPhase>("catalog");
  const [examId, setExamId] = useState(STATISTICS_EXPECTED_EXAMS[0].id);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_SECONDS);
  const [savedExam, setSavedExam] = useState<SavedExpectedExam | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [printExamId, setPrintExamId] = useState(STATISTICS_EXPECTED_EXAMS[0].id);
  const [printIncludeAnswers, setPrintIncludeAnswers] = useState(false);

  const paper = EXPECTED_PAPERS_BY_ID.get(examId) ?? EXPECTED_PAPERS_BY_ID.get(STATISTICS_EXPECTED_EXAMS[0].id)!;
  const definition = paper.definition;
  const questions = paper.questions;
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);
  const currentQuestion = questions[index];
  const printPaper = EXPECTED_PAPERS_BY_ID.get(printExamId) ?? paper;

  const resultRows = useMemo(() => questions.map((question) => {
    const response = responses[question.id] ?? "";
    return { question, response, correct: isCorrectAnswer(question, response), points: question.points };
  }), [questions, responses]);
  const score = resultRows.reduce((total, row) => total + (row.correct ? row.points : 0), 0);

  const topicResults = useMemo(() => STATISTICS_TOPICS.map((topic) => {
    const rows = resultRows.filter((row) => row.question.topic === topic.id);
    return {
      topic,
      earned: rows.reduce((sum, row) => sum + (row.correct ? row.points : 0), 0),
      possible: rows.reduce((sum, row) => sum + row.points, 0),
    };
  }).filter((row) => row.possible > 0), [resultRows]);

  /* Device-local exam state is restored after hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSavedExam(restoreSavedExam());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const finishExam = useCallback(() => {
    setPhase("result");
    try { window.localStorage.removeItem(EXPECTED_EXAM_KEY); } catch { /* Storage can be unavailable. */ }
    setSavedExam(null);
  }, []);

  useEffect(() => {
    if (phase !== "active" || remainingSeconds !== 0) return;
    const timeout = window.setTimeout(finishExam, 0);
    return () => window.clearTimeout(timeout);
  }, [finishExam, phase, remainingSeconds]);

  useEffect(() => {
    if (!hydrated || phase !== "active") return;
    const session: SavedExpectedExam = { version: 2, examId, questionIds, index, responses, remainingSeconds, savedAt: Date.now() };
    try {
      window.localStorage.setItem(EXPECTED_EXAM_KEY, JSON.stringify(session));
    } catch {
      // The exam remains usable when browser storage is blocked.
    }
  }, [examId, hydrated, index, phase, questionIds, remainingSeconds, responses]);

  function startExam(nextExam: ExpectedExamDefinition) {
    setExamId(nextExam.id);
    setPrintExamId(nextExam.id);
    setIndex(0);
    setResponses({});
    setRemainingSeconds(EXAM_SECONDS);
    setPhase("active");
  }

  function resumeExam() {
    if (!savedExam) return;
    setExamId(savedExam.examId);
    setPrintExamId(savedExam.examId);
    setIndex(savedExam.index);
    setResponses(savedExam.responses);
    setRemainingSeconds(savedExam.remainingSeconds);
    setPhase("active");
  }

  function deleteSavedExam() {
    try { window.localStorage.removeItem(EXPECTED_EXAM_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(null);
  }

  function updateResponse(value: string) {
    setResponses((current) => ({ ...current, [currentQuestion.id]: value }));
  }

  function makeCurrentSession(): SavedExpectedExam {
    return { version: 2, examId, questionIds, index, responses, remainingSeconds, savedAt: Date.now() };
  }

  function pauseExam() {
    const session = makeCurrentSession();
    try { window.localStorage.setItem(EXPECTED_EXAM_KEY, JSON.stringify(session)); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(session);
    setPhase("catalog");
  }

  function requestPrint(nextExam: ExpectedExamDefinition, includeAnswers: boolean) {
    setPrintExamId(nextExam.id);
    setPrintIncludeAnswers(includeAnswers);
    window.setTimeout(() => window.print(), 0);
  }

  const printPortal = hydrated
    ? createPortal(<PrintableBundle paper={printPaper} includeAnswers={printIncludeAnswers} />, document.body)
    : null;

  if (phase === "catalog") {
    return (
      <>
        <section className="english-guide-workspace statistics-expected-workspace" aria-labelledby="statistics-expected-title">
          <div className="english-panel-heading statistics-panel-heading">
            <div><span>12 FULL-RANGE EXAMS</span><h2 id="statistics-expected-title">想定試験</h2></div>
            <p>全12回とも同じ出題バランスの50分・100点満点です。大問11題・小問{EXPECTED_SUBQUESTION_COUNT}問で、全範囲を毎回まんべんなく確認します。</p>
          </div>

          {savedExam && (
            <div className="generic-test-answer english-test-feedback english-saved-test statistics-saved-test">
              <strong>途中の想定試験があります</strong>
              <p><span>試験</span>第{EXPECTED_EXAM_DEFINITIONS_BY_ID.get(savedExam.examId)?.number ?? "?"}回・小問{savedExam.index + 1} / {savedExam.questionIds.length}</p>
              <p><span>残り時間</span>{formatTime(savedExam.remainingSeconds)}（{new Date(savedExam.savedAt).toLocaleString("ja-JP")} 保存）</p>
              <div className="english-result-actions statistics-saved-actions"><button type="button" onClick={resumeExam}>続きから再開</button><button type="button" onClick={deleteSavedExam}>保存データを削除</button></div>
            </div>
          )}

          <div className="statistics-exam-rules">
            <div><span>TIME</span><strong>50:00</strong><small>自動保存・時間切れ採点</small></div>
            <div><span>SCORE</span><strong>100</strong><small>大問11題・小問{EXPECTED_SUBQUESTION_COUNT}問</small></div>
            <div><span>PASS</span><strong>60</strong><small>59点以下は赤点</small></div>
          </div>

          <div className="statistics-expected-grid">
            {STATISTICS_EXPECTED_EXAMS.map((exam) => (
              <article key={exam.id}>
                <span>予想 第{String(exam.number).padStart(2, "0")}回</span>
                <h3>{exam.title}</h3>
                <p>記述統計・相関回帰・場合の数と確率・確率変数・連続分布を毎回まとめて出題します。</p>
                <small>大問11題 ／ 小問{EXPECTED_SUBQUESTION_COUNT}問 ／ 50分 ／ 100点</small>
                <div className={styles.catalogActions}>
                  <button className={styles.secondaryButton} type="button" onClick={() => requestPrint(exam, false)}>A4問題用紙を印刷</button>
                  <button type="button" onClick={() => startExam(exam)}>ブラウザで開始 →</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        {printPortal}
      </>
    );
  }

  if (phase === "active" && currentQuestion) {
    const response = responses[currentQuestion.id] ?? "";
    return (
      <>
        <section className="generic-test-workspace english-test-workspace statistics-expected-active" aria-labelledby="statistics-expected-active-title">
          <div className="statistics-expected-exam-bar">
            <div><span>予想 第{String(definition.number).padStart(2, "0")}回</span><strong id="statistics-expected-active-title">{definition.title}</strong></div>
            <div className={remainingSeconds <= 300 ? "is-urgent" : ""}><span>残り時間</span><strong>{formatTime(remainingSeconds)}</strong></div>
          </div>

          <div className={styles.activeTools}>
            <span>A4二段組・問題用紙と解答冊子は別ページ</span>
            <button className={styles.secondaryButton} type="button" onClick={() => requestPrint(definition, false)}>問題用紙のみ印刷</button>
            <button type="button" onClick={() => requestPrint(definition, true)}>問題＋解答を印刷</button>
          </div>

          <details className={styles.paperPreview}>
            <summary className={styles.previewSummary}>A4問題用紙を画面で一覧表示</summary>
            <div className={styles.paperPreviewViewport}><ExamPaper paper={paper} /></div>
          </details>

          <div className="generic-deck-meta english-test-meta statistics-question-meta">
            <span>第{currentQuestion.major}問 ({currentQuestion.sub}) · 小問 {index + 1} / {questions.length}</span>
            <span>{currentQuestion.points}点 · {currentQuestion.genre} · 難度{currentQuestion.difficulty}</span>
          </div>
          <div className="statistics-exam-progress" aria-label={`解答済み ${Object.values(responses).filter((value) => value.trim()).length}問`}>
            {questions.map((question, questionIndex) => (
              <button type="button" key={question.id} className={(questionIndex === index ? "is-current " : "") + ((responses[question.id] ?? "").trim() ? "is-answered" : "")} onClick={() => setIndex(questionIndex)} aria-label={`第${question.major}問 (${question.sub})${(responses[question.id] ?? "").trim() ? " 解答済み" : " 未回答"}`}>{questionIndex + 1}</button>
            ))}
          </div>

          {currentQuestion.context && <div className="english-guide-tip statistics-question-context"><span>共通データ</span><p><RichMathText text={currentQuestion.context} /></p></div>}
          <div className="generic-test-question english-test-question statistics-test-question"><span>第{currentQuestion.major}問 ({currentQuestion.sub})</span><h2><RichMathText text={currentQuestion.prompt} /></h2></div>

          <div className="english-answer-form statistics-answer-form statistics-expected-answer">
            {currentQuestion.format === "text" ? (
              <label className="english-input-answer english-translation-answer statistics-text-answer"><span>証明・理由を入力</span><textarea rows={7} value={response} onChange={(event) => updateResponse(event.target.value)} /></label>
            ) : (
              <label className="english-input-answer statistics-number-answer"><span>数値を入力</span><input autoComplete="off" inputMode="decimal" value={response} onChange={(event) => updateResponse(event.target.value)} placeholder="小数・分数・%で入力できます" /></label>
            )}
          </div>

          <div className="statistics-expected-navigation">
            <button type="button" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>← 前の小問</button>
            <button type="button" onClick={pauseExam}>中断して保存</button>
            {index < questions.length - 1 ? <button type="button" onClick={() => setIndex((current) => current + 1)}>次の小問 →</button> : <button className="is-submit" type="button" onClick={finishExam}>提出して採点 →</button>}
          </div>
        </section>
        {printPortal}
      </>
    );
  }

  return (
    <>
      <section className="generic-test-workspace english-test-workspace statistics-expected-result" aria-labelledby="statistics-expected-result-title">
        <div className={`statistics-score-panel ${score >= PASS_SCORE ? "is-pass" : "is-fail"}`}>
          <span>{score >= PASS_SCORE ? "PASS" : "RED SCORE"}</span>
          <h2 id="statistics-expected-result-title">{score} <small>/ 100</small></h2>
          <strong>{score >= PASS_SCORE ? "合格です" : "赤点です（合格ライン60点）"}</strong>
          <p>予想 第{String(definition.number).padStart(2, "0")}回「{definition.title}」</p>
        </div>

        <div className={styles.activeTools}><span>問題用紙と模範解答を別ページで印刷できます</span><button type="button" onClick={() => requestPrint(definition, true)}>A4問題＋解答を印刷</button></div>

        <div className="statistics-topic-score-grid">
          {topicResults.map((row) => <div key={row.topic.id}><span>{row.topic.shortTitle}</span><strong>{row.earned} / {row.possible}</strong><progress value={row.earned} max={row.possible} /></div>)}
        </div>

        <div className="statistics-expected-solutions">
          <div className="english-panel-heading statistics-panel-heading"><div><span>MODEL ANSWERS</span><h2>解答・途中式・解説</h2></div><p>全{EXPECTED_SUBQUESTION_COUNT}小問の模範解答です。説明問題は要点のキーワードで自動採点します。</p></div>
          {resultRows.map((row) => (
            <article key={row.question.id} className={row.correct ? "is-correct" : "is-wrong"}>
              <header><span>{row.correct ? "○" : "×"} 第{row.question.major}問 ({row.question.sub})</span><strong>{row.points}点</strong></header>
              <h3><RichMathText text={row.question.prompt} /></h3>
              <p><b>あなたの解答：</b><RichMathText text={row.response || "未回答"} /></p>
              <p><b>正答：</b><RichMathText text={row.question.answer} /></p>
              <SigmaAwareFormula question={row.question} />
              <div className="statistics-solution-steps"><span>途中式</span><ol>{row.question.steps.map((step, stepIndex) => <li key={`${row.question.id}-${stepIndex}`}><RichMathText text={step} /></li>)}</ol></div>
              <p><b>解説：</b><RichMathText text={row.question.explanation} /></p>
            </article>
          ))}
        </div>

        <div className="english-result-actions statistics-result-actions"><button type="button" onClick={() => startExam(definition)}>同じ回をもう一度</button><button type="button" onClick={() => setPhase("catalog")}>別の想定試験を選ぶ</button></div>
      </section>
      {printPortal}
    </>
  );
}
