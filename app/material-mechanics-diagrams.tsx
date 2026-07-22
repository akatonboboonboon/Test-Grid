import { useId, type ReactNode } from "react";

export type MaterialMechanicsDiagramKind =
  | "solid-shaft"
  | "hollow-shaft"
  | "coil-spring"
  | "support-types"
  | "simply-supported-point"
  | "simply-supported-udl"
  | "overhang-beam"
  | "overhang-udl"
  | "cantilever-udl"
  | "load-resultants"
  | "sfd-bmd"
  | "overhang-sfd-bmd"
  | "beam-section-stress"
  | "additional-simple-point-rect"
  | "additional-simple-udl-rect"
  | "additional-cantilever-tip-hollow"
  | "additional-cantilever-udl-hollow";

type Props = { kind: MaterialMechanicsDiagramKind | string; solution?: boolean; title?: string; className?: string };
const KNOWN = new Set<MaterialMechanicsDiagramKind>([
  "solid-shaft", "hollow-shaft", "coil-spring", "support-types", "simply-supported-point", "simply-supported-udl",
  "overhang-beam", "overhang-udl", "cantilever-udl", "load-resultants", "sfd-bmd", "overhang-sfd-bmd", "beam-section-stress",
  "additional-simple-point-rect", "additional-simple-udl-rect", "additional-cantilever-tip-hollow", "additional-cantilever-udl-hollow",
]);

function Markers({ arrow, load }: { arrow: string; load: string }) {
  return <defs>
    <marker id={arrow} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="currentColor" /></marker>
    <pattern id={load} width="16" height="12" patternUnits="userSpaceOnUse"><path d="M8 0v9m0 0l-3-4m3 4l3-4" stroke="currentColor" strokeWidth="1.6" fill="none" /></pattern>
  </defs>;
}

function Dim({ x1, x2, y, label, arrow }: { x1: number; x2: number; y: number; label: string; arrow: string }) {
  return <g><path d={`M${x1} ${y}H${x2}`} markerStart={`url(#${arrow})`} markerEnd={`url(#${arrow})`} stroke="currentColor" /><text x={(x1 + x2) / 2} y={y - 7} textAnchor="middle" fontWeight="700">{label}</text></g>;
}

function Pin({ x, y }: { x: number; y: number }) {
  return <g fill="none" stroke="currentColor" strokeWidth="2"><circle cx={x} cy={y} r="4" fill="white" /><path d={`M${x} ${y + 4}l-14 18h28zM${x - 19} ${y + 22}h38`} /></g>;
}
function Roller({ x, y }: { x: number; y: number }) {
  return <g fill="none" stroke="currentColor" strokeWidth="2"><path d={`M${x} ${y}l-14 16h28z`} /><circle cx={x - 8} cy={y + 20} r="3" /><circle cx={x + 8} cy={y + 20} r="3" /><path d={`M${x - 20} ${y + 25}h40`} /></g>;
}
function Fixed({ x, y, height = 72 }: { x: number; y: number; height?: number }) {
  return <g stroke="currentColor"><path d={`M${x} ${y - height / 2}v${height}`} strokeWidth="4" />{Array.from({ length: 7 }, (_, index) => <path key={index} d={`M${x} ${y - height / 2 + index * 12}l-12 9`} opacity=".55" />)}</g>;
}

function Shaft({ hollow, arrow }: { hollow: boolean; arrow: string }) {
  return <svg viewBox="0 0 520 230" role="img" aria-label={hollow ? "中空丸軸の外径・内径・トルク" : "中実丸軸の長さ・直径・両端トルク"}>
    <Markers arrow={arrow} load={arrow + "-load"} />
    <path d="M100 65h280v100H100z" fill="none" stroke="currentColor" strokeWidth="3" />
    <ellipse cx="100" cy="115" rx="24" ry="50" fill="white" stroke="currentColor" strokeWidth="3" />
    <ellipse cx="380" cy="115" rx="24" ry="50" fill="white" stroke="currentColor" strokeWidth="3" />
    {hollow && <><ellipse cx="100" cy="115" rx="11" ry="30" fill="none" stroke="currentColor" strokeWidth="2" /><ellipse cx="380" cy="115" rx="11" ry="30" fill="none" stroke="currentColor" strokeWidth="2" /></>}
    <path d="M69 68c-28 10-34 43-12 61" fill="none" stroke="currentColor" strokeWidth="2.5" markerEnd={`url(#${arrow})`} />
    <path d="M411 162c28-10 34-43 12-61" fill="none" stroke="currentColor" strokeWidth="2.5" markerEnd={`url(#${arrow})`} />
    <text x="42" y="62" fontWeight="800">T</text><text x="433" y="174" fontWeight="800">T</text>
    <Dim x1={100} x2={380} y={200} label="L" arrow={arrow} />
    <path d="M380 115h24" markerEnd={`url(#${arrow})`} stroke="currentColor" /><text x="410" y="111" fontWeight="700">{hollow ? "do/2" : "R=d/2"}</text>
    {hollow && <><path d="M380 115h11" stroke="currentColor" strokeWidth="2" /><text x="340" y="104" fontWeight="700">di</text></>}
    {!hollow && <g opacity=".8"><path d="M380 115h-85" stroke="currentColor" strokeDasharray="5 4" /><text x="282" y="108">τ(r)∝r</text></g>}
  </svg>;
}

function Coil({ arrow }: { arrow: string }) {
  const turns = Array.from({ length: 7 }, (_, index) => 52 + index * 19);
  return <svg viewBox="0 0 520 270" role="img" aria-label="平均直径D、線径d、有効巻数nの密巻コイルばねと軸荷重P">
    <Markers arrow={arrow} load={arrow + "-load"} />
    <path d="M105 30h310" stroke="currentColor" strokeWidth="4" />
    {turns.map((y, index) => <ellipse key={y} cx="260" cy={y} rx="92" ry="17" fill="none" stroke="currentColor" strokeWidth={index === 0 || index === turns.length - 1 ? 3 : 2.2} />)}
    <path d="M260 184v48" stroke="currentColor" strokeWidth="3" markerEnd={`url(#${arrow})`} /><text x="274" y="224" fontWeight="800">P</text>
    <Dim x1={168} x2={352} y={246} label="平均直径 D=2R" arrow={arrow} />
    <circle cx="352" cy="128" r="8" fill="white" stroke="currentColor" strokeWidth="2" /><text x="370" y="133" fontWeight="700">線径 d</text>
    <text x="95" y="126" fontWeight="700">有効巻数 n</text>
  </svg>;
}

function SupportTypes() {
  return <svg viewBox="0 0 570 240" role="img" aria-label="ピン支点、ローラー支点、固定端の模式図">
    <path d="M45 65h130M220 65h130M395 65h130" stroke="currentColor" strokeWidth="7" />
    <Pin x={110} y={68} /><Roller x={285} y={68} /><Fixed x={460} y={65} />
    <text x="110" y="142" textAnchor="middle" fontWeight="800">ピン支点</text><text x="285" y="142" textAnchor="middle" fontWeight="800">ローラー支点</text><text x="460" y="142" textAnchor="middle" fontWeight="800">固定端</text>
    <text x="110" y="168" textAnchor="middle">Rx, Ry</text><text x="285" y="168" textAnchor="middle">法線方向 R</text><text x="460" y="168" textAnchor="middle">Rx, Ry, M</text>
  </svg>;
}

function SimpleBeam({ udl, arrow, load }: { udl: boolean; arrow: string; load: string }) {
  return <svg viewBox="0 0 570 255" role="img" aria-label={udl ? "全長Lに等分布荷重wを受ける単純支持ばり" : "中央集中荷重Pを受ける単純支持ばり"}>
    <Markers arrow={arrow} load={load} />
    <path d="M85 108h400" stroke="currentColor" strokeWidth="7" /><Pin x={110} y={112} /><Roller x={460} y={112} />
    {udl ? <><rect x="110" y="48" width="350" height="53" fill={`url(#${load})`} stroke="currentColor" /><text x="285" y="39" textAnchor="middle" fontWeight="800">w [force/length]</text></> : <><path d="M285 30v70" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="3" /><text x="300" y="54" fontWeight="800">P</text></>}
    <path d="M110 178v-54" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="2.5" /><path d="M460 178v-54" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="2.5" />
    <text x="76" y="175" fontWeight="700">RA</text><text x="474" y="175" fontWeight="700">RB</text><Dim x1={110} x2={460} y={222} label="L" arrow={arrow} />
  </svg>;
}

function Overhang({ distributed, arrow, load }: { distributed: boolean; arrow: string; load: string }) {
  return <svg viewBox="0 0 620 270" role="img" aria-label={distributed ? "A-B間に等分布荷重、張出し端Cに集中荷重を受けるはり" : "左張出し端Cと中間点Dに集中荷重を受ける単純支持ばり"}>
    <Markers arrow={arrow} load={load} />
    <path d="M65 120h500" stroke="currentColor" strokeWidth="7" />
    {distributed ? <><Pin x={105} y={124} /><Roller x={505} y={124} /><rect x="105" y="55" width="400" height="58" fill={`url(#${load})`} stroke="currentColor" /><text x="300" y="45" textAnchor="middle" fontWeight="800">w</text><path d="M555 44v67" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="3" /><text x="568" y="72" fontWeight="800">P</text><text x="105" y="164">A</text><text x="505" y="164">B</text><text x="555" y="164">C</text><Dim x1={105} x2={505} y={208} label="L" arrow={arrow} /><Dim x1={505} x2={555} y={242} label="a" arrow={arrow} /></> : <><Pin x={165} y={124} /><Roller x={565} y={124} /><path d="M65 42v69" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="3" /><text x="76" y="68" fontWeight="800">FC↓</text><path d="M365 181v-52" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="3" /><text x="378" y="177" fontWeight="800">FD↑</text><text x="65" y="164">C</text><text x="165" y="164">A</text><text x="365" y="164">D</text><text x="565" y="164">B</text><Dim x1={65} x2={165} y={208} label="100 mm" arrow={arrow} /><Dim x1={165} x2={365} y={208} label="200 mm" arrow={arrow} /><Dim x1={365} x2={565} y={208} label="200 mm" arrow={arrow} /></>}
  </svg>;
}

function Cantilever({ arrow, load, solution }: { arrow: string; load: string; solution: boolean }) {
  return <svg viewBox="0 0 560 250" role="img" aria-label="全長Lに等分布荷重wを受ける片持ちばり">
    <Markers arrow={arrow} load={load} />
    <Fixed x={90} y={115} height={120} />
    <path d="M90 115h390" stroke="currentColor" strokeWidth="7" />
    <rect x="90" y="45" width="390" height="62" fill={`url(#${load})`} stroke="currentColor" />
    <text x="285" y="35" textAnchor="middle" fontWeight="800">w</text>
    {solution && <>
      <path d="M57 175v-50" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="2.5" />
      <text x="25" y="177" fontWeight="700">R=wL</text>
      <path d="M48 80a36 36 0 0 1 31-28" fill="none" stroke="currentColor" strokeWidth="2.5" markerEnd={`url(#${arrow})`} />
      <text x="12" y="55" fontWeight="700">M₀=wL²/2</text>
    </>}
    <Dim x1={90} x2={480} y={220} label="L" arrow={arrow} />
  </svg>;
}

function Resultants({ arrow, load, solution }: { arrow: string; load: string; solution: boolean }) {
  return <svg viewBox="0 0 620 260" role="img" aria-label="長方形分布荷重と三角形分布荷重の合力位置">
    <Markers arrow={arrow} load={load} />
    <path d="M40 160h235M345 160h235" stroke="currentColor" strokeWidth="6" />
    <rect x="70" y="62" width="175" height="90" fill={`url(#${load})`} stroke="currentColor" />
    <text x="78" y="54" fontWeight="800">w</text>
    <path d="M375 152L550 62v90z" fill={`url(#${load})`} stroke="currentColor" strokeWidth="2" />
    <text x="520" y="54" fontWeight="800">w₀</text>
    {solution && <>
      <path d="M158 48v104" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="3" />
      <text x="170" y="65" fontWeight="800">W=wL</text>
      <path d="M492 48v104" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="3" />
      <text x="500" y="65" fontWeight="800">W=w₀L/2</text>
    </>}
    <Dim x1={70} x2={245} y={210} label="L" arrow={arrow} />
    <Dim x1={375} x2={550} y={210} label="L" arrow={arrow} />
    {solution ? <>
      <text x="158" y="241" textAnchor="middle">作用位置 L/2</text>
      <text x="462" y="241" textAnchor="middle">小さい側から 2L/3</text>
    </> : <>
      <text x="158" y="241" textAnchor="middle">合力と作用位置を求める</text>
      <text x="462" y="241" textAnchor="middle">合力と作用位置を求める</text>
    </>}
  </svg>;
}
function ShearMoment({ solution, overhang }: { solution: boolean; overhang: boolean }) {
  const sfd = overhang ? "M58 54H160V92H335V72H515" : "M58 40L285 92L515 144";
  const bmd = overhang ? "M58 210L160 170H335L515 210" : "M58 210Q285 118 515 210";
  return <svg viewBox="0 0 570 260" role="img" aria-label={`${overhang ? "張出しばり" : "単純支持ばり等分布荷重"}のSFD・BMD${solution ? "模範線" : "解答用座標"}`}>
    <path d="M45 20v130M35 92h500M45 160v88M35 210h500" stroke="currentColor" strokeWidth="1.8" /><text x="8" y="29" fontWeight="800">V</text><text x="8" y="172" fontWeight="800">M</text><text x="523" y="108">x</text><text x="523" y="226">x</text>
    {solution ? <><path d={sfd} fill="none" stroke="currentColor" strokeWidth="4" /><path d={bmd} fill="none" stroke="currentColor" strokeWidth="4" /><text x="285" y="252" textAnchor="middle">集中荷重でVが跳び、dM/dx=V</text></> : <><path d="M55 32H520M55 172H520" stroke="currentColor" strokeDasharray="4 5" opacity=".25" /><text x="285" y="252" textAnchor="middle" opacity=".55">符号・値・折点または曲線を記入</text></>}
  </svg>;
}

function BeamSectionStress({ solution, arrow, load }: { solution: boolean; arrow: string; load: string }) {
  return <svg viewBox="0 0 620 340" role="img" aria-label={`等分布荷重ばりと中実円断面の最大曲げ応力${solution ? "模範図" : "問題図"}`}>
    <Markers arrow={arrow} load={load} />
    <path d="M72 96h430" stroke="currentColor" strokeWidth="7" />
    <Pin x={96} y={100} /><Roller x={478} y={100} />
    <rect x="96" y="34" width="382" height="54" fill={`url(#${load})`} stroke="currentColor" />
    <text x="287" y="25" textAnchor="middle" fontWeight="800">w</text>
    <Dim x1={96} x2={478} y={170} label="L" arrow={arrow} />
    <circle cx="154" cy="266" r="51" fill="white" stroke="currentColor" strokeWidth="3" />
    <path d="M103 266h102" stroke="currentColor" strokeDasharray="5 4" />
    <path d="M222 215v102" markerStart={`url(#${arrow})`} markerEnd={`url(#${arrow})`} stroke="currentColor" />
    <text x="234" y="270" fontWeight="800">d</text>
    <text x="154" y="329" textAnchor="middle" fontWeight="700">中実円断面</text>
    <path d="M372 215v102M338 266h122" stroke="currentColor" strokeWidth="1.8" />
    <path d="M372 215L430 266L372 317Z" fill="none" stroke="currentColor" strokeWidth="3" />
    <text x="322" y="207" fontWeight="700">上縁</text><text x="322" y="329" fontWeight="700">下縁</text>
    <text x="443" y="270" fontWeight="700">σ</text>
    {solution ? <>
      <path d="M287 48v43" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="2.5" />
      <text x="300" y="61" fontWeight="800">Mmax：中央</text>
      <text x="475" y="228" fontWeight="800">−σmax</text><text x="475" y="310" fontWeight="800">+σmax</text>
      <text x="500" y="334" textAnchor="middle">σmax=Mmax/Z</text>
    </> : <>
      <text x="430" y="198" textAnchor="middle" opacity=".65">上下縁の応力を記入</text>
      <text x="500" y="334" textAnchor="middle" opacity=".55">前問のMmaxを用いる</text>
    </>}
  </svg>;
}
type AdditionalBeamProps = {
  support: "simple" | "cantilever";
  distributed: boolean;
  section: "rectangle" | "hollow";
  solution: boolean;
  arrow: string;
  load: string;
};

function AdditionalCrossSection({ section, arrow }: Pick<AdditionalBeamProps, "section" | "arrow">) {
  if (section === "rectangle") return <g aria-label="Rectangular cross-section b by h">
    <text x="610" y="48" textAnchor="middle" fontWeight="800">Cross-section</text>
    <rect x="558" y="70" width="104" height="92" fill="white" stroke="currentColor" strokeWidth="3" />
    <path d="M558 181H662" markerStart={`url(#${arrow})`} markerEnd={`url(#${arrow})`} stroke="currentColor" />
    <text x="610" y="174" textAnchor="middle" fontWeight="800">b</text>
    <path d="M681 70V162" markerStart={`url(#${arrow})`} markerEnd={`url(#${arrow})`} stroke="currentColor" />
    <text x="694" y="120" fontWeight="800">h</text>
  </g>;

  return <g aria-label="Hollow circular cross-section with outer diameter do and inner diameter di">
    <text x="610" y="48" textAnchor="middle" fontWeight="800">Hollow section</text>
    <circle cx="610" cy="116" r="50" fill="white" stroke="currentColor" strokeWidth="3" />
    <circle cx="610" cy="116" r="27" fill="white" stroke="currentColor" strokeWidth="3" />
    <path d="M560 116H660" markerStart={`url(#${arrow})`} markerEnd={`url(#${arrow})`} stroke="currentColor" />
    <text x="610" y="105" textAnchor="middle" fontWeight="800">d<tspan baselineShift="sub" fontSize="10">o</tspan></text>
    <path d="M610 89V143" markerStart={`url(#${arrow})`} markerEnd={`url(#${arrow})`} stroke="currentColor" />
    <text x="622" y="139" fontWeight="800">d<tspan baselineShift="sub" fontSize="10">i</tspan></text>
  </g>;
}

function AdditionalSolutionPlots({ support, distributed }: Pick<AdditionalBeamProps, "support" | "distributed">) {
  const simple = support === "simple";
  const point = !distributed;
  const loadX = simple && point ? 230 : 268;
  let sfd: ReactNode;
  let bmd: ReactNode;

  if (simple && point) {
    sfd = <>
      <path d={`M80 350V310H${loadX}V377H455V350`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <text x="92" y="303" fontWeight="700">+Pb/L</text><text x="330" y="393" fontWeight="700">-Pa/L</text>
    </>;
    bmd = <>
      <path d={`M80 475L${loadX} 420L455 475`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <text x={loadX} y="410" textAnchor="middle" fontWeight="700">M<tspan baselineShift="sub" fontSize="10">max</tspan> = Pab/L</text>
    </>;
  } else if (simple) {
    sfd = <>
      <path d="M80 350V316L455 384V350" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <text x="92" y="309" fontWeight="700">+wL/2</text><text x="345" y="400" fontWeight="700">-wL/2</text>
    </>;
    bmd = <>
      <path d="M80 475Q268 365 455 475" fill="none" stroke="currentColor" strokeWidth="4" />
      <text x="268" y="410" textAnchor="middle" fontWeight="700">M<tspan baselineShift="sub" fontSize="10">max</tspan> = wL^2/8</text>
    </>;
  } else if (point) {
    sfd = <>
      <path d="M80 350V384H455V350" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <text x="92" y="400" fontWeight="700">-P</text>
    </>;
    bmd = <>
      <path d="M80 475V525L455 475" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <text x="92" y="541" fontWeight="700">M<tspan baselineShift="sub" fontSize="10">A</tspan> = -PL</text>
    </>;
  } else {
    sfd = <>
      <path d="M80 350V384L455 350" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <text x="92" y="400" fontWeight="700">-wL</text>
    </>;
    bmd = <>
      <path d="M80 475V525Q268 475 455 475" fill="none" stroke="currentColor" strokeWidth="4" />
      <text x="92" y="541" fontWeight="700">M<tspan baselineShift="sub" fontSize="10">A</tspan> = -wL^2/2</text>
    </>;
  }

  return <g aria-label="Shear-force and bending-moment diagrams">
    <text x="22" y="307" fontWeight="800">SFD</text>
    <path d="M80 296V405M65 350H470" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <text x="474" y="354">x</text>
    {sfd}
    <text x="22" y="428" fontWeight="800">BMD</text>
    <path d="M80 414V535M65 475H470" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <text x="474" y="479">x</text>
    {bmd}
    {simple && <path d={`M${loadX} 300V535`} stroke="currentColor" strokeDasharray="4 5" opacity=".25" />}
    <text x="520" y="335" fontWeight="700">V: shear force</text>
    <text x="520" y="360" fontWeight="700">M: bending moment</text>
    {!simple && <text x="520" y="385" fontSize="13">Negative shown below axis</text>}
  </g>;
}

function AdditionalBeamDiagram({ support, distributed, section, solution, arrow, load }: AdditionalBeamProps) {
  const simple = support === "simple";
  const pointX = simple ? 230 : 455;
  const aria = `${simple ? "Simply supported" : "Cantilever"} beam with ${distributed ? "uniformly distributed load w" : "point load P"}, ${section === "rectangle" ? "rectangular" : "hollow circular"} cross-section, ${solution ? "solution" : "problem"} diagram`;

  return <svg
    viewBox={`0 0 720 ${solution ? 555 : 285}`}
    role="img"
    aria-label={aria}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block", width: "100%", height: "auto", maxWidth: "100%" }}
  >
    <Markers arrow={arrow} load={load} />
    {simple ? <>
      <path d="M60 120H475" stroke="currentColor" strokeWidth="7" />
      <Pin x={80} y={124} /><Roller x={455} y={124} />
      <text x="80" y="166" textAnchor="middle" fontWeight="700">A</text>
      <text x="455" y="166" textAnchor="middle" fontWeight="700">B</text>
    </> : <>
      <Fixed x={80} y={120} height={132} />
      <path d="M80 120H455" stroke="currentColor" strokeWidth="7" />
      <text x="80" y="202" textAnchor="middle" fontWeight="700">A</text>
      <text x="455" y="146" textAnchor="middle" fontWeight="700">B</text>
    </>}
    {distributed ? <>
      <rect x="80" y="44" width="375" height="68" fill={`url(#${load})`} stroke="currentColor" />
      <text x="268" y="34" textAnchor="middle" fontWeight="800">w</text>
    </> : <>
      <path d={`M${pointX} 35V111`} markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="3" />
      <text x={pointX + 14} y="58" fontWeight="800">P</text>
    </>}
    {simple && !distributed && <>
      <Dim x1={80} x2={pointX} y={220} label="a" arrow={arrow} />
      <Dim x1={pointX} x2={455} y={220} label="b" arrow={arrow} />
    </>}
    <Dim x1={80} x2={455} y={simple && !distributed ? 265 : 255} label={simple && !distributed ? "L = a + b" : "L"} arrow={arrow} />
    <AdditionalCrossSection section={section} arrow={arrow} />
    {solution && <>
      {simple ? <>
        <path d="M80 198V134" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="2.5" />
        <path d="M455 198V134" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="2.5" />
        <text x="92" y="194" fontWeight="700">R<tspan baselineShift="sub" fontSize="10">A</tspan>={distributed ? "wL/2" : "Pb/L"}</text>
        <text x="350" y="194" fontWeight="700">R<tspan baselineShift="sub" fontSize="10">B</tspan>={distributed ? "wL/2" : "Pa/L"}</text>
      </> : <>
        <path d="M49 192V134" markerEnd={`url(#${arrow})`} stroke="currentColor" strokeWidth="2.5" />
        <text x="12" y="210" fontWeight="700">R<tspan baselineShift="sub" fontSize="10">A</tspan>={distributed ? "wL" : "P"}</text>
        <path d="M48 92A38 38 0 0 1 70 62" fill="none" stroke="currentColor" strokeWidth="2.5" markerEnd={`url(#${arrow})`} />
        <text x="8" y="52" fontWeight="700">M<tspan baselineShift="sub" fontSize="10">A</tspan>={distributed ? "wL^2/2" : "PL"}</text>
      </>}
      <AdditionalSolutionPlots support={support} distributed={distributed} />
    </>}
  </svg>;
}

export default function MaterialMechanicsDiagram({ kind, solution = false, title, className }: Props) {
  const id = useId().replace(/:/g, "");
  const arrow = `material-arrow-${id}`;
  const load = `material-load-${id}`;
  if (!KNOWN.has(kind as MaterialMechanicsDiagramKind)) return null;
  let content: ReactNode;
  if (kind === "solid-shaft") content = <Shaft hollow={false} arrow={arrow} />;
  else if (kind === "hollow-shaft") content = <Shaft hollow arrow={arrow} />;
  else if (kind === "coil-spring") content = <Coil arrow={arrow} />;
  else if (kind === "support-types") content = <SupportTypes />;
  else if (kind === "simply-supported-point") content = <SimpleBeam udl={false} arrow={arrow} load={load} />;
  else if (kind === "simply-supported-udl") content = <SimpleBeam udl arrow={arrow} load={load} />;
  else if (kind === "overhang-beam") content = <Overhang distributed={false} arrow={arrow} load={load} />;
  else if (kind === "overhang-udl") content = <Overhang distributed arrow={arrow} load={load} />;
  else if (kind === "cantilever-udl") content = <Cantilever arrow={arrow} load={load} solution={solution} />;
  else if (kind === "load-resultants") content = <Resultants arrow={arrow} load={load} solution={solution} />;
  else if (kind === "overhang-sfd-bmd") content = <ShearMoment solution={solution} overhang />;
  else if (kind === "beam-section-stress") content = <BeamSectionStress solution={solution} arrow={arrow} load={load} />;
  else if (kind === "additional-simple-point-rect") content = <AdditionalBeamDiagram support="simple" distributed={false} section="rectangle" solution={solution} arrow={arrow} load={load} />;
  else if (kind === "additional-simple-udl-rect") content = <AdditionalBeamDiagram support="simple" distributed section="rectangle" solution={solution} arrow={arrow} load={load} />;
  else if (kind === "additional-cantilever-tip-hollow") content = <AdditionalBeamDiagram support="cantilever" distributed={false} section="hollow" solution={solution} arrow={arrow} load={load} />;
  else if (kind === "additional-cantilever-udl-hollow") content = <AdditionalBeamDiagram support="cantilever" distributed section="hollow" solution={solution} arrow={arrow} load={load} />;
  else content = <ShearMoment solution={solution} overhang={false} />;
  return <figure className={className} style={{ margin: "1rem 0", border: "2px solid currentColor", background: "#fff", color: "#132235", padding: ".75rem", overflow: "hidden" }}>{title && <figcaption style={{ fontWeight: 800, marginBottom: ".5rem" }}>{title}</figcaption>}{content}</figure>;
}
