"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS, type DigitalCircuitStudyQuestion } from "./digital-circuits-extra-data";
import DigitalCircuitStudyDiagram from "./digital-circuits-extra-diagrams";
import { RichMathText } from "./statistics-math";
import styles from "./digital-circuits.module.css";

type Exam = (typeof DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS)[number];
type ExpectedQuestion = DigitalCircuitStudyQuestion & { major: number; sub: number; points: number };
type AnswerMap = Record<string, string>;
type Stored = { version: 1; examId: string; answers: AnswerMap; remaining: number; savedAt: number };
const STORAGE_KEY = "test-grid:subject-9:expected:v1";
const DEFAULT_DURATION = 50 * 60;

function questions(exam: Exam) {
  return exam.sections.flatMap((section) => section.questions) as unknown as ExpectedQuestion[];
}
const QUESTIONS_PER_PAPER = 2;
type PaperItem = {
  question: ExpectedQuestion;
  section: Exam["sections"][number];
};
function examPages(exam: Exam, perPage = QUESTIONS_PER_PAPER) {
  const items = exam.sections.flatMap((section) => (
    (section.questions as unknown as ExpectedQuestion[]).map((question) => ({ question, section }))
  ));
  return Array.from(
    { length: Math.ceil(items.length / perPage) },
    (_, index) => items.slice(index * perPage, (index + 1) * perPage),
  );
}
function needsQuestionFigure(question: ExpectedQuestion) {
  if (!question.diagram) return false;
  const signal = question.genre + " " + question.prompt;
  return question.format === "sequence"
    || /波形|タイミング|回路|状態表|状態図|カウンタ|計数|XOR|真理値表/.test(signal);
}
function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[−–—]/g, "-").replace(/[\s、，,。．・]/g, "");
}
function correct(question: ExpectedQuestion, response: string) {
  const value = normalize(response);
  if (!value) return false;
  if ([question.answer, ...(question.accepted ?? [])].some((answer) => normalize(answer) === value)) return true;
  const keywords = question.keywords ?? [];
  return keywords.length > 0 && keywords.filter((word) => value.includes(normalize(word))).length >= (question.minKeywords ?? keywords.length);
}
function formatTime(seconds: number) {
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}
function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Stored;
    if (stored.version !== 1 || !DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS.some((exam) => exam.id === stored.examId)) return null;
    return stored;
  } catch {
    return null;
  }
}

export default function DigitalCircuitExpectedExams() {
  const [examId, setExamId] = useState(DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS[0].id);
  const [phase, setPhase] = useState<"setup" | "active" | "result">("setup");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [practiceMinutesDraft, setPracticeMinutesDraft] = useState("50");
  const [stored, setStored] = useState<Stored | null>(() => readStored());
  const [printAnswers, setPrintAnswers] = useState(false);
  const answersRef = useRef(answers);
  const remainingRef = useRef(remaining);
  const exam = DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS.find((candidate) => candidate.id === examId) ?? DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS[0];
  const allQuestions = useMemo(() => questions(exam), [exam]);
  const score = allQuestions.reduce((sum, question) => sum + (correct(question, answers[question.id] ?? "") ? question.points : 0), 0);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);
  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setPhase("result");
          window.localStorage.removeItem(STORAGE_KEY);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => {
      const next: Stored = { version: 1, examId, answers: answersRef.current, remaining: remainingRef.current, savedAt: Date.now() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStored(next);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [examId, phase]);

  function start() {
    setAnswers({});
    const minutes = Math.min(180, Math.max(1, Number.parseInt(practiceMinutesDraft, 10) || 50));
    setRemaining(minutes * 60);
    setPhase("active");
    window.localStorage.removeItem(STORAGE_KEY);
  }
  function resume() {
    if (!stored) return;
    setExamId(stored.examId);
    setAnswers(stored.answers);
    setRemaining(Math.max(0, Math.min(180 * 60, stored.remaining)));
    setPhase("active");
  }
  function pause() {
    const next: Stored = { version: 1, examId, answers, remaining, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStored(next);
    setPhase("setup");
  }
  function finish() {
    setPhase("result");
    window.localStorage.removeItem(STORAGE_KEY);
    setStored(null);
  }
  function print(solution: boolean) {
    setPrintAnswers(solution);
    window.setTimeout(() => window.print(), 50);
  }

  if (phase === "setup") {
    return (
      <section className={styles.panel} aria-labelledby="dc-expected-title">
        <div className={styles.panelHeading}>
          <div><span className={styles.eyebrow}>A4 EXPECTED EXAMS</span><h2 id="dc-expected-title">A4・予想試験</h2></div>
          <p>現行範囲17ページを均等に含めた6セット。試験時間・満点・赤点は資料で未確認のため、50分は変更可能な練習初期値、100点と60点は練習用の換算・目標です。</p>
        </div>
        <div className={styles.settings}>
          <label>試験セット
            <select className={styles.select} value={examId} onChange={(event) => setExamId(event.target.value)}>
              {DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS.map((candidate) => <option key={candidate.id} value={candidate.id}>第{candidate.number}回 / 100点</option>)}
            </select>
          </label>
          <label>練習時間（分）<input type="number" min="1" max="180" value={practiceMinutesDraft} onChange={(event) => setPracticeMinutesDraft(event.target.value)} /></label>
          <label>練習目標<input value="100点換算で60点" readOnly /></label>
        </div>
        {stored && (
          <div className={styles.feedback} data-correct="true">
            <strong>保存中の予想試験があります</strong>
            <p>残り {formatTime(stored.remaining)} ／ {new Date(stored.savedAt).toLocaleString("ja-JP")} 保存</p>
            <div className={styles.actions}><button type="button" onClick={resume}>保存位置から再開</button><button type="button" className={styles.danger} onClick={() => { window.localStorage.removeItem(STORAGE_KEY); setStored(null); }}>保存を削除</button></div>
          </div>
        )}
        <div className={styles.actions}><button type="button" onClick={start}>設定時間で練習開始</button><button type="button" onClick={() => print(false)}>問題用紙を印刷</button><button type="button" onClick={() => print(true)}>解答冊子を印刷</button></div>
        {printAnswers
          ? <SolutionBook exam={exam} />
          : <ExamPapers exam={exam} answers={{}} onAnswer={() => {}} readOnly />}
      </section>
    );
  }

  if (phase === "active") {
    return (
      <section className={styles.panel}>
        <div className={styles.panelHeading + " " + styles.noPrint}>
          <div><span className={styles.eyebrow}>EXAM IN PROGRESS</span><h2>第{exam.number}回 / 残り <span className={styles.timer}>{formatTime(remaining)}</span></h2></div>
          <p>解答と残り時間は2秒ごとに端末へ保存されます。図の空欄は紙へ描くか、テキスト欄へ波形・状態列を記入してください。</p>
        </div>
        <div className={styles.actions + " " + styles.noPrint}><button type="button" onClick={pause}>中断して保存</button><button type="button" className={styles.danger} onClick={finish}>採点へ進む</button></div>
        <ExamPapers exam={exam} answers={answers} onAnswer={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))} />
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <div><span className={styles.eyebrow}>RESULT / REVIEW</span><h2>第{exam.number}回 結果</h2></div>
        <p>自動採点は完全一致・登録済み別解・記述キーワードで判定します。紙へ描いた図は模範図と見比べて自己採点してください。</p>
      </div>
      <div className={(score >= 60 ? styles.pass : styles.fail) + " " + styles.score}>{score} / 100</div>
      <p>{score >= 60 ? "練習目標60点を突破しました。" : "練習目標60点まであと" + (60 - score) + "点です。"}</p>
      <div className={styles.actions}><button type="button" onClick={() => setPhase("setup")}>別のセットへ</button><button type="button" onClick={() => print(true)}>解答冊子を印刷</button></div>
      <SolutionBook exam={exam} answers={answers} />
    </section>
  );
}

function ExamPapers({ exam, answers, onAnswer, readOnly = false }: { exam: Exam; answers: AnswerMap; onAnswer: (id: string, value: string) => void; readOnly?: boolean }) {
  const pages = examPages(exam);
  return (
    <div className={styles.examBook} data-book="problems">
      {pages.map((items, pageIndex) => (
        <article className={styles.examPaper} key={pageIndex}>
          <header className={styles.examHeader}>
            <div><strong>2026年度 デジタル回路 予想試験 第{exam.number}回</strong><br /><small>現行範囲資料準拠・公式時間未確認</small></div>
            <div>練習時間：設定値 ／ 100点換算<br />目標60点・氏名＿＿＿＿＿＿</div>
          </header>
          <div className={styles.examPageBody}>
            {items.map(({ question, section }: PaperItem) => (
              <section className={styles.examQuestion} key={question.id}>
                <div className={styles.examQuestionHeading}>
                  <strong>問{question.major}({question.sub})</strong>
                  <span>{section.title} ／ {question.points}点</span>
                </div>
                <p className={styles.examContext}>{section.context}</p>
                <p className={styles.examPrompt}><RichMathText text={question.prompt} /></p>
                {needsQuestionFigure(question) && question.diagram && (
                  <div className={styles.examQuestionFigure}>
                    <DigitalCircuitStudyDiagram kind={question.diagram} title="解答用図" compact />
                  </div>
                )}
                {!readOnly
                  ? <textarea aria-label={"問" + question.major + "-" + question.sub + "の解答"} value={answers[question.id] ?? ""} onChange={(event) => onAnswer(question.id, event.target.value)} placeholder="解答・状態列・式を入力" />
                  : <div className={styles.examAnswerLines} aria-hidden="true" />}
              </section>
            ))}
          </div>
          <footer className={styles.examPageFooter}>— {pageIndex + 1} / {pages.length} —</footer>
        </article>
      ))}
    </div>
  );
}

function SolutionBook({ exam, answers = {} }: { exam: Exam; answers?: AnswerMap }) {
  const pages = examPages(exam, 1);
  return (
    <div className={styles.solutionBook} data-book="solutions">
      {pages.map((items, pageIndex) => (
        <article className={styles.examPaper + " " + styles.solutionPaper} key={pageIndex}>
          <header className={styles.examHeader}>
            <div><strong>デジタル回路 予想試験 第{exam.number}回 解答冊子</strong><br /><small>採点後は根拠と途中式まで確認してください</small></div>
            <div>100点換算 ／ 目標60点</div>
          </header>
          <div className={styles.examPageBody}>
            {items.map(({ question }: PaperItem) => (
              <section key={question.id} className={styles.solutionItem}>
                <strong>問{question.major}({question.sub}) ／ {question.points}点</strong>
                <p className={styles.solutionPrompt}><RichMathText text={question.prompt} /></p>
                {answers[question.id] !== undefined && <p>あなたの解答：{answers[question.id] ? <RichMathText text={answers[question.id]} /> : "未解答"} ／ {correct(question, answers[question.id]) ? "○" : "×"}</p>}
                <p><b>解答：</b><RichMathText text={question.answer} /></p>
                {needsQuestionFigure(question) && question.diagram && (
                  <div className={styles.examQuestionFigure}>
                    <DigitalCircuitStudyDiagram kind={question.diagram} solution title="模範図・読み方" compact />
                  </div>
                )}
                <ol>{question.steps.map((step, index) => <li key={index}><RichMathText text={step} /></li>)}</ol>
                <p><b>理由：</b><RichMathText text={question.explanation} /></p>
                <small>出典：{question.sourceRefs.map((source) => source.filename + " p." + source.page).join(" / ")}</small>
              </section>
            ))}
          </div>
          <footer className={styles.examPageFooter}>— {pageIndex + 1} / {pages.length} —</footer>
        </article>
      ))}
    </div>
  );
}
