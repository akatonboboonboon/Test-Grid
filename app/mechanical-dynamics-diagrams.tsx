import { useId, type ReactNode } from "react";

export type MechanicalDynamicsDiagramKind =
  | "spring-network"
  | "pinned-beam"
  | "simple-pendulum"
  | "single-spring-mass"
  | "damped-spring-mass"
  | "static-deflection"
  | "amplitude-decay";

type DiagramProps = {
  kind: MechanicalDynamicsDiagramKind | string;
  solution?: boolean;
  title?: string;
  className?: string;
};

const KNOWN_KINDS = new Set<MechanicalDynamicsDiagramKind>([
  "spring-network",
  "pinned-beam",
  "simple-pendulum",
  "single-spring-mass",
  "damped-spring-mass",
  "static-deflection",
  "amplitude-decay",
]);

function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} markerHeight="7" markerWidth="7" orient="auto-start-reverse" refX="5" refY="3.5">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="currentColor" />
      </marker>
    </defs>
  );
}

function Spring({ x, y, height = 58 }: { x: number; y: number; height?: number }) {
  const bottom = y + height;
  return <path d={`M${x} ${y} v7 l-8 6 16 7 -16 7 16 7 -16 7 8 6 v${Math.max(0, bottom - y - 54)}`} fill="none" stroke="currentColor" strokeWidth="2.4" />;
}

function Damper({ x, y, height = 58 }: { x: number; y: number; height?: number }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d={`M${x} ${y} v14 M${x - 12} ${y + 14} h24 v20 h-24 M${x} ${y + 18} v27 M${x - 9} ${y + 45} h18 M${x} ${y + 45} v${Math.max(0, height - 45)}`} />
    </g>
  );
}

function Ceiling({ y = 20 }: { y?: number }) {
  return (
    <g stroke="currentColor">
      <path d={`M35 ${y} H325`} strokeWidth="3" />
      {Array.from({ length: 13 }, (_, index) => <path key={index} d={`M${42 + index * 23} ${y} l-9 -9`} opacity="0.45" />)}
    </g>
  );
}

function VerticalSystem({ kind, arrowId }: { kind: MechanicalDynamicsDiagramKind; arrowId: string }) {
  const damped = kind === "damped-spring-mass";
  const staticDeflection = kind === "static-deflection";
  return (
    <svg viewBox="0 0 360 220" role="img" aria-label={damped ? "ばねとダンパを持つ一自由度振動系" : staticDeflection ? "鉛直ばねの静たわみ" : "ばね質量系"}>
      <ArrowMarker id={arrowId} />
      <Ceiling />
      <Spring x={damped ? 135 : 180} y={21} height={90} />
      {damped && <Damper x={225} y={21} height={90} />}
      <rect x="125" y="110" width="110" height="55" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x="180" y="145" textAnchor="middle" fontSize="20" fontWeight="700">m</text>
      <text x={damped ? 112 : 195} y="70" fontWeight="700">k</text>
      {damped && <text x="242" y="70" fontWeight="700">c</text>}
      <path d="M270 112 v48" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" />
      <text x="280" y="144" fontWeight="700">x</text>
      {staticDeflection && <><path d="M82 112 v48" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" /><text x="45" y="144" fontWeight="700">mg</text><text x="238" y="186">xₛₜ = mg/k</text></>}
    </svg>
  );
}

function SpringNetwork({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 360 250" role="img" aria-label="上側並列ばねと下側直列ばねを持つ質点系">
      <ArrowMarker id={arrowId} />
      <Ceiling />
      <Spring x={135} y={21} height={75} /><Spring x={225} y={21} height={75} />
      <text x="108" y="61" fontWeight="700">2k</text><text x="242" y="61" fontWeight="700">k</text>
      <rect x="125" y="96" width="110" height="48" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x="180" y="126" textAnchor="middle" fontSize="19" fontWeight="700">m</text>
      <Spring x={180} y={144} height={43} /><circle cx="180" cy="190" r="3" fill="currentColor" /><Spring x={180} y={190} height={42} />
      <path d="M120 232 H240" stroke="currentColor" strokeWidth="3" />
      <text x="199" y="171" fontWeight="700">k</text><text x="199" y="218" fontWeight="700">k</text>
      <path d="M278 98 v45" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" /><text x="288" y="126" fontWeight="700">x</text>
    </svg>
  );
}

function PinnedBeam({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 390 235" role="img" aria-label="左端ピン支持された梁と質点、ダンパ、ばね">
      <ArrowMarker id={arrowId} />
      <path d="M45 78 H345" stroke="currentColor" strokeWidth="8" />
      <circle cx="45" cy="78" r="7" fill="#fff" stroke="currentColor" strokeWidth="2" />
      <path d="M45 86 l-24 30 h48 z M12 119 h66" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="180" cy="78" r="17" fill="#fff" stroke="currentColor" strokeWidth="3" /><text x="180" y="84" textAnchor="middle" fontWeight="700">m</text>
      <Damper x={180} y={96} height={92} /><Spring x={345} y={82} height={106} />
      <path d="M145 195 H375" stroke="currentColor" strokeWidth="3" />
      <text x="198" y="139" fontWeight="700">c</text><text x="361" y="139" fontWeight="700">k</text>
      <path d="M48 46 H177" markerEnd={`url(#${arrowId})`} markerStart={`url(#${arrowId})`} stroke="currentColor" /><text x="110" y="38">r</text>
      <path d="M48 25 H342" markerEnd={`url(#${arrowId})`} markerStart={`url(#${arrowId})`} stroke="currentColor" /><text x="193" y="18">l</text>
    </svg>
  );
}

function Pendulum({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 330 235" role="img" aria-label="長さlの単振り子">
      <ArrowMarker id={arrowId} />
      <path d="M70 23 H260" stroke="currentColor" strokeWidth="3" /><circle cx="165" cy="30" r="5" fill="currentColor" />
      <path d="M165 30 V195" stroke="currentColor" strokeDasharray="5 5" opacity="0.5" />
      <path d="M165 30 L235 172" stroke="currentColor" strokeWidth="3" />
      <circle cx="235" cy="172" r="18" fill="#fff" stroke="currentColor" strokeWidth="3" /><text x="235" y="178" textAnchor="middle" fontWeight="700">m</text>
      <path d="M165 74 A46 46 0 0 1 187 70" fill="none" stroke="currentColor" strokeWidth="2" /><text x="180" y="59" fontWeight="700">θ</text>
      <text x="208" y="95" fontWeight="700">l</text>
      <path d="M235 191 v30" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" /><text x="249" y="215" fontWeight="700">mg</text>
    </svg>
  );
}

function AmplitudeDecay({ solution, arrowId }: { solution: boolean; arrowId: string }) {
  const wave: ReactNode = solution ? <path d="M38 104 C52 31 67 31 82 104 S111 165 126 104 S155 55 170 104 S199 143 214 104 S243 72 258 104 S287 129 302 104" fill="none" stroke="currentColor" strokeWidth="3" /> : null;
  return (
    <svg viewBox="0 0 340 215" role="img" aria-label={`減衰振動の振幅波形${solution ? "の模範例" : "の解答用座標"}`}>
      <ArrowMarker id={arrowId} />
      <path d="M28 20 V190 M18 105 H322" stroke="currentColor" strokeWidth="2" />
      <path d="M35 34 C105 48 195 76 312 97 M35 176 C105 162 195 134 312 113" fill="none" stroke="currentColor" strokeDasharray="6 4" opacity="0.55" />
      {wave}<text x="10" y="25" fontWeight="700">x</text><text x="317" y="123" fontWeight="700">t</text>
      {!solution && <text x="176" y="200" textAnchor="middle" opacity="0.48">振幅包絡線と周期を記入</text>}
    </svg>
  );
}

export default function MechanicalDynamicsDiagram({ kind, solution = false, title, className }: DiagramProps) {
  const arrowId = `mechanics-arrow-${useId().replace(/:/g, "")}`;
  if (!KNOWN_KINDS.has(kind as MechanicalDynamicsDiagramKind)) return null;
  const safeKind = kind as MechanicalDynamicsDiagramKind;
  let diagram: ReactNode;
  if (safeKind === "spring-network") diagram = <SpringNetwork arrowId={arrowId} />;
  else if (safeKind === "pinned-beam") diagram = <PinnedBeam arrowId={arrowId} />;
  else if (safeKind === "simple-pendulum") diagram = <Pendulum arrowId={arrowId} />;
  else if (safeKind === "amplitude-decay") diagram = <AmplitudeDecay solution={solution} arrowId={arrowId} />;
  else diagram = <VerticalSystem kind={safeKind} arrowId={arrowId} />;

  return <figure className={className}>{title && <figcaption>{title}</figcaption>}{diagram}</figure>;
}
