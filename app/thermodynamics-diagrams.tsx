import { useId, type ReactNode } from "react";

export type ThermodynamicsDiagramKind = "pv" | "ts" | "hs" | "piston";

type DiagramProps = {
  kind: ThermodynamicsDiagramKind;
  solution?: boolean;
  title?: string;
  className?: string;
};

const axisLabels: Record<Exclude<ThermodynamicsDiagramKind, "piston">, [string, string]> = {
  pv: ["V", "P"],
  ts: ["S", "T"],
  hs: ["s", "h"],
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

function AxisDiagram({ kind, solution, arrowId }: { kind: Exclude<ThermodynamicsDiagramKind, "piston">; solution: boolean; arrowId: string }) {
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

export default function ThermodynamicsDiagram({ kind, solution = false, title, className }: DiagramProps) {
  const arrowId = `thermo-arrow-${useId().replace(/:/g, "")}`;
  return (
    <figure className={className}>
      {title && <figcaption>{title}</figcaption>}
      {kind === "piston" ? <PistonDiagram solution={solution} arrowId={arrowId} /> : <AxisDiagram kind={kind} solution={solution} arrowId={arrowId} />}
    </figure>
  );
}
