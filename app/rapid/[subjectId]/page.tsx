"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RapidAnswerDrill from "../../rapid-answer-drill";
import { isSubjectId } from "../../study-data";

export default function RapidSubjectPage() {
  const params = useParams<{ subjectId: string }>();
  const rawSubjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;

  if (!isSubjectId(rawSubjectId)) {
    return (
      <main className="subject-invalid">
        <span>SUBJECT NOT FOUND</span>
        <h1>この科目の即答問題は見つかりません。</h1>
        <Link href="/">9教科の一覧へ戻る</Link>
      </main>
    );
  }

  return <RapidAnswerDrill subjectId={rawSubjectId} />;
}
