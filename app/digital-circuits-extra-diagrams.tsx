import DigitalCircuitDiagram from "./digital-circuits-diagrams";
import {
  DIGITAL_CIRCUIT_DETECTOR_1001_TRANSITIONS,
  DIGITAL_CIRCUIT_PAST_MACHINE_TRANSITIONS,
  type DigitalCircuitAnyDiagramKind,
  type DigitalCircuitExtraDiagramKind,
} from "./digital-circuits-extra-data";

type Props = { kind: DigitalCircuitAnyDiagramKind; solution?: boolean; title?: string; compact?: boolean };
const extraKinds = new Set<DigitalCircuitExtraDiagramKind>([
  "xor-timing", "three-jk-ripple", "cyclic-down-10-2",
  "exercise3-sequential", "past-state-machine", "sequence-detector-1001",
]);
const ink = "#10243a";
const accent = "#18a99b";
const answer = "#d94878";
const grid = "#b8c6d4";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 700 360" role="img" aria-label={title}>
      <rect x="1" y="1" width="698" height="358" rx="16" fill="#f7fbfd" stroke={grid} />
      {children}
    </svg>
  );
}

function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10Z" fill={ink} />
      </marker>
    </defs>
  );
}

function XorTiming({ solution }: { solution: boolean }) {
  const rows = [["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "0"]];
  return (
    <Shell title="XOR回路と4行真理値表のワークシート">
      <path d="M105 45Q132 88 105 131Q180 126 225 88Q180 50 105 45Z" fill="#fff" stroke={ink} strokeWidth="4" />
      <path d="M94 45Q121 88 94 131" fill="none" stroke={ink} strokeWidth="4" />
      <path d="M35 68H111M35 108H111M225 88H305" stroke={ink} strokeWidth="4" />
      <text x="18" y="75" fontSize="20" fill={ink}>A</text>
      <text x="18" y="115" fontSize="20" fill={ink}>B</text>
      <text x="315" y="95" fontSize="20" fill={ink}>Y</text>
      <text x="159" y="95" textAnchor="middle" fontSize="19" fontWeight="800" fill={ink}>XOR</text>
      <text x="185" y="170" textAnchor="middle" fontSize="16" fill={ink}>入力波形は問題文の区間ごとに読む</text>

      <rect x="370" y="45" width="265" height="245" rx="8" fill="#fff" stroke={grid} />
      <text x="502" y="75" textAnchor="middle" fontSize="17" fontWeight="800" fill={ink}>完全な4行真理値表</text>
      <text x="420" y="108" textAnchor="middle" fontSize="16" fill={ink}>A</text>
      <text x="500" y="108" textAnchor="middle" fontSize="16" fill={ink}>B</text>
      <text x="585" y="108" textAnchor="middle" fontSize="16" fill={ink}>Y</text>
      {[120, 160, 200, 240, 280].map((y) => <line key={y} x1="390" y1={y} x2="615" y2={y} stroke={grid} />)}
      {[460, 540].map((x) => <line key={x} x1={x} y1="90" x2={x} y2="280" stroke={grid} />)}
      {rows.map(([a, b, y], index) => (
        <g key={a + b}>
          <text x="420" y={148 + index * 40} textAnchor="middle" fontSize="17" fill={ink}>{a}</text>
          <text x="500" y={148 + index * 40} textAnchor="middle" fontSize="17" fill={ink}>{b}</text>
          {solution
            ? <text x="585" y={148 + index * 40} textAnchor="middle" fontSize="17" fontWeight="800" fill={answer}>{y}</text>
            : <line x1="563" y1={145 + index * 40} x2="607" y2={145 + index * 40} stroke={answer} strokeWidth="2" />}
        </g>
      ))}
      <text x="350" y="330" textAnchor="middle" fontSize="17" fontWeight={solution ? 800 : 500} fill={solution ? answer : accent}>
        {solution ? "AとBが異なる行だけY=1" : "波形の全区間を読み、00・01・10・11の4行を埋める"}
      </text>
    </Shell>
  );
}

function ThreeJk({ solution }: { solution: boolean }) {
  return (
    <Shell title="3段正エッジJKフリップフロップ非同期カウンタ">
      {[70, 275, 480].map((x, index) => (
        <g key={x}>
          <rect x={x} y="55" width="145" height="125" rx="8" fill="#fff" stroke={ink} strokeWidth="4" />
          <text x={x + 72} y="91" textAnchor="middle" fontSize="19" fontWeight="800" fill={ink}>JK-FF {index}</text>
          <text x={x + 32} y="125" fontSize="17" fill={accent}>J=1</text>
          <text x={x + 92} y="125" fontSize="17" fill={accent}>K=1</text>
          <path d={"M" + x + " 151l14 10-14 10"} fill="none" stroke={ink} strokeWidth="3" />
          <text x={x + 115} y="164" fontSize="17" fill={ink}>Q</text>
        </g>
      ))}
      <path d="M22 161H70M215 151H275M420 151H480M625 151H676" fill="none" stroke={ink} strokeWidth="4" />
      <text x="15" y="145" fontSize="16" fill={ink}>CLK</text>
      <text x="640" y="139" fontSize="16" fill={ink}>D2</text>
      <text x="143" y="205" textAnchor="middle" fontSize="16" fill={ink}>D0</text>
      <text x="348" y="205" textAnchor="middle" fontSize="16" fill={ink}>D1</text>
      <rect x="45" y="235" width="610" height="92" rx="8" fill="#fff" stroke={grid} />
      <text x="350" y="264" textAnchor="middle" fontSize="17" fontWeight="700" fill={ink}>D2D1D0 状態列</text>
      {solution
        ? <text x="350" y="302" textAnchor="middle" fontSize="17" fontWeight="700" fill={answer}>000→111→110→101→100→011→010→001→000</text>
        : <><line x1="80" y1="301" x2="620" y2="301" stroke={answer} strokeWidth="2" strokeDasharray="9 7" /><text x="350" y="345" textAnchor="middle" fontSize="15" fill={answer}>初期000から正エッジ伝搬を順に記入</text></>}
    </Shell>
  );
}

function CyclicCounterBlocks() {
  return (
    <>
      {[45, 190, 335, 480].map((x, index) => (
        <g key={x}>
          <rect x={x} y="58" width="115" height="92" rx="8" fill="#fff" stroke={ink} strokeWidth="3" />
          <text x={x + 57} y="84" textAnchor="middle" fontSize="15" fontWeight="800" fill={ink}>T-FF D{index}</text>
          <text x={x + 20} y="118" fontSize="14" fill={accent}>T=1</text>
          <text x={x + 82} y="118" fontSize="14" fill={ink}>Q</text>
          <path d={"M" + x + " 128l12 8-12 8"} fill="none" stroke={ink} strokeWidth="2" />
        </g>
      ))}
      <path d="M15 136H45M160 128H190M305 128H335M450 128H480M595 128H675" fill="none" stroke={ink} strokeWidth="3" />
      <text x="13" y="122" fontSize="14" fill={ink}>CLK</text>
    </>
  );
}

function CyclicDown({ solution }: { solution: boolean }) {
  if (!solution) {
    return (
      <Shell title="4ビット巡回ダウンカウンタの回路・波形ワークシート">
        <text x="350" y="32" textAnchor="middle" fontSize="18" fontWeight="800" fill={ink}>4-bit cyclic down counter / design worksheet</text>
        <CyclicCounterBlocks />
        <rect x="45" y="175" width="610" height="58" rx="8" fill="#fff" stroke={grid} />
        <text x="70" y="199" fontSize="15" fill={ink}>戻り状態を検出する論理：</text>
        <line x1="285" y1="196" x2="625" y2="196" stroke={answer} strokeWidth="2" />
        <text x="70" y="222" fontSize="15" fill={ink}>非同期 SET：</text>
        <line x1="180" y1="219" x2="330" y2="219" stroke={answer} strokeWidth="2" />
        <text x="365" y="222" fontSize="15" fill={ink}>RST：</text>
        <line x1="415" y1="219" x2="625" y2="219" stroke={answer} strokeWidth="2" />
        {["CLK", "init", "D3", "D2", "D1", "D0"].map((label, index) => (
          <g key={label}>
            <text x="45" y={255 + index * 17} fontSize="12" fill={ink}>{label}</text>
            <line x1="85" y1={252 + index * 17} x2="655" y2={252 + index * 17} stroke={grid} />
          </g>
        ))}
        {[115, 175, 235, 295, 355, 415, 475, 535, 595, 655].map((x) => <line key={x} x1={x} y1="242" x2={x} y2="342" stroke={grid} strokeDasharray="3 4" />)}
      </Shell>
    );
  }

  return (
    <Shell title="4ビット巡回ダウンカウンタの模範回路・状態列">
      <text x="350" y="32" textAnchor="middle" fontSize="18" fontWeight="800" fill={ink}>4-bit cyclic down counter / model answer</text>
      <CyclicCounterBlocks />
      <rect x="45" y="172" width="610" height="86" rx="8" fill="#fff" stroke={grid} />
      <text x="350" y="198" textAnchor="middle" fontSize="16" fontWeight="800" fill={answer}>0001を検出 → 1010を非同期ロード</text>
      <text x="350" y="224" textAnchor="middle" fontSize="15" fill={answer}>SET: D3, D1　 /　 RST: D2, D0</text>
      <text x="350" y="249" textAnchor="middle" fontSize="15" fill={ink}>9状態を巡回し、0010の次は1010へ戻る</text>
      <text x="350" y="292" textAnchor="middle" fontSize="16" fontWeight="800" fill={answer}>1010 → 1001 → 1000 → 0111 → 0110</text>
      <text x="350" y="320" textAnchor="middle" fontSize="16" fontWeight="800" fill={answer}>→ 0101 → 0100 → 0011 → 0010 → 1010</text>
      <text x="350" y="346" textAnchor="middle" fontSize="14" fill={accent}>タイミングチャートは各クロック後のD3D2D1D0をこの順に描く</text>
    </Shell>
  );
}

function Exercise3({ solution }: { solution: boolean }) {
  return (
    <Shell title="第8回演習のDフリップフロップ順序回路と状態表">
      <path d="M40 90H110M40 90V45H385V90H430" stroke={ink} strokeWidth="4" fill="none" />
      <text x="20" y="97" fontSize="20" fill={ink}>A</text>
      <path d="M110 65H155A35 35 0 0 1 155 135H110Z" fill="#fff" stroke={ink} strokeWidth="4" />
      <rect x="205" y="58" width="135" height="120" fill="#fff" stroke={ink} strokeWidth="4" />
      <text x="226" y="106" fontSize="19" fill={ink}>D</text>
      <text x="306" y="106" fontSize="19" fill={ink}>Q</text>
      <text x="306" y="151" fontSize="19" fill={ink}>Q̅</text>
      <path d="M190 100H205M340 90H430M340 145V207H85V112H110" fill="none" stroke={ink} strokeWidth="4" />
      <path d="M430 65H475A35 35 0 0 1 475 135H430Z" fill="#fff" stroke={ink} strokeWidth="4" />
      <path d="M510 100H560" stroke={ink} strokeWidth="4" />
      <text x="570" y="107" fontSize="20" fill={ink}>Y</text>
      <text x="145" y="108" textAnchor="middle" fontSize="15" fill={ink}>AND</text>
      <text x="465" y="108" textAnchor="middle" fontSize="15" fill={ink}>AND</text>
      <rect x="390" y="205" width="260" height="120" rx="8" fill="#fff" stroke={grid} />
      <text x="520" y="232" textAnchor="middle" fontSize="17" fontWeight="700" fill={ink}>状態表記入欄</text>
      <text x="415" y="263" fontSize="15" fill={ink}>A S</text>
      <text x="500" y="263" fontSize="15" fill={ink}>S+</text>
      <text x="580" y="263" fontSize="15" fill={ink}>Y</text>
      <text x="415" y="295" fontSize="15" fill={ink}>00 / 01 / 10 / 11</text>
      {solution
        ? <text x="205" y="290" textAnchor="middle" fontSize="18" fontWeight="700" fill={answer}>S+ = A S̅　　Y = A S</text>
        : <><line x1="90" y1="282" x2="320" y2="282" stroke={answer} strokeWidth="2" /><text x="205" y="312" textAnchor="middle" fontSize="15" fill={answer}>配線から2式を記入</text></>}
    </Shell>
  );
}

function PastMachineWorksheet() {
  return (
    <Shell title="過去問問3の状態表・Mealy図ワークシート">
      <text x="350" y="30" textAnchor="middle" fontSize="17" fontWeight="800" fill={ink}>出典表: In, S0, S1 → S0+, S1+, Out</text>
      <text x="350" y="54" textAnchor="middle" fontSize="14" fill={accent}>状態図のノード名は S1S0 順。01 と 10 を入れ替えて読む。</text>
      <rect x="60" y="70" width="580" height="264" rx="8" fill="#fff" stroke={grid} />
      <text x="108" y="94" textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>In</text>
      <text x="190" y="94" textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>S0</text>
      <text x="260" y="94" textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>S1</text>
      <text x="365" y="94" textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>S0+</text>
      <text x="460" y="94" textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>S1+</text>
      <text x="565" y="94" textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>Out</text>
      {[135, 225, 300, 415, 510].map((x) => <line key={x} x1={x} y1="76" x2={x} y2="328" stroke={grid} />)}
      {DIGITAL_CIRCUIT_PAST_MACHINE_TRANSITIONS.map((transition, index) => {
        const y = 121 + index * 28;
        return (
          <g key={transition.input + transition.tableStateS0S1}>
            <line x1="65" y1={y + 8} x2="635" y2={y + 8} stroke={grid} />
            <text x="108" y={y} textAnchor="middle" fontSize="14" fill={ink}>{transition.input}</text>
            <text x="190" y={y} textAnchor="middle" fontSize="14" fill={ink}>{transition.tableStateS0S1[0]}</text>
            <text x="260" y={y} textAnchor="middle" fontSize="14" fill={ink}>{transition.tableStateS0S1[1]}</text>
            <line x1="335" y1={y - 3} x2="395" y2={y - 3} stroke={answer} />
            <line x1="430" y1={y - 3} x2="490" y2={y - 3} stroke={answer} />
            <line x1="535" y1={y - 3} x2="595" y2={y - 3} stroke={answer} />
          </g>
        );
      })}
    </Shell>
  );
}

function pastLabel(current: string, input: 0 | 1) {
  const transition = DIGITAL_CIRCUIT_PAST_MACHINE_TRANSITIONS.find(
    (item) => item.graphStateS1S0 === current && item.input === input,
  );
  return transition ? transition.input + "/" + transition.output : "?";
}

function PastMachine({ solution }: { solution: boolean }) {
  if (!solution) return <PastMachineWorksheet />;

  const nodes = [
    { id: "00", x: 150, y: 130 },
    { id: "01", x: 550, y: 130 },
    { id: "10", x: 550, y: 280 },
    { id: "11", x: 150, y: 280 },
  ];
  const branches = [
    { key: "00-0", current: "00", input: 0 as const, d: "M118 90C70 35 24 105 99 137", x: 58, y: 58 },
    { key: "00-1", current: "00", input: 1 as const, d: "M200 105C300 58 400 58 500 105", x: 350, y: 66 },
    { key: "01-0", current: "01", input: 0 as const, d: "M500 145C400 187 300 187 200 145", x: 350, y: 185 },
    { key: "01-1", current: "01", input: 1 as const, d: "M585 170C630 194 630 226 585 250", x: 638, y: 212 },
    { key: "10-0", current: "10", input: 0 as const, d: "M515 250C470 226 470 194 515 170", x: 463, y: 212 },
    { key: "10-1", current: "10", input: 1 as const, d: "M500 296C400 338 300 338 200 296", x: 350, y: 342 },
    { key: "11-0", current: "11", input: 0 as const, d: "M200 255C300 215 400 215 500 255", x: 350, y: 218 },
    { key: "11-1", current: "11", input: 1 as const, d: "M115 250C70 226 70 194 115 170", x: 62, y: 212 },
  ];
  return (
    <Shell title="過去問問3の全8遷移Mealy状態図">
      <ArrowMarker id="past-machine-arrow" />
      <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="800" fill={ink}>表は S0S1 順 / グラフのノード名は S1S0 順</text>
      {branches.map((branch) => (
        <g key={branch.key}>
          <path d={branch.d} fill="none" stroke={ink} strokeWidth="3" markerEnd="url(#past-machine-arrow)" />
          <text x={branch.x} y={branch.y} textAnchor="middle" fontSize="15" fontWeight="800" fill={answer}>{pastLabel(branch.current, branch.input)}</text>
        </g>
      ))}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r="48" fill="#fff" stroke={ink} strokeWidth="4" />
          <text x={node.x} y={node.y + 7} textAnchor="middle" fontSize="22" fontWeight="800" fill={ink}>{node.id}</text>
        </g>
      ))}
    </Shell>
  );
}

function Detector1001Worksheet() {
  const rows = DIGITAL_CIRCUIT_DETECTOR_1001_TRANSITIONS;
  return (
    <Shell title="1001系列検出器の状態割当・遷移表ワークシート">
      <text x="350" y="30" textAnchor="middle" fontSize="17" fontWeight="800" fill={ink}>1001 Mealy detector / answer worksheet</text>
      <text x="175" y="62" textAnchor="middle" fontSize="13" fill={accent}>各枝へ I/O を記入。4状態の意味も自分で決める</text>
      {[["00", 100, 130], ["01", 250, 130], ["10", 250, 275], ["11", 100, 275]].map(([id, x, y]) => (
        <g key={id}>
          <circle cx={Number(x)} cy={Number(y)} r="43" fill="#fff" stroke={ink} strokeWidth="3" />
          <text x={Number(x)} y={Number(y) + 6} textAnchor="middle" fontSize="19" fontWeight="800" fill={ink}>{id}</text>
        </g>
      ))}
      <rect x="330" y="54" width="330" height="285" rx="8" fill="#fff" stroke={grid} />
      <text x="385" y="80" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>current</text>
      <text x="470" y="80" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>I</text>
      <text x="550" y="80" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>next</text>
      <text x="625" y="80" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>O</text>
      {[435, 505, 590].map((x) => <line key={x} x1={x} y1="60" x2={x} y2="332" stroke={grid} />)}
      {rows.map((transition, index) => {
        const y = 106 + index * 29;
        return (
          <g key={transition.current + transition.input}>
            <line x1="335" y1={y + 8} x2="655" y2={y + 8} stroke={grid} />
            <text x="385" y={y} textAnchor="middle" fontSize="14" fill={ink}>{transition.current}</text>
            <text x="470" y={y} textAnchor="middle" fontSize="14" fill={ink}>{transition.input}</text>
            <line x1="525" y1={y - 3} x2="575" y2={y - 3} stroke={answer} />
            <line x1="605" y1={y - 3} x2="645" y2={y - 3} stroke={answer} />
          </g>
        );
      })}
    </Shell>
  );
}

function detectorLabel(current: string, input: 0 | 1) {
  const transition = DIGITAL_CIRCUIT_DETECTOR_1001_TRANSITIONS.find(
    (item) => item.current === current && item.input === input,
  );
  return transition ? transition.input + "/" + transition.output : "?";
}

function Detector1001({ solution }: { solution: boolean }) {
  if (!solution) return <Detector1001Worksheet />;

  const meanings: Record<string, string> = {
    "00": "初期",
    "01": "1まで一致",
    "10": "10まで一致",
    "11": "100まで一致",
  };
  const nodes = [
    { id: "00", x: 150, y: 120 },
    { id: "01", x: 550, y: 120 },
    { id: "10", x: 550, y: 275 },
    { id: "11", x: 150, y: 275 },
  ];
  const branches = [
    { key: "00-0", current: "00", input: 0 as const, d: "M118 80C70 25 24 100 99 128", x: 58, y: 52 },
    { key: "00-1", current: "00", input: 1 as const, d: "M200 102C300 62 400 62 500 102", x: 350, y: 68 },
    { key: "01-1", current: "01", input: 1 as const, d: "M582 80C630 25 676 100 601 128", x: 642, y: 52 },
    { key: "01-0", current: "01", input: 0 as const, d: "M585 160C625 186 625 222 585 242", x: 640, y: 205 },
    { key: "10-1", current: "10", input: 1 as const, d: "M515 242C475 222 475 186 515 160", x: 462, y: 205 },
    { key: "10-0", current: "10", input: 0 as const, d: "M500 292C400 334 300 334 200 292", x: 350, y: 340 },
    { key: "11-0", current: "11", input: 0 as const, d: "M115 242C75 222 75 186 115 160", x: 60, y: 205 },
    { key: "11-1", current: "11", input: 1 as const, d: "M194 250C280 190 390 145 501 130", x: 345, y: 180 },
  ];
  return (
    <Shell title="1001系列検出器の全8遷移Mealy状態図">
      <ArrowMarker id="detector-1001-arrow" />
      <text x="350" y="27" textAnchor="middle" fontSize="16" fontWeight="800" fill={ink}>1001 Mealy detector / exact 8 transitions</text>
      {branches.map((branch) => (
        <g key={branch.key}>
          <path d={branch.d} fill="none" stroke={ink} strokeWidth="3" markerEnd="url(#detector-1001-arrow)" />
          <text x={branch.x} y={branch.y} textAnchor="middle" fontSize="15" fontWeight="800" fill={answer}>{detectorLabel(branch.current, branch.input)}</text>
        </g>
      ))}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r="46" fill="#fff" stroke={ink} strokeWidth="4" />
          <text x={node.x} y={node.y} textAnchor="middle" fontSize="21" fontWeight="800" fill={ink}>{node.id}</text>
          <text x={node.x} y={node.y + 21} textAnchor="middle" fontSize="12" fill={accent}>{meanings[node.id]}</text>
        </g>
      ))}
    </Shell>
  );
}

export default function DigitalCircuitStudyDiagram({ kind, solution = false, title, compact = false }: Props) {
  if (!extraKinds.has(kind as DigitalCircuitExtraDiagramKind)) {
    return <DigitalCircuitDiagram kind={kind as never} solution={solution} title={title} compact={compact} />;
  }
  return (
    <figure className={"digital-circuit-diagram" + (compact ? " is-compact" : "")}>
      {title && <figcaption>{title}</figcaption>}
      {kind === "xor-timing" && <XorTiming solution={solution} />}
      {kind === "three-jk-ripple" && <ThreeJk solution={solution} />}
      {kind === "cyclic-down-10-2" && <CyclicDown solution={solution} />}
      {kind === "exercise3-sequential" && <Exercise3 solution={solution} />}
      {kind === "past-state-machine" && <PastMachine solution={solution} />}
      {kind === "sequence-detector-1001" && <Detector1001 solution={solution} />}
    </figure>
  );
}