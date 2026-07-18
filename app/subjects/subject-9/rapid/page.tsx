"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DIGITAL_CIRCUIT_ALL_QUESTIONS, type DigitalCircuitStudyQuestion } from "../../../digital-circuits-extra-data";
import DigitalCircuitStudyDiagram from "../../../digital-circuits-extra-diagrams";
import { RichMathText } from "../../../statistics-math";
import styles from "../../../digital-circuits.module.css";

type Rank = { score: number; streak: number; answered: number; date: number };
const RANK_KEY = "test-grid:subject-9:rapid-ranking:v1";
const QUESTIONS = DIGITAL_CIRCUIT_ALL_QUESTIONS.filter((question) => question.format === "choice" || question.format === "sequence");
function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[、，,\s・→-]/g, "");
}
function correct(question: DigitalCircuitStudyQuestion, response: string) {
  const value = normalize(response);
  return [question.answer, ...(question.accepted ?? [])].some((answer) => normalize(answer) === value);
}
function nextQuestion(previous?: string) {
  const pool = QUESTIONS.filter((question) => question.id !== previous);
  return pool[Math.floor(Math.random() * pool.length)] ?? QUESTIONS[0];
}

function readRanking(): Rank[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RANK_KEY) ?? "[]") as Rank[];
  } catch {
    return [];
  }
}
export default function DigitalCircuitRapidPage() {
  const [secondsDraft, setSecondsDraft] = useState("10");
  const [limit, setLimit] = useState(10);
  const [remaining, setRemaining] = useState(10);
  const [question, setQuestion] = useState<DigitalCircuitStudyQuestion>(() => QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"setup" | "active" | "correct" | "wrong" | "timeout">("setup");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [ranking, setRanking] = useState<Rank[]>(() => readRanking());
  const rankSorted = useMemo(() => [...ranking].sort((a, b) => b.score - a.score || b.streak - a.streak).slice(0, 5), [ranking]);

  useEffect(() => {
    if (status !== "active") return;
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        window.clearInterval(timer);
        setStatus("timeout");
        setAnswered((count) => count + 1);
        setStreak(0);
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [question.id, status]);

  function start() {
    const parsed = Math.min(60, Math.max(3, Number.parseInt(secondsDraft, 10) || 10));
    setLimit(parsed); setRemaining(parsed); setQuestion(nextQuestion()); setAnswer(""); setScore(0); setStreak(0); setBestStreak(0); setAnswered(0); setStatus("active");
  }
  function submit() {
    if (!answer.trim() || status !== "active") return;
    const ok = correct(question, answer);
    setAnswered((count) => count + 1);
    if (ok) {
      setScore((value) => value + 1);
      setStreak((value) => { const next = value + 1; setBestStreak((best) => Math.max(best, next)); return next; });
      setStatus("correct");
    } else {
      setStreak(0); setStatus("wrong");
    }
  }
  function advance() {
    setQuestion(nextQuestion(question.id)); setAnswer(""); setRemaining(limit); setStatus("active");
  }
  function finish() {
    const next = [...ranking, { score, streak: bestStreak, answered, date: Date.now() }].sort((a, b) => b.score - a.score || b.streak - a.streak).slice(0, 20);
    setRanking(next); window.localStorage.setItem(RANK_KEY, JSON.stringify(next)); setStatus("setup");
  }

  return (
    <main className={styles.rapidShell}>
      <section className={styles.rapidCard}>
        <div className={styles.rapidTop}><Link href="/subjects/subject-9">← デジタル回路へ</Link><strong>⚡ TIMED DRILL</strong></div>
        {status === "setup" ? <>
          <span className={styles.eyebrow}>SUBJECT 09</span><h1>時間制限・即答ドリル</h1>
          <p>図を見て、ゲート出力・FF状態・カウンタ列・状態遷移を制限時間内に答えます。連続正解と端末内ランキングを記録します。</p>
          <div className={styles.settings}><label>1問の秒数<input type="number" min="3" max="60" value={secondsDraft} onChange={(event) => setSecondsDraft(event.target.value)} /></label><button className={styles.primary} type="button" onClick={start}>開始</button></div>
          <div className={styles.rapidRanking}><h2>ランキング</h2>{rankSorted.length ? <ol>{rankSorted.map((rank, index) => <li key={rank.date + "-" + index}>{rank.score}正解 ／ 最大{rank.streak}連続 ／ {new Date(rank.date).toLocaleDateString("ja-JP")}</li>)}</ol> : <p>まだ記録がありません。</p>}</div>
        </> : <>
          <div className={styles.rapidTop}><span>正解 {score} / {answered}</span><span>連続 {streak}（BEST {bestStreak}）</span><span className={styles.timer}>{remaining}s</span></div>
          <div className={styles.rapidPrompt}><RichMathText text={question.prompt} /></div>
          {question.diagram && <div className={styles.diagram + " " + styles.diagramCompact}><DigitalCircuitStudyDiagram kind={question.diagram} solution={status !== "active"} title={status === "active" ? "即答用図" : "模範図"} compact /></div>}
          {status === "active" && <>
            {question.format === "choice" ? <fieldset className={styles.choices}>{question.options?.map((option) => <label key={option}><input type="radio" name="rapid" checked={answer === option} onChange={() => setAnswer(option)} />{option}</label>)}</fieldset> : <input className={styles.select} autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="状態列を入力してEnter" />}
            <div className={styles.actions}><button type="button" onClick={submit} disabled={!answer.trim()}>回答</button><button type="button" className={styles.danger} onClick={finish}>終了・記録</button></div>
          </>}
          {status !== "active" && <>
            <div className={styles.feedback} data-correct={status === "correct"}><strong>{status === "correct" ? "正解" : status === "timeout" ? "時間切れ" : "不正解"}</strong><p>正解：<RichMathText text={question.answer} /></p><p>{question.explanation}</p></div>
            <div className={styles.actions}><button type="button" onClick={advance}>次の問題</button><button type="button" className={styles.danger} onClick={finish}>終了・記録</button></div>
          </>}
        </>}
      </section>
    </main>
  );
}
