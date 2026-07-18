"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  startOfficialRankingChallenge,
  submitOfficialRankingChallenge,
  type OfficialRankingChallenge,
  type OfficialRankingResult,
} from "./official-ranking-client";
import { getOfficialRankingSpec } from "./official-ranking-config";
import type {
  OfficialRankingResponse,
  OfficialRankingReviewItem,
  PublicOfficialRankingQuestion,
} from "./official-ranking-questions";
import RapidAnswerText from "./rapid-answer-text";
import RapidLeaderboard from "./rapid-leaderboard";
import { loadRapidPlayerName, normalizeRapidPlayerName, saveRapidPlayerName } from "./rapid-ranking-data";
import { rapidSubjectMeta } from "./rapid-quiz-data";
import RapidQuestionVisual from "./rapid-question-visual";
import { RichMathText } from "./statistics-math";
import type { SubjectId } from "./study-data";

type OfficialRankingPhase = "setup" | "starting" | "playing" | "submitting" | "result" | "error";

function formatClock(durationMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}分${String(seconds).padStart(2, "0")}秒` : `${seconds}秒`;
}

function rankingErrorMessage(error: string) {
  const messages: Record<string, string> = {
    RANKING_NAME_REQUIRED: "ランキング表示名を入力してください。",
    INVALID_RANKING_NAME: "表示名は改行や制御文字を含まない1〜24文字にしてください。",
    RANKING_IDENTITY_REQUIRED: "この端末を確認できませんでした。ページを再読み込みしてください。",
    CHALLENGE_EXPIRED: "制限時間と提出猶予を過ぎました。新しいテストを開始してください。",
    CHALLENGE_ALREADY_SUBMITTED: "この答案はすでに提出済みです。新しいテストを開始してください。",
    CHALLENGE_NOT_FOUND: "テスト情報が見つかりません。新しいテストを開始してください。",
    INVALID_OFFICIAL_ANSWERS: "答案を確認できませんでした。ページを再読み込みして再挑戦してください。",
    LEADERBOARD_UNAVAILABLE: "ランキングサーバーへ接続できませんでした。少し待って再試行してください。",
  };
  return messages[error] ?? "処理に失敗しました。通信状態を確認して再試行してください。";
}

function publicQuestionAsVisual(question: PublicOfficialRankingQuestion) {
  return question.visual;
}

export default function OfficialRankingTest({ subjectId }: { subjectId: SubjectId }) {
  const meta = rapidSubjectMeta(subjectId);
  const spec = getOfficialRankingSpec(subjectId);
  const [phase, setPhase] = useState<OfficialRankingPhase>("setup");
  const [playerName, setPlayerName] = useState("");
  const [challenge, setChallenge] = useState<OfficialRankingChallenge | null>(null);
  const [answers, setAnswers] = useState<OfficialRankingResponse[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(spec.timeLimitMs);
  const [result, setResult] = useState<OfficialRankingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const answersRef = useRef<OfficialRankingResponse[]>([]);
  const submissionLockedRef = useRef(false);
  const normalizedPlayerName = normalizeRapidPlayerName(playerName);
  const currentQuestion = challenge?.questions[questionIndex];
  const answeredCount = useMemo(
    () => answers.filter((answer) => answer.selected !== null).length,
    [answers],
  );
  const review: OfficialRankingReviewItem[] = result?.review ?? [];

  /* eslint-disable react-hooks/set-state-in-effect -- restore one shared nickname after mount */
  useEffect(() => {
    setPlayerName(loadRapidPlayerName());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submitAnswers = useCallback(async (
    challengeToSubmit: OfficialRankingChallenge,
    answersToSubmit: OfficialRankingResponse[],
    timedOut: boolean,
  ) => {
    if (submissionLockedRef.current) return;
    submissionLockedRef.current = true;
    setPhase("submitting");
    setErrorMessage("");
    const submission = await submitOfficialRankingChallenge(challengeToSubmit.challengeId, answersToSubmit);
    if (submission.ok) {
      setResult(submission.value);
      setRemainingMs(Math.max(0, challengeToSubmit.expiresAt - Date.now()));
      setPhase("result");
      setLeaderboardRefresh((value) => value + 1);
      return;
    }
    submissionLockedRef.current = false;
    setErrorMessage(rankingErrorMessage(submission.error));
    setPhase(timedOut ? "error" : "playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing" || !challenge) return;
    const update = () => {
      const nextRemaining = Math.max(0, challenge.expiresAt - Date.now());
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0) {
        window.clearInterval(timer);
        void submitAnswers(challenge, answersRef.current, true);
      }
    };
    const timer = window.setInterval(update, 100);
    update();
    return () => window.clearInterval(timer);
  }, [challenge, phase, submitAnswers]);

  async function start() {
    const name = normalizeRapidPlayerName(playerName);
    if (!name) return;
    saveRapidPlayerName(name);
    setPlayerName(name);
    setPhase("starting");
    setErrorMessage("");
    setResult(null);
    submissionLockedRef.current = false;
    const started = await startOfficialRankingChallenge(subjectId, name);
    if (!started.ok) {
      setErrorMessage(rankingErrorMessage(started.error));
      setPhase("setup");
      return;
    }
    const initialAnswers = started.value.questions.map((question) => ({
      questionId: question.id,
      selected: null,
    }));
    answersRef.current = initialAnswers;
    setChallenge(started.value);
    setAnswers(initialAnswers);
    setQuestionIndex(0);
    setRemainingMs(Math.max(0, started.value.expiresAt - Date.now()));
    setPhase("playing");
  }

  function selectAnswer(selected: string) {
    if (phase !== "playing" || !currentQuestion) return;
    const nextAnswers = answers.map((answer, index) => (
      index === questionIndex ? { ...answer, selected } : answer
    ));
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
  }

  function moveQuestion(nextIndex: number) {
    if (phase !== "playing") return;
    setQuestionIndex(Math.min(spec.questionCount - 1, Math.max(0, nextIndex)));
  }

  function submitNow() {
    if (!challenge || phase !== "playing") return;
    void submitAnswers(challenge, answersRef.current, false);
  }

  function retrySubmission() {
    if (!challenge) return;
    submissionLockedRef.current = false;
    void submitAnswers(challenge, answersRef.current, true);
  }

  function reset() {
    submissionLockedRef.current = false;
    answersRef.current = [];
    setChallenge(null);
    setAnswers([]);
    setQuestionIndex(0);
    setRemainingMs(spec.timeLimitMs);
    setResult(null);
    setErrorMessage("");
    setPhase("setup");
  }

  return (
    <div className="app-frame rapid-page official-ranking-page" style={{ "--rapid-accent": meta.accent } as CSSProperties}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">R/K</span>
          <span><strong>TEST//GRID</strong><small>OFFICIAL RANKING</small></span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> VERSION {spec.version}</span>
          <Link className="outline-button header-link" href={meta.href}>{meta.name}へ戻る</Link>
        </div>
      </header>

      <main className="rapid-main official-ranking-main">
        <nav className="subject-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><Link href={meta.href}>{meta.name}</Link><span>/</span><strong aria-current="page">公式ランキングテスト</strong>
        </nav>

        <section className="rapid-hero official-ranking-hero">
          <div><span>FIXED RULES / {meta.name}</span><h1>条件固定の<br /><em>公式ランキングテスト</em></h1></div>
          <p>全員が同じ20問・同じ総制限時間・同じ問題セットで挑戦します。通常の即答練習や総合問題の成績は、このランキングには入りません。</p>
        </section>

        {(phase === "setup" || phase === "starting") && (
          <>
            <section className="rapid-setup official-ranking-setup" aria-labelledby="official-ranking-setup-title">
              <div className="rapid-section-heading">
                <div><span>OFFICIAL RULES</span><h2 id="official-ranking-setup-title">変更できない挑戦条件</h2></div>
                <p>開始ボタンを押して問題を受信した時点から、サーバー側でも時間を計測します。</p>
              </div>
              <div className="official-ranking-rules" aria-label="公式ランキングテストの固定条件">
                <div><span>QUESTIONS</span><strong>{spec.questionCount}</strong><small>全員同じ問題数</small></div>
                <div><span>TOTAL TIME</span><strong>{formatClock(spec.timeLimitMs)}</strong><small>全体の制限時間</small></div>
                <div><span>QUESTION SET</span><strong>V{spec.version}</strong><small>全員同じ固定セット</small></div>
                <div><span>ORDER</span><strong>点数 → 時間</strong><small>同点なら短時間が上位</small></div>
              </div>
              <div className="official-ranking-start">
                <label>
                  <span>ランキング表示名</span>
                  <input type="text" maxLength={24} autoComplete="nickname" value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="例：おさと" required />
                  <small>{normalizedPlayerName ? `「${normalizedPlayerName}」として記録します` : "1〜24文字で入力してください（必須）"}</small>
                </label>
                <button type="button" onClick={start} disabled={!normalizedPlayerName || phase === "starting"}>
                  <span>{phase === "starting" ? "PREPARING" : "START OFFICIAL"}</span>
                  <strong>{phase === "starting" ? "公式問題を準備中…" : "ランキングテストを開始 →"}</strong>
                </button>
              </div>
              {errorMessage && <p className="official-ranking-error" role="alert">{errorMessage}</p>}
              <p className="rapid-pool-note">不公平な可変設定を廃止しました。点数と経過時間は提出後にサーバーが採点し、旧ランキング記録とは混ぜません。</p>
            </section>
            <RapidLeaderboard boardKey={spec.boardKey} refreshToken={leaderboardRefresh} />
          </>
        )}

        {(phase === "playing" || phase === "submitting") && challenge && currentQuestion && (
          <section className="rapid-runner official-ranking-runner" aria-live="polite" aria-busy={phase === "submitting"}>
            <div className="rapid-runner-status">
              <span>QUESTION <strong>{questionIndex + 1}</strong> / {spec.questionCount}</span>
              <span>回答済み <strong>{answeredCount}</strong> / {spec.questionCount}</span>
              <span>未回答 <strong>{spec.questionCount - answeredCount}</strong></span>
              <span>VERSION <strong>{spec.version}</strong></span>
            </div>
            <div className="rapid-timer official-ranking-total-timer" data-warning={remainingMs <= 60_000}>
              <div><span>TOTAL TIME LEFT</span><strong>{formatClock(remainingMs)}</strong></div>
              <progress value={remainingMs} max={spec.timeLimitMs} aria-label={`総残り時間 ${formatClock(remainingMs)}`} />
            </div>

            <nav className="official-ranking-question-nav" aria-label="問題番号">
              {challenge.questions.map((question, index) => (
                <button
                  type="button"
                  key={question.id}
                  className={index === questionIndex ? "is-current" : answers[index]?.selected !== null ? "is-answered" : ""}
                  aria-current={index === questionIndex ? "step" : undefined}
                  aria-label={`第${index + 1}問${answers[index]?.selected !== null ? " 回答済み" : " 未回答"}`}
                  onClick={() => moveQuestion(index)}
                  disabled={phase !== "playing"}
                >
                  {index + 1}
                </button>
              ))}
            </nav>

            <article className="rapid-question official-ranking-question">
              <header>
                <span>{currentQuestion.topicLabel} · 難度{currentQuestion.difficulty}</span>
                <h2><RichMathText text={currentQuestion.prompt} /></h2>
              </header>
              <RapidQuestionVisual visual={publicQuestionAsVisual(currentQuestion)} />
              <div className="rapid-options" role="radiogroup" aria-label="答えを選択">
                {currentQuestion.options.map((option) => {
                  const selected = answers[questionIndex]?.selected === option;
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      key={option}
                      className={selected ? "selected" : ""}
                      disabled={phase !== "playing"}
                      onClick={() => selectAnswer(option)}
                    >
                      <RapidAnswerText value={option} mathOptions={currentQuestion.mathOptions} />
                    </button>
                  );
                })}
              </div>
            </article>

            <div className="official-ranking-controls">
              <button type="button" onClick={() => moveQuestion(questionIndex - 1)} disabled={phase !== "playing" || questionIndex === 0}>← 前の問題</button>
              {questionIndex < spec.questionCount - 1 ? (
                <button type="button" onClick={() => moveQuestion(questionIndex + 1)} disabled={phase !== "playing"}>次の問題 →</button>
              ) : (
                <button className="official-ranking-submit" type="button" onClick={submitNow} disabled={phase !== "playing"}>答案を提出する</button>
              )}
            </div>
            {phase === "submitting" && <p className="official-ranking-submitting" role="status">答案をサーバーで採点しています…</p>}
          </section>
        )}

        {phase === "error" && (
          <section className="rapid-result official-ranking-error-panel">
            <span>SUBMISSION ERROR</span>
            <h2>答案を送信できませんでした。</h2>
            <p role="alert">{errorMessage}</p>
            <div><button type="button" onClick={retrySubmission}>提出を再試行</button><button type="button" onClick={reset}>新しくやり直す</button></div>
          </section>
        )}

        {phase === "result" && result && (
          <>
            <section className="rapid-result official-ranking-result" aria-labelledby="official-ranking-result-title">
              <div className="rapid-result-summary">
                <div><span>OFFICIAL SCORE</span><h2 id="official-ranking-result-title">{result.correctCount}<small> / {result.questionCount}</small></h2><p>正答率 {Math.round((result.correctCount / result.questionCount) * 100)}%</p></div>
                <div><span>SERVER TIME</span><strong>{formatDuration(result.durationMs)}</strong><p>サーバー計測</p></div>
                <div><span>BEST STREAK</span><strong>{result.bestStreak}</strong><p>最高連続正解</p></div>
                <button type="button" onClick={reset}>もう一度挑戦</button>
              </div>
              <p className="rapid-publish-status">{result.improved ? `${result.alias}さんの自己ベストを更新しました。` : `${result.alias}さんの結果を採点しました。自己ベストは維持されています。`}</p>

              <div className="rapid-review-heading">
                <span>OFFICIAL REVIEW</span><h3>全{result.questionCount}問の振り返り</h3>
                <p>提出後に初めて正解・解法・出題根拠を表示します。間違えた問題は開いた状態です。</p>
              </div>
              <div className="rapid-review-list">
                {review.map((item, index) => (
                  <details key={item.questionId} className={item.correct ? "correct" : "wrong"} open={!item.correct}>
                    <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.topicLabel}</strong><b>{item.correct ? "○ 正解" : item.selected === null ? "× 未回答" : "× 不正解"}</b></summary>
                    <div>
                      <h4><RichMathText text={item.prompt} /></h4>
                      <RapidQuestionVisual visual={item.visual} solution compact />
                      <p><span>あなたの回答</span>{item.selected ? <RapidAnswerText value={item.selected} mathOptions={item.mathOptions} /> : "未回答"}</p>
                      <p><span>正解</span><RapidAnswerText value={item.answer} mathOptions={item.mathOptions} emphasizeRichText /></p>
                      <aside><span>解法・解説</span><ol>{item.steps.map((step) => <li key={step}><RichMathText text={step} /></li>)}</ol><RichMathText text={item.explanation} /><small>出題根拠：{item.sourceBasis}</small></aside>
                      <Link href={item.studyHref}>{item.correct ? "暗記帳・演習で確認" : "間違えた問題を復習 →"}</Link>
                    </div>
                  </details>
                ))}
              </div>
            </section>
            <RapidLeaderboard boardKey={spec.boardKey} refreshToken={leaderboardRefresh} />
          </>
        )}
      </main>

      <footer><span>TEST//GRID</span><p>FIXED QUESTIONS · FIXED TOTAL TIME · SERVER SCORING</p><span>RANK V{spec.version}</span></footer>
    </div>
  );
}
