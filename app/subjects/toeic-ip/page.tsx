"use client";

import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "../../toeic-ip.module.css";
import {
  TOEIC_FORMATS,
  TOEIC_OFFICIAL_RESOURCES,
  TOEIC_QUESTIONS,
  TOEIC_STUDY_PHASES,
  TOEIC_VOCAB,
} from "../../toeic-ip-data";
import ToeicListeningPlayer, {
  type ToeicVoiceAccent,
} from "../../toeic-ip-listening-player";

type Question = (typeof TOEIC_QUESTIONS)[number];
type Part = Question["part"];
type Difficulty = Question["difficulty"];
type DeliveryMode = "paper" | "online-msa";
type TabId =
  | "overview"
  | "parts"
  | "listening"
  | "vocab"
  | "mock"
  | "resources";
type DifficultyFilter = "all" | Difficulty;
type VocabStatusFilter = "all" | "unmastered" | "mastered";

type Settings = {
  activeTab: TabId;
  format: DeliveryMode;
  parts: Part[];
  listeningParts: Part[];
  difficulty: DifficultyFilter;
};

type ProgressEntry = {
  attempts: number;
  correct: number;
  lastAnswerIndex: number;
  updatedAt: number;
};

type ProgressMap = Record<string, ProgressEntry>;

type MockItem = {
  instanceId: string;
  questionId: string;
};

type MockCount = 20 | 40 | 90 | 200;

type MockSession = {
  version: 1;
  count: MockCount;
  format: DeliveryMode;
  durationSeconds: number;
  elapsedSeconds: number;
  index: number;
  items: MockItem[];
  answers: Record<string, number>;
  paused: boolean;
  startedAt: number;
  savedAt: number;
};

type Breakdown = Record<string, { correct: number; total: number }>;

type MockResult = {
  count: number;
  correct: number;
  unanswered: number;
  format: DeliveryMode;
  partBreakdown: Breakdown;
  abilityBreakdown: Breakdown;
  review: Array<{
    instanceId: string;
    questionId: string;
    selected: number | null;
    correct: boolean;
  }>;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const STORAGE_PREFIX = "test-grid:toeic-ip:";
const SETTINGS_KEY = `${STORAGE_PREFIX}settings:v1`;
const PROGRESS_KEY = `${STORAGE_PREFIX}progress:v1`;
const VOCAB_KEY = `${STORAGE_PREFIX}vocab:v1`;
const MOCK_KEY = `${STORAGE_PREFIX}mock-session:v1`;

const ALL_PARTS: Part[] = [1, 2, 3, 4, 5, 6, 7];
const LISTENING_PARTS: Part[] = [1, 2, 3, 4];
const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "全体" },
  { id: "parts", label: "Part別" },
  { id: "listening", label: "Listening" },
  { id: "vocab", label: "単語帳" },
  { id: "mock", label: "模試" },
  { id: "resources", label: "公式資料" },
];

const PART_NAMES: Record<Part, string> = {
  1: "写真描写問題",
  2: "応答問題",
  3: "会話問題",
  4: "説明文問題",
  5: "短文穴埋め問題",
  6: "長文穴埋め問題",
  7: "読解問題",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  basic: "基礎",
  standard: "標準",
  advanced: "発展",
};

const VOCAB_BATCH_SIZE = 90;

const TOPIC_LABELS: Record<string, string> = {
  "corporate-development": "企業・事業開発",
  dining: "飲食",
  entertainment: "娯楽・イベント",
  finance: "財務・会計",
  "general-business": "一般ビジネス",
  health: "医療・健康",
  property: "不動産・施設",
  manufacturing: "製造",
  office: "オフィス",
  personnel: "人事・採用",
  purchasing: "購買・物流",
  technology: "技術",
  travel: "旅行・交通",
};

const POS_LABELS: Record<string, string> = {
  noun: "名詞",
  verb: "動詞",
  adjective: "形容詞",
  adverb: "副詞",
  phrase: "熟語・定型表現",
};

const PAPER_DISTRIBUTION: Record<Part, number> = {
  1: 6,
  2: 25,
  3: 39,
  4: 30,
  5: 30,
  6: 16,
  7: 54,
};

const ONLINE_DISTRIBUTION: Record<Part, number> = {
  1: 3,
  2: 9,
  3: 18,
  4: 15,
  5: 12,
  6: 8,
  7: 25,
};

const MOCK_PRESETS: {
  count: MockCount;
  minutes: number;
  label: string;
  fixedFormat?: DeliveryMode;
}[] = [
  { count: 20, minutes: 15, label: "20問・15分" },
  { count: 40, minutes: 30, label: "40問・30分" },
  {
    count: 90,
    minutes: 62,
    label: "90問・約62分",
    fixedFormat: "online-msa",
  },
  {
    count: 200,
    minutes: 120,
    label: "200問・120分",
    fixedFormat: "paper",
  },
];

const FORMAT_CARDS = [
  {
    id: "paper" as const,
    title: "紙のTOEIC IP",
    summary: "200問・約120分",
    listening: "100問・約45分",
    reading: "100問・75分",
  },
  {
    id: "online-msa" as const,
    title: "オンライン（MSA）",
    summary: "90問・約1時間",
    listening: "45問・約25分",
    reading: "45問・約37分",
  },
];

const FEATURED_RESOURCES = [
  {
    id: "iibc-sample",
    title: "IIBC公式：テスト形式・サンプル問題",
    description:
      "Part 1〜7の出題形式と公式サンプルを確認できます。まず形式確認に使います。",
    url: "https://www.iibc-global.org/toeic/test/lr/about/format/sample01.html",
  },
  {
    id: "ets-sample",
    title: "ETS公式：TOEIC Listening & Reading対策",
    description:
      "ETSが提供するサンプル・準備資料です。Listeningの音声形式確認にも使えます。",
    url: "https://www.ets.org/toeic/test-takers/prepare.html",
  },
  {
    id: "official-book-12",
    title: "公式TOEIC Listening & Reading 問題集 12",
    description:
      "本番と同じ制作プロセスによる公式教材。模試2回分・計400問を収録しています。",
    url: "https://www.iibc-global.org/toeic/support/prep/lr_ud_12/pr.html",
  },
];

const DEFAULT_SETTINGS: Settings = {
  activeTab: "overview",
  format: "online-msa",
  parts: ALL_PARTS,
  listeningParts: LISTENING_PARTS,
  difficulty: "all",
};

const QUESTION_BY_ID = new Map<string, Question>(
  TOEIC_QUESTIONS.map((question) => [question.id, question]),
);

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function isPart(value: unknown): value is Part {
  return (
    typeof value === "number" &&
    ALL_PARTS.includes(value as Part)
  );
}

function isTab(value: unknown): value is TabId {
  return (
    typeof value === "string" &&
    TABS.some((tab) => tab.id === value)
  );
}

function restoreSettings(value: unknown): Settings {
  if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
  const raw = value as Partial<Settings>;
  const parts = Array.isArray(raw.parts) ? raw.parts.filter(isPart) : [];
  const listeningParts = Array.isArray(raw.listeningParts)
    ? raw.listeningParts.filter(
        (part): part is Part => isPart(part) && part <= 4,
      )
    : [];
  const difficulty =
    raw.difficulty === "all" ||
    raw.difficulty === "basic" ||
    raw.difficulty === "standard" ||
    raw.difficulty === "advanced"
      ? raw.difficulty
      : "all";

  return {
    activeTab: isTab(raw.activeTab) ? raw.activeTab : "overview",
    format: raw.format === "paper" ? "paper" : "online-msa",
    parts: parts.length ? parts : ALL_PARTS,
    listeningParts: listeningParts.length
      ? listeningParts
      : LISTENING_PARTS,
    difficulty,
  };
}

function readJson(key: string): unknown {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function calculateCountdown(): Countdown {
  const target = new Date("2026-12-25T00:00:00+09:00").getTime();
  const remaining = Math.max(0, target - Date.now());
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
  };
}

function clock(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  return [hours, minutes, rest]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function accentFor(question: Question): ToeicVoiceAccent {
  const script = question.script ?? "";
  if (/\bUK\b|British/i.test(script)) return "UK";
  if (/Canada|Canadian/i.test(script)) return "CA";
  if (/Australia|Australian/i.test(script)) return "AU";
  return "US";
}

function normalizeWords(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9']+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function dictationScore(input: string, answer: string) {
  const expected = normalizeWords(answer);
  const actual = normalizeWords(input);
  const remaining = [...expected];
  let matches = 0;
  for (const word of actual) {
    const index = remaining.indexOf(word);
    if (index >= 0) {
      matches += 1;
      remaining.splice(index, 1);
    }
  }
  return expected.length ? Math.round((matches / expected.length) * 100) : 0;
}

function scaledDistribution(
  format: DeliveryMode,
  count: number,
): Record<Part, number> {
  const source =
    format === "paper" ? PAPER_DISTRIBUTION : ONLINE_DISTRIBUTION;
  const sourceTotal = Object.values(source).reduce(
    (sum, value) => sum + value,
    0,
  );
  const result = {} as Record<Part, number>;
  const fractions: Array<{ part: Part; fraction: number }> = [];
  let allocated = 0;

  for (const part of ALL_PARTS) {
    const exact = (source[part] / sourceTotal) * count;
    const base = Math.floor(exact);
    result[part] = base;
    allocated += base;
    fractions.push({ part, fraction: exact - base });
  }

  fractions.sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; allocated < count; index += 1) {
    result[fractions[index % fractions.length].part] += 1;
    allocated += 1;
  }
  return result;
}

function buildMockItems(
  format: DeliveryMode,
  count: MockCount,
): MockItem[] {
  const allocation = scaledDistribution(format, count);
  const items: MockItem[] = [];
  let serial = 0;

  for (const part of ALL_PARTS) {
    const pool = TOEIC_QUESTIONS.filter(
      (question) => question.part === part,
    );
    let round = shuffle(pool);
    for (let index = 0; index < allocation[part]; index += 1) {
      if (index > 0 && index % pool.length === 0) round = shuffle(pool);
      const question = round[index % pool.length];
      serial += 1;
      items.push({
        questionId: question.id,
        instanceId: `${question.id}:${serial}:${Date.now()}:${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      });
    }
  }
  return items;
}

function validMockSession(value: unknown): MockSession | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<MockSession>;
  const counts: MockCount[] = [20, 40, 90, 200];
  if (
    raw.version !== 1 ||
    !counts.includes(raw.count as MockCount) ||
    !Array.isArray(raw.items) ||
    !raw.items.length ||
    !raw.items.every(
      (item) =>
        item &&
        typeof item.instanceId === "string" &&
        typeof item.questionId === "string" &&
        QUESTION_BY_ID.has(item.questionId),
    )
  ) {
    return null;
  }
  return {
    version: 1,
    count: raw.count as MockCount,
    format: raw.format === "paper" ? "paper" : "online-msa",
    durationSeconds:
      typeof raw.durationSeconds === "number" ? raw.durationSeconds : 1800,
    elapsedSeconds:
      typeof raw.elapsedSeconds === "number" ? raw.elapsedSeconds : 0,
    index:
      typeof raw.index === "number"
        ? Math.min(Math.max(0, raw.index), raw.items.length - 1)
        : 0,
    items: raw.items as MockItem[],
    answers:
      raw.answers && typeof raw.answers === "object" ? raw.answers : {},
    paused: raw.paused !== false,
    startedAt:
      typeof raw.startedAt === "number" ? raw.startedAt : Date.now(),
    savedAt: typeof raw.savedAt === "number" ? raw.savedAt : Date.now(),
  };
}

function unknownRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function textField(
  record: Record<string, unknown>,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

function QuestionView({
  question,
  selected,
  answered,
  testMode = false,
  onChoose,
  onNext,
  nextLabel = "次の問題",
}: {
  question: Question;
  selected: number | null;
  answered: boolean;
  testMode?: boolean;
  onChoose: (index: number) => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  const [dictation, setDictation] = useState("");
  const [dictationChecked, setDictationChecked] = useState(false);
  const correct = selected === question.answerIndex;
  const hasAudio = Boolean(question.script);
  const hideAudioChoiceText = (question.part === 1 || question.part === 2) && !answered;

  return (
    <div className={styles.practiceShell}>
      <article className={styles.questionPane}>
        <div className={styles.questionMeta}>
          <span>Part {question.part}</span>
          <span>{DIFFICULTY_LABELS[question.difficulty]}</span>
          {question.ability.map((ability) => (
            <span key={ability}>{ability}</span>
          ))}
        </div>

        {question.scene ? (
          <figure className={styles.scene}>
            <img
              alt={question.scene.image.alt}
              className={styles.scenePhoto}
              decoding="async"
              height={question.scene.image.height}
              loading="eager"
              src={question.scene.image.src}
              width={question.scene.image.width}
            />
            <figcaption className={styles.sceneCaption}>
              <span>Part 1 練習写真</span>
              <span>
                Photo:{" "}
                <a
                  href={question.scene.image.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {question.scene.image.credit}
                </a>
                {" · "}
                <a
                  href={question.scene.image.licenseUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {question.scene.image.licenseName}
                </a>
              </span>
            </figcaption>
            {answered ? (
              <p className={styles.sceneAnswer}>
                写真の要点：{question.scene.altJa}
              </p>
            ) : null}
          </figure>
        ) : null}

        {question.script ? (
          <ToeicListeningPlayer
            text={question.script}
            recommendedAccent={accentFor(question)}
            testOnce={testMode}
            compact={testMode}
          />
        ) : null}

        {question.chart ? (
          <div className={styles.chart}>
            <strong>{question.chart.title}</strong>
            <table className={styles.partTable}>
              <thead>
                <tr>
                  {question.chart.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.chart.rows.map((row, rowIndex) => (
                  <tr key={`${question.id}-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${question.id}-${rowIndex}-${cellIndex}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {question.passage ? (
          <div className={styles.stimulus}>
            <p>{question.passage}</p>
          </div>
        ) : null}

        <h2>{question.prompt}</h2>
        <div className={styles.choices}>
          {question.choices.map((choice, index) => {
            const selectedClass = selected === index;
            const correctClass = answered && index === question.answerIndex;
            const wrongClass =
              answered && selectedClass && index !== question.answerIndex;
            return (
              <button
                className={cx(
                  styles.choice,
                  selectedClass && styles.selected,
                  correctClass && styles.correct,
                  wrongClass && styles.wrong,
                )}
                disabled={answered}
                key={`${question.id}-choice-${index}`}
                onClick={() => onChoose(index)}
                type="button"
              >
                <strong>{index + 1}</strong>
                <span>{hideAudioChoiceText ? `選択肢 ${String.fromCharCode(65 + index)}（音声のみ）` : choice}</span>
              </button>
            );
          })}
        </div>

        {hasAudio && !testMode ? (
          <div className={styles.dictation}>
            <label htmlFor={`dictation-${question.id}`}>
              <strong>ディクテーション</strong>
              <span> 聞こえた英文を入力し、回答後に照合します。</span>
            </label>
            <textarea
              id={`dictation-${question.id}`}
              onChange={(event) => {
                setDictation(event.target.value);
                setDictationChecked(false);
              }}
              placeholder="聞こえた語句を英語で入力"
              rows={4}
              value={dictation}
            />
            <button
              className={styles.secondaryButton}
              disabled={!answered || !dictation.trim()}
              onClick={() => setDictationChecked(true)}
              type="button"
            >
              ディクテーションを照合
            </button>
            {dictationChecked && question.script ? (
              <p>
                語句一致の目安：{" "}
                <strong>
                  {dictationScore(dictation, question.script)}%
                </strong>
                （語順・綴りも原文で確認）
              </p>
            ) : null}
          </div>
        ) : null}

        {answered ? (
          <div
            className={cx(
              styles.feedback,
              !correct && styles.isWrong,
            )}
            role="status"
          >
            <strong>{correct ? "正解です" : "もう一度根拠を確認"}</strong>
            <span>
              正解は {question.answerIndex + 1}：
              {question.choices[question.answerIndex]}
            </span>
          </div>
        ) : null}

        <div className={styles.questionActions}>
          <span>
            数字キー 1〜4
            {testMode ? " で選択、Enterで次へ" : " でも回答できます"}
          </span>
          {(answered || testMode) && (
            <button
              className={styles.primaryButton}
              disabled={testMode && selected === null}
              onClick={onNext}
              type="button"
            >
              {nextLabel}
            </button>
          )}
        </div>
      </article>

      <aside className={styles.reviewPane}>
        {answered ? (
          <>
            {question.script ? (
              <div className={styles.transcript}>
                <strong>Transcript</strong>
                <p>{question.script}</p>
              </div>
            ) : null}
            <h3>根拠</h3>
            <p>{question.evidence}</p>
            <h3>解説</h3>
            <p>{question.explanationJa}</p>
          </>
        ) : (
          <>
            <h3>{testMode ? "模試モード" : "解き方"}</h3>
            <p>
              {testMode
                ? "正誤とTranscriptは終了後に確認します。迷った問題も1つ選んで進みましょう。"
                : "先に設問の条件をつかみ、根拠になる表現を探します。回答後にTranscript・根拠・解説が開きます。"}
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

export default function ToeicIpPage() {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [masteredVocab, setMasteredVocab] = useState<string[]>([]);
  const [practiceDeck, setPracticeDeck] = useState<Question[]>(
    TOEIC_QUESTIONS,
  );
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceSelected, setPracticeSelected] = useState<number | null>(
    null,
  );
  const [practiceAnswered, setPracticeAnswered] = useState(false);
  const [listeningDeck, setListeningDeck] = useState<Question[]>(
    TOEIC_QUESTIONS.filter((question) => question.section === "listening"),
  );
  const [listeningIndex, setListeningIndex] = useState(0);
  const [listeningSelected, setListeningSelected] = useState<number | null>(
    null,
  );
  const [listeningAnswered, setListeningAnswered] = useState(false);
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabTopic, setVocabTopic] = useState("all");
  const [vocabDifficulty, setVocabDifficulty] = useState("all");
  const [vocabPartOfSpeech, setVocabPartOfSpeech] = useState("all");
  const [vocabStatus, setVocabStatus] = useState<VocabStatusFilter>("all");
  const [vocabVisibleCount, setVocabVisibleCount] =
    useState(VOCAB_BATCH_SIZE);
  const deferredVocabSearch = useDeferredValue(vocabSearch);
  const [mockCount, setMockCount] = useState<MockCount>(40);
  const [mockSession, setMockSession] = useState<MockSession | null>(null);
  const [mockResult, setMockResult] = useState<MockResult | null>(null);

  const practiceQuestion = practiceDeck[practiceIndex] ?? null;
  const listeningQuestion = listeningDeck[listeningIndex] ?? null;
  const mockItem = mockSession?.items[mockSession.index] ?? null;
  const mockQuestion = mockItem
    ? QUESTION_BY_ID.get(mockItem.questionId) ?? null
    : null;
  const mockSelected =
    mockItem && mockSession
      ? (mockSession.answers[mockItem.instanceId] ?? null)
      : null;

  useEffect(() => {
    const restoredSettings = restoreSettings(readJson(SETTINGS_KEY));
    const restoredProgress = readJson(PROGRESS_KEY);
    const restoredVocab = readJson(VOCAB_KEY);
    const restoredMock = validMockSession(readJson(MOCK_KEY));

    setSettings(restoredSettings);
    setProgress(
      restoredProgress && typeof restoredProgress === "object"
        ? (restoredProgress as ProgressMap)
        : {},
    );
    setMasteredVocab(
      Array.isArray(restoredVocab)
        ? restoredVocab.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
    );
    setMockSession(restoredMock);
    if (restoredMock) {
      setSettings((current) => ({ ...current, activeTab: "mock" }));
    }
    setCountdown(calculateCountdown());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const update = () => setCountdown(calculateCountdown());
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [hydrated, settings]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(VOCAB_KEY, JSON.stringify(masteredVocab));
  }, [hydrated, masteredVocab]);

  useEffect(() => {
    if (!hydrated) return;
    if (mockSession) {
      window.localStorage.setItem(
        MOCK_KEY,
        JSON.stringify({ ...mockSession, savedAt: Date.now() }),
      );
    } else {
      window.localStorage.removeItem(MOCK_KEY);
    }
  }, [hydrated, mockSession]);

  const finishMock = useCallback((session: MockSession) => {
    let correct = 0;
    let unanswered = 0;
    const partBreakdown: Breakdown = {};
    const abilityBreakdown: Breakdown = {};

    for (const item of session.items) {
      const question = QUESTION_BY_ID.get(item.questionId);
      if (!question) continue;
      const selected = session.answers[item.instanceId];
      const isCorrect = selected === question.answerIndex;
      if (selected === undefined) unanswered += 1;
      if (isCorrect) correct += 1;

      const partKey = `Part ${question.part}`;
      partBreakdown[partKey] ??= { correct: 0, total: 0 };
      partBreakdown[partKey].total += 1;
      if (isCorrect) partBreakdown[partKey].correct += 1;

      for (const ability of question.ability) {
        abilityBreakdown[ability] ??= { correct: 0, total: 0 };
        abilityBreakdown[ability].total += 1;
        if (isCorrect) abilityBreakdown[ability].correct += 1;
      }
    }

    setProgress((current) => {
      const next = { ...current };
      for (const item of session.items) {
        const question = QUESTION_BY_ID.get(item.questionId);
        const selected = session.answers[item.instanceId];
        if (!question || selected === undefined) continue;
        const previous = next[question.id] ?? {
          attempts: 0,
          correct: 0,
          lastAnswerIndex: selected,
          updatedAt: 0,
        };
        next[question.id] = {
          attempts: previous.attempts + 1,
          correct:
            previous.correct +
            (selected === question.answerIndex ? 1 : 0),
          lastAnswerIndex: selected,
          updatedAt: Date.now(),
        };
      }
      return next;
    });

    const review = session.items.flatMap((item) => {
      const question = QUESTION_BY_ID.get(item.questionId);
      if (!question) return [];
      const selected = session.answers[item.instanceId];
      return [{
        instanceId: item.instanceId,
        questionId: item.questionId,
        selected: selected === undefined ? null : selected,
        correct: selected === question.answerIndex,
      }];
    });

    setMockResult({
      count: session.items.length,
      correct,
      unanswered,
      format: session.format,
      partBreakdown,
      abilityBreakdown,
      review,
    });
    setMockSession(null);
  }, []);

  useEffect(() => {
    if (!hydrated || !mockSession || mockSession.paused) return;
    const timer = window.setInterval(() => {
      setMockSession((current) =>
        current
          ? {
              ...current,
              elapsedSeconds: Math.min(
                current.durationSeconds,
                current.elapsedSeconds + 1,
              ),
            }
          : current,
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hydrated, Boolean(mockSession && !mockSession.paused)]);

  useEffect(() => {
    if (
      mockSession &&
      !mockSession.paused &&
      mockSession.elapsedSeconds >= mockSession.durationSeconds
    ) {
      finishMock(mockSession);
    }
  }, [
    finishMock,
    mockSession?.durationSeconds,
    mockSession?.elapsedSeconds,
    mockSession?.paused,
  ]);

  const recordAnswer = useCallback(
    (question: Question, answerIndex: number) => {
      setProgress((current) => {
        const previous = current[question.id] ?? {
          attempts: 0,
          correct: 0,
          lastAnswerIndex: answerIndex,
          updatedAt: 0,
        };
        return {
          ...current,
          [question.id]: {
            attempts: previous.attempts + 1,
            correct:
              previous.correct +
              (answerIndex === question.answerIndex ? 1 : 0),
            lastAnswerIndex: answerIndex,
            updatedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const answerPractice = useCallback(
    (answerIndex: number) => {
      if (!practiceQuestion || practiceAnswered) return;
      setPracticeSelected(answerIndex);
      setPracticeAnswered(true);
      recordAnswer(practiceQuestion, answerIndex);
    },
    [practiceAnswered, practiceQuestion, recordAnswer],
  );

  const answerListening = useCallback(
    (answerIndex: number) => {
      if (!listeningQuestion || listeningAnswered) return;
      setListeningSelected(answerIndex);
      setListeningAnswered(true);
      recordAnswer(listeningQuestion, answerIndex);
    },
    [listeningAnswered, listeningQuestion, recordAnswer],
  );

  const chooseMock = useCallback((answerIndex: number) => {
    setMockSession((current) => {
      if (!current || current.paused) return current;
      const item = current.items[current.index];
      return {
        ...current,
        answers: { ...current.answers, [item.instanceId]: answerIndex },
      };
    });
  }, []);

  const nextMock = useCallback(() => {
    if (!mockSession || mockSelected === null) return;
    if (mockSession.index >= mockSession.items.length - 1) {
      finishMock(mockSession);
      return;
    }
    setMockSession({
      ...mockSession,
      index: mockSession.index + 1,
    });
  }, [finishMock, mockSelected, mockSession]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.matches("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      if (/^[1-4]$/.test(event.key)) {
        const answerIndex = Number(event.key) - 1;
        if (
          settings.activeTab === "parts" &&
          practiceQuestion &&
          answerIndex < practiceQuestion.choices.length
        ) {
          answerPractice(answerIndex);
        }
        if (
          settings.activeTab === "listening" &&
          listeningQuestion &&
          answerIndex < listeningQuestion.choices.length
        ) {
          answerListening(answerIndex);
        }
        if (
          settings.activeTab === "mock" &&
          mockQuestion &&
          answerIndex < mockQuestion.choices.length
        ) {
          chooseMock(answerIndex);
        }
      }
      if (
        event.key === "Enter" &&
        settings.activeTab === "mock" &&
        mockSelected !== null
      ) {
        nextMock();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    answerListening,
    answerPractice,
    chooseMock,
    listeningQuestion,
    mockQuestion,
    mockSelected,
    practiceQuestion,
    nextMock,
    settings.activeTab,
  ]);

  const availablePractice = useMemo(
    () =>
      TOEIC_QUESTIONS.filter(
        (question) =>
          settings.parts.includes(question.part) &&
          (settings.difficulty === "all" ||
            question.difficulty === settings.difficulty),
      ),
    [settings.difficulty, settings.parts],
  );

  const availableListening = useMemo(
    () =>
      TOEIC_QUESTIONS.filter(
        (question) =>
          question.section === "listening" &&
          settings.listeningParts.includes(question.part) &&
          (settings.difficulty === "all" ||
            question.difficulty === settings.difficulty),
      ),
    [settings.difficulty, settings.listeningParts],
  );

  const masteredVocabSet = useMemo(
    () => new Set(masteredVocab),
    [masteredVocab],
  );

  const normalizedVocab = useMemo(
    () =>
      (TOEIC_VOCAB as readonly unknown[]).map((item, index) => {
        const raw = unknownRecord(item);
        const normalized = {
          id: textField(raw, ["id"], `toeic-vocab-${index + 1}`),
          term: textField(raw, ["term", "word", "phrase"], `Word ${index + 1}`),
          pronunciation: textField(raw, ["pronunciation", "phonetic"]),
          meaning: textField(raw, ["meaningJa", "meaning", "definitionJa"]),
          collocation: textField(raw, ["collocation", "phraseJa"]),
          example: textField(raw, ["example", "exampleEn"]),
          exampleJa: textField(raw, ["exampleJa", "translationJa"]),
          topic: textField(raw, ["topic", "category"], "general-business"),
          difficulty: textField(raw, ["difficulty"], "basic"),
          partOfSpeech: textField(raw, ["partOfSpeech"], "phrase"),
        };
        return {
          ...normalized,
          searchText: Object.values(normalized).join(" ").toLowerCase(),
        };
      }),
    [],
  );

  const filteredVocab = useMemo(() => {
    const query = deferredVocabSearch.trim().toLowerCase();
    return normalizedVocab.filter((item) => {
      if (query && !item.searchText.includes(query)) return false;
      if (vocabTopic !== "all" && item.topic !== vocabTopic) return false;
      if (
        vocabDifficulty !== "all" &&
        item.difficulty !== vocabDifficulty
      ) {
        return false;
      }
      if (
        vocabPartOfSpeech !== "all" &&
        item.partOfSpeech !== vocabPartOfSpeech
      ) {
        return false;
      }
      const mastered = masteredVocabSet.has(item.id);
      if (vocabStatus === "mastered" && !mastered) return false;
      if (vocabStatus === "unmastered" && mastered) return false;
      return true;
    });
  }, [
    deferredVocabSearch,
    masteredVocabSet,
    normalizedVocab,
    vocabDifficulty,
    vocabPartOfSpeech,
    vocabStatus,
    vocabTopic,
  ]);

  const visibleVocab = filteredVocab.slice(0, vocabVisibleCount);

  useEffect(() => {
    setVocabVisibleCount(VOCAB_BATCH_SIZE);
  }, [
    deferredVocabSearch,
    vocabDifficulty,
    vocabPartOfSpeech,
    vocabStatus,
    vocabTopic,
  ]);

  const attempts = Object.values(progress).reduce(
    (sum, item) => sum + (Number(item.attempts) || 0),
    0,
  );
  const correctAnswers = Object.values(progress).reduce(
    (sum, item) => sum + (Number(item.correct) || 0),
    0,
  );
  const accuracy = attempts
    ? Math.round((correctAnswers / attempts) * 100)
    : 0;

  const setTab = (activeTab: TabId) =>
    setSettings((current) => ({ ...current, activeTab }));

  const togglePart = (part: Part, listening = false) => {
    const key = listening ? "listeningParts" : "parts";
    setSettings((current) => {
      const selected = current[key];
      const exists = selected.includes(part);
      if (exists && selected.length === 1) return current;
      const next = exists
        ? selected.filter((item) => item !== part)
        : [...selected, part].sort((a, b) => a - b);
      return { ...current, [key]: next };
    });
  };

  const startPractice = () => {
    setPracticeDeck(shuffle(availablePractice));
    setPracticeIndex(0);
    setPracticeSelected(null);
    setPracticeAnswered(false);
  };

  const nextPractice = () => {
    if (!practiceDeck.length) return;
    setPracticeIndex((current) => (current + 1) % practiceDeck.length);
    setPracticeSelected(null);
    setPracticeAnswered(false);
  };

  const startListening = () => {
    setListeningDeck(shuffle(availableListening));
    setListeningIndex(0);
    setListeningSelected(null);
    setListeningAnswered(false);
  };

  const nextListening = () => {
    if (!listeningDeck.length) return;
    setListeningIndex((current) => (current + 1) % listeningDeck.length);
    setListeningSelected(null);
    setListeningAnswered(false);
  };

  const selectMockCount = (count: MockCount) => {
    setMockCount(count);
    if (count === 90) {
      setSettings((current) => ({ ...current, format: "online-msa" }));
    }
    if (count === 200) {
      setSettings((current) => ({ ...current, format: "paper" }));
    }
  };

  const startMock = () => {
    const preset =
      MOCK_PRESETS.find((item) => item.count === mockCount) ??
      MOCK_PRESETS[1];
    const format = preset.fixedFormat ?? settings.format;
    const items = buildMockItems(format, mockCount);
    setMockResult(null);
    setMockSession({
      version: 1,
      count: mockCount,
      format,
      durationSeconds: preset.minutes * 60,
      elapsedSeconds: 0,
      index: 0,
      items,
      answers: {},
      paused: false,
      startedAt: Date.now(),
      savedAt: Date.now(),
    });
  };

  const normalizedPhases = TOEIC_STUDY_PHASES.map((item) => ({
    id: item.id,
    date: `${item.dateStart.replaceAll("-", "/")}〜${item.dateEnd.replaceAll("-", "/")}`,
    title: item.titleJa,
    description: [...item.goalsJa, ...item.weeklyTasksJa].join(" / "),
  }));

  const normalizedResources = TOEIC_OFFICIAL_RESOURCES.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.descriptionJa,
    url: item.url,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>TG</span>
          <span>Test Grid</span>
        </Link>
        <nav className={styles.topLinks} aria-label="関連ページ">
          <Link href="/subjects/subject-2">英語</Link>
          <Link href="/">教科一覧</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>TOEIC IP TEST PREPARATION</p>
            <h1>TOEIC IP 対策</h1>
            <p>
              英語を基礎に、TOEIC Listening & Readingを独立した教科として学習。
              Part別演習、音声・ディクテーション、{TOEIC_VOCAB.length.toLocaleString("ja-JP")}語の大規模単語帳、時間制模試をまとめています。
            </p>
          </div>
          <div className={styles.heroSide}>
            <div className={styles.countdown} aria-live="polite">
              <span>試験日</span>
              <time dateTime="2026-12-25">2026.12.25</time>
              <strong>
                {countdown
                  ? `あと ${countdown.days}日 ${String(
                      countdown.hours,
                    ).padStart(2, "0")}:${String(
                      countdown.minutes,
                    ).padStart(2, "0")}:${String(
                      countdown.seconds,
                    ).padStart(2, "0")}`
                  : "日数を計算中"}
              </strong>
            </div>
            <div className={styles.metric}>
              <span>回答数</span>
              <strong>{attempts}</strong>
            </div>
            <div className={styles.metric}>
              <span>正答率</span>
              <strong>{accuracy}%</strong>
            </div>
          </div>
        </section>

        <div className={styles.alert}>
          <strong>受験方式を必ず確認：</strong>
          団体により「紙・200問」と「オンライン（MSA）・90問」があります。
          画面では両方を選べますが、受験案内の方式・時間が最優先です。
        </div>

        <nav className={styles.tabs} aria-label="TOEIC IP学習メニュー">
          {TABS.map((tab) => (
            <button
              aria-current={settings.activeTab === tab.id ? "page" : undefined}
              className={settings.activeTab === tab.id ? styles.active : ""}
              key={tab.id}
              onClick={() => setTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {settings.activeTab === "overview" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>FORMAT & ROADMAP</p>
                <h2>試験方式と12月25日までの進め方</h2>
              </div>
              <p>
                設定・回答履歴・暗記済み語・模試の中断位置は、この端末の
                localStorage（{STORAGE_PREFIX}*）に保存されます。
              </p>
            </div>

            <div className={styles.modeGrid}>
              {FORMAT_CARDS.map((format) => (
                <button
                  className={cx(
                    styles.modeCard,
                    settings.format === format.id && styles.active,
                  )}
                  key={format.id}
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      format: format.id,
                    }))
                  }
                  type="button"
                >
                  <span>{format.title}</span>
                  <strong>{format.summary}</strong>
                  <small>
                    {format.listening} ／ {format.reading}
                  </small>
                </button>
              ))}
            </div>

            <div className={styles.formatGrid}>
              <article className={styles.planCard}>
                <span className={styles.planDate}>選択中</span>
                <h3>
                  {settings.format === "paper"
                    ? "紙・200問"
                    : "オンライン（MSA）・90問"}
                </h3>
                <table className={styles.partTable}>
                  <thead>
                    <tr>
                      <th>Part</th>
                      <th>問題形式</th>
                      <th>目安問題数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PARTS.map((part) => (
                      <tr key={part}>
                        <td>Part {part}</td>
                        <td>{PART_NAMES[part]}</td>
                        <td>
                          {(settings.format === "paper"
                            ? PAPER_DISTRIBUTION
                            : ONLINE_DISTRIBUTION)[part]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <small>
                  既存データ定義：{TOEIC_FORMATS.length}方式。実施団体の案内を優先してください。
                </small>
              </article>

              <article className={styles.planCard}>
                <span className={styles.planDate}>学習状況</span>
                <h3>端末内の進捗</h3>
                <div className={styles.resultGrid}>
                  <div className={styles.resultCard}>
                    <span>回答</span>
                    <strong>{attempts}</strong>
                  </div>
                  <div className={styles.resultCard}>
                    <span>正解</span>
                    <strong>{correctAnswers}</strong>
                  </div>
                  <div className={styles.resultCard}>
                    <span>正答率</span>
                    <strong>{accuracy}%</strong>
                  </div>
                  <div className={styles.resultCard}>
                    <span>暗記済み</span>
                    <strong>{masteredVocab.length.toLocaleString("ja-JP")}/{TOEIC_VOCAB.length.toLocaleString("ja-JP")}</strong>
                  </div>
                </div>
              </article>
            </div>

            <div className={styles.planGrid}>
              {normalizedPhases.map((phase) => (
                <article className={styles.planCard} key={phase.id}>
                  <span className={styles.planDate}>{phase.date}</span>
                  <h3>{phase.title}</h3>
                  <p>{phase.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {settings.activeTab === "parts" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>PART PRACTICE</p>
                <h2>Part 1〜7 複数選択演習</h2>
              </div>
              <p>複数Partと難度を選び、収録40問からランダム出題します。</p>
            </div>

            <div className={styles.setupPanel}>
              <div className={styles.partButtons}>
                {ALL_PARTS.map((part) => (
                  <button
                    aria-pressed={settings.parts.includes(part)}
                    className={
                      settings.parts.includes(part) ? styles.active : ""
                    }
                    key={part}
                    onClick={() => togglePart(part)}
                    type="button"
                  >
                    Part {part}
                  </button>
                ))}
              </div>
              <div className={styles.filterRow}>
                <label>
                  難度
                  <select
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        difficulty: event.target
                          .value as DifficultyFilter,
                      }))
                    }
                    value={settings.difficulty}
                  >
                    <option value="all">すべて</option>
                    <option value="basic">基礎</option>
                    <option value="standard">標準</option>
                    <option value="advanced">発展</option>
                  </select>
                </label>
                <span>対象 {availablePractice.length}問</span>
              </div>
              <div className={styles.setupActions}>
                <button
                  className={styles.primaryButton}
                  disabled={!availablePractice.length}
                  onClick={startPractice}
                  type="button"
                >
                  条件で再抽選
                </button>
              </div>
            </div>

            {practiceQuestion ? (
              <QuestionView
                answered={practiceAnswered}
                key={`practice-${practiceQuestion.id}`}
                onChoose={answerPractice}
                onNext={nextPractice}
                question={practiceQuestion}
                selected={practiceSelected}
              />
            ) : (
              <p>条件に合う問題がありません。</p>
            )}
          </section>
        ) : null}

        {settings.activeTab === "listening" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>LISTENING LAB</p>
                <h2>音声・Transcript・ディクテーション</h2>
              </div>
              <p>
                Part 1〜4を音声で解き、回答後にTranscriptと根拠を照合します。
              </p>
            </div>

            <div className={styles.setupPanel}>
              <div className={styles.partButtons}>
                {LISTENING_PARTS.map((part) => (
                  <button
                    aria-pressed={settings.listeningParts.includes(part)}
                    className={
                      settings.listeningParts.includes(part)
                        ? styles.active
                        : ""
                    }
                    key={part}
                    onClick={() => togglePart(part, true)}
                    type="button"
                  >
                    Part {part}
                  </button>
                ))}
              </div>
              <div className={styles.setupActions}>
                <span>対象 {availableListening.length}問</span>
                <button
                  className={styles.primaryButton}
                  disabled={!availableListening.length}
                  onClick={startListening}
                  type="button"
                >
                  Listeningを再抽選
                </button>
              </div>
            </div>

            {listeningQuestion ? (
              <QuestionView
                answered={listeningAnswered}
                key={`listening-${listeningQuestion.id}`}
                onChoose={answerListening}
                onNext={nextListening}
                question={listeningQuestion}
                selected={listeningSelected}
              />
            ) : (
              <p>条件に合うListening問題がありません。</p>
            )}
          </section>
        ) : null}

        {settings.activeTab === "vocab" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>VOCABULARY {TOEIC_VOCAB.length.toLocaleString("ja-JP")}</p>
                <h2>TOEIC頻出語・{TOEIC_VOCAB.length.toLocaleString("ja-JP")}語</h2>
              </div>
              <p>
                検索と暗記済みチェックは端末に保存されます（暗記済み{" "}
                {masteredVocab.length.toLocaleString("ja-JP")}/{TOEIC_VOCAB.length.toLocaleString("ja-JP")}）。
              </p>
            </div>

            <div className={styles.vocabToolbar}>
              <label className={styles.searchBox}>
                <span>単語・意味・例文を検索</span>
                <input
                  onChange={(event) => setVocabSearch(event.target.value)}
                  placeholder="例：invoice / 請求書 / meeting"
                  type="search"
                  value={vocabSearch}
                />
              </label>
              <label className={styles.filterBox}>
                <span>カテゴリ</span>
                <select
                  onChange={(event) => setVocabTopic(event.target.value)}
                  value={vocabTopic}
                >
                  <option value="all">すべて</option>
                  {Object.entries(TOPIC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.filterBox}>
                <span>難度</span>
                <select
                  onChange={(event) => setVocabDifficulty(event.target.value)}
                  value={vocabDifficulty}
                >
                  <option value="all">すべて</option>
                  {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.filterBox}>
                <span>品詞</span>
                <select
                  onChange={(event) =>
                    setVocabPartOfSpeech(event.target.value)
                  }
                  value={vocabPartOfSpeech}
                >
                  <option value="all">すべて</option>
                  {Object.entries(POS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.filterBox}>
                <span>暗記状態</span>
                <select
                  onChange={(event) =>
                    setVocabStatus(event.target.value as VocabStatusFilter)
                  }
                  value={vocabStatus}
                >
                  <option value="all">すべて</option>
                  <option value="unmastered">未暗記</option>
                  <option value="mastered">暗記済み</option>
                </select>
              </label>
            </div>

            <div className={styles.vocabStats} aria-live="polite">
              <strong>
                表示 {visibleVocab.length.toLocaleString("ja-JP")} / 絞込{" "}
                {filteredVocab.length.toLocaleString("ja-JP")} / 全体{" "}
                {TOEIC_VOCAB.length.toLocaleString("ja-JP")}
              </strong>
              <span>
                暗記済み {masteredVocab.length.toLocaleString("ja-JP")}語
              </span>
            </div>

            {filteredVocab.length ? (
              <div className={styles.vocabGrid}>
                {visibleVocab.map((item) => {
                  const mastered = masteredVocabSet.has(item.id);
                  return (
                    <article
                      className={cx(
                        styles.vocabCard,
                        mastered && styles.mastered,
                      )}
                      key={item.id}
                    >
                      <div className={styles.vocabMeta}>
                        <span className={styles.vocabTag}>
                          {TOPIC_LABELS[item.topic] ?? item.topic}
                        </span>
                        <span className={styles.vocabTag}>
                          {POS_LABELS[item.partOfSpeech] ?? item.partOfSpeech}
                        </span>
                        <span className={styles.vocabTag}>
                          {DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
                        </span>
                      </div>
                      <h3>{item.term}</h3>
                      {item.pronunciation ? (
                        <small>{item.pronunciation}</small>
                      ) : null}
                      <p>
                        <strong>{item.meaning}</strong>
                      </p>
                      {item.collocation ? <p>{item.collocation}</p> : null}
                      {item.example ? <p lang="en">{item.example}</p> : null}
                      {item.exampleJa ? <small>{item.exampleJa}</small> : null}
                      <button
                        aria-pressed={mastered}
                        className={styles.secondaryButton}
                        onClick={() =>
                          setMasteredVocab((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id],
                          )
                        }
                        type="button"
                      >
                        {mastered ? "✓ 暗記済み" : "暗記済みにする"}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyState}>
                条件に合う単語がありません。検索語や絞り込みを変更してください。
              </p>
            )}

            {visibleVocab.length < filteredVocab.length ? (
              <div className={styles.loadMoreRow}>
                <button
                  className={styles.primaryButton}
                  onClick={() =>
                    setVocabVisibleCount((current) =>
                      Math.min(
                        current + VOCAB_BATCH_SIZE,
                        filteredVocab.length,
                      ),
                    )
                  }
                  type="button"
                >
                  次の{Math.min(
                    VOCAB_BATCH_SIZE,
                    filteredVocab.length - visibleVocab.length,
                  )}語を表示
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {settings.activeTab === "mock" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>TIMED MOCK TEST</p>
                <h2>20・40・90・200問 時間制模試</h2>
              </div>
              <p>
                模試は自動保存され、ページを閉じても中断位置から再開できます。
              </p>
            </div>

            {!mockSession ? (
              <div className={styles.mockSetup}>
                <div className={styles.alert}>
                  <strong>模試の出題について：</strong>
                  収録40問を公式Part配分に合わせて再抽選します。公式問題の複製ではなく、
                  90問・200問では同じ練習設問が再登場する場合があります。
                </div>
                <div className={styles.modeGrid}>
                  {MOCK_PRESETS.map((preset) => (
                    <button
                      className={cx(
                        styles.modeCard,
                        mockCount === preset.count && styles.active,
                      )}
                      key={preset.count}
                      onClick={() => selectMockCount(preset.count)}
                      type="button"
                    >
                      <span>{preset.count}問</span>
                      <strong>{preset.label}</strong>
                      <small>
                        {preset.fixedFormat === "paper"
                          ? "紙形式"
                          : preset.fixedFormat === "online-msa"
                            ? "オンライン形式"
                            : "選択中の方式で比例配分"}
                      </small>
                    </button>
                  ))}
                </div>
                <div className={styles.setupActions}>
                  <span>
                    使用方式：{" "}
                    {mockCount === 200
                      ? "紙・200問"
                      : mockCount === 90
                        ? "オンライン（MSA）・90問"
                        : settings.format === "paper"
                          ? "紙のPart配分"
                          : "オンラインのPart配分"}
                  </span>
                  <button
                    className={styles.primaryButton}
                    onClick={startMock}
                    type="button"
                  >
                    模試を開始
                  </button>
                </div>

                {mockResult ? (
                  <>
                    <div className={styles.resultGrid}>
                      <div className={styles.resultCard}>
                        <span>得点</span>
                        <strong>
                          {mockResult.correct}/{mockResult.count}
                        </strong>
                      </div>
                      <div className={styles.resultCard}>
                        <span>正答率</span>
                        <strong>
                          {Math.round(
                            (mockResult.correct / mockResult.count) * 100,
                          )}
                          %
                        </strong>
                      </div>
                      <div className={styles.resultCard}>
                        <span>未回答</span>
                        <strong>{mockResult.unanswered}</strong>
                      </div>
                    </div>
                    <div className={styles.abilityGrid}>
                      {Object.entries(mockResult.partBreakdown).map(
                        ([label, value]) => (
                          <article className={styles.abilityCard} key={label}>
                            <span>{label}</span>
                            <strong>
                              {value.correct}/{value.total}
                            </strong>
                          </article>
                        ),
                      )}
                      {Object.entries(mockResult.abilityBreakdown).map(
                        ([label, value]) => (
                          <article className={styles.abilityCard} key={label}>
                            <span>{label}</span>
                            <strong>
                              {value.correct}/{value.total}
                            </strong>
                          </article>
                        ),
                      )}
                    </div>
                    <div className={styles.vocabGrid} aria-label="模試の全問振り返り">
                      {mockResult.review.map((item, index) => {
                        const question = QUESTION_BY_ID.get(item.questionId);
                        if (!question) return null;
                        return (
                          <details className={styles.vocabCard} key={item.instanceId}>
                            <summary>
                              Q{index + 1} / Part {question.part} / {item.correct ? "○ 正解" : "× 要復習"}
                            </summary>
                            <p><strong>問題：</strong>{question.prompt}</p>
                            {question.passage ? <div className={styles.stimulus}><p>{question.passage}</p></div> : null}
                            {question.script ? <div className={styles.transcript}><strong>Transcript</strong><p>{question.script}</p></div> : null}
                            <p><strong>あなたの回答：</strong>{item.selected === null ? "未回答" : `${item.selected + 1}：${question.choices[item.selected] ?? ""}`}</p>
                            <p><strong>正解：</strong>{question.answerIndex + 1}：{question.choices[question.answerIndex]}</p>
                            <p><strong>根拠：</strong>{question.evidence}</p>
                            <p><strong>解説：</strong>{question.explanationJa}</p>
                          </details>
                        );
                      })}                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <>
                <div className={styles.mockBanner}>
                  <strong>
                    {mockSession.index + 1}/{mockSession.items.length}
                  </strong>
                  <span>
                    残り{" "}
                    {clock(
                      mockSession.durationSeconds -
                        mockSession.elapsedSeconds,
                    )}
                  </span>
                  <span>
                    回答済み {Object.keys(mockSession.answers).length}問
                  </span>
                  <button
                    className={styles.secondaryButton}
                    onClick={() =>
                      setMockSession((current) =>
                        current
                          ? { ...current, paused: !current.paused }
                          : current,
                      )
                    }
                    type="button"
                  >
                    {mockSession.paused ? "再開" : "中断して保存"}
                  </button>
                </div>
                <progress
                  className={styles.progressBar}
                  max={mockSession.items.length}
                  value={mockSession.index + 1}
                />
                {mockSession.paused ? (
                  <div className={styles.alert}>
                    模試を中断保存しました。「再開」を押すまでタイマーは進みません。
                  </div>
                ) : mockQuestion ? (
                  <QuestionView
                    answered={false}
                    key={mockItem?.instanceId}
                    nextLabel={
                      mockSession.index === mockSession.items.length - 1
                        ? "採点して終了"
                        : "次の問題"
                    }
                    onChoose={chooseMock}
                    onNext={nextMock}
                    question={mockQuestion}
                    selected={mockSelected}
                    testMode
                  />
                ) : null}
              </>
            )}
          </section>
        ) : null}

        {settings.activeTab === "resources" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>OFFICIAL SOURCES</p>
                <h2>公式サンプル・教材</h2>
              </div>
              <p>形式や最新情報はIIBC・ETSの一次情報で最終確認してください。</p>
            </div>

            <div className={styles.resourceGrid}>
              {[...FEATURED_RESOURCES, ...normalizedResources].map(
                (resource) => (
                  <a
                    className={styles.resourceCard}
                    href={resource.url}
                    key={resource.id}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <span>公式資料</span>
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <strong>公式サイトを開く ↗</strong>
                  </a>
                ),
              )}
            </div>

            <div className={styles.copyrightNote}>
              <h3>過去問・著作権について</h3>
              <p>
                TOEICの実際の過去問や公式教材本文・音声は転載していません。
                このページの40問と{TOEIC_VOCAB.length.toLocaleString("ja-JP")}語の語彙データは、公開されている公式の出題形式と能力領域を参考に作成した独自練習素材です。
                本番相当の問題は、上記の公式サンプルと「公式問題集12」を利用してください。
              </p>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
