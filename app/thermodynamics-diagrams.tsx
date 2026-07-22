import { useId, type ReactNode } from "react";

export type ThermodynamicsDiagramKind =
  | "pv"
  | "ts"
  | "hs"
  | "piston"
  | "otto-pv"
  | "carnot-pv"
  | "carnot-ts"
  | "refrigeration-cycle"
  | "entropy-transfer"
  | "reversed-carnot-ts";

type DiagramProps = {
  kind: ThermodynamicsDiagramKind;
  solution?: boolean;
  title?: string;
  className?: string;
};

type AxisDiagramKind = Exclude<ThermodynamicsDiagramKind, "piston" | "refrigeration-cycle" | "entropy-transfer">;

const axisLabels: Record<AxisDiagramKind, [string, string]> = {
  pv: ["V", "P"],
  ts: ["S", "T"],
  hs: ["s", "h"],
  "otto-pv": ["V", "P"],
  "carnot-pv": ["V", "P"],
  "carnot-ts": ["S", "T"],
  "reversed-carnot-ts": ["S", "T"],
};

function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} markerHeight="7" markerWidth="7" orient="auto-start-reverse" refX="5" refY="3.5">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="currentColor" />
      </marker>
    </defs>
  );
}

function StatePoint({ x, y, label, labelX, labelY }: { x: number; y: number; label: string; labelX: number; labelY: number }) {
  return (
    <>
      <circle cx={x} cy={y} r="4" />
      <text x={labelX} y={labelY} fontWeight="700">{label}</text>
    </>
  );
}

function OttoPvSolution({ arrowId }: { arrowId: string }) {
  return (
    <g className="thermodynamics-diagram-solution">
      <path d="M180 145 C145 132 108 111 76 96" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M76 96 V48" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M76 48 C109 54 147 68 180 84" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M180 84 V145" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <StatePoint x={180} y={145} label="1" labelX={187} labelY={151} />
      <StatePoint x={76} y={96} label="2" labelX={59} labelY={102} />
      <StatePoint x={76} y={48} label="3" labelX={59} labelY={45} />
      <StatePoint x={180} y={84} label="4" labelX={187} labelY={86} />
      <text x="96" y="127">断熱圧縮</text>
      <text x="48" y="75" textAnchor="end">等容加熱</text>
      <text x="111" y="53">断熱膨張</text>
      <text x="188" y="117">等容放熱</text>
    </g>
  );
}

function CarnotPvSolution({ arrowId }: { arrowId: string }) {
  return (
    <g className="thermodynamics-diagram-solution">
      <path d="M70 50 C88 55 106 61 125 68" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M125 68 C141 83 159 108 180 130" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M180 130 C156 124 134 118 112 112" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M112 112 C99 96 85 73 70 50" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <StatePoint x={70} y={50} label="1" labelX={55} labelY={46} />
      <StatePoint x={125} y={68} label="2" labelX={130} labelY={63} />
      <StatePoint x={180} y={130} label="3" labelX={187} labelY={136} />
      <StatePoint x={112} y={112} label="4" labelX={96} labelY={123} />
      <text x="91" y="43">高温等温膨張 Q₁</text>
      <text x="157" y="90">断熱膨張</text>
      <text x="131" y="145">低温等温圧縮 Q₂</text>
      <text x="52" y="91">断熱圧縮</text>
    </g>
  );
}

function CarnotTsSolution({ arrowId }: { arrowId: string }) {
  return (
    <g className="thermodynamics-diagram-solution">
      <path d="M72 55 H176" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M176 55 V135" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M176 135 H72" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M72 135 V55" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <StatePoint x={72} y={55} label="1" labelX={57} labelY={51} />
      <StatePoint x={176} y={55} label="2" labelX={182} labelY={51} />
      <StatePoint x={176} y={135} label="3" labelX={182} labelY={142} />
      <StatePoint x={72} y={135} label="4" labelX={57} labelY={142} />
      <text x="124" y="45" textAnchor="middle">高温等温膨張 Q₁</text>
      <text x="183" y="98">断熱膨張</text>
      <text x="124" y="153" textAnchor="middle">低温等温圧縮 Q₂</text>
      <text x="64" y="98" textAnchor="end">断熱圧縮</text>
      <text x="51" y="59" textAnchor="end">T₁</text>
      <text x="51" y="139" textAnchor="end">T₂</text>
    </g>
  );
}

function ReversedCarnotTsSolution({ arrowId }: { arrowId: string }) {
  return (
    <g className="thermodynamics-diagram-solution">
      <path d="M176 135 V55" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M176 55 H72" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M72 55 V135" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <path d="M72 135 H176" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
      <StatePoint x={176} y={135} label="1" labelX={182} labelY={142} />
      <StatePoint x={176} y={55} label="2" labelX={182} labelY={51} />
      <StatePoint x={72} y={55} label="3" labelX={57} labelY={51} />
      <StatePoint x={72} y={135} label="4" labelX={57} labelY={142} />
      <text x="124" y="45" textAnchor="middle">高温等温放熱 Q₁</text>
      <text x="183" y="98">等エントロピー圧縮</text>
      <text x="124" y="153" textAnchor="middle">低温等温吸熱 Q₂</text>
      <text x="64" y="98" textAnchor="end">等エントロピー膨張</text>
      <text x="51" y="59" textAnchor="end">T₁</text>
      <text x="51" y="139" textAnchor="end">T₂</text>
    </g>
  );
}

function AxisDiagram({ kind, solution, arrowId }: { kind: AxisDiagramKind; solution: boolean; arrowId: string }) {
  const [horizontal, vertical] = axisLabels[kind];
  let solutionPath: ReactNode = null;

  if (solution && kind === "pv") {
    solutionPath = (
      <g className="thermodynamics-diagram-solution">
        <path d="M58 145 C82 106 120 77 182 60" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
        <circle cx="58" cy="145" r="4" /><circle cx="182" cy="60" r="4" />
        <text x="43" y="163">1</text><text x="188" y="58">2</text>
      </g>
    );
  } else if (solution && kind === "ts") {
    solutionPath = (
      <g className="thermodynamics-diagram-solution">
        <path d="M62 145 L62 65 L176 65 L176 145 L62 145" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M62 106 L62 72" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
        <path d="M115 65 L167 65" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
        <text x="48" y="159">1</text><text x="48" y="60">2</text><text x="181" y="60">3</text><text x="181" y="159">4</text>
      </g>
    );
  } else if (solution && kind === "hs") {
    solutionPath = (
      <g className="thermodynamics-diagram-solution">
        <path d="M65 147 L65 67 C101 82 139 83 178 64" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
        <circle cx="65" cy="147" r="4" /><circle cx="65" cy="67" r="4" /><circle cx="178" cy="64" r="4" />
        <text x="49" y="160">1</text><text x="49" y="62">2</text><text x="183" y="60">3</text>
      </g>
    );
  } else if (solution && kind === "otto-pv") {
    solutionPath = <OttoPvSolution arrowId={arrowId} />;
  } else if (solution && kind === "carnot-pv") {
    solutionPath = <CarnotPvSolution arrowId={arrowId} />;
  } else if (solution && kind === "carnot-ts") {
    solutionPath = <CarnotTsSolution arrowId={arrowId} />;
  } else if (solution && kind === "reversed-carnot-ts") {
    solutionPath = <ReversedCarnotTsSolution arrowId={arrowId} />;
  }

  return (
    <svg viewBox="0 0 240 190" role="img" aria-label={`${vertical}-${horizontal}線図${solution ? "の模範例" : "の空欄"}`}>
      <ArrowMarker id={arrowId} />
      <path d="M38 18 V165 H222" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M38 18 L33 28 M38 18 L43 28 M222 165 L212 160 M222 165 L212 170" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="15" y="25" fontWeight="700">{vertical}</text>
      <text x="218" y="184" fontWeight="700">{horizontal}</text>
      {!solution && <text x="130" y="101" opacity="0.42" textAnchor="middle">ここに過程を描く</text>}
      {solutionPath}
    </svg>
  );
}

function PistonDiagram({ solution, arrowId }: { solution: boolean; arrowId: string }) {
  return (
    <svg viewBox="0 0 260 190" role="img" aria-label={`ピストン・シリンダ概略図${solution ? "と寸法の見方" : ""}`}>
      <ArrowMarker id={arrowId} />
      <path d="M64 22 V166 H198 V22" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="67" y="92" width="128" height="13" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M131 91 V45 M112 45 H150" fill="none" stroke="currentColor" strokeWidth="5" />
      <path d="M76 119 H186" stroke="currentColor" strokeDasharray="5 4" />
      <text x="205" y="101">上死点</text><text x="205" y="124">下死点</text>
      {solution ? (
        <g className="thermodynamics-diagram-solution">
          <path d="M48 94 V120" fill="none" markerEnd={`url(#${arrowId})`} markerStart={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" />
          <text x="13" y="110">行程</text>
          <path d="M68 154 H194" fill="none" markerEnd={`url(#${arrowId})`} markerStart={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" />
          <text x="112" y="178">内径</text>
        </g>
      ) : <text x="130" y="143" opacity="0.42" textAnchor="middle">寸法を整理する</text>}
    </svg>
  );
}


function EntropyTransferDiagram({ solution, arrowId }: { solution: boolean; arrowId: string }) {
  return (
    <svg viewBox="0 0 420 220" role="img" aria-label={"高温熱源から低温熱源への熱移動図" + (solution ? "の符号付き模範例" : "の空欄")}>
      <ArrowMarker id={arrowId} />
      <rect x="24" y="58" width="132" height="82" rx="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="264" y="58" width="132" height="82" rx="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M160 99 H255" fill="none" markerEnd={"url(#" + arrowId + ")"} stroke="currentColor" strokeWidth="3" />
      <text x="208" y="88" textAnchor="middle" fontWeight="700">Q</text>
      {solution ? (
        <g className="thermodynamics-diagram-solution">
          <text x="90" y="83" textAnchor="middle" fontWeight="700">高温熱源 T₁</text>
          <text x="90" y="112" textAnchor="middle">ΔS₁ = −Q/T₁</text>
          <text x="330" y="83" textAnchor="middle" fontWeight="700">低温熱源 T₂</text>
          <text x="330" y="112" textAnchor="middle">ΔS₂ = +Q/T₂</text>
          <text x="210" y="180" textAnchor="middle" fontWeight="700">T₁ &gt; T₂ ⇒ ΔS全体 &gt; 0（不可逆）</text>
        </g>
      ) : (
        <g opacity="0.48">
          <text x="90" y="102" textAnchor="middle">熱を失う側</text>
          <text x="330" y="102" textAnchor="middle">熱を受け取る側</text>
          <text x="210" y="180" textAnchor="middle">各符号と全体の増減を記入</text>
        </g>
      )}
    </svg>
  );
}

function RefrigerationCycleDiagram({ solution, arrowId }: { solution: boolean; arrowId: string }) {
  return (
    <svg viewBox="0 0 420 250" role="img" aria-label={`蒸気圧縮冷凍サイクル装置図${solution ? "の模範例" : "の空欄"}`}>
      <ArrowMarker id={arrowId} />
      <rect x="30" y="95" width="95" height="54" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="160" y="28" width="100" height="54" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="300" y="95" width="90" height="54" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="160" y="168" width="100" height="54" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M125 112 L160 70" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2.5" />
      <path d="M260 70 L300 112" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2.5" />
      <path d="M345 149 L260 190" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2.5" />
      <path d="M160 200 L78 149" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2.5" />
      {!solution && (
        <g opacity="0.48">
          <text x="77" y="128" textAnchor="middle">①</text>
          <text x="210" y="61" textAnchor="middle">②</text>
          <text x="345" y="128" textAnchor="middle">③</text>
          <text x="210" y="201" textAnchor="middle">④</text>
          <text x="210" y="133" textAnchor="middle">機器名・Q₁・Q₂・Wを記入</text>
        </g>
      )}
      {solution && (
        <g className="thermodynamics-diagram-solution">
          <text x="77" y="126" textAnchor="middle" fontWeight="700">圧縮機</text>
          <text x="210" y="59" textAnchor="middle" fontWeight="700">凝縮器</text>
          <text x="345" y="126" textAnchor="middle" fontWeight="700">膨張弁</text>
          <text x="210" y="199" textAnchor="middle" fontWeight="700">蒸発器</text>
          <path d="M4 122 H28" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
          <text x="5" y="111" fontWeight="700">W入力</text>
          <path d="M210 27 V4" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
          <text x="225" y="17" fontWeight="700">Q₁ 放出</text>
          <path d="M210 246 V224" fill="none" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="3" />
          <text x="225" y="241" fontWeight="700">Q₂ 吸収</text>
          <text x="323" y="165">減圧・h₃=h₄</text>
          <text x="151" y="115">Q₁=Q₂+W</text>
        </g>
      )}
    </svg>
  );
}

export default function ThermodynamicsDiagram({ kind, solution = false, title, className }: DiagramProps) {
  const arrowId = `thermo-arrow-${useId().replace(/:/g, "")}`;
  return (
    <figure className={className}>
      {title && <figcaption>{title}</figcaption>}
      {kind === "piston"
        ? <PistonDiagram solution={solution} arrowId={arrowId} />
        : kind === "entropy-transfer"
          ? <EntropyTransferDiagram solution={solution} arrowId={arrowId} />
          : kind === "refrigeration-cycle"
          ? <RefrigerationCycleDiagram solution={solution} arrowId={arrowId} />
          : <AxisDiagram kind={kind} solution={solution} arrowId={arrowId} />}
    </figure>
  );
}
