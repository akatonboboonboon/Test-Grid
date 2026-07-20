"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  startOfficialRankingSession,
  submitOfficialRankingAnswer,
  type OfficialRankingFeedback,
  type OfficialRankingSessionState,
} from "./official-ranking-client";
import { getOfficialRankingSpec } from "./official-ranking-config";
import type { PublicOfficialRankingQuestion } from "./official-ranking-questions";
import RapidAnswerText from "./rapid-answer-text";
import RapidLeaderboard from "./rapid-leaderboard";
import { loadRapidPlayerName, normalizeRapidPlayerName, saveRapidPlayerName } from "./rapid-ranking-data";
import { rapidSubjectMeta } from "./rapid-quiz-data";
import RapidQuestionVisual from "./rapid-question-visual";
import { RichMathText } from "./statistics-math";
import type { SubjectId } from "./study-data";

type OfficialRankingPhase = "setup" | "starting" | "playing" | "checking" | "feedback" | "error";

function rankingErrorMessage(error: string) {
  const messages: Record<string, string> = {
    RANKING_NAME_REQUIRED: "ランキング表示名を入力してください。",
    INVALID_RANKING_NAME: "表示名に改行や制御文字を含めず、1〜24文字にしてください。",
    RANKING_IDENTITY_REQUIRED: "この端末を確認できませんでした。ページを再読み込みしてください。",
    SESSION_NOT_FOUND: "続行中のセッションを確認できませんでした。もう一度開始してください。",
    RANKING_SESSION_NOT_FOUND: "続行中のセッションを確認できませんでした。もう一度開始してください。",
    INVALID_RANKING_SESSION: "保存済みのランキング情報が現在の版と一致しません。もう一度開始してください。",
    RANKING_SESSION_CONFLICT: "別の画面でセッションが更新されました。もう一度開始してください。",
    INVALID_OFFICIAL_SESSION: "ランキングセッションを確認できませんでした。もう一度開始してください。",
    INVALID_ATTEMPT: "表示中の問題を確認できませんでした。セッションを再取得してください。",
    STALE_ATTEMPT: "この問題はすでに採点済みです。セッションを再取得してください。",
    ATTEMPT_ALREADY_ANSWERED: "この問題はすでに採点済みです。セッションを再取得してください。",
    INVALID_OFFICIAL_ANSWER: "回答を確認できませんでした。セッションを再取得してください。",
    LEADERBOARD_UNAVAILABLE: "ランキングサーバーへ接続できませんでした。少し待って再試行してください。",
  };
  return messages[error] ?? "処理に失敗しました。通信状況を確認して再試行してください。";
}

function isEditableRankingKeyTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches("input, textarea, select")
    || target.isContentEditable
    || Boolean(target.closest('[contenteditable="true"], [contenteditable=""]'));
}

export function officialRankingOptionForNumberKey(question: PublicOfficialRankingQuestion, key: string) {
  if (!/^[1-7]$/.test(key)) return null;
  const number = Number(key);
  if (question.subjectId === "network") {
    const layerOption = question.options.find((option) => option.trim().toUpperCase() === `L${number}`);
    if (layerOption) return layerOption;
  }
  if (question.options.length === 4 && number <= 4) return question.options[number - 1] ?? null;
  return null;
}

function officialRankingOptionShortcut(question: PublicOfficialRankingQuestion, option: string, optionIndex: number) {
  if (question.subjectId === "network") {
    const layer = option.trim().toUpperCase().match(/^L([1-7])$/)?.[1];
    if (layer) return layer;
  }
  return question.options.length === 4 ? String(optionIndex + 1) : null;
}

function officialRankingShortcutMaximum(question: PublicOfficialRankingQuestion) {
  if (question.subjectId === "network" && question.options.some((option) => /^L[1-7]$/i.test(option.trim()))) return 7;
  return question.options.length === 4 ? 4 : 0;
}

export default function OfficialRankingTest({ subjectId }: { subjectId: SubjectId }) {
  const meta = rapidSubjectMeta(subjectId);
  const spec = getOfficialRankingSpec(subjectId);
  const [phase, setPhase] = useState<OfficialRankingPhase>("setup");
  const [playerName, setPlayerName] = useState("");
  const [session, setSession] = useState<OfficialRankingSessionState | null>(null);
  const [answeredQuestion, setAnsweredQuestion] = useState<PublicOfficialRankingQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<OfficialRankingFeedback | null>(null);
  const [resumeNotice, setResumeNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const answerLockedRef = useRef(false);
  const normalizedPlayerName = normalizeRapidPlayerName(playerName);
  const currentQuestion = session?.question ?? null;
  const displayedQuestion = phase === "feedback" ? answeredQuestion : currentQuestion;
  const shortcutMaximum = currentQuestion ? officialRankingShortcutMaximum(currentQuestion) : 0;

  /* eslint-disable react-hooks/set-state-in-effect -- restore one shared nickname after mount */
  useEffect(() => {
    setPlayerName(loadRapidPlayerName());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const start = useCallback(async () => {
    const name = normalizeRapidPlayerName(playerName);
    if (!name || phase === "starting") return;
    saveRapidPlayerName(name);
    setPlayerName(name);
    setPhase("starting");
    setErrorMessage("");
    setFeedback(null);
    setAnsweredQuestion(null);
    setSelectedAnswer(null);
    answerLockedRef.current = false;
    const started = await startOfficialRankingSession(subjectId, name);
    if (!started.ok) {
      setErrorMessage(rankingErrorMessage(started.error));
      setPhase("setup");
      return;
    }
    setSession(started.value);
    setPlayerName(started.value.alias);
    saveRapidPlayerName(started.value.alias);
    setResumeNotice(started.value.resumed);
    setPhase("playing");
  }, [phase, playerName, subjectId]);

  const answer = useCallback(async (selected: string) => {
    if (phase !== "playing" || !session || answerLockedRef.current) return;
    answerLockedRef.current = true;
    const question = session.question;
    setAnsweredQuestion(question);
    setSelectedAnswer(selected);
    setErrorMessage("");
    setPhase("checking");
    const submitted = await submitOfficialRankingAnswer(session, selected);
    if (!submitted.ok) {
      answerLockedRef.current = false;
      setErrorMessage(rankingErrorMessage(submitted.error));
      setPhase("error");
      return;
    }
    setSession(submitted.value);
    setFeedback(submitted.value.feedback);
    setPhase("feedback");
    if (submitted.value.improved) setLeaderboardRefresh((value) => value + 1);
  }, [phase, session]);

  useEffect(() => {
    if (phase !== "playing" || !currentQuestion) return;
    const keyboardQuestion = currentQuestion;

    function handleRankingNumberKey(event: KeyboardEvent) {
      if (
        event.defaultPrevented
        || event.repeat
        || event.isComposing
        || event.keyCode === 229
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || answerLockedRef.current
        || isEditableRankingKeyTarget(event.target)
      ) return;

      const selected = officialRankingOptionForNumberKey(keyboardQuestion, event.key);
      if (!selected) return;
      event.preventDefault();
      void answer(selected);
    }

    window.addEventListener("keydown", handleRankingNumberKey);
    return () => window.removeEventListener("keydown", handleRankingNumberKey);
  }, [answer, currentQuestion, phase]);

  function nextQuestion() {
    if (phase !== "feedback" || !session) return;
    answerLockedRef.current = false;
    setAnsweredQuestion(null);
    setSelectedAnswer(null);
    setFeedback(null);
    setResumeNotice(false);
    setPhase("playing");
  }

  function recoverSession() {
    answerLockedRef.current = false;
    setSession(null);
    setAnsweredQuestion(null);
    setSelectedAnswer(null);
    setFeedback(null);
    setResumeNotice(false);
    setErrorMessage("");
    setPhase("setup");
  }

  return (
    <div className="app-frame rapid-page official-ranking-page" style={{ "--rapid-accent": meta.accent } as CSSProperties}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">R/K</span>
          <span><strong>TEST//GRID</strong><small>OFFICIAL STREAK RANKING</small></span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> VERSION {spec.version}</span>
          <Link className="outline-button header-link" href={meta.href}>{meta.name}へ戻る</Link>
        </div>
      </header>

      <main className="rapid-main official-ranking-main">
        <nav className="subject-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><Link href={meta.href}>{meta.name}</Link><span>/</span><strong aria-current="page">連続正解ランキング</strong>
        </nav>

        <section className="rapid-hero official-ranking-hero">
          <div><span>ENDLESS STREAK / {meta.name}</span><h1>正解をつないで、<br /><em>自己ベストを伸ばす。</em></h1></div>
          <p>問題数と総制限時間はありません。1問ごとにサーバーで採点し、その場で正誤と解説を確認できます。中断して戻ってきても連続正解数は続き、表示問題は新しい問題へ切り替わります。</p>
        </section>

        {(phase === "setup" || phase === "starting") && (
          <section className="rapid-setup official-ranking-setup" aria-labelledby="official-ranking-setup-title">
            <div className="rapid-section-heading">
              <div><span>STREAK RULES</span><h2 id="official-ranking-setup-title">連続正解で競うランキング</h2></div>
              <p>同じ科目の続きが保存されている場合は、開始ボタンで現在の連続正解数から再開します。</p>
            </div>
            <div className="official-ranking-rules" aria-label="連続正解ランキングの条件">
              <div><span>QUESTIONS</span><strong>∞</strong><small>問題数の上限なし</small></div>
              <div><span>RANKING</span><strong>STREAK</strong><small>最高連続正解数で順位決定</small></div>
              <div><span>FEEDBACK</span><strong>NOW</strong><small>1問ごとに正誤・解説</small></div>
              <div><span>RESUME</span><strong>KEEP</strong><small>中断後も連続数を続投</small></div>
            </div>
            <div className="official-ranking-start">
              <label>
                <span>ランキング表示名</span>
                <input type="text" maxLength={24} autoComplete="nickname" value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="例：おさと" required />
                <small>{normalizedPlayerName ? `「${normalizedPlayerName}」として記録します` : "1〜24文字で入力してください（必須）"}</small>
              </label>
              <button type="button" onClick={() => void start()} disabled={!normalizedPlayerName || phase === "starting"}>
                <span>{phase === "starting" ? "PREPARING" : "START / RESUME"}</span>
                <strong>{phase === "starting" ? "セッションを確認中…" : "開始・続きから再開 →"}</strong>
              </button>
            </div>
            {errorMessage && <p className="official-ranking-error" role="alert">{errorMessage}</p>}
            <p className="rapid-pool-note">中断中に表示していた問題は再開時に破棄され、別の問題へ切り替わります。連続正解数と自己ベストは失われません。</p>
          </section>
        )}

        {(phase === "playing" || phase === "checking" || phase === "feedback") && session && displayedQuestion && (
          <section className="rapid-runner official-ranking-runner" aria-live="polite" aria-busy={phase === "checking"}>
            <div className="rapid-runner-status official-ranking-streak-status">
              <span>CURRENT STREAK <strong>{session.currentStreak}</strong></span>
              <span>BEST <strong>{session.bestStreak}</strong></span>
              <span>ANSWERED <strong>{session.totalAnswered}</strong></span>
              <span>CORRECT <strong>{session.totalCorrect}</strong></span>
            </div>

            {resumeNotice && (
              <div className="official-ranking-resume-notice" role="status">
                <span>SESSION RESTORED</span>
                <strong>{session.currentStreak}連続正解から続投します</strong>
                <small>前回表示していた問題から、新しい問題へ切り替えました。</small>
              </div>
            )}

            <div className="official-ranking-runner-actions">
              <p><strong>{session.alias}</strong> さんの自己ベスト：{session.bestStreak}連続</p>
              <Link href={meta.href}>中断して{meta.name}へ戻る</Link>
            </div>

            <article className="rapid-question official-ranking-question">
              <header>
                <span>{displayedQuestion.topicLabel} ・ 難度{displayedQuestion.difficulty}</span>
                <h2><RichMathText text={displayedQuestion.prompt} /></h2>
              </header>
              {displayedQuestion.reference?.quote && (
                <section className="official-ranking-reference official-ranking-question-reference" aria-label="問題の参照本文">
                  <span>{displayedQuestion.reference.label || "REFERENCE"}</span>
                  <blockquote><RichMathText text={displayedQuestion.reference.quote} /></blockquote>
                </section>
              )}
              <RapidQuestionVisual visual={displayedQuestion.visual} solution={phase === "feedback"} />
              {phase === "playing" && shortcutMaximum > 0 && (
                <p className="rapid-keyboard-hint">
                  <span>KEYBOARD</span><kbd>1</kbd><b>〜</b><kbd>{shortcutMaximum}</kbd> の数字キーで回答できます
                </p>
              )}
              <div
                className="rapid-options"
                role="radiogroup"
                aria-label="答えを選択"
                style={{ "--rapid-option-count": displayedQuestion.options.length } as CSSProperties}
              >
                {displayedQuestion.options.map((option, optionIndex) => {
                  const selected = selectedAnswer === option;
                  const actual = feedback?.acceptedOptions.includes(option) ?? false;
                  const className = phase === "feedback"
                    ? selected ? (actual ? "correct" : "wrong") : actual ? "actual" : ""
                    : selected ? "selected" : "";
                  const shortcut = officialRankingOptionShortcut(displayedQuestion, option, optionIndex);
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      key={option}
                      className={className}
                      disabled={phase !== "playing"}
                      onClick={() => void answer(option)}
                      aria-keyshortcuts={shortcut ?? undefined}
                    >
                      {shortcut && <span className="rapid-option-shortcut" aria-hidden="true">{shortcut}</span>}
                      <span className="rapid-option-value"><RapidAnswerText value={option} mathOptions={displayedQuestion.mathOptions} /></span>
                    </button>
                  );
                })}
              </div>
            </article>

            {phase === "checking" && <p className="official-ranking-submitting" role="status">この1問をサーバーで採点しています…</p>}

            {phase === "feedback" && feedback && (
              <aside className={`rapid-feedback official-ranking-feedback ${feedback.correct ? "correct" : "wrong"}`}>
                <div>
                  <span>{feedback.correct ? "CORRECT" : "REVIEW"}</span>
                  <h3>{feedback.correct ? `${session.currentStreak}連続正解！` : "ここから、また連続正解をつなげよう。"}</h3>
                  <p>あなたの回答：{feedback.selected ? <RapidAnswerText value={feedback.selected} mathOptions={feedback.mathOptions} /> : "未回答"}</p>
                  {!feedback.correct && <p>正解：<RapidAnswerText value={feedback.answer} mathOptions={feedback.mathOptions} emphasizeRichText /></p>}
                </div>
                <div>
                  <strong>解法・解説</strong>
                  {feedback.steps.length > 0 && <ol>{feedback.steps.map((step) => <li key={step}><RichMathText text={step} /></li>)}</ol>}
                  <p><RichMathText text={feedback.explanation} /></p>
                  {feedback.reference?.translation && (
                    <section className="official-ranking-reference official-ranking-translation" aria-label="参照和訳">
                      <span>{feedback.reference.label || "REFERENCE"}</span>
                      <p><strong>参照和訳</strong><RichMathText text={feedback.reference.translation} /></p>
                    </section>
                  )}
                  <small>出題根拠：{feedback.sourceBasis}</small>
                </div>
                <div>
                  <Link href={feedback.studyHref}>この問題を復習する</Link>
                  <button type="button" onClick={nextQuestion}>次の問題へ →</button>
                </div>
              </aside>
            )}
          </section>
        )}

        {phase === "error" && (
          <section className="rapid-result official-ranking-error-panel">
            <span>SESSION ERROR</span>
            <h2>セッションを再取得してください。</h2>
            <p role="alert">{errorMessage}</p>
            <div><button type="button" onClick={recoverSession}>開始画面へ戻る</button><Link className="outline-button" href={meta.href}>{meta.name}へ戻る</Link></div>
          </section>
        )}

        <RapidLeaderboard boardKey={spec.boardKey} refreshToken={leaderboardRefresh} />
      </main>

      <footer><span>TEST//GRID</span><p>ENDLESS QUESTIONS ・ INSTANT FEEDBACK ・ STREAK SAVED</p><span>RANK V{spec.version}</span></footer>
    </div>
  );
}
