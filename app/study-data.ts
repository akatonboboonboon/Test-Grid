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

export const DEFAULT_SUBJECTS: StudySubject[] = Array.from({ length: 9 }, (_, index) => {
  const order = index + 1;
  const isNetwork = order === 1;
  return {
    id: (isNetwork ? "network" : `subject-${order}`) as SubjectId,
    name: isNetwork ? "ネットワーク" : `科目 ${order}`,
    order,
    accent: SUBJECT_ACCENTS[index],
    module: isNetwork ? "network" : "generic",
    configured: isNetwork,
    testDate: "",
    memo: isNetwork ? "Pで終わる用語とOSI層を仕上げる" : "",
  };
});

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
    const name = typeof saved.name === "string" && saved.name.trim()
      ? saved.name.trim().slice(0, 32)
      : fallback.name;
    const accent = typeof saved.accent === "string" && SUBJECT_ACCENTS.includes(saved.accent as typeof SUBJECT_ACCENTS[number])
      ? saved.accent
      : fallback.accent;
    return {
      ...fallback,
      name,
      accent,
      configured: fallback.module === "network" || saved.configured === true,
      testDate: typeof saved.testDate === "string" ? saved.testDate.slice(0, 10) : "",
      memo: typeof saved.memo === "string" ? saved.memo.trim().slice(0, 120) : "",
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
