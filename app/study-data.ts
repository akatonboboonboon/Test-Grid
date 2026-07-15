import { storageRead, storageWrite } from "./protocols";

export type SubjectId =
  | "network"
  | "subject-2"
  | "subject-3"
  | "subject-4"
  | "subject-5"
  | "subject-6"
  | "subject-7"
  | "subject-8"
  | "subject-9";

export type StudySubject = {
  id: SubjectId;
  name: string;
  order: number;
  accent: string;
  module: "network" | "generic";
  configured: boolean;
  testDate: string;
  memo: string;
};

export type StudyCard = {
  id: string;
  subjectId: SubjectId;
  prompt: string;
  answer: string;
  enabled: boolean;
};

export type StudyProgress = Record<string, "learning" | "mastered">;

export const SUBJECTS_STORAGE_KEY = "test-grid-subjects-v1";
export const SUBJECT_ACCENTS = [
  "#c7ff5e",
  "#55dde0",
  "#ff5c35",
  "#a88bff",
  "#ffd65c",
  "#ff8fc7",
  "#66e39e",
  "#7aa7ff",
  "#ff9f68",
] as const;

const SUBJECT_BLUEPRINTS: Array<Pick<StudySubject, "id" | "name" | "module" | "memo">> = [
  { id: "subject-2", name: "英語", module: "generic", memo: "ZIP教材のCh.15・16・18・19を収録・過去問は形式だけ反映" },
  { id: "network", name: "ネットワーク", module: "network", memo: "①〜⑦の全用語とOSI層を仕上げる" },
  { id: "subject-3", name: "機械力学", module: "generic", memo: "教材写真を追加すると暗記カード化できます" },
  { id: "subject-4", name: "熱・流体力学", module: "generic", memo: "教材写真の追加待ち" },
  { id: "subject-5", name: "材料力学", module: "generic", memo: "教材写真を追加すると暗記カード化できます" },
  { id: "subject-6", name: "スマート制御", module: "generic", memo: "現在資料なし" },
  { id: "subject-7", name: "確率統計", module: "generic", memo: "ZIP＋演習PDF4冊の範囲・50分想定試験12回を収録" },
  { id: "subject-8", name: "応用数学", module: "generic", memo: "教材写真の追加待ち" },
  { id: "subject-9", name: "デジタル回路", module: "generic", memo: "教材写真の追加待ち" },
];

export const DEFAULT_SUBJECTS: StudySubject[] = SUBJECT_BLUEPRINTS.map((subject, index) => ({
  ...subject,
  order: index + 1,
  accent: SUBJECT_ACCENTS[index],
  configured: true,
  testDate: "",
}));

const SUBJECT_IDS = new Set(DEFAULT_SUBJECTS.map((subject) => subject.id));

export function isSubjectId(value: unknown): value is SubjectId {
  return typeof value === "string" && SUBJECT_IDS.has(value as SubjectId);
}

export function normalizeSubjects(value: unknown): StudySubject[] {
  if (!Array.isArray(value)) return DEFAULT_SUBJECTS;
  const savedById = new Map(
    value.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const candidate = item as Partial<StudySubject>;
      return isSubjectId(candidate.id) ? [[candidate.id, candidate] as const] : [];
    }),
  );

  return DEFAULT_SUBJECTS.map((fallback) => {
    const saved = savedById.get(fallback.id);
    if (!saved) return fallback;
    const savedName = typeof saved.name === "string" ? saved.name.trim() : "";
    const wasPlaceholder = /^科目\s*[2-9]$/.test(savedName);
    const name = savedName && !wasPlaceholder ? savedName.slice(0, 32) : fallback.name;
    const accent = typeof saved.accent === "string" && SUBJECT_ACCENTS.includes(saved.accent as typeof SUBJECT_ACCENTS[number])
      ? saved.accent
      : fallback.accent;
    const savedMemo = typeof saved.memo === "string" ? saved.memo.trim() : "";
    const wasOldStatisticsPlaceholder = fallback.id === "subject-7" && savedMemo === "教材写真の追加待ち";
    const wasOldEnglishDescription = fallback.id === "subject-2" && savedMemo === "試験PDF形式＋Ch.15・16・18・19を収録";
    return {
      ...fallback,
      name,
      accent,
      configured: fallback.configured || saved.configured === true,
      testDate: typeof saved.testDate === "string" ? saved.testDate.slice(0, 10) : "",
      memo: savedMemo && !wasOldStatisticsPlaceholder && !wasOldEnglishDescription
        ? savedMemo.slice(0, 120)
        : fallback.memo,
    };
  });
}

export function loadSubjects() {
  return normalizeSubjects(storageRead<unknown>(SUBJECTS_STORAGE_KEY, DEFAULT_SUBJECTS));
}

export function saveSubjects(subjects: StudySubject[]) {
  storageWrite(SUBJECTS_STORAGE_KEY, subjects);
}

export function cardsStorageKey(subjectId: SubjectId) {
  return `test-grid:${subjectId}:cards:v1`;
}

export function progressStorageKey(subjectId: SubjectId) {
  return `test-grid:${subjectId}:progress:v1`;
}

export function normalizeStudyCards(value: unknown, subjectId: SubjectId): StudyCard[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<StudyCard>;
    if (typeof candidate.id !== "string" || typeof candidate.prompt !== "string" || typeof candidate.answer !== "string") return [];
    const prompt = candidate.prompt.trim();
    const answer = candidate.answer.trim();
    if (!prompt || !answer) return [];
    return [{
      id: candidate.id,
      subjectId,
      prompt,
      answer,
      enabled: candidate.enabled !== false,
    } satisfies StudyCard];
  });
}

export function normalizeStudyProgress(value: unknown, cards: StudyCard[]): StudyProgress {
  if (!value || typeof value !== "object") return {};
  const saved = value as Record<string, unknown>;
  return Object.fromEntries(cards.flatMap((card) => (
    saved[card.id] === "learning" || saved[card.id] === "mastered"
      ? [[card.id, saved[card.id] as "learning" | "mastered"]]
      : []
  )));
}
