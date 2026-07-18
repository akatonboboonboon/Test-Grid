import type { DigitalCircuitDiagramKind } from "./digital-circuits-data";

type Props = {
  kind: DigitalCircuitDiagramKind;
  solution?: boolean;
  title?: string;
  compact?: boolean;
};

const ink = "#10243a";
const accent = "#18a99b";
const answer = "#d94878";
const grid = "#b8c6d4";

function Gate({ type }: { type: "AND" | "OR" }) {
  return (
    <g>
      {type === "AND" ? (
        <path d="M155 40H205A42 42 0 0 1 205 124H155Z" fill="#fff" stroke={ink} strokeWidth="4" />
      ) : (
        <path d="M155 40Q181 82 155 124Q210 118 245 82Q210 46 155 40Z" fill="#fff" stroke={ink} strokeWidth="4" />
      )}
      <path d="M86 62H158M86 102H158M244 82H318" fill="none" stroke={ink} strokeWidth="4" />
      <text x="60" y="68" fontSize="22" fill={ink}>A</text>
      <text x="60" y="108" fontSize="22" fill={ink}>B</text>
      <text x="328" y="89" fontSize="22" fill={ink}>Y</text>
      <text x="190" y="90" textAnchor="middle" fontSize="18" fontWeight="700" fill={ink}>{type}</text>
    </g>
  );
}

function TimingWorksheet({ type, solution }: { type: "AND" | "OR"; solution: boolean }) {
  const rule = type === "AND" ? "11だけ1" : "00だけ0";
  return (
    <svg viewBox="0 0 620 300" role="img" aria-label={type + "ゲートの汎用4区間記入欄"}>
      <rect x="1" y="1" width="618" height="298" rx="16" fill="#f7fbfd" stroke={grid} />
      <Gate type={type} />
      <text x="425" y="42" textAnchor="middle" fontSize="15" fill={accent}>汎用記入図：具体的なAB列は問題文を使用</text>
      <rect x="290" y="60" width="270" height="156" fill="#fff" stroke={grid} />
      {["区間", "A", "B", "Y"].map((label, row) => <text key={label} x="315" y={88 + row * 38} fontSize="16" fontWeight={row === 0 ? 700 : 500} fill={ink}>{label}</text>)}
      {[1, 2, 3, 4].map((interval, column) => <g key={interval}>
        <line x1={350 + column * 52} y1="60" x2={350 + column * 52} y2="216" stroke={grid} />
        <text x={376 + column * 52} y="88" textAnchor="middle" fontSize="15" fill={ink}>{interval}</text>
        {[0, 1, 2].map((row) => <line key={row} x1={360 + column * 52} y1={116 + row * 38} x2={392 + column * 52} y2={116 + row * 38} stroke={row === 2 ? answer : grid} strokeWidth="2" />)}
      </g>)}
      {[98, 136, 174].map((y) => <line key={y} x1="290" y1={y} x2="560" y2={y} stroke={grid} />)}
      <text x="425" y="252" textAnchor="middle" fontSize="17" fontWeight={solution ? 700 : 500} fill={solution ? answer : ink}>
        {solution ? type + "の判定規則：" + rule : "問題文のABを転記して、各区間のYを求める"}
      </text>
    </svg>
  );
}
function Block({ label, inputs, outputs, x = 180, y = 55 }: { label: string; inputs: string[]; outputs: string[]; x?: number; y?: number }) {
  return (
    <g>
      <rect x={x} y={y} width="150" height="120" rx="8" fill="#fff" stroke={ink} strokeWidth="4" />
      <text x={x + 75} y={y + 68} textAnchor="middle" fontSize="25" fontWeight="800" fill={ink}>{label}</text>
      {inputs.map((input, index) => {
        const yy = y + 30 + index * 32;
        return <g key={input}><path d={"M" + (x - 70) + " " + yy + "H" + x} stroke={ink} strokeWidth="4" /><text x={x - 80} y={yy + 7} textAnchor="end" fontSize="19" fill={ink}>{input}</text></g>;
      })}
      {outputs.map((output, index) => {
        const yy = y + 38 + index * 42;
        return <g key={output}><path d={"M" + (x + 150) + " " + yy + "H" + (x + 220)} stroke={ink} strokeWidth="4" /><text x={x + 230} y={yy + 7} fontSize="19" fill={ink}>{output}</text></g>;
      })}
      <path d={"M" + (x - 70) + " " + (y + 101) + "H" + x} stroke={accent} strokeWidth="4" />
      <path d={"M" + x + " " + (y + 91) + "l14 10-14 10"} fill="none" stroke={accent} strokeWidth="3" />
      <text x={x - 80} y={y + 108} textAnchor="end" fontSize="16" fill={accent}>CLK</text>
    </g>
  );
}

function FlipFlopWorksheet({ kind, solution }: { kind: "d-ff" | "jk-ff"; solution: boolean }) {
  const inputs = kind === "d-ff" ? ["D"] : ["J", "K"];
  return (
    <svg viewBox="0 0 620 300" role="img" aria-label={(kind === "d-ff" ? "D" : "JK") + "フリップフロップと波形記入欄"}>
      <rect x="1" y="1" width="618" height="298" rx="16" fill="#f7fbfd" stroke={grid} />
      <Block label={kind === "d-ff" ? "D-FF" : "JK-FF"} inputs={inputs} outputs={["Q", "Q̅"]} x={100} y={35} />
      {[350, 395, 440, 485, 530, 575].map((x) => <line key={x} x1={x} y1="35" x2={x} y2="254" stroke={grid} strokeDasharray="4 5" />)}
      <text x="330" y="76" textAnchor="end" fontSize="17" fill={ink}>{kind === "d-ff" ? "D" : "J,K"}</text>
      <text x="330" y="128" textAnchor="end" fontSize="17" fill={ink}>CLK</text>
      <text x="330" y="186" textAnchor="end" fontSize="17" fill={ink}>Q</text>
      <path d="M350 116H372V96H395V116H417V96H440V116H462V96H485V116H507V96H530V116H552V96H575" fill="none" stroke={accent} strokeWidth="3" />
      <line x1="350" y1="180" x2="575" y2="180" stroke={answer} strokeWidth="2" strokeDasharray="8 8" />
      {solution
        ? <text x="462" y="225" textAnchor="middle" fontSize="19" fontWeight="700" fill={answer}>{kind === "d-ff" ? "各↑で Q←D" : "00保持 / 01→0 / 10→1 / 11反転"}</text>
        : <text x="462" y="225" textAnchor="middle" fontSize="17" fill={answer}>問題文の入力を各有効エッジへ書き、Q波形を完成</text>}
    </svg>
  );
}

function SrLatch({ solution }: { solution: boolean }) {
  return (
    <svg viewBox="0 0 620 300" role="img" aria-label="NOR形SRラッチ回路と動作表記入欄">
      <rect x="1" y="1" width="618" height="298" rx="16" fill="#f7fbfd" stroke={grid} />
      <path d="M90 78H185M90 218H185" stroke={ink} strokeWidth="4" />
      <text x="70" y="85" fontSize="22" fill={ink}>S</text><text x="70" y="225" fontSize="22" fill={ink}>R</text>
      <path d="M185 45Q210 78 185 111Q235 107 270 78Q235 49 185 45Z" fill="#fff" stroke={ink} strokeWidth="4" />
      <path d="M185 185Q210 218 185 251Q235 247 270 218Q235 189 185 185Z" fill="#fff" stroke={ink} strokeWidth="4" />
      <circle cx="278" cy="78" r="8" fill="#fff" stroke={ink} strokeWidth="4" /><circle cx="278" cy="218" r="8" fill="#fff" stroke={ink} strokeWidth="4" />
      <path d="M286 78H370M286 218H370M335 78V145H160V205H185M335 218V155H150V92H185" fill="none" stroke={ink} strokeWidth="4" />
      <text x="380" y="85" fontSize="22" fill={ink}>Q</text><text x="380" y="225" fontSize="22" fill={ink}>Q̅</text>
      <rect x="435" y="45" width="150" height="205" rx="8" fill="#fff" stroke={grid} />
      <text x="510" y="75" textAnchor="middle" fontSize="18" fontWeight="700" fill={ink}>動作表</text>
      <text x="458" y="108" fontSize="16" fill={ink}>S R</text><text x="536" y="108" fontSize="16" fill={ink}>Q+</text>
      {["0 0", "1 0", "0 1", "1 1"].map((row, index) => <text key={row} x="458" y={140 + index * 28} fontSize="16" fill={ink}>{row}</text>)}
      {solution
        ? ["Q", "1", "0", "禁止"].map((row, index) => <text key={row} x="536" y={140 + index * 28} fontSize="16" fontWeight="700" fill={answer}>{row}</text>)
        : [0, 1, 2, 3].map((row) => <line key={row} x1="530" y1={138 + row * 28} x2="570" y2={138 + row * 28} stroke={answer} strokeWidth="2" />)}
    </svg>
  );
}

function Register({ solution }: { solution: boolean }) {
  return (
    <svg viewBox="0 0 620 300" role="img" aria-label="2ビット並列レジスタとタイミング記入欄">
      <rect x="1" y="1" width="618" height="298" rx="16" fill="#f7fbfd" stroke={grid} />
      <Block label="D-FF 1" inputs={["D1"]} outputs={["Q1"]} x={80} y={25} />
      <Block label="D-FF 0" inputs={["D0"]} outputs={["Q0"]} x={80} y={160} />
      <path d="M20 143H55V126H80M55 143V261H80" fill="none" stroke={accent} strokeWidth="4" />
      <text x="20" y="135" fontSize="16" fill={accent}>共通CLK</text>
      <rect x="395" y="45" width="190" height="200" rx="8" fill="#fff" stroke={grid} />
      <text x="490" y="77" textAnchor="middle" fontSize="18" fontWeight="700" fill={ink}>正エッジごとの記録欄</text>
      <text x="420" y="112" fontSize="16" fill={ink}>edge</text><text x="480" y="112" fontSize="16" fill={ink}>D1D0</text><text x="545" y="112" fontSize="16" fill={ink}>Q1Q0</text>
      {[1, 2, 3].map((edge, index) => <g key={edge}><text x="435" y={148 + index * 38} fontSize="17" fill={ink}>{edge}</text><line x1="478" y1={144 + index * 38} x2="520" y2={144 + index * 38} stroke={answer} strokeWidth="2" /><line x1="542" y1={144 + index * 38} x2="578" y2={144 + index * 38} stroke={answer} strokeWidth="2" /></g>)}
      {solution && <text x="490" y="275" textAnchor="middle" fontSize="18" fontWeight="700" fill={answer}>各行で Q1Q0 ← D1D0</text>}
    </svg>
  );
}

function Counter({ down, solution }: { down: boolean; solution: boolean }) {
  const sequence = down
    ? "111→110→101→100→011→010→001→000→111"
    : "000→001→010→011→100→101→110→111→000";
  return (
    <svg viewBox="0 0 620 300" role="img" aria-label={"3ビット非同期" + (down ? "ダウン" : "アップ") + "カウンタの汎用図"}>
      <rect x="1" y="1" width="618" height="298" rx="16" fill="#f7fbfd" stroke={grid} />
      <text x="310" y="30" textAnchor="middle" fontSize="15" fill={accent}>非同期の汎用図：具体的な現在状態は問題文を使用</text>
      {[85, 255, 425].map((x, index) => <g key={x}><rect x={x} y="65" width="110" height="100" rx="7" fill="#fff" stroke={ink} strokeWidth="4" /><text x={x + 55} y="105" textAnchor="middle" fontSize="19" fontWeight="800" fill={ink}>JK-FF {index}</text><text x={x + 55} y="139" textAnchor="middle" fontSize="16" fill={accent}>J=K=1</text></g>)}
      <path d="M25 115H85M195 115H255M365 115H425M535 115H590" fill="none" stroke={ink} strokeWidth="4" />
      <text x="23" y="100" fontSize="16" fill={ink}>CLK</text>
      <text x="575" y="100" fontSize="16" fill={ink}>{down ? "DOWN" : "UP"}</text>
      <text x="310" y="210" textAnchor="middle" fontSize="18" fontWeight="700" fill={ink}>状態遷移記入欄</text>
      {solution
        ? <text x="310" y="250" textAnchor="middle" fontSize="15" fontWeight="700" fill={answer}>{sequence}</text>
        : <><line x1="85" y1="247" x2="535" y2="247" stroke={answer} strokeWidth="2" strokeDasharray="10 8" /><text x="310" y="277" textAnchor="middle" fontSize="15" fill={answer}>現在状態から指定方向へ記入</text></>}
    </svg>
  );
}

function SynchronousCounter({ solution }: { solution: boolean }) {
  return (
    <svg viewBox="0 0 620 340" role="img" aria-label="共通CLKの3ビット同期アップカウンタ">
      <rect x="1" y="1" width="618" height="338" rx="16" fill="#f7fbfd" stroke={grid} />
      <text x="310" y="28" textAnchor="middle" fontSize="16" fontWeight="700" fill={accent}>p.6：3ビット同期アップカウンタ</text>
      {[60, 255, 450].map((x, index) => <g key={x}>
        <rect x={x} y="82" width="110" height="100" rx="7" fill="#fff" stroke={ink} strokeWidth="4" />
        <text x={x + 55} y="118" textAnchor="middle" fontSize="18" fontWeight="800" fill={ink}>JK-FF {index}</text>
        <text x={x + 55} y="151" textAnchor="middle" fontSize="16" fill={accent}>{index === 0 ? "J0=K0=1" : index === 1 ? "J1=K1=Q0" : "J2=K2=Q0Q1"}</text>
        <path d={"M" + (x + 55) + " 224V182"} stroke={accent} strokeWidth="4" />
        <path d={"M" + (x + 45) + " 182l10-12 10 12"} fill="none" stroke={accent} strokeWidth="3" />
        <path d={"M" + (x + 110) + " 132H" + (x + 138)} stroke={ink} strokeWidth="4" />
        <text x={x + 142} y="138" fontSize="16" fill={ink}>{"Q" + index}</text>
      </g>)}
      <path d="M28 224H585" stroke={accent} strokeWidth="4" />
      <text x="30" y="215" fontSize="16" fill={accent}>共通CLK</text>
      <path d="M198 132H220V64H246V102H255M220 132V162H255" fill="none" stroke={ink} strokeWidth="3" />
      <text x="226" y="56" fontSize="14" fill={ink}>Q0</text>
      <path d="M198 132H374V54H390M393 132H408V70H390" fill="none" stroke={ink} strokeWidth="3" />
      <rect x="390" y="43" width="42" height="38" rx="5" fill="#fff" stroke={ink} strokeWidth="3" />
      <text x="411" y="67" textAnchor="middle" fontSize="14" fontWeight="700" fill={ink}>AND</text>
      <path d="M432 62H442V102H450M442 102V162H450" fill="none" stroke={ink} strokeWidth="3" />
      <text x="310" y="263" textAnchor="middle" fontSize="17" fontWeight="700" fill={ink}>状態遷移</text>
      {solution
        ? <text x="310" y="300" textAnchor="middle" fontSize="15" fontWeight="700" fill={answer}>000→001→010→011→100→101→110→111→000</text>
        : <><line x1="70" y1="296" x2="550" y2="296" stroke={answer} strokeWidth="2" strokeDasharray="9 7" /><text x="310" y="326" textAnchor="middle" fontSize="14" fill={answer}>本文の現在状態から、共通CLKごとに同時更新</text></>}
    </svg>
  );
}
function StateMachine({ kind, solution }: { kind: "mealy" | "moore" | "state-analysis"; solution: boolean }) {
  if (kind === "state-analysis") {
    return (
      <svg viewBox="0 0 620 300" role="img" aria-label="順序回路解析の汎用ブロック図と状態表記入欄">
        <rect x="1" y="1" width="618" height="298" rx="16" fill="#f7fbfd" stroke={grid} />
        <text x="205" y="28" textAnchor="middle" fontSize="15" fill={accent}>汎用解析図：具体的な論理式は問題文を使用</text>
        <path d="M28 83H92M28 196H92" stroke={ink} strokeWidth="4" /><text x="15" y="89" fontSize="18" fill={ink}>A</text><text x="15" y="202" fontSize="18" fill={ink}>A</text>
        <rect x="92" y="48" width="120" height="72" rx="7" fill="#fff" stroke={ink} strokeWidth="3" /><text x="152" y="79" textAnchor="middle" fontSize="16" fontWeight="700" fill={ink}>次状態論理</text><text x="152" y="101" textAnchor="middle" fontSize="14" fill={accent}>F(S,A)</text>
        <path d="M212 83H250" stroke={ink} strokeWidth="4" /><text x="228" y="73" textAnchor="middle" fontSize="15" fill={ink}>D=S+</text>
        <rect x="250" y="48" width="100" height="72" rx="7" fill="#fff" stroke={ink} strokeWidth="3" /><text x="300" y="91" textAnchor="middle" fontSize="20" fontWeight="800" fill={ink}>D-FF</text>
        <path d="M350 83H385" stroke={ink} strokeWidth="4" /><text x="365" y="73" fontSize="16" fill={ink}>S</text>
        <path d="M370 83V145H72V103H92" fill="none" stroke={ink} strokeWidth="3" />
        <rect x="92" y="161" width="120" height="72" rx="7" fill="#fff" stroke={ink} strokeWidth="3" /><text x="152" y="192" textAnchor="middle" fontSize="16" fontWeight="700" fill={ink}>出力論理</text><text x="152" y="214" textAnchor="middle" fontSize="14" fill={accent}>G(S,A)</text>
        <path d="M212 197H365" stroke={ink} strokeWidth="4" /><text x="374" y="203" fontSize="18" fill={ink}>Y</text>
        <path d="M335 145V197H212" fill="none" stroke={ink} strokeWidth="3" />
        <rect x="415" y="35" width="165" height="220" rx="8" fill="#fff" stroke={grid} />
        <text x="498" y="68" textAnchor="middle" fontSize="18" fontWeight="700" fill={ink}>状態表</text>
        <text x="440" y="102" fontSize="15" fill={ink}>S A</text><text x="490" y="102" fontSize="15" fill={ink}>S+</text><text x="540" y="102" fontSize="15" fill={ink}>Y</text>
        {["0 0", "0 1", "1 0", "1 1"].map((row, index) => <g key={row}><text x="440" y={135 + index * 30} fontSize="15" fill={ink}>{row}</text><line x1="490" y1={131 + index * 30} x2="520" y2={131 + index * 30} stroke={answer} /><line x1="540" y1={131 + index * 30} x2="570" y2={131 + index * 30} stroke={answer} /></g>)}
        {solution && <text x="205" y="270" textAnchor="middle" fontSize="16" fontWeight="700" fill={answer}>問題文の S+ と Y へ S,A を代入</text>}
      </svg>
    );
  }  const mealy = kind === "mealy";
  return (
    <svg viewBox="0 0 620 300" role="img" aria-label={(mealy ? "Mealy" : "Moore") + "状態遷移図"}>
      <rect x="1" y="1" width="618" height="298" rx="16" fill="#f7fbfd" stroke={grid} />
      <circle cx="175" cy="145" r="55" fill="#fff" stroke={ink} strokeWidth="4" />
      <circle cx="445" cy="145" r="55" fill="#fff" stroke={ink} strokeWidth="4" />
      <text x="175" y="139" textAnchor="middle" fontSize="22" fontWeight="800" fill={ink}>S0</text>
      <text x="445" y="139" textAnchor="middle" fontSize="22" fontWeight="800" fill={ink}>S1</text>
      {!mealy && <><text x="175" y="165" textAnchor="middle" fontSize="16" fill={answer}>/ Y=0</text><text x="445" y="165" textAnchor="middle" fontSize="16" fill={answer}>/ Y=1</text></>}
      <path d="M230 125Q310 65 390 125" fill="none" stroke={ink} strokeWidth="4" />
      <path d="M390 165Q310 225 230 165" fill="none" stroke={ink} strokeWidth="4" />
      <path d="M385 116l10 9-14 4M235 174l-10-9 14-4" fill="none" stroke={ink} strokeWidth="3" />
      {solution
        ? <><text x="310" y="75" textAnchor="middle" fontSize="18" fontWeight="700" fill={answer}>{mealy ? "X/Y" : "X"}</text><text x="310" y="238" textAnchor="middle" fontSize="18" fontWeight="700" fill={answer}>{mealy ? "X/Y" : "X"}</text></>
        : <><rect x="278" y="55" width="64" height="28" fill="#fff" stroke={answer} strokeDasharray="4 3" /><rect x="278" y="222" width="64" height="28" fill="#fff" stroke={answer} strokeDasharray="4 3" /></>}
      <text x="310" y="282" textAnchor="middle" fontSize="15" fill={accent}>{mealy ? "枝へ 入力/出力" : "状態内へ出力、枝へ入力"}</text>
    </svg>
  );
}

export default function DigitalCircuitDiagram({ kind, solution = false, title, compact = false }: Props) {
  return (
    <figure className={"digital-circuit-diagram" + (compact ? " is-compact" : "")}>
      {title && <figcaption>{title}</figcaption>}
      {kind === "and-timing" && <TimingWorksheet type="AND" solution={solution} />}
      {kind === "or-timing" && <TimingWorksheet type="OR" solution={solution} />}
      {kind === "sr-latch" && <SrLatch solution={solution} />}
      {(kind === "d-ff" || kind === "jk-ff") && <FlipFlopWorksheet kind={kind} solution={solution} />}
      {kind === "parallel-register" && <Register solution={solution} />}
      {kind === "ripple-up" && <Counter down={false} solution={solution} />}
      {kind === "ripple-down" && <Counter down solution={solution} />}
      {kind === "sync-counter" && <SynchronousCounter solution={solution} />}
      {(kind === "mealy" || kind === "moore" || kind === "state-analysis") && <StateMachine kind={kind} solution={solution} />}
    </figure>
  );
}
