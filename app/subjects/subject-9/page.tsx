"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CardFaceList from "../../card-face-list";
import DigitalCircuitExpectedExams from "../../digital-circuits-expected-exams";
import DigitalCircuitStudyDiagram from "../../digital-circuits-extra-diagrams";
import {
  DIGITAL_CIRCUIT_ALL_FORMULAS,
  DIGITAL_CIRCUIT_ALL_QUESTIONS,
  DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS,
  type DigitalCircuitStudyQuestion,
} from "../../digital-circuits-extra-data";
import { generateDigitalCircuitQuestion } from "../../digital-circuits-generator";
import { generateDigitalCircuitExtraQuestion } from "../../digital-circuits-extra-generator";
import {
  DIGITAL_CIRCUIT_EXAM_FORMATS,
  DIGITAL_CIRCUIT_RANGE_PAGES,
  DIGITAL_CIRCUIT_SOURCE_POLICY,
  DIGITAL_CIRCUIT_TOPICS,
  type DigitalCircuitTopicId,
} from "../../digital-circuits-data";
import { DisplayMath, RichMathText } from "../../statistics-math";
import styles from "../../digital-circuits.module.css";

type Mode = "scope" | "cards" | "practice" | "generated" | "test" | "expected" | "guide";
type Feedback = { response: string; correct: boolean };
type TestPhase = "setup" | "active" | "result";
type TestStored = {
  version: 1; ids: string[]; answers: Record<string, string>; index: number;
  remaining: number; duration: number; topics: DigitalCircuitTopicId[]; savedAt: number;
};
const TOPIC_IDS = DIGITAL_CIRCUIT_TOPICS.map((topic) => topic.id);
const PROGRESS_KEY = "test-grid:subject-9:cards:v1";
const TEST_KEY = "test-grid:subject-9:random-test:v1";

function randomize<T>(values: readonly T[]) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}
function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase()
    .replace(/[−–—]/g, "-").replace(/[「」『』【】（）()。、，,.・\s]/g, "");
}
function isCorrect(question: DigitalCircuitStudyQuestion, response: string) {
  const value = normalize(response);
  if (!value) return false;
  if ([question.answer, ...(question.accepted ?? [])].some((answer) => normalize(answer) === value)) return true;
  if (question.format === "choice") return false;
  const words = question.keywords ?? [];
  return words.length > 0 && words.filter((word) => value.includes(normalize(word))).length >= (question.minKeywords ?? words.length);
}
function topicLabel(id: DigitalCircuitTopicId) {
  return DIGITAL_CIRCUIT_TOPICS.find((topic) => topic.id === id)?.shortTitle ?? id;
}
function formatTime(seconds: number) {
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}
function fuzzyMatch(haystack: string, needle: string) {
  const text = normalize(haystack);
  const query = normalize(needle);
  if (!query) return true;
  if (text.includes(query)) return true;
  let cursor = 0;
  for (const char of query) {
    cursor = text.indexOf(char, cursor);
    if (cursor < 0) return false;
    cursor += 1;
  }
  return true;
}

function readProgress(): Record<string, "learning" | "mastered"> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as Record<string, "learning" | "mastered">;
  } catch {
    return {};
  }
}

function readSavedTest(): TestStored | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(TEST_KEY) ?? "null") as TestStored | null;
  } catch {
    return null;
  }
}
function TopicFilter({ selected, onChange, legend }: { selected: DigitalCircuitTopicId[]; onChange: (topics: DigitalCircuitTopicId[]) => void; legend: string }) {
  return (
    <fieldset className={styles.filters}>
      <legend>{legend}（複数選択）</legend>
      <div className={styles.filterActions}><button type="button" onClick={() => onChange([...TOPIC_IDS])}>すべて選択</button><button type="button" onClick={() => onChange([])}>すべて解除</button></div>
      {DIGITAL_CIRCUIT_TOPICS.map((topic) => (
        <label key={topic.id}><input type="checkbox" checked={selected.includes(topic.id)} onChange={() => onChange(selected.includes(topic.id) ? selected.filter((id) => id !== topic.id) : [...selected, topic.id])} />{topic.shortTitle}</label>
      ))}
    </fieldset>
  );
}

function AnswerArea({ question, value, feedback, onChange, onSubmit }: { question: DigitalCircuitStudyQuestion; value: string; feedback: Feedback | null; onChange: (value: string) => void; onSubmit: () => void }) {
  return (
    <div className={styles.answerForm}>
      {question.format === "choice" ? (
        <fieldset className={styles.choices} disabled={Boolean(feedback)}>
          {question.options?.map((option) => <label key={option}><input type="radio" name={question.id} checked={value === option} onChange={() => onChange(option)} /><RichMathText text={option} /></label>)}
        </fieldset>
      ) : (
        <textarea rows={4} value={value} disabled={Boolean(feedback)} onChange={(event) => onChange(event.target.value)} placeholder="状態列・論理式・説明を入力" />
      )}
      {!feedback && <button className={styles.primary} type="button" disabled={!value.trim()} onClick={onSubmit}>採点する</button>}
    </div>
  );
}

function FeedbackPanel({ question, feedback, onNext }: { question: DigitalCircuitStudyQuestion; feedback: Feedback; onNext?: () => void }) {
  return (
    <div className={styles.feedback} data-correct={feedback.correct}>
      <strong>{feedback.correct ? "正解" : "不正解"}</strong>
      <p>あなた：<RichMathText text={feedback.response} /></p>
      <p>解答：<RichMathText text={question.answer} /></p>
      {question.diagram && <div className={styles.diagram}><DigitalCircuitStudyDiagram kind={question.diagram} solution title="模範図・書き込み例" /></div>}
      {question.formula && <DisplayMath tex={question.formula} />}
      <ol>{question.steps.map((step, index) => <li key={index}><RichMathText text={step} /></li>)}</ol>
      <p><b>理由：</b><RichMathText text={question.explanation} /></p>
      <small>出典：{question.sourceRefs.map((source) => source.filename + " p." + source.page).join(" / ")}</small>
      {onNext && <div className={styles.actions}><button type="button" onClick={onNext}>次の問題へ</button></div>}
    </div>
  );
}

export default function DigitalCircuitSubjectPage() {
  const [mode, setMode] = useState<Mode>("scope");
  const [topics, setTopics] = useState<DigitalCircuitTopicId[]>([...TOPIC_IDS]);
  const [cardQuery, setCardQuery] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<Record<string, "learning" | "mastered">>(() => readProgress());
  const [practiceDeck, setPracticeDeck] = useState<DigitalCircuitStudyQuestion[]>([...DIGITAL_CIRCUIT_ALL_QUESTIONS]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<Feedback | null>(null);
  const [generated, setGenerated] = useState<DigitalCircuitStudyQuestion>(() => generateDigitalCircuitQuestion(9));
  const [generatedAnswer, setGeneratedAnswer] = useState("");
  const [generatedFeedback, setGeneratedFeedback] = useState<Feedback | null>(null);
  const [testPhase, setTestPhase] = useState<TestPhase>("setup");
  const [testCount, setTestCount] = useState("20");
  const [testMinutes, setTestMinutes] = useState("15");
  const [testDeck, setTestDeck] = useState<DigitalCircuitStudyQuestion[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testRemaining, setTestRemaining] = useState(15 * 60);
  const [savedTest, setSavedTest] = useState<TestStored | null>(() => readSavedTest());
  const answerRef = useRef(testAnswers);
  const remainingRef = useRef(testRemaining);

  const cards = useMemo(() => DIGITAL_CIRCUIT_ALL_FORMULAS.filter((card) => topics.includes(card.topic)), [topics]);
  const cardCandidates = useMemo(() => DIGITAL_CIRCUIT_ALL_FORMULAS.filter((card) => fuzzyMatch([card.title, card.prompt, card.cue, card.explanation, card.formula].join(" "), cardQuery)).slice(0, 8), [cardQuery]);
  const card = cards[Math.min(cardIndex, Math.max(0, cards.length - 1))];
  const currentPractice = practiceDeck[practiceIndex];
  const currentTest = testDeck[testIndex];
  const testScore = testDeck.filter((question) => isCorrect(question, testAnswers[question.id] ?? "")).length;

  useEffect(() => { answerRef.current = testAnswers; }, [testAnswers]);
  useEffect(() => { remainingRef.current = testRemaining; }, [testRemaining]);
  useEffect(() => {
    if (testPhase !== "active") return;
    const timer = window.setInterval(() => setTestRemaining((value) => {
      if (value <= 1) { setTestPhase("result"); window.localStorage.removeItem(TEST_KEY); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [testPhase]);
  useEffect(() => {
    if (testPhase !== "active" || !testDeck.length) return;
    const timer = window.setInterval(() => {
      const stored: TestStored = { version: 1, ids: testDeck.map((question) => question.id), answers: answerRef.current, index: testIndex, remaining: remainingRef.current, duration: Math.max(60, Number(testMinutes) * 60), topics, savedAt: Date.now() };
      window.localStorage.setItem(TEST_KEY, JSON.stringify(stored));
      setSavedTest(stored);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [testDeck, testIndex, testMinutes, testPhase, topics]);

  function changeMode(next: Mode) {
    setMode(next);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }
  function selectCard(id: string) {
    const found = cards.findIndex((candidate) => candidate.id === id);
    if (found >= 0) { setCardIndex(found); setFlipped(false); }
    else {
      const target = DIGITAL_CIRCUIT_ALL_FORMULAS.find((candidate) => candidate.id === id);
      if (target) { setTopics((current) => current.includes(target.topic) ? current : [...current, target.topic]); window.setTimeout(() => { const index = DIGITAL_CIRCUIT_ALL_FORMULAS.filter((item) => [...topics, target.topic].includes(item.topic)).findIndex((item) => item.id === id); setCardIndex(Math.max(0, index)); }, 0); }
    }
    setCardQuery("");
  }
  function markCard(state: "learning" | "mastered") {
    if (!card) return;
    const next = { ...progress, [card.id]: state };
    setProgress(next);
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    setCardIndex((value) => cards.length ? (value + 1) % cards.length : 0);
    setFlipped(false);
  }
  function refreshPractice() {
    const filtered = DIGITAL_CIRCUIT_ALL_QUESTIONS.filter((question) => topics.includes(question.topic));
    setPracticeDeck(randomize(filtered));
    setPracticeIndex(0); setPracticeAnswer(""); setPracticeFeedback(null);
  }
  function nextPractice() {
    setPracticeIndex((value) => practiceDeck.length ? (value + 1) % practiceDeck.length : 0);
    setPracticeAnswer(""); setPracticeFeedback(null);
  }
  function newGenerated() {
    const seed = Date.now();
    setGenerated(Math.random() < 0.55 ? generateDigitalCircuitQuestion(seed) : generateDigitalCircuitExtraQuestion(seed));
    setGeneratedAnswer(""); setGeneratedFeedback(null);
  }
  function startTest() {
    const pool = DIGITAL_CIRCUIT_ALL_QUESTIONS.filter((question) => topics.includes(question.topic));
    const count = Math.min(pool.length, Math.max(1, Number.parseInt(testCount, 10) || 20));
    const duration = Math.min(180, Math.max(1, Number.parseInt(testMinutes, 10) || 15)) * 60;
    setTestDeck(randomize(pool).slice(0, count)); setTestIndex(0); setTestAnswers({}); setTestRemaining(duration); setTestPhase("active");
    window.localStorage.removeItem(TEST_KEY);
  }
  function pauseTest() {
    const stored: TestStored = { version: 1, ids: testDeck.map((question) => question.id), answers: testAnswers, index: testIndex, remaining: testRemaining, duration: Math.max(60, Number(testMinutes) * 60), topics, savedAt: Date.now() };
    window.localStorage.setItem(TEST_KEY, JSON.stringify(stored)); setSavedTest(stored); setTestPhase("setup");
  }
  function resumeTest() {
    if (!savedTest) return;
    const deck = savedTest.ids.map((id) => DIGITAL_CIRCUIT_ALL_QUESTIONS.find((question) => question.id === id)).filter(Boolean) as DigitalCircuitStudyQuestion[];
    if (!deck.length) return;
    setTopics(savedTest.topics); setTestDeck(deck); setTestAnswers(savedTest.answers); setTestIndex(Math.min(savedTest.index, deck.length - 1)); setTestRemaining(savedTest.remaining); setTestPhase("active");
  }
  function finishTest() {
    setTestPhase("result"); window.localStorage.removeItem(TEST_KEY); setSavedTest(null);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.back} href="/">← 9教科ホーム</Link>
        <span className={styles.brand}>TEST//GRID · SUBJECT 09</span>
        <nav><Link className={styles.rapidLink} href="/foundations?subject=subject-9">基礎情報一覧</Link><Link className={styles.rapidLink} href="/generated-practice?subject=subject-9">自動生成問題</Link><Link className={styles.rapidLink} href="/rapid/subject-9">⚡ 時間制限ドリル（練習）</Link><Link className={styles.rapidLink} href="/ranking/subject-9">公式ランキングテスト</Link></nav>
      </header>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroIntro}><span className={styles.eyebrow}>DIGITAL CIRCUITS / 08.03</span><h1>デジタル回路<small>波形 → 状態表 → 状態図 → 回路</small></h1><p>範囲ZIP 10枚と、内容確認でデジタル回路と判明した追加PDF 7ページだけで構成。図を見ながら答え、解答後は同じ図へ模範波形・状態遷移を重ねます。</p></div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>{DIGITAL_CIRCUIT_ALL_FORMULAS.length}</strong><span>暗記カード</span></div>
            <div className={styles.stat}><strong>{DIGITAL_CIRCUIT_ALL_QUESTIONS.length}</strong><span>通常演習</span></div>
            <div className={styles.stat}><strong>6</strong><span>A4予想試験</span></div>
            <div className={styles.stat}><strong>50分</strong><span>練習初期値 / 100点換算・目標60</span></div>
          </div>
        </section>
        <nav className={styles.tabs} aria-label="学習モード">
          {([
            ["scope", "範囲"], ["cards", "暗記帳"], ["practice", "通常演習"], ["generated", "その場で生成"],
            ["test", "ランダム模試"], ["expected", "A4予想試験"], ["guide", "形式ガイド"],
          ] as Array<[Mode, string]>).map(([id, label]) => <button key={id} type="button" data-active={mode === id} onClick={() => changeMode(id)}>{label}</button>)}
        </nav>

        {mode === "scope" && (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.eyebrow}>CURRENT SCOPE</span><h2>今回の試験範囲</h2></div><p>形式だけの資料と現行範囲を分離済みです。重複するJK・カウンタ・状態遷移は1つの理解項目へ統合しました。</p></div>
            <div className={styles.topicGrid}>{DIGITAL_CIRCUIT_TOPICS.map((topic) => <article key={topic.id} className={styles.topicCard} style={{ "--topic": topic.color } as React.CSSProperties}><span>{topic.number} / P.{topic.pages.join("・")}</span><h3>{topic.title}</h3><p>{topic.description}</p></article>)}</div>
            <div className={styles.sourceNotice}><b>現行範囲：</b>範囲ZIP {DIGITAL_CIRCUIT_RANGE_PAGES.length}枚 ＋ 追加PDF {DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS.reduce((sum, file) => sum + file.pages, 0)}ページ。<br /><b>形式のみ：</b>{DIGITAL_CIRCUIT_SOURCE_POLICY.excludedFormatOnlyTopics.join("・")}。これらは形式ZIPにしかないため出題内容へ入れていません。</div>
            <div className={styles.actions}><button type="button" onClick={() => changeMode("cards")}>暗記帳へ</button><button type="button" onClick={() => changeMode("practice")}>図付き演習へ</button></div>
          </section>
        )}

        {mode === "cards" && (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.eyebrow}>FLASH CARDS</span><h2>検索できる暗記帳</h2></div><p>表面はすべて同じ色。図も解答前は記入用、裏返した後だけ模範内容を表示します。</p></div>
            <TopicFilter selected={topics} onChange={(value) => { setTopics(value); setCardIndex(0); setFlipped(false); }} legend="カード範囲" />
            <div style={{ position: "relative" }}>
              <input className={styles.select} value={cardQuery} onChange={(event) => setCardQuery(event.target.value)} placeholder="カード名・式・うろ覚え語を検索（例：りっぷる、1001、Q+=D）" />
              {cardQuery && <div className={styles.resultList}>{cardCandidates.map((candidate) => <button className={styles.secondary} type="button" key={candidate.id} onClick={() => selectCard(candidate.id)}>{candidate.title} · {topicLabel(candidate.topic)}</button>)}</div>}
            </div>
            <CardFaceList
              items={cards.map((item) => ({
                id: item.id,
                eyebrow: item.title,
                meta: `${topicLabel(item.topic)} · ${progress[item.id] === "mastered" ? "覚えた" : progress[item.id] === "learning" ? "もう一度" : "未判定"}`,
                front: <div><RichMathText text={item.prompt} />{item.diagram && <small>図付きカード</small>}</div>,
                back: <div><DisplayMath tex={item.formula} ariaLabel={item.title + "の公式"} /><p><RichMathText text={item.cue} /></p></div>,
                explanation: <p><RichMathText text={item.explanation} />{item.example ? <><br /><b>例：</b><RichMathText text={item.example} /></> : null}<br /><small>出典：{item.sourceRefs.map((source) => `${source.filename} p.${source.page}`).join(" / ")}</small></p>,
              }))}
              title="デジタル回路の暗記カード 表・裏一覧"
              description="選択中の範囲について、問題・公式・使いどころ・解説を並べて確認できます。図は「1枚で練習」から表示します。"
              tone="dark"
              onSelect={selectCard}
            />
            {card ? <>
              <div className={styles.cardMeta}><span>CARD {cardIndex + 1} / {cards.length}</span><span>{topicLabel(card.topic)} · {progress[card.id] ?? "未判定"}</span></div>
              <button className={styles.flipCard} type="button" onClick={() => setFlipped((value) => !value)}>
                <span className={styles.eyebrow}>{flipped ? card.title : "QUESTION"}</span>
                {flipped ? <div className={styles.formulaFace}><DisplayMath tex={card.formula} /><p><RichMathText text={card.cue} /></p></div> : <strong><RichMathText text={card.prompt} /></strong>}
                <small>{flipped ? "もう一度押すと問題へ戻ります" : "タップして答え・理由を見る"}</small>
              </button>
              {card.diagram && <div className={styles.diagram}><DigitalCircuitStudyDiagram kind={card.diagram} solution={flipped} title={flipped ? "模範図" : "思い出すための記入用図"} /></div>}
              {flipped && <div className={styles.explanation}><b>なぜ：</b><RichMathText text={card.explanation} />{card.example && <><br /><b>例：</b><RichMathText text={card.example} /></>}<br /><small>出典：{card.sourceRefs.map((source) => source.filename + " p." + source.page).join(" / ")}</small></div>}
              <div className={styles.actions}><button type="button" onClick={() => { setCardIndex((value) => (value - 1 + cards.length) % cards.length); setFlipped(false); }}>前へ</button><button type="button" disabled={!flipped} onClick={() => markCard("learning")}>もう一度</button><button type="button" disabled={!flipped} onClick={() => markCard("mastered")}>覚えた</button><button type="button" onClick={() => { setCardIndex((value) => (value + 1) % cards.length); setFlipped(false); }}>次へ</button></div>
            </> : <div className={styles.empty}>カード範囲を1つ以上選んでください。</div>}
          </section>
        )}

        {mode === "practice" && (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.eyebrow}>NORMAL PRACTICE</span><h2>図付き通常演習</h2></div><p>図が必要な問題は必ず解答用図を表示します。採点前に答えや完成波形は出ません。</p></div>
            <TopicFilter selected={topics} onChange={setTopics} legend="演習範囲" />
            <div className={styles.actions}><button type="button" onClick={refreshPractice}>選択範囲でシャッフル</button></div>
            {currentPractice ? <>
              <div className={styles.questionMeta}><span>QUESTION {practiceIndex + 1} / {practiceDeck.length}</span><span>{topicLabel(currentPractice.topic)} · {currentPractice.genre} · 難度{currentPractice.difficulty}</span></div>
              <div className={styles.questionBox}><h3><RichMathText text={currentPractice.prompt} /></h3></div>
              {currentPractice.diagram && <div className={styles.diagram}><DigitalCircuitStudyDiagram kind={currentPractice.diagram} title="問題図・解答記入欄" /></div>}
              <AnswerArea question={currentPractice} value={practiceAnswer} feedback={practiceFeedback} onChange={setPracticeAnswer} onSubmit={() => setPracticeFeedback({ response: practiceAnswer, correct: isCorrect(currentPractice, practiceAnswer) })} />
              {practiceFeedback && <FeedbackPanel question={currentPractice} feedback={practiceFeedback} onNext={nextPractice} />}
            </> : <div className={styles.empty}>問題がありません。</div>}
          </section>
        )}

        {mode === "generated" && (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.eyebrow}>SOLVED ON-DEMAND</span><h2>その場で解付き生成</h2></div><p>範囲資料で確認できた真理値表・動作表・状態遷移だけを使います。解答・途中手順・出典が作れない問題は生成しません。</p></div>
            <div className={styles.questionMeta}><span>{generated.genre}</span><span>{topicLabel(generated.topic)}</span></div>
            <div className={styles.questionBox}><h3><RichMathText text={generated.prompt} /></h3></div>
            {generated.diagram && <div className={styles.diagram}><DigitalCircuitStudyDiagram kind={generated.diagram} title="生成問題の解答用図" /></div>}
            <AnswerArea question={generated} value={generatedAnswer} feedback={generatedFeedback} onChange={setGeneratedAnswer} onSubmit={() => setGeneratedFeedback({ response: generatedAnswer, correct: isCorrect(generated, generatedAnswer) })} />
            {generatedFeedback && <FeedbackPanel question={generated} feedback={generatedFeedback} />}
            <div className={styles.actions}><button type="button" onClick={newGenerated}>解付き問題をもう1問生成</button></div>
          </section>
        )}

        {mode === "test" && (
          <section className={styles.panel}>
            {testPhase === "setup" && <>
              <div className={styles.panelHeading}><div><span className={styles.eyebrow}>RANDOM MOCK</span><h2>ランダム模試</h2></div><p>問題数と時間を自由設定。入力・現在位置・残り時間を保存できます。</p></div>
              <TopicFilter selected={topics} onChange={setTopics} legend="模試範囲" />
              <div className={styles.settings}><label>問題数<input type="number" min="1" max={DIGITAL_CIRCUIT_ALL_QUESTIONS.length} value={testCount} onChange={(event) => setTestCount(event.target.value)} /></label><label>制限時間（分）<input type="number" min="1" max="180" value={testMinutes} onChange={(event) => setTestMinutes(event.target.value)} /></label><button className={styles.primary} type="button" onClick={startTest}>開始</button></div>
              {savedTest && <div className={styles.feedback} data-correct="true"><strong>保存中の模試があります</strong><p>Q{savedTest.index + 1}/{savedTest.ids.length} · 残り{formatTime(savedTest.remaining)}</p><div className={styles.actions}><button type="button" onClick={resumeTest}>再開</button><button type="button" className={styles.danger} onClick={() => { window.localStorage.removeItem(TEST_KEY); setSavedTest(null); }}>削除</button></div></div>}
            </>}
            {testPhase === "active" && currentTest && <>
              <div className={styles.panelHeading}><div><span className={styles.eyebrow}>TEST IN PROGRESS</span><h2>残り <span className={styles.timer}>{formatTime(testRemaining)}</span></h2></div><p>2秒ごとに自動保存。前後の問題へ移動しても入力は残ります。</p></div>
              <div className={styles.questionMeta}><span>QUESTION {testIndex + 1} / {testDeck.length}</span><span>{topicLabel(currentTest.topic)} · {currentTest.genre}</span></div>
              <div className={styles.questionBox}><h3><RichMathText text={currentTest.prompt} /></h3></div>
              {currentTest.diagram && <div className={styles.diagram}><DigitalCircuitStudyDiagram kind={currentTest.diagram} title="模試の解答用図" /></div>}
              {currentTest.format === "choice" ? <fieldset className={styles.choices}>{currentTest.options?.map((option) => <label key={option}><input type="radio" name={"test-" + currentTest.id} checked={(testAnswers[currentTest.id] ?? "") === option} onChange={() => setTestAnswers((values) => ({ ...values, [currentTest.id]: option }))} /><RichMathText text={option} /></label>)}</fieldset> : <textarea className={styles.select} rows={5} value={testAnswers[currentTest.id] ?? ""} onChange={(event) => setTestAnswers((values) => ({ ...values, [currentTest.id]: event.target.value }))} placeholder="解答を入力" />}
              <div className={styles.actions}><button type="button" disabled={testIndex === 0} onClick={() => setTestIndex((value) => value - 1)}>前へ</button><button type="button" onClick={pauseTest}>中断・保存</button>{testIndex < testDeck.length - 1 ? <button type="button" onClick={() => setTestIndex((value) => value + 1)}>次へ</button> : <button type="button" className={styles.danger} onClick={finishTest}>提出・採点</button>}</div>
            </>}
            {testPhase === "result" && <>
              <div className={styles.panelHeading}><div><span className={styles.eyebrow}>RANDOM RESULT</span><h2>{testScore} / {testDeck.length}</h2></div><p>全問を一覧で振り返り、各問題の解説と模範図を開けます。</p></div>
              <div className={styles.resultList}>{testDeck.map((question, index) => {
                const ok = isCorrect(question, testAnswers[question.id] ?? "");
                return <article key={question.id} className={styles.resultItem} data-correct={ok}><strong>{ok ? "○" : "×"} Q{index + 1} · {question.genre}</strong><p><RichMathText text={question.prompt} /></p><p>あなた：{testAnswers[question.id] ? <RichMathText text={testAnswers[question.id]} /> : "未解答"} ／ 正解：<RichMathText text={question.answer} /></p><details open={!ok}><summary>解説と模範図</summary>{question.diagram && <div className={styles.diagram}><DigitalCircuitStudyDiagram kind={question.diagram} solution title="振り返り用模範図" /></div>}<ol>{question.steps.map((step, stepIndex) => <li key={stepIndex}><RichMathText text={step} /></li>)}</ol><p><RichMathText text={question.explanation} /></p></details><Link href={"/cards?subject=subject-9&q=" + encodeURIComponent(question.prompt)}>関連暗記帳を検索 →</Link></article>;
              })}</div>
              <div className={styles.actions}><button type="button" onClick={() => setTestPhase("setup")}>設定へ戻る</button><button type="button" onClick={startTest}>同じ設定でもう一度</button></div>
            </>}
          </section>
        )}

        {mode === "expected" && <DigitalCircuitExpectedExams />}

        {mode === "guide" && (
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.eyebrow}>FORMAT GUIDE</span><h2>試験形式ガイド</h2></div><p>形式ZIPの紙面構成と、現行範囲PDFの実問題形式を合わせています。範囲外の題材は追加していません。</p></div>
            <div className={styles.topicGrid}>{DIGITAL_CIRCUIT_EXAM_FORMATS.map((format, index) => <article className={styles.topicCard} style={{ "--topic": DIGITAL_CIRCUIT_TOPICS[index % DIGITAL_CIRCUIT_TOPICS.length].color } as React.CSSProperties} key={format.id}><span>0{index + 1} / FORMAT</span><h3>{format.title}</h3><p>{format.description}</p><b>{format.strategy}</b></article>)}</div>
            <div className={styles.sourceNotice}><b>今回追加で確認した出題：</b>XORタイミング、JK特性式と波形、3段JKリップル、10→2巡回ダウン、状態表＋Mealy図、1001系列検出の設計。いずれも問題画面へ書き込み用の回路・波形・状態図を表示します。</div>
          </section>
        )}
      </main>
    </div>
  );
}
