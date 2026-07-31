import type { StudySubject, SubjectId } from "./study-data";

export const ACADEMIC_YEARS = [1, 2, 3, 4, 5] as const;

export const EXAM_PERIODS = [
  { id: "first-midterm", label: "前期中間" },
  { id: "first-final", label: "前期末" },
  { id: "second-midterm", label: "後期中間" },
  { id: "second-final", label: "後期末" },
  { id: "other", label: "その他（資格・TOEICなど）" },
] as const;

export type AcademicYear = (typeof ACADEMIC_YEARS)[number];
export type ExamPeriod = (typeof EXAM_PERIODS)[number]["id"];

export type AcademicPlacement = {
  year: AcademicYear;
  period: ExamPeriod;
};

export const DEFAULT_ACADEMIC_VIEW = {
  year: 4,
  period: "first-final",
} as const satisfies AcademicPlacement;

const FOURTH_YEAR_FIRST_FINAL = {
  year: 4,
  period: "first-final",
} as const satisfies AcademicPlacement;

export const SUBJECT_ACADEMIC_PLACEMENT = {
  "subject-2": FOURTH_YEAR_FIRST_FINAL,
  network: FOURTH_YEAR_FIRST_FINAL,
  "subject-3": FOURTH_YEAR_FIRST_FINAL,
  "subject-4": FOURTH_YEAR_FIRST_FINAL,
  "subject-5": FOURTH_YEAR_FIRST_FINAL,
  "subject-6": FOURTH_YEAR_FIRST_FINAL,
  "subject-7": FOURTH_YEAR_FIRST_FINAL,
  "subject-8": FOURTH_YEAR_FIRST_FINAL,
  "subject-9": FOURTH_YEAR_FIRST_FINAL,
} as const satisfies Record<SubjectId, AcademicPlacement>;

export type LegacyAcademicCatalogEntry = {
  kind: "legacy-subject";
  id: SubjectId;
  name: string;
  href: string;
  placement: AcademicPlacement;
  subject: StudySubject;
};

export type StandaloneAcademicCatalogEntry = {
  kind: "standalone";
  id: "toeic-lr-ip";
  name: string;
  href: string;
  placement: AcademicPlacement;
  examDate: string;
};

export type AcademicCatalogEntry =
  | LegacyAcademicCatalogEntry
  | StandaloneAcademicCatalogEntry;

export const TOEIC_ACADEMIC_ENTRY: StandaloneAcademicCatalogEntry = {
  kind: "standalone",
  id: "toeic-lr-ip",
  name: "TOEIC IP対策",
  href: "/subjects/toeic-ip",
  placement: { year: 4, period: "other" },
  examDate: "2026-12-25",
};

export function academicPeriodLabel(period: ExamPeriod) {
  return EXAM_PERIODS.find((candidate) => candidate.id === period)?.label ?? period;
}

export function buildAcademicCatalog(subjects: StudySubject[]): AcademicCatalogEntry[] {
  return [
    ...subjects.map((subject): LegacyAcademicCatalogEntry => ({
      kind: "legacy-subject",
      id: subject.id,
      name: subject.name,
      href: subject.id === "network" ? "/subjects/network" : `/subjects/${subject.id}`,
      placement: SUBJECT_ACADEMIC_PLACEMENT[subject.id],
      subject,
    })),
    TOEIC_ACADEMIC_ENTRY,
  ];
}

export function matchesAcademicPlacement(
  entry: AcademicCatalogEntry,
  year: AcademicYear,
  period: ExamPeriod,
) {
  return entry.placement.year === year && entry.placement.period === period;
}
