"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  GENERATED_PRACTICE_SUBJECTS,
  GENERATED_PRACTICE_TEMPLATE_METADATA,
  generatePracticeQuestion,
  gradeGeneratedPracticeAnswer,
  type GeneratedPracticeGrade,
  type GeneratedPracticeQuestion,
  type GeneratedPracticeSubjectId,
} from "./generated-practice-engine";
import { DisplayMath, RichMathText } from "./statistics-math";

type Props = {
  initialSubject: GeneratedPracticeSubjectId;
};

const SUBJECT_ACCENTS: Record<GeneratedPracticeSubjectId, string> = {
  "subject-2": "#19c7b4",
  "subject-3": "#ff5c35",
  "subject-4": "#1687ff",
  "subject-6": "#a05cff",
  "subject-7": "#f04f8a",
  "subject-8": "#ef9a20",
};

const FORMAT_LABELS: Record<GeneratedPracticeQuestion["format"], string> = {
  number: "計算・数値入力",
  choice: "選択問題",
  order: "本文一文の並び替え",
  translation: "本文抜粋の和訳",
};

function initialQuestion(subjectId: GeneratedPracticeSubjectId) {
  return generatePracticeQuestion(subjectId, "ui-initial:" + subjectId);
}

function sourceLocation(question: GeneratedPracticeQuestion) {
  const parts: string[] = [];
  if (question.source.chapter) parts.push(question.source.chapter.toUpperCase());
  if (typeof question.source.paragraphIndex === "number") {
    parts.push("第" + (question.source.paragraphIndex + 1) + "段落");
  }
  if (typeof question.source.sentenceIndex === "number") {
    parts.push("第" + (question.source.sentenceIndex + 1) + "文");
  }
  if (question.source.pages?.length) {
    parts.push("p." + question.source.pages.join("・"));
  }
  return parts.join(" / ");
}

export default function GeneratedPracticeClient({ initialSubject }: Props) {
  const [subjectId, setSubjectId] = useState<GeneratedPracticeSubjectId>(initialSubject);
  const [templateId, setTemplateId] = useState("");
  const [question, setQuestion] = useState<GeneratedPracticeQuestion>(() => initialQuestion(initialSubject));
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [selectedTokenIndexes, setSelectedTokenIndexes] = useState<number[]>([]);
  const [grade, setGrade] = useState<GeneratedPracticeGrade | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [announcement, setAnnouncement] = useState("解答はまだ表示していません。");
  const generationCounter = useRef(0);

  const subject = GENERATED_PRACTICE_SUBJECTS.find((item) => item.id === subjectId)
    ?? GENERATED_PRACTICE_SUBJECTS[0];
  const templates = useMemo(
    () => GENERATED_PRACTICE_TEMPLATE_METADATA.filter((item) => item.subjectId === subjectId),
    [subjectId],
  );
  const orderedResponse = selectedTokenIndexes
    .map((index) => question.tokens?.[index] ?? "")
    .filter(Boolean)
    .join(" ");
  const response = question.format === "choice"
    ? selectedChoice
    : question.format === "order"
      ? orderedResponse
      : typedAnswer;
  const location = sourceLocation(question);
  const pageStyle = {
    "--practice-accent": SUBJECT_ACCENTS[subjectId],
  } as CSSProperties;

  function resetResponse() {
    setTypedAnswer("");
    setSelectedChoice("");
    setSelectedTokenIndexes([]);
    setGrade(null);
    setRevealed(false);
    setGenerationError("");
  }

  function createQuestion(nextSubject = subjectId, nextTemplate = templateId) {
    generationCounter.current += 1;
    const seed = [
      "ui",
      nextSubject,
      nextTemplate || "random",
      question.seed,
      String(generationCounter.current),
    ].join(":");
    try {
      const generated = generatePracticeQuestion(
        nextSubject,
        seed,
        nextTemplate ? { templateId: nextTemplate } : {},
      );
      setQuestion(generated);
      resetResponse();
      setAnnouncement(generated.subjectName + "の「" + generated.title + "」を生成しました。解答はまだ表示していません。");
    } catch {
      setGenerationError("安全な解答付き問題を作れませんでした。もう一度「今すぐ1問作る」を押してください。");
      setAnnouncement("問題を生成できませんでした。");
    }
  }

  function changeSubject(nextSubject: GeneratedPracticeSubjectId) {
    if (nextSubject === subjectId) return;
    setSubjectId(nextSubject);
    setTemplateId("");
    createQuestion(nextSubject, "");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("subject", nextSubject);
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }

  function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (!response.trim()) {
      setAnnouncement("解答を入力してから採点してください。");
      return;
    }
    const result = gradeGeneratedPracticeAnswer(question, response);
    setGrade(result);
    setRevealed(true);
    setAnnouncement(result.correct
      ? "正解です。模範解答と解説を表示しました。"
      : "不正解です。模範解答と解説を表示しました。");
  }

  function revealAnswer() {
    setGrade(null);
    setRevealed(true);
    setAnnouncement("模範解答と解説を表示しました。");
  }

  function addToken(index: number) {
    if (selectedTokenIndexes.includes(index)) return;
    setSelectedTokenIndexes((current) => [...current, index]);
  }

  function removeOrderedToken(position: number) {
    setSelectedTokenIndexes((current) => current.filter((_, index) => index !== position));
  }

  return (
    <div className="app-frame generated-practice-page" style={pageStyle}>
      <header className="topbar generated-practice-topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">G/1</span>
          <span><strong>TEST//GRID</strong><small>ON-DEMAND PRACTICE</small></span>
        </Link>
        <div className="header-actions">
          <span className="generated-practice-header-label">解答付きのみ生成</span>
          <Link className="outline-button header-link" href={"/subjects/" + subjectId}>この教科へ戻る</Link>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="generated-practice-main">
        <nav className="subject-breadcrumb generated-practice-breadcrumb" aria-label="現在位置">
          <Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">自動生成問題</strong>
        </nav>

        <section className="generated-practice-hero" aria-labelledby="generated-practice-title">
          <div>
            <p><span>ON-DEMAND / ONE QUESTION</span><span>SOURCE-RANGE GUARDED</span></p>
            <h1 id="generated-practice-title">自動生成問題</h1>
            <p>数値や出題箇所を変えた新しい1問を、その場で作ります。問題・正答・途中式・理由を同じ条件から組み立て、解答のない問題は表示しません。</p>
          </div>
          <aside>
            <span>SEPARATE WORKSPACE</span>
            <strong>プリント問題とは別</strong>
            <p>ここで作る問題は教材範囲に基づく追加演習です。先生のプリント・過去問は各教科ページにそのまま分けてあります。</p>
          </aside>
        </section>

        <section className="generated-practice-subjects" aria-labelledby="generated-subject-title">
          <div className="generated-practice-section-head">
            <div><span>01 / SUBJECT</span><h2 id="generated-subject-title">教科を選ぶ</h2></div>
            <p>生成対象は教材を読み込み済みの6教科だけです。</p>
          </div>
          <div className="generated-practice-subject-tabs" role="tablist" aria-label="自動生成する教科">
            {GENERATED_PRACTICE_SUBJECTS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={subjectId === item.id}
                onClick={() => changeSubject(item.id)}
              >
                <span>{item.id.replace("subject-", "S")}</span>
                <strong>{item.shortName}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="generated-practice-builder" aria-labelledby="generated-builder-title">
          <div className="generated-practice-builder-copy">
            <span>02 / GENERATOR</span>
            <h2 id="generated-builder-title">{subject.name}の1問を作る</h2>
            <p>{subject.description}</p>
            <small>出題元：{subject.sourceLabel}</small>
          </div>
          <label className="generated-practice-template-select">
            <span>問題タイプ</span>
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              <option value="">おまかせ（全タイプ）</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
            <small>変更後、「今すぐ1問作る」で適用</small>
          </label>
          <button className="generated-practice-generate" type="button" onClick={() => createQuestion()}>
            <span>NEW PARAMETERS</span>
            今すぐ1問作る
          </button>
        </section>

        {generationError && <p className="generated-practice-error" role="alert">{generationError}</p>}

        <section className="generated-practice-workspace" aria-labelledby="generated-question-title">
          <header className="generated-practice-question-meta">
            <div>
              <span>{FORMAT_LABELS[question.format]}</span>
              <strong>{question.category}</strong>
            </div>
            <small>{question.id}</small>
          </header>

          <article className="generated-practice-question">
            <span>QUESTION</span>
            <h2 id="generated-question-title">{question.title}</h2>
            {question.context && <p className="generated-practice-context"><RichMathText text={question.context} /></p>}
            <div className="generated-practice-prompt"><RichMathText text={question.prompt} /></div>
            {question.formula && (
              <details className="generated-practice-formula">
                <summary>使う公式をヒントとして見る</summary>
                {question.expandedFormula && <strong>Σを使う書き方</strong>}
                <DisplayMath tex={question.formula} />
                {question.expandedFormula && (
                  <>
                    <strong>Σなしで書くと</strong>
                    <DisplayMath tex={question.expandedFormula} />
                  </>
                )}
              </details>
            )}
          </article>

          <aside className="generated-practice-source">
            <span>SOURCE</span>
            <strong>{question.source.label}</strong>
            {location && <small>{location}</small>}
            <p>この範囲情報から生成。正答と出典抜粋は解答表示後に確認できます。</p>
          </aside>

          <form className="generated-practice-answer-form" onSubmit={submitAnswer}>
            <div className="generated-practice-answer-head">
              <div><span>YOUR ANSWER</span><h3>解答する</h3></div>
              {question.evaluation.type === "numeric" && (
                <p>{question.evaluation.requireUnit
                  ? "単位必須" + (question.evaluation.expectedUnit ? "（" + question.evaluation.expectedUnit + "）" : "")
                  : "数値を入力"}</p>
              )}
              {question.format === "translation" && <p>模範訳との完全一致ではなく、要点・ニュアンスで採点</p>}
            </div>

            {question.format === "choice" && (
              <div className="generated-practice-choices" role="radiogroup" aria-label="選択肢">
                {(question.options ?? []).map((option, index) => (
                  <button
                    key={option + "-" + index}
                    type="button"
                    role="radio"
                    aria-checked={selectedChoice === option}
                    onClick={() => setSelectedChoice(option)}
                  >
                    <b>{String.fromCharCode(65 + index)}</b>
                    <RichMathText text={option} />
                  </button>
                ))}
              </div>
            )}

            {question.format === "order" && (
              <div className="generated-practice-order">
                <div className="generated-practice-order-built" aria-label="現在の並び順">
                  {selectedTokenIndexes.length ? selectedTokenIndexes.map((tokenIndex, position) => (
                    <button key={tokenIndex + "-" + position} type="button" onClick={() => removeOrderedToken(position)}>
                      <span>{position + 1}</span>{question.tokens?.[tokenIndex]}
                    </button>
                  )) : <p>下の語句を順番にタップしてください。</p>}
                </div>
                <div className="generated-practice-order-pool" aria-label="並び替える語句">
                  {(question.tokens ?? []).map((token, index) => (
                    <button
                      key={token + "-" + index}
                      type="button"
                      disabled={selectedTokenIndexes.includes(index)}
                      onClick={() => addToken(index)}
                    >
                      {token}
                    </button>
                  ))}
                </div>
                <button className="generated-practice-order-reset" type="button" onClick={() => setSelectedTokenIndexes([])}>並び順をリセット</button>
              </div>
            )}

            {question.format === "translation" && (
              <textarea
                rows={5}
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                placeholder="自然な日本語で入力"
                aria-label="和訳の解答"
              />
            )}

            {question.format === "number" && (
              <input
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                placeholder={question.evaluation.type === "numeric" && question.evaluation.expectedUnit
                  ? "例：12.3 " + question.evaluation.expectedUnit
                  : "数値を入力"}
                inputMode="decimal"
                autoComplete="off"
                aria-label="計算問題の解答"
              />
            )}

            <div className="generated-practice-answer-actions">
              <button type="submit">採点する →</button>
              <button type="button" onClick={revealAnswer} disabled={revealed}>解答だけを見る</button>
            </div>
          </form>

          <p className="sr-only" aria-live="polite">{announcement}</p>

          {revealed && (
            <section className="generated-practice-solution" aria-labelledby="generated-solution-title">
              {grade && (
                <div className={"generated-practice-grade " + (grade.correct ? "is-correct" : "is-wrong")}>
                  <strong>{grade.correct ? "正解" : "もう一歩"}</strong>
                  <p>{grade.feedback}</p>
                  <small>あなたの解答：<RichMathText text={response} /></small>
                </div>
              )}

              <div className="generated-practice-solution-answer">
                <span>COMPLETE ANSWER</span>
                <h2 id="generated-solution-title">模範解答</h2>
                <div><RichMathText text={question.answer} /></div>
              </div>

              {question.subjectId === "subject-2" && question.source.excerpt && (
                <div className="generated-practice-excerpt">
                  <span>本文の参照箇所</span>
                  <blockquote><RichMathText text={question.source.excerpt} /></blockquote>
                  <small>{question.source.passageTitle} / {location}</small>
                </div>
              )}

              <div className="generated-practice-reason-grid">
                <article>
                  <span>WHY THIS ANSWER</span>
                  <h3>答えになる理由</h3>
                  <p><RichMathText text={question.reason} /></p>
                </article>
                <article>
                  <span>EXPLANATION</span>
                  <h3>解説</h3>
                  <p><RichMathText text={question.explanation} /></p>
                </article>
              </div>

              <div className="generated-practice-steps">
                <span>STEPS</span>
                <h3>{question.format === "number" ? "途中式・解法" : "確認手順"}</h3>
                <ol>
                  {question.steps.map((step, index) => (
                    <li key={question.id + "-step-" + index}><RichMathText text={step} /></li>
                  ))}
                </ol>
              </div>

              <div className="generated-practice-next">
                <button type="button" onClick={() => createQuestion()}>同じ条件でもう1問 →</button>
                <Link href={"/subjects/" + subjectId}>プリント問題へ戻る</Link>
              </div>
            </section>
          )}
        </section>
      </main>

      <footer><span>TEST//GRID</span><p>SOLVED · SOURCE-GUARDED · ON DEMAND</p><span>G/1</span></footer>
    </div>
  );
}
