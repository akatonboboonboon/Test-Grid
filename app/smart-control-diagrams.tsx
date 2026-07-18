"use client";

import { useId, type ReactNode } from "react";
import SmartControlResponseGraph from "./smart-control-response-graph";
import {
  SMART_CONTROL_DIAGRAM_SOLUTION_TEX,
  type SmartControlDiagramId,
} from "./smart-control-figure-data";
import { DisplayMath } from "./statistics-math";
import styles from "./smart-control-diagrams.module.css";

type Props = { diagramId: SmartControlDiagramId; solution?: boolean; title?: string; className?: string };

function Defs({ id }: { id: string }) {
  return <defs>
    <marker id={id} markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor" /></marker>
    <pattern id={id + "-grid"} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth=".55" opacity=".16" /></pattern>
  </defs>;
}

function Line({ d, marker, dashed }: { d: string; marker?: string; dashed?: boolean }) {
  return <path d={d} fill="none" markerEnd={marker ? "url(#" + marker + ")" : undefined} stroke="currentColor" strokeDasharray={dashed ? "7 5" : undefined} strokeWidth="2.5" />;
}

function Block({ x, y, width = 104, label }: { x: number; y: number; width?: number; label: string }) {
  return <g><rect x={x} y={y} width={width} height="52" rx="4" fill="#fff" stroke="currentColor" strokeWidth="2.4" /><text x={x + width / 2} y={y + 32} textAnchor="middle" fontSize="19" fontWeight="800">{label}</text></g>;
}

function Sum({ x, y, lower = "−" }: { x: number; y: number; lower?: string }) {
  return <g><circle cx={x} cy={y} r="19" fill="#fff" stroke="currentColor" strokeWidth="2.4" /><text x={x - 5} y={y - 5} fontSize="14" fontWeight="900">+</text><text x={x - 5} y={y + 15} fontSize="14" fontWeight="900">{lower}</text></g>;
}

function ResponseComparison({ kind, solution, id }: { kind: "response-figure52" | "response-figure53"; solution: boolean; id: string }) {
  const monotone = kind === "response-figure52";
  return <svg viewBox="0 0 640 300" role="img" aria-label={monotone ? "図5.2の行き過ぎがない三つの応答曲線" : "図5.3の行き過ぎと減衰を比べる三つの応答曲線"}>
    <Defs id={id} /><rect x="68" y="22" width="536" height="225" fill={"url(#" + id + "-grid)"} /><Line d="M68 22V247H608" marker={id} /><text x="44" y="29" fontSize="19" fontWeight="800">y</text><text x="607" y="271" fontSize="19" fontWeight="800">t</text>
    <Line d="M68 82H604" dashed /><text x="58" y="87" textAnchor="end" fontSize="17">y∞</text>
    {monotone ? <>
      <path d="M70 230 C100 139 135 100 205 85 C260 74 360 82 600 82" fill="none" stroke="#276ef1" strokeWidth="4" />
      <path d="M70 230 C135 171 185 119 274 92 C345 72 430 82 600 82" fill="none" stroke="#009a72" strokeWidth="4" />
      <path d="M70 230 C165 201 257 147 360 108 C445 76 520 83 600 82" fill="none" stroke="#dc3b60" strokeWidth="4" />
      <text x="215" y="67" fontSize="18" fontWeight="900">yₐ</text><text x="298" y="112" fontSize="18" fontWeight="900">yᵦ</text><text x="390" y="132" fontSize="18" fontWeight="900">y𝒸</text>
      {solution && <text x="330" y="286" textAnchor="middle" fontSize="18" fontWeight="900">速応性：yₐ ＞ yᵦ ＞ y𝒸　／　tₛ(yₐ) ＜ tₛ(yᵦ) ＜ tₛ(y𝒸)</text>}
    </> : <>
      <path d="M70 230 C105 115 145 64 195 86 C235 104 270 80 315 82 C390 82 480 82 600 82" fill="none" stroke="#276ef1" strokeWidth="3.6" />
      <path d="M70 230 C102 73 145 29 198 91 C240 140 286 47 342 88 C390 122 438 72 493 83 C535 91 568 79 600 82" fill="none" stroke="#009a72" strokeWidth="3.6" />
      <path d="M70 230 C96 45 137 10 190 106 C236 189 283 17 342 104 C395 183 448 28 503 98 C544 149 575 56 600 85" fill="none" stroke="#dc3b60" strokeWidth="3.6" />
      <text x="207" y="67" fontSize="18" fontWeight="900">yₐ</text><text x="200" y="28" fontSize="18" fontWeight="900">yᵦ</text><text x="143" y="18" fontSize="18" fontWeight="900">y𝒸</text>
      {solution && <text x="330" y="286" textAnchor="middle" fontSize="18" fontWeight="900">yₐ → yᵦ → y𝒸 の順に行き過ぎ・残留振動・整定時間が大きい</text>}
    </>}
  </svg>;
}

function PolePlane({ solution, id }: { solution: boolean; id: string }) {
  return <svg viewBox="0 0 620 280" role="img" aria-label={solution ? "安定領域を示した複素s平面" : "求めた極を配置する複素s平面"}>
    <Defs id={id} />{solution && <rect x="42" y="24" width="268" height="220" fill="#dff7ec" />}<rect x="42" y="24" width="536" height="220" fill={"url(#" + id + "-grid)"} />
    <Line d="M42 136H582" marker={id} /><Line d="M310 246V20" marker={id} /><text x="580" y="161" fontSize="18" fontWeight="800">Re(s)</text><text x="322" y="26" fontSize="18" fontWeight="800">Im(s)</text><text x="310" y="161" textAnchor="middle">0</text>
    <text x="168" y="264" textAnchor="middle">左半平面</text><text x="452" y="264" textAnchor="middle">右半平面</text>
    {solution ? <><text x="168" y="65" textAnchor="middle" fontSize="20" fontWeight="900">安定領域</text><text x="168" y="91" textAnchor="middle" fontSize="17">Re(pᵢ) ＜ 0</text><text x="452" y="65" textAnchor="middle" fontSize="17" fontWeight="800">極が1つでも入ると不安定</text><text x="310" y="111" textAnchor="middle" fontSize="15">虚軸上も安定に含めない</text></> : <text x="310" y="54" textAnchor="middle" fontSize="18" fontWeight="850">分母 = 0 で求めた極を × で配置する</text>}
  </svg>;
}

function Feedback({ positive, series, id }: { positive?: boolean; series?: boolean; id: string }) {
  const lower = positive ? "+" : "−";
  return <svg viewBox="0 0 680 285" role="img" aria-label={(positive ? "正" : "負") + "帰還のブロック線図"}>
    <Defs id={id} /><text x="18" y="105" fontSize="18" fontWeight="800">U(s)</text><Line d="M66 98H130" marker={id} /><Sum x={155} y={98} lower={lower} /><Line d="M175 98H230" marker={id} />
    {series ? <><Block x={230} y={72} width={105} label="G₁(s)" /><Line d="M335 98H374" marker={id} /><Block x={374} y={72} width={105} label="G₂(s)" /><Line d="M479 98H620" marker={id} /></> : <><Block x={230} y={72} width={150} label="G(s)" /><Line d="M380 98H620" marker={id} /></>}
    <circle cx="566" cy="98" r="4" fill="currentColor" /><text x="626" y="105" fontSize="18" fontWeight="800">Y(s)</text><Line d="M566 98V220H408" marker={id} /><Block x={285} y={194} width={123} label="H(s)" /><Line d="M285 220H155V119" marker={id} />
  </svg>;
}

function Series({ id }: { id: string }) {
  return <svg viewBox="0 0 620 170" role="img" aria-label="二つのブロックの直列結合"><Defs id={id} /><text x="22" y="103" fontSize="18" fontWeight="800">U</text><Line d="M55 96H135" marker={id} /><Block x={135} y={70} width={120} label="G₁" /><Line d="M255 96H345" marker={id} /><Block x={345} y={70} width={120} label="G₂" /><Line d="M465 96H565" marker={id} /><text x="574" y="103" fontSize="18" fontWeight="800">Y</text></svg>;
}

function Parallel({ id }: { id: string }) {
  return <svg viewBox="0 0 650 245" role="img" aria-label="二つのブロックの並列結合"><Defs id={id} /><text x="22" y="145" fontSize="18" fontWeight="800">U</text><Line d="M55 138H105V73H178" marker={id} /><Line d="M105 138V203H178" marker={id} /><Block x={178} y={47} width={125} label="G₁" /><Block x={178} y={177} width={125} label="G₂" /><Line d="M303 73H445V119" marker={id} /><Line d="M303 203H445V157" marker={id} /><Sum x={445} y={138} lower="+" /><Line d="M465 138H580" marker={id} /><text x="590" y="145" fontSize="18" fontWeight="800">Y</text></svg>;
}

function Shift({ kind, solution, id }: { kind: "summing-shift" | "pickoff-shift"; solution: boolean; id: string }) {
  const summing = kind === "summing-shift";
  return <svg viewBox="0 0 720 310" role="img" aria-label={(summing ? "加え合わせ点" : "引き出し点") + "の等価移動"}><Defs id={id} />
    <text x="24" y="38" fontSize="16" fontWeight="900">移動前</text><Line d="M45 88H126" marker={id} /><Block x={126} y={62} width={110} label="G" /><Line d="M236 88H330" marker={id} />{summing ? <Sum x={355} y={88} /> : <circle cx="355" cy="88" r="5" fill="currentColor" />}<Line d="M375 88H650" marker={id} /><Line d={summing ? "M355 25V68" : "M355 88V132H525"} marker={id} />
    <text x="24" y="188" fontSize="16" fontWeight="900">前へ移動後（等価）</text><Line d="M45 238H120" marker={id} />{summing ? <Sum x={145} y={238} /> : <circle cx="145" cy="238" r="5" fill="currentColor" />}<Line d="M165 238H245" marker={id} /><Block x={245} y={212} width={110} label="G" /><Line d="M355 238H650" marker={id} />
    {summing ? <><Line d="M145 175V218" marker={id} /><rect x="92" y="178" width="106" height="32" rx="4" fill="#fff" stroke="currentColor" strokeWidth="2" /><text x="145" y="200" textAnchor="middle" fontSize="17" fontWeight="900">{solution ? "G⁻¹" : "？"}</text></> : <><Line d="M145 238V282H525" marker={id} /><rect x="287" y="266" width="106" height="32" rx="4" fill="#fff" stroke="currentColor" strokeWidth="2" /><text x="340" y="288" textAnchor="middle" fontSize="17" fontWeight="900">{solution ? "G" : "？"}</text></>}
  </svg>;
}

function Nested({ id }: { id: string }) {
  return <svg viewBox="0 0 760 275" role="img" aria-label="G2とG3の内側帰還ループをG1と直列にした線図"><Defs id={id} /><text x="18" y="117" fontSize="18" fontWeight="800">U</text><Line d="M48 110H120" marker={id} /><Block x={120} y={84} label="G₁" /><Line d="M224 110H292" marker={id} /><Sum x={317} y={110} /><Line d="M337 110H405" marker={id} /><Block x={405} y={84} width={110} label="G₂" /><Line d="M515 110H695" marker={id} /><text x="705" y="117" fontSize="18" fontWeight="800">Y</text><circle cx="620" cy="110" r="4" fill="currentColor" /><Line d="M620 110V232H500" marker={id} /><Block x={390} y={206} width={110} label="G₃" /><Line d="M390 232H317V131" marker={id} /></svg>;
}

function Static({ diagramId, solution, id }: { diagramId: Exclude<SmartControlDiagramId, "response-figure51">; solution: boolean; id: string }): ReactNode {
  if (diagramId === "response-figure52" || diagramId === "response-figure53") return <ResponseComparison kind={diagramId} solution={solution} id={id} />;
  if (diagramId === "pole-plane") return <PolePlane solution={solution} id={id} />;
  if (diagramId === "negative-feedback") return <Feedback id={id} />;
  if (diagramId === "positive-feedback") return <Feedback positive id={id} />;
  if (diagramId === "series-feedback") return <Feedback series id={id} />;
  if (diagramId === "series-block") return <Series id={id} />;
  if (diagramId === "parallel-block") return <Parallel id={id} />;
  if (diagramId === "summing-shift" || diagramId === "pickoff-shift") return <Shift kind={diagramId} solution={solution} id={id} />;
  if (diagramId === "block-shifts") return <><Shift kind="summing-shift" solution={solution} id={id + "-sum"} /><Shift kind="pickoff-shift" solution={solution} id={id + "-pick"} /></>;
  return <Nested id={id} />;
}

export default function SmartControlDiagram({ diagramId, solution = false, title, className }: Props) {
  const id = "smart-control-arrow-" + useId().replace(/:/g, "");
  if (diagramId === "response-figure51") return <SmartControlResponseGraph answerVisibility={solution ? "shown" : "hidden"} className={styles.response + (className ? " " + className : "")} compact title={title ?? (solution ? "図5.1：記号と基準値" : "図5.1：応答曲線から位置を読み取る")} />;
  const solutionTex = SMART_CONTROL_DIAGRAM_SOLUTION_TEX[
    diagramId as keyof typeof SMART_CONTROL_DIAGRAM_SOLUTION_TEX
  ];
  return <figure className={styles.figure + (className ? " " + className : "")}>{title && <figcaption>{title}</figcaption>}<Static diagramId={diagramId} solution={solution} id={id} />{solution && solutionTex && <DisplayMath tex={solutionTex} />}</figure>;
}
