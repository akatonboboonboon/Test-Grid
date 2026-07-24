import { useId, type ReactNode } from "react";

export type MechanicalDynamicsDiagramKind =
  | "spring-network"
  | "series-parallel-chain"
  | "pinned-beam"
  | "simple-pendulum"
  | "single-spring-mass"
  | "damped-spring-mass"
  | "static-deflection"
  | "amplitude-decay"
  | "cantilever-mass"
  | "torsional-shaft-disk"
  | "axial-bar-mass"
  | "spring-rigid-rod";

type DiagramProps = {
  kind: MechanicalDynamicsDiagramKind | string;
  solution?: boolean;
  title?: string;
  className?: string;
};

const KNOWN_KINDS = new Set<MechanicalDynamicsDiagramKind>([
  "spring-network",
  "series-parallel-chain",
  "pinned-beam",
  "simple-pendulum",
  "single-spring-mass",
  "damped-spring-mass",
  "static-deflection",
  "amplitude-decay",
  "cantilever-mass",
  "torsional-shaft-disk",
  "axial-bar-mass",
  "spring-rigid-rod",
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

function SeriesParallelChain({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 360 250" role="img" aria-label="ばねk1と並列ばねk2・k3を直列接続した質点系">
      <ArrowMarker id={arrowId} />
      <Ceiling />
      <Spring x={180} y={21} height={66} />
      <text x="198" y="58" fontWeight="700">k₁</text>
      <path d="M118 88 H242" stroke="currentColor" strokeWidth="3" />
      <Spring x={140} y={88} height={72} /><Spring x={220} y={88} height={72} />
      <text x="111" y="129" fontWeight="700">k₂</text><text x="238" y="129" fontWeight="700">k₃</text>
      <rect x="125" y="160" width="110" height="50" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x="180" y="191" textAnchor="middle" fontSize="19" fontWeight="700">m</text>
      <path d="M274 162 v46" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" />
      <text x="286" y="190" fontWeight="700">x</text>
    </svg>
  );
}
function CantileverMass({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 380 230" role="img" aria-label="片持ちはり先端に質量を取り付けた振動系">
      <ArrowMarker id={arrowId} />
      <path d="M52 28 V198" stroke="currentColor" strokeWidth="5" />
      {Array.from({ length: 8 }, (_, index) => <path key={index} d={`M52 ${38 + index * 21} l-18 13`} stroke="currentColor" opacity="0.45" />)}
      <path d="M55 112 H292" stroke="currentColor" strokeWidth="8" />
      <rect x="286" y="78" width="64" height="68" rx="4" fill="#fff" stroke="currentColor" strokeWidth="3" />
      <text x="318" y="119" textAnchor="middle" fontSize="20" fontWeight="700">m</text>
      <text x="150" y="96" fontWeight="700">EI</text>
      <path d="M59 184 H287" markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`} stroke="currentColor" />
      <text x="173" y="207" textAnchor="middle" fontWeight="700">l</text>
      <path d="M359 88 v54" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2" />
      <text x="365" y="121" fontWeight="700">x</text>
    </svg>
  );
}

function TorsionalShaftDisk({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 380 240" role="img" aria-label="ねじり軸の先端に円板を取り付けた回転振動系">
      <ArrowMarker id={arrowId} />
      <path d="M85 25 H295" stroke="currentColor" strokeWidth="5" />
      {Array.from({ length: 9 }, (_, index) => <path key={index} d={`M${100 + index * 22} 25 l-13 -13`} stroke="currentColor" opacity="0.45" />)}
      <path d="M190 28 V158" stroke="currentColor" strokeWidth="9" />
      <text x="207" y="92" fontWeight="700">GJₚ</text>
      <path d="M150 39 V154" markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`} stroke="currentColor" />
      <text x="136" y="101" fontWeight="700">l</text>
      <ellipse cx="190" cy="174" rx="74" ry="26" fill="#fff" stroke="currentColor" strokeWidth="3" />
      <text x="190" y="181" textAnchor="middle" fontWeight="700">Iθ</text>
      <path d="M123 190 A78 38 0 0 0 267 190" fill="none" stroke="currentColor" strokeWidth="2.5" markerEnd={`url(#${arrowId})`} />
      <text x="279" y="198" fontWeight="700">θ</text>
    </svg>
  );
}

function AxialBarMass({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 380 240" role="img" aria-label="引張棒の先端に質量を取り付けた軸方向振動系">
      <ArrowMarker id={arrowId} />
      <path d="M48 24 H332" stroke="currentColor" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, index) => <path key={index} d={`M${62 + index * 23} 24 l-13 -13`} stroke="currentColor" opacity="0.45" />)}
      <rect x="172" y="28" width="36" height="122" fill="#fff" stroke="currentColor" strokeWidth="3" />
      <text x="222" y="84" fontWeight="700">E, A</text>
      <path d="M142 35 V145" markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`} stroke="currentColor" />
      <text x="126" y="94" fontWeight="700">l</text>
      <rect x="132" y="150" width="116" height="54" rx="4" fill="#fff" stroke="currentColor" strokeWidth="3" />
      <text x="190" y="184" textAnchor="middle" fontSize="20" fontWeight="700">m</text>
      <path d="M278 154 V202" markerEnd={`url(#${arrowId})`} stroke="currentColor" strokeWidth="2.5" />
      <text x="290" y="184" fontWeight="700">x</text>
    </svg>
  );
}
function SpringRigidRod({ arrowId }: { arrowId: string }) {
  return (
    <svg viewBox="0 0 390 255" role="img" aria-label="上端支持の一様剛体棒に水平ばねを取り付けた振動系">
      <ArrowMarker id={arrowId} />
      <path d="M125 18 H265" stroke="currentColor" strokeWidth="3" />
      <circle cx="205" cy="31" r="6" fill="currentColor" />
      <path d="M205 31 L226 218" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      <text x="239" y="190" fontWeight="700">m</text>
      <path d="M42 76 V168" stroke="currentColor" strokeWidth="4" />
      {Array.from({ length: 5 }, (_, index) => <path key={index} d={`M42 ${85 + index * 18} l-14 10`} stroke="currentColor" opacity="0.45" />)}
      <path d="M44 117 h20 l10 -9 16 18 16 -18 16 18 16 -18 16 18 16 -18 16 18 16 -9 h47" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="119" y="99" fontWeight="700">k</text>
      <path d="M262 35 L282 214" markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`} stroke="currentColor" />
      <text x="289" y="132" fontWeight="700">l</text>
      <path d="M180 34 L190 117" markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`} stroke="currentColor" />
      <text x="160" y="82" fontWeight="700">h</text>
      <path d="M205 62 A34 34 0 0 1 220 60" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="219" y="52" fontWeight="700">θ</text>
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
  const cycleCount = 6;
  const left = 42;
  const right = 318;
  const centerY = 102;
  const samples = 240;
  const wavePath = Array.from({ length: samples + 1 }, (_, index) => {
    const phase = cycleCount * 2 * Math.PI * index / samples;
    const x = left + (right - left) * index / samples;
    const amplitude = 58 * Math.exp(-0.045 * phase);
    const y = centerY - amplitude * Math.cos(phase);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const upperEnvelope = Array.from({ length: 81 }, (_, index) => {
    const phase = cycleCount * 2 * Math.PI * index / 80;
    const x = left + (right - left) * index / 80;
    const y = centerY - 58 * Math.exp(-0.045 * phase);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const lowerEnvelope = Array.from({ length: 81 }, (_, index) => {
    const phase = cycleCount * 2 * Math.PI * index / 80;
    const x = left + (right - left) * index / 80;
    const y = centerY + 58 * Math.exp(-0.045 * phase);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const firstY = centerY - 58;
  const lastY = centerY - 58 * Math.exp(-0.045 * cycleCount * 2 * Math.PI);

  return (
    <svg viewBox="0 0 360 225" role="img" aria-label={`同符号ピーク間の周期数を数える減衰振動波形${solution ? "の模範例" : ""}`}>
      <ArrowMarker id={arrowId} />
      <path d="M28 18 V192 M18 102 H338" stroke="currentColor" strokeWidth="2" />
      <path d={`${upperEnvelope} ${lowerEnvelope}`} fill="none" stroke="currentColor" strokeDasharray="6 4" opacity="0.5" />
      <path d={wavePath} fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="10" y="24" fontWeight="700">x</text><text x="330" y="121" fontWeight="700">t</text>
      {Array.from({ length: cycleCount + 1 }, (_, index) => {
        const x = left + (right - left) * index / cycleCount;
        return <g key={index}><path d={`M${x} 174 v8`} stroke="currentColor" /><text x={x} y="198" textAnchor="middle" fontSize="11">{index}</text></g>;
      })}
      <circle cx={left} cy={firstY} r="4" fill="currentColor" /><circle cx={right} cy={lastY} r="4" fill="currentColor" />
      <text x={left + 4} y={firstY - 10} fontWeight="700">xᵢ</text><text x={right - 4} y={lastY - 10} textAnchor="end" fontWeight="700">xᵢ₊ₙ</text>
      <path d={`M${left} 210 H${right}`} markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`} stroke="currentColor" />
      <text x={(left + right) / 2} y="221" textAnchor="middle" fontWeight="700">{solution ? "n = 6 周期" : "目盛から n を数える"}</text>
    </svg>
  );
}
export default function MechanicalDynamicsDiagram({ kind, solution = false, title, className }: DiagramProps) {
  const arrowId = `mechanics-arrow-${useId().replace(/:/g, "")}`;
  if (!KNOWN_KINDS.has(kind as MechanicalDynamicsDiagramKind)) return null;
  const safeKind = kind as MechanicalDynamicsDiagramKind;
  let diagram: ReactNode;
  if (safeKind === "spring-network") diagram = <SpringNetwork arrowId={arrowId} />;
  else if (safeKind === "series-parallel-chain") diagram = <SeriesParallelChain arrowId={arrowId} />;
  else if (safeKind === "cantilever-mass") diagram = <CantileverMass arrowId={arrowId} />;
  else if (safeKind === "torsional-shaft-disk") diagram = <TorsionalShaftDisk arrowId={arrowId} />;
  else if (safeKind === "axial-bar-mass") diagram = <AxialBarMass arrowId={arrowId} />;
  else if (safeKind === "spring-rigid-rod") diagram = <SpringRigidRod arrowId={arrowId} />;
  else if (safeKind === "pinned-beam") diagram = <PinnedBeam arrowId={arrowId} />;
  else if (safeKind === "simple-pendulum") diagram = <Pendulum arrowId={arrowId} />;
  else if (safeKind === "amplitude-decay") diagram = <AmplitudeDecay solution={solution} arrowId={arrowId} />;
  else diagram = <VerticalSystem kind={safeKind} arrowId={arrowId} />;

  return <figure className={className}>{title && <figcaption>{title}</figcaption>}{diagram}</figure>;
}
