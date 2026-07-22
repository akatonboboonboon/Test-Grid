"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ENGLISH_EXPECTED_EXAMS,
  ENGLISH_EXPECTED_EXAM_SECTIONS,
  ENGLISH_EXPECTED_EXAM_STORAGE_KEY,
  type EnglishExpectedExam,
  type EnglishExpectedQuestion,
  type EnglishExpectedSectionId,
} from "./english-expected-exams-data";
import EnglishWeatherFigure from "./english-weather-figure";
import styles from "./english-expected-exams.module.css";

type ExamPhase = "setup" | "active" | "paused" | "result";
type AnswerMap = Record<string, string>;
type CorrectMap = Record<string, boolean>;

type StoredExpectedExam = {
  version: 1;
  examId: string;
  phase: "paused" | "result";
  answers: AnswerMap;
  manualCorrect: CorrectMap;
  remainingSeconds: number;
  updatedAt: string;
};

const FULL_DURATION_SECONDS = 50 * 60;

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[’‘]/g, "'")
    .replace(/[\s。、，,.!?！？「」『』（）()・/／―—–-]+/g, "")
    .trim();
}

function bigrams(value: string) {
  const normalized = normalize(value);
  if (normalized.length < 2) return new Set([normalized]);
  return new Set(Array.from({ length: normalized.length - 1 }, (_, index) => normalized.slice(index, index + 2)));
}

function semanticSimilarity(response: string, candidate: string) {
  const left = bigrams(response);
  const right = bigrams(candidate);
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  left.forEach((token) => { if (right.has(token)) overlap += 1; });
  return overlap / Math.min(left.size, right.size);
}

export function isEnglishExpectedAnswerCorrect(question: EnglishExpectedQuestion, response: string) {
  const normalizedResponse = normalize(response);
  if (!normalizedResponse) return false;
  const candidates = Array.from(new Set([question.answer, ...(question.accepted ?? [])]));
  if (candidates.some((candidate) => normalize(candidate) === normalizedResponse)) return true;

  if (question.semantic) {
    return candidates.some((candidate) => {
      const normalizedCandidate = normalize(candidate);
      if (normalizedCandidate.length >= 3 && normalizedResponse.includes(normalizedCandidate)) return true;
      return normalizedResponse.length >= 8
        && normalizedCandidate.length >= 8
        && semanticSimilarity(response, candidate) >= 0.68;
    });
  }
  return false;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "保存済み";
  return date.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function parseSnapshot(value: string | null): StoredExpectedExam | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredExpectedExam>;
    const exam = ENGLISH_EXPECTED_EXAMS.find((candidate) => candidate.id === parsed.examId);
    if (parsed.version !== 1 || !exam || typeof parsed.answers !== "object" || parsed.answers === null) return null;
    const validIds = new Set(exam.questions.map((question) => question.id));
    const answers = Object.fromEntries(Object.entries(parsed.answers).filter(([id, answer]) => validIds.has(id) && typeof answer === "string"));
    const manualCorrect = typeof parsed.manualCorrect === "object" && parsed.manualCorrect !== null
      ? Object.fromEntries(Object.entries(parsed.manualCorrect).filter(([id, correct]) => validIds.has(id) && correct === true))
      : {};
    return {
      version: 1,
      examId: exam.id,
      phase: parsed.phase === "result" ? "result" : "paused",
      answers,
      manualCorrect,
      remainingSeconds: typeof parsed.remainingSeconds === "number"
        ? Math.max(0, Math.min(FULL_DURATION_SECONDS, Math.floor(parsed.remainingSeconds)))
        : FULL_DURATION_SECONDS,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function shuffledTokens(question: EnglishExpectedQuestion) {
  const tokens = [...(question.tokens ?? [])];
  for (let index = tokens.length - 1; index > 0; index -= 1) {
    const swap = hash(`${question.id}-${index}`) % (index + 1);
    [tokens[index], tokens[swap]] = [tokens[swap], tokens[index]];
  }
  if (tokens.every((token, index) => token === question.tokens?.[index]) && tokens.length > 1) {
    tokens.push(tokens.shift() as string);
  }
  return tokens;
}

const UNIT_SHORT_LABELS: Record<EnglishExpectedQuestion["unit"], string> = {
  ch14: "Ch.14",
  ch15: "Ch.15",
  ch16: "Ch.16",
  ch18: "Ch.18",
  toeic: "TOEIC",
  housing: "Housing",
  medical: "Medical",
};

function unitShort(unit: EnglishExpectedQuestion["unit"]) {
  return UNIT_SHORT_LABELS[unit];
}

function sectionPoints(exam: EnglishExpectedExam, section: EnglishExpectedSectionId) {
  return exam.questions.filter((question) => question.section === section).reduce((sum, question) => sum + question.points, 0);
}

function isWeatherHomepageQuestion(question: EnglishExpectedQuestion) {
  return question.sourceId.startsWith("ch16-homepage-");
}

export default function EnglishExpectedExams() {
  const [selectedExamId, setSelectedExamId] = useState(ENGLISH_EXPECTED_EXAMS[0].id);
  const [phase, setPhase] = useState<ExamPhase>("setup");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [manualCorrect, setManualCorrect] = useState<CorrectMap>({});
  const [remainingSeconds, setRemainingSeconds] = useState(FULL_DURATION_SECONDS);
  const [hydrated, setHydrated] = useState(false);
  const [saveMessage, setSaveMessage] = useState("開始後はこの端末へ自動保存します");
  const [printAnswers, setPrintAnswers] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);

  const exam = ENGLISH_EXPECTED_EXAMS.find((candidate) => candidate.id === selectedExamId) ?? ENGLISH_EXPECTED_EXAMS[0];
  const includesWeatherHomepage = exam.questions.some(isWeatherHomepageQuestion);

  /* Restore a saved session as paused so the timer never starts without the learner. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const restored = parseSnapshot(window.localStorage.getItem(ENGLISH_EXPECTED_EXAM_STORAGE_KEY));
    if (restored) {
      setSelectedExamId(restored.examId);
      setAnswers(restored.answers);
      setManualCorrect(restored.manualCorrect);
      setRemainingSeconds(restored.remainingSeconds);
      setPhase(restored.phase);
      setSaveMessage(`前回の模試を復元しました（${formatSavedAt(restored.updatedAt)}）`);
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setPhase("result");
          setSaveMessage("50分経過したため自動採点しました");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (!hydrated || phase === "setup") return;
    if (phase === "active" && remainingSeconds % 5 !== 0) return;
    const timer = window.setTimeout(() => {
      const updatedAt = new Date().toISOString();
      const snapshot: StoredExpectedExam = {
        version: 1,
        examId: exam.id,
        phase: phase === "result" ? "result" : "paused",
        answers,
        manualCorrect,
        remainingSeconds,
        updatedAt,
      };
      window.localStorage.setItem(ENGLISH_EXPECTED_EXAM_STORAGE_KEY, JSON.stringify(snapshot));
      setSaveMessage(`自動保存済み（${formatSavedAt(updatedAt)}）`);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [answers, exam.id, hydrated, manualCorrect, phase, remainingSeconds]);

  useEffect(() => {
    if (!resetArmed) return;
    const timer = window.setTimeout(() => setResetArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [resetArmed]);

  useEffect(() => () => document.body.classList.remove("english-expected-print"), []);

  const verdicts = useMemo(() => Object.fromEntries(exam.questions.map((question) => [
    question.id,
    isEnglishExpectedAnswerCorrect(question, answers[question.id] ?? "") || manualCorrect[question.id] === true,
  ])), [answers, exam.questions, manualCorrect]);
  const answeredCount = exam.questions.filter((question) => answers[question.id]?.trim()).length;
  const score = phase === "result"
    ? exam.questions.reduce((sum, question) => sum + (verdicts[question.id] ? question.points : 0), 0)
    : 0;

  function writeSnapshot(nextPhase: "paused" | "result" = phase === "result" ? "result" : "paused") {
    const updatedAt = new Date().toISOString();
    const snapshot: StoredExpectedExam = {
      version: 1,
      examId: exam.id,
      phase: nextPhase,
      answers,
      manualCorrect,
      remainingSeconds,
      updatedAt,
    };
    window.localStorage.setItem(ENGLISH_EXPECTED_EXAM_STORAGE_KEY, JSON.stringify(snapshot));
    setSaveMessage(`途中保存しました（${formatSavedAt(updatedAt)}）`);
  }

  function startExam() {
    setAnswers({});
    setManualCorrect({});
    setRemainingSeconds(FULL_DURATION_SECONDS);
    setPhase("active");
    setSaveMessage(`${exam.title}を開始しました`);
    window.setTimeout(() => document.getElementById(`${exam.id}-paper-1`)?.scrollIntoView({ behavior: "smooth" }), 80);
  }

  function pauseExam() {
    setPhase("paused");
    writeSnapshot("paused");
  }

  function resumeExam() {
    setPhase("active");
    setSaveMessage(`${formatTime(remainingSeconds)}から再開しました`);
  }

  function finishExam() {
    setPhase("result");
    setSaveMessage("採点結果を保存しています…");
    window.setTimeout(() => document.getElementById("english-expected-result")?.scrollIntoView({ behavior: "smooth" }), 80);
  }

  function resetSession() {
    if (!resetArmed) {
      setResetArmed(true);
      setSaveMessage("保存中の模試を削除する場合は、もう一度押してください");
      return;
    }
    window.localStorage.removeItem(ENGLISH_EXPECTED_EXAM_STORAGE_KEY);
    setAnswers({});
    setManualCorrect({});
    setRemainingSeconds(FULL_DURATION_SECONDS);
    setPhase("setup");
    setResetArmed(false);
    setSaveMessage("保存データを削除しました");
  }

  function updateAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setManualCorrect((current) => {
      if (!current[questionId]) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  function toggleManual(questionId: string) {
    setManualCorrect((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  function printExam(includeAnswers: boolean) {
    setPrintAnswers(includeAnswers);
    document.body.classList.add("english-expected-print");
    const cleanup = () => {
      document.body.classList.remove("english-expected-print");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.setTimeout(() => window.print(), 80);
  }

  return (
    <section className={`${styles.lab} ${printAnswers ? styles.printAnswers : styles.printQuestions}`} aria-labelledby="english-expected-title">
      <header className={styles.hero}>
        <div>
          <span>EXPECTED EXAM SERIES / 6 SETS</span>
          <h2 id="english-expected-title">英語 予想模試</h2>
          <p>Chapter 14・15・16・18、TOEIC Reading、Housing・Medical語彙の追加範囲で構成。各セット50分・100点です。</p>
        </div>
        <div className={styles.heroMetrics}>
          <div><span>TIME</span><strong>50</strong><small>MIN</small></div>
          <div><span>FULL</span><strong>100</strong><small>PTS</small></div>
          <div><span>SETS</span><strong>06</strong><small>A4</small></div>
        </div>
      </header>

      <div className={styles.controlPanel}>
        <div className={styles.examPicker} role="group" aria-label="予想模試を選択">
          {ENGLISH_EXPECTED_EXAMS.map((candidate) => (
            <button
              type="button"
              key={candidate.id}
              className={candidate.id === exam.id ? styles.selected : ""}
              disabled={phase === "active" || phase === "paused"}
              onClick={() => {
                setSelectedExamId(candidate.id);
                setAnswers({});
                setManualCorrect({});
                setRemainingSeconds(FULL_DURATION_SECONDS);
                setPhase("setup");
              }}
            >
              <span>SET</span>{String(candidate.number).padStart(2, "0")}
            </button>
          ))}
        </div>

        <div className={styles.sessionCard}>
          <div>
            <span>{phase === "result" ? "RESULT" : phase === "active" ? "RUNNING" : phase === "paused" ? "SAVED SESSION" : "SELECTED"}</span>
            <h3>{exam.title}</h3>
            <p>{exam.subtitle}</p>
          </div>
          <div className={`${styles.timer} ${remainingSeconds <= 300 ? styles.timerDanger : ""}`} aria-live="polite">
            <span>{phase === "result" ? "SCORE" : "REMAIN"}</span>
            <strong>{phase === "result" ? `${score}/100` : formatTime(remainingSeconds)}</strong>
            <small>{answeredCount}/{exam.questions.length} 解答</small>
          </div>
          <div className={styles.sessionActions}>
            {phase === "setup" && <button className={styles.primary} type="button" onClick={startExam}>このセットを開始</button>}
            {phase === "active" && <><button type="button" onClick={pauseExam}>中断して保存</button><button className={styles.primary} type="button" onClick={finishExam}>提出・採点</button></>}
            {phase === "paused" && <button className={styles.primary} type="button" onClick={resumeExam}>続きから再開</button>}
            {phase === "result" && <button className={styles.primary} type="button" onClick={startExam}>同じセットをもう一度</button>}
            <button type="button" onClick={() => printExam(false)}>問題用紙を印刷</button>
            {phase === "result" && <button type="button" onClick={() => printExam(true)}>解答解説も印刷</button>}
            {phase !== "active" && <button className={resetArmed ? styles.danger : ""} type="button" onClick={resetSession}>{resetArmed ? "本当に削除" : "保存を削除"}</button>}
          </div>
          <p className={styles.saveMessage} aria-live="polite">{saveMessage}</p>
        </div>
      </div>

      {phase === "paused" && (
        <div className={styles.pauseBanner} role="status">
          <span>PAUSED</span><strong>{formatTime(remainingSeconds)}を保持しています。</strong><button type="button" onClick={resumeExam}>再開する →</button>
        </div>
      )}

      <div className={styles.paperStack} aria-label={`${exam.title} 問題用紙`}>
        {[1, 2, 3].map((pageNumber) => {
          const sections = ENGLISH_EXPECTED_EXAM_SECTIONS.filter((section) => section.page === pageNumber);
          return (
            <article className={styles.paperPage} id={`${exam.id}-paper-${pageNumber}`} key={`${exam.id}-page-${pageNumber}`}>
              <header className={styles.paperHeader}>
                <div><span>2026 / EXPECTED</span><h3>{exam.title}</h3><p>ADDITIONAL RANGE</p></div>
                <div><span>制限時間</span><strong>50分</strong></div>
                <div><span>満点</span><strong>100点</strong></div>
                <label><span>氏名</span><input type="text" aria-label={`氏名・${pageNumber}ページ`} /></label>
              </header>

              {sections.map((section) => {
                const questions = exam.questions.filter((question) => question.section === section.id);
                return (
                  <section className={styles.examSection} key={`${exam.id}-${section.id}`}>
                    <header>
                      <span>{section.number}</span>
                      <div><h4>{section.title}</h4><p>{section.instruction}</p></div>
                      <strong>{sectionPoints(exam, section.id)}点</strong>
                    </header>
                    {questions.some(isWeatherHomepageQuestion) && (
                      <div className={styles.weatherFigurePaper} aria-label="Chapter 16 Weather homepage 資料図">
                        <span>CHAPTER 16 · SOURCE FIGURE</span>
                        <EnglishWeatherFigure />
                      </div>
                    )}
                    <div className={styles.questionList}>
                      {questions.map((question, questionIndex) => {
                        const globalIndex = exam.questions.findIndex((candidate) => candidate.id === question.id);
                        const value = answers[question.id] ?? "";
                        const enabled = phase === "active";
                        return (
                          <div className={`${styles.question}${phase === "result" ? verdicts[question.id] ? ` ${styles.correct}` : ` ${styles.wrong}` : ""}`} key={question.id}>
                            {question.reference.quote && ["summary-abstract", "order", "true-false", "reading"].includes(question.section) && (
                              <aside className={styles.sourceExcerpt}>
                                <span>SOURCE TEXT</span>
                                <strong>{question.reference.label}</strong>
                                <blockquote lang="en">{question.reference.quote}</blockquote>
                              </aside>
                            )}
                            <div className={styles.questionPrompt}>
                              <span>{questionIndex + 1}</span>
                              <div><small>{unitShort(question.unit)}・{question.points}点</small><p>{question.prompt}</p></div>
                            </div>
                            {question.format === "choice" ? (
                              <fieldset className={styles.choiceGrid} disabled={!enabled}>
                                <legend className={styles.srOnly}>{question.prompt}</legend>
                                {question.options?.map((option, optionIndex) => (
                                  <label key={`${question.id}-${option}`}>
                                    <input type="radio" name={question.id} value={option} checked={value === option} onChange={(event) => updateAnswer(question.id, event.target.value)} />
                                    <span><b>{String.fromCharCode(65 + optionIndex)}</b>{option}</span>
                                  </label>
                                ))}
                              </fieldset>
                            ) : (
                              <div className={styles.writtenAnswer}>
                                {question.format === "order" && (
                                  <div className={styles.wordBank} aria-label="語群">{shuffledTokens(question).map((token, tokenIndex) => <span key={`${question.id}-token-${tokenIndex}`}>{token}</span>)}</div>
                                )}
                                {question.format === "translation" ? (
                                  <textarea rows={3} disabled={!enabled} value={value} onChange={(event) => updateAnswer(question.id, event.target.value)} placeholder="日本語訳を書く" aria-label={`設問${globalIndex + 1}の解答`} />
                                ) : (
                                  <input type="text" lang={question.semantic ? "ja" : "en"} autoComplete="off" spellCheck={false} disabled={!enabled} value={value} onChange={(event) => updateAnswer(question.id, event.target.value)} placeholder={phase === "setup" ? "開始後に入力できます" : "解答を書く"} aria-label={`設問${globalIndex + 1}の解答`} />
                                )}
                              </div>
                            )}
                            {phase === "result" && <span className={verdicts[question.id] ? styles.pointCorrect : styles.pointWrong}>{verdicts[question.id] ? `○ ${question.points}` : "× 0"}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <footer className={styles.paperFooter}><span>TEST//GRID · ENGLISH EXPECTED</span><strong>PAGE {pageNumber} / 3</strong><span>{exam.id.toUpperCase()}</span></footer>
            </article>
          );
        })}
      </div>

      {phase === "active" && (
        <div className={styles.stickySubmit}>
          <div><span>AUTO SAVE</span><strong>{formatTime(remainingSeconds)}</strong><small>{answeredCount}/{exam.questions.length} 解答済み</small></div>
          <button type="button" onClick={pauseExam}>中断して保存</button>
          <button className={styles.primary} type="button" onClick={finishExam}>提出して100点満点で採点 →</button>
        </div>
      )}

      {phase === "result" && (
        <section className={styles.answerBook} id="english-expected-result" aria-labelledby="english-expected-result-title">
          <header className={styles.resultHeader}>
            <div><span>ANSWER &amp; EXPLANATION</span><h3 id="english-expected-result-title">採点結果・解答解説</h3><p>本文の段落・原文・和訳まで戻って誤答原因を確認します。</p></div>
            <div className={score >= 60 ? styles.pass : styles.fail}><span>SCORE</span><strong>{score}<small>/100</small></strong><p>{score >= 60 ? "60点以上" : `60点まであと${60 - score}点`}</p></div>
          </header>
          {includesWeatherHomepage && (
            <div className={styles.weatherFigureReview} aria-label="Chapter 16 Weather homepage 解答資料図">
              <span>CHAPTER 16 · ANSWER REFERENCE</span>
              <EnglishWeatherFigure />
            </div>
          )}
          <div className={styles.answerList}>
            {exam.questions.map((question, index) => {
              const automaticallyCorrect = isEnglishExpectedAnswerCorrect(question, answers[question.id] ?? "");
              const correct = verdicts[question.id];
              return (
                <article className={correct ? styles.answerCorrect : styles.answerWrong} key={`answer-${question.id}`}>
                  <header><span>{correct ? "○" : "×"} Q{index + 1}</span><strong>{unitShort(question.unit)}・{question.genre}</strong><b>{correct ? question.points : 0}/{question.points}</b></header>
                  <h4>{question.prompt}</h4>
                  <div className={styles.answerCompare}><p><span>あなた</span>{answers[question.id] || "未回答"}</p><p><span>模範解答</span>{question.answer}</p></div>
                  <section className={styles.explanation}><span>WHY THIS ANSWER</span><p>{question.explanation}</p></section>
                  <section className={styles.evidence}><span>TEXT EVIDENCE</span><strong>{question.reference.label}</strong>{question.reference.quote && <blockquote lang="en">{question.reference.quote}</blockquote>}{question.reference.translation && <p>{question.reference.translation}</p>}</section>
                  {!automaticallyCorrect && <button type="button" onClick={() => toggleManual(question.id)}>{manualCorrect[question.id] ? "手動正解を取り消す" : question.semantic ? "訳のニュアンスは合っている → 正解" : "この解答を正解として扱う"}</button>}
                </article>
              );
            })}
          </div>
          <div className={styles.resultActions}><button type="button" onClick={() => printExam(true)}>解答・解説を印刷</button><button className={styles.primary} type="button" onClick={startExam}>同じセットを再挑戦</button></div>
        </section>
      )}
    </section>
  );
}
