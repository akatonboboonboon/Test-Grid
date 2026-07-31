"use client";

import {
  clampPartialCredit,
  pastPaperPartialCreditBands,
  type PartialCreditProfile,
  type PartialCreditQuestion,
} from "./past-paper-partial-credit";
import styles from "./past-paper-point-selector.module.css";

export default function PastPaperPointSelector({
  question,
  profile,
  value,
  onChange,
}: {
  question: PartialCreditQuestion;
  profile: PartialCreditProfile;
  value: number;
  onChange: (points: number) => void;
}) {
  const bands = pastPaperPartialCreditBands(question, profile);
  const clamped = clampPartialCredit(question.points, value);
  return (
    <fieldset className={styles.grader}>
      <legend>過去問基準で途中点をつける</legend>
      <p className={styles.intro}>最終答だけでなく、答案に実際に残した式・語句・表・途中値を基準に選びます。</p>
      <div className={styles.bands}>
        {bands.map((band) => (
          <button
            key={band.points}
            type="button"
            aria-pressed={clamped === band.points}
            onClick={() => onChange(band.points)}
          >
            <strong>{band.points} / {question.points}点 · {band.label}</strong>
            <small>{band.description}</small>
          </button>
        ))}
      </div>
      <label className={styles.manual}>
        <span>採点者が指定した得点</span>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={question.points}
          value={clamped}
          onChange={(event) => onChange(clampPartialCredit(question.points, event.target.value))}
        />
        <b>/ {question.points}点</b>
      </label>
    </fieldset>
  );
}
