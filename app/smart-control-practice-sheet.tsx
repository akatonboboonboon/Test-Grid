"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  SMART_CONTROL_FEEDBACK_PRACTICE,
  SMART_CONTROL_INVERSE_LAPLACE_PRACTICE,
  SMART_CONTROL_PRACTICE_SHEET_META,
  SMART_CONTROL_PROVIDED_PRACTICE_IDS,
  type SmartControlPracticePole,
} from "./smart-control-practice-sheet-data";
import { DisplayMath, RichMathText } from "./statistics-math";
import styles from "./smart-control-practice-sheet.module.css";

function polePosition(value: number) {
  const clamped = Math.max(-4, Math.min(4, value));
  return ((clamped + 4) / 8) * 100;
}

function PolePlane({ poles, showPoles }: { poles: readonly SmartControlPracticePole[]; showPoles: boolean }) {
  return (
    <figure className={styles.poleFigure} aria-label={showPoles ? "解答の極を配置した複素s平面" : "極を書き込むための複素s平面"}>
      <figcaption>{showPoles ? "極の配置（×）" : "ここに極をプロット"}</figcaption>
      <div className={styles.polePlane}>
        <span className={styles.realLabel}>Re(s)</span>
        <span className={styles.imaginaryLabel}>Im(s)</span>
        <span className={styles.origin}>0</span>
        <span className={styles.leftHalf}>左半平面</span>
        <span className={styles.rightHalf}>右半平面</span>
        {showPoles && poles.map((pole, index) => {
          const pointStyle = {
            "--pole-x": `${polePosition(pole.re)}%`,
            "--pole-y": `${100 - polePosition(pole.im)}%`,
          } as CSSProperties;
          return (
            <span
              className={styles.polePoint}
              key={`${pole.label}-${index}`}
              style={pointStyle}
              title={`極 ${pole.label}`}
            >
              ×{pole.multiplicity && pole.multiplicity > 1 ? <sup>{pole.multiplicity}</sup> : null}
              <small>{pole.label}</small>
            </span>
          );
        })}
      </div>
    </figure>
  );
}

function UnityFeedbackDiagram() {
  return (
    <figure className={styles.feedbackFigure}>
      <figcaption>配布プリントの単位負帰還系</figcaption>
      <div className={styles.feedbackDiagram} role="img" aria-label="入力U(s)から加え合わせ点、K、G(s)、出力Y(s)を通り、出力を単位負帰還するブロック線図">
        <div className={styles.forwardPath}>
          <strong>U(s)</strong><span className={styles.arrow} aria-hidden="true" />
          <span className={styles.sum}><b>＋</b><i>−</i></span><span className={styles.arrow} aria-hidden="true" />
          <span className={styles.block}>K</span><span className={styles.arrow} aria-hidden="true" />
          <span className={styles.block}>G(s)</span><span className={styles.arrow} aria-hidden="true" />
          <strong>Y(s)</strong>
        </div>
        <div className={styles.returnPath} aria-hidden="true"><span>単位負帰還　H(s)=1</span></div>
      </div>
    </figure>
  );
}

function StabilityBadge({ kind, text }: { kind: "stable" | "marginal" | "unstable"; text: string }) {
  return <p className={`${styles.stability} ${styles[kind]}`}><strong>{kind === "stable" ? "安定" : kind === "marginal" ? "限界安定" : "不安定"}</strong>{text}</p>;
}

export default function SmartControlPracticeSheet() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const allRevealed = revealed.size === SMART_CONTROL_PROVIDED_PRACTICE_IDS.length;
  const answeredCount = useMemo(
    () => SMART_CONTROL_PROVIDED_PRACTICE_IDS.filter((id) => answers[id]?.trim()).length,
    [answers],
  );

  function toggleSolution(id: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllSolutions() {
    setRevealed(allRevealed ? new Set() : new Set(SMART_CONTROL_PROVIDED_PRACTICE_IDS));
  }

  function printSheet() {
    const cleanup = () => document.body.classList.remove("smart-practice-printing");
    document.body.classList.add("smart-practice-printing");
    window.addEventListener("afterprint", cleanup, { once: true });
    try { window.print(); } catch { cleanup(); }
  }

  return (
    <section className={styles.workspace} aria-labelledby="smart-provided-practice-title">
      <div className="english-panel-heading statistics-panel-heading">
        <div><span>PROVIDED PRACTICE / 13</span><h2 id="smart-provided-practice-title">先生配布の練習問題</h2></div>
        <p>逆ラプラス変換11問と、ゲインKを含む単位負帰還2問。式変形・極・安定判定まで一続きで練習します。</p>
      </div>

      <div className={styles.scopeNotice}>
        <span>NOT ADDITIONAL RANGE</span>
        <div><strong>追加範囲ではありません</strong><p>{SMART_CONTROL_PRACTICE_SHEET_META.note}</p><small>{SMART_CONTROL_PRACTICE_SHEET_META.sourceLabel}</small></div>
      </div>

      <div className={styles.toolbar}>
        <span>入力済み {answeredCount} / {SMART_CONTROL_PROVIDED_PRACTICE_IDS.length}</span>
        <button type="button" onClick={toggleAllSolutions}>{allRevealed ? "全解答を隠す" : "全解答を表示"}</button>
        <button type="button" onClick={printSheet}>問題用紙を印刷</button>
      </div>

      <article className={styles.majorSection}>
        <header>
          <div><span>MAJOR 01</span><h3>逆ラプラス変換・極・安定性</h3></div>
          <p>各関数を逆ラプラス変換し、伝達関数と見たときの極をガウス平面上へプロットして安定性を論ぜよ。</p>
        </header>

        <div className={styles.problemGrid}>
          {SMART_CONTROL_INVERSE_LAPLACE_PRACTICE.map((problem) => {
            const show = revealed.has(problem.id);
            return (
              <section className={styles.problemCard} key={problem.id} aria-labelledby={`${problem.id}-title`}>
                <div className={styles.problemHead}><span>大問1（{problem.number}）</span><small>逆変換・極・安定性</small></div>
                <h4 id={`${problem.id}-title`}><DisplayMath tex={problem.functionTex} /></h4>
                <div className={styles.taskChips}><span>① 逆変換</span><span>② 極をプロット</span><span>③ 安定判定</span></div>
                <PolePlane poles={problem.poles} showPoles={show} />
                <label className={styles.answerInput}>
                  <span>自分の解答・途中式</span>
                  <textarea
                    rows={5}
                    value={answers[problem.id] ?? ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [problem.id]: event.target.value }))}
                    placeholder="因数分解・部分分数・逆変換・極・判定理由を書く"
                  />
                </label>
                <button className={styles.revealButton} type="button" aria-expanded={show} onClick={() => toggleSolution(problem.id)}>{show ? "解答を隠す" : "解答・途中式を見る"}</button>
                {show && (
                  <div className={styles.solution}>
                    <span>FACTOR / COMPLETE THE SQUARE</span><DisplayMath tex={problem.factorizedTex} />
                    <span>PARTIAL FRACTIONS</span><DisplayMath tex={problem.decompositionTex} />
                    <span>INVERSE LAPLACE</span><DisplayMath tex={problem.inverseTex} />
                    <span>POLES</span><DisplayMath tex={problem.polesTex} />
                    <StabilityBadge kind={problem.stabilityKind} text={problem.stability} />
                    <ol>{problem.steps.map((step, index) => <li key={`${problem.id}-step-${index}`}><RichMathText text={step} /></li>)}</ol>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </article>

      <article className={styles.majorSection}>
        <header>
          <div><span>MAJOR 02</span><h3>フィードバック後の安定性</h3></div>
          <p>下図でK=1のときの安定性を調べ、さらに安定となるKの範囲を求めよ。安定化できない場合もある。</p>
        </header>
        <UnityFeedbackDiagram />
        <div className={styles.feedbackGrid}>
          {SMART_CONTROL_FEEDBACK_PRACTICE.map((problem) => {
            const show = revealed.has(problem.id);
            return (
              <section className={styles.problemCard} key={problem.id} aria-labelledby={`${problem.id}-title`}>
                <div className={styles.problemHead}><span>大問2（{problem.number}）</span><small>K=1・安定範囲</small></div>
                <h4 id={`${problem.id}-title`}><DisplayMath tex={problem.plantTex} /></h4>
                <div className={styles.taskChips}><span>① 閉ループ化</span><span>② K=1を判定</span><span>③ Kの範囲</span></div>
                <label className={styles.answerInput}>
                  <span>自分の解答・途中式</span>
                  <textarea
                    rows={6}
                    value={answers[problem.id] ?? ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [problem.id]: event.target.value }))}
                    placeholder="閉ループ伝達関数、特性方程式、極、Kの条件を書く"
                  />
                </label>
                <button className={styles.revealButton} type="button" aria-expanded={show} onClick={() => toggleSolution(problem.id)}>{show ? "解答を隠す" : "解答・途中式を見る"}</button>
                {show && (
                  <div className={styles.solution}>
                    <span>CLOSED LOOP</span><DisplayMath tex={problem.closedLoopTex} />
                    <span>CHARACTERISTIC EQUATION</span><DisplayMath tex={problem.characteristicTex} />
                    <span>K = 1</span><DisplayMath tex={problem.atOnePolesTex} />
                    <p>{problem.atOneVerdict}</p>
                    <span>STABLE K RANGE</span><DisplayMath tex={problem.stableRangeTex} />
                    <p className={styles.rangeAnswer}>{problem.stableRangeLabel}</p>
                    <ol>{problem.steps.map((step, index) => <li key={`${problem.id}-step-${index}`}><RichMathText text={step} /></li>)}</ol>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </article>
    </section>
  );
}
