"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import SmartControlExams from "../../smart-control-exams";
import SmartControlResponseGraph from "../../smart-control-response-graph";
import {
  SMART_CONTROL_CARDS as BASE_SMART_CONTROL_CARDS,
  SMART_CONTROL_EXAM_FORMATS,
  SMART_CONTROL_QUESTIONS as BASE_SMART_CONTROL_QUESTIONS,
  SMART_CONTROL_TOPICS,
  type SmartControlQuestion,
  type SmartControlTopicId,
} from "../../smart-control-data";
import { TEXTBOOK_RESPONSE_CARDS, TEXTBOOK_RESPONSE_QUESTIONS } from "../../smart-control-textbook-data";
import { DisplayMath, RichMathText } from "../../statistics-math";

type Mode = "scope" | "textbook" | "cards" | "practice" | "test" | "expected" | "guide";
type CardState = "learning" | "mastered";
type CardProgress = Record<string, CardState>;
type Feedback = { response: string; correct: boolean };
type TestPhase = "setup" | "active" | "result";
type TestResult = { question: SmartControlQuestion; response: string; correct: boolean };
type SavedTestSession = {
  version: 1;
  questionIds: string[];
  selectedTopics: SmartControlTopicId[];
  questionCountDraft: string;
  testIndex: number;
  typedAnswer: string;
  selectedChoice: string;
  feedback: Feedback | null;
  results: Array<{ questionId: string; response: string; correct: boolean }>;
  elapsedSeconds: number;
  savedAt: number;
};

const SMART_CONTROL_CARDS = [...BASE_SMART_CONTROL_CARDS, ...TEXTBOOK_RESPONSE_CARDS];
const SMART_CONTROL_QUESTIONS: SmartControlQuestion[] = [
  ...BASE_SMART_CONTROL_QUESTIONS,
  ...TEXTBOOK_RESPONSE_QUESTIONS,
];
const TEXTBOOK_GRAPH_QUESTIONS: SmartControlQuestion[] = TEXTBOOK_RESPONSE_QUESTIONS.filter(
  (question) => question.genre.startsWith("図5."),
);
const TEXTBOOK_RED_TERMS = [
  { term: "定常特性", definition: "十分に時間が経った後、応答が収束するか、どの値へ収束するかという性質。" },
  { term: "過渡特性", definition: "初期状態から定常状態へ至るまでの応答波形・過程。速さ、行き過ぎ、振動の収まり方を見る。" },
  { term: "定常値", definition: "応答が最終的に収束する値 \\(y_\\infty=\\lim_{t\\to\\infty}y(t)\\)。" },
  { term: "立ち上がり時間", definition: "\\(0.1y_\\infty\\) から \\(0.9y_\\infty\\) に達するまでの時間 \\(t_r\\)。" },
  { term: "速応性", definition: "入力に対してどれだけ速く応答するか。時間指標が短いほど速い。" },
  { term: "遅れ時間", definition: "入力開始から \\(0.5y_\\infty\\) に初めて達するまでの時間 \\(t_d\\)。" },
  { term: "オーバーシュート（行き過ぎ量）", definition: "定常値を最大で何％上回ったか。\\(O_s=\\frac{y_{\\max}-y_\\infty}{y_\\infty}\\times100\\%\\)。" },
  { term: "行き過ぎ時間", definition: "応答が最大値 \\(y_{\\max}\\) に達する時刻 \\(t_p\\)。" },
  { term: "減衰性", definition: "振動や行き過ぎが時間とともに小さくなり、定常値へ収束する性質。" },
  { term: "整定時間", definition: "応答が \\(0.95y_\\infty\\)〜\\(1.05y_\\infty\\) に入り、その後は外へ出なくなる時刻 \\(t_s\\)。" },
] as const;

const PROGRESS_KEY = "test-grid:subject-6:progress:v1";
const TEST_SESSION_KEY = "test-grid:subject-6:mock-test:v1";
const ALL_TOPIC_IDS = SMART_CONTROL_TOPICS.map((topic) => topic.id);
const KNOWN_TOPIC_IDS = new Set<SmartControlTopicId>(ALL_TOPIC_IDS);
const KNOWN_QUESTION_IDS = new Set(SMART_CONTROL_QUESTIONS.map((question) => question.id));

function randomize<T>(items: readonly T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[−–—]/g, "-")
    .replace(/[×・]/g, "*")
    .replace(/\\(?:left|right|mathrm|operatorname|quad|,|!)/g, "")
    .replace(/[\\{}()[\]「」『』、。,.!?！？・：:;\s]/g, "")
    .trim();
}

function isCorrectAnswer(question: SmartControlQuestion, response: string) {
  const normalized = normalizeText(response);
  const references = [question.answer, ...(question.accepted ?? [])];
  if (references.some((answer) => normalizeText(answer) === normalized)) return true;
  if (question.format === "choice") return false;

  const keywords = question.keywords ?? [];
  if (!keywords.length) return false;
  const matched = keywords.filter((keyword) => normalized.includes(normalizeText(keyword))).length;
  return matched >= (question.minKeywords ?? keywords.length);
}

function topicLabel(topicId: SmartControlTopicId) {
  return SMART_CONTROL_TOPICS.find((topic) => topic.id === topicId)?.shortTitle ?? topicId;
}

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function restoreProgress(): CardProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, state]) => state === "learning" || state === "mastered",
      ),
    ) as CardProgress;
  } catch {
    return {};
  }
}

function restoreTestSession(): SavedTestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TEST_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedTestSession>;
    if (
      parsed.version !== 1
      || !Array.isArray(parsed.questionIds)
      || parsed.questionIds.length === 0
      || parsed.questionIds.some((id) => typeof id !== "string" || !KNOWN_QUESTION_IDS.has(id))
      || typeof parsed.testIndex !== "number"
    ) return null;

    const selectedTopics = Array.isArray(parsed.selectedTopics)
      ? parsed.selectedTopics.filter(
        (topic): topic is SmartControlTopicId => typeof topic === "string" && KNOWN_TOPIC_IDS.has(topic as SmartControlTopicId),
      )
      : [];

    return {
      version: 1,
      questionIds: parsed.questionIds,
      selectedTopics: selectedTopics.length ? selectedTopics : [...ALL_TOPIC_IDS],
      questionCountDraft: typeof parsed.questionCountDraft === "string" ? parsed.questionCountDraft : String(parsed.questionIds.length),
      testIndex: Math.max(0, Math.min(parsed.questionIds.length - 1, Math.floor(parsed.testIndex))),
      typedAnswer: typeof parsed.typedAnswer === "string" ? parsed.typedAnswer : "",
      selectedChoice: typeof parsed.selectedChoice === "string" ? parsed.selectedChoice : "",
      feedback: parsed.feedback && typeof parsed.feedback.response === "string" && typeof parsed.feedback.correct === "boolean"
        ? parsed.feedback
        : null,
      results: Array.isArray(parsed.results)
        ? parsed.results.filter((result) => (
          result
          && typeof result.questionId === "string"
          && KNOWN_QUESTION_IDS.has(result.questionId)
          && typeof result.response === "string"
          && typeof result.correct === "boolean"
        )) as SavedTestSession["results"]
        : [],
      elapsedSeconds: typeof parsed.elapsedSeconds === "number" ? Math.max(0, Math.floor(parsed.elapsedSeconds)) : 0,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function persistTestSession(session: SavedTestSession) {
  try {
    window.localStorage.setItem(TEST_SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

function TopicFilter({
  legend,
  selected,
  onChange,
}: {
  legend: string;
  selected: SmartControlTopicId[];
  onChange: (topics: SmartControlTopicId[]) => void;
}) {
  function toggle(topicId: SmartControlTopicId) {
    onChange(selected.includes(topicId)
      ? selected.filter((id) => id !== topicId)
      : [...selected, topicId]);
  }

  return (
    <fieldset className="english-choice-answer english-test-groups statistics-topic-filter">
      <legend>{legend}（複数選択可）</legend>
      <div className="english-result-actions statistics-filter-actions">
        <button type="button" onClick={() => onChange([...ALL_TOPIC_IDS])}>すべて選択</button>
        <button type="button" onClick={() => onChange([])}>すべて解除</button>
      </div>
      {SMART_CONTROL_TOPICS.map((topic) => (
        <label key={topic.id}>
          <input type="checkbox" checked={selected.includes(topic.id)} onChange={() => toggle(topic.id)} />
          <span>{topic.number}・{topic.shortTitle}</span>
        </label>
      ))}
    </fieldset>
  );
}

function AnswerForm({
  idPrefix,
  question,
  typedAnswer,
  selectedChoice,
  feedback,
  onTypedAnswer,
  onSelectedChoice,
  onSubmit,
}: {
  idPrefix: string;
  question: SmartControlQuestion;
  typedAnswer: string;
  selectedChoice: string;
  feedback: Feedback | null;
  onTypedAnswer: (value: string) => void;
  onSelectedChoice: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const response = question.format === "choice" ? selectedChoice : typedAnswer;
  return (
    <form className="english-answer-form statistics-answer-form" onSubmit={onSubmit}>
      {question.format === "text" && (
        <label className="english-input-answer english-translation-answer statistics-text-answer">
          <span>式・理由を入力</span>
          <textarea
            rows={4}
            autoComplete="off"
            value={typedAnswer}
            disabled={Boolean(feedback)}
            onChange={(event) => onTypedAnswer(event.target.value)}
            placeholder="式、途中の考え方、安定判別の根拠などを入力"
          />
        </label>
      )}
      {question.format === "choice" && (
        <fieldset className="english-choice-answer statistics-choice-answer" disabled={Boolean(feedback)}>
          <legend>正しいものを1つ選択</legend>
          {question.options?.map((option, index) => (
            <label key={`${idPrefix}-${question.id}-${index}`}>
              <input
                type="radio"
                name={`${idPrefix}-${question.id}`}
                value={option}
                checked={selectedChoice === option}
                onChange={(event) => onSelectedChoice(event.target.value)}
              />
              <span><b>{String.fromCharCode(65 + index)}</b><RichMathText text={option} /></span>
            </label>
          ))}
        </fieldset>
      )}
      {!feedback && (
        <button className="english-submit-answer statistics-submit-answer" type="submit" disabled={!response.trim()}>
          採点する →
        </button>
      )}
    </form>
  );
}

function SolutionFeedback({
  question,
  feedback,
  onOverride,
  onNext,
  nextLabel,
}: {
  question: SmartControlQuestion;
  feedback: Feedback;
  onOverride?: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className={`generic-test-answer english-test-feedback statistics-feedback ${feedback.correct ? "is-correct" : "is-wrong"}`} aria-live="polite">
      <strong>{feedback.correct ? "正解" : "要確認"}</strong>
      <p><span>あなたの解答</span><RichMathText text={feedback.response} /></p>
      <p><span>模範解答</span><RichMathText text={question.answer} /></p>
      {question.formula && (
        <div className="statistics-solution-formula"><span>使う式</span><DisplayMath tex={question.formula} /></div>
      )}
      <div className="statistics-solution-steps">
        <span>途中式・考え方</span>
        <ol>{question.steps.map((step, index) => <li key={`${question.id}-step-${index}`}><RichMathText text={step} /></li>)}</ol>
      </div>
      <p><span>解説</span><RichMathText text={question.explanation} /></p>
      {onOverride && !feedback.correct && question.format === "text" && (
        <button className="english-translation-override statistics-answer-override" type="button" onClick={onOverride}>
          内容は合っていた → 正解にする
        </button>
      )}
      <button type="button" onClick={onNext}>{nextLabel}</button>
    </div>
  );
}

export default function SmartControlSubjectPage() {
  const [mode, setMode] = useState<Mode>("scope");
  const [progress, setProgress] = useState<CardProgress>({});
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const workspaceRef = useRef<HTMLElement>(null);

  const [cardTopics, setCardTopics] = useState<SmartControlTopicId[]>([...ALL_TOPIC_IDS]);
  const [cardPool, setCardPool] = useState([...SMART_CONTROL_CARDS]);
  const [cardDeck, setCardDeck] = useState([...SMART_CONTROL_CARDS]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  const [practiceTopics, setPracticeTopics] = useState<SmartControlTopicId[]>([...ALL_TOPIC_IDS]);
  const [practicePool, setPracticePool] = useState([...SMART_CONTROL_QUESTIONS]);
  const [practiceDeck, setPracticeDeck] = useState([...SMART_CONTROL_QUESTIONS]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceTypedAnswer, setPracticeTypedAnswer] = useState("");
  const [practiceSelectedChoice, setPracticeSelectedChoice] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<Feedback | null>(null);

  const [testPhase, setTestPhase] = useState<TestPhase>("setup");
  const [testTopics, setTestTopics] = useState<SmartControlTopicId[]>([...ALL_TOPIC_IDS]);
  const [questionCountDraft, setQuestionCountDraft] = useState("15");
  const [testQuestions, setTestQuestions] = useState<SmartControlQuestion[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testTypedAnswer, setTestTypedAnswer] = useState("");
  const [testSelectedChoice, setTestSelectedChoice] = useState("");
  const [testFeedback, setTestFeedback] = useState<Feedback | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testElapsedSeconds, setTestElapsedSeconds] = useState(0);
  const [savedTestSession, setSavedTestSession] = useState<SavedTestSession | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProgress(restoreProgress());
    setSavedTestSession(restoreTestSession());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch { /* Storage may be blocked. */ }
  }, [hydrated, progress]);

  useEffect(() => {
    if (testPhase !== "active") return;
    const timer = window.setInterval(() => setTestElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [testPhase]);

  useEffect(() => {
    if (!hydrated || testPhase !== "active" || !testQuestions.length) return;
    persistTestSession({
      version: 1,
      questionIds: testQuestions.map((question) => question.id),
      selectedTopics: testTopics,
      questionCountDraft,
      testIndex,
      typedAnswer: testTypedAnswer,
      selectedChoice: testSelectedChoice,
      feedback: testFeedback,
      results: testResults.map((result) => ({ questionId: result.question.id, response: result.response, correct: result.correct })),
      elapsedSeconds: testElapsedSeconds,
      savedAt: Date.now(),
    });
  }, [hydrated, questionCountDraft, testElapsedSeconds, testFeedback, testIndex, testPhase, testQuestions, testResults, testSelectedChoice, testTopics, testTypedAnswer]);

  const filteredCards = cardPool;
  const currentCard = cardDeck[cardIndex];
  const cardMastered = filteredCards.filter((card) => progress[card.id] === "mastered").length;
  const cardLearning = filteredCards.filter((card) => progress[card.id] === "learning").length;
  const cardCompletion = filteredCards.length ? Math.round((cardMastered / filteredCards.length) * 100) : 0;
  const currentPracticeQuestion = practiceDeck[practiceIndex];
  const availableTestQuestions = useMemo(
    () => SMART_CONTROL_QUESTIONS.filter((question) => testTopics.includes(question.topic)),
    [testTopics],
  );
  const currentTestQuestion = testQuestions[testIndex];
  const testScore = testResults.filter((result) => result.correct).length;
  const totalMastered = SMART_CONTROL_CARDS.filter((card) => progress[card.id] === "mastered").length;

  function changeMode(nextMode: Mode) {
    if (mode === "test" && testPhase === "active" && nextMode !== "test") pauseTest();
    setMode(nextMode);
    window.setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function changeCardTopics(nextTopics: SmartControlTopicId[]) {
    const nextPool = SMART_CONTROL_CARDS.filter((card) => nextTopics.includes(card.topic));
    setCardTopics(nextTopics);
    setCardPool(nextPool);
    setCardDeck(nextPool);
    setCardIndex(0);
    setCardFlipped(false);
  }

  function startTextbookCards() {
    setCardTopics(["response-stability"]);
    setCardPool([...TEXTBOOK_RESPONSE_CARDS]);
    setCardDeck(randomize(TEXTBOOK_RESPONSE_CARDS));
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement(`教科書p.65〜68の赤字・図カード${TEXTBOOK_RESPONSE_CARDS.length}枚で復習します。`);
    changeMode("cards");
  }

  function moveCard(delta: number) {
    if (!cardDeck.length) return;
    setCardIndex((index) => (index + delta + cardDeck.length) % cardDeck.length);
    setCardFlipped(false);
  }

  function markCard(state: CardState) {
    if (!currentCard) return;
    setProgress((current) => ({ ...current, [currentCard.id]: state }));
    setAnnouncement(`${currentCard.title}を「${state === "mastered" ? "覚えた" : "もう一度"}」にしました。`);
    setCardIndex((index) => cardDeck.length ? (index + 1) % cardDeck.length : 0);
    setCardFlipped(false);
  }

  function shuffleCards() {
    setCardDeck(randomize(filteredCards));
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement("選択中のカードをシャッフルしました。");
  }

  function reviewUnmastered() {
    const remaining = filteredCards.filter((card) => progress[card.id] !== "mastered");
    setCardDeck(randomize(remaining.length ? remaining : filteredCards));
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement(remaining.length ? `未暗記の${remaining.length}枚で復習します。` : "全カードをもう一周します。");
  }

  function resetPracticeAnswer() {
    setPracticeTypedAnswer("");
    setPracticeSelectedChoice("");
    setPracticeFeedback(null);
  }

  function changePracticeTopics(nextTopics: SmartControlTopicId[]) {
    const nextPool = SMART_CONTROL_QUESTIONS.filter((question) => nextTopics.includes(question.topic));
    setPracticeTopics(nextTopics);
    setPracticePool(nextPool);
    setPracticeDeck(randomize(nextPool));
    setPracticeIndex(0);
    resetPracticeAnswer();
  }

  function startTextbookPractice() {
    setPracticeTopics(["response-stability"]);
    setPracticePool([...TEXTBOOK_GRAPH_QUESTIONS]);
    setPracticeDeck(randomize(TEXTBOOK_GRAPH_QUESTIONS));
    setPracticeIndex(0);
    resetPracticeAnswer();
    setAnnouncement(`教科書p.65〜68の図表問題${TEXTBOOK_GRAPH_QUESTIONS.length}問を開始します。`);
    changeMode("practice");
  }

  function shufflePractice() {
    setPracticeDeck(randomize(practicePool));
    setPracticeIndex(0);
    resetPracticeAnswer();
  }

  function submitPracticeAnswer(event: FormEvent) {
    event.preventDefault();
    if (!currentPracticeQuestion || practiceFeedback) return;
    const response = currentPracticeQuestion.format === "choice" ? practiceSelectedChoice : practiceTypedAnswer.trim();
    if (!response) return;
    setPracticeFeedback({ response, correct: isCorrectAnswer(currentPracticeQuestion, response) });
  }

  function acceptPracticeText() {
    if (!practiceFeedback || currentPracticeQuestion?.format !== "text") return;
    setPracticeFeedback({ ...practiceFeedback, correct: true });
  }

  function nextPracticeQuestion() {
    if (!practiceDeck.length) return;
    if (practiceIndex >= practiceDeck.length - 1) {
      setPracticeDeck(randomize(practiceDeck));
      setPracticeIndex(0);
      setAnnouncement("選択した範囲を一周しました。もう一度ランダムに出題します。");
    } else {
      setPracticeIndex((index) => index + 1);
    }
    resetPracticeAnswer();
  }

  function startTest() {
    if (!availableTestQuestions.length) return;
    const requested = Number.parseInt(questionCountDraft, 10);
    const count = Math.max(1, Math.min(Number.isFinite(requested) ? requested : 1, availableTestQuestions.length));
    const questions = randomize(availableTestQuestions).slice(0, count);
    try { window.localStorage.removeItem(TEST_SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedTestSession(null);
    setQuestionCountDraft(String(count));
    setTestQuestions(questions);
    setTestIndex(0);
    setTestTypedAnswer("");
    setTestSelectedChoice("");
    setTestFeedback(null);
    setTestResults([]);
    setTestElapsedSeconds(0);
    setTestPhase("active");
  }

  function submitTestAnswer(event: FormEvent) {
    event.preventDefault();
    if (!currentTestQuestion || testFeedback) return;
    const response = currentTestQuestion.format === "choice" ? testSelectedChoice : testTypedAnswer.trim();
    if (!response) return;
    const correct = isCorrectAnswer(currentTestQuestion, response);
    setTestFeedback({ response, correct });
    setTestResults((current) => [...current, { question: currentTestQuestion, response, correct }]);
  }

  function acceptTestText() {
    if (!testFeedback || currentTestQuestion?.format !== "text") return;
    setTestFeedback({ ...testFeedback, correct: true });
    setTestResults((current) => current.map((result, index) => (
      index === current.length - 1 ? { ...result, correct: true } : result
    )));
  }

  function nextTestQuestion() {
    if (testIndex >= testQuestions.length - 1) {
      setTestPhase("result");
      setSavedTestSession(null);
      try { window.localStorage.removeItem(TEST_SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
      return;
    }
    setTestIndex((index) => index + 1);
    setTestTypedAnswer("");
    setTestSelectedChoice("");
    setTestFeedback(null);
  }

  function makeCurrentSession(): SavedTestSession | null {
    if (!testQuestions.length) return null;
    return {
      version: 1,
      questionIds: testQuestions.map((question) => question.id),
      selectedTopics: testTopics,
      questionCountDraft,
      testIndex,
      typedAnswer: testTypedAnswer,
      selectedChoice: testSelectedChoice,
      feedback: testFeedback,
      results: testResults.map((result) => ({ questionId: result.question.id, response: result.response, correct: result.correct })),
      elapsedSeconds: testElapsedSeconds,
      savedAt: Date.now(),
    };
  }

  function pauseTest() {
    const session = makeCurrentSession();
    if (!session) return;
    persistTestSession(session);
    setSavedTestSession(session);
    setTestPhase("setup");
    setAnnouncement("模擬テストを中断し、現在位置と解答を保存しました。");
  }

  function resumeSavedTest() {
    if (!savedTestSession) return;
    const questions = savedTestSession.questionIds.flatMap((id) => {
      const found = SMART_CONTROL_QUESTIONS.find((question) => question.id === id);
      return found ? [found] : [];
    });
    if (!questions.length) {
      deleteSavedTest();
      return;
    }
    const results = savedTestSession.results.flatMap((savedResult) => {
      const question = SMART_CONTROL_QUESTIONS.find((item) => item.id === savedResult.questionId);
      return question ? [{ question, response: savedResult.response, correct: savedResult.correct }] : [];
    });
    setTestTopics(savedTestSession.selectedTopics);
    setQuestionCountDraft(savedTestSession.questionCountDraft);
    setTestQuestions(questions);
    setTestIndex(Math.min(savedTestSession.testIndex, questions.length - 1));
    setTestTypedAnswer(savedTestSession.typedAnswer);
    setTestSelectedChoice(savedTestSession.selectedChoice);
    setTestFeedback(savedTestSession.feedback);
    setTestResults(results);
    setTestElapsedSeconds(savedTestSession.elapsedSeconds);
    setTestPhase("active");
  }

  function deleteSavedTest() {
    try { window.localStorage.removeItem(TEST_SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedTestSession(null);
    setAnnouncement("保存中の模擬テストを削除しました。");
  }

  const pageStyle = { "--subject-accent": "#ff8fc7", "--english-yellow": "#ff8fc7" } as CSSProperties;

  return (
    <div className="app-frame generic-subject-page english-page statistics-page smart-control-page" style={pageStyle}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">SC</span>
          <span><strong>TEST//GRID</strong><small>SMART CONTROL</small></span>
        </Link>
        <div className="header-actions statistics-header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {SMART_CONTROL_QUESTIONS.length} QUESTIONS</span>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="generic-subject-main english-main statistics-main">
        <nav className="subject-breadcrumb statistics-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">スマート制御</strong>
        </nav>

        <section className="generic-subject-hero english-hero statistics-hero" aria-labelledby="smart-control-title">
          <div className="english-hero-copy statistics-hero-copy">
            <p><span>SUBJECT 06</span><span>COURSE-RANGE ONLY</span></p>
            <h1 id="smart-control-title">SMART CONTROL LAB</h1>
            <small>伝達関数から逆ラプラス、極・安定性、フィードバック、ブロック線図まで。式を見て終わらず、途中式を自力で再現するためのスマート制御演習室です。</small>
          </div>
          <button className="english-hero-memory-button statistics-hero-card-button" type="button" onClick={() => changeMode("textbook")}>
            <span>NEW / TEXTBOOK RED</span>
            <strong>教科書の赤字・図を暗記</strong>
            <small>p.65〜68の試験対象を集中反復 →</small>
          </button>
        </section>

        <section className="english-summary statistics-summary" aria-label="収録教材">
          <div><span>TOPICS</span><strong>{SMART_CONTROL_TOPICS.length}</strong><small>単元</small></div>
          <div><span>CARDS</span><strong>{SMART_CONTROL_CARDS.length}</strong><small>枚</small></div>
          <div><span>QUESTIONS</span><strong>{SMART_CONTROL_QUESTIONS.length}</strong><small>問</small></div>
          <p>範囲ZIPと教科書p.65〜68を本体に、過去問2の重複分野だけを収録。赤文字と図5.1〜5.3の数値もカード・演習・模試へ追加済みです。暗記済み {totalMastered}枚。</p>
        </section>

        <section ref={workspaceRef} id="smart-control-workspace" className="english-workspace statistics-workspace">
          <div className="workspace-tabs english-tabs statistics-tabs smart-control-tabs" role="tablist" aria-label="スマート制御の学習モード">
            <button type="button" role="tab" aria-selected={mode === "scope"} className={mode === "scope" ? "active" : ""} onClick={() => changeMode("scope")}>① 範囲</button>
            <button type="button" role="tab" aria-selected={mode === "textbook"} className={mode === "textbook" ? "active english-tab-memory" : "english-tab-memory"} onClick={() => changeMode("textbook")}>② 教科書赤字・図</button>
            <button type="button" role="tab" aria-selected={mode === "cards"} className={mode === "cards" ? "active" : ""} onClick={() => changeMode("cards")}>③ 暗記カード</button>
            <button type="button" role="tab" aria-selected={mode === "practice"} className={mode === "practice" ? "active" : ""} onClick={() => changeMode("practice")}>④ 演習</button>
            <button type="button" role="tab" aria-selected={mode === "test"} className={mode === "test" ? "active" : ""} onClick={() => changeMode("test")}>⑤ ランダム模試</button>
            <button type="button" role="tab" aria-selected={mode === "expected"} className={mode === "expected" ? "active" : ""} onClick={() => changeMode("expected")}>⑥ A4想定試験</button>
            <button type="button" role="tab" aria-selected={mode === "guide"} className={mode === "guide" ? "active" : ""} onClick={() => changeMode("guide")}>⑦ 出題形式</button>
          </div>

          {mode === "scope" && (
            <section className="english-guide-workspace statistics-scope-workspace" aria-labelledby="smart-scope-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>COURSE RANGE</span><h2 id="smart-scope-title">今回の試験範囲</h2></div>
                <p>資料の役割を混ぜないよう、範囲・追加範囲・形式参考を分けています。</p>
              </div>

              <div className="english-guide-grid statistics-guide-grid">
                <article>
                  <span>IN RANGE</span><h3>スマート制御・範囲ZIP</h3>
                  <p>写真から確認できた伝達関数、逆ラプラス、応答・極・安定性、フィードバック、ブロック線図を出題します。</p>
                  <strong>今回の学習内容そのもの</strong>
                </article>
                <article>
                  <span>PARTLY IN RANGE</span><h3>過去問2</h3>
                  <p>1・3ページの制御分野で範囲ZIPと重なる内容だけ収録。用語、応答、極、安定判別、線図の形式も参考にします。</p>
                  <strong>重複する制御分野のみ</strong>
                </article>
                <article>
                  <span>FORMAT ONLY</span><h3>過去問1・過去問3</h3>
                  <p>大問構成、語群、途中式の要求、配点感だけを参考にし、現在の範囲外の物理モデルや数値は問題へ流用しません。</p>
                  <strong>出題形式の参照のみ</strong>
                </article>
                <article>
                  <span>IN RANGE / RED + GRAPH</span><h3>教科書p.65〜68</h3>
                  <p>赤文字10語と図5.1〜5.3の数値・記号を収録。0.1、0.5、0.9、0.95、1.05と、t_r・t_d・t_p・t_s・O_sを位置と定義まで出題します。</p>
                  <strong>赤字とグラフ数値はすべて試験範囲</strong>
                </article>
              </div>

              <div className="english-guide-tip statistics-source-policy">
                <span>EXCLUDED</span>
                <p><b>複素積分・マクローリン展開・留数は対象外。</b>過去問2の2ページにある複素関数分野は、今回のスマート制御範囲へ入れていません。</p>
              </div>

              <div className="english-guide-grid statistics-topic-grid">
                {SMART_CONTROL_TOPICS.map((topic) => {
                  const cardCount = SMART_CONTROL_CARDS.filter((card) => card.topic === topic.id).length;
                  const questionCount = SMART_CONTROL_QUESTIONS.filter((question) => question.topic === topic.id).length;
                  return (
                    <article key={topic.id} className="statistics-topic-card" style={{ borderTopColor: topic.color }}>
                      <span>{topic.number} / RANGE</span>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                      <strong>カード {cardCount}枚・演習 {questionCount}問</strong>
                      <small>{topic.source}</small>
                    </article>
                  );
                })}
              </div>
              <div className="english-result-actions statistics-scope-actions">
                <button type="button" onClick={() => changeMode("textbook")}>教科書の赤字・図を確認</button>
                <button type="button" onClick={() => changeMode("cards")}>全範囲の暗記カード</button>
                <button type="button" onClick={() => changeMode("practice")}>演習へ進む</button>
              </div>
            </section>
          )}

          {mode === "textbook" && (
            <section className="english-guide-workspace statistics-guide-workspace smart-control-textbook-workspace" aria-labelledby="smart-textbook-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>TEXTBOOK P.65–68</span><h2 id="smart-textbook-title">赤文字・グラフ暗記</h2></div>
                <p>赤文字は定義を即答し、図の数値は「どの高さ・どの時刻か」を位置ごと覚えます。</p>
              </div>

              <div className="english-guide-tip statistics-format-notice smart-control-textbook-intro">
                <span>ALL IN RANGE</span>
                <p><b>赤文字10語と図5.1〜5.3の数値はすべて出題対象。</b> 図は画像の丸暗記ではなく、10％・50％・90％・±5％帯と各時刻の意味を対応させて練習します。</p>
              </div>

              <SmartControlResponseGraph title="図5.1を再現：過渡応答の数値・時刻" />

              <div className="english-guide-grid statistics-guide-grid smart-control-red-term-grid" aria-label="教科書の赤文字10語">
                {TEXTBOOK_RED_TERMS.map((item, index) => (
                  <article key={item.term}>
                    <span>{String(index + 1).padStart(2, "0")} / RED TERM</span>
                    <h3>{item.term}</h3>
                    <p><RichMathText text={item.definition} /></p>
                  </article>
                ))}
              </div>

              <div className="english-result-actions statistics-scope-actions smart-control-textbook-actions">
                <button type="button" onClick={startTextbookCards}>教科書カードだけ暗記する</button>
                <button type="button" onClick={startTextbookPractice}>図表問題だけ演習する</button>
              </div>
            </section>
          )}

          {mode === "cards" && (
            <section className="generic-card-workspace english-card-workspace statistics-card-workspace" aria-labelledby="smart-card-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>FORMULA MEMORY</span><h2 id="smart-card-title">暗記カード</h2></div>
                <p>問題を見て式・意味を頭の中で作ってから裏返します。複数単元を同時に選べます。</p>
              </div>
              <TopicFilter legend="カードに含める単元" selected={cardTopics} onChange={changeCardTopics} />
              <div className="generic-progress english-card-progress statistics-card-progress">
                <div><span>覚えた {cardMastered} / {filteredCards.length}・もう一度 {cardLearning}</span><strong>{cardCompletion}%</strong></div>
                <progress value={cardCompletion} max="100" aria-label={`暗記カード進捗 ${cardCompletion}%`} />
              </div>

              {currentCard ? (
                <>
                  <div className="generic-deck-meta english-deck-meta statistics-deck-meta">
                    <span>CARD {cardIndex + 1} / {cardDeck.length}</span>
                    <span>{topicLabel(currentCard.topic)} · {progress[currentCard.id] === "mastered" ? "覚えた" : progress[currentCard.id] === "learning" ? "もう一度" : "未判定"}</span>
                  </div>
                  <button type="button" className={`generic-flip-card english-flip-card statistics-flip-card ${cardFlipped ? "is-flipped" : ""}`} onClick={() => setCardFlipped((flipped) => !flipped)} aria-label={cardFlipped ? "問題面に戻る" : "答えを見る"}>
                    <span>{cardFlipped ? currentCard.title : "QUESTION"}</span>
                    {cardFlipped
                      ? <DisplayMath tex={currentCard.formula} ariaLabel={`${currentCard.title}の公式`} />
                      : <strong><RichMathText text={currentCard.prompt} /></strong>}
                    <small>{cardFlipped ? currentCard.cue : "頭の中で式を作ってからタップ"}</small>
                  </button>
                  {cardFlipped && (
                    <div className="english-guide-tip statistics-card-explanation">
                      <span>WHY / HOW</span>
                      <p><RichMathText text={currentCard.explanation} />{currentCard.example ? <><br /><b>例：</b><RichMathText text={currentCard.example} /></> : null}</p>
                    </div>
                  )}
                  <div className="generic-card-controls english-card-controls statistics-card-controls">
                    <button type="button" onClick={() => moveCard(-1)}>← 前へ</button>
                    <button type="button" className="again" disabled={!cardFlipped} onClick={() => markCard("learning")}>1　もう一度</button>
                    <button type="button" className="mastered" disabled={!cardFlipped} onClick={() => markCard("mastered")}>2　覚えた</button>
                    <button type="button" onClick={() => moveCard(1)}>次へ →</button>
                  </div>
                  <div className="generic-deck-tools english-deck-tools statistics-deck-tools">
                    <button type="button" onClick={startTextbookCards}>教科書赤字・図だけ</button>
                    <button type="button" onClick={shuffleCards}>シャッフル</button>
                    <button type="button" onClick={reviewUnmastered}>未暗記だけ復習</button>
                  </div>
                </>
              ) : (
                <div className="generic-empty english-empty statistics-empty"><span>NO TOPIC</span><h3>出題する単元を1つ以上選んでください。</h3></div>
              )}
            </section>
          )}

          {mode === "practice" && (
            <section className="generic-test-workspace english-test-workspace statistics-practice-workspace" aria-labelledby="smart-practice-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>STEP PRACTICE</span><h2 id="smart-practice-title">単元別演習</h2></div>
                <p>選択式と記述式を混ぜ、答えた直後に途中式と理由を確認します。</p>
              </div>
              <TopicFilter legend="演習に含める単元" selected={practiceTopics} onChange={changePracticeTopics} />
              <div className="english-result-actions statistics-practice-tools">
                <span>{practiceDeck.length}問を出題対象に設定</span>
                <button type="button" onClick={startTextbookPractice}>教科書の図表問題だけ</button>
                <button type="button" disabled={!practiceDeck.length} onClick={shufflePractice}>問題順をシャッフル</button>
              </div>

              {currentPracticeQuestion ? (
                <div className="english-test-active statistics-practice-active">
                  <div className="generic-deck-meta english-test-meta statistics-question-meta">
                    <span>QUESTION {practiceIndex + 1} / {practiceDeck.length}</span>
                    <span>{topicLabel(currentPracticeQuestion.topic)} · {currentPracticeQuestion.genre} · 難度{currentPracticeQuestion.difficulty} · {currentPracticeQuestion.format === "choice" ? "選択" : "記述"}</span>
                  </div>
                  {currentPracticeQuestion.context && <div className="english-guide-tip statistics-question-context"><span>GIVEN</span><p><RichMathText text={currentPracticeQuestion.context} /></p></div>}
                  <div className="generic-test-question english-test-question statistics-test-question"><span>問題</span><h2><RichMathText text={currentPracticeQuestion.prompt} /></h2></div>
                  <AnswerForm idPrefix="practice" question={currentPracticeQuestion} typedAnswer={practiceTypedAnswer} selectedChoice={practiceSelectedChoice} feedback={practiceFeedback} onTypedAnswer={setPracticeTypedAnswer} onSelectedChoice={setPracticeSelectedChoice} onSubmit={submitPracticeAnswer} />
                  {practiceFeedback && <SolutionFeedback question={currentPracticeQuestion} feedback={practiceFeedback} onOverride={acceptPracticeText} onNext={nextPracticeQuestion} nextLabel={practiceIndex === practiceDeck.length - 1 ? "一周してもう一度 →" : "次の問題へ →"} />}
                </div>
              ) : (
                <div className="generic-empty english-empty statistics-empty"><span>NO QUESTION</span><h3>演習する単元を1つ以上選んでください。</h3></div>
              )}
            </section>
          )}

          {mode === "test" && (
            <section className="generic-test-workspace english-test-workspace statistics-test-workspace" aria-labelledby="smart-test-title">
              {testPhase === "setup" && (
                <div className="english-test-setup statistics-test-setup">
                  <div className="english-panel-heading statistics-panel-heading">
                    <div><span>RANDOM MOCK</span><h2 id="smart-test-title">ランダム模試を作る</h2></div>
                    <p>選んだ単元から指定問数をランダム出題。制限時間は固定せず、経過時間だけを記録します。</p>
                  </div>
                  {savedTestSession && (
                    <div className="generic-test-answer english-test-feedback english-saved-test statistics-saved-test" aria-label="保存中の模擬テスト">
                      <strong>途中のランダム模試があります</strong>
                      <p><span>進捗</span>Q{savedTestSession.testIndex + 1} / {savedTestSession.questionIds.length}・経過 {formatElapsedTime(savedTestSession.elapsedSeconds)}</p>
                      <p><span>保存日時</span>{new Date(savedTestSession.savedAt).toLocaleString("ja-JP")}</p>
                      <div className="english-result-actions statistics-saved-actions">
                        <button type="button" onClick={resumeSavedTest}>続きから再開</button>
                        <button type="button" onClick={deleteSavedTest}>保存データを削除</button>
                      </div>
                    </div>
                  )}
                  <TopicFilter legend="模試に含める単元" selected={testTopics} onChange={setTestTopics} />
                  <div className="english-test-settings statistics-test-settings">
                    <label><span>問題数 <small>最大 {availableTestQuestions.length}問</small></span><input type="number" min="1" max={Math.max(1, availableTestQuestions.length)} inputMode="numeric" value={questionCountDraft} onChange={(event) => setQuestionCountDraft(event.target.value)} /></label>
                    <button type="button" onClick={startTest} disabled={!availableTestQuestions.length}>ランダム出題を開始 →</button>
                  </div>
                  <div className="english-format-preview statistics-format-preview"><span>選択</span><span>記述</span><span>経過時間のみ</span><p>{availableTestQuestions.length}問から作成可能</p></div>
                </div>
              )}

              {testPhase === "active" && currentTestQuestion && (
                <div className="english-test-active statistics-test-active">
                  <div className="generic-deck-meta english-test-meta statistics-question-meta">
                    <span>QUESTION {testIndex + 1} / {testQuestions.length}</span>
                    <span>{topicLabel(currentTestQuestion.topic)} · {currentTestQuestion.genre} · {currentTestQuestion.format === "choice" ? "選択" : "記述"}</span>
                  </div>
                  <div className="english-result-actions english-test-session-actions statistics-test-session-actions">
                    <span>経過 {formatElapsedTime(testElapsedSeconds)}・現在位置と入力内容を自動保存中</span>
                    <button type="button" onClick={pauseTest}>中断して保存</button>
                  </div>
                  {currentTestQuestion.context && <div className="english-guide-tip statistics-question-context"><span>GIVEN</span><p><RichMathText text={currentTestQuestion.context} /></p></div>}
                  <div className="generic-test-question english-test-question statistics-test-question"><span>問題</span><h2><RichMathText text={currentTestQuestion.prompt} /></h2></div>
                  <AnswerForm idPrefix="test" question={currentTestQuestion} typedAnswer={testTypedAnswer} selectedChoice={testSelectedChoice} feedback={testFeedback} onTypedAnswer={setTestTypedAnswer} onSelectedChoice={setTestSelectedChoice} onSubmit={submitTestAnswer} />
                  {testFeedback && <SolutionFeedback question={currentTestQuestion} feedback={testFeedback} onOverride={acceptTestText} onNext={nextTestQuestion} nextLabel={testIndex === testQuestions.length - 1 ? "結果を見る" : "次の問題へ →"} />}
                </div>
              )}

              {testPhase === "result" && (
                <div className="english-test-result statistics-test-result">
                  <span>RANDOM MOCK RESULT</span>
                  <h2>{testScore} / {testResults.length}</h2>
                  <p>正答率 {testResults.length ? Math.round((testScore / testResults.length) * 100) : 0}%・経過 {formatElapsedTime(testElapsedSeconds)}</p>
                  <div className="english-result-list statistics-result-list">
                    {testResults.map((result, index) => (
                      <article key={`${result.question.id}-${index}`} className={result.correct ? "is-correct" : "is-wrong"}>
                        <span>{result.correct ? "○" : "×"} Q{index + 1}</span>
                        <strong><RichMathText text={result.question.prompt} /></strong>
                        <p>あなた：<RichMathText text={result.response || "未回答"} /></p>
                        {!result.correct && <p>正解：<RichMathText text={result.question.answer} /></p>}
                        <p>解説：<RichMathText text={result.question.explanation} /></p>
                      </article>
                    ))}
                  </div>
                  <div className="english-result-actions statistics-result-actions">
                    <button type="button" onClick={startTest}>同じ設定でもう一度</button>
                    <button type="button" onClick={() => setTestPhase("setup")}>設定を変える</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {mode === "expected" && <SmartControlExams />}

          {mode === "guide" && (
            <section className="english-guide-workspace statistics-guide-workspace" aria-labelledby="smart-guide-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>FORMAT GUIDE</span><h2 id="smart-guide-title">出題形式ガイド</h2></div>
                <p>過去問1・2・3から読み取れる「問い方」だけを、今回の範囲5単元へ当てはめています。</p>
              </div>
              <div className="english-guide-tip statistics-format-notice">
                <span>FORMAT ONLY</span>
                <p>過去問の範囲外テーマや数値は収録していません。過去問2も制御分野の重複部分だけが学習対象です。</p>
              </div>
              <div className="english-guide-grid statistics-guide-grid">
                {SMART_CONTROL_EXAM_FORMATS.map((format, index) => (
                  <article key={format.id}>
                    <span>{String(index + 1).padStart(2, "0")} / FORMAT</span>
                    <h3>{format.title}</h3>
                    <p>{format.description}</p>
                    <strong>{format.strategy}</strong>
                  </article>
                ))}
              </div>
              <div className="english-guide-tip statistics-exam-tip">
                <span>EXAM ROUTINE</span>
                <p><b>式を立てる → 因数分解・部分分数 → 極を列挙 → 実部で安定判定。</b>最終答えだけでなく、途中式を1行ずつ残す練習をしてください。</p>
              </div>
              <div className="english-result-actions statistics-scope-actions">
                <button type="button" onClick={() => changeMode("expected")}>A4想定試験を開く</button>
                <button type="button" onClick={() => changeMode("test")}>ランダム模試を作る</button>
              </div>
            </section>
          )}
        </section>

        <p className="sr-announcement" aria-live="polite">{announcement}</p>
      </main>

      <footer className="english-footer statistics-footer">
        <span>TEST//GRID</span><p>SMART CONTROL · ELAPSED TIME ONLY · SUBJECT 06</p><span>RANGE VERIFIED</span>
      </footer>
    </div>
  );
}
