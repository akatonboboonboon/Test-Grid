"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  GENERATED_PRACTICE_SUBJECTS,
  GENERATED_PRACTICE_TEMPLATE_METADATA,
  generatePracticeQuestion,
  gradeGeneratedPracticeAnswer,
  type GeneratedPracticeGrade,
  type GeneratedPracticeQuestion,
  type GeneratedPracticeSubjectId,
} from "./generated-practice-engine";
import { DisplayMath, RichMathText } from "./statistics-math";

type Props = {
  initialSubject: GeneratedPracticeSubjectId;
};

type PracticeResult = {
  question: GeneratedPracticeQuestion;
  response: string;
  correct: boolean | null;
  feedback: string;
};

type SharedHistoryItem = {
  id: string;
  subjectId: GeneratedPracticeSubjectId;
  subjectName: string;
  templateId: string;
  format: GeneratedPracticeQuestion["format"];
  category: string;
  title: string;
  createdAt: number;
  question: GeneratedPracticeQuestion;
};

type SharedHistoryResponse = {
  items?: SharedHistoryItem[];
  page?: number;
  hasMore?: boolean;
  error?: string;
};

type HistoryGenerationRequest = {
  subjectId: GeneratedPracticeSubjectId;
  seed: string;
  templateId?: string;
};

const MAX_SESSION_QUESTIONS = 100;
const HISTORY_PAGE_SIZE = 12;

const SUBJECT_ACCENTS: Record<GeneratedPracticeSubjectId, string> = {
  "subject-2": "#19c7b4",
  "subject-3": "#ff5c35",
  "subject-4": "#1687ff",
  "subject-6": "#a05cff",
  "subject-7": "#f04f8a",
  "subject-8": "#ef9a20",
};

const FORMAT_LABELS: Record<GeneratedPracticeQuestion["format"], string> = {
  number: "計算・数値入力",
  choice: "選択問題",
  order: "本文一文の並び替え",
  translation: "本文抜粋の和訳",
};

function initialQuestion(subjectId: GeneratedPracticeSubjectId) {
  return generatePracticeQuestion(subjectId, "ui-initial:" + subjectId);
}

function sourceLocation(question: GeneratedPracticeQuestion) {
  const parts: string[] = [];
  if (question.source.chapter) parts.push(question.source.chapter.toUpperCase());
  if (typeof question.source.paragraphIndex === "number") {
    parts.push("第" + (question.source.paragraphIndex + 1) + "段落");
  }
  if (typeof question.source.sentenceIndex === "number") {
    parts.push("第" + (question.source.sentenceIndex + 1) + "文");
  }
  if (question.source.pages?.length) {
    parts.push("p." + question.source.pages.join("・"));
  }
  return parts.join(" / ");
}

function formatHistoryDate(value: number) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function GeneratedPracticeClient({ initialSubject }: Props) {
  const [subjectId, setSubjectId] = useState<GeneratedPracticeSubjectId>(initialSubject);
  const [templateId, setTemplateId] = useState("");
  const [question, setQuestion] = useState<GeneratedPracticeQuestion>(() => initialQuestion(initialSubject));
  const [questionCount, setQuestionCount] = useState(10);
  const [sessionQueue, setSessionQueue] = useState<GeneratedPracticeQuestion[]>([]);
  const [sessionTotal, setSessionTotal] = useState(1);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [sessionResults, setSessionResults] = useState<PracticeResult[]>([]);
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [selectedTokenIndexes, setSelectedTokenIndexes] = useState<number[]>([]);
  const [grade, setGrade] = useState<GeneratedPracticeGrade | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [announcement, setAnnouncement] = useState("解答はまだ表示していません。");
  const [historyItems, setHistoryItems] = useState<SharedHistoryItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"all" | GeneratedPracticeSubjectId>("all");
  const [historyPage, setHistoryPage] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const generationCounter = useRef(0);
  const initialHistorySaveStarted = useRef(false);

  const subject = GENERATED_PRACTICE_SUBJECTS.find((item) => item.id === subjectId)
    ?? GENERATED_PRACTICE_SUBJECTS[0];
  const templates = useMemo(
    () => GENERATED_PRACTICE_TEMPLATE_METADATA.filter((item) => item.subjectId === subjectId),
    [subjectId],
  );
  const orderedResponse = selectedTokenIndexes
    .map((index) => question.tokens?.[index] ?? "")
    .filter(Boolean)
    .join(" ");
  const response = question.format === "choice"
    ? selectedChoice
    : question.format === "order"
      ? orderedResponse
      : typedAnswer;
  const location = sourceLocation(question);
  const pageStyle = {
    "--practice-accent": SUBJECT_ACCENTS[subjectId],
  } as CSSProperties;
  const correctCount = sessionResults.filter((result) => result.correct === true).length;
  const attemptedCount = sessionResults.filter((result) => result.correct !== null).length;

  const loadHistory = useCallback(async (
    page: number,
    replace: boolean,
    filter: "all" | GeneratedPracticeSubjectId,
  ) => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(HISTORY_PAGE_SIZE) });
      if (filter !== "all") params.set("subject", filter);
      const response = await fetch("/api/generated-practice-history?" + params.toString(), { cache: "no-store" });
      const body = await response.json() as SharedHistoryResponse;
      if (!response.ok || !Array.isArray(body.items)) throw new Error(body.error || "HISTORY_READ_FAILED");
      setHistoryItems((current) => replace ? body.items ?? [] : [...current, ...(body.items ?? [])]);
      setHistoryPage(page);
      setHistoryHasMore(Boolean(body.hasMore));
    } catch {
      setHistoryError("共有履歴を読み込めませんでした。問題演習はそのまま利用できます。");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const saveGenerationRequestsToHistory = useCallback(async (requests: HistoryGenerationRequest[]) => {
    try {
      const response = await fetch("/api/generated-practice-history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requests }),
      });
      if (!response.ok) throw new Error("HISTORY_WRITE_FAILED");
      void loadHistory(0, true, historyFilter);
    } catch {
      setHistoryError("問題は生成できましたが、共有履歴への保存に失敗しました。");
    }
  }, [historyFilter, loadHistory]);

  /* The first history read synchronizes this client view with shared D1 state. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void loadHistory(0, true, "all");
  }, [loadHistory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (initialHistorySaveStarted.current) return;
    initialHistorySaveStarted.current = true;
    void saveGenerationRequestsToHistory([{
      subjectId: initialSubject,
      seed: "ui-initial:" + initialSubject,
    }]);
  }, [initialSubject, saveGenerationRequestsToHistory]);

  function resetResponse() {
    setTypedAnswer("");
    setSelectedChoice("");
    setSelectedTokenIndexes([]);
    setGrade(null);
    setRevealed(false);
    setGenerationError("");
  }

  function generateQuestionBatch(
    nextSubject: GeneratedPracticeSubjectId,
    nextTemplate: string,
    count: number,
  ) {
    generationCounter.current += 1;
    const entropy = typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : "fallback:" + String(generationCounter.current);
    const baseSeed = [
      "ui",
      nextSubject,
      nextTemplate || "random",
      entropy,
      String(generationCounter.current),
    ].join(":");
    const requests: HistoryGenerationRequest[] = Array.from({ length: count }, (_, index) => ({
      subjectId: nextSubject,
      seed: baseSeed + ":q" + String(index + 1),
      ...(nextTemplate ? { templateId: nextTemplate } : {}),
    }));
    return {
      questions: requests.map((generationRequest) => generatePracticeQuestion(
        generationRequest.subjectId,
        generationRequest.seed,
        generationRequest.templateId ? { templateId: generationRequest.templateId } : {},
      )),
      requests,
    };
  }

  function startPractice(
    nextSubject = subjectId,
    nextTemplate = templateId,
    requestedCount = questionCount,
  ) {
    const count = Math.min(MAX_SESSION_QUESTIONS, Math.max(1, Math.trunc(requestedCount) || 1));
    try {
      const generatedBatch = generateQuestionBatch(nextSubject, nextTemplate, count);
      const generated = generatedBatch.questions;
      setQuestion(generated[0]);
      setSessionQueue(generated.slice(1));
      setSessionTotal(generated.length);
      setSessionNumber(1);
      setSessionResults([]);
      setSessionActive(true);
      setSessionComplete(false);
      resetResponse();
      setAnnouncement(generated[0].subjectName + "の連続練習を開始しました。全" + generated.length + "問です。");
      void saveGenerationRequestsToHistory(generatedBatch.requests);
    } catch {
      setGenerationError("安全な解答付き問題を必要数作れませんでした。問題数を減らすか、もう一度開始してください。");
      setAnnouncement("連続練習を生成できませんでした。");
    }
  }

  function changeSubject(nextSubject: GeneratedPracticeSubjectId) {
    if (nextSubject === subjectId) return;
    setSubjectId(nextSubject);
    setTemplateId("");
    startPractice(nextSubject, "", 1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("subject", nextSubject);
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }

  function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (revealed) return;
    if (!response.trim()) {
      setAnnouncement("解答を入力してから採点してください。");
      return;
    }
    const result = gradeGeneratedPracticeAnswer(question, response);
    setGrade(result);
    setRevealed(true);
    setAnnouncement(result.correct
      ? "正解です。模範解答と解説を表示しました。"
      : "不正解です。模範解答と解説を表示しました。");
  }

  function revealAnswer() {
    setGrade(null);
    setRevealed(true);
    setAnnouncement("模範解答と解説を表示しました。");
  }

  function advanceSession() {
    const result: PracticeResult = {
      question,
      response,
      correct: grade?.correct ?? null,
      feedback: grade?.feedback ?? "解答を表示して確認",
    };
    const nextResults = [...sessionResults, result];
    setSessionResults(nextResults);

    if (sessionQueue.length) {
      const [nextQuestion, ...remaining] = sessionQueue;
      setQuestion(nextQuestion);
      setSessionQueue(remaining);
      setSessionNumber((current) => current + 1);
      resetResponse();
      setAnnouncement("次の問題を表示しました。" + (sessionNumber + 1) + "問目 / 全" + sessionTotal + "問です。");
      return;
    }

    setSessionActive(false);
    setSessionComplete(true);
    setAnnouncement("全" + sessionTotal + "問が終了しました。結果と解説一覧を表示しました。");
  }

  function retryHistoryQuestion(historyQuestion: GeneratedPracticeQuestion) {
    setSubjectId(historyQuestion.subjectId);
    setTemplateId(historyQuestion.templateId);
    setQuestion(historyQuestion);
    setSessionQueue([]);
    setSessionTotal(1);
    setSessionNumber(1);
    setSessionResults([]);
    setSessionActive(true);
    setSessionComplete(false);
    resetResponse();
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("subject", historyQuestion.subjectId);
      window.history.replaceState({}, "", url.pathname + url.search);
      document.querySelector(".generated-practice-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setAnnouncement("共有履歴の問題を解き直します。解答はまだ表示していません。");
  }

  function changeHistoryFilter(filter: "all" | GeneratedPracticeSubjectId) {
    setHistoryFilter(filter);
    void loadHistory(0, true, filter);
  }

  function addToken(index: number) {
    if (revealed || selectedTokenIndexes.includes(index)) return;
    setSelectedTokenIndexes((current) => [...current, index]);
  }

  function removeOrderedToken(position: number) {
    if (revealed) return;
    setSelectedTokenIndexes((current) => current.filter((_, index) => index !== position));
  }

  return (
    <div className="app-frame generated-practice-page" style={pageStyle}>
      <header className="topbar generated-practice-topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">G/1</span>
          <span><strong>TEST//GRID</strong><small>ON-DEMAND PRACTICE</small></span>
        </Link>
        <div className="header-actions">
          <span className="generated-practice-header-label">解答付きのみ生成</span>
          <a className="outline-button header-link generated-practice-history-link" href="#generated-history">みんなの生成履歴</a>
          <Link className="outline-button header-link" href={"/subjects/" + subjectId}>この教科へ戻る</Link>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="generated-practice-main">
        <nav className="subject-breadcrumb generated-practice-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">自動生成問題</strong>
        </nav>

        <section className="generated-practice-hero" aria-labelledby="generated-practice-title">
          <div>
            <p><span>ON-DEMAND / 1–100 QUESTIONS</span><span>SOURCE-RANGE GUARDED</span></p>
            <h1 id="generated-practice-title">自動生成問題</h1>
            <p>問題数を1〜100問から設定して連続練習できます。問題・正答・途中式・理由を同じ条件から組み立て、解答のない問題は表示しません。</p>
          </div>
          <aside>
            <span>SEPARATE WORKSPACE</span>
            <strong>プリント問題とは別の連続練習</strong>
            <p>教材範囲に基づく追加演習です。生成された解答付き問題は共有履歴へ保存され、全員が閲覧・解き直しできます。</p>
          </aside>
        </section>

        <section className="generated-practice-subjects" aria-labelledby="generated-subject-title">
          <div className="generated-practice-section-head">
            <div><span>01 / SUBJECT</span><h2 id="generated-subject-title">教科を選ぶ</h2></div>
            <p>生成対象は教材を読み込み済みの6教科だけです。</p>
          </div>
          <div className="generated-practice-subject-tabs" role="tablist" aria-label="自動生成する教科">
            {GENERATED_PRACTICE_SUBJECTS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={subjectId === item.id}
                onClick={() => changeSubject(item.id)}
              >
                <span>{item.id.replace("subject-", "S")}</span>
                <strong>{item.shortName}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="generated-practice-builder" aria-labelledby="generated-builder-title">
          <div className="generated-practice-builder-copy">
            <span>02 / GENERATOR</span>
            <h2 id="generated-builder-title">{subject.name}を連続練習</h2>
            <p>{subject.description}</p>
            <small>出題元：{subject.sourceLabel}</small>
          </div>
          <label className="generated-practice-template-select">
            <span>問題タイプ</span>
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              <option value="">おまかせ（全タイプ）</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
            <small>指定したタイプだけで連続出題できます</small>
          </label>
          <label className="generated-practice-count-select">
            <span>問題数</span>
            <span className="generated-practice-count-input">
              <input
                type="number"
                min="1"
                max={MAX_SESSION_QUESTIONS}
                step="1"
                inputMode="numeric"
                value={questionCount}
                onChange={(event) => setQuestionCount(Math.min(
                  MAX_SESSION_QUESTIONS,
                  Math.max(1, Number(event.target.value) || 1),
                ))}
                aria-label="連続出題する問題数"
              />
              <b>問</b>
            </span>
            <small>1〜100問。1問なら「今すぐ1問作る」と同じです</small>
          </label>
          <button className="generated-practice-generate" type="button" onClick={() => startPractice()}>
            <span>START PRACTICE</span>
            {questionCount}問の練習を始める
          </button>
        </section>

        {generationError && <p className="generated-practice-error" role="alert">{generationError}</p>}

        <section className="generated-practice-workspace" aria-labelledby="generated-question-title">
          <header className="generated-practice-question-meta">
            <div>
              <span>{FORMAT_LABELS[question.format]}</span>
              <strong>{question.category}</strong>
            </div>
            <div className="generated-practice-progress" aria-label={"全" + sessionTotal + "問中" + sessionNumber + "問目"}>
              <span>PROGRESS</span>
              <strong>{sessionNumber}<small> / {sessionTotal}</small></strong>
            </div>
            <small>{question.id}</small>
          </header>

          <article className="generated-practice-question">
            <span>QUESTION</span>
            <h2 id="generated-question-title">{question.title}</h2>
            {question.context && <p className="generated-practice-context"><RichMathText text={question.context} /></p>}
            <div className="generated-practice-prompt"><RichMathText text={question.prompt} /></div>
            {question.formula && (
              <details className="generated-practice-formula">
                <summary>使う公式をヒントとして見る</summary>
                {question.expandedFormula && <strong>Σを使う書き方</strong>}
                <DisplayMath tex={question.formula} />
                {question.expandedFormula && (
                  <>
                    <strong>Σなしで書くと</strong>
                    <DisplayMath tex={question.expandedFormula} />
                  </>
                )}
              </details>
            )}
          </article>

          <aside className="generated-practice-source">
            <span>SOURCE</span>
            <strong>{question.source.label}</strong>
            {location && <small>{location}</small>}
            <p>この範囲情報から生成。正答と出典抜粋は解答表示後に確認できます。</p>
          </aside>

          <form className="generated-practice-answer-form" onSubmit={submitAnswer}>
            <div className="generated-practice-answer-head">
              <div><span>YOUR ANSWER</span><h3>解答する</h3></div>
              {question.evaluation.type === "numeric" && (
                <p>{question.evaluation.requireUnit
                  ? "単位必須" + (question.evaluation.expectedUnit ? "（" + question.evaluation.expectedUnit + "）" : "")
                  : "数値を入力"}</p>
              )}
              {question.format === "translation" && <p>模範訳との完全一致ではなく、要点・ニュアンスで採点</p>}
            </div>

            {question.format === "choice" && (
              <div className="generated-practice-choices" role="radiogroup" aria-label="選択肢">
                {(question.options ?? []).map((option, index) => (
                  <button
                    key={option + "-" + index}
                    type="button"
                    role="radio"
                    aria-checked={selectedChoice === option}
                    disabled={revealed}
                    onClick={() => setSelectedChoice(option)}
                  >
                    <b>{String.fromCharCode(65 + index)}</b>
                    <RichMathText text={option} />
                  </button>
                ))}
              </div>
            )}

            {question.format === "order" && (
              <div className="generated-practice-order">
                <div className="generated-practice-order-built" aria-label="現在の並び順">
                  {selectedTokenIndexes.length ? selectedTokenIndexes.map((tokenIndex, position) => (
                    <button key={tokenIndex + "-" + position} type="button" disabled={revealed} onClick={() => removeOrderedToken(position)}>
                      <span>{position + 1}</span>{question.tokens?.[tokenIndex]}
                    </button>
                  )) : <p>下の語句を順番にタップしてください。</p>}
                </div>
                <div className="generated-practice-order-pool" aria-label="並び替える語句">
                  {(question.tokens ?? []).map((token, index) => (
                    <button
                      key={token + "-" + index}
                      type="button"
                      disabled={revealed || selectedTokenIndexes.includes(index)}
                      onClick={() => addToken(index)}
                    >
                      {token}
                    </button>
                  ))}
                </div>
                <button className="generated-practice-order-reset" type="button" disabled={revealed} onClick={() => setSelectedTokenIndexes([])}>並び順をリセット</button>
              </div>
            )}

            {question.format === "translation" && (
              <textarea
                rows={5}
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                readOnly={revealed}
                placeholder="自然な日本語で入力"
                aria-label="和訳の解答"
              />
            )}

            {question.format === "number" && (
              <input
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                readOnly={revealed}
                placeholder={question.evaluation.type === "numeric" && question.evaluation.expectedUnit
                  ? "例：12.3 " + question.evaluation.expectedUnit
                  : "数値を入力"}
                inputMode="decimal"
                autoComplete="off"
                aria-label="計算問題の解答"
              />
            )}

            <div className="generated-practice-answer-actions">
              <button type="submit" disabled={revealed}>採点する →</button>
              <button type="button" onClick={revealAnswer} disabled={revealed}>解答だけを見る</button>
            </div>
          </form>

          <p className="sr-only" aria-live="polite">{announcement}</p>

          {revealed && (
            <section className="generated-practice-solution" aria-labelledby="generated-solution-title">
              {grade && (
                <div className={"generated-practice-grade " + (grade.correct ? "is-correct" : "is-wrong")}>
                  <strong>{grade.correct ? "正解" : "もう一歩"}</strong>
                  <p>{grade.feedback}</p>
                  <small>あなたの解答：<RichMathText text={response} /></small>
                </div>
              )}

              <div className="generated-practice-solution-answer">
                <span>COMPLETE ANSWER</span>
                <h2 id="generated-solution-title">模範解答</h2>
                <div><RichMathText text={question.answer} /></div>
              </div>

              {question.subjectId === "subject-2" && question.source.excerpt && (
                <div className="generated-practice-excerpt">
                  <span>本文の参照箇所</span>
                  <blockquote><RichMathText text={question.source.excerpt} /></blockquote>
                  <small>{question.source.passageTitle} / {location}</small>
                </div>
              )}

              <div className="generated-practice-reason-grid">
                <article>
                  <span>WHY THIS ANSWER</span>
                  <h3>答えになる理由</h3>
                  <p><RichMathText text={question.reason} /></p>
                </article>
                <article>
                  <span>EXPLANATION</span>
                  <h3>解説</h3>
                  <p><RichMathText text={question.explanation} /></p>
                </article>
              </div>

              <div className="generated-practice-steps">
                <span>STEPS</span>
                <h3>{question.format === "number" ? "途中式・解法" : "確認手順"}</h3>
                <ol>
                  {question.steps.map((step, index) => (
                    <li key={question.id + "-step-" + index}><RichMathText text={step} /></li>
                  ))}
                </ol>
              </div>

              <div className="generated-practice-next">
                {sessionActive && (
                  <button type="button" onClick={advanceSession}>
                    {sessionQueue.length ? "解説を確認して次の問題へ →" : "この練習の結果を見る →"}
                  </button>
                )}
                <Link href={"/subjects/" + subjectId}>プリント問題へ戻る</Link>
              </div>
            </section>
          )}
        </section>

        {sessionComplete && (
          <section className="generated-practice-session-result" aria-labelledby="generated-session-result-title">
            <div className="generated-practice-section-head">
              <div><span>03 / RESULT</span><h2 id="generated-session-result-title">連続練習の結果</h2></div>
              <p>採点した問題は正誤を集計し、「解答だけを見る」は確認扱いで残します。</p>
            </div>
            <div className="generated-practice-result-summary">
              <div><span>正解</span><strong>{correctCount}<small>問</small></strong></div>
              <div><span>採点済み</span><strong>{attemptedCount}<small> / {sessionTotal}</small></strong></div>
              <div><span>確認のみ</span><strong>{sessionResults.length - attemptedCount}<small>問</small></strong></div>
            </div>
            <ol className="generated-practice-result-list">
              {sessionResults.map((result, index) => (
                <li key={result.question.id + "-result-" + index}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")} / {result.question.subjectName}</span>
                    <strong>{result.question.title}</strong>
                    <b className={result.correct === true ? "is-correct" : result.correct === false ? "is-wrong" : "is-review"}>
                      {result.correct === true ? "正解" : result.correct === false ? "不正解" : "確認"}
                    </b>
                  </div>
                  <p><RichMathText text={result.question.prompt} /></p>
                  <details>
                    <summary>模範解答と解説を振り返る</summary>
                    <h3>模範解答</h3>
                    <p><RichMathText text={result.question.answer} /></p>
                    <h3>解説</h3>
                    <p><RichMathText text={result.question.explanation} /></p>
                    <small>{result.feedback}</small>
                  </details>
                </li>
              ))}
            </ol>
            <button className="generated-practice-restart" type="button" onClick={() => startPractice()}>
              同じ条件で{questionCount}問に再挑戦
            </button>
          </section>
        )}

        <section id="generated-history" className="generated-practice-history" aria-labelledby="generated-history-title">
          <div className="generated-practice-section-head">
            <div><span>04 / SHARED HISTORY</span><h2 id="generated-history-title">みんなの生成履歴</h2></div>
            <p>このページで生成された解答付き問題を全員で共有。問題を開いて、そのまま解き直せます。</p>
          </div>
          <div className="generated-practice-history-tools">
            <label>
              <span>教科で絞り込む</span>
              <select
                value={historyFilter}
                onChange={(event) => changeHistoryFilter(event.target.value as "all" | GeneratedPracticeSubjectId)}
              >
                <option value="all">全教科</option>
                {GENERATED_PRACTICE_SUBJECTS.map((item) => (
                  <option key={"history-" + item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => loadHistory(0, true, historyFilter)} disabled={historyLoading}>
              {historyLoading ? "更新中…" : "最新の履歴に更新"}
            </button>
          </div>

          {historyError && <p className="generated-practice-history-status is-error" role="alert">{historyError}</p>}
          {!historyLoading && !historyError && historyItems.length === 0 && (
            <p className="generated-practice-history-status">まだ共有履歴はありません。最初の問題を生成してみましょう。</p>
          )}

          <div className="generated-practice-history-grid" aria-live="polite">
            {historyItems.map((item) => (
              <article key={item.id}>
                <header>
                  <span>{item.subjectName} / {FORMAT_LABELS[item.format]}</span>
                  <time dateTime={new Date(item.createdAt).toISOString()}>{formatHistoryDate(item.createdAt)}</time>
                </header>
                <h3>{item.title}</h3>
                <small>{item.category}</small>
                <div className="generated-practice-history-prompt"><RichMathText text={item.question.prompt} /></div>
                <details>
                  <summary>問題・解答・解説を見る</summary>
                  {item.question.context && <p><RichMathText text={item.question.context} /></p>}
                  <h4>模範解答</h4>
                  <p><RichMathText text={item.question.answer} /></p>
                  <h4>答えになる理由</h4>
                  <p><RichMathText text={item.question.reason} /></p>
                  <h4>解説</h4>
                  <p><RichMathText text={item.question.explanation} /></p>
                </details>
                <button type="button" onClick={() => retryHistoryQuestion(item.question)}>この問題を解き直す →</button>
              </article>
            ))}
          </div>

          {historyHasMore && (
            <button
              className="generated-practice-history-more"
              type="button"
              disabled={historyLoading}
              onClick={() => loadHistory(historyPage + 1, false, historyFilter)}
            >
              {historyLoading ? "読み込み中…" : "さらに古い履歴を表示"}
            </button>
          )}
        </section>
      </main>

      <footer><span>TEST//GRID</span><p>SOLVED · SOURCE-GUARDED · SHARED HISTORY</p><span>G/1</span></footer>
    </div>
  );
}
