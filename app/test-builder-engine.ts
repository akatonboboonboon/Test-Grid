/**
 * API-key-free, deterministic test builder.
 *
 * This module deliberately does not call a model, touch localStorage, or render HTML.
 * It turns explicitly supplied scope facts and a lightweight exam-format description
 * into a solved, source-traceable test package that can be exported as JSON.
 */

export const TEST_BUILDER_SCHEMA_VERSION = 1 as const;
export const TEST_BUILDER_STORAGE_KEY = "test-grid:test-builder-projects:v1";
export const TEST_BUILDER_MAX_SCOPE_TEXT_LENGTH = 120_000;
export const TEST_BUILDER_MAX_FORMAT_TEXT_LENGTH = 20_000;
export const TEST_BUILDER_MAX_QUESTIONS = 100;
export const TEST_BUILDER_MAX_IMPORT_JSON_LENGTH = TEST_BUILDER_MAX_SCOPE_TEXT_LENGTH * 4;
export const TEST_BUILDER_MAX_COLLECTION_BYTES = 220_000;

export const TEST_BUILDER_PERIODS = [
  "first-midterm",
  "first-final",
  "second-midterm",
  "second-final",
  "other",
] as const;

export const TEST_BUILDER_PERIOD_LABELS = {
  "first-midterm": "前期中間",
  "first-final": "前期末",
  "second-midterm": "後期中間",
  "second-final": "後期末",
  other: "その他",
} as const;

export type TestBuilderGrade = 1 | 2 | 3 | 4 | 5;
export type TestBuilderPeriod = (typeof TEST_BUILDER_PERIODS)[number];
export type TestBuilderDifficulty = 1 | 2 | 3;
export type TestBuilderQuestionKind = "choice" | "fill" | "true-false" | "written";
export type TestBuilderScopeStyle = "qa" | "term-detail" | "definition" | "bullet" | "sentence";

export type TestBuilderInput = {
  grade: TestBuilderGrade;
  period: TestBuilderPeriod;
  subject: string;
  title: string;
  /** Authoritative duration in minutes. formatText controls composition only. */
  durationMinutes: number;
  /** Authoritative total score. formatText controls composition only. */
  totalPoints: number;
  /** Authoritative question count. formatText controls composition only. */
  questionCount: number;
  difficulty: TestBuilderDifficulty;
  scopeText: string;
  formatText: string;
  seed: string | number;
};

export type TestBuilderScopeEntry = {
  id: string;
  style: TestBuilderScopeStyle;
  prompt: string;
  answer: string;
  explanation: string;
  sourceExcerpt: string;
};

export type TestBuilderFormat = {
  durationMinutes: number;
  totalPoints: number;
  questionCount: number;
  kindCounts: Record<TestBuilderQuestionKind, number>;
  parsed: {
    durationMinutes: boolean;
    totalPoints: boolean;
    questionCount: boolean;
    composition: boolean;
  };
};

export type TestBuilderQuestion = {
  id: string;
  number: number;
  kind: TestBuilderQuestionKind;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  sourceExcerpt: string;
  points: number;
};

export type TestBuilderTest = {
  title: string;
  subject: string;
  grade: TestBuilderGrade;
  period: TestBuilderPeriod;
  durationMinutes: number;
  totalPoints: number;
  difficulty: TestBuilderDifficulty;
  questions: TestBuilderQuestion[];
};

export type SavedTestBuilderProject = {
  schemaVersion: typeof TEST_BUILDER_SCHEMA_VERSION;
  projectId: string;
  input: {
    grade: TestBuilderGrade;
    period: TestBuilderPeriod;
    subject: string;
    title: string;
    durationMinutes: number;
    totalPoints: number;
    questionCount: number;
    difficulty: TestBuilderDifficulty;
    scopeText: string;
    formatText: string;
    seed: string;
  };
  scopeEntries: TestBuilderScopeEntry[];
  format: TestBuilderFormat;
  test: TestBuilderTest;
};



/** Stable public name used by the authoring UI. */
export type TestBuilderProject = SavedTestBuilderProject;

export type TestBuilderValidation = {
  ok: boolean;
  errors: string[];
};

const QUESTION_KINDS: readonly TestBuilderQuestionKind[] = [
  "choice",
  "fill",
  "true-false",
  "written",
];
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu;
const HTML_TAG_PATTERN = /<\/?[A-Za-z][^>]*>/gu;
const MAX_SHORT_FIELD_LENGTH = 200;
const MAX_DURATION_MINUTES = 24 * 60;
const MAX_TOTAL_POINTS = 100_000;

type ScopeDraft = Omit<TestBuilderScopeEntry, "id">;

function fail(message: string): never {
  throw new Error(`TEST_BUILDER_INVALID: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSpaces(value: string) {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

/** Remove markup before storing content. Consumers must still render strings as text. */
export function testBuilderPlainText(value: string): string {
  return value
    .replace(CONTROL_CHARACTER_PATTERN, " ")
    .replace(HTML_TAG_PATTERN, " ")
    .replace(/\r\n?/gu, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/gu, " ").trim())
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function assertFiniteInteger(value: unknown, label: string, minimum: number, maximum: number) {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    fail(`${label} must be an integer from ${minimum} to ${maximum}`);
  }
  return value as number;
}

function assertFiniteNumber(value: unknown, label: string, minimum: number, maximum: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
    fail(`${label} must be a finite number from ${minimum} to ${maximum}`);
  }
  return value;
}

function assertShortText(value: unknown, label: string) {
  if (typeof value !== "string") fail(`${label} must be text`);
  const clean = normalizeSpaces(testBuilderPlainText(value));
  if (!clean || clean.length > MAX_SHORT_FIELD_LENGTH) {
    fail(`${label} must contain 1-${MAX_SHORT_FIELD_LENGTH} characters`);
  }
  return clean;
}

function normalizeInput(input: TestBuilderInput): SavedTestBuilderProject["input"] {
  if (!isRecord(input)) fail("input must be an object");
  const grade = assertFiniteInteger(input.grade, "grade", 1, 5) as TestBuilderGrade;
  if (!TEST_BUILDER_PERIODS.includes(input.period as TestBuilderPeriod)) fail("period is invalid");
  const period = input.period as TestBuilderPeriod;
  const subject = assertShortText(input.subject, "subject");
  const title = assertShortText(input.title, "title");
  const durationMinutes = assertFiniteInteger(input.durationMinutes, "durationMinutes", 1, MAX_DURATION_MINUTES);
  const totalPoints = assertFiniteNumber(input.totalPoints, "totalPoints", 0.01, MAX_TOTAL_POINTS);
  const questionCount = assertFiniteInteger(input.questionCount, "questionCount", 1, TEST_BUILDER_MAX_QUESTIONS);
  const difficulty = assertFiniteInteger(input.difficulty, "difficulty", 1, 3) as TestBuilderDifficulty;
  if (typeof input.scopeText !== "string" || input.scopeText.length > TEST_BUILDER_MAX_SCOPE_TEXT_LENGTH) {
    fail(`scopeText must be at most ${TEST_BUILDER_MAX_SCOPE_TEXT_LENGTH} characters`);
  }
  if (typeof input.formatText !== "string" || input.formatText.length > TEST_BUILDER_MAX_FORMAT_TEXT_LENGTH) {
    fail(`formatText must be at most ${TEST_BUILDER_MAX_FORMAT_TEXT_LENGTH} characters`);
  }
  const scopeText = testBuilderPlainText(input.scopeText);
  const formatText = testBuilderPlainText(input.formatText);
  if (!scopeText) fail("scopeText must contain at least one scope item");
  const seed = normalizeSpaces(String(input.seed));
  if (!seed || seed.length > 512) fail("seed must contain 1-512 characters");
  return {
    grade,
    period,
    subject,
    title,
    durationMinutes,
    totalPoints,
    questionCount,
    difficulty,
    scopeText,
    formatText,
    seed,
  };
}

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shortHash(value: string) {
  return hashText(value).toString(36).padStart(7, "0");
}

function seededRandom(seed: string) {
  let state = hashText(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function scopeDraft(
  style: TestBuilderScopeStyle,
  prompt: string,
  answer: string,
  explanation: string,
  sourceExcerpt: string,
): ScopeDraft | null {
  const cleanPrompt = normalizeSpaces(testBuilderPlainText(prompt));
  const cleanAnswer = normalizeSpaces(testBuilderPlainText(answer));
  const cleanExplanation = normalizeSpaces(testBuilderPlainText(explanation));
  const cleanExcerpt = normalizeSpaces(testBuilderPlainText(sourceExcerpt));
  if (!cleanPrompt || !cleanAnswer || !cleanExcerpt) return null;
  return {
    style,
    prompt: cleanPrompt,
    answer: cleanAnswer,
    explanation: cleanExplanation || cleanAnswer,
    sourceExcerpt: cleanExcerpt,
  };
}

/** Parse only facts present in scopeText; no encyclopedia or model completion is used. */
export function parseTestBuilderScope(scopeText: string): TestBuilderScopeEntry[] {
  if (typeof scopeText !== "string" || scopeText.length > TEST_BUILDER_MAX_SCOPE_TEXT_LENGTH) {
    fail(`scopeText must be at most ${TEST_BUILDER_MAX_SCOPE_TEXT_LENGTH} characters`);
  }
  const clean = testBuilderPlainText(scopeText);
  if (!clean) fail("scopeText must contain at least one scope item");

  const lines = clean.split("\n").map((line) => line.trim()).filter(Boolean);
  const drafts: ScopeDraft[] = [];
  let pendingQuestion: { prompt: string; source: string } | null = null;
  let lastDraftIndex = -1;

  const add = (draft: ScopeDraft | null) => {
    if (!draft) return;
    drafts.push(draft);
    lastDraftIndex = drafts.length - 1;
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/^\s*(?:[-*•・]|\d+[.)、])\s*/u, "").trim();
    if (!line) continue;

    const inlineQa = line.match(/^(?:Q|問|問題)\s*[:：]\s*(.+?)\s+(?:A|答|解答)\s*[:：]\s*(.+)$/iu);
    if (inlineQa) {
      add(scopeDraft("qa", inlineQa[1], inlineQa[2], inlineQa[2], rawLine));
      pendingQuestion = null;
      continue;
    }

    const question = line.match(/^(?:Q|問|問題)\s*[:：]\s*(.+)$/iu);
    if (question) {
      pendingQuestion = { prompt: question[1], source: rawLine };
      continue;
    }

    const answer = line.match(/^(?:A|答|解答)\s*[:：]\s*(.+)$/iu);
    if (answer && pendingQuestion) {
      add(scopeDraft(
        "qa",
        pendingQuestion.prompt,
        answer[1],
        answer[1],
        `${pendingQuestion.source} ${rawLine}`,
      ));
      pendingQuestion = null;
      continue;
    }

    const explanation = line.match(/^(?:解説|理由)\s*[:：]\s*(.+)$/u);
    if (explanation && lastDraftIndex >= 0) {
      drafts[lastDraftIndex] = {
        ...drafts[lastDraftIndex],
        explanation: normalizeSpaces(explanation[1]),
        sourceExcerpt: `${drafts[lastDraftIndex].sourceExcerpt} ${rawLine}`,
      };
      continue;
    }

    const triple = line.split("::").map((part) => normalizeSpaces(part));
    if (triple.length >= 2 && triple[0] && triple[1]) {
      add(scopeDraft(
        "term-detail",
        `${triple[0]}について答えなさい。`,
        triple[1],
        triple.slice(2).join("::") || triple[1],
        rawLine,
      ));
      continue;
    }

    const definition = line.match(/^([^=＝]{1,200})[=＝](.+)$/u);
    if (definition) {
      add(scopeDraft(
        "definition",
        `${normalizeSpaces(definition[1])}を説明しなさい。`,
        definition[2],
        definition[2],
        rawLine,
      ));
      continue;
    }

    const wasBullet = /^\s*(?:[-*•・]|\d+[.)、])\s+/u.test(rawLine);
    add(scopeDraft(
      wasBullet ? "bullet" : "sentence",
      "範囲資料にある内容をそのまま答えなさい。",
      line,
      line,
      rawLine,
    ));
  }

  if (pendingQuestion) {
    add(scopeDraft("sentence", "範囲資料にある内容をそのまま答えなさい。", pendingQuestion.prompt, pendingQuestion.prompt, pendingQuestion.source));
  }

  const seen = new Set<string>();
  const entries: TestBuilderScopeEntry[] = [];
  for (const draft of drafts) {
    const key = `${normalizeSpaces(draft.prompt).toLocaleLowerCase()}\u0000${normalizeSpaces(draft.answer).toLocaleLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      ...draft,
      id: `scope-${entries.length + 1}-${shortHash(`${draft.prompt}\u0000${draft.answer}\u0000${draft.sourceExcerpt}`)}`,
    });
  }
  if (!entries.length) fail("scopeText did not contain a usable item");
  return entries;
}

function firstBoundedMatch(text: string, patterns: readonly RegExp[], minimum: number, maximum: number) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match ? Number(match[1]) : Number.NaN;
    if (Number.isInteger(value) && value >= minimum && value <= maximum) return value;
  }
  return null;
}

const KIND_PATTERNS: Record<TestBuilderQuestionKind, readonly RegExp[]> = {
  choice: [/(?:4\s*択|四\s*択|選択(?:式)?)[^\d]{0,8}(\d{1,3})\s*問/iu, /(\d{1,3})\s*問[^\n]{0,8}(?:4\s*択|四\s*択|選択(?:式)?)/iu],
  fill: [/(?:穴\s*埋め|空欄(?:補充)?)[^\d]{0,8}(\d{1,3})\s*問/iu, /(\d{1,3})\s*問[^\n]{0,8}(?:穴\s*埋め|空欄(?:補充)?)/iu],
  "true-false": [/(?:T\s*\/?\s*F|正誤|○\s*×|〇\s*×)[^\d]{0,8}(\d{1,3})\s*問/iu, /(\d{1,3})\s*問[^\n]{0,8}(?:T\s*\/?\s*F|正誤|○\s*×|〇\s*×)/iu],
  written: [/(?:記述(?:式)?|論述)[^\d]{0,8}(\d{1,3})\s*問/iu, /(\d{1,3})\s*問[^\n]{0,8}(?:記述(?:式)?|論述)/iu],
};

const KIND_PRESENCE: Record<TestBuilderQuestionKind, RegExp> = {
  choice: /4\s*択|四\s*択|選択(?:式)?/iu,
  fill: /穴\s*埋め|空欄(?:補充)?/iu,
  "true-false": /T\s*\/?\s*F|正誤|○\s*×|〇\s*×/iu,
  written: /記述(?:式)?|論述/iu,
};

function distributeKinds(questionCount: number, formatText: string) {
  const explicit: Partial<Record<TestBuilderQuestionKind, number>> = {};
  const present: TestBuilderQuestionKind[] = [];
  for (const kind of QUESTION_KINDS) {
    const count = firstBoundedMatch(formatText, KIND_PATTERNS[kind], 0, TEST_BUILDER_MAX_QUESTIONS);
    if (count !== null) explicit[kind] = count;
    if (KIND_PRESENCE[kind].test(formatText)) present.push(kind);
  }
  const namedKinds = present.length ? present : [...QUESTION_KINDS];
  const kindCounts = Object.fromEntries(QUESTION_KINDS.map((kind) => [kind, 0])) as Record<TestBuilderQuestionKind, number>;
  let assigned = 0;
  for (const kind of QUESTION_KINDS) {
    const count = Math.min(explicit[kind] ?? 0, Math.max(0, questionCount - assigned));
    kindCounts[kind] = count;
    assigned += count;
  }
  for (let index = assigned; index < questionCount; index += 1) {
    kindCounts[namedKinds[(index - assigned) % namedKinds.length]] += 1;
  }
  return { kindCounts, compositionParsed: present.length > 0 || Object.keys(explicit).length > 0 };
}

export function parseTestBuilderFormat(
  formatText: string,
  fallback: Pick<SavedTestBuilderProject["input"], "durationMinutes" | "totalPoints" | "questionCount">,
): TestBuilderFormat {
  if (typeof formatText !== "string" || formatText.length > TEST_BUILDER_MAX_FORMAT_TEXT_LENGTH) {
    fail(`formatText must be at most ${TEST_BUILDER_MAX_FORMAT_TEXT_LENGTH} characters`);
  }
  const clean = testBuilderPlainText(formatText);
  const duration = firstBoundedMatch(clean, [
    /(?:試験\s*時間|制限\s*時間|時間)\s*[:：]?\s*(\d{1,4})\s*分/iu,
    /(\d{1,4})\s*分(?:間)?/iu,
  ], 1, MAX_DURATION_MINUTES);
  const points = firstBoundedMatch(clean, [
    /(?:満点|合計)\s*[:：]?\s*(\d{1,6})\s*点?/u,
    /(\d{1,6})\s*点\s*満点/u,
  ], 1, MAX_TOTAL_POINTS);

  const compositionValues = QUESTION_KINDS.map((kind) => firstBoundedMatch(
    clean,
    KIND_PATTERNS[kind],
    0,
    TEST_BUILDER_MAX_QUESTIONS,
  ) ?? 0);
  const compositionTotal = compositionValues.reduce((sum, value) => sum + value, 0);
  const explicitQuestionCount = firstBoundedMatch(clean, [
    /(?:全|合計|問題\s*数)\s*[:：]?\s*(\d{1,3})\s*問/u,
    /(\d{1,3})\s*問\s*(?:構成|出題|あります|とする)/u,
  ], 1, TEST_BUILDER_MAX_QUESTIONS);
  const questionCount = explicitQuestionCount
    ?? (compositionTotal > 0 && compositionTotal <= TEST_BUILDER_MAX_QUESTIONS ? compositionTotal : fallback.questionCount);
  const effectiveDuration = duration ?? fallback.durationMinutes;
  const effectivePoints = points ?? fallback.totalPoints;
  assertFiniteInteger(effectiveDuration, "effective durationMinutes", 1, MAX_DURATION_MINUTES);
  assertFiniteNumber(effectivePoints, "effective totalPoints", 0.01, MAX_TOTAL_POINTS);
  assertFiniteInteger(questionCount, "effective questionCount", 1, TEST_BUILDER_MAX_QUESTIONS);
  const { kindCounts, compositionParsed } = distributeKinds(questionCount, clean);
  return {
    durationMinutes: effectiveDuration,
    totalPoints: effectivePoints,
    questionCount,
    kindCounts,
    parsed: {
      durationMinutes: duration !== null,
      totalPoints: points !== null,
      questionCount: explicitQuestionCount !== null || compositionTotal > 0,
      composition: compositionParsed,
    },
  };
}

function expandedKinds(kindCounts: Record<TestBuilderQuestionKind, number>) {
  return QUESTION_KINDS.flatMap((kind) => Array.from({ length: kindCounts[kind] }, () => kind));
}

function allocatePoints(totalPoints: number, count: number) {
  const units = Math.round(totalPoints * 100);
  if (units < count) fail("totalPoints is too small to give every question a positive score");
  const base = Math.floor(units / count);
  const remainder = units - base * count;
  return Array.from({ length: count }, (_, index) => (base + (index < remainder ? 1 : 0)) / 100);
}

function choiceOptions(entry: TestBuilderScopeEntry, entries: readonly TestBuilderScopeEntry[], random: () => number) {
  const unique = [...new Set([entry.answer, ...shuffled(entries, random).map((item) => item.answer)])];
  if (unique.length < 4) return null;
  return shuffled(unique.slice(0, 4), random);
}

function buildQuestion(
  requestedKind: TestBuilderQuestionKind,
  entry: TestBuilderScopeEntry,
  entries: readonly TestBuilderScopeEntry[],
  number: number,
  points: number,
  random: () => number,
  projectKey: string,
  kindOrdinal: number,
): TestBuilderQuestion {
  let kind = requestedKind;
  let prompt = entry.prompt;
  let answer = entry.answer;
  let options: string[] | undefined;

  if (kind === "choice") {
    const choices = choiceOptions(entry, entries, random);
    if (choices) {
      options = choices;
      prompt = `${entry.prompt} 範囲入力と一致するものを1つ選びなさい。`;
    } else {
      kind = "fill";
    }
  }
  if (kind === "fill") {
    prompt = `次の問いの空欄［　］に入る、範囲資料どおりの答えを書きなさい。\n${entry.prompt}`;
  } else if (kind === "true-false") {
    const alternative = entries.find((candidate) => (
      candidate.id !== entry.id && candidate.answer !== entry.answer
    ));
    const isFalse = kindOrdinal % 2 === 1 && Boolean(alternative);
    const presentedAnswer = isFalse && alternative ? alternative.answer : entry.answer;
    prompt = `次の問いと回答の組合せは範囲資料と一致するか。TまたはFで答えなさい。\n問い：${entry.prompt}\n回答：${presentedAnswer}`;
    answer = isFalse ? "F" : "T";
  } else if (kind === "written") {
    prompt = `範囲資料に基づき、次の問いに記述で答えなさい。\n${entry.prompt}`;
  }

  return {
    id: `tbq-${shortHash(`${projectKey}:${number}:${kind}:${entry.id}`)}`,
    number,
    kind,
    prompt,
    ...(options ? { options } : {}),
    answer,
    explanation: kind === "true-false"
      ? answer === "T"
        ? `Tです。範囲資料「${entry.sourceExcerpt}」によれば、この問いの正しい回答は「${entry.answer}」です。`
        : `Fです。提示された回答は別の範囲項目の内容です。範囲資料「${entry.sourceExcerpt}」によれば、正しくは「${entry.answer}」です。`
      : `範囲入力「${entry.sourceExcerpt}」に基づく正答は「${entry.answer}」です。${entry.explanation}`,
    sourceExcerpt: entry.sourceExcerpt,
    points,
  };
}

function stableJson(value: unknown) {
  return JSON.stringify(value);
}

function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function createTestBuilderProject(input: TestBuilderInput): SavedTestBuilderProject {
  const normalized = normalizeInput(input);
  const scopeEntries = parseTestBuilderScope(normalized.scopeText);
  const parsedFormat = parseTestBuilderFormat(normalized.formatText, normalized);
  const composition = distributeKinds(normalized.questionCount, normalized.formatText);
  const format: TestBuilderFormat = {
    ...parsedFormat,
    durationMinutes: normalized.durationMinutes,
    totalPoints: normalized.totalPoints,
    questionCount: normalized.questionCount,
    kindCounts: composition.kindCounts,
    parsed: {
      ...parsedFormat.parsed,
      composition: composition.compositionParsed,
    },
  };
  const random = seededRandom(`${normalized.seed}\u0000${normalized.subject}\u0000${normalized.title}`);
  const entries = shuffled(scopeEntries, random);
  const kinds = shuffled(expandedKinds(format.kindCounts), random);
  const points = allocatePoints(format.totalPoints, format.questionCount);
  const projectKey = stableJson({
    grade: normalized.grade,
    period: normalized.period,
    subject: normalized.subject,
    title: normalized.title,
    seed: normalized.seed,
    durationMinutes: normalized.durationMinutes,
    totalPoints: normalized.totalPoints,
    questionCount: normalized.questionCount,
    difficulty: normalized.difficulty,
    scopeText: normalized.scopeText,
    formatText: normalized.formatText,
  });
  const kindOccurrences: Record<TestBuilderQuestionKind, number> = {
    choice: 0,
    fill: 0,
    "true-false": 0,
    written: 0,
  };
  const questions = Array.from({ length: format.questionCount }, (_, index) => {
    const requestedKind = kinds[index];
    const kindOrdinal = kindOccurrences[requestedKind];
    kindOccurrences[requestedKind] += 1;
    return buildQuestion(
      requestedKind,
      entries[index % entries.length],
      scopeEntries,
      index + 1,
      points[index],
      random,
      projectKey,
      kindOrdinal,
    );
  });
  return {
    schemaVersion: TEST_BUILDER_SCHEMA_VERSION,
    projectId: `test-builder-${shortHash(projectKey)}`,
    input: normalized,
    scopeEntries,
    format,
    test: {
      title: normalized.title,
      subject: normalized.subject,
      grade: normalized.grade,
      period: normalized.period,
      durationMinutes: format.durationMinutes,
      totalPoints: format.totalPoints,
      difficulty: normalized.difficulty,
      questions,
    },
  };
}

function structuralValidation(value: unknown): TestBuilderValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { ok: false, errors: ["project must be an object"] };
  if (value.schemaVersion !== TEST_BUILDER_SCHEMA_VERSION) errors.push("unsupported schemaVersion");
  if (!isRecord(value.input)) errors.push("input is missing");
  if (!Array.isArray(value.scopeEntries) || value.scopeEntries.length === 0) errors.push("scopeEntries are missing");
  if (!isRecord(value.format)) errors.push("format is missing");
  if (!isRecord(value.test) || !Array.isArray(value.test.questions)) {
    errors.push("test questions are missing");
    return { ok: false, errors };
  }
  const questions = value.test.questions as unknown[];
  if (questions.length < 1 || questions.length > TEST_BUILDER_MAX_QUESTIONS) errors.push("question count is outside 1-100");
  let points = 0;
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    if (!isRecord(question)) {
      errors.push(`question ${index + 1} is invalid`);
      continue;
    }
    for (const field of ["answer", "explanation", "sourceExcerpt", "kind"] as const) {
      if (typeof question[field] !== "string" || !(question[field] as string).trim()) {
        errors.push(`question ${index + 1} has no ${field}`);
      }
    }
    if (!QUESTION_KINDS.includes(question.kind as TestBuilderQuestionKind)) errors.push(`question ${index + 1} kind is invalid`);
    if (typeof question.points !== "number" || !Number.isFinite(question.points) || question.points <= 0) {
      errors.push(`question ${index + 1} points are invalid`);
    } else {
      points += question.points;
    }
    if ([question.prompt, question.answer, question.explanation, question.sourceExcerpt]
      .some((item) => typeof item === "string" && HTML_TAG_PATTERN.test(item))) {
      errors.push(`question ${index + 1} contains HTML markup`);
    }
  }
  const totalPoints = value.test.totalPoints;
  if (typeof totalPoints !== "number" || Math.abs(points - totalPoints) > 1e-8) errors.push("question points do not equal totalPoints");
  return { ok: errors.length === 0, errors };
}

/**
 * Validate both structure and provenance. Regeneration comparison means imported JSON
 * cannot silently replace an answer, explanation, score, or source excerpt.
 */
export function validateTestBuilderProject(value: unknown): TestBuilderValidation {
  const structural = structuralValidation(value);
  if (!structural.ok || !isRecord(value) || !isRecord(value.input)) return structural;
  try {
    const expected = createTestBuilderProject(value.input as unknown as TestBuilderInput);
    if (stableJson(value) !== stableJson(expected)) {
      return { ok: false, errors: [...structural.errors, "project differs from deterministic source-bound regeneration"] };
    }
    return { ok: true, errors: [] };
  } catch (error) {
    return {
      ok: false,
      errors: [...structural.errors, error instanceof Error ? error.message : "project regeneration failed"],
    };
  }
}

export function exportTestBuilderProject(project: SavedTestBuilderProject): string {
  const validation = validateTestBuilderProject(project);
  if (!validation.ok) fail(validation.errors.join(" / "));
  return JSON.stringify(project, null, 2);
}

export function importTestBuilderProject(json: string): SavedTestBuilderProject {
  if (typeof json !== "string" || json.length > TEST_BUILDER_MAX_IMPORT_JSON_LENGTH) {
    fail("import JSON is empty or too large");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    fail("import JSON could not be parsed");
  }
  const validation = validateTestBuilderProject(parsed);
  if (!validation.ok) fail(validation.errors.join(" / "));
  return parsed as SavedTestBuilderProject;
}



/** Stable public aliases used by the authoring UI. */
export const generateTestProject = createTestBuilderProject;
export const exportProject = exportTestBuilderProject;
export const importProject = importTestBuilderProject;

/** Parse a localStorage value without directly depending on browser APIs. */
export function readProjects(raw: string | null | undefined): TestBuilderProject[] {
  if (raw === null || raw === undefined || raw.trim() === "") return [];
  if (utf8ByteLength(raw) > TEST_BUILDER_MAX_COLLECTION_BYTES) fail("project collection is too large");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("project collection JSON could not be parsed");
  }
  if (!Array.isArray(parsed) || parsed.length > 200) fail("project collection must contain at most 200 projects");
  return parsed.map((project, index) => {
    const validation = validateTestBuilderProject(project);
    if (!validation.ok) fail(`project ${index + 1}: ${validation.errors.join(" / ")}`);
    return project as TestBuilderProject;
  });
}

/** Serialize projects for localStorage; this function performs no browser I/O. */
export function writeProjects(projects: readonly TestBuilderProject[]): string {
  if (!Array.isArray(projects) || projects.length > 200) fail("project collection must contain at most 200 projects");
  for (let index = 0; index < projects.length; index += 1) {
    const validation = validateTestBuilderProject(projects[index]);
    if (!validation.ok) fail(`project ${index + 1}: ${validation.errors.join(" / ")}`);
  }
  const serialized = JSON.stringify(projects);
  if (utf8ByteLength(serialized) > TEST_BUILDER_MAX_COLLECTION_BYTES) fail("project collection is too large");
  return serialized;
}
