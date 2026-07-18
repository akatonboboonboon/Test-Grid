import type { Metadata } from "next";
import GeneratedPracticeClient from "../generated-practice-client";
import {
  GENERATED_PRACTICE_SUBJECTS,
  type GeneratedPracticeSubjectId,
} from "../generated-practice-engine";

export const metadata: Metadata = {
  title: "自動生成問題 — TEST//GRID",
  description: "英語・機械力学・熱流体・材料力学・スマート制御・確率統計・応用数学・デジタル回路の範囲内問題を、解答・解説・必要な図付きで生成します。",
};

const SUBJECT_IDS = new Set<GeneratedPracticeSubjectId>(
  GENERATED_PRACTICE_SUBJECTS.map((subject) => subject.id),
);

export default async function GeneratedPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedSubject = Array.isArray(params.subject) ? params.subject[0] : params.subject;
  const initialSubject = SUBJECT_IDS.has(requestedSubject as GeneratedPracticeSubjectId)
    ? requestedSubject as GeneratedPracticeSubjectId
    : "subject-2";

  return <GeneratedPracticeClient initialSubject={initialSubject} />;
}
