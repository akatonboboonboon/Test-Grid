"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ENGLISH_PASSAGES,
  ENGLISH_QUESTIONS,
  ENGLISH_UNITS,
  ENGLISH_VOCAB,
  type EnglishQuestion,
  type EnglishVocabCard,
} from "../../english-data";

type Mode = "cards" | "test" | "reading" | "guide";
type TestPhase = "setup" | "active" | "result";
type CardState = "learning" | "mastered";
type CardProgress = Record<string, CardState>;
type OrderToken = { id: string; text: string };
type TestResult = {
  question: EnglishQuestion;
  response: string;
  correct: boolean;
};

const ALL_UNITS = "all";
const VOCAB_PROGRESS_KEY = "test-grid:english-memory:v1";

function randomize<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCorrectAnswer(question: EnglishQuestion, response: string) {
  const normalized = normalizeAnswer(response);
  return [question.answer, ...(question.accepted ?? [])]
    .some((answer) => normalizeAnswer(answer) === normalized);
}

function restoreCardProgress(): CardProgress {
  try {
    const raw = window.localStorage.getItem(VOCAB_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const knownIds = new Set(ENGLISH_VOCAB.map((card) => card.id));
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([id, state]) => knownIds.has(id) && (state === "learning" || state === "mastered"),
      ),
    ) as CardProgress;
  } catch {
    return {};
  }
}

function unitLabel(unitId: string) {
  return ENGLISH_UNITS.find((unit) => unit.id === unitId)?.shortTitle ?? unitId;
}

function formatLabel(format: EnglishQuestion["format"]) {
  if (format === "choice") return "選択";
  if (format === "order") return "語順整序";
  return "入力";
}

export default function EnglishSubjectPage() {
  const [mode, setMode] = useState<Mode>("cards");
  const [announcement, setAnnouncement] = useState("");
  const workspaceRef = useRef<HTMLElement>(null);

  const [cardProgress, setCardProgress] = useState<CardProgress>({});
  const [progressReady, setProgressReady] = useState(false);
  const [cardUnit, setCardUnit] = useState(ALL_UNITS);
  const [cardDeck, setCardDeck] = useState<EnglishVocabCard[]>([...ENGLISH_VOCAB]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  const [testUnit, setTestUnit] = useState(ALL_UNITS);
  const [questionCountDraft, setQuestionCountDraft] = useState("10");
  const [testPhase, setTestPhase] = useState<TestPhase>("setup");
  const [testQuestions, setTestQuestions] = useState<EnglishQuestion[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [orderRemaining, setOrderRemaining] = useState<OrderToken[]>([]);
  const [orderSelected, setOrderSelected] = useState<OrderToken[]>([]);
  const [feedback, setFeedback] = useState<{ response: string; correct: boolean } | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const [selectedPassageId, setSelectedPassageId] = useState(ENGLISH_PASSAGES[0]?.id ?? "");
  const [showTranslations, setShowTranslations] = useState(false);

  /* Device-local progress is restored after the client mounts. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCardProgress(restoreCardProgress());
    setProgressReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!progressReady) return;
    try {
      window.localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(cardProgress));
    } catch {
      // The drill still works when storage is unavailable.
    }
  }, [cardProgress, progressReady]);

  const filteredVocab = useMemo(
    () => ENGLISH_VOCAB.filter((card) => cardUnit === ALL_UNITS || card.unit === cardUnit),
    [cardUnit],
  );
  const masteredTotal = ENGLISH_VOCAB.filter((card) => cardProgress[card.id] === "mastered").length;
  const learningTotal = ENGLISH_VOCAB.filter((card) => cardProgress[card.id] === "learning").length;
  const cardMastered = filteredVocab.filter((card) => cardProgress[card.id] === "mastered").length;
  const cardCompletion = filteredVocab.length ? Math.round((cardMastered / filteredVocab.length) * 100) : 0;
  const currentCard = cardDeck[cardIndex];

  const availableQuestions = useMemo(
    () => ENGLISH_QUESTIONS.filter((question) => testUnit === ALL_UNITS || question.unit === testUnit),
    [testUnit],
  );
  const currentQuestion = testQuestions[testIndex];
  const questionPassage = currentQuestion?.passageId
    ? ENGLISH_PASSAGES.find((passage) => passage.id === currentQuestion.passageId)
    : undefined;
  const currentResponse = currentQuestion?.format === "choice"
    ? selectedChoice
    : currentQuestion?.format === "order"
      ? orderSelected.map((token) => token.text).join(" ")
      : typedAnswer;
  const canSubmit = Boolean(currentResponse.trim()) && !feedback;
  const testScore = testResults.filter((result) => result.correct).length;

  const selectedPassage = ENGLISH_PASSAGES.find((passage) => passage.id === selectedPassageId)
    ?? ENGLISH_PASSAGES[0];

  function openCards() {
    setMode("cards");
    window.setTimeout(() => workspaceRef.current?.scrollIntoView({ block: "start" }), 0);
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    if (nextMode === "test" && testPhase === "result") setTestPhase("setup");
  }

  function changeCardUnit(nextUnit: string) {
    const source = ENGLISH_VOCAB.filter((card) => nextUnit === ALL_UNITS || card.unit === nextUnit);
    setCardUnit(nextUnit);
    setCardDeck([...source]);
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement(`${nextUnit === ALL_UNITS ? "全単元" : unitLabel(nextUnit)}の暗記帳を開きました。`);
  }

  function moveCard(delta: number) {
    if (!cardDeck.length) return;
    setCardIndex((index) => (index + delta + cardDeck.length) % cardDeck.length);
    setCardFlipped(false);
  }

  function markCard(state: CardState) {
    if (!currentCard) return;
    setCardProgress((progress) => ({ ...progress, [currentCard.id]: state }));
    setAnnouncement(`${currentCard.ja}を「${state === "mastered" ? "覚えた" : "未暗記"}」にしました。`);
    moveCard(1);
  }

  function shuffleCards() {
    setCardDeck(randomize(filteredVocab));
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement("暗記帳をシャッフルしました。");
  }

  function reviewUnmastered() {
    const remaining = filteredVocab.filter((card) => cardProgress[card.id] !== "mastered");
    setCardDeck(randomize(remaining.length ? remaining : filteredVocab));
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement(remaining.length ? `未暗記の${remaining.length}枚に絞りました。` : "全カードをもう一周します。");
  }

  function buildOrderTokens(question: EnglishQuestion) {
    const source = question.tokens?.length ? question.tokens : question.answer.split(/\s+/);
    return randomize(source.map((text, index) => ({ id: `${question.id}-${index}`, text })));
  }

  function prepareQuestion(question: EnglishQuestion) {
    setTypedAnswer("");
    setSelectedChoice("");
    setOrderSelected([]);
    setOrderRemaining(question.format === "order" ? buildOrderTokens(question) : []);
    setFeedback(null);
  }

  function startTest() {
    if (!availableQuestions.length) return;
    const requested = Number(questionCountDraft);
    const safeCount = Number.isFinite(requested)
      ? Math.max(1, Math.min(availableQuestions.length, Math.floor(requested)))
      : Math.min(10, availableQuestions.length);
    const questions = randomize(availableQuestions).slice(0, safeCount);
    setQuestionCountDraft(String(safeCount));
    setTestQuestions(questions);
    setTestIndex(0);
    setTestResults([]);
    prepareQuestion(questions[0]);
    setTestPhase("active");
    setAnnouncement(`${safeCount}問の模擬テストを開始しました。`);
  }

  function submitTestAnswer(event: React.FormEvent) {
    event.preventDefault();
    if (!currentQuestion || !canSubmit) return;
    const response = currentResponse.trim();
    const correct = isCorrectAnswer(currentQuestion, response);
    setFeedback({ response, correct });
    setTestResults((results) => [...results, { question: currentQuestion, response, correct }]);
    setAnnouncement(correct ? "正解です。" : `不正解です。正解は${currentQuestion.answer}です。`);
  }

  function nextTestQuestion() {
    if (!currentQuestion || !feedback) return;
    if (testIndex >= testQuestions.length - 1) {
      setTestPhase("result");
      setFeedback(null);
      return;
    }
    const nextIndex = testIndex + 1;
    setTestIndex(nextIndex);
    prepareQuestion(testQuestions[nextIndex]);
  }

  function resetOrder() {
    if (!currentQuestion || currentQuestion.format !== "order") return;
    setOrderSelected([]);
    setOrderRemaining(buildOrderTokens(currentQuestion));
  }

  function chooseOrderToken(token: OrderToken) {
    if (feedback) return;
    setOrderRemaining((tokens) => tokens.filter((item) => item.id !== token.id));
    setOrderSelected((tokens) => [...tokens, token]);
  }

  function removeOrderToken(token: OrderToken) {
    if (feedback) return;
    setOrderSelected((tokens) => tokens.filter((item) => item.id !== token.id));
    setOrderRemaining((tokens) => [...tokens, token]);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (mode !== "cards" || !currentCard) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button, a")) return;
      if (event.code === "Space") {
        event.preventDefault();
        setCardFlipped((flipped) => !flipped);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveCard(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveCard(1);
      } else if (cardFlipped && event.key === "1") {
        markCard("learning");
      } else if (cardFlipped && event.key === "2") {
        markCard("mastered");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const pageStyle = { "--subject-accent": "#c7ff5e" } as CSSProperties;

  return (
    <div className="app-frame generic-subject-page english-page" style={pageStyle}>
      <header className="topbar english-header">
        <Link className="brand english-brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">E/J</span>
          <span><strong>TEST//GRID</strong><small>ENGLISH EXAM LAB</small></span>
        </Link>
        <div className="header-actions english-header-actions">
          <button className="english-header-memory-button" type="button" onClick={openCards}>
            <span>最重要</span> 暗記帳を開く
          </button>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="generic-subject-main english-main">
        <nav className="subject-breadcrumb english-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">英語</strong>
        </nav>

        <section className="generic-subject-hero english-hero" aria-labelledby="english-title">
          <div className="english-hero-copy">
            <p><span>SUBJECT 01</span><span>EXAM-STYLE PRACTICE</span></p>
            <h1 id="english-title">英語</h1>
            <small>語順整序・穴埋め・選択問題・長文読解を、試験プリントと同じ考え方で反復します。</small>
          </div>
          <button className="english-hero-memory-button" type="button" onClick={openCards}>
            <span>VOCABULARY FIRST</span>
            <strong>暗記帳を開く</strong>
            <small>日本語を見て英語を答える →</small>
          </button>
        </section>

        <section className="english-summary" aria-label="収録教材">
          <div><span>VOCAB</span><strong>{ENGLISH_VOCAB.length}</strong><small>語</small></div>
          <div><span>QUESTIONS</span><strong>{ENGLISH_QUESTIONS.length}</strong><small>問</small></div>
          <div><span>PASSAGES</span><strong>{ENGLISH_PASSAGES.length}</strong><small>本</small></div>
          <p>試験形式とChapter 15・16・18・19を収録。暗記状況はこの端末に自動保存されます。覚えた {masteredTotal}語／復習 {learningTotal}語。</p>
        </section>

        <section ref={workspaceRef} id="english-workspace" className="english-workspace">
          <div className="workspace-tabs english-tabs" role="tablist" aria-label="英語の学習モード">
            <button type="button" role="tab" aria-selected={mode === "cards"} className={mode === "cards" ? "active english-tab-memory" : "english-tab-memory"} onClick={() => changeMode("cards")}>① 暗記帳</button>
            <button type="button" role="tab" aria-selected={mode === "test"} className={mode === "test" ? "active" : ""} onClick={() => changeMode("test")}>② 模擬テスト</button>
            <button type="button" role="tab" aria-selected={mode === "reading"} className={mode === "reading" ? "active" : ""} onClick={() => changeMode("reading")}>③ 長文読解</button>
            <button type="button" role="tab" aria-selected={mode === "guide"} className={mode === "guide" ? "active" : ""} onClick={() => changeMode("guide")}>④ 出題形式</button>
          </div>

          {mode === "cards" && (
            <section className="generic-card-workspace english-card-workspace" aria-labelledby="english-card-title">
              <div className="english-panel-heading">
                <div><span>MEMORY BOOK</span><h2 id="english-card-title">日本語 → 英語 暗記帳</h2></div>
                <label className="english-unit-select"><span>単元</span><select value={cardUnit} onChange={(event) => changeCardUnit(event.target.value)}><option value={ALL_UNITS}>全単元</option>{ENGLISH_UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.shortTitle}</option>)}</select></label>
              </div>

              <div className="generic-progress english-card-progress">
                <div><span>覚えた {cardMastered} / {filteredVocab.length}</span><strong>{cardCompletion}%</strong></div>
                <progress value={cardCompletion} max="100" aria-label={`暗記進捗 ${cardCompletion}%`} />
              </div>

              {currentCard ? (
                <>
                  <div className="generic-deck-meta english-deck-meta"><span>CARD {cardIndex + 1} / {cardDeck.length}</span><span>{unitLabel(currentCard.unit)} · {cardProgress[currentCard.id] === "mastered" ? "覚えた" : cardProgress[currentCard.id] === "learning" ? "未暗記" : "未判定"}</span></div>
                  <button type="button" className={`generic-flip-card english-flip-card ${cardFlipped ? "is-flipped" : ""}`} onClick={() => setCardFlipped((flipped) => !flipped)} aria-label={cardFlipped ? "日本語面に戻る" : "英語の答えを見る"}>
                    <span>{cardFlipped ? "ENGLISH ANSWER" : "JAPANESE PROMPT"}</span>
                    <strong>{cardFlipped ? currentCard.en : currentCard.ja}</strong>
                    {cardFlipped && currentCard.note ? <small>{currentCard.note}</small> : <small>{cardFlipped ? "覚えていたか判定してください" : "英語を声に出してから、タップして確認"}</small>}
                  </button>
                  <div className="generic-card-controls english-card-controls">
                    <button type="button" onClick={() => moveCard(-1)} aria-label="前のカード">← 前へ</button>
                    <button type="button" className="again" disabled={!cardFlipped} onClick={() => markCard("learning")}>1　未暗記</button>
                    <button type="button" className="mastered" disabled={!cardFlipped} onClick={() => markCard("mastered")}>2　覚えた</button>
                    <button type="button" onClick={() => moveCard(1)} aria-label="次のカード">次へ →</button>
                  </div>
                  <div className="generic-deck-tools english-deck-tools"><button type="button" onClick={shuffleCards}>シャッフル</button><button type="button" onClick={reviewUnmastered}>未暗記だけ復習</button></div>
                  <p className="memory-hint english-memory-hint"><kbd>SPACE</kbd> 反転 · <kbd>←</kbd><kbd>→</kbd> 移動 · 裏面で <kbd>1</kbd>/<kbd>2</kbd></p>
                </>
              ) : (
                <div className="generic-empty english-empty"><span>ALL MASTERED</span><h3>この条件の未暗記カードはありません。</h3><button type="button" onClick={() => { setCardDeck([...filteredVocab]); setCardIndex(0); }}>全カードを表示</button></div>
              )}
            </section>
          )}

          {mode === "test" && (
            <section className="generic-test-workspace english-test-workspace" aria-labelledby="english-test-title">
              {testPhase === "setup" && (
                <div className="english-test-setup">
                  <div className="english-panel-heading"><div><span>MOCK EXAM</span><h2 id="english-test-title">模擬テストを作る</h2></div><p>選んだ単元から、入力・選択・語順整序を混ぜてランダムに出題します。</p></div>
                  <div className="english-test-settings">
                    <label><span>出題単元</span><select value={testUnit} onChange={(event) => setTestUnit(event.target.value)}><option value={ALL_UNITS}>全単元</option>{ENGLISH_UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}</select></label>
                    <label><span>問題数 <small>最大 {availableQuestions.length}問</small></span><input type="number" min="1" max={Math.max(1, availableQuestions.length)} inputMode="numeric" value={questionCountDraft} onChange={(event) => setQuestionCountDraft(event.target.value)} /></label>
                    <button type="button" onClick={startTest} disabled={!availableQuestions.length}>ランダム出題を開始 →</button>
                  </div>
                  <div className="english-format-preview"><span>入力</span><span>4択</span><span>語順整序</span><p>{availableQuestions.length}問から作成可能</p></div>
                </div>
              )}

              {testPhase === "active" && currentQuestion && (
                <div className="english-test-active">
                  <div className="generic-deck-meta english-test-meta"><span>QUESTION {testIndex + 1} / {testQuestions.length}</span><span>{unitLabel(currentQuestion.unit)} · {currentQuestion.group} · {formatLabel(currentQuestion.format)}</span></div>
                  {questionPassage && (
                    <details className="english-question-passage">
                      <summary>本文を表示して解く <span>{questionPassage.title}</span></summary>
                      <div>{questionPassage.paragraphs.map((paragraph, index) => <p key={`${questionPassage.id}-test-${index}`}><b>{index + 1}</b>{paragraph.en}</p>)}</div>
                    </details>
                  )}
                  <div className="generic-test-question english-test-question"><span>問題</span><h2>{currentQuestion.prompt}</h2></div>
                  <form className="english-answer-form" onSubmit={submitTestAnswer}>
                    {currentQuestion.format === "input" && <label className="english-input-answer"><span>解答を入力</span><input autoComplete="off" value={typedAnswer} disabled={Boolean(feedback)} onChange={(event) => setTypedAnswer(event.target.value)} placeholder="英語で入力" /></label>}
                    {currentQuestion.format === "choice" && <fieldset className="english-choice-answer" disabled={Boolean(feedback)}><legend>正しいものを1つ選択</legend>{currentQuestion.options?.map((option, index) => <label key={`${currentQuestion.id}-${index}`}><input type="radio" name={`choice-${currentQuestion.id}`} value={option} checked={selectedChoice === option} onChange={(event) => setSelectedChoice(event.target.value)} /><span><b>{String.fromCharCode(65 + index)}</b>{option}</span></label>)}</fieldset>}
                    {currentQuestion.format === "order" && <div className="english-order-answer"><span>チップを正しい順に並べる</span><div className="english-order-line" aria-label="作成中の英文">{orderSelected.length ? orderSelected.map((token) => <button key={token.id} type="button" disabled={Boolean(feedback)} onClick={() => removeOrderToken(token)}>{token.text}</button>) : <small>下の語句を順番に選択</small>}</div><div className="english-order-bank">{orderRemaining.map((token) => <button key={token.id} type="button" disabled={Boolean(feedback)} onClick={() => chooseOrderToken(token)}>{token.text}</button>)}</div>{!feedback && <button className="english-order-reset" type="button" onClick={resetOrder}>並べ直す</button>}</div>}
                    {!feedback && <button className="english-submit-answer" type="submit" disabled={!canSubmit}>採点する →</button>}
                  </form>

                  {feedback && (
                    <div className={`generic-test-answer english-test-feedback ${feedback.correct ? "is-correct" : "is-wrong"}`} aria-live="polite">
                      <strong>{feedback.correct ? "正解" : "不正解"}</strong>
                      <p><span>あなたの解答</span>{feedback.response}</p>
                      <p><span>正解</span>{currentQuestion.answer}</p>
                      {currentQuestion.explanation && <p><span>解説</span>{currentQuestion.explanation}</p>}
                      <button type="button" onClick={nextTestQuestion}>{testIndex === testQuestions.length - 1 ? "結果を見る" : "次の問題へ →"}</button>
                    </div>
                  )}
                </div>
              )}

              {testPhase === "result" && (
                <div className="english-test-result">
                  <span>MOCK EXAM RESULT</span><h2>{testScore} / {testResults.length}</h2><p>正答率 {testResults.length ? Math.round((testScore / testResults.length) * 100) : 0}%</p>
                  <div className="english-result-list">{testResults.map((result, index) => <article key={`${result.question.id}-${index}`} className={result.correct ? "is-correct" : "is-wrong"}><span>{result.correct ? "○" : "×"} Q{index + 1}</span><strong>{result.question.prompt}</strong><p>あなた：{result.response || "未回答"}</p>{!result.correct && <p>正解：{result.question.answer}</p>}</article>)}</div>
                  <div className="english-result-actions"><button type="button" onClick={startTest}>同じ設定でもう一度</button><button type="button" onClick={() => setTestPhase("setup")}>設定を変える</button></div>
                </div>
              )}
            </section>
          )}

          {mode === "reading" && selectedPassage && (
            <section className="english-reading-workspace" aria-labelledby="english-reading-title">
              <div className="english-panel-heading"><div><span>READING LAB</span><h2 id="english-reading-title">長文読解</h2></div><div className="english-reading-tools"><label><span>単元・長文</span><select value={selectedPassageId} onChange={(event) => setSelectedPassageId(event.target.value)}>{ENGLISH_PASSAGES.map((passage) => <option key={passage.id} value={passage.id}>{unitLabel(passage.unit)}｜{passage.title}</option>)}</select></label><button type="button" aria-pressed={showTranslations} onClick={() => setShowTranslations((visible) => !visible)}>{showTranslations ? "和訳を隠す" : "和訳を表示"}</button></div></div>
              <article className="english-passage"><header><span>{unitLabel(selectedPassage.unit)}</span><h3>{selectedPassage.title}</h3><p>{selectedPassage.titleJa}</p></header><div>{selectedPassage.paragraphs.map((paragraph, index) => <section key={`${selectedPassage.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p lang="en">{paragraph.en}</p>{showTranslations && <p className="english-translation">{paragraph.ja}</p>}</section>)}</div></article>
            </section>
          )}

          {mode === "guide" && (
            <section className="english-guide-workspace" aria-labelledby="english-guide-title">
              <div className="english-panel-heading"><div><span>FORMAT GUIDE</span><h2 id="english-guide-title">出題形式ガイド</h2></div><p>試験で手が止まらないように、形式ごとの解き方を先に固定します。</p></div>
              <div className="english-guide-grid">
                <article><span>01 / INPUT</span><h3>穴埋め・疑問詞</h3><p>日本語と前後の文型を確認し、必要な1語または語句を入力。大文字小文字と句読点は採点時に無視します。</p><strong>例：How long / in which / recognize</strong></article>
                <article><span>02 / CHOICE</span><h3>内容理解・4択</h3><p>選択肢を先に読み、本文の該当箇所と同じ意味のものを選択。本文にない強い表現へ飛びつかない。</p><strong>主語・動作・対象を照合</strong></article>
                <article><span>03 / ORDER</span><h3>語順整序</h3><p>最初に主語と動詞を決め、熟語をひとかたまりにして配置。残った前置詞句を最後に接続します。</p><strong>主語 → 動詞 → 目的語 → 修飾</strong></article>
                <article><span>04 / READING</span><h3>長文読解・要約</h3><p>各段落の主語と動詞を取り、指示語と受動態を確認。最後に要約文へ本文中の語を戻します。</p><strong>和訳は確認時だけ表示</strong></article>
              </div>
              <div className="english-guide-tip"><span>INTERVIEW TIP</span><p><b>Yes / No質問</b>は Yes・No から答え、<b>Wh疑問文</b>は聞かれている情報を直接返す。what / where / why / how long を見分ける。</p></div>
            </section>
          )}
        </section>

        <p className="sr-announcement" aria-live="polite">{announcement}</p>
      </main>

      <footer className="english-footer"><span>TEST//GRID</span><p>ENGLISH · EXAM FORMAT · LOCAL SAVE</p><span>SUBJECT 01</span></footer>
    </div>
  );
}
