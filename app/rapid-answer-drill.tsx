"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { InlineMath, RichMathText } from "./statistics-math";
import {
  createRapidSession,
  getStaticRapidPool,
  isRapidAnswerCorrect,
  networkCardsToRapid,
  rapidSubjectMeta,
  studyCardsToRapid,
  type RapidQuestionInstance,
} from "./rapid-quiz-data";
import {
  historyForBoard,
  loadRapidHistory,
  makeRapidBoardKey,
  publishRapidScore,
  saveRapidAttempt,
  type RapidAttemptSummary,
} from "./rapid-ranking-data";
import RapidLeaderboard from "./rapid-leaderboard";
import { DEFAULT_CARDS, normalizeCards, storageRead } from "./protocols";
import {
  cardsStorageKey,
  normalizeStudyCards,
  type SubjectId,
} from "./study-data";

type AnswerResult = {
  question: RapidQuestionInstance;
  selected: string | null;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
};

type RunnerState = {
  phase: "setup" | "playing" | "feedback" | "result";
  session: RapidQuestionInstance[];
  index: number;
  remainingMs: number;
  results: AnswerResult[];
  correctCount: number;
  streak: number;
  bestStreak: number;
};

type RunnerAction =
  | { type: "start"; session: RapidQuestionInstance[]; limitMs: number }
  | { type: "tick"; remainingMs: number }
  | { type: "answer"; selected: string | null; timedOut: boolean; elapsedMs: number }
  | { type: "next"; limitMs: number }
  | { type: "finish" }
  | { type: "reset" };

const INITIAL_RUNNER: RunnerState = {
  phase: "setup",
  session: [],
  index: 0,
  remainingMs: 0,
  results: [],
  correctCount: 0,
  streak: 0,
  bestStreak: 0,
};

function runnerReducer(state: RunnerState, action: RunnerAction): RunnerState {
  if (action.type === "start") {
    return {
      ...INITIAL_RUNNER,
      phase: "playing",
      session: action.session,
      remainingMs: action.limitMs,
    };
  }
  if (action.type === "tick") {
    return state.phase === "playing" ? { ...state, remainingMs: action.remainingMs } : state;
  }
  if (action.type === "answer") {
    if (state.phase !== "playing") return state;
    const question = state.session[state.index];
    if (!question) return state;
    const correct = isRapidAnswerCorrect(question, action.selected);
    const streak = correct ? state.streak + 1 : 0;
    return {
      ...state,
      phase: "feedback",
      correctCount: state.correctCount + (correct ? 1 : 0),
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
      results: [...state.results, {
        question,
        selected: action.selected,
        correct,
        timedOut: action.timedOut,
        elapsedMs: action.elapsedMs,
      }],
    };
  }
  if (action.type === "next") {
    return {
      ...state,
      phase: "playing",
      index: state.index + 1,
      remainingMs: action.limitMs,
    };
  }
  if (action.type === "finish") return { ...state, phase: "result" };
  if (action.type === "reset") return INITIAL_RUNNER;
  return state;
}

function useRunnerState() {
  const [state, setState] = useState(INITIAL_RUNNER);
  const dispatch = useCallback((action: RunnerAction) => {
    setState((current) => runnerReducer(current, action));
  }, []);
  return [state, dispatch] as const;
}

function loadSubjectPool(subjectId: SubjectId) {
  if (subjectId === "network") {
    const cards = normalizeCards(storageRead<unknown>("layer-sum-cards-v1", DEFAULT_CARDS))
      .filter((card) => card.enabled && card.label.trim());
    return networkCardsToRapid(cards);
  }
  if (subjectId === "subject-5" || subjectId === "subject-9") {
    const cards = normalizeStudyCards(
      storageRead<unknown>(cardsStorageKey(subjectId), []),
      subjectId,
    ).filter((card) => card.enabled);
    return studyCardsToRapid(subjectId, cards);
  }
  return getStaticRapidPool(subjectId);
}

export default function RapidAnswerDrill({ subjectId }: { subjectId: SubjectId }) {
  const meta = rapidSubjectMeta(subjectId);
  const [pool, setPool] = useState(() => getStaticRapidPool(subjectId));
  const [questionCount, setQuestionCount] = useState(10);
  const [limitSeconds, setLimitSeconds] = useState(8);
  const [state, dispatch] = useRunnerState();
  const [history, setHistory] = useState<RapidAttemptSummary[]>([]);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [publishState, setPublishState] = useState<"idle" | "saved" | "sign-in-required" | "unavailable">("idle");
  const startedAtRef = useRef(0);
  const deadlineRef = useRef(0);
  const boardKey = makeRapidBoardKey(subjectId, questionCount);
  const currentQuestion = state.session[state.index];
  const currentResult = state.results[state.results.length - 1];
  const localRanking = useMemo(() => historyForBoard(history, boardKey), [history, boardKey]);

  /* Device-local pools and synced ranking history are restored after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPool(loadSubjectPool(subjectId));
    setHistory(loadRapidHistory());
  }, [subjectId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (state.phase !== "playing") return;
    deadlineRef.current = Date.now() + limitSeconds * 1000;
    const timer = window.setInterval(() => {
      const remainingMs = Math.max(0, deadlineRef.current - Date.now());
      dispatch({ type: "tick", remainingMs });
      if (remainingMs <= 0) {
        window.clearInterval(timer);
        dispatch({
          type: "answer",
          selected: null,
          timedOut: true,
          elapsedMs: limitSeconds * 1000,
        });
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [state.phase, state.index, limitSeconds, dispatch]);

  function start() {
    const count = Math.min(100, Math.max(5, Math.round(questionCount)));
    const seconds = Math.min(60, Math.max(1, Math.round(limitSeconds)));
    const session = createRapidSession(pool, count);
    if (!session.length) return;
    setQuestionCount(count);
    setLimitSeconds(seconds);
    setPublishState("idle");
    startedAtRef.current = Date.now();
    dispatch({ type: "start", session, limitMs: seconds * 1000 });
  }

  function answer(selected: string) {
    if (state.phase !== "playing") return;
    dispatch({
      type: "answer",
      selected,
      timedOut: false,
      elapsedMs: Math.max(0, limitSeconds * 1000 - state.remainingMs),
    });
  }

  async function finishAttempt() {
    const durationMs = Math.max(1, Date.now() - startedAtRef.current);
    const attempt: RapidAttemptSummary = {
      id: `${boardKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      boardKey,
      subjectName: meta.name,
      correctCount: state.correctCount,
      questionCount: state.session.length,
      bestStreak: state.bestStreak,
      durationMs,
      completedAt: Date.now(),
    };
    setHistory(saveRapidAttempt(attempt));
    dispatch({ type: "finish" });
    const published = await publishRapidScore(attempt);
    setPublishState(published);
    if (published === "saved") setLeaderboardRefresh((value) => value + 1);
  }

  function next() {
    if (state.index >= state.session.length - 1) {
      void finishAttempt();
      return;
    }
    dispatch({ type: "next", limitMs: limitSeconds * 1000 });
  }

  function restart() {
    dispatch({ type: "reset" });
    setPublishState("idle");
  }

  return (
    <div className="app-frame rapid-page" style={{ "--rapid-accent": meta.accent } as CSSProperties}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">R/T</span>
          <span><strong>TEST//GRID</strong><small>RAPID ANSWER</small></span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {pool.length} QUESTIONS</span>
          <Link className="outline-button header-link" href={meta.href}>{meta.name}へ戻る</Link>
        </div>
      </header>

      <main className="rapid-main">
        <nav className="subject-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><Link href={meta.href}>{meta.name}</Link><span>/</span><strong aria-current="page">時間制限つき即答</strong>
        </nav>

        <section className="rapid-hero">
          <div><span>TIME ATTACK / {meta.name}</span><h1>時間制限つき<br /><em>即答チャレンジ</em></h1></div>
          <p>ネットワークの層即答と同じ感覚で、正解を時間内に選びます。連続正解数と自己ベストは保存され、ログイン中は匿名ランキングにも参加できます。</p>
        </section>

        {state.phase === "setup" && (
          <section className="rapid-setup" aria-labelledby="rapid-setup-title">
            <div className="rapid-section-heading">
              <div><span>READY</span><h2 id="rapid-setup-title">出題設定</h2></div>
              <p>問題は教材の範囲内からランダムに出ます。</p>
            </div>
            {pool.length ? (
              <>
                <div className="rapid-settings">
                  <label><span>問題数</span><input type="number" min="5" max="100" step="5" value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} /><small>5〜100問</small></label>
                  <label><span>1問の制限時間</span><input type="number" min="1" max="60" value={limitSeconds} onChange={(event) => setLimitSeconds(Number(event.target.value))} /><small>1〜60秒</small></label>
                  <button type="button" onClick={start}><span>START</span><strong>即答を始める →</strong></button>
                </div>
                <p className="rapid-pool-note">{pool.length}問の問題バンクを、足りない場合は重複を離して再抽選します。</p>
              </>
            ) : (
              <div className="rapid-missing">
                <span>NO STUDY DATA</span><h3>{meta.name}の問題がまだ登録されていません。</h3>
                <p>教材を捏造せず、登録された暗記カードだけを即答問題に使います。まず2枚以上追加してください。</p>
                <Link href={meta.href}>教材を追加する →</Link>
              </div>
            )}
          </section>
        )}

        {(state.phase === "playing" || state.phase === "feedback") && currentQuestion && (
          <section className="rapid-runner" aria-live="polite">
            <div className="rapid-runner-status">
              <span>QUESTION <strong>{state.index + 1}</strong> / {state.session.length}</span>
              <span>正解 <strong>{state.correctCount}</strong></span>
              <span>連続正解 <strong>{state.streak}</strong></span>
              <span>最高連続 <strong>{state.bestStreak}</strong></span>
            </div>
            <div className="rapid-timer" data-warning={state.remainingMs <= 3000}>
              <div><span>TIME LEFT</span><strong>{(state.remainingMs / 1000).toFixed(1)}</strong><small>秒</small></div>
              <progress value={state.remainingMs} max={limitSeconds * 1000} aria-label={"残り時間 " + (state.remainingMs / 1000).toFixed(1) + "秒"} />
            </div>
            <article className="rapid-question">
              <header><span>{currentQuestion.topicLabel}</span><h2><RichMathText text={currentQuestion.prompt} /></h2></header>
              <div className="rapid-options" role="group" aria-label="答えを選択">
                {currentQuestion.options.map((option) => {
                  const selected = currentResult?.selected === option;
                  const actual = currentQuestion.acceptedOptions.includes(option);
                  const className = state.phase === "feedback"
                    ? selected ? (actual ? "correct" : "wrong") : actual ? "actual" : ""
                    : "";
                  return (
                    <button type="button" key={option} disabled={state.phase !== "playing"} className={className} onClick={() => answer(option)}>
                      {currentQuestion.mathOptions ? <InlineMath tex={option} /> : option}
                    </button>
                  );
                })}
              </div>
            </article>
            {state.phase === "feedback" && currentResult && (
              <aside className={`rapid-feedback ${currentResult.correct ? "correct" : "wrong"}`}>
                <div>
                  <span>{currentResult.correct ? "CORRECT" : currentResult.timedOut ? "TIME UP" : "REVIEW"}</span>
                  <h3>{currentResult.correct ? "正解です。" : "ここを暗記し直しましょう。"}</h3>
                  {!currentResult.correct && <p>正解：{currentQuestion.mathOptions ? <InlineMath tex={currentQuestion.answer} /> : <strong>{currentQuestion.answer}</strong>}</p>}
                </div>
                <p><RichMathText text={currentQuestion.explanation} /></p>
                <div><Link href={currentQuestion.studyHref}>この問題の暗記帳へ</Link><button type="button" onClick={next}>{state.index === state.session.length - 1 ? "結果を見る →" : "次の問題 →"}</button></div>
              </aside>
            )}
          </section>
        )}

        {state.phase === "result" && (
          <section className="rapid-result" aria-labelledby="rapid-result-title">
            <div className="rapid-result-summary">
              <div><span>RESULT</span><h2 id="rapid-result-title">{state.correctCount}<small> / {state.session.length}</small></h2><p>正答率 {Math.round((state.correctCount / state.session.length) * 100)}%</p></div>
              <div><span>BEST STREAK</span><strong>{state.bestStreak}</strong><p>最高連続正解</p></div>
              <div><span>REVIEW</span><strong>{state.session.length - state.correctCount}</strong><p>復習する問題</p></div>
              <button type="button" onClick={restart}>設定へ戻る</button>
            </div>
            <p className="rapid-publish-status">
              {publishState === "saved" ? "匿名ランキングへ自己ベストを登録しました。" :
                publishState === "sign-in-required" ? "端末内に保存しました。ログインすると匿名ランキングへ参加できます。" :
                  publishState === "unavailable" ? "端末内に保存しました。ランキング登録は後で再挑戦できます。" : "成績を保存中…"}
            </p>
            <div className="rapid-review-heading"><span>FULL REVIEW</span><h3>全問題の振り返り</h3><p>見出しを開くと、あなたの回答・正解・解説を確認できます。</p></div>
            <div className="rapid-review-list">
              {state.results.map((result, resultIndex) => (
                <details key={result.question.instanceId} className={result.correct ? "correct" : "wrong"} open={!result.correct}>
                  <summary><span>{String(resultIndex + 1).padStart(2, "0")}</span><strong>{result.question.topicLabel}</strong><b>{result.correct ? "○ 正解" : result.timedOut ? "× 時間切れ" : "× 不正解"}</b></summary>
                  <div>
                    <h4><RichMathText text={result.question.prompt} /></h4>
                    <p><span>あなたの回答</span>{result.selected ?? "未回答"}</p>
                    <p><span>正解</span>{result.question.mathOptions ? <InlineMath tex={result.question.answer} /> : <strong>{result.question.answer}</strong>}</p>
                    <aside><span>解説</span><RichMathText text={result.question.explanation} /></aside>
                    <Link href={result.question.studyHref}>{result.correct ? "暗記帳で確認する" : "間違えた問題の暗記帳へ →"}</Link>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {(state.phase === "setup" || state.phase === "result") && (
          <section className="rapid-ranking-grid">
            <section className="rapid-local-ranking" aria-labelledby="rapid-local-ranking-title">
              <div className="rapid-leaderboard-head"><div><span>MY BEST</span><h3 id="rapid-local-ranking-title">自分のベストランキング</h3></div><p>アカウント同期の対象です。</p></div>
              {localRanking.length ? <ol>{localRanking.map((entry, index) => <li key={entry.id}><strong>{index + 1}</strong><span>{entry.correctCount}/{entry.questionCount}</span><small>連続 {entry.bestStreak}</small><time>{(entry.durationMs / 1000).toFixed(1)}秒</time></li>)}</ol> : <p className="rapid-leaderboard-note">この問題数の記録はまだありません。</p>}
            </section>
            <RapidLeaderboard boardKey={boardKey} refreshToken={leaderboardRefresh} />
          </section>
        )}
      </main>
      <footer><span>TEST//GRID</span><p>TIME LIMIT · STREAK · REVIEW</p><span>RAPID 01</span></footer>
    </div>
  );
}
