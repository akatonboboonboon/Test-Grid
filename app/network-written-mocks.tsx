"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NETWORK_WRITTEN_MOCKS,
  NETWORK_WRITTEN_TERMS,
  evaluateNetworkWrittenAnswer,
  networkWrittenCharacterCount,
  type NetworkWrittenEvaluation,
  type NetworkWrittenLayerChoice,
} from "./network-written-data";
import styles from "./network-written.module.css";

type MockPhase = "setup" | "active" | "result";
type MockResult = { termId: string; score: number; qualified: boolean };

const LAYERS: Array<{ value: NetworkWrittenLayerChoice; label: string }> = [
  { value: 1, label: "L1 物理層" },
  { value: 2, label: "L2 データリンク層" },
  { value: 3, label: "L3 ネットワーク層" },
  { value: 4, label: "L4 トランスポート層" },
  { value: 5, label: "L5 セッション層" },
  { value: 6, label: "L6 プレゼンテーション層" },
  { value: 7, label: "L7 アプリケーション層" },
];

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function NetworkWrittenMocks() {
  const [phase, setPhase] = useState<MockPhase>("setup");
  const [paperId, setPaperId] = useState(NETWORK_WRITTEN_MOCKS[0]?.id ?? "");
  const [position, setPosition] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(50 * 60);
  const [layerChoice, setLayerChoice] = useState<NetworkWrittenLayerChoice | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<NetworkWrittenEvaluation | null>(null);
  const [results, setResults] = useState<MockResult[]>([]);

  const paper = NETWORK_WRITTEN_MOCKS.find((candidate) => candidate.id === paperId)
    ?? NETWORK_WRITTEN_MOCKS[0];
  const termsById = useMemo(
    () => new Map(NETWORK_WRITTEN_TERMS.map((term) => [term.id, term])),
    [],
  );
  const current = paper ? termsById.get(paper.termIds[position]) : undefined;
  const score = results.reduce((sum, result) => sum + result.score, 0);
  const characterCount = networkWrittenCharacterCount(answer);

  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setPhase("result");
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  function resetResponse() {
    setLayerChoice(null);
    setAnswer("");
    setEvaluation(null);
  }

  function startMock(nextPaperId: string) {
    setPaperId(nextPaperId);
    setPosition(0);
    setRemainingSeconds(50 * 60);
    setResults([]);
    resetResponse();
    setPhase("active");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!current || evaluation || layerChoice === null || characterCount === 0) return;
    const result = evaluateNetworkWrittenAnswer(current, answer, layerChoice);
    setEvaluation(result);
    setResults((items) => [...items, {
      termId: current.id,
      score: result.estimatedScore,
      qualified: result.qualified,
    }]);
  }

  function nextQuestion() {
    if (!paper) return;
    if (position >= paper.termIds.length - 1) {
      setPhase("result");
      return;
    }
    setPosition((value) => value + 1);
    resetResponse();
  }

  return (
    <section className={styles.picker} aria-labelledby="network-written-mock-title">
      <div className={styles.sectionHeading}>
        <span>EXAM / 50 MINUTES</span>
        <h2 id="network-written-mock-title">層＋20文字記述模試</h2>
        <p>10語を各10点で採点します。全層から出題し、解答後に正しい層・正式名称・模範説明を確認できます。</p>
      </div>

      {phase === "setup" && (
        <div className={styles.pickerControls} role="group" aria-label="記述模試を選ぶ">
          {NETWORK_WRITTEN_MOCKS.map((mock) => (
            <button key={mock.id} type="button" onClick={() => startMock(mock.id)}>
              模試 {String(mock.number).padStart(2, "0")}・50分
            </button>
          ))}
        </div>
      )}

      {phase === "active" && current && paper && (
        <form className={styles.practice} onSubmit={submit}>
          <article className={styles.termCard}>
            <div><span>QUESTION {position + 1} / {paper.termIds.length}</span><small>残り {formatClock(remainingSeconds)}</small></div>
            <h2>{current.term}</h2>
            <p>何層かを選び、何をするプロトコルか20文字以上で説明してください。層は解答まで表示しません。</p>
          </article>

          <section className={styles.answerSection}>
            <div className={styles.layerGrid} role="radiogroup" aria-label="OSI層">
              {LAYERS.map((layer) => (
                <button
                  key={layer.value}
                  type="button"
                  role="radio"
                  aria-checked={layerChoice === layer.value}
                  className={layerChoice === layer.value ? styles.selectedLayer : ""}
                  disabled={Boolean(evaluation)}
                  onClick={() => setLayerChoice(layer.value)}
                >
                  <strong>{layer.label.split(" ")[0]}</strong><span>{layer.label.split(" ").slice(1).join(" ")}</span>
                </button>
              ))}
            </div>
            <label className={styles.textareaLabel} htmlFor="network-written-mock-answer">
              <textarea
                id="network-written-mock-answer"
                rows={6}
                value={answer}
                disabled={Boolean(evaluation)}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={`${current.term}は、……するための……です。`}
              />
              <span className={characterCount >= 20 ? styles.counterReady : ""}><strong>{characterCount}</strong> / 20文字</span>
            </label>
            {!evaluation && <button className={styles.submit} type="submit" disabled={layerChoice === null || characterCount === 0}>採点する →</button>}
          </section>

          {evaluation && (
            <section className={`${styles.feedback} ${evaluation.qualified ? styles.feedbackQualified : styles.feedbackRetry}`} aria-live="polite">
              <div className={styles.scoreBlock}>
                <span>AUTO CHECK</span><strong>{evaluation.estimatedScore}<small> / 10点</small></strong>
                <h3>{evaluation.qualified ? "3条件クリア" : "答案を要復習"}</h3>
              </div>
              <div className={styles.answerGuide}>
                <section><span>正しい層</span><h3>{current.layerLabel}</h3><p>{current.layerReason}</p></section>
                <section><span>模範解答</span>{current.fullName && <p><b>正式名称：</b>{current.fullName}</p>}<p className={styles.modelAnswer}>{current.modelAnswer}</p></section>
              </div>
              <div className={styles.feedbackActions}><button type="button" onClick={nextQuestion}>{position + 1 === paper.termIds.length ? "結果を見る" : "次の問題へ →"}</button></div>
            </section>
          )}
        </form>
      )}

      {phase === "result" && paper && (
        <section className={`${styles.feedback} ${score >= 60 ? styles.feedbackQualified : styles.feedbackRetry}`} aria-live="polite">
          <div className={styles.scoreBlock}><span>RESULT</span><strong>{score}<small> / 100点</small></strong><h3>{score >= 60 ? "合格ライン到達" : "60点まで要復習"}</h3><p>解答済み {results.length} / {paper.termIds.length}語</p></div>
          <div className={styles.checks}>
            {paper.termIds.map((termId, index) => {
              const term = termsById.get(termId);
              const result = results.find((item) => item.termId === termId);
              return <div key={termId} data-ok={result?.qualified ?? false}><b>{result?.score ?? 0}</b><span>Q{index + 1} {term?.term}</span><small>{result ? "点" : "未回答"}</small></div>;
            })}
          </div>
          <div className={styles.feedbackActions}><button type="button" onClick={() => startMock(paper.id)}>同じ模試を再挑戦</button><button type="button" onClick={() => setPhase("setup")}>別の模試を選ぶ</button></div>
        </section>
      )}
    </section>
  );
}
