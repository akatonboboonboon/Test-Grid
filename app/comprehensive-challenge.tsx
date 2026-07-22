"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { RichMathText } from "./statistics-math";
import RapidAnswerText from "./rapid-answer-text";
import RapidQuestionVisual from "./rapid-question-visual";
import {
  OVERALL_PAUSE_STORAGE_KEY,
  createOverallPauseSnapshot,
  restoreOverallPauseSnapshot,
} from "./rapid-saved-session";
import {
  COMPREHENSIVE_MAX_QUESTIONS,
  RAPID_SUBJECT_IDS,
  RAPID_SUBJECTS,
  createBalancedRapidSession,
  getComprehensiveRapidPool,
  isRapidAnswerCorrect,
  normalizeOverallQuestionCount,
  type RapidQuestion,
  type RapidQuestionInstance,
  type RapidSubjectMeta,
} from "./rapid-quiz-data";
import { type StudySubject, type SubjectId } from "./study-data";

type OverallAnswerResult = {
  question: RapidQuestionInstance;
  selected: string | null;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
};

type OverallRunner = {
  phase: "setup" | "playing" | "feedback" | "paused" | "result";
  session: RapidQuestionInstance[];
  index: number;
  remainingMs: number;
  results: OverallAnswerResult[];
  correctCount: number;
  streak: number;
  bestStreak: number;
};

type SubjectResult = RapidSubjectMeta & {
  correctCount: number;
  questionCount: number;
  accuracy: number;
};

const INITIAL_RUNNER: OverallRunner = {
  phase: "setup",
  session: [],
  index: 0,
  remainingMs: 0,
  results: [],
  correctCount: 0,
  streak: 0,
  bestStreak: 0,
};

const REVIEW_BATCH_SIZE = 45;

function initialPools() {
  return Object.fromEntries(RAPID_SUBJECT_IDS.map((subjectId) => [
    subjectId,
    getComprehensiveRapidPool(subjectId),
  ])) as Record<SubjectId, RapidQuestion[]>;
}

function loadOverallPools() {
  return initialPools();
}

function clampLimitSeconds(value: number) {
  return Math.min(300, Math.max(1, Math.round(Number.isFinite(value) ? value : 90)));
}

export default function ComprehensiveChallenge({ subjects }: { subjects: StudySubject[] }) {
  const [pools, setPools] = useState<Record<SubjectId, RapidQuestion[]>>(initialPools);
  const [hydrated, setHydrated] = useState(false);
  const [questionCount, setQuestionCount] = useState(18);
  const [limitSeconds, setLimitSeconds] = useState(90);
  const [runner, setRunner] = useState<OverallRunner>(INITIAL_RUNNER);
  const [pauseSaveState, setPauseSaveState] = useState<"idle" | "saved" | "unavailable">("idle");
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [reviewVisibleCount, setReviewVisibleCount] = useState(REVIEW_BATCH_SIZE);
  const startedAtRef = useRef(0);
  const activeElapsedRef = useRef(0);
  const deadlineRef = useRef(0);
  const questionRemainingRef = useRef(0);
  const answerLockedRef = useRef(false);
  const restoreAttemptedRef = useRef(false);

  const displaySubjects = useMemo(() => RAPID_SUBJECTS.map((meta) => {
    const subject = subjects.find((candidate) => candidate.id === meta.id);
    return {
      ...meta,
      name: subject?.name || meta.name,
      accent: subject?.accent || meta.accent,
    };
  }), [subjects]);

  const missingSubjects = useMemo(
    () => displaySubjects.filter((subject) => !pools[subject.id]?.length),
    [displaySubjects, pools],
  );
  const currentQuestion = runner.session[runner.index];
  const currentResult = runner.results[runner.results.length - 1];
  const currentSubject = displaySubjects.find((subject) => subject.id === currentQuestion?.subjectId)
    ?? displaySubjects[0];

  const subjectResults = useMemo<SubjectResult[]>(() => displaySubjects.map((subject) => {
    const results = runner.results.filter((result) => result.question.subjectId === subject.id);
    const correctCount = results.filter((result) => result.correct).length;
    return {
      ...subject,
      correctCount,
      questionCount: results.length,
      accuracy: results.length ? Math.round((correctCount / results.length) * 100) : 0,
    };
  }), [displaySubjects, runner.results]);

  const answeredSubjectResults = subjectResults.filter((subject) => subject.questionCount > 0);
  const strongestRate = answeredSubjectResults.length
    ? Math.max(...answeredSubjectResults.map((subject) => subject.accuracy))
    : 0;
  const weakestRate = answeredSubjectResults.length
    ? Math.min(...answeredSubjectResults.map((subject) => subject.accuracy))
    : 0;
  const strongestNames = answeredSubjectResults
    .filter((subject) => subject.accuracy === strongestRate)
    .map((subject) => subject.name)
    .join("・");
  const weakestNames = answeredSubjectResults
    .filter((subject) => subject.accuracy === weakestRate)
    .map((subject) => subject.name)
    .join("・");

  useEffect(() => {
    function refreshPools() {
      const nextPools = loadOverallPools();
      setPools(nextPools);
      if (!restoreAttemptedRef.current) {
        restoreAttemptedRef.current = true;
        let rawSnapshot: string | null = null;
        try {
          rawSnapshot = window.localStorage.getItem(OVERALL_PAUSE_STORAGE_KEY);
        } catch {
          setPauseSaveState("unavailable");
        }
        const restored = restoreOverallPauseSnapshot(rawSnapshot, nextPools);
        if (restored) {
          setQuestionCount(restored.questionCount);
          setLimitSeconds(restored.limitSeconds);
          activeElapsedRef.current = restored.activeElapsedMs;
          questionRemainingRef.current = restored.remainingMs;
          setPausedAt(restored.savedAt);
          setPauseSaveState("saved");
          setRunner({
            phase: "paused",
            session: restored.session,
            index: restored.index,
            remainingMs: restored.remainingMs,
            results: restored.results,
            correctCount: restored.correctCount,
            streak: restored.streak,
            bestStreak: restored.bestStreak,
          });
        }
      }
      setHydrated(true);
    }
    refreshPools();
    window.addEventListener("focus", refreshPools);
    window.addEventListener("storage", refreshPools);
    window.addEventListener("test-grid:sync-complete", refreshPools);
    return () => {
      window.removeEventListener("focus", refreshPools);
      window.removeEventListener("storage", refreshPools);
      window.removeEventListener("test-grid:sync-complete", refreshPools);
    };
  }, []);

  const applyAnswer = useCallback((selected: string | null, timedOut: boolean, elapsedMs: number) => {
    if (answerLockedRef.current) return;
    answerLockedRef.current = true;
    setRunner((current) => {
      if (current.phase !== "playing") return current;
      const question = current.session[current.index];
      if (!question) return current;
      const correct = isRapidAnswerCorrect(question, selected);
      const streak = correct ? current.streak + 1 : 0;
      return {
        ...current,
        phase: "feedback",
        correctCount: current.correctCount + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(current.bestStreak, streak),
        results: [...current.results, {
          question,
          selected,
          correct,
          timedOut,
          elapsedMs,
        }],
      };
    });
  }, []);

  useEffect(() => {
    if (runner.phase !== "playing" || !currentQuestion) return;
    const limitMs = limitSeconds * 1000;
    const remainingAtStart = Math.max(0, Math.min(limitMs, questionRemainingRef.current || limitMs));
    answerLockedRef.current = false;
    deadlineRef.current = Date.now() + remainingAtStart;

    const interval = window.setInterval(() => {
      const remainingMs = Math.max(0, deadlineRef.current - Date.now());
      setRunner((current) => current.phase === "playing" ? { ...current, remainingMs } : current);
    }, 100);
    const timeout = window.setTimeout(() => {
      applyAnswer(null, true, limitMs);
    }, remainingAtStart);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [applyAnswer, currentQuestion, runner.index, runner.phase, limitSeconds]);

  function changeQuestionCount(delta: number) {
    setQuestionCount((current) => normalizeOverallQuestionCount(current + delta));
  }

  function start() {
    const count = normalizeOverallQuestionCount(questionCount);
    const seconds = clampLimitSeconds(limitSeconds);
    if (!hydrated || missingSubjects.length) return;
    const session = createBalancedRapidSession(pools, count);
    if (session.length !== count) return;
    setQuestionCount(count);
    setLimitSeconds(seconds);
    setPauseSaveState("idle");
    setPausedAt(null);
    setReviewVisibleCount(REVIEW_BATCH_SIZE);
    activeElapsedRef.current = 0;
    questionRemainingRef.current = seconds * 1000;
    startedAtRef.current = Date.now();
    answerLockedRef.current = false;
    try {
      window.localStorage.removeItem(OVERALL_PAUSE_STORAGE_KEY);
    } catch {
      // The challenge can still run when browser storage is unavailable.
    }
    setRunner({
      ...INITIAL_RUNNER,
      phase: "playing",
      session,
      remainingMs: seconds * 1000,
    });
  }

  function answer(selected: string) {
    if (runner.phase !== "playing") return;
    const elapsedMs = Math.max(0, limitSeconds * 1000 - runner.remainingMs);
    applyAnswer(selected, false, elapsedMs);
  }

  function pause() {
    if (runner.phase !== "playing") return;
    const now = Date.now();
    const remainingMs = Math.max(0, deadlineRef.current - now);
    const activeElapsedMs = activeElapsedRef.current + Math.max(0, now - startedAtRef.current);
    activeElapsedRef.current = activeElapsedMs;
    questionRemainingRef.current = remainingMs;
    const pausedRunner: OverallRunner = { ...runner, phase: "paused", remainingMs };
    const snapshot = createOverallPauseSnapshot(pausedRunner, questionCount, limitSeconds, activeElapsedMs);
    let nextSaveState: "saved" | "unavailable" = "saved";
    try {
      window.localStorage.setItem(OVERALL_PAUSE_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      nextSaveState = "unavailable";
    }
    setPausedAt(snapshot.savedAt);
    setPauseSaveState(nextSaveState);
    setRunner(pausedRunner);
  }

  function resume() {
    if (runner.phase !== "paused") return;
    questionRemainingRef.current = runner.remainingMs;
    startedAtRef.current = Date.now();
    answerLockedRef.current = false;
    setPauseSaveState("idle");
    setRunner((current) => current.phase === "paused" ? { ...current, phase: "playing" } : current);
  }

  function finishAttempt() {
    setRunner((current) => ({ ...current, phase: "result" }));
    try {
      window.localStorage.removeItem(OVERALL_PAUSE_STORAGE_KEY);
    } catch {
      // The result screen still works without browser storage.
    }
    setReviewVisibleCount(REVIEW_BATCH_SIZE);
  }

  function next() {
    if (runner.index >= runner.session.length - 1) {
      finishAttempt();
      return;
    }
    answerLockedRef.current = false;
    questionRemainingRef.current = limitSeconds * 1000;
    setRunner((current) => ({
      ...current,
      phase: "playing",
      index: current.index + 1,
      remainingMs: limitSeconds * 1000,
    }));
  }

  function restart() {
    answerLockedRef.current = false;
    activeElapsedRef.current = 0;
    setRunner(INITIAL_RUNNER);
    setPauseSaveState("idle");
    setPausedAt(null);
    setReviewVisibleCount(REVIEW_BATCH_SIZE);
    try {
      window.localStorage.removeItem(OVERALL_PAUSE_STORAGE_KEY);
    } catch {
      // Keep the reset usable even when storage is blocked.
    }
  }

  return (
    <section className="hub-comprehensive" aria-labelledby="overall-challenge-title">
      <div className="rapid-hero overall-hero">
        <div>
          <span>ALL SUBJECTS / BALANCED RANDOM</span>
          <h2 id="overall-challenge-title">9教科総合<br /><em>タイムアタック</em></h2>
        </div>
        <p>9教科から同じ問題数ずつ出題します。1問ごとの制限時間、連続正解、教科別の得意・不得意まで一度に確認できます。</p>
      </div>

      {runner.phase === "setup" && (
        <section className="rapid-setup overall-setup" aria-labelledby="overall-setup-title">
          <div className="rapid-section-heading">
            <div><span>READY / 9 SUBJECTS</span><h2 id="overall-setup-title">総合問題の設定</h2></div>
            <p>問題数は9問刻みで最大{COMPREHENSIVE_MAX_QUESTIONS}問。最大設定なら英語546問を一通り出題し、各教科へ同数を割り当てます。</p>
          </div>

          <div className="rapid-settings overall-settings">
            <label>
              <span>総問題数</span>
              <div className="overall-count-stepper">
                <button type="button" onClick={() => changeQuestionCount(-9)} disabled={questionCount <= 9} aria-label="問題数を9問減らす">−9</button>
                <input
                  type="number"
                  min="9"
                  max={COMPREHENSIVE_MAX_QUESTIONS}
                  step="9"
                  inputMode="numeric"
                  value={questionCount}
                  onChange={(event) => setQuestionCount(normalizeOverallQuestionCount(Number(event.target.value)))}
                  aria-label="総問題数"
                />
                <button type="button" onClick={() => changeQuestionCount(9)} disabled={questionCount >= COMPREHENSIVE_MAX_QUESTIONS} aria-label="問題数を9問増やす">＋9</button>
              </div>
              <small>1教科 {questionCount / 9}問 × 9教科 = {questionCount}問</small>
            </label>
            <label>
              <span>1問の制限時間</span>
              <input type="number" min="1" max="300" inputMode="numeric" value={limitSeconds} onChange={(event) => setLimitSeconds(clampLimitSeconds(Number(event.target.value)))} />
              <small>1〜300秒（本番水準は1問90秒推奨）</small>
            </label>
            <button type="button" onClick={start} disabled={!hydrated || missingSubjects.length > 0}>
              <span>START ALL</span><strong>{hydrated ? missingSubjects.length ? "不足教材を追加してください" : "総合問題を始める →" : "教材を確認中…"}</strong>
            </button>
          </div>

          <div className="overall-pool-grid" aria-label="教科別の出題準備状況">
            {displaySubjects.map((subject) => {
              const count = pools[subject.id]?.length ?? 0;
              return (
                <div className={"overall-pool-item" + (count ? "" : " is-missing")} style={{ "--subject-accent": subject.accent } as CSSProperties} key={subject.id}>
                  <span>{subject.name}</span><strong>{count ? count + "問" : "未登録"}</strong>
                </div>
              );
            })}
          </div>
          <p className="rapid-pool-note">出題元は、暗記確認・通常演習・時間制限・実戦／模試の非生成問題です。AI生成問題と公開生成履歴は総合判定へ混ぜません。</p>

          {hydrated && missingSubjects.length > 0 && (
            <div className="overall-missing">
              <span>NEED STUDY DATA</span>
              <h3>全9教科を均等に出すため、あと{missingSubjects.length}教科の教材が必要です。</h3>
              <p>教材を捏造せず、登録済みの暗記カードだけを総合問題へ使います。</p>
              <div>
                {missingSubjects.map((subject) => (
                  <Link href={subject.cardHref} key={subject.id}>{subject.name}のカードを追加 →</Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {(runner.phase === "playing" || runner.phase === "feedback" || runner.phase === "paused") && currentQuestion && currentSubject && (
        <section className="rapid-runner overall-runner" aria-live="polite" style={{ "--rapid-accent": currentSubject.accent } as CSSProperties}>
          <div className="rapid-runner-status">
            <span>QUESTION <strong>{runner.index + 1}</strong> / {runner.session.length}</span>
            <span>正解 <strong>{runner.correctCount}</strong></span>
            <span>連続正解 <strong>{runner.streak}</strong></span>
            <span>最高連続 <strong>{runner.bestStreak}</strong></span>
          </div>
          <div className="overall-current-subject" style={{ "--subject-accent": currentSubject.accent } as CSSProperties}>
            <span>{currentSubject.name}</span><small>各教科 {runner.session.length / 9}問ずつ</small>
          </div>
          <div className="rapid-timer" data-warning={runner.remainingMs <= 3000}>
            <div><span>TIME LEFT</span><strong>{(runner.remainingMs / 1000).toFixed(1)}</strong><small>秒</small></div>
            <progress value={runner.remainingMs} max={limitSeconds * 1000} aria-label={"残り時間 " + (runner.remainingMs / 1000).toFixed(1) + "秒"} />
          </div>
          <div className={"overall-pause-controls" + (runner.phase === "paused" ? " is-paused" : "")}>
            {runner.phase === "playing" && (
              <button type="button" onClick={pause}><span>PAUSE &amp; SAVE</span><strong>中断して保存</strong></button>
            )}
            {runner.phase === "paused" && (
              <>
                <div>
                  <span>PAUSED</span>
                  <strong>残り {(runner.remainingMs / 1000).toFixed(1)} 秒から再開できます</strong>
                  <small>{pauseSaveState === "saved" && pausedAt ? new Date(pausedAt).toLocaleString("ja-JP") + " にこの端末へ保存済み" : "タイマーは停止中です。端末保存は利用できません。"}</small>
                </div>
                <button type="button" onClick={resume}><span>CONTINUE</span><strong>続きから再開</strong></button>
                <button type="button" className="secondary" onClick={restart}><span>RESET</span><strong>設定へ戻る</strong></button>
              </>
            )}
          </div>
          <article className="rapid-question">
            <header><span>{currentQuestion.topicLabel} · 難度{currentQuestion.difficulty} · 非生成全問題プール</span><h2><RichMathText text={currentQuestion.prompt} /></h2></header>
            <RapidQuestionVisual visual={currentQuestion.visual} solution={runner.phase === "feedback"} />
            <div className="rapid-options" role="group" aria-label="答えを選択">
              {currentQuestion.options.map((option) => {
                const selected = currentResult?.selected === option;
                const actual = currentQuestion.acceptedOptions.includes(option);
                const className = runner.phase === "feedback"
                  ? selected ? (actual ? "correct" : "wrong") : actual ? "actual" : ""
                  : "";
                return (
                  <button type="button" key={option} disabled={runner.phase !== "playing"} className={className} onClick={() => answer(option)}>
                    <RapidAnswerText value={option} mathOptions={currentQuestion.mathOptions} />
                  </button>
                );
              })}
            </div>
          </article>
          {runner.phase === "feedback" && currentResult && (
            <aside className={"rapid-feedback " + (currentResult.correct ? "correct" : "wrong")}>
              <div>
                <span>{currentResult.correct ? "CORRECT" : currentResult.timedOut ? "TIME UP" : "REVIEW"}</span>
                <h3>{currentResult.correct ? "正解です。" : currentSubject.name + "を復習しましょう。"}</h3>
                {!currentResult.correct && <p>正解：<RapidAnswerText value={currentQuestion.answer} mathOptions={currentQuestion.mathOptions} emphasizeRichText /></p>}
              </div>
              <div><strong>本番と同じ解法手順</strong><ol>{currentQuestion.steps.map((step) => <li key={step}><RichMathText text={step} /></li>)}</ol><p><RichMathText text={currentQuestion.explanation} /></p><small>出題根拠：{currentQuestion.sourceBasis}</small></div>
              <div>
                <Link href={currentQuestion.studyHref}>この問題の暗記帳へ</Link>
                <Link href={currentSubject.href}>{currentSubject.name}へ</Link>
                <button type="button" onClick={next}>{runner.index === runner.session.length - 1 ? "結果を見る →" : "次の問題 →"}</button>
              </div>
            </aside>
          )}
        </section>
      )}

      {runner.phase === "result" && (
        <section className="rapid-result overall-result" aria-labelledby="overall-result-title">
          <div className="rapid-result-summary">
            <div><span>OVERALL RESULT</span><h2 id="overall-result-title">{runner.correctCount}<small> / {runner.session.length}</small></h2><p>正答率 {Math.round((runner.correctCount / runner.session.length) * 100)}%</p></div>
            <div><span>BEST STREAK</span><strong>{runner.bestStreak}</strong><p>最高連続正解</p></div>
            <div><span>REVIEW</span><strong>{runner.session.length - runner.correctCount}</strong><p>復習する問題</p></div>
            <button type="button" onClick={restart}>設定へ戻る</button>
          </div>
          <div className="overall-analysis-heading">
            <div><span>STRENGTH MAP</span><h3>9教科の得意・不得意</h3></div>
            <p><strong>得意：</strong>{strongestNames || "集計中"}（{strongestRate}%）<br /><strong>要復習：</strong>{weakestNames || "集計中"}（{weakestRate}%）</p>
          </div>
          <div className="overall-subject-graph" aria-label="教科別正答率グラフ">
            {subjectResults.map((subject) => (
              <Link className="overall-subject-result" href={subject.href} style={{ "--subject-accent": subject.accent } as CSSProperties} key={subject.id}>
                <div><span>{subject.name}</span><strong>{subject.accuracy}%</strong></div>
                <div className="overall-bar" role="img" aria-label={subject.name + "の正答率 " + subject.accuracy + "%"}><i style={{ width: subject.accuracy + "%" }} /></div>
                <small>{subject.correctCount} / {subject.questionCount} 正解　この科目へ →</small>
              </Link>
            ))}
          </div>

          <div className="rapid-review-heading overall-review-heading">
            <span>FULL REVIEW</span><h3>全{runner.results.length}問の振り返り</h3>
            <p>最初の{Math.min(reviewVisibleCount, runner.results.length)}問を表示中。誤答は開いた状態で、暗記帳と教科ページへ直接移動できます。</p>
          </div>
          <div className="rapid-review-list">
            {runner.results.slice(0, reviewVisibleCount).map((result, resultIndex) => {
              const subject = displaySubjects.find((candidate) => candidate.id === result.question.subjectId)
                ?? displaySubjects[0];
              return (
                <details key={result.question.instanceId} className={result.correct ? "correct" : "wrong"} open={!result.correct}>
                  <summary><span>{String(resultIndex + 1).padStart(3, "0")}</span><strong>{subject.name} / {result.question.topicLabel}</strong><b>{result.correct ? "○ 正解" : result.timedOut ? "× 時間切れ" : "× 不正解"}</b></summary>
                  <div>
                    <h4><RichMathText text={result.question.prompt} /></h4>
                    <RapidQuestionVisual visual={result.question.visual} solution compact />
                    <p><span>あなたの回答</span>{result.selected ? <RapidAnswerText value={result.selected} mathOptions={result.question.mathOptions} /> : "未回答"}</p>
                    <p><span>正解</span><RapidAnswerText value={result.question.answer} mathOptions={result.question.mathOptions} emphasizeRichText /></p>
                    <aside><span>解法・解説</span><ol>{result.question.steps.map((step) => <li key={step}><RichMathText text={step} /></li>)}</ol><RichMathText text={result.question.explanation} /><small>出題根拠：{result.question.sourceBasis}</small></aside>
                    <div className="overall-review-links">
                      <Link href={result.question.studyHref}>{result.correct ? "暗記帳で確認" : "誤答を暗記帳で復習 →"}</Link>
                      <Link href={subject.href}>{subject.name}へ →</Link>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
          {reviewVisibleCount < runner.results.length && (
            <button className="overall-review-more" type="button" onClick={() => setReviewVisibleCount((count) => Math.min(runner.results.length, count + REVIEW_BATCH_SIZE))}>
              次の{Math.min(REVIEW_BATCH_SIZE, runner.results.length - reviewVisibleCount)}問を表示 →
            </button>
          )}
        </section>
      )}

    </section>
  );
}
