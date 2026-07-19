"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import CardDeckSearch from "../../card-deck-search";
import CardFaceList from "../../card-face-list";
import {
  ENGLISH_PASSAGES,
  ENGLISH_QUESTIONS,
  ENGLISH_UNITS,
  ENGLISH_VOCAB,
  type EnglishQuestion,
  type EnglishVocabCard,
} from "../../english-data";
import {
  chapterMatches,
  normalizeChapterSelection,
  toggleChapterSelection,
} from "../../english-chapter-filter";
import { EnglishQuestionExplanation, EnglishVocabInsight } from "../../english-explanation-panel";
import EnglishCh18Quiz from "../../english-ch18-quiz";
import EnglishExpectedExams from "../../english-expected-exams";
import { ENGLISH_EXAM_LEVEL_QUESTIONS } from "../../english-expected-exams-data";
import EnglishWeatherFigure from "../../english-weather-figure";

type Mode = "cards" | "expected" | "quiz18" | "test" | "reading" | "guide";
type TestPhase = "setup" | "active" | "result";
type ReadingStudyMode = "memory" | "practice";
type CardDirection = "ja-en" | "en-ja";
type CardState = "learning" | "mastered";
type CardProgress = Record<string, CardState>;
type OrderToken = { id: string; text: string };
type AnswerFeedback = { response: string; correct: boolean };
type TestResult = {
  question: EnglishQuestion;
  response: string;
  correct: boolean;
};
type SavedTestSession = {
  version: 2;
  questionIds: string[];
  testUnits: string[];
  questionCountDraft: string;
  selectedGroups: string[];
  testIndex: number;
  typedAnswer: string;
  selectedChoice: string;
  orderRemaining: OrderToken[];
  orderSelected: OrderToken[];
  feedback: AnswerFeedback | null;
  results: Array<{ questionId: string; response: string; correct: boolean }>;
  elapsedSeconds: number;
  savedAt: number;
};

const VOCAB_PROGRESS_KEY = "test-grid:english-memory:v1";
const TEST_SESSION_KEY = "test-grid:english-mock-test:v1";
const COURSE_UNITS = ENGLISH_UNITS.filter((unit) => unit.id !== "exam-sample");
const COURSE_UNIT_IDS = COURSE_UNITS.map((unit) => unit.id);
const COURSE_PASSAGE_IDS = new Set(ENGLISH_PASSAGES.map((passage) => passage.id));
const STUDY_QUESTIONS = ENGLISH_QUESTIONS.filter((question) => question.unit !== "exam-sample");
const EXAM_LEVEL_QUESTIONS = ENGLISH_EXAM_LEVEL_QUESTIONS.filter((question) => question.unit !== "exam-sample");

function questionGenre(question: EnglishQuestion) {
  return question.group.split("｜", 1)[0];
}

const ALL_QUESTION_GROUPS = Array.from(new Set(EXAM_LEVEL_QUESTIONS.map(questionGenre)));

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

function normalizeJapanese(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[「」『』【】（）()。、，,.!?！？：:；;・\s]/g, "")
    .replace(/出来/g, "でき")
    .replace(/為/g, "ため")
    .replace(/及び/g, "および");
}

function bigramSimilarity(left: string, right: string) {
  if (left === right) return 1;
  if (left.length < 2 || right.length < 2) return 0;
  const rightPairs = new Map<string, number>();
  for (let index = 0; index < right.length - 1; index += 1) {
    const pair = right.slice(index, index + 2);
    rightPairs.set(pair, (rightPairs.get(pair) ?? 0) + 1);
  }
  let matches = 0;
  for (let index = 0; index < left.length - 1; index += 1) {
    const pair = left.slice(index, index + 2);
    const remaining = rightPairs.get(pair) ?? 0;
    if (remaining > 0) {
      matches += 1;
      rightPairs.set(pair, remaining - 1);
    }
  }
  return (2 * matches) / (left.length + right.length - 2);
}

function japaneseKeywords(value: string) {
  const stopWords = new Set(["もの", "こと", "ため", "よう", "ところ", "これ", "それ", "そして", "しかし"]);
  return Array.from(new Set(
    value
      .normalize("NFKC")
      .match(/[一-龯々]{2,}|[ァ-ヶー]{3,}|[A-Za-z]+|\d+(?:万|億|km|m)?/g)
      ?.map((word) => word.toLocaleLowerCase("ja"))
      .filter((word) => !stopWords.has(word)) ?? [],
  ));
}

function isAcceptableTranslation(response: string, references: string[]) {
  const normalizedResponse = normalizeJapanese(response);
  if (normalizedResponse.length < 6) return false;
  return references.some((reference) => {
    const normalizedReference = normalizeJapanese(reference);
    if (normalizedResponse === normalizedReference) return true;
    if (bigramSimilarity(normalizedResponse, normalizedReference) >= 0.52) return true;
    const keywords = japaneseKeywords(reference);
    if (keywords.length < 2 || normalizedResponse.length < normalizedReference.length * 0.32) return false;
    const matched = keywords.filter((keyword) => normalizedResponse.includes(normalizeJapanese(keyword))).length;
    return matched >= 2 && matched / keywords.length >= 0.6;
  });
}

function isAcceptableJapaneseMeaning(response: string, references: string[]) {
  const normalizedResponse = normalizeJapanese(response);
  if (normalizedResponse.length < 2) return false;
  const normalizedReferences = references.map(normalizeJapanese).filter(Boolean);
  if (normalizedReferences.includes(normalizedResponse)) return true;
  return references.some((reference) => {
    const normalizedReference = normalizeJapanese(reference);
    const shorter = Math.min(normalizedResponse.length, normalizedReference.length);
    const longer = Math.max(normalizedResponse.length, normalizedReference.length);
    const contains = normalizedResponse.includes(normalizedReference)
      || normalizedReference.includes(normalizedResponse);
    const hasMeaningfulCharacter = /[一-龯々ァ-ヶA-Za-z0-9]/u.test(normalizedResponse);
    if (shorter >= 2 && hasMeaningfulCharacter && contains && shorter / longer >= 0.5) return true;
    if (shorter >= 3 && bigramSimilarity(normalizedResponse, normalizedReference) >= 0.67) return true;
    const keywords = japaneseKeywords(reference);
    const matched = keywords.filter((keyword) => normalizedResponse.includes(normalizeJapanese(keyword))).length;
    return keywords.length > 0 && matched > 0 && matched / keywords.length >= 0.6;
  });
}

function isJapaneseAnswerQuestion(question: EnglishQuestion) {
  return question.format === "translation" || question.grading === "japanese-semantic";
}

function isCorrectAnswer(question: EnglishQuestion, response: string) {
  if (question.format === "translation") {
    return isAcceptableTranslation(response, [question.answer, ...(question.accepted ?? [])]);
  }
  if (question.grading === "japanese-semantic") {
    return isAcceptableJapaneseMeaning(response, [question.answer, ...(question.accepted ?? [])]);
  }
  const normalized = normalizeAnswer(response);
  return [question.answer, ...(question.accepted ?? [])]
    .some((answer) => normalizeAnswer(answer) === normalized);
}

function restoreTestSession(): SavedTestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TEST_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Omit<SavedTestSession, "version">> & {
      version?: unknown;
      testUnit?: unknown;
    };
    if (
      (parsed.version !== 1 && parsed.version !== 2)
      || !Array.isArray(parsed.questionIds)
      || parsed.questionIds.length === 0
      || parsed.questionIds.some((id) => typeof id !== "string")
      || typeof parsed.testIndex !== "number"
    ) return null;
    const knownIds = new Set(STUDY_QUESTIONS.map((question) => question.id));
    if (parsed.questionIds.some((id) => !knownIds.has(id))) return null;
    const restoredTestUnits = normalizeChapterSelection(
      Array.isArray(parsed.testUnits) ? parsed.testUnits : parsed.testUnit,
      COURSE_UNIT_IDS,
    );
    return {
      version: 2,
      questionIds: parsed.questionIds,
      testUnits: restoredTestUnits,
      questionCountDraft: typeof parsed.questionCountDraft === "string" ? parsed.questionCountDraft : String(parsed.questionIds.length),
      selectedGroups: Array.isArray(parsed.selectedGroups) ? parsed.selectedGroups.filter((group): group is string => typeof group === "string") : [],
      testIndex: Math.max(0, Math.min(parsed.questionIds.length - 1, Math.floor(parsed.testIndex))),
      typedAnswer: typeof parsed.typedAnswer === "string" ? parsed.typedAnswer : "",
      selectedChoice: typeof parsed.selectedChoice === "string" ? parsed.selectedChoice : "",
      orderRemaining: Array.isArray(parsed.orderRemaining) ? parsed.orderRemaining as OrderToken[] : [],
      orderSelected: Array.isArray(parsed.orderSelected) ? parsed.orderSelected as OrderToken[] : [],
      feedback: parsed.feedback && typeof parsed.feedback.response === "string" && typeof parsed.feedback.correct === "boolean"
        ? parsed.feedback as AnswerFeedback
        : null,
      results: Array.isArray(parsed.results)
        ? parsed.results.filter((result) => result && typeof result.questionId === "string" && typeof result.response === "string" && typeof result.correct === "boolean") as SavedTestSession["results"]
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

function chapterSelectionLabel(unitIds: readonly string[]) {
  if (!unitIds.length) return "全Chapter";
  return unitIds.map((unitId) => unitLabel(unitId).split(" ")[0]).join("・");
}

function formatLabel(format: EnglishQuestion["format"]) {
  if (format === "choice") return "選択";
  if (format === "order") return "語順整序";
  if (format === "translation") return "和訳入力";
  return "入力";
}

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function EnglishSubjectPage() {
  const [mode, setMode] = useState<Mode>("cards");
  const [announcement, setAnnouncement] = useState("");
  const workspaceRef = useRef<HTMLElement>(null);

  const [cardProgress, setCardProgress] = useState<CardProgress>({});
  const [progressReady, setProgressReady] = useState(false);
  const [cardUnits, setCardUnits] = useState<string[]>([]);
  const [cardDeck, setCardDeck] = useState<EnglishVocabCard[]>([...ENGLISH_VOCAB]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardDirection, setCardDirection] = useState<CardDirection>("ja-en");

  const [testUnits, setTestUnits] = useState<string[]>([]);
  const [questionCountDraft, setQuestionCountDraft] = useState("10");
  const [selectedTestGroups, setSelectedTestGroups] = useState<string[]>(ALL_QUESTION_GROUPS);
  const [testPhase, setTestPhase] = useState<TestPhase>("setup");
  const [testQuestions, setTestQuestions] = useState<EnglishQuestion[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [orderRemaining, setOrderRemaining] = useState<OrderToken[]>([]);
  const [orderSelected, setOrderSelected] = useState<OrderToken[]>([]);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testElapsedSeconds, setTestElapsedSeconds] = useState(0);
  const [testStorageReady, setTestStorageReady] = useState(false);
  const [savedTestSession, setSavedTestSession] = useState<SavedTestSession | null>(null);

  const [selectedPassageId, setSelectedPassageId] = useState(ENGLISH_PASSAGES[0]?.id ?? "");
  const [readingUnits, setReadingUnits] = useState<string[]>([]);
  const [readingStudyMode, setReadingStudyMode] = useState<ReadingStudyMode>("memory");
  const [readingMemoryIndex, setReadingMemoryIndex] = useState(0);
  const [showMemoryTranslation, setShowMemoryTranslation] = useState(false);
  const [readingQuestionIndex, setReadingQuestionIndex] = useState(0);
  const [readingTypedAnswer, setReadingTypedAnswer] = useState("");
  const [readingSelectedChoice, setReadingSelectedChoice] = useState("");
  const [readingOrderRemaining, setReadingOrderRemaining] = useState<OrderToken[]>([]);
  const [readingOrderSelected, setReadingOrderSelected] = useState<OrderToken[]>([]);
  const [readingFeedback, setReadingFeedback] = useState<AnswerFeedback | null>(null);
  const [readingResults, setReadingResults] = useState<TestResult[]>([]);
  const [readingFinished, setReadingFinished] = useState(false);

  /* Device-local progress is restored after the client mounts. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCardProgress(restoreCardProgress());
    setSavedTestSession(restoreTestSession());
    setProgressReady(true);
    setTestStorageReady(true);
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
    () => ENGLISH_VOCAB.filter((card) => chapterMatches(card.unit, cardUnits)),
    [cardUnits],
  );
  const masteredTotal = ENGLISH_VOCAB.filter((card) => cardProgress[card.id] === "mastered").length;
  const learningTotal = ENGLISH_VOCAB.filter((card) => cardProgress[card.id] === "learning").length;
  const cardMastered = filteredVocab.filter((card) => cardProgress[card.id] === "mastered").length;
  const cardCompletion = filteredVocab.length ? Math.round((cardMastered / filteredVocab.length) * 100) : 0;
  const currentCard = cardDeck[cardIndex];

  const availableTestGroups = useMemo(
    () => Array.from(new Set(
      EXAM_LEVEL_QUESTIONS
        .filter((question) => chapterMatches(question.unit, testUnits))
        .map(questionGenre),
    )),
    [testUnits],
  );
  const availableQuestions = useMemo(
    () => EXAM_LEVEL_QUESTIONS.filter(
      (question) => chapterMatches(question.unit, testUnits)
        && selectedTestGroups.includes(questionGenre(question)),
    ),
    [selectedTestGroups, testUnits],
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
  const selectedPassageQuestionsForReference = useMemo(
    () => STUDY_QUESTIONS.filter((question) => question.passageId === selectedPassageId),
    [selectedPassageId],
  );
  const readingPracticeQuestions = useMemo(
    () => STUDY_QUESTIONS.filter(
      (question) => Boolean(question.passageId)
        && COURSE_PASSAGE_IDS.has(question.passageId as string)
        && chapterMatches(question.unit, readingUnits),
    ),
    [readingUnits],
  );
  const memoryParagraph = selectedPassage?.paragraphs[readingMemoryIndex];
  const readingQuestion = readingPracticeQuestions[readingQuestionIndex];
  const readingQuestionPassage = readingQuestion?.passageId
    ? ENGLISH_PASSAGES.find((passage) => passage.id === readingQuestion.passageId)
    : undefined;
  const readingResponse = readingQuestion?.format === "choice"
    ? readingSelectedChoice
    : readingQuestion?.format === "order"
      ? readingOrderSelected.map((token) => token.text).join(" ")
      : readingTypedAnswer;
  const canSubmitReading = Boolean(readingResponse.trim()) && !readingFeedback;
  const readingScore = readingResults.filter((result) => result.correct).length;

  const currentTestSessionSnapshot = useMemo<SavedTestSession | null>(() => {
    if (!testQuestions.length) return null;
    return {
      version: 2,
      questionIds: testQuestions.map((question) => question.id),
      testUnits,
      questionCountDraft,
      selectedGroups: selectedTestGroups,
      testIndex,
      typedAnswer,
      selectedChoice,
      orderRemaining,
      orderSelected,
      feedback,
      results: testResults.map((result) => ({
        questionId: result.question.id,
        response: result.response,
        correct: result.correct,
      })),
      elapsedSeconds: testElapsedSeconds,
      savedAt: Date.now(),
    };
  }, [
    feedback,
    orderRemaining,
    orderSelected,
    questionCountDraft,
    selectedChoice,
    selectedTestGroups,
    testElapsedSeconds,
    testIndex,
    testQuestions,
    testResults,
    testUnits,
    typedAnswer,
  ]);

  useEffect(() => {
    if (!testStorageReady || testPhase !== "active" || !currentTestSessionSnapshot) return;
    persistTestSession(currentTestSessionSnapshot);
  }, [currentTestSessionSnapshot, testPhase, testStorageReady]);

  useEffect(() => {
    if (testPhase !== "active") return;
    const timer = window.setInterval(() => setTestElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [testPhase]);

  function openCards() {
    setMode("cards");
    window.setTimeout(() => workspaceRef.current?.scrollIntoView({ block: "start" }), 0);
  }

  function openCh18Quiz() {
    setMode("quiz18");
    setAnnouncement("Chapter 18の実物小テスト（18点）を開きました。");
    window.setTimeout(() => workspaceRef.current?.scrollIntoView({ block: "start" }), 0);
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    if (nextMode === "test" && testPhase === "result") setTestPhase("setup");
  }

  function changeTestChapters(nextUnits: readonly string[]) {
    const normalizedUnits = normalizeChapterSelection(nextUnits, COURSE_UNIT_IDS);
    const groups = Array.from(new Set(
      STUDY_QUESTIONS
        .filter((question) => chapterMatches(question.unit, normalizedUnits))
        .map(questionGenre),
    ));
    setTestUnits(normalizedUnits);
    setSelectedTestGroups(groups);
    setAnnouncement(`${chapterSelectionLabel(normalizedUnits)}を模擬テストの出題範囲にしました。`);
  }

  function toggleTestChapter(chapterId: string) {
    changeTestChapters(toggleChapterSelection(testUnits, chapterId, COURSE_UNIT_IDS));
  }

  function toggleTestGroup(group: string) {
    setSelectedTestGroups((groups) => (
      groups.includes(group) ? groups.filter((item) => item !== group) : [...groups, group]
    ));
  }

  function changeCardChapters(nextUnits: readonly string[]) {
    const normalizedUnits = normalizeChapterSelection(nextUnits, COURSE_UNIT_IDS);
    const source = ENGLISH_VOCAB.filter((card) => chapterMatches(card.unit, normalizedUnits));
    setCardUnits(normalizedUnits);
    setCardDeck([...source]);
    setCardIndex(0);
    setCardFlipped(false);
    setAnnouncement(`${chapterSelectionLabel(normalizedUnits)}の暗記帳を開きました。`);
  }

  function toggleCardChapter(chapterId: string) {
    changeCardChapters(toggleChapterSelection(cardUnits, chapterId, COURSE_UNIT_IDS));
  }

  function changeCardDirection(nextDirection: CardDirection) {
    setCardDirection(nextDirection);
    setCardFlipped(false);
    setAnnouncement(
      nextDirection === "ja-en"
        ? "日本語から英語を答える暗記帳に切り替えました。"
        : "英語から日本語を答える暗記帳に切り替えました。",
    );
  }

  function jumpToVocabCard(cardId: string) {
    const card = ENGLISH_VOCAB.find((item) => item.id === cardId);
    if (!card) return;
    const alreadyVisible = chapterMatches(card.unit, cardUnits);
    const nextUnits = alreadyVisible
      ? cardUnits
      : normalizeChapterSelection([...cardUnits, card.unit], COURSE_UNIT_IDS);
    const nextDeck = ENGLISH_VOCAB.filter((item) => chapterMatches(item.unit, nextUnits));
    setCardUnits(nextUnits);
    setCardDeck(nextDeck);
    setCardIndex(Math.max(0, nextDeck.findIndex((item) => item.id === cardId)));
    setCardFlipped(false);
    setAnnouncement(card.en + " のカードを開きました。" + (alreadyVisible ? "" : "対象Chapterも表示に追加しました。"));
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
    setTestElapsedSeconds(0);
    prepareQuestion(questions[0]);
    setTestPhase("active");
    setAnnouncement(`${safeCount}問の模擬テストを開始しました。`);
  }

  function saveTestSession() {
    if (!currentTestSessionSnapshot) return false;
    const saved = persistTestSession(currentTestSessionSnapshot);
    if (saved) setSavedTestSession(currentTestSessionSnapshot);
    return saved;
  }

  function pauseTest() {
    const saved = saveTestSession();
    if (!saved) {
      setAnnouncement("この端末では保存できませんでした。テストはそのまま続けられます。");
      return;
    }
    setTestPhase("setup");
    setAnnouncement(`Q${testIndex + 1}までの状態を保存して中断しました。`);
  }

  function resumeSavedTest() {
    const session = savedTestSession ?? restoreTestSession();
    if (!session) {
      setSavedTestSession(null);
      setAnnouncement("再開できる保存データがありません。");
      return;
    }
    const questionsById = new Map(EXAM_LEVEL_QUESTIONS.map((question) => [question.id, question]));
    const questions = session.questionIds
      .map((id) => questionsById.get(id))
      .filter((question): question is EnglishQuestion => Boolean(question));
    if (!questions.length) {
      deleteSavedTest();
      setAnnouncement("教材の更新により保存データを再開できなかったため、削除しました。");
      return;
    }
    const resultQuestions = new Map(questions.map((question) => [question.id, question]));
    const restoredResults = session.results
      .map((result) => {
        const question = resultQuestions.get(result.questionId);
        return question ? { question, response: result.response, correct: result.correct } : null;
      })
      .filter((result): result is TestResult => Boolean(result));
    const nextIndex = Math.min(session.testIndex, questions.length - 1);
    const nextQuestion = questions[nextIndex];
    const unitGroups = Array.from(new Set(
      EXAM_LEVEL_QUESTIONS
        .filter((question) => chapterMatches(question.unit, session.testUnits))
        .map(questionGenre),
    ));
    const restoredGroups = session.selectedGroups.filter((group) => unitGroups.includes(group));
    setTestUnits(session.testUnits);
    setQuestionCountDraft(session.questionCountDraft);
    setSelectedTestGroups(restoredGroups.length ? restoredGroups : unitGroups);
    setTestQuestions(questions);
    setTestIndex(nextIndex);
    setTypedAnswer(session.typedAnswer);
    setSelectedChoice(session.selectedChoice);
    setOrderSelected(session.orderSelected);
    setOrderRemaining(
      nextQuestion.format === "order" && !session.orderSelected.length && !session.orderRemaining.length
        ? buildOrderTokens(nextQuestion)
        : session.orderRemaining,
    );
    setFeedback(session.feedback);
    setTestResults(restoredResults);
    setTestElapsedSeconds(session.elapsedSeconds);
    setTestPhase("active");
    setMode("test");
    setAnnouncement(`保存したQ${nextIndex + 1}から再開しました。`);
  }

  function deleteSavedTest() {
    try {
      window.localStorage.removeItem(TEST_SESSION_KEY);
    } catch {
      // The setup screen can still be used when storage is unavailable.
    }
    setSavedTestSession(null);
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
      deleteSavedTest();
      setTestPhase("result");
      setFeedback(null);
      return;
    }
    const nextIndex = testIndex + 1;
    setTestIndex(nextIndex);
    prepareQuestion(testQuestions[nextIndex]);
  }

  function acceptTestTranslation() {
    if (!currentQuestion || !isJapaneseAnswerQuestion(currentQuestion) || !feedback || feedback.correct) return;
    setFeedback({ ...feedback, correct: true });
    setTestResults((results) => results.map((result, index) => (
      index === results.length - 1 ? { ...result, correct: true } : result
    )));
    setAnnouncement("表現は違っても意味が合っているとして、正解に変更しました。");
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

  function prepareReadingQuestion(question: EnglishQuestion | undefined) {
    setReadingTypedAnswer("");
    setReadingSelectedChoice("");
    setReadingOrderSelected([]);
    setReadingOrderRemaining(question?.format === "order" ? buildOrderTokens(question) : []);
    setReadingFeedback(null);
  }

  function resetReadingPractice(unitIds: readonly string[] = readingUnits) {
    const normalizedUnits = normalizeChapterSelection(unitIds, COURSE_UNIT_IDS);
    const questions = STUDY_QUESTIONS.filter(
      (question) => Boolean(question.passageId)
        && COURSE_PASSAGE_IDS.has(question.passageId as string)
        && chapterMatches(question.unit, normalizedUnits),
    );
    setReadingQuestionIndex(0);
    setReadingResults([]);
    setReadingFinished(false);
    prepareReadingQuestion(questions[0]);
  }

  function changeReadingChapters(nextUnits: readonly string[]) {
    const normalizedUnits = normalizeChapterSelection(nextUnits, COURSE_UNIT_IDS);
    setReadingUnits(normalizedUnits);
    resetReadingPractice(normalizedUnits);
    setAnnouncement(`${chapterSelectionLabel(normalizedUnits)}を長文実戦の出題範囲にしました。`);
  }

  function toggleReadingChapter(chapterId: string) {
    changeReadingChapters(toggleChapterSelection(readingUnits, chapterId, COURSE_UNIT_IDS));
  }

  function changeSelectedPassage(passageId: string) {
    setSelectedPassageId(passageId);
    setReadingMemoryIndex(0);
    setShowMemoryTranslation(false);
  }

  function changeReadingStudyMode(nextMode: ReadingStudyMode) {
    setReadingStudyMode(nextMode);
    if (nextMode === "memory") {
      setShowMemoryTranslation(false);
    } else {
      resetReadingPractice();
    }
  }

  function moveReadingMemory(delta: number) {
    if (!selectedPassage) return;
    setReadingMemoryIndex((index) => Math.max(0, Math.min(selectedPassage.paragraphs.length - 1, index + delta)));
    setShowMemoryTranslation(false);
  }

  function chooseReadingOrderToken(token: OrderToken) {
    if (readingFeedback) return;
    setReadingOrderRemaining((tokens) => tokens.filter((item) => item.id !== token.id));
    setReadingOrderSelected((tokens) => [...tokens, token]);
  }

  function removeReadingOrderToken(token: OrderToken) {
    if (readingFeedback) return;
    setReadingOrderSelected((tokens) => tokens.filter((item) => item.id !== token.id));
    setReadingOrderRemaining((tokens) => [...tokens, token]);
  }

  function submitReadingAnswer(event: React.FormEvent) {
    event.preventDefault();
    if (!readingQuestion || !canSubmitReading) return;
    const response = readingResponse.trim();
    const correct = isCorrectAnswer(readingQuestion, response);
    setReadingFeedback({ response, correct });
    setReadingResults((results) => [...results, { question: readingQuestion, response, correct }]);
  }

  function nextReadingQuestion() {
    if (!readingQuestion || !readingFeedback) return;
    if (readingQuestionIndex >= readingPracticeQuestions.length - 1) {
      setReadingFinished(true);
      setReadingFeedback(null);
      return;
    }
    const nextIndex = readingQuestionIndex + 1;
    setReadingQuestionIndex(nextIndex);
    prepareReadingQuestion(readingPracticeQuestions[nextIndex]);
  }

  function acceptReadingTranslation() {
    if (!readingQuestion || readingQuestion.format !== "translation" || !readingFeedback || readingFeedback.correct) return;
    setReadingFeedback({ ...readingFeedback, correct: true });
    setReadingResults((results) => results.map((result, index) => (
      index === results.length - 1 ? { ...result, correct: true } : result
    )));
    setAnnouncement("表現は違っても意味が合っているとして、正解に変更しました。");
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
          <button className="english-header-memory-button" type="button" onClick={openCh18Quiz}>
            <span>実物18点</span> Ch.18小テスト
          </button>
          <Link className="outline-button header-link" href="/cards?subject=subject-2">暗記帳検索</Link>
          <Link className="outline-button header-link" href="/rapid/subject-2">時間制限 即答練習</Link>
          <Link className="outline-button header-link" href="/ranking/subject-2">公式ランキングテスト</Link>
          <Link className="outline-button header-link generated-practice-subject-link" href="/generated-practice?subject=subject-2">自動生成問題・共有履歴</Link>
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
            <small>全{ENGLISH_QUESTIONS.length}問を、語源・活用・文法・本文根拠・誤答理由まで分解して反復します。</small>
          </div>
          <button className="english-hero-memory-button" type="button" onClick={openCards}>
            <span>VOCABULARY FIRST</span>
            <strong>暗記帳を開く</strong>
            <small>日 → 英／英 → 日を切り替えて覚える →</small>
          </button>
        </section>

        <section className="english-summary" aria-label="収録教材">
          <div><span>VOCAB</span><strong>{ENGLISH_VOCAB.length}</strong><small>語</small></div>
          <div><span>QUESTIONS</span><strong>{ENGLISH_QUESTIONS.length}</strong><small>問</small></div>
          <div><span>PASSAGES</span><strong>{ENGLISH_PASSAGES.length}</strong><small>本</small></div>
          <p>ZIP教材のChapter 15・16・18を収録。全問に詳しい解説を付け、Chapter 16の資料図も表示します。PDF見本の本文・単語は出題しません。覚えた {masteredTotal}語／復習 {learningTotal}語。</p>
        </section>

        <section ref={workspaceRef} id="english-workspace" className="english-workspace">
          <div className="workspace-tabs english-tabs english-primary-tabs" role="tablist" aria-label="英語の学習モード">
            <button type="button" role="tab" aria-selected={mode === "cards"} className={mode === "cards" ? "active english-tab-memory" : "english-tab-memory"} onClick={() => changeMode("cards")}>① 暗記帳</button>
            <button type="button" role="tab" aria-selected={mode === "expected"} className={mode === "expected" ? "active english-tab-expected" : "english-tab-expected"} onClick={() => changeMode("expected")}>② 予想模試（6セット・50分）</button>
            <button type="button" role="tab" aria-selected={mode === "quiz18"} className={mode === "quiz18" ? "active" : ""} onClick={openCh18Quiz}>③ Ch.18 実物小テスト（18点）</button>
            <button type="button" role="tab" aria-label="ランダム出題の模擬テスト" aria-selected={mode === "test"} className={mode === "test" ? "active" : ""} onClick={() => changeMode("test")}>④ ランダム模試</button>
            <button type="button" role="tab" aria-selected={mode === "reading"} className={mode === "reading" ? "active" : ""} onClick={() => changeMode("reading")}>⑤ 長文読解</button>
            <button type="button" role="tab" aria-selected={mode === "guide"} className={mode === "guide" ? "active" : ""} onClick={() => changeMode("guide")}>⑥ 出題形式</button>
          </div>

          {mode === "expected" && <EnglishExpectedExams />}

          {mode === "quiz18" && <EnglishCh18Quiz />}

          {mode === "cards" && (
            <section className="generic-card-workspace english-card-workspace" aria-labelledby="english-card-title">
              <div className="english-panel-heading">
                <div><span>MEMORY BOOK</span><h2 id="english-card-title">{cardDirection === "ja-en" ? "日本語 → 英語" : "英語 → 日本語"} 暗記帳</h2></div>
                <div className="english-card-settings">
                  <div className="english-direction-switch" role="group" aria-label="暗記帳の出題方向">
                    <span>出題方向</span>
                    <div>
                      <button type="button" aria-pressed={cardDirection === "ja-en"} onClick={() => changeCardDirection("ja-en")}>日 → 英</button>
                      <button type="button" aria-pressed={cardDirection === "en-ja"} onClick={() => changeCardDirection("en-ja")}>英 → 日</button>
                    </div>
                  </div>
                  <fieldset className="english-chapter-filter english-card-chapter-filter">
                    <legend>Chapter（複数選択可）</legend>
                    <div role="group" aria-label="暗記帳のChapter絞り込み（複数選択）">
                      <button type="button" aria-pressed={cardUnits.length === 0} onClick={() => changeCardChapters([])}>全Chapter</button>
                      {COURSE_UNITS.map((unit) => <button key={unit.id} type="button" title={unit.title} aria-pressed={cardUnits.includes(unit.id)} onClick={() => toggleCardChapter(unit.id)}>{unitLabel(unit.id).split(" ")[0]}</button>)}
                    </div>
                    <small>選んだ章のどれかに属するカードを表示</small>
                  </fieldset>
                </div>
              </div>

              <CardDeckSearch
                items={ENGLISH_VOCAB.map((card) => ({
                  id: card.id,
                  label: card.en,
                  description: card.ja,
                  meta: unitLabel(card.unit),
                  searchText: [card.note],
                }))}
                currentId={currentCard?.id}
                label="英単語・日本語訳を検索"
                placeholder="英単語、日本語、覚え方を入力"
                onSelect={jumpToVocabCard}
              />
              <CardFaceList
                items={filteredVocab.map((card) => ({
                  id: card.id,
                  eyebrow: unitLabel(card.unit),
                  meta: cardProgress[card.id] === "mastered" ? "覚えた" : cardProgress[card.id] === "learning" ? "未暗記" : "未判定",
                  front: <strong>{cardDirection === "ja-en" ? card.ja : card.en}</strong>,
                  back: (
                    <div>
                      <strong>{cardDirection === "ja-en" ? card.en : card.ja}</strong>
                      {card.note && <p>{card.note}</p>}
                    </div>
                  ),
                  explanation: <EnglishVocabInsight card={card} />,
                }))}
                title={`${cardDirection === "ja-en" ? "日本語 → 英語" : "英語 → 日本語"}の表・裏一覧`}
                description="選択中のChapterだけを、問題面・答え・意味や活用の解説まで一度に確認できます。"
                onSelect={jumpToVocabCard}
              />

              <div className="generic-progress english-card-progress">
                <div><span>覚えた {cardMastered} / {filteredVocab.length}</span><strong>{cardCompletion}%</strong></div>
                <progress value={cardCompletion} max="100" aria-label={`暗記進捗 ${cardCompletion}%`} />
              </div>

              {currentCard ? (
                <>
                  <div className="generic-deck-meta english-deck-meta"><span>CARD {cardIndex + 1} / {cardDeck.length}</span><span>{unitLabel(currentCard.unit)} · {cardProgress[currentCard.id] === "mastered" ? "覚えた" : cardProgress[currentCard.id] === "learning" ? "未暗記" : "未判定"}</span></div>
                  <button type="button" className={`generic-flip-card english-flip-card ${cardFlipped ? "is-flipped" : ""}`} onClick={() => setCardFlipped((flipped) => !flipped)} aria-label={cardFlipped ? `${cardDirection === "ja-en" ? "日本語" : "英語"}の問題面に戻る` : `${cardDirection === "ja-en" ? "英語" : "日本語"}の答えを見る`}>
                    <span>{cardFlipped ? (cardDirection === "ja-en" ? "ENGLISH ANSWER" : "JAPANESE ANSWER") : (cardDirection === "ja-en" ? "JAPANESE PROMPT" : "ENGLISH PROMPT")}</span>
                    <strong>{cardFlipped ? (cardDirection === "ja-en" ? currentCard.en : currentCard.ja) : (cardDirection === "ja-en" ? currentCard.ja : currentCard.en)}</strong>
                    {cardFlipped && currentCard.note ? <small>{currentCard.note}</small> : <small>{cardFlipped ? "覚えていたか判定してください" : cardDirection === "ja-en" ? "英語を声に出してから、タップして確認" : "日本語の意味を答えてから、タップして確認"}</small>}
                  </button>
                  {cardFlipped && <EnglishVocabInsight card={currentCard} />}
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
                  <div className="english-panel-heading"><div><span>MOCK EXAM</span><h2 id="english-test-title">模擬テストを作る</h2></div><p>選んだ章とジャンルから、日→英・英→日の語彙、選択、語順整序、和訳を混ぜて出題します。PDF見本だけの問題は含みません。</p></div>
                  {savedTestSession && (
                    <div className="generic-test-answer english-test-feedback english-saved-test" aria-label="保存中の模擬テスト">
                      <strong>途中のテストがあります</strong>
                      <p><span>進捗</span>Q{savedTestSession.testIndex + 1} / {savedTestSession.questionIds.length}・経過 {formatElapsedTime(savedTestSession.elapsedSeconds)}</p>
                      <p><span>保存日時</span>{new Date(savedTestSession.savedAt).toLocaleString("ja-JP")}</p>
                      <div className="english-result-actions">
                        <button type="button" onClick={resumeSavedTest}>続きから再開</button>
                        <button type="button" onClick={() => { deleteSavedTest(); setAnnouncement("保存データを削除しました。"); }}>保存データを削除</button>
                      </div>
                    </div>
                  )}
                  <div className="english-test-settings english-test-settings-multi">
                    <fieldset className="english-chapter-filter english-test-chapter-filter">
                      <legend>出題Chapter（複数選択可）</legend>
                      <div role="group" aria-label="模擬テストのChapter絞り込み（複数選択）">
                        <button type="button" aria-pressed={testUnits.length === 0} onClick={() => changeTestChapters([])}>全Chapter</button>
                        {COURSE_UNITS.map((unit) => <button key={unit.id} type="button" title={unit.title} aria-pressed={testUnits.includes(unit.id)} onClick={() => toggleTestChapter(unit.id)}>{unitLabel(unit.id).split(" ")[0]}</button>)}
                      </div>
                      <small>選んだ章の問題をまとめて出題します</small>
                    </fieldset>
                    <label><span>問題数 <small>最大 {availableQuestions.length}問</small></span><input type="number" min="1" max={Math.max(1, availableQuestions.length)} inputMode="numeric" value={questionCountDraft} onChange={(event) => setQuestionCountDraft(event.target.value)} /></label>
                    <button type="button" onClick={startTest} disabled={!availableQuestions.length}>ランダム出題を開始 →</button>
                  </div>
                  <fieldset className="english-choice-answer english-test-groups">
                    <legend>出題ジャンル（複数選択）</legend>
                    <div className="english-result-actions"><button type="button" onClick={() => setSelectedTestGroups(availableTestGroups)}>すべて選択</button><button type="button" onClick={() => setSelectedTestGroups([])}>すべて解除</button></div>
                    {availableTestGroups.map((group) => <label key={group}><input type="checkbox" checked={selectedTestGroups.includes(group)} onChange={() => toggleTestGroup(group)} /><span>{group}</span></label>)}
                  </fieldset>
                  <div className="english-format-preview"><span>入力</span><span>4択</span><span>語順整序</span><span>和訳入力</span><p>{availableQuestions.length}問から作成可能</p></div>
                </div>
              )}

              {testPhase === "active" && currentQuestion && (
                <div className="english-test-active">
                  <div className="generic-deck-meta english-test-meta"><span>QUESTION {testIndex + 1} / {testQuestions.length}</span><span>{unitLabel(currentQuestion.unit)} · {currentQuestion.group} · {formatLabel(currentQuestion.format)}</span></div>
                  <div className="english-result-actions english-test-session-actions"><span>経過 {formatElapsedTime(testElapsedSeconds)}・入力内容は自動保存中</span><button type="button" onClick={pauseTest}>中断して保存</button></div>
                  {questionPassage && (
                    <details className="english-question-passage">
                      <summary>本文を表示して解く <span>{questionPassage.title}</span></summary>
                      <div>{questionPassage.paragraphs.map((paragraph, index) => <p key={`${questionPassage.id}-test-${index}`}><b>{index + 1}</b>{paragraph.en}</p>)}</div>
                    </details>
                  )}
                  {currentQuestion.id.startsWith("ch16-homepage-") && <EnglishWeatherFigure />}
                  <div className="generic-test-question english-test-question"><span>問題</span><h2>{currentQuestion.prompt}</h2></div>
                  <form className="english-answer-form" onSubmit={submitTestAnswer}>
                    {currentQuestion.format === "input" && <label className="english-input-answer"><span>{currentQuestion.grading === "japanese-semantic" ? "日本語の意味を入力" : "解答を入力"}</span><input lang={currentQuestion.grading === "japanese-semantic" ? "ja" : "en"} autoComplete="off" value={typedAnswer} disabled={Boolean(feedback)} onChange={(event) => setTypedAnswer(event.target.value)} placeholder={currentQuestion.grading === "japanese-semantic" ? "日本語で入力（同じ意味なら言い換え可）" : "英語で入力"} /></label>}
                    {currentQuestion.format === "translation" && <label className="english-input-answer english-translation-answer"><span>日本語訳を入力</span><textarea rows={5} autoComplete="off" value={typedAnswer} disabled={Boolean(feedback)} onChange={(event) => setTypedAnswer(event.target.value)} placeholder="本文の意味が伝わる自然な日本語で入力" /></label>}
                    {currentQuestion.format === "choice" && <fieldset className="english-choice-answer" disabled={Boolean(feedback)}><legend>正しいものを1つ選択</legend>{currentQuestion.options?.map((option, index) => <label key={`${currentQuestion.id}-${index}`}><input type="radio" name={`choice-${currentQuestion.id}`} value={option} checked={selectedChoice === option} onChange={(event) => setSelectedChoice(event.target.value)} /><span><b>{String.fromCharCode(65 + index)}</b>{option}</span></label>)}</fieldset>}
                    {currentQuestion.format === "order" && <div className="english-order-answer"><span>チップを正しい順に並べる</span><div className="english-order-line" aria-label="作成中の英文">{orderSelected.length ? orderSelected.map((token) => <button key={token.id} type="button" disabled={Boolean(feedback)} onClick={() => removeOrderToken(token)}>{token.text}</button>) : <small>下の語句を順番に選択</small>}</div><div className="english-order-bank">{orderRemaining.map((token) => <button key={token.id} type="button" disabled={Boolean(feedback)} onClick={() => chooseOrderToken(token)}>{token.text}</button>)}</div>{!feedback && <button className="english-order-reset" type="button" onClick={resetOrder}>並べ直す</button>}</div>}
                    {!feedback && <button className="english-submit-answer" type="submit" disabled={!canSubmit}>採点する →</button>}
                  </form>

                  {feedback && (
                    <div className={`generic-test-answer english-test-feedback ${feedback.correct ? "is-correct" : "is-wrong"}`} aria-live="polite">
                      <strong>{feedback.correct ? "正解" : "不正解"}</strong>
                      <p><span>あなたの解答</span>{feedback.response}</p>
                      <p><span>正解</span>{currentQuestion.answer}</p>
                      <EnglishQuestionExplanation question={currentQuestion} />
                      {isJapaneseAnswerQuestion(currentQuestion) && !feedback.correct && <button className="english-translation-override" type="button" onClick={acceptTestTranslation}>意味は合っていた → 正解にする</button>}
                      <button type="button" onClick={nextTestQuestion}>{testIndex === testQuestions.length - 1 ? "結果を見る" : "次の問題へ →"}</button>
                    </div>
                  )}
                </div>
              )}

              {testPhase === "result" && (
                <div className="english-test-result">
                  <span>MOCK EXAM RESULT</span><h2>{testScore} / {testResults.length}</h2><p>正答率 {testResults.length ? Math.round((testScore / testResults.length) * 100) : 0}%</p>
                  <div className="english-result-list">{testResults.map((result, index) => <article key={`${result.question.id}-${index}`} className={result.correct ? "is-correct" : "is-wrong"}><span>{result.correct ? "○" : "×"} Q{index + 1}</span><strong>{result.question.prompt}</strong><p>あなた：{result.response || "未回答"}</p>{!result.correct && <p>正解：{result.question.answer}</p>}<details className="english-result-explanation" open={!result.correct}><summary>詳しい解説を開く</summary><EnglishQuestionExplanation question={result.question} compact /></details><Link className="result-card-jump" href={"/cards?subject=subject-2&q=" + encodeURIComponent(result.question.prompt)}>{result.correct ? "暗記帳で確認する" : "間違えた問題の暗記帳へ →"}</Link></article>)}</div>
                  <div className="english-result-actions"><button type="button" onClick={startTest}>同じ設定でもう一度</button><button type="button" onClick={() => setTestPhase("setup")}>設定を変える</button></div>
                </div>
              )}
            </section>
          )}

          {mode === "reading" && selectedPassage && (
            <section className="english-reading-workspace" aria-labelledby="english-reading-title">
              <div className="english-panel-heading"><div><span>READING LAB</span><h2 id="english-reading-title">長文読解</h2></div><div className="english-reading-tools"><label><span>暗記で表示する長文（1件）</span><select value={selectedPassageId} onChange={(event) => changeSelectedPassage(event.target.value)}>{ENGLISH_PASSAGES.map((passage) => <option key={passage.id} value={passage.id}>{unitLabel(passage.unit)}｜{passage.title}</option>)}</select></label></div></div>

              <div className="workspace-tabs english-tabs english-reading-mode-switch" role="tablist" aria-label="長文読解の学習方法">
                <button type="button" role="tab" aria-selected={readingStudyMode === "memory"} className={readingStudyMode === "memory" ? "active" : ""} onClick={() => changeReadingStudyMode("memory")}>暗記モード</button>
                <button type="button" role="tab" aria-selected={readingStudyMode === "practice"} className={readingStudyMode === "practice" ? "active" : ""} onClick={() => changeReadingStudyMode("practice")}>実戦モード</button>
              </div>

              {readingStudyMode === "practice" && (
                <fieldset className="english-chapter-filter english-reading-chapter-filter">
                  <legend>実戦のChapter（複数選択可）</legend>
                  <div role="group" aria-label="長文実戦のChapter絞り込み（複数選択）">
                    <button type="button" aria-pressed={readingUnits.length === 0} onClick={() => changeReadingChapters([])}>全Chapter</button>
                    {COURSE_UNITS.map((unit) => <button key={unit.id} type="button" title={unit.title} aria-pressed={readingUnits.includes(unit.id)} onClick={() => toggleReadingChapter(unit.id)}>{unitLabel(unit.id).split(" ")[0]}</button>)}
                  </div>
                  <small>選んだ章のどれかに属する関連問題を連続出題</small>
                </fieldset>
              )}

              {readingStudyMode === "memory" && memoryParagraph && (
                <div className="english-reading-memory" role="tabpanel">
                  <div className="generic-progress english-card-progress">
                    <div><span>英文 {readingMemoryIndex + 1} / {selectedPassage.paragraphs.length}</span><strong>{Math.round(((readingMemoryIndex + 1) / selectedPassage.paragraphs.length) * 100)}%</strong></div>
                    <progress value={readingMemoryIndex + 1} max={selectedPassage.paragraphs.length} aria-label={`長文暗記の進捗 ${readingMemoryIndex + 1}/${selectedPassage.paragraphs.length}`} />
                  </div>
                  <article className="english-passage english-memory-passage">
                    <header><span>{unitLabel(selectedPassage.unit)}・暗記モード</span><h3>{selectedPassage.title}</h3><p>英文を読んで自分で訳してから、模範訳を表示してください。この長文の関連問題は{selectedPassageQuestionsForReference.length}問です。</p></header>
                    <div><section><span>{String(readingMemoryIndex + 1).padStart(2, "0")}</span><p lang="en">{memoryParagraph.en}</p>{showMemoryTranslation && <p className="english-translation">{memoryParagraph.ja}</p>}</section></div>
                  </article>
                  <div className="generic-card-controls english-card-controls english-reading-memory-controls">
                    <button type="button" disabled={readingMemoryIndex === 0} onClick={() => moveReadingMemory(-1)}>← 前の英文</button>
                    <button type="button" aria-pressed={showMemoryTranslation} onClick={() => setShowMemoryTranslation((visible) => !visible)}>{showMemoryTranslation ? "訳を隠す" : "訳を表示"}</button>
                    <button type="button" disabled={readingMemoryIndex >= selectedPassage.paragraphs.length - 1} onClick={() => moveReadingMemory(1)}>次の英文 →</button>
                  </div>
                </div>
              )}

              {readingStudyMode === "practice" && (
                <div className="english-reading-practice" role="tabpanel">
                  {readingQuestionPassage && (
                    <article className="english-passage">
                      <header><span>{unitLabel(readingQuestionPassage.unit)}・実戦モード</span><h3>{readingQuestionPassage.title}</h3><p>{readingQuestionPassage.titleJa}｜現在の問題に対応する本文です。和訳を見ずに解答します。</p></header>
                      <div>{readingQuestionPassage.paragraphs.map((paragraph, index) => <section key={`${readingQuestionPassage.id}-practice-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p lang="en">{paragraph.en}</p></section>)}</div>
                    </article>
                  )}

                  {!readingPracticeQuestions.length && <div className="generic-empty english-empty"><h3>選んだChapterの関連問題はまだありません。</h3></div>}

                  {readingPracticeQuestions.length > 0 && readingFinished && (
                    <div className="english-test-result">
                      <span>READING RESULT</span><h2>{readingScore} / {readingResults.length}</h2><p>正答率 {readingResults.length ? Math.round((readingScore / readingResults.length) * 100) : 0}%</p>
                      <div className="english-result-list">{readingResults.map((result, index) => <article key={`${result.question.id}-reading-result-${index}`} className={result.correct ? "is-correct" : "is-wrong"}><span>{result.correct ? "○" : "×"} Q{index + 1}</span><strong>{result.question.prompt}</strong><p>正解：{result.question.answer}</p><details className="english-result-explanation" open={!result.correct}><summary>詳しい解説を開く</summary><EnglishQuestionExplanation question={result.question} compact /></details><Link className="result-card-jump" href={"/cards?subject=subject-2&q=" + encodeURIComponent(result.question.prompt)}>{result.correct ? "暗記帳で確認する" : "間違えた問題の暗記帳へ →"}</Link></article>)}</div>
                      <div className="english-result-actions"><button type="button" onClick={() => resetReadingPractice()}>同じChapter範囲でもう一度</button></div>
                    </div>
                  )}

                  {readingPracticeQuestions.length > 0 && !readingFinished && readingQuestion && (
                    <div className="english-test-active english-reading-question-area">
                      <div className="generic-progress english-card-progress"><div><span>関連問題 {readingQuestionIndex + 1} / {readingPracticeQuestions.length}</span><strong>{readingScore}問正解</strong></div><progress value={readingQuestionIndex + 1} max={readingPracticeQuestions.length} aria-label={`関連問題の進捗 ${readingQuestionIndex + 1}/${readingPracticeQuestions.length}`} /></div>
                      <div className="generic-deck-meta english-test-meta"><span>QUESTION {readingQuestionIndex + 1}</span><span>{readingQuestion.group} · {formatLabel(readingQuestion.format)}</span></div>
                      {readingQuestion.id.startsWith("ch16-homepage-") && <EnglishWeatherFigure />}
                      <div className="generic-test-question english-test-question"><span>問題</span><h2>{readingQuestion.prompt}</h2></div>
                      <form className="english-answer-form" onSubmit={submitReadingAnswer}>
                        {readingQuestion.format === "input" && <label className="english-input-answer"><span>解答を入力</span><input autoComplete="off" value={readingTypedAnswer} disabled={Boolean(readingFeedback)} onChange={(event) => setReadingTypedAnswer(event.target.value)} placeholder="英語で入力" /></label>}
                        {readingQuestion.format === "translation" && <label className="english-input-answer english-translation-answer"><span>日本語訳を入力</span><textarea rows={5} autoComplete="off" value={readingTypedAnswer} disabled={Boolean(readingFeedback)} onChange={(event) => setReadingTypedAnswer(event.target.value)} placeholder="本文の意味が伝わる自然な日本語で入力" /></label>}
                        {readingQuestion.format === "choice" && <fieldset className="english-choice-answer" disabled={Boolean(readingFeedback)}><legend>正しいものを1つ選択</legend>{readingQuestion.options?.map((option, index) => <label key={`${readingQuestion.id}-reading-${index}`}><input type="radio" name={`reading-choice-${readingQuestion.id}`} value={option} checked={readingSelectedChoice === option} onChange={(event) => setReadingSelectedChoice(event.target.value)} /><span><b>{String.fromCharCode(65 + index)}</b>{option}</span></label>)}</fieldset>}
                        {readingQuestion.format === "order" && <div className="english-order-answer"><span>チップを正しい順に並べる</span><div className="english-order-line" aria-label="作成中の英文">{readingOrderSelected.length ? readingOrderSelected.map((token) => <button key={token.id} type="button" disabled={Boolean(readingFeedback)} onClick={() => removeReadingOrderToken(token)}>{token.text}</button>) : <small>下の語句を順番に選択</small>}</div><div className="english-order-bank">{readingOrderRemaining.map((token) => <button key={token.id} type="button" disabled={Boolean(readingFeedback)} onClick={() => chooseReadingOrderToken(token)}>{token.text}</button>)}</div>{!readingFeedback && <button className="english-order-reset" type="button" onClick={() => prepareReadingQuestion(readingQuestion)}>並べ直す</button>}</div>}
                        {!readingFeedback && <button className="english-submit-answer" type="submit" disabled={!canSubmitReading}>採点する →</button>}
                      </form>
                      {readingFeedback && <div className={`generic-test-answer english-test-feedback ${readingFeedback.correct ? "is-correct" : "is-wrong"}`} aria-live="polite"><strong>{readingFeedback.correct ? "正解" : "不正解"}</strong><p><span>あなたの解答</span>{readingFeedback.response}</p><p><span>正解</span>{readingQuestion.answer}</p><EnglishQuestionExplanation question={readingQuestion} />{readingQuestion.format === "translation" && !readingFeedback.correct && <button className="english-translation-override" type="button" onClick={acceptReadingTranslation}>意味は合っていた → 正解にする</button>}<button type="button" onClick={nextReadingQuestion}>{readingQuestionIndex === readingPracticeQuestions.length - 1 ? "結果を見る" : "次の問題へ →"}</button></div>}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {mode === "guide" && (
            <section className="english-guide-workspace" aria-labelledby="english-guide-title">
              <div className="english-panel-heading"><div><span>FORMAT GUIDE</span><h2 id="english-guide-title">出題形式ガイド</h2></div><p>試験で手が止まらないように、過去問から確認できた形式ごとの解き方を先に固定します。</p></div>
              <div className="english-guide-grid">
                <article><span>01 / INPUT</span><h3>穴埋め・疑問詞</h3><p>日本語と前後の文型を確認し、必要な1語または語句を入力。大文字小文字と句読点は採点時に無視します。</p><strong>例：How long / in which / recognize</strong></article>
                <article><span>02 / CHOICE</span><h3>内容理解・4択</h3><p>選択肢を先に読み、本文の該当箇所と同じ意味のものを選択。本文にない強い表現へ飛びつかない。</p><strong>主語・動作・対象を照合</strong></article>
                <article><span>03 / ORDER</span><h3>語順整序</h3><p>最初に主語と動詞を決め、熟語をひとかたまりにして配置。残った前置詞句を最後に接続します。</p><strong>主語 → 動詞 → 目的語 → 修飾</strong></article>
                <article><span>04 / READING</span><h3>長文読解・要約</h3><p>各段落の主語と動詞を取り、指示語と受動態を確認。最後に要約文へ本文中の語を戻します。</p><strong>和訳は確認時だけ表示</strong></article>
                <article><span>05 / WORD BANK</span><h3>共通語群・複数空所</h3><p>空所の前後から必要な品詞を決めて候補を減らし、すべて入れたあとに文意を再確認。同じ語を1回だけ使う指定にも注意します。</p><strong>品詞 → 文意 → 使用済み語の確認</strong></article>
                <article><span>06 / VISUAL</span><h3>イラスト○×・語形変化</h3><p>物の位置、動作が進行中か完了済みかを絵から読み取ります。○×は各表現を別々に判定し、動詞は時制と受動態まで合わせます。</p><strong>位置関係・進行／完了・能動／受動</strong></article>
                <article><span>07 / INSERT</span><h3>英文挿入</h3><p>挿入文の代名詞、接続語、時を表す語に印を付け、直前と直後の両方につながる位置を選びます。</p><strong>指示語の参照先と話題の流れを照合</strong></article>
                <article><span>08 / MULTI &amp; T/F</span><h3>複数正解・T/F</h3><p>正解を1つ見つけても止めず、全選択肢を本文の根拠と照合します。NOT問題は「本文と合わないもの」を選ぶことを先に確認。</p><strong>各選択肢に根拠文を1つ対応させる</strong></article>
                <article><span>09 / PASSAGE SET</span><h3>長文の連続小問</h3><p>先に小問を眺めて探す情報を決め、本文は段落ごとの要点を取りながら一度通読。語句・和訳・日本語記述・内容一致を同じ根拠箇所から続けて処理します。</p><strong>設問確認 → 通読 → 根拠箇所 → 連続解答</strong></article>
              </div>
              <div className="english-guide-tip"><span>PAST EXAM NOTE</span><p><b>送付された過去問は出題形式の分析専用です。</b>過去問の本文・単語・固有テーマは今回のテスト範囲に含めず、Chapter 15・16・18の教材だけで練習問題を構成します。</p></div>
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
