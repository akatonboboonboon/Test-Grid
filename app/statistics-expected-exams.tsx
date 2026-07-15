"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STATISTICS_QUESTIONS,
  STATISTICS_TOPICS,
  type StatisticsQuestion,
  type StatisticsTopicId,
} from "./statistics-data";
import { DisplayMath, RichMathText } from "./statistics-math";

type ExamPhase = "catalog" | "active" | "result";

type ExpectedExamDefinition = {
  id: string;
  number: number;
  title: string;
  focus: string;
  seed: number;
  counts: Record<StatisticsTopicId, number>;
};

type SavedExpectedExam = {
  version: 1;
  examId: string;
  questionIds: string[];
  index: number;
  responses: Record<string, string>;
  remainingSeconds: number;
  savedAt: number;
};

const EXPECTED_EXAM_KEY = "test-grid:subject-7:expected-exam:v1";
const EXAM_SECONDS = 50 * 60;
const PASS_SCORE = 60;
const POINTS = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 10, 10] as const;

export const STATISTICS_EXPECTED_EXAMS: ExpectedExamDefinition[] = [
  { id: "expected-01", number: 1, title: "基礎総合", focus: "6単元を均等に確認", seed: 107, counts: { descriptive: 2, relation: 2, counting: 2, conditional: 2, "random-variable": 2, continuous: 2 } },
  { id: "expected-02", number: 2, title: "回帰分析重点", focus: "共分散・回帰式・予測・決定係数", seed: 211, counts: { descriptive: 1, relation: 4, counting: 2, conditional: 2, "random-variable": 1, continuous: 2 } },
  { id: "expected-03", number: 3, title: "場合の数重点", focus: "順列・組合せ・余事象・カード", seed: 313, counts: { descriptive: 1, relation: 2, counting: 4, conditional: 2, "random-variable": 1, continuous: 2 } },
  { id: "expected-04", number: 4, title: "条件付き確率重点", focus: "独立・全確率・Bayes", seed: 419, counts: { descriptive: 1, relation: 1, counting: 2, conditional: 5, "random-variable": 1, continuous: 2 } },
  { id: "expected-05", number: 5, title: "連続分布重点", focus: "密度・標準化・正規分布表", seed: 523, counts: { descriptive: 1, relation: 1, counting: 1, conditional: 2, "random-variable": 2, continuous: 5 } },
  { id: "expected-06", number: 6, title: "統計量計算", focus: "平均・分散から回帰まで", seed: 631, counts: { descriptive: 3, relation: 2, counting: 2, conditional: 1, "random-variable": 2, continuous: 2 } },
  { id: "expected-07", number: 7, title: "確率変数重点", focus: "期待値・分散・一次変換", seed: 739, counts: { descriptive: 1, relation: 2, counting: 2, conditional: 2, "random-variable": 4, continuous: 1 } },
  { id: "expected-08", number: 8, title: "表と数値の連続小問", focus: "与件を次の計算へつなぐ", seed: 827, counts: { descriptive: 2, relation: 3, counting: 3, conditional: 2, "random-variable": 1, continuous: 1 } },
  { id: "expected-09", number: 9, title: "確率・分布複合", focus: "Bayesから正規分布まで", seed: 929, counts: { descriptive: 1, relation: 2, counting: 2, conditional: 3, "random-variable": 1, continuous: 3 } },
  { id: "expected-10", number: 10, title: "本番標準", focus: "過去問型の総合バランス", seed: 1031, counts: { descriptive: 2, relation: 2, counting: 2, conditional: 2, "random-variable": 2, continuous: 2 } },
  { id: "expected-11", number: 11, title: "計算量多め", focus: "組合せ・期待値・積分を反復", seed: 1129, counts: { descriptive: 1, relation: 2, counting: 3, conditional: 2, "random-variable": 2, continuous: 2 } },
  { id: "expected-12", number: 12, title: "最終予想", focus: "回帰・Bayes・正規分布を横断", seed: 1231, counts: { descriptive: 1, relation: 3, counting: 2, conditional: 3, "random-variable": 1, continuous: 2 } },
];

const EXPECTED_EXAM_DEFINITIONS_BY_ID = new Map(STATISTICS_EXPECTED_EXAMS.map((exam) => [exam.id, exam]));

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number) {
  const random = seededRandom(seed);
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function buildExpectedQuestions(definition: ExpectedExamDefinition) {
  const selected = STATISTICS_TOPICS.flatMap((topic, topicIndex) => {
    const pool = STATISTICS_QUESTIONS.filter((question) => question.topic === topic.id);
    return seededShuffle(pool, definition.seed + topicIndex * 97).slice(0, definition.counts[topic.id]);
  });
  return seededShuffle(selected, definition.seed * 17);
}

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[−–—]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/[「」『』（）()。、，,.!！?？・\s]/g, "")
    .trim();
}

function parseNumericResponse(value: string) {
  let normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[−–—]/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/^約/, "");

  const percent = normalized.includes("%");
  normalized = normalized.replace(/%/g, "");
  const pieces = normalized.split(/(?:=|≈|≒)/).filter(Boolean);
  normalized = pieces.at(-1) ?? normalized;
  normalized = normalized.replace(/(?:通り|個|人|点|回|本|枚|以上|以下)$/u, "");

  const fraction = normalized.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
  let parsed: number;
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    parsed = Number(fraction[1]) / denominator;
  } else if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) {
    parsed = Number(normalized);
  } else {
    return null;
  }

  if (!Number.isFinite(parsed)) return null;
  return percent ? parsed / 100 : parsed;
}

function isCorrectAnswer(question: StatisticsQuestion, response: string) {
  if (question.format === "number") {
    const parsed = parseNumericResponse(response);
    if (parsed === null || question.numericAnswer === undefined) return false;
    const tolerance = question.tolerance ?? Math.max(1e-9, Math.abs(question.numericAnswer) * 1e-9);
    return Math.abs(parsed - question.numericAnswer) <= tolerance;
  }

  const normalized = normalizeText(response);
  const references = [question.answer, ...(question.accepted ?? [])];
  if (references.some((answer) => normalizeText(answer) === normalized)) return true;
  if (question.format === "choice") return false;

  const keywords = question.keywords ?? [];
  if (!keywords.length) return false;
  const matched = keywords.filter((keyword) => normalized.includes(normalizeText(keyword))).length;
  return matched >= (question.minKeywords ?? keywords.length);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function restoreSavedExam(): SavedExpectedExam | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EXPECTED_EXAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedExpectedExam>;
    const knownIds = new Set(STATISTICS_QUESTIONS.map((question) => question.id));
    if (
      parsed.version !== 1
      || typeof parsed.examId !== "string"
      || !EXPECTED_EXAM_DEFINITIONS_BY_ID.has(parsed.examId)
      || !Array.isArray(parsed.questionIds)
      || parsed.questionIds.length !== POINTS.length
      || parsed.questionIds.some((id) => typeof id !== "string" || !knownIds.has(id))
    ) return null;
    return {
      version: 1,
      examId: parsed.examId,
      questionIds: parsed.questionIds,
      index: typeof parsed.index === "number" ? Math.max(0, Math.min(POINTS.length - 1, Math.floor(parsed.index))) : 0,
      responses: parsed.responses && typeof parsed.responses === "object" && !Array.isArray(parsed.responses)
        ? Object.fromEntries(Object.entries(parsed.responses).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
        : {},
      remainingSeconds: typeof parsed.remainingSeconds === "number"
        ? Math.max(0, Math.min(EXAM_SECONDS, Math.floor(parsed.remainingSeconds)))
        : EXAM_SECONDS,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export default function StatisticsExpectedExams() {
  const [phase, setPhase] = useState<ExamPhase>("catalog");
  const [examId, setExamId] = useState(STATISTICS_EXPECTED_EXAMS[0].id);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_SECONDS);
  const [savedExam, setSavedExam] = useState<SavedExpectedExam | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const definition = EXPECTED_EXAM_DEFINITIONS_BY_ID.get(examId) ?? STATISTICS_EXPECTED_EXAMS[0];
  const questions = useMemo(() => questionIds.flatMap((id) => {
    const found = STATISTICS_QUESTIONS.find((question) => question.id === id);
    return found ? [found] : [];
  }), [questionIds]);
  const currentQuestion = questions[index];

  const resultRows = useMemo(() => questions.map((question, questionIndex) => {
    const response = responses[question.id] ?? "";
    const correct = isCorrectAnswer(question, response);
    return { question, response, correct, points: POINTS[questionIndex] ?? 0 };
  }), [questions, responses]);
  const score = resultRows.reduce((total, row) => total + (row.correct ? row.points : 0), 0);

  const topicResults = useMemo(() => STATISTICS_TOPICS.map((topic) => {
    const rows = resultRows.filter((row) => row.question.topic === topic.id);
    return {
      topic,
      earned: rows.reduce((sum, row) => sum + (row.correct ? row.points : 0), 0),
      possible: rows.reduce((sum, row) => sum + row.points, 0),
    };
  }).filter((row) => row.possible > 0), [resultRows]);

  /* Device-local exam state is restored after hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSavedExam(restoreSavedExam());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const finishExam = useCallback(() => {
    setPhase("result");
    try { window.localStorage.removeItem(EXPECTED_EXAM_KEY); } catch { /* Storage can be unavailable. */ }
    setSavedExam(null);
  }, []);

  useEffect(() => {
    if (phase !== "active" || remainingSeconds !== 0) return;
    const timeout = window.setTimeout(finishExam, 0);
    return () => window.clearTimeout(timeout);
  }, [finishExam, phase, remainingSeconds]);

  useEffect(() => {
    if (!hydrated || phase !== "active" || questionIds.length !== POINTS.length) return;
    const session: SavedExpectedExam = {
      version: 1,
      examId,
      questionIds,
      index,
      responses,
      remainingSeconds,
      savedAt: Date.now(),
    };
    try {
      window.localStorage.setItem(EXPECTED_EXAM_KEY, JSON.stringify(session));
    } catch {
      // The exam remains usable when browser storage is blocked.
    }
  }, [examId, hydrated, index, phase, questionIds, remainingSeconds, responses]);

  function startExam(nextExam: ExpectedExamDefinition) {
    const built = buildExpectedQuestions(nextExam);
    setExamId(nextExam.id);
    setQuestionIds(built.map((question) => question.id));
    setIndex(0);
    setResponses({});
    setRemainingSeconds(EXAM_SECONDS);
    setPhase("active");
  }

  function resumeExam() {
    if (!savedExam) return;
    setExamId(savedExam.examId);
    setQuestionIds(savedExam.questionIds);
    setIndex(savedExam.index);
    setResponses(savedExam.responses);
    setRemainingSeconds(savedExam.remainingSeconds);
    setPhase("active");
  }

  function deleteSavedExam() {
    try { window.localStorage.removeItem(EXPECTED_EXAM_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(null);
  }

  function updateResponse(value: string) {
    if (!currentQuestion) return;
    setResponses((current) => ({ ...current, [currentQuestion.id]: value }));
  }

  if (phase === "catalog") {
    return (
      <section className="english-guide-workspace statistics-expected-workspace" aria-labelledby="statistics-expected-title">
        <div className="english-panel-heading statistics-panel-heading">
          <div><span>12 PREDICTED EXAMS</span><h2 id="statistics-expected-title">想定試験</h2></div>
          <p>過去問の構成を参考に、範囲内の演習から作った50分・100点満点の12回分です。60点以上で合格です。</p>
        </div>

        {savedExam && (
          <div className="generic-test-answer english-test-feedback english-saved-test statistics-saved-test">
            <strong>途中の想定試験があります</strong>
            <p><span>試験</span>第{EXPECTED_EXAM_DEFINITIONS_BY_ID.get(savedExam.examId)?.number ?? "?"}回・Q{savedExam.index + 1} / {savedExam.questionIds.length}</p>
            <p><span>残り時間</span>{formatTime(savedExam.remainingSeconds)}（{new Date(savedExam.savedAt).toLocaleString("ja-JP")} 保存）</p>
            <div className="english-result-actions statistics-saved-actions">
              <button type="button" onClick={resumeExam}>続きから再開</button>
              <button type="button" onClick={deleteSavedExam}>保存データを削除</button>
            </div>
          </div>
        )}

        <div className="statistics-exam-rules">
          <div><span>TIME</span><strong>50:00</strong><small>自動保存・時間切れ採点</small></div>
          <div><span>SCORE</span><strong>100</strong><small>12問・配点表示</small></div>
          <div><span>PASS</span><strong>60</strong><small>59点以下は赤点</small></div>
        </div>

        <div className="statistics-expected-grid">
          {STATISTICS_EXPECTED_EXAMS.map((exam) => (
            <article key={exam.id}>
              <span>予想 第{String(exam.number).padStart(2, "0")}回</span>
              <h3>{exam.title}</h3>
              <p>{exam.focus}</p>
              <small>12問 ／ 50分 ／ 解答・途中式つき</small>
              <button type="button" onClick={() => startExam(exam)}>この試験を開始 →</button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (phase === "active" && currentQuestion) {
    const response = responses[currentQuestion.id] ?? "";
    return (
      <section className="generic-test-workspace english-test-workspace statistics-expected-active" aria-labelledby="statistics-expected-active-title">
        <div className="statistics-expected-exam-bar">
          <div><span>予想 第{String(definition.number).padStart(2, "0")}回</span><strong id="statistics-expected-active-title">{definition.title}</strong></div>
          <div className={remainingSeconds <= 300 ? "is-urgent" : ""}><span>残り時間</span><strong>{formatTime(remainingSeconds)}</strong></div>
        </div>
        <div className="generic-deck-meta english-test-meta statistics-question-meta">
          <span>QUESTION {index + 1} / {questions.length}</span>
          <span>{POINTS[index]}点 · {currentQuestion.genre} · 難度{currentQuestion.difficulty}</span>
        </div>
        <div className="statistics-exam-progress" aria-label={"解答済み " + Object.values(responses).filter((value) => value.trim()).length + "問"}>
          {questions.map((question, questionIndex) => (
            <button
              type="button"
              key={question.id}
              className={(questionIndex === index ? "is-current " : "") + ((responses[question.id] ?? "").trim() ? "is-answered" : "")}
              onClick={() => setIndex(questionIndex)}
              aria-label={"問題" + (questionIndex + 1) + ((responses[question.id] ?? "").trim() ? " 解答済み" : " 未回答")}
            >
              {questionIndex + 1}
            </button>
          ))}
        </div>

        {currentQuestion.context && (
          <div className="english-guide-tip statistics-question-context">
            <span>GIVEN</span><p><RichMathText text={currentQuestion.context} /></p>
          </div>
        )}
        <div className="generic-test-question english-test-question statistics-test-question">
          <span>問題</span><h2><RichMathText text={currentQuestion.prompt} /></h2>
        </div>

        <div className="english-answer-form statistics-answer-form statistics-expected-answer">
          {currentQuestion.format === "choice" ? (
            <fieldset className="english-choice-answer statistics-choice-answer">
              <legend>正しいものを1つ選択</legend>
              {currentQuestion.options?.map((option, optionIndex) => (
                <label key={currentQuestion.id + "-" + optionIndex}>
                  <input type="radio" name={"expected-" + currentQuestion.id} value={option} checked={response === option} onChange={(event) => updateResponse(event.target.value)} />
                  <span><b>{String.fromCharCode(65 + optionIndex)}</b><RichMathText text={option} /></span>
                </label>
              ))}
            </fieldset>
          ) : currentQuestion.format === "text" ? (
            <label className="english-input-answer english-translation-answer statistics-text-answer">
              <span>式・理由・説明を入力</span>
              <textarea rows={5} value={response} onChange={(event) => updateResponse(event.target.value)} />
            </label>
          ) : (
            <label className="english-input-answer statistics-number-answer">
              <span>数値を入力</span>
              <input autoComplete="off" inputMode="decimal" value={response} onChange={(event) => updateResponse(event.target.value)} placeholder="小数・分数・%で入力できます" />
            </label>
          )}
        </div>

        <div className="statistics-expected-navigation">
          <button type="button" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>← 前の問題</button>
          <button type="button" onClick={() => {
            const session: SavedExpectedExam = { version: 1, examId, questionIds, index, responses, remainingSeconds, savedAt: Date.now() };
            try { window.localStorage.setItem(EXPECTED_EXAM_KEY, JSON.stringify(session)); } catch { /* Ignore unavailable storage. */ }
            setSavedExam(session);
            setPhase("catalog");
          }}>中断して保存</button>
          {index < questions.length - 1
            ? <button type="button" onClick={() => setIndex((current) => current + 1)}>次の問題 →</button>
            : <button className="is-submit" type="button" onClick={finishExam}>提出して採点 →</button>}
        </div>
      </section>
    );
  }

  return (
    <section className="generic-test-workspace english-test-workspace statistics-expected-result" aria-labelledby="statistics-expected-result-title">
      <div className={"statistics-score-panel " + (score >= PASS_SCORE ? "is-pass" : "is-fail")}>
        <span>{score >= PASS_SCORE ? "PASS" : "RED SCORE"}</span>
        <h2 id="statistics-expected-result-title">{score} <small>/ 100</small></h2>
        <strong>{score >= PASS_SCORE ? "合格です" : "赤点です（合格ライン60点）"}</strong>
        <p>予想 第{String(definition.number).padStart(2, "0")}回「{definition.title}」</p>
      </div>

      <div className="statistics-topic-score-grid">
        {topicResults.map((row) => (
          <div key={row.topic.id}>
            <span>{row.topic.shortTitle}</span>
            <strong>{row.earned} / {row.possible}</strong>
            <progress value={row.earned} max={row.possible} />
          </div>
        ))}
      </div>

      <div className="statistics-expected-solutions">
        <div className="english-panel-heading statistics-panel-heading">
          <div><span>MODEL ANSWERS</span><h2>解答・途中式・解説</h2></div>
          <p>不正解だけでなく全問の模範解答を表示しています。</p>
        </div>
        {resultRows.map((row, rowIndex) => (
          <article key={row.question.id} className={row.correct ? "is-correct" : "is-wrong"}>
            <header><span>{row.correct ? "○" : "×"} Q{rowIndex + 1}</span><strong>{row.points}点</strong></header>
            <h3><RichMathText text={row.question.prompt} /></h3>
            <p><b>あなたの解答：</b><RichMathText text={row.response || "未回答"} /></p>
            <p><b>正答：</b><RichMathText text={row.question.answer} /></p>
            {row.question.formula && <div className="statistics-solution-formula"><span>使う公式</span><DisplayMath tex={row.question.formula} /></div>}
            <div className="statistics-solution-steps">
              <span>途中式</span>
              <ol>{row.question.steps.map((step, stepIndex) => <li key={row.question.id + "-" + stepIndex}><RichMathText text={step} /></li>)}</ol>
            </div>
            <p><b>解説：</b><RichMathText text={row.question.explanation} /></p>
          </article>
        ))}
      </div>

      <div className="english-result-actions statistics-result-actions">
        <button type="button" onClick={() => startExam(definition)}>同じ回をもう一度</button>
        <button type="button" onClick={() => setPhase("catalog")}>別の想定試験を選ぶ</button>
      </div>
    </section>
  );
}
