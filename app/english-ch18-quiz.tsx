"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ENGLISH_CH18_QUIZ_ITEMS,
  ENGLISH_CH18_QUIZ_SECTIONS,
  ENGLISH_CH18_QUIZ_STORAGE_KEY,
  ENGLISH_CH18_QUIZ_TOTAL_POINTS,
  type EnglishCh18QuizItem,
} from "./english-ch18-quiz-data";
import styles from "./english-ch18-quiz.module.css";

type AnswerMap = Record<string, string>;
type CorrectMap = Record<string, boolean>;

type StoredQuiz = {
  version: 1;
  answers: AnswerMap;
  graded: boolean;
  manualCorrect: CorrectMap;
  updatedAt: string;
};

function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[’‘]/g, "'")
    .replace(/[\s。、，,.!?！？「」『』（）()・/／―—–-]+/g, "")
    .trim();
}

function isJapaneseItem(item: EnglishCh18QuizItem) {
  return item.section === "q3a" || item.section === "q3b" || item.section === "q3c" || item.section === "q4";
}

export function isEnglishCh18QuizAnswerCorrect(item: EnglishCh18QuizItem, response: string) {
  const normalizedResponse = normalizeAnswer(response);
  if (!normalizedResponse) return false;

  return item.accepted.some((candidate) => {
    const normalizedCandidate = normalizeAnswer(candidate);
    if (normalizedResponse === normalizedCandidate) return true;
    return isJapaneseItem(item)
      && normalizedCandidate.length >= 3
      && normalizedResponse.includes(normalizedCandidate);
  });
}

function parseStoredQuiz(value: string | null): StoredQuiz | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredQuiz>;
    if (parsed.version !== 1 || typeof parsed.answers !== "object" || parsed.answers === null) return null;

    const validIds = new Set(ENGLISH_CH18_QUIZ_ITEMS.map((item) => item.id));
    const answers = Object.fromEntries(
      Object.entries(parsed.answers)
        .filter(([id, answer]) => validIds.has(id) && typeof answer === "string"),
    );
    const manualCorrect = typeof parsed.manualCorrect === "object" && parsed.manualCorrect !== null
      ? Object.fromEntries(
        Object.entries(parsed.manualCorrect)
          .filter(([id, correct]) => validIds.has(id) && correct === true),
      )
      : {};

    return {
      version: 1,
      answers,
      graded: parsed.graded === true,
      manualCorrect,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "保存済み";
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EnglishCh18Quiz() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [graded, setGraded] = useState(false);
  const [manualCorrect, setManualCorrect] = useState<CorrectMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [saveMessage, setSaveMessage] = useState("この端末に自動保存します");
  const [resetArmed, setResetArmed] = useState(false);

  /* Restore device-local work only after hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const restored = parseStoredQuiz(window.localStorage.getItem(ENGLISH_CH18_QUIZ_STORAGE_KEY));
    if (restored) {
      setAnswers(restored.answers);
      setGraded(restored.graded);
      setManualCorrect(restored.manualCorrect);
      setSaveMessage(`前回の続きから復元しました（${formatSavedAt(restored.updatedAt)}）`);
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      const updatedAt = new Date().toISOString();
      const snapshot: StoredQuiz = { version: 1, answers, graded, manualCorrect, updatedAt };
      window.localStorage.setItem(ENGLISH_CH18_QUIZ_STORAGE_KEY, JSON.stringify(snapshot));
      setSaveMessage(`自動保存済み（${formatSavedAt(updatedAt)}）`);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [answers, graded, hydrated, manualCorrect]);

  useEffect(() => {
    if (!resetArmed) return;
    const timer = window.setTimeout(() => setResetArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [resetArmed]);

  const verdicts = useMemo(() => Object.fromEntries(
    ENGLISH_CH18_QUIZ_ITEMS.map((item) => [
      item.id,
      isEnglishCh18QuizAnswerCorrect(item, answers[item.id] ?? "") || manualCorrect[item.id] === true,
    ]),
  ), [answers, manualCorrect]);

  const answeredCount = ENGLISH_CH18_QUIZ_ITEMS.filter((item) => answers[item.id]?.trim()).length;
  const score = graded
    ? ENGLISH_CH18_QUIZ_ITEMS.filter((item) => verdicts[item.id]).length
    : 0;
  const percentage = Math.round((score / ENGLISH_CH18_QUIZ_TOTAL_POINTS) * 100);

  function updateAnswer(itemId: string, value: string) {
    setAnswers((current) => ({ ...current, [itemId]: value }));
    setManualCorrect((current) => {
      if (!current[itemId]) return current;
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }

  function gradeQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGraded(true);
    setSaveMessage("採点結果を保存しています…");
    window.setTimeout(() => {
      const firstWrong = ENGLISH_CH18_QUIZ_ITEMS.find((item) => !(
        isEnglishCh18QuizAnswerCorrect(item, answers[item.id] ?? "") || manualCorrect[item.id]
      ));
      document.getElementById(firstWrong ? `quiz18-${firstWrong.id}` : "quiz18-score")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  function toggleManualCorrect(itemId: string) {
    setManualCorrect((current) => ({ ...current, [itemId]: !current[itemId] }));
  }

  function saveNow() {
    const updatedAt = new Date().toISOString();
    const snapshot: StoredQuiz = { version: 1, answers, graded, manualCorrect, updatedAt };
    window.localStorage.setItem(ENGLISH_CH18_QUIZ_STORAGE_KEY, JSON.stringify(snapshot));
    setSaveMessage(`途中保存しました（${formatSavedAt(updatedAt)}）`);
  }

  function restoreSaved() {
    const restored = parseStoredQuiz(window.localStorage.getItem(ENGLISH_CH18_QUIZ_STORAGE_KEY));
    if (!restored) {
      setSaveMessage("復元できる保存データがありません");
      return;
    }
    setAnswers(restored.answers);
    setGraded(restored.graded);
    setManualCorrect(restored.manualCorrect);
    setSaveMessage(`保存内容を復元しました（${formatSavedAt(restored.updatedAt)}）`);
  }

  function resetQuiz() {
    if (!resetArmed) {
      setResetArmed(true);
      setSaveMessage("リセットする場合は、もう一度ボタンを押してください");
      return;
    }
    setAnswers({});
    setGraded(false);
    setManualCorrect({});
    setResetArmed(false);
    window.localStorage.removeItem(ENGLISH_CH18_QUIZ_STORAGE_KEY);
    setSaveMessage("解答と採点結果をリセットしました");
  }

  return (
    <section className={styles.quiz} aria-labelledby="english-ch18-quiz-title">
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>ACTUAL QUIZ / CHAPTER 18</span>
          <h2 id="english-ch18-quiz-title">第18回 小テスト再現</h2>
          <p>実物どおりの5大問・18採点単位。語彙、前置詞、本文和訳、意味、語句整序を1点ずつ採点します。</p>
        </div>
        <div className={styles.scoreCard} id="quiz18-score" aria-live="polite">
          <span>{graded ? "SCORE" : "FULL SCORE"}</span>
          <strong>{graded ? score : 18}<small> / 18</small></strong>
          <p>{graded ? `${percentage}%・${score === 18 ? "全問正解" : `あと${18 - score}点`}` : "5大問・18点満点"}</p>
        </div>
      </header>

      <div className={styles.statusBar}>
        <div>
          <span>PROGRESS</span>
          <strong>{answeredCount} / {ENGLISH_CH18_QUIZ_TOTAL_POINTS} 解答</strong>
        </div>
        <progress value={answeredCount} max={ENGLISH_CH18_QUIZ_TOTAL_POINTS} aria-label={`解答済み ${answeredCount}/${ENGLISH_CH18_QUIZ_TOTAL_POINTS}`} />
        <p aria-live="polite">{saveMessage}</p>
        <div className={styles.saveActions}>
          <button type="button" onClick={saveNow}>途中保存</button>
          <button type="button" onClick={restoreSaved}>保存内容を復元</button>
          <button className={resetArmed ? styles.danger : ""} type="button" onClick={resetQuiz}>
            {resetArmed ? "本当にリセット" : "リセット"}
          </button>
        </div>
      </div>

      <form className={styles.paper} onSubmit={gradeQuiz}>
        <div className={styles.paperHeading}>
          <div><span>Getting To Know Engineering Genres</span><strong>Chapter 18 test</strong></div>
          <p>各空欄1点・合計18点</p>
        </div>

        {ENGLISH_CH18_QUIZ_SECTIONS.map((section) => {
          const items = ENGLISH_CH18_QUIZ_ITEMS.filter((item) => item.section === section.id);
          return (
            <section className={styles.questionSection} key={section.id} aria-labelledby={`quiz18-section-${section.id}`}>
              <header className={styles.questionHeading}>
                <span>問{section.questionNumber}{section.subNumber ? `（${section.subNumber}）` : ""}</span>
                <div>
                  <h3 id={`quiz18-section-${section.id}`}>{section.title}</h3>
                  <p>{section.instruction}</p>
                </div>
                <strong>{items.length}点</strong>
              </header>

              {section.source && (
                <div className={styles.sourceBlock}>
                  <span>{section.questionNumber === 5 ? "JAPANESE + WORD BANK" : "SOURCE"}</span>
                  <p lang={section.questionNumber === 5 ? undefined : "en"}>{section.source}</p>
                  {section.translationFrame && <p className={styles.translationFrame}>{section.translationFrame}</p>}
                </div>
              )}

              <div className={styles.itemList}>
                {items.map((item, itemIndex) => {
                  const correct = verdicts[item.id];
                  const manuallyAccepted = manualCorrect[item.id] === true;
                  return (
                    <article
                      className={`${styles.item}${graded ? correct ? ` ${styles.correct}` : ` ${styles.wrong}` : ""}`}
                      id={`quiz18-${item.id}`}
                      key={item.id}
                    >
                      <label htmlFor={`quiz18-answer-${item.id}`}>
                        <span className={styles.itemNumber}>{String(itemIndex + 1).padStart(2, "0")}</span>
                        <span className={styles.prompt}>{item.prompt}</span>
                      </label>
                      <div className={styles.answerRow}>
                        <input
                          id={`quiz18-answer-${item.id}`}
                          lang={isJapaneseItem(item) ? "ja" : "en"}
                          autoComplete="off"
                          spellCheck={false}
                          value={answers[item.id] ?? ""}
                          onChange={(event) => updateAnswer(item.id, event.target.value)}
                          placeholder={isJapaneseItem(item) ? "日本語で入力" : "英語で入力"}
                          aria-describedby={graded ? `quiz18-result-${item.id}` : undefined}
                        />
                        {graded && (
                          <span className={correct ? styles.resultCorrect : styles.resultWrong} id={`quiz18-result-${item.id}`}>
                            {correct ? manuallyAccepted ? "手動○" : "○ 1点" : "× 0点"}
                          </span>
                        )}
                      </div>

                      {graded && (
                        <div className={styles.feedback}>
                          <div className={styles.modelAnswer}>
                            <span>MODEL ANSWER</span>
                            <strong>{item.answer}</strong>
                            <small>{item.reference}</small>
                          </div>
                          <p>{item.explanation}</p>
                          {!isEnglishCh18QuizAnswerCorrect(item, answers[item.id] ?? "") && (
                            <button type="button" onClick={() => toggleManualCorrect(item.id)}>
                              {manuallyAccepted ? "手動正解を取り消す" : "意味は合っていた → 正解にする"}
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <footer className={styles.submitBar}>
          <div>
            <span>{answeredCount} / 18 ANSWERED</span>
            <p>空欄を残したままでも採点できます。日本語は登録済みの自然な言い換えも自動判定します。</p>
          </div>
          <button type="submit">{graded ? "もう一度採点する" : "18点満点で採点する"} →</button>
        </footer>
      </form>
    </section>
  );
}
