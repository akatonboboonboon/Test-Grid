"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import CardDeckSearch from "../../card-deck-search";
import MaterialMechanicsExpectedExams from "../../material-mechanics-expected-exams";
import MaterialMechanicsDiagram from "../../material-mechanics-diagrams";
import { DisplayMath, RichMathText } from "../../statistics-math";
import {
  MATERIAL_MECHANICS_EXAM_FORMATS,
  MATERIAL_MECHANICS_EXAM_SPEC,
  MATERIAL_MECHANICS_EXPECTED_EXAMS,
  MATERIAL_MECHANICS_FORMULAS,
  MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS,
  MATERIAL_MECHANICS_QUESTIONS,
  MATERIAL_MECHANICS_RANGE_PAGES,
  MATERIAL_MECHANICS_SOURCE_POLICY,
  MATERIAL_MECHANICS_TOPICS,
} from "../../material-mechanics-data";

type MaterialMechanicsTopicId = (typeof MATERIAL_MECHANICS_TOPICS)[number]["id"];
type MaterialMechanicsQuestion = (typeof MATERIAL_MECHANICS_QUESTIONS)[number];

type Mode = "scope" | "cards" | "practice" | "test" | "expected" | "guide";
type CardState = "learning" | "mastered";
type CardProgress = Record<string, CardState>;
type Feedback = { response: string; correct: boolean };
type TestPhase = "setup" | "active" | "result";
type TestResult = { question: MaterialMechanicsQuestion; response: string; correct: boolean };
type SourceFilter = "all" | "range-zip" | "format-2-overlap";
type SavedTestSession = {
  version: 1;
  questionIds: string[];
  selectedTopics: MaterialMechanicsTopicId[];
  sourceFilter: SourceFilter;
  questionCountDraft: string;
  timeMinutesDraft: string;
  durationSeconds: number;
  testIndex: number;
  typedAnswer: string;
  selectedChoice: string;
  feedback: Feedback | null;
  results: Array<{ questionId: string; response: string; correct: boolean }>;
  elapsedSeconds: number;
  savedAt: number;
};

const PROGRESS_KEY = "test-grid:subject-5:progress:v1";
const TEST_SESSION_KEY = "test-grid:subject-5:mock-test:v1";
const ALL_TOPIC_IDS = MATERIAL_MECHANICS_TOPICS.map((topic) => topic.id);
const KNOWN_TOPIC_IDS = new Set<MaterialMechanicsTopicId>(ALL_TOPIC_IDS);
const KNOWN_QUESTION_IDS = new Set([...MATERIAL_MECHANICS_QUESTIONS, ...MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS].map((question) => question.id));

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
    .replace(/[「」『』【】（）()。、，,.!?！？：:；;\s]/g, "")
    .trim();
}

function normalizeUnitToken(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/\s+/g, "")
    .replace(/℃/g, "°c")
    .replace(/[·・⋅*]/g, "")
    .replace(/\^2/g, "2")
    .replace(/\^3/g, "3");
}

function parseNumericResponse(question: MaterialMechanicsQuestion, value: string) {
  let normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[−–—]/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/℃/g, "°c")
    .replace(/[·・⋅*]/g, "")
    .replace(/\^2/g, "2")
    .replace(/\^3/g, "3")
    .replace(/^約/, "");

  const pieces = normalized.split(/(?:=|≈|≒)/).filter(Boolean);
  normalized = pieces.at(-1) ?? normalized;

  const acceptedUnits = Object.entries(question.acceptedUnits ?? {})
    .map(([label, factor]) => ({ label: normalizeUnitToken(label), factor }))
    .sort((left, right) => right.label.length - left.label.length);
  const acceptedUnit = acceptedUnits.find((candidate) => normalized.endsWith(candidate.label));
  let unit = "";
  let factor = 1;

  if (acceptedUnit) {
    unit = acceptedUnit.label;
    factor = acceptedUnit.factor;
    normalized = normalized.slice(0, -unit.length);
  } else {
    const unitMatch = normalized.match(/([a-z°℃%][a-z0-9°℃³^/・*()%]*)$/i);
    const rawUnit = unitMatch?.[1] ?? "";
    unit = normalizeUnitToken(rawUnit);
    if (rawUnit) normalized = normalized.slice(0, -rawUnit.length);
    if (unit === "%") factor = 0.01;
  }

  if ((question.requiresUnit && !unit) || (unit && acceptedUnits.length > 0 && !acceptedUnit)) return null;

  const fraction = normalized.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
  let parsed: number;
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    parsed = Number(fraction[1]) / denominator;
  } else if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) {
    parsed = Number(normalized);
  } else {
    return null;
  }

  return Number.isFinite(parsed) ? parsed * factor : null;
}
function isCorrectAnswer(question: MaterialMechanicsQuestion, response: string) {
  if (question.format === "number") {
    const parsed = parseNumericResponse(question, response);
    if (parsed === null || question.numericAnswer === undefined) return false;
    const tolerance = question.tolerance ?? Math.max(1e-9, Math.abs(question.numericAnswer) * 1e-9);
    return Math.abs(parsed - question.numericAnswer) <= tolerance;
  }

  const normalized = normalizeText(response);
  const references = [question.answer, ...(question.accepted ?? [])];
  if (references.some((answer) => normalizeText(answer) === normalized)) return true;
  if (question.format === "choice") return false;

  const keywords = question.keywords ?? [];
  if (!keywords.length) return false;
  const matched = keywords.filter((keyword) => normalized.includes(normalizeText(keyword))).length;
  return matched >= (question.minKeywords ?? keywords.length);
}

function topicLabel(topicId: MaterialMechanicsTopicId) {
  return MATERIAL_MECHANICS_TOPICS.find((topic) => topic.id === topicId)?.shortTitle ?? topicId;
}

function formatLabel(question: MaterialMechanicsQuestion) {
  if (question.format === "choice") return "選択";
  if (question.format === "diagram") return "線図・記述";
  if (question.format === "text") return "記述";
  return "数値入力";
}

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
      ? parsed.selectedTopics.filter((topic): topic is MaterialMechanicsTopicId => typeof topic === "string" && KNOWN_TOPIC_IDS.has(topic as MaterialMechanicsTopicId))
      : [];

    return {
      version: 1,
      questionIds: parsed.questionIds,
      selectedTopics: selectedTopics.length ? selectedTopics : [...ALL_TOPIC_IDS],
      sourceFilter: parsed.sourceFilter === "range-zip" || parsed.sourceFilter === "format-2-overlap" ? parsed.sourceFilter : "all",
      questionCountDraft: typeof parsed.questionCountDraft === "string" ? parsed.questionCountDraft : String(parsed.questionIds.length),
      timeMinutesDraft: typeof parsed.timeMinutesDraft === "string" ? parsed.timeMinutesDraft : "15",
      durationSeconds: typeof parsed.durationSeconds === "number" ? Math.min(10_800, Math.max(60, Math.floor(parsed.durationSeconds))) : 15 * 60,
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

function matchesSource(question: MaterialMechanicsQuestion, source: SourceFilter) {
  if (source === "all") return true;
  const refs = (question as unknown as { sourceRefs?: ReadonlyArray<{ kind?: string }> }).sourceRefs ?? [];
  return refs.some((ref) => ref.kind === source);
}

function SourceFilterControl({ value, onChange, name }: { value: SourceFilter; onChange: (value: SourceFilter) => void; name: string }) {
  const options: Array<{ value: SourceFilter; label: string }> = [
    { value: "all", label: "全教材" },
    { value: "range-zip", label: "範囲ZIP" },
    { value: "format-2-overlap", label: "形式2・範囲一致部" },
  ];
  return (
    <fieldset className="english-choice-answer english-test-groups statistics-topic-filter">
      <legend>出典で絞り込む</legend>
      {options.map((option) => (
        <label key={option.value}>
          <input type="radio" name={name} checked={value === option.value} onChange={() => onChange(option.value)} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
function TopicFilter({
  legend,
  selected,
  onChange,
}: {
  legend: string;
  selected: MaterialMechanicsTopicId[];
  onChange: (topics: MaterialMechanicsTopicId[]) => void;
}) {
  function toggle(topicId: MaterialMechanicsTopicId) {
    onChange(selected.includes(topicId)
      ? selected.filter((id) => id !== topicId)
      : [...selected, topicId]);
  }

  return (
    <fieldset className="english-choice-answer english-test-groups statistics-topic-filter">
      <legend>{legend}（複数選択）</legend>
      <div className="english-result-actions statistics-filter-actions">
        <button type="button" onClick={() => onChange([...ALL_TOPIC_IDS])}>すべて選択</button>
        <button type="button" onClick={() => onChange([])}>すべて解除</button>
      </div>
      {MATERIAL_MECHANICS_TOPICS.map((topic) => (
        <label key={topic.id}>
          <input type="checkbox" checked={selected.includes(topic.id)} onChange={() => toggle(topic.id)} />
          <span>{topic.number}｜{topic.shortTitle}</span>
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
  question: MaterialMechanicsQuestion;
  typedAnswer: string;
  selectedChoice: string;
  feedback: Feedback | null;
  onTypedAnswer: (value: string) => void;
  onSelectedChoice: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const response = question.format === "choice" ? selectedChoice : typedAnswer;
  return (
    <form className="english-answer-form statistics-answer-form" onSubmit={onSubmit}>
      {question.format === "number" && (
        <label className="english-input-answer statistics-number-answer">
          <span>数値を入力</span>
          <input
            autoComplete="off"
            inputMode="decimal"
            value={typedAnswer}
            disabled={Boolean(feedback)}
            onChange={(event) => onTypedAnswer(event.target.value)}
            placeholder="小数・分数・%で入力できます"
          />
        </label>
      )}
      {question.format !== "number" && question.format !== "choice" && (
        <label className="english-input-answer english-translation-answer statistics-text-answer">
          <span>式・説明を入力</span>
          <textarea
            rows={4}
            autoComplete="off"
            value={typedAnswer}
            disabled={Boolean(feedback)}
            onChange={(event) => onTypedAnswer(event.target.value)}
            placeholder="定義式または理由を入力"
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
      {!feedback && <button className="english-submit-answer statistics-submit-answer" type="submit" disabled={!response.trim()}>採点する →</button>}
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
  question: MaterialMechanicsQuestion;
  feedback: Feedback;
  onOverride?: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className={`generic-test-answer english-test-feedback statistics-feedback ${feedback.correct ? "is-correct" : "is-wrong"}`} aria-live="polite">
      <strong>{feedback.correct ? "正解" : "不正解"}</strong>
      <p><span>あなたの解答</span><RichMathText text={feedback.response} /></p>
      <p><span>正解</span><RichMathText text={question.answer} /></p>
      {question.diagram && <MaterialMechanicsDiagram kind={question.diagram} solution title="模範図・注記" />}
      {question.formula && <div className="statistics-solution-formula"><span>使う公式</span><DisplayMath tex={question.formula} /></div>}
      <div className="statistics-solution-steps">
        <span>途中式</span>
        <ol>{question.steps.map((step, index) => <li key={question.id + "-step-" + index}><RichMathText text={step} /></li>)}</ol>
      </div>
      <p><span>解説</span><RichMathText text={question.explanation} /></p>
      {onOverride && !feedback.correct && question.format !== "number" && question.format !== "choice" && (
        <button className="english-translation-override statistics-answer-override" type="button" onClick={onOverride}>内容は合っていた → 正解にする</button>
      )}
      <button type="button" onClick={onNext}>{nextLabel}</button>
    </div>
  );
}

export default function MaterialMechanicsSubjectPage() {
  const [mode, setMode] = useState<Mode>("scope");
  const [progress, setProgress] = useState<CardProgress>({});
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const workspaceRef = useRef<HTMLElement>(null);

  const [cardTopics, setCardTopics] = useState<MaterialMechanicsTopicId[]>([...ALL_TOPIC_IDS]);
  const [cardDeck, setCardDeck] = useState([...MATERIAL_MECHANICS_FORMULAS]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  const [practiceTopics, setPracticeTopics] = useState<MaterialMechanicsTopicId[]>([...ALL_TOPIC_IDS]);
  const [practiceSourceFilter, setPracticeSourceFilter] = useState<SourceFilter>("all");
  const [practiceDeck, setPracticeDeck] = useState([...MATERIAL_MECHANICS_QUESTIONS]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceTypedAnswer, setPracticeTypedAnswer] = useState("");
  const [practiceSelectedChoice, setPracticeSelectedChoice] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<Feedback | null>(null);

  const [testPhase, setTestPhase] = useState<TestPhase>("setup");
  const [testTopics, setTestTopics] = useState<MaterialMechanicsTopicId[]>([...ALL_TOPIC_IDS]);
  const [testSourceFilter, setTestSourceFilter] = useState<SourceFilter>("all");
  const [questionCountDraft, setQuestionCountDraft] = useState("20");
  const [timeMinutesDraft, setTimeMinutesDraft] = useState("15");
  const [testDurationSeconds, setTestDurationSeconds] = useState(15 * 60);
  const [testQuestions, setTestQuestions] = useState<MaterialMechanicsQuestion[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testTypedAnswer, setTestTypedAnswer] = useState("");
  const [testSelectedChoice, setTestSelectedChoice] = useState("");
  const [testFeedback, setTestFeedback] = useState<Feedback | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testElapsedSeconds, setTestElapsedSeconds] = useState(0);
  const [savedTestSession, setSavedTestSession] = useState<SavedTestSession | null>(null);

  /* Device-local progress and a paused mock test are restored after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProgress(restoreProgress());
    setSavedTestSession(restoreTestSession());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // A blocked localStorage must not stop the study session.
    }
  }, [hydrated, progress]);

  useEffect(() => {
    if (testPhase !== "active") return;
    const timer = window.setInterval(() => {
      setTestElapsedSeconds((seconds) => {
        const next = seconds + 1;
        if (next >= testDurationSeconds) {
          setTestPhase("result");
          setSavedTestSession(null);
          try { window.localStorage.removeItem(TEST_SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
          return testDurationSeconds;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [testDurationSeconds, testPhase]);

  useEffect(() => {
    if (!hydrated || testPhase !== "active" || !testQuestions.length) return;
    persistTestSession({
      version: 1,
      questionIds: testQuestions.map((question) => question.id),
      selectedTopics: testTopics,
      sourceFilter: testSourceFilter,
      questionCountDraft,
      timeMinutesDraft,
      durationSeconds: testDurationSeconds,
      testIndex,
      typedAnswer: testTypedAnswer,
      selectedChoice: testSelectedChoice,
      feedback: testFeedback,
      results: testResults.map((result) => ({ questionId: result.question.id, response: result.response, correct: result.correct })),
      elapsedSeconds: testElapsedSeconds,
      savedAt: Date.now(),
    });
  }, [hydrated, questionCountDraft, testDurationSeconds, testElapsedSeconds, testFeedback, testIndex, testPhase, testQuestions, testResults, testSelectedChoice, testSourceFilter, testTopics, testTypedAnswer, timeMinutesDraft]);

  const filteredCards = useMemo(
    () => MATERIAL_MECHANICS_FORMULAS.filter((card) => cardTopics.includes(card.topic)),
    [cardTopics],
  );
  const currentCard = cardDeck[cardIndex];
  const cardMastered = filteredCards.filter((card) => progress[card.id] === "mastered").length;
  const cardLearning = filteredCards.filter((card) => progress[card.id] === "learning").length;
  const cardCompletion = filteredCards.length ? Math.round((cardMastered / filteredCards.length) * 100) : 0;

  const currentPracticeQuestion = practiceDeck[practiceIndex];
  const availableTestQuestions = useMemo(
    () => MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS.filter((question) => testTopics.includes(question.topic) && matchesSource(question, testSourceFilter)),
    [testSourceFilter, testTopics],
  );
  const currentTestQuestion = testQuestions[testIndex];
  const testScore = testResults.filter((result) => result.correct).length;
  const testRemainingSeconds = Math.max(0, testDurationSeconds - testElapsedSeconds);
  const totalMastered = MATERIAL_MECHANICS_FORMULAS.filter((card) => progress[card.id] === "mastered").length;

  function changeMode(nextMode: Mode) {
    if (mode === "test" && testPhase === "active" && nextMode !== "test") pauseTest();
    setMode(nextMode);
    window.setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function jumpToFormulaCard(cardId: string) {
    const card = MATERIAL_MECHANICS_FORMULAS.find((item) => item.id === cardId);
    if (!card) return;
    const alreadyVisible = cardTopics.includes(card.topic);
    const nextTopics = alreadyVisible ? cardTopics : [...cardTopics, card.topic];
    const nextDeck = MATERIAL_MECHANICS_FORMULAS.filter((item) => nextTopics.includes(item.topic));
    setCardTopics(nextTopics);
    setCardDeck(nextDeck);
    setCardIndex(Math.max(0, nextDeck.findIndex((item) => item.id === cardId)));
    setCardFlipped(false);
    setAnnouncement(card.title + "のカードを開きました。" + (alreadyVisible ? "" : "対象単元も表示に追加しました。"));
  }

  function changeCardTopics(nextTopics: MaterialMechanicsTopicId[]) {
    setCardTopics(nextTopics);
    setCardDeck(MATERIAL_MECHANICS_FORMULAS.filter((card) => nextTopics.includes(card.topic)));
    setCardIndex(0);
    setCardFlipped(false);
  }

  function shuffleCards() {
    setCardDeck(randomize(filteredCards));
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement("選択中の公式カードをシャッフルしました。");
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

  function reviewUnmastered() {
    const remaining = filteredCards.filter((card) => progress[card.id] !== "mastered");
    setCardDeck(randomize(remaining.length ? remaining : filteredCards));
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement(remaining.length ? `未暗記の${remaining.length}枚で復習します。` : "全カードをもう一周します。");
  }

  function changePracticeTopics(nextTopics: MaterialMechanicsTopicId[]) {
    setPracticeTopics(nextTopics);
    setPracticeDeck(randomize(MATERIAL_MECHANICS_QUESTIONS.filter((question) => nextTopics.includes(question.topic) && matchesSource(question, practiceSourceFilter))));
    setPracticeIndex(0);
    setPracticeTypedAnswer("");
    setPracticeSelectedChoice("");
    setPracticeFeedback(null);
  }

  function changePracticeSource(source: SourceFilter) {
    setPracticeSourceFilter(source);
    setPracticeDeck(randomize(MATERIAL_MECHANICS_QUESTIONS.filter((question) => practiceTopics.includes(question.topic) && matchesSource(question, source))));
    setPracticeIndex(0);
    setPracticeTypedAnswer("");
    setPracticeSelectedChoice("");
    setPracticeFeedback(null);
  }

  function shufflePractice() {
    setPracticeDeck(randomize(MATERIAL_MECHANICS_QUESTIONS.filter((question) => practiceTopics.includes(question.topic) && matchesSource(question, practiceSourceFilter))));
    setPracticeIndex(0);
    setPracticeTypedAnswer("");
    setPracticeSelectedChoice("");
    setPracticeFeedback(null);
  }

  function submitPracticeAnswer(event: React.FormEvent) {
    event.preventDefault();
    if (!currentPracticeQuestion || practiceFeedback) return;
    const response = currentPracticeQuestion.format === "choice" ? practiceSelectedChoice : practiceTypedAnswer.trim();
    if (!response) return;
    setPracticeFeedback({ response, correct: isCorrectAnswer(currentPracticeQuestion, response) });
  }

  function acceptPracticeText() {
    if (!practiceFeedback || !currentPracticeQuestion || currentPracticeQuestion.format === "number" || currentPracticeQuestion.format === "choice") return;
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
    setPracticeTypedAnswer("");
    setPracticeSelectedChoice("");
    setPracticeFeedback(null);
  }

  function startTest() {
    if (!availableTestQuestions.length) return;
    const requested = Number.parseInt(questionCountDraft, 10);
    const count = Math.max(1, Math.min(Number.isFinite(requested) ? requested : 1, availableTestQuestions.length));
    const questions = randomize(availableTestQuestions).slice(0, count);
    const requestedMinutes = Number.parseInt(timeMinutesDraft, 10);
    const minutes = Math.min(180, Math.max(1, Number.isFinite(requestedMinutes) ? requestedMinutes : 15));
    try { window.localStorage.removeItem(TEST_SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedTestSession(null);
    setQuestionCountDraft(String(count));
    setTimeMinutesDraft(String(minutes));
    setTestDurationSeconds(minutes * 60);
    setTestQuestions(questions);
    setTestIndex(0);
    setTestTypedAnswer("");
    setTestSelectedChoice("");
    setTestFeedback(null);
    setTestResults([]);
    setTestElapsedSeconds(0);
    setTestPhase("active");
  }

  function submitTestAnswer(event: React.FormEvent) {
    event.preventDefault();
    if (!currentTestQuestion || testFeedback) return;
    const response = currentTestQuestion.format === "choice" ? testSelectedChoice : testTypedAnswer.trim();
    if (!response) return;
    const correct = isCorrectAnswer(currentTestQuestion, response);
    setTestFeedback({ response, correct });
    setTestResults((current) => [...current, { question: currentTestQuestion, response, correct }]);
  }

  function acceptTestText() {
    if (!testFeedback || !currentTestQuestion || currentTestQuestion.format === "number" || currentTestQuestion.format === "choice") return;
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
      sourceFilter: testSourceFilter,
      questionCountDraft,
      timeMinutesDraft,
      durationSeconds: testDurationSeconds,
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
      const found = MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS.find((question) => question.id === id) ?? MATERIAL_MECHANICS_QUESTIONS.find((question) => question.id === id);
      return found ? [found] : [];
    });
    if (!questions.length) {
      deleteSavedTest();
      return;
    }
    const results = savedTestSession.results.flatMap((savedResult) => {
      const question = MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS.find((item) => item.id === savedResult.questionId) ?? MATERIAL_MECHANICS_QUESTIONS.find((item) => item.id === savedResult.questionId);
      return question ? [{ question, response: savedResult.response, correct: savedResult.correct }] : [];
    });
    setTestTopics(savedTestSession.selectedTopics);
    setTestSourceFilter(savedTestSession.sourceFilter);
    setQuestionCountDraft(savedTestSession.questionCountDraft);
    setTimeMinutesDraft(savedTestSession.timeMinutesDraft);
    setTestDurationSeconds(savedTestSession.durationSeconds);
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

  const pageStyle = { "--subject-accent": "#ffd65c", "--english-yellow": "#ffd65c" } as CSSProperties;

  return (
    <div className="app-frame generic-subject-page english-page statistics-page" style={pageStyle}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">S/M</span>
          <span><strong>TEST//GRID</strong><small>MATERIAL MECHANICS</small></span>
        </Link>
        <div className="header-actions statistics-header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {MATERIAL_MECHANICS_QUESTIONS.length} QUESTIONS</span>
          <Link className="outline-button header-link" href="/cards?subject=subject-5">暗記帳検索</Link>
          <Link className="outline-button header-link" href="/rapid/subject-5">時間制限 即答</Link>
          <Link className="outline-button header-link generated-practice-subject-link" href="/generated-practice?subject=subject-5">自動生成問題・共有履歴</Link>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="generic-subject-main english-main statistics-main">
        <nav className="subject-breadcrumb statistics-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">材料力学</strong>
        </nav>

        <section className="generic-subject-hero english-hero statistics-hero" aria-labelledby="statistics-title">
          <div className="english-hero-copy statistics-hero-copy">
            <p><span>SUBJECT 05</span><span>RANGE-VERIFIED ONLY</span></p>
            <h1 id="statistics-title">材料力学</h1>
            <small>範囲ZIPの{MATERIAL_MECHANICS_RANGE_PAGES.length}枚を正本に、ねじり・軸設計・コイルばね・はりを学習します。形式2は範囲と一致する第1〜3問相当だけを採用し、形式1・3は紙面構成の参照に限定しています。</small>
          </div>
          <button className="english-hero-memory-button statistics-hero-card-button" type="button" onClick={() => changeMode("cards")}>
            <span>FORMULAS FIRST</span>
            <strong>公式カードを開く</strong>
            <small>{MATERIAL_MECHANICS_FORMULAS.length}枚を単元別に暗記 →</small>
          </button>
        </section>

        <section className="english-summary statistics-summary" aria-label="収録教材">
          <div><span>TOPICS</span><strong>{MATERIAL_MECHANICS_TOPICS.length}</strong><small>単元</small></div>
          <div><span>FORMULAS</span><strong>{MATERIAL_MECHANICS_FORMULAS.length}</strong><small>枚</small></div>
          <div><span>QUESTIONS</span><strong>{MATERIAL_MECHANICS_QUESTIONS.length}</strong><small>問</small></div>
          <p>範囲ZIP9枚と、形式2の範囲一致部だけを演習へ収録。A4想定試験{MATERIAL_MECHANICS_EXPECTED_EXAMS.length}回を、50分初期値・練習用100点・60点ラインで解けます。公式は {totalMastered}枚暗記済み。</p>
        </section>

        <section ref={workspaceRef} id="statistics-workspace" className="english-workspace statistics-workspace">
          <div className="workspace-tabs english-tabs statistics-tabs" role="tablist" aria-label="材料力学の学習モード">
            <button type="button" role="tab" aria-selected={mode === "scope"} className={mode === "scope" ? "active" : ""} onClick={() => changeMode("scope")}>① 範囲</button>
            <button type="button" role="tab" aria-selected={mode === "cards"} className={mode === "cards" ? "active english-tab-memory" : "english-tab-memory"} onClick={() => changeMode("cards")}>② 公式カード</button>
            <button type="button" role="tab" aria-selected={mode === "practice"} className={mode === "practice" ? "active" : ""} onClick={() => changeMode("practice")}>③ 計算演習</button>
            <button type="button" role="tab" aria-selected={mode === "test"} className={mode === "test" ? "active" : ""} onClick={() => changeMode("test")}>④ ランダム模試</button>
            <button type="button" role="tab" aria-selected={mode === "expected"} className={mode === "expected" ? "active" : ""} onClick={() => changeMode("expected")}>⑤ A4想定試験</button>
            <button type="button" role="tab" aria-selected={mode === "guide"} className={mode === "guide" ? "active" : ""} onClick={() => changeMode("guide")}>⑥ 出題形式</button>
          </div>

          {mode === "scope" && (
            <section className="english-guide-workspace statistics-scope-workspace" aria-labelledby="statistics-scope-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>COURSE RANGE</span><h2 id="statistics-scope-title">今回の試験範囲</h2></div>
                <p>テスト範囲ZIPの{MATERIAL_MECHANICS_RANGE_PAGES.length}枚を正本として整理した{MATERIAL_MECHANICS_TOPICS.length}単元です。形式2は範囲ZIPと一致するはり部分だけを追加しています。</p>
              </div>
              <div className="english-guide-tip statistics-source-policy">
                <span>SOURCE POLICY</span>
                <p><b>出題する：</b>範囲ZIP9枚＋形式2の第1〜3問相当　／　<b>除外：</b>形式2の曲げ応力・断面二次モーメント、形式1・3の旧範囲内容<br /><small>{MATERIAL_MECHANICS_SOURCE_POLICY.note} 正式な試験時間と配点は資料で確認できないため、50分・100点・60点は練習用です。</small></p>
              </div>
              <div className="english-guide-grid statistics-topic-grid">
                {MATERIAL_MECHANICS_TOPICS.map((topic) => {
                  const formulaCount = MATERIAL_MECHANICS_FORMULAS.filter((card) => card.topic === topic.id).length;
                  const questionCount = MATERIAL_MECHANICS_QUESTIONS.filter((question) => question.topic === topic.id).length;
                  return (
                    <article key={topic.id} className="statistics-topic-card" style={{ borderTopColor: topic.color }}>
                      <span>{topic.number} / RANGE</span>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                      <strong>公式 {formulaCount}枚・演習 {questionCount}問</strong>
                    </article>
                  );
                })}
              </div>
              <div className="english-result-actions statistics-scope-actions">
                <button type="button" onClick={() => changeMode("cards")}>公式暗記から始める</button>
                <button type="button" onClick={() => changeMode("practice")}>計算演習へ進む</button>
              </div>
            </section>
          )}

          {mode === "cards" && (
            <section className="generic-card-workspace english-card-workspace statistics-card-workspace" aria-labelledby="statistics-card-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>FORMULA MEMORY</span><h2 id="statistics-card-title">公式カード</h2></div>
                <p>表面の問いに答えてから裏返し、公式・意味・使いどころをまとめて確認します。</p>
              </div>
              <TopicFilter legend="カードに含める単元" selected={cardTopics} onChange={changeCardTopics} />
              <CardDeckSearch
                items={MATERIAL_MECHANICS_FORMULAS.map((card) => ({
                  id: card.id,
                  label: card.title,
                  description: card.prompt,
                  meta: topicLabel(card.topic),
                  searchText: [card.formula, card.explanation, card.cue, card.example],
                }))}
                currentId={currentCard?.id}
                label="材料力学の公式カードを検索"
                onSelect={jumpToFormulaCard}
              />
              <div className="generic-progress english-card-progress statistics-card-progress">
                <div><span>覚えた {cardMastered} / {filteredCards.length}・もう一度 {cardLearning}</span><strong>{cardCompletion}%</strong></div>
                <progress value={cardCompletion} max="100" aria-label={`公式カード暗記進捗 ${cardCompletion}%`} />
              </div>

              {currentCard ? (
                <>
                  <div className="generic-deck-meta english-deck-meta statistics-deck-meta"><span>CARD {cardIndex + 1} / {cardDeck.length}</span><span>{topicLabel(currentCard.topic)} · {progress[currentCard.id] === "mastered" ? "覚えた" : progress[currentCard.id] === "learning" ? "もう一度" : "未判定"}</span></div>
                  <button type="button" className={`generic-flip-card english-flip-card statistics-flip-card material-mechanics-flip-card ${cardFlipped ? "is-flipped" : ""}`} onClick={() => setCardFlipped((flipped) => !flipped)} aria-label={cardFlipped ? "問題面に戻る" : "公式を見る"}>
                    <span>{cardFlipped ? currentCard.title : "QUESTION"}</span>
                    {cardFlipped
                      ? <DisplayMath tex={currentCard.formula} ariaLabel={currentCard.title + "の公式"} />
                      : <strong><RichMathText text={currentCard.prompt} /></strong>}
                    <small>{cardFlipped ? <RichMathText text={currentCard.cue} /> : "頭の中で公式を書いてからタップ"}</small>
                  </button>
                  {currentCard.diagram && <MaterialMechanicsDiagram kind={currentCard.diagram} solution={cardFlipped} title={cardFlipped ? "公式と対応する模式図" : "問題の模式図"} />}
                  {cardFlipped && (
                    <div className="english-guide-tip statistics-card-explanation">
                      <span>WHY / HOW</span><p><RichMathText text={currentCard.explanation} />{currentCard.example ? <><br /><b>例：</b><RichMathText text={currentCard.example} /></> : null}</p>
                    </div>
                  )}
                  <div className="generic-card-controls english-card-controls statistics-card-controls">
                    <button type="button" onClick={() => moveCard(-1)}>← 前へ</button>
                    <button type="button" className="again" disabled={!cardFlipped} onClick={() => markCard("learning")}>1　もう一度</button>
                    <button type="button" className="mastered" disabled={!cardFlipped} onClick={() => markCard("mastered")}>2　覚えた</button>
                    <button type="button" onClick={() => moveCard(1)}>次へ →</button>
                  </div>
                  <div className="generic-deck-tools english-deck-tools statistics-deck-tools"><button type="button" onClick={shuffleCards}>シャッフル</button><button type="button" onClick={reviewUnmastered}>未暗記だけ復習</button></div>
                </>
              ) : (
                <div className="generic-empty english-empty statistics-empty"><span>NO TOPIC</span><h3>出題する単元を1つ以上選んでください。</h3></div>
              )}
            </section>
          )}

          {mode === "practice" && (
            <section className="generic-test-workspace english-test-workspace statistics-practice-workspace" aria-labelledby="statistics-practice-title">
              <div className="english-panel-heading statistics-panel-heading">
                <div><span>CALCULATION PRACTICE</span><h2 id="statistics-practice-title">計算演習</h2></div>
                <p>全角数字、小数、分数、%を採点できます。記述問題はキーワードで判定し、誤判定なら自己修正できます。</p>
              </div>
              <TopicFilter legend="演習に含める単元" selected={practiceTopics} onChange={changePracticeTopics} />
              <SourceFilterControl value={practiceSourceFilter} onChange={changePracticeSource} name="mechanical-practice-source" />
              <div className="english-result-actions statistics-practice-tools"><span>{practiceDeck.length}問を出題対象に設定</span><button type="button" disabled={!practiceDeck.length} onClick={shufflePractice}>問題順をシャッフル</button></div>

              {currentPracticeQuestion ? (
                <div className="english-test-active statistics-practice-active">
                  <div className="generic-deck-meta english-test-meta statistics-question-meta"><span>QUESTION {practiceIndex + 1} / {practiceDeck.length}</span><span>{topicLabel(currentPracticeQuestion.topic)} · {currentPracticeQuestion.genre} · 難度{currentPracticeQuestion.difficulty} · {formatLabel(currentPracticeQuestion)}</span></div>
                  {currentPracticeQuestion.context && <div className="english-guide-tip statistics-question-context"><span>GIVEN</span><p><RichMathText text={currentPracticeQuestion.context} /></p></div>}
                  <div className="generic-test-question english-test-question statistics-test-question"><span>問題</span><h2><RichMathText text={currentPracticeQuestion.prompt} /></h2></div>
                  {currentPracticeQuestion.diagram && <MaterialMechanicsDiagram kind={currentPracticeQuestion.diagram} title="解答用線図" />}
                  <AnswerForm idPrefix="practice" question={currentPracticeQuestion} typedAnswer={practiceTypedAnswer} selectedChoice={practiceSelectedChoice} feedback={practiceFeedback} onTypedAnswer={setPracticeTypedAnswer} onSelectedChoice={setPracticeSelectedChoice} onSubmit={submitPracticeAnswer} />
                  {practiceFeedback && <SolutionFeedback question={currentPracticeQuestion} feedback={practiceFeedback} onOverride={acceptPracticeText} onNext={nextPracticeQuestion} nextLabel={practiceIndex === practiceDeck.length - 1 ? "一周してもう一度 →" : "次の問題へ →"} />}
                </div>
              ) : (
                <div className="generic-empty english-empty statistics-empty"><span>NO QUESTION</span><h3>演習する単元を1つ以上選んでください。</h3></div>
              )}
            </section>
          )}

          {mode === "test" && (
            <section className="generic-test-workspace english-test-workspace statistics-test-workspace" aria-labelledby="statistics-test-title">
              {testPhase === "setup" && (
                <div className="english-test-setup statistics-test-setup">
                  <div className="english-panel-heading statistics-panel-heading"><div><span>MOCK EXAM</span><h2 id="statistics-test-title">模擬テストを作る</h2></div><p>選んだ単元と出典から、範囲ZIP・形式2の範囲一致部をランダム出題します。</p></div>
                  {savedTestSession && (
                    <div className="generic-test-answer english-test-feedback english-saved-test statistics-saved-test" aria-label="保存中の模擬テスト">
                      <strong>途中の模擬テストがあります</strong>
                      <p><span>進捗</span>Q{savedTestSession.testIndex + 1} / {savedTestSession.questionIds.length}・残り {formatElapsedTime(Math.max(0, savedTestSession.durationSeconds - savedTestSession.elapsedSeconds))}</p>
                      <p><span>保存日時</span>{new Date(savedTestSession.savedAt).toLocaleString("ja-JP")}</p>
                      <div className="english-result-actions statistics-saved-actions"><button type="button" onClick={resumeSavedTest}>続きから再開</button><button type="button" onClick={deleteSavedTest}>保存データを削除</button></div>
                    </div>
                  )}
                  <TopicFilter legend="模試に含める単元" selected={testTopics} onChange={setTestTopics} />
                  <SourceFilterControl value={testSourceFilter} onChange={setTestSourceFilter} name="mechanical-test-source" />
                  <div className="english-test-settings statistics-test-settings">
                    <label><span>問題数 <small>最大 {availableTestQuestions.length}問</small></span><input type="number" min="1" max={Math.max(1, availableTestQuestions.length)} inputMode="numeric" value={questionCountDraft} onChange={(event) => setQuestionCountDraft(event.target.value)} /></label>
                    <label><span>制限時間 <small>1〜180分</small></span><input type="number" min="1" max="180" inputMode="numeric" value={timeMinutesDraft} onChange={(event) => setTimeMinutesDraft(event.target.value)} /></label>
                    <button type="button" onClick={startTest} disabled={!availableTestQuestions.length}>ランダム出題を開始 →</button>
                  </div>
                  <div className="english-format-preview statistics-format-preview"><span>数値入力</span><span>選択</span><span>記述</span><p>{availableTestQuestions.length}問から作成可能</p></div>
                </div>
              )}

              {testPhase === "active" && currentTestQuestion && (
                <div className="english-test-active statistics-test-active">
                  <div className="generic-deck-meta english-test-meta statistics-question-meta"><span>QUESTION {testIndex + 1} / {testQuestions.length}</span><span>{topicLabel(currentTestQuestion.topic)} · {currentTestQuestion.genre} · {formatLabel(currentTestQuestion)}</span></div>
                  <div className="english-result-actions english-test-session-actions statistics-test-session-actions"><span>残り {formatElapsedTime(testRemainingSeconds)}・経過 {formatElapsedTime(testElapsedSeconds)}・現在位置と入力内容を自動保存中</span><button type="button" onClick={pauseTest}>中断して保存</button></div>
                  {currentTestQuestion.context && <div className="english-guide-tip statistics-question-context"><span>GIVEN</span><p><RichMathText text={currentTestQuestion.context} /></p></div>}
                  <div className="generic-test-question english-test-question statistics-test-question"><span>問題</span><h2><RichMathText text={currentTestQuestion.prompt} /></h2></div>
                  {currentTestQuestion.diagram && <MaterialMechanicsDiagram kind={currentTestQuestion.diagram} title="解答用線図" />}
                  <AnswerForm idPrefix="test" question={currentTestQuestion} typedAnswer={testTypedAnswer} selectedChoice={testSelectedChoice} feedback={testFeedback} onTypedAnswer={setTestTypedAnswer} onSelectedChoice={setTestSelectedChoice} onSubmit={submitTestAnswer} />
                  {testFeedback && <SolutionFeedback question={currentTestQuestion} feedback={testFeedback} onOverride={acceptTestText} onNext={nextTestQuestion} nextLabel={testIndex === testQuestions.length - 1 ? "結果を見る" : "次の問題へ →"} />}
                </div>
              )}

              {testPhase === "result" && (
                <div className="english-test-result statistics-test-result">
                  <span>MOCK EXAM RESULT</span><h2>{testScore} / {testQuestions.length}</h2><p>正答率 {testQuestions.length ? Math.round((testScore / testQuestions.length) * 100) : 0}%・設定 {formatElapsedTime(testDurationSeconds)}・経過 {formatElapsedTime(testElapsedSeconds)}</p>
                  <div className="english-result-list statistics-result-list">
                    {testQuestions.map((question, index) => {
                      const result = testResults.find((candidate) => candidate.question.id === question.id);
                      const correct = result?.correct === true;
                      return (
                        <article key={`${question.id}-${index}`} className={correct ? "is-correct" : "is-wrong"}>
                          <span>{correct ? "○" : "×"} Q{index + 1}</span>
                          <strong><RichMathText text={question.prompt} /></strong>
                          <p>あなた：<RichMathText text={result?.response || "未回答"} /></p>
                          {!correct && <p>正解：<RichMathText text={question.answer} /></p>}
                          {question.diagram && <MaterialMechanicsDiagram kind={question.diagram} solution title="振り返り用の模範図" />}
                          <details className="result-review-explanation" open={!correct}>
                            <summary>解説を見る</summary>
                            <p><RichMathText text={question.explanation} /></p>
                          </details>
                          <Link className="result-card-jump" href={"/cards?subject=subject-5&q=" + encodeURIComponent(question.prompt)}>
                            {correct ? "暗記帳で確認する" : "間違えた問題の暗記帳へ →"}
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                  <div className="english-result-actions statistics-result-actions"><button type="button" onClick={startTest}>同じ設定でもう一度</button><button type="button" onClick={() => setTestPhase("setup")}>設定を変える</button></div>
                </div>
              )}
            </section>
          )}

          {mode === "expected" && <MaterialMechanicsExpectedExams />}

          {mode === "guide" && (
            <section className="english-guide-workspace statistics-guide-workspace" aria-labelledby="statistics-guide-title">
              <div className="english-panel-heading statistics-panel-heading"><div><span>FORMAT GUIDE</span><h2 id="statistics-guide-title">出題形式ガイド</h2></div><p>形式1・3は紙面構成だけを参照し、形式2は範囲ZIPと一致する支点・反力・SFD・BMDだけを演習へ反映しています。</p></div>
              <div className="english-guide-tip statistics-format-notice"><span>SOURCE POLICY</span><p>範囲ZIPが今回範囲の正本です。A4模試は{MATERIAL_MECHANICS_EXAM_SPEC.bigQuestionCount}大問・練習用{MATERIAL_MECHANICS_EXAM_SPEC.totalPoints}点で構成し、正式時間と配点は未確認です。初期値50分、{MATERIAL_MECHANICS_EXAM_SPEC.passPoints}点ラインで練習します。</p></div>
              <div className="english-guide-grid statistics-guide-grid">
                {MATERIAL_MECHANICS_EXAM_FORMATS.map((format, index) => (
                  <article key={format.id}>
                    <span>{String(index + 1).padStart(2, "0")} / FORMAT</span>
                    <h3>{format.title}</h3>
                    <p>{format.description}</p>
                    <strong>{format.strategy}</strong>
                  </article>
                ))}
              </div>
              <div className="english-guide-tip statistics-exam-tip"><span>EXAM ROUTINE</span><p><b>荷重・支点・寸法を図へ写す → 等価集中荷重へ置換 → ΣF=0・ΣM=0またはねじり公式を立てる → 単位をN・mm系へ統一 → 数値代入。</b>SFD/BMDは荷重点と支点で区切り、途中式と単位を残します。</p></div>
            </section>
          )}
        </section>

        <p className="sr-announcement" aria-live="polite">{announcement}</p>
      </main>

      <footer className="english-footer statistics-footer"><span>TEST//GRID</span><p>MATERIAL MECHANICS · USER-SET TIME · PRACTICE SCORE /100 · LINE 60</p><span>SUBJECT 05</span></footer>
    </div>
  );
}
