import type { EnglishQuestion, EnglishVocabCard } from "./english-data";
import { ENGLISH_EXTRA_EXPLANATIONS } from "./english-explanations-extra";
import { ENGLISH_LANGUAGE_EXPLANATIONS } from "./english-explanations-language";
import {
  ENGLISH_READING_EXPLANATIONS,
  type EnglishReadingExplanation,
} from "./english-explanations-reading";

type ExplanationPanelProps = {
  question: EnglishQuestion;
  compact?: boolean;
};

type ExplanationSection = {
  title: string;
  body: string;
};

function splitExplanation(text: string): ExplanationSection[] {
  const markedSections = Array.from(
    text.trim().matchAll(/(?:^|\n+)【([^】]+)】\s*([\s\S]*?)(?=(?:\n+【[^】]+】)|$)/g),
    (match) => ({ title: match[1], body: match[2].trim() }),
  ).filter((section) => section.body.length > 0);

  if (markedSections.length > 0) return markedSections;

  return text
    .split(/\n{2,}/)
    .map((paragraph, index) => {
      const normalized = paragraph.trim();
      const heading = normalized.match(/^【([^】]+)】\s*/);
      return {
        title: heading?.[1] ?? (index === 0 ? "答えの理由" : "補足"),
        body: normalized.replace(/^【[^】]+】\s*/, ""),
      };
    })
    .filter((section) => section.body.length > 0);
}

function fallbackExplanation(question: EnglishQuestion) {
  if (question.explanation) {
    return `【正解の理由】${question.explanation}\n\n【確認ポイント】正解「${question.answer}」を問題文へ戻し、文法と意味の両方が自然になることを確認します。`;
  }
  if (question.format === "order") {
    return `【文の骨格】完成文は「${question.answer}」です。主語、時制を持つ動詞、目的語・補語、修飾語の順に骨格を作ります。\n\n【並びの理由】語句を一語ずつではなく、前置詞句・不定詞・受動態などのまとまりで置くとこの語順になります。`;
  }
  if (question.format === "translation") {
    return `【模範訳】${question.answer}\n\n【読み方】主語と述語を先に確定し、その後で関係詞・分詞・前置詞句がどの語を説明するかを結びます。語順が異なっても、情報関係が保たれた自然な日本語なら正解です。`;
  }
  return `【正解の理由】空欄または問いに「${question.answer}」を入れると、文法と文脈がともに成立します。\n\n【確認ポイント】前後の語との結び付き、品詞、時制・単複、本文の該当箇所を順に照合します。`;
}

export function hasDetailedEnglishExplanation(question: EnglishQuestion) {
  return Boolean(
    ENGLISH_READING_EXPLANATIONS[question.id]
    || ENGLISH_LANGUAGE_EXPLANATIONS[question.id]
    || ENGLISH_EXTRA_EXPLANATIONS[question.id],
  );
}

function TextExplanation({ text }: { text: string }) {
  return (
    <div className="english-explanation-sections">
      {splitExplanation(text).map((section, index) => (
        <section key={`${section.title}-${index}`}>
          <h4>{section.title}</h4>
          <p>{section.body}</p>
        </section>
      ))}
    </div>
  );
}

function ReadingExplanation({ detail }: { detail: EnglishReadingExplanation }) {
  const paragraphLabel = detail.reference.paragraphNumbers.length
    ? `第${detail.reference.paragraphNumbers.join("・")}段落`
    : detail.reference.label;

  return (
    <>
      <div className="english-explanation-sections">
        <section>
          <h4>正解の理由</h4>
          <p>{detail.correctReason}</p>
        </section>
      </div>

      <section className="english-evidence-card">
        <header><span>TEXT EVIDENCE</span><strong>{detail.reference.label || paragraphLabel}</strong></header>
        {detail.reference.english && <blockquote lang="en">{detail.reference.english}</blockquote>}
        <div><span>参照</span><p>{paragraphLabel}</p></div>
        <div><span>和訳</span><p>{detail.naturalTranslation}</p></div>
      </section>

      {detail.optionAnalysis && detail.optionAnalysis.length > 0 && (
        <section className="english-option-analysis">
          <header><span>ALL OPTIONS</span><strong>選択肢ごとの判定</strong></header>
          <div>
            {detail.optionAnalysis.map((item, index) => (
              <article className={item.isCorrect ? "is-correct" : "is-wrong"} key={`${detail.questionId}-${index}`}>
                <span>{item.isCorrect ? "○ 正解" : "× 不正解"}</span>
                <h4>{item.option}</h4>
                <p>{item.reason}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {detail.readingTip && (
        <aside className="english-reading-tip">
          <span>READING TIP</span>
          <p>{detail.readingTip}</p>
        </aside>
      )}
    </>
  );
}

export function EnglishQuestionExplanation({ question, compact = false }: ExplanationPanelProps) {
  const reading = ENGLISH_READING_EXPLANATIONS[question.id];
  const text = ENGLISH_LANGUAGE_EXPLANATIONS[question.id]
    ?? ENGLISH_EXTRA_EXPLANATIONS[question.id]
    ?? fallbackExplanation(question);

  return (
    <section className={`english-deep-explanation${compact ? " is-compact" : ""}`} aria-label="詳しい解説">
      <header className="english-deep-explanation-heading">
        <span>WHY THIS ANSWER</span>
        <h3>根拠から納得する解説</h3>
      </header>
      {reading ? <ReadingExplanation detail={reading} /> : <TextExplanation text={text} />}
    </section>
  );
}

export function EnglishVocabInsight({ card }: { card: EnglishVocabCard }) {
  const explanation = ENGLISH_LANGUAGE_EXPLANATIONS[`question-${card.id}`]
    ?? `【意味】${card.en} は「${card.ja}」を表します。\n\n【覚え方】単語だけでなく、品詞・活用と本文中のまとまりを一緒に確認します。`;

  return (
    <aside className="english-vocab-insight" aria-label={`${card.en}の意味・活用・語源`}>
      <header><span>WORD DEEP DIVE</span><strong>{card.en}</strong></header>
      <TextExplanation text={explanation} />
    </aside>
  );
}
