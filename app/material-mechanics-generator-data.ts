export type MaterialMechanicsGeneratorTemplateId =
  | "material-solid-shaft-stress"
  | "material-hollow-shaft-stress"
  | "material-coil-spring-deflection"
  | "material-simple-beam-udl"
  | "material-simple-beam-point-rect"
  | "material-simple-beam-udl-rect"
  | "material-cantilever-tip-hollow"
  | "material-cantilever-udl-hollow";

export type MaterialMechanicsGeneratorRandom = { int: (minimum: number, maximum: number) => number };
export type MaterialMechanicsGeneratedSpec = {
  templateId: MaterialMechanicsGeneratorTemplateId;
  category: string;
  title: string;
  prompt: string;
  context: string;
  answer: string;
  numericAnswer: number;
  tolerance: number;
  expectedUnit: string;
  acceptedUnitScales: Record<string, number>;
  formula: string;
  steps: string[];
  reason: string;
  explanation: string;
  parameters: Record<string, number>;
  sourceLabel: string;
  sourcePages: number[];
  sourceReferenceIds: string[];
  finiteValues: number[];
  denominators: number[];
  radicands: number[];
  difficulty: 3;
  subpartCount: number;
  sourceBasis: string[];
};

export const MATERIAL_MECHANICS_GENERATOR_TEMPLATES = [
  {
    id: "material-solid-shaft-stress",
    title: "中実丸軸の最大せん断応力",
    category: "ねじり・軸設計",
    parameterRange: "P=8〜30 kW、N=600〜1800 rpm、d=30〜60 mm、L=800〜1800 mm、G=76〜82 GPa",
    formula: "\\tau_{max}=\\frac{16T}{\\pi d^3}",
    sourceReferenceIds: ["mm-f-solid", "mm-f-tau-max"],
    sourceLabel: "材料力学範囲ZIP p.2・3・9",
  },
  {
    id: "material-hollow-shaft-stress",
    title: "中空丸軸の最大せん断応力",
    category: "中空軸設計",
    parameterRange: "P=80〜240 kW、N=80〜240 rpm、di/do=0.40〜0.70、τal=120〜220 MPa",
    formula: "\\tau_{max}=\\frac{16Td_o}{\\pi(d_o^4-d_i^4)}",
    sourceReferenceIds: ["mm-f-hollow", "mm-f-tau-max"],
    sourceLabel: "材料力学範囲ZIP p.2・9",
  },
  {
    id: "material-coil-spring-deflection",
    title: "密巻コイルばねのたわみ",
    category: "コイルばね",
    parameterRange: "G=76〜82 GPa、d=12〜22 mm、D=100〜220 mm、n=5〜12、τal=350〜600 MPa、δal=20〜100 mm",
    formula: "\\delta=\\frac{8nPD^3}{Gd^4}",
    sourceReferenceIds: ["mm-f-spring-rate", "mm-f-spring-deflection"],
    sourceLabel: "材料力学範囲ZIP p.4・9",
  },
  {
    id: "material-simple-beam-udl",
    title: "等分布荷重を受ける単純支持ばり",
    category: "はり・反力・BMD",
    parameterRange: "L=2.0〜6.0 m、w=1.5〜6.0 kN/m、d=50〜120 mm",
    formula: "R_A=R_B=\\frac{wL}{2},\\quad M_{max}=\\frac{wL^2}{8}",
    sourceReferenceIds: ["mm-f-resultant", "mm-f-equilibrium", "mm-f-simple-udl", "mm-f-beam-diff"],
    sourceLabel: "材料力学範囲ZIP p.5〜8＋形式2範囲一致部",
  },
  {
    id: "material-simple-beam-point-rect",
    title: "集中荷重を受ける長方形断面単純支持ばり",
    category: "はり・曲げ応力",
    parameterRange: "L=3.0〜7.0 m、P=4〜20 kN、b=60〜180 mm、h=120〜260 mm",
    formula: "\\displaystyle M_{max}=\\frac{Pab}{L},\\quad Z=\\frac{bh^2}{6},\\quad \\sigma_{max}=\\frac{M_{max}}{Z}",
    sourceReferenceIds: ["mm-f-bending-stress", "mm-f-rectangle-bending", "mm-f-simple-point-general"],
    sourceLabel: "材料力学範囲ZIP p.10・11",
  },
  {
    id: "material-simple-beam-udl-rect",
    title: "等分布荷重を受ける長方形断面単純支持ばり",
    category: "はり・曲げ応力",
    parameterRange: "L=2.0〜6.0 m、w=1.5〜8.0 kN/m、b=60〜180 mm、h=120〜260 mm",
    formula: "\\displaystyle M_{max}=\\frac{wL^2}{8},\\quad Z=\\frac{bh^2}{6},\\quad \\sigma_{max}=\\frac{M_{max}}{Z}",
    sourceReferenceIds: ["mm-f-bending-stress", "mm-f-rectangle-bending", "mm-f-simple-udl"],
    sourceLabel: "材料力学範囲ZIP p.10・11",
  },
  {
    id: "material-cantilever-tip-hollow",
    title: "先端集中荷重を受ける中空円断面片持ちばり",
    category: "片持ちばり・曲げ応力",
    parameterRange: "L=1.0〜4.0 m、P=2〜12 kN、do=100〜200 mm、di=40〜90 mm（di<do）",
    formula: "\\displaystyle M_{max}=PL,\\quad Z=\\frac{\\pi(d_o^4-d_i^4)}{32d_o},\\quad \\sigma_{max}=\\frac{M_{max}}{Z}",
    sourceReferenceIds: ["mm-f-bending-stress", "mm-f-hollow-bending", "mm-f-cantilever-tip"],
    sourceLabel: "材料力学範囲ZIP p.10・12",
  },
  {
    id: "material-cantilever-udl-hollow",
    title: "等分布荷重を受ける中空円断面片持ちばり",
    category: "片持ちばり・曲げ応力",
    parameterRange: "L=1.0〜4.0 m、w=1.0〜6.0 kN/m、do=100〜200 mm、di=40〜90 mm（di<do）",
    formula: "\\displaystyle M_{max}=\\frac{wL^2}{2},\\quad Z=\\frac{\\pi(d_o^4-d_i^4)}{32d_o},\\quad \\sigma_{max}=\\frac{M_{max}}{Z}",
    sourceReferenceIds: ["mm-f-bending-stress", "mm-f-hollow-bending", "mm-f-cantilever-udl-free"],
    sourceLabel: "材料力学範囲ZIP p.10・13",
  },
] as const;

function rounded(value: number, digits = 3) { return Number(value.toFixed(digits)); }

export function buildMaterialMechanicsGeneratedSpec(
  templateId: MaterialMechanicsGeneratorTemplateId,
  random: MaterialMechanicsGeneratorRandom,
): MaterialMechanicsGeneratedSpec {
  if (templateId === "material-solid-shaft-stress") {
    const powerKw = random.int(8, 30);
    const rpm = random.int(6, 18) * 100;
    const d = random.int(3, 6) * 10;
    const length = random.int(8, 18) * 100;
    const g = random.int(76, 82);
    const omega = 2 * Math.PI * rpm / 60;
    const torqueNm = powerKw * 1000 / omega;
    const torqueNmm = torqueNm * 1000;
    const ip = Math.PI * d ** 4 / 32;
    const stress = 16 * torqueNmm / (Math.PI * d ** 3);
    const twistRad = torqueNmm * length / (g * 1000 * ip);
    const twistDeg = twistRad * 180 / Math.PI;
    return {
      templateId,
      category: "ねじり・軸設計",
      title: "動力から中実軸の応力・ねじり角まで",
      prompt: "角速度と伝達トルクを求め、最大せん断応力とねじり角を順に計算せよ。解答欄には最大せん断応力を入力する。",
      context: `動力P=${powerKw} kWをN=${rpm} rpmで伝達する、直径d=${d} mm、長さL=${length} mm、横弾性係数G=${g} GPaの中実丸軸。`,
      answer: `${rounded(stress, 2)} MPa`,
      numericAnswer: rounded(stress, 6),
      tolerance: Math.max(0.2, stress * 0.005),
      expectedUnit: "MPa",
      acceptedUnitScales: { MPa: 1, "N/mm2": 1, GPa: 1000 },
      formula: "\\begin{aligned}\\omega&=\\frac{2\\pi N}{60}\\\\T&=\\frac{P}{\\omega}\\\\I_p&=\\frac{\\pi d^4}{32}\\\\\\tau_{max}&=\\frac{16T}{\\pi d^3}\\\\\\Theta&=\\frac{TL}{GI_p}\\end{aligned}",
      steps: [
        `\\(\\omega=\\frac{2\\pi(${rpm})}{60}=${rounded(omega, 5)}\\,\\mathrm{rad/s}\\)、\\(T=\\frac{${powerKw * 1000}}{${rounded(omega, 5)}}=${rounded(torqueNm, 3)}\\,\\mathrm{N\\,m}\\)。`,
        `\\(T=${rounded(torqueNmm, 1)}\\,\\mathrm{N\\,mm}\\)、\\(I_p=\\frac{\\pi(${d})^4}{32}=${rounded(ip, 1)}\\,\\mathrm{mm^4}\\)。`,
        `\\(\\tau_{max}=\\frac{16(${rounded(torqueNmm, 1)})}{\\pi(${d})^3}=${rounded(stress, 2)}\\,\\mathrm{MPa}\\)。`,
        `照査として \\(\\Theta=\\frac{${rounded(torqueNmm, 1)}(${length})}{${g * 1000}(${rounded(ip, 1)})}=${rounded(twistRad, 6)}\\,\\mathrm{rad}=${rounded(twistDeg, 3)}^\\circ\\)。`,
      ],
      reason: "過去問と範囲プリント同様、rpmを角速度へ直してトルクを得てから断面量・応力・変形へ接続する。",
      explanation: `最終採点値は${rounded(stress, 2)} MPa。途中で得るT=${rounded(torqueNm, 3)} N·mとΘ=${rounded(twistDeg, 3)}°も答案に残す。単発の公式代入ではなく、動力→トルク→断面量→応力・ねじり角の連続計算である。`,
      parameters: { powerKw, rpm, d, length, g, omega, torqueNm, torqueNmm, ip, stress, twistRad, twistDeg },
      sourceLabel: "材料力学範囲ZIP p.2・3・9",
      sourcePages: [2, 3, 9],
      sourceReferenceIds: ["mm-f-power", "mm-f-solid", "mm-f-tau-max", "mm-f-twist"],
      finiteValues: [powerKw, rpm, d, length, g, omega, torqueNm, torqueNmm, ip, stress, twistRad, twistDeg],
      denominators: [60, omega, Math.PI * d ** 3, g * 1000 * ip],
      radicands: [],
      difficulty: 3,
      subpartCount: 4,
      sourceBasis: ["範囲ZIP p.2・3の丸軸断面量", "範囲ZIP p.9の動力・ねじりまとめ演習"],
    };
  }

  if (templateId === "material-hollow-shaft-stress") {
    const powerKw = random.int(80, 240);
    const rpm = random.int(8, 24) * 10;
    const ratio = random.int(4, 7) / 10;
    const tauAllow = random.int(12, 22) * 10;
    const omega = 2 * Math.PI * rpm / 60;
    const torqueNm = powerKw * 1000 / omega;
    const torqueNmm = torqueNm * 1000;
    const sectionFactor = 1 - ratio ** 4;
    const outer = Math.cbrt(16 * torqueNmm / (Math.PI * tauAllow * sectionFactor));
    const inner = ratio * outer;
    const solid = Math.cbrt(16 * torqueNmm / (Math.PI * tauAllow));
    const areaRatio = (outer ** 2 - inner ** 2) / solid ** 2;
    return {
      templateId,
      category: "中空軸設計",
      title: "動力から中空軸の必要外径を設計",
      prompt: "動力から伝達トルクを求め、許容せん断応力を満たす必要外径doを設計せよ。さらに内径と同条件の中実軸径を照査する。解答欄にはdoを入力する。",
      context: `P=${powerKw} kW、N=${rpm} rpm、許容せん断応力τal=${tauAllow} MPa、内外径比n=di/do=${ratio.toFixed(2)}。`,
      answer: `${rounded(outer, 2)} mm`,
      numericAnswer: rounded(outer, 6),
      tolerance: Math.max(0.2, outer * 0.005),
      expectedUnit: "mm",
      acceptedUnitScales: { mm: 1, m: 1000 },
      formula: "\\begin{aligned}T&=\\frac{P}{\\frac{2\\pi N}{60}}\\\\d_o&=\\sqrt[3]{\\frac{16T}{\\pi\\tau_{al}(1-n^4)}}\\\\d_i&=nd_o\\end{aligned}",
      steps: [
        `\\(\\omega=\\frac{2\\pi(${rpm})}{60}=${rounded(omega, 5)}\\,\\mathrm{rad/s}\\)、\\(T=\\frac{${powerKw * 1000}}{${rounded(omega, 5)}}=${rounded(torqueNm, 2)}\\,\\mathrm{N\\,m}\\)。`,
        `\\(1-n^4=1-${ratio.toFixed(2)}^4=${rounded(sectionFactor, 5)}\\)。`,
        `\\(d_o=\\sqrt[3]{\\frac{16(${rounded(torqueNmm, 0)})}{\\pi(${tauAllow})(${rounded(sectionFactor, 5)})}}=${rounded(outer, 2)}\\,\\mathrm{mm}\\)、\\(d_i=${rounded(inner, 2)}\\,\\mathrm{mm}\\)。`,
        `同じT・τalの中実軸は \\(d_s=${rounded(solid, 2)}\\,\\mathrm{mm}\\)、断面積比は \\(A_h/A_s=${rounded(areaRatio, 3)}\\)。`,
      ],
      reason: "範囲プリントの動力問題と内外径比による中空軸設計を一つの連続問題へ結合する。",
      explanation: `必要外径は${rounded(outer, 2)} mm、内径は${rounded(inner, 2)} mm。rpmの単位変換を落とすと後続の径がすべて誤るため、角速度を最初に明記する。`,
      parameters: { powerKw, rpm, ratio, tauAllow, omega, torqueNm, torqueNmm, sectionFactor, outer, inner, solid, areaRatio },
      sourceLabel: "材料力学範囲ZIP p.2・3・9",
      sourcePages: [2, 3, 9],
      sourceReferenceIds: ["mm-f-power", "mm-f-hollow-ratio", "mm-f-tau-max"],
      finiteValues: [powerKw, rpm, ratio, tauAllow, omega, torqueNm, torqueNmm, sectionFactor, outer, inner, solid, areaRatio],
      denominators: [60, omega, Math.PI * tauAllow * sectionFactor, Math.PI * tauAllow, solid ** 2],
      radicands: [16 * torqueNmm / (Math.PI * tauAllow * sectionFactor), 16 * torqueNmm / (Math.PI * tauAllow)],
      difficulty: 3,
      subpartCount: 4,
      sourceBasis: ["範囲ZIP p.9の200 kW・120 rpm中空軸まとめ演習", "範囲ZIP p.2・3の中空断面量"],
    };
  }

  if (templateId === "material-coil-spring-deflection") {
    const g = random.int(76, 82);
    const d = random.int(12, 22);
    const diameter = random.int(10, 22) * 10;
    const turns = random.int(5, 12);
    const tauAllow = random.int(35, 60) * 10;
    const deflectionAllow = random.int(4, 20) * 5;
    const stiffness = g * 1000 * d ** 4 / (8 * turns * diameter ** 3);
    const stressLoad = tauAllow * Math.PI * d ** 3 / (8 * diameter);
    const deflectionLoad = stiffness * deflectionAllow;
    const allowable = Math.min(stressLoad, deflectionLoad);
    const governing = stressLoad <= deflectionLoad ? "せん断応力条件" : "たわみ条件";
    return {
      templateId,
      category: "コイルばね",
      title: "応力・たわみ二条件による許容荷重",
      prompt: "ばね定数k、せん断応力条件の上限Pτ、たわみ条件の上限Pδを求め、両条件を満たす許容荷重を決定せよ。",
      context: `G=${g} GPa、線径d=${d} mm、平均直径D=${diameter} mm、有効巻数n=${turns}、τal=${tauAllow} MPa、δal=${deflectionAllow} mm。Wahl係数と直接せん断補正は用いない。`,
      answer: `${rounded(allowable, 1)} N`,
      numericAnswer: rounded(allowable, 6),
      tolerance: Math.max(2, allowable * 0.005),
      expectedUnit: "N",
      acceptedUnitScales: { N: 1, kN: 1000 },
      formula: "\\begin{aligned}k&=\\frac{Gd^4}{8nD^3}\\\\P_\\tau&=\\frac{\\tau_{al}\\pi d^3}{8D}\\\\P_\\delta&=k\\delta_{al}\\\\P_{al}&=\\min(P_\\tau,P_\\delta)\\end{aligned}",
      steps: [
        `\\(G=${g * 1000}\\,\\mathrm{N/mm^2}\\)、\\(k=\\frac{${g * 1000}(${d})^4}{8(${turns})(${diameter})^3}=${rounded(stiffness, 4)}\\,\\mathrm{N/mm}\\)。`,
        `\\(P_\\tau=\\frac{${tauAllow}\\pi(${d})^3}{8(${diameter})}=${rounded(stressLoad, 1)}\\,\\mathrm{N}\\)。`,
        `\\(P_\\delta=${rounded(stiffness, 4)}(${deflectionAllow})=${rounded(deflectionLoad, 1)}\\,\\mathrm{N}\\)。`,
        `\\(P_{al}=\\min(${rounded(stressLoad, 1)},${rounded(deflectionLoad, 1)})=${rounded(allowable, 1)}\\,\\mathrm{N}\\)。支配条件は${governing}。`,
      ],
      reason: "本番形式と同じく、応力上限と変形上限を別々に計算し、小さい方を安全な荷重として採用する。",
      explanation: `許容荷重は${rounded(allowable, 1)} Nで、${governing}が支配する。範囲外のWahl係数は使用していない。`,
      parameters: { g, d, diameter, turns, tauAllow, deflectionAllow, stiffness, stressLoad, deflectionLoad, allowable },
      sourceLabel: "材料力学範囲ZIP p.4・9",
      sourcePages: [4, 9],
      sourceReferenceIds: ["mm-f-spring-rate", "mm-f-spring-stress", "mm-f-spring-deflection"],
      finiteValues: [g, d, diameter, turns, tauAllow, deflectionAllow, stiffness, stressLoad, deflectionLoad, allowable],
      denominators: [8 * turns * diameter ** 3, 8 * diameter],
      radicands: [],
      difficulty: 3,
      subpartCount: 4,
      sourceBasis: ["範囲ZIP p.4の密巻コイルばね導出", "範囲ZIP p.9の応力・たわみまとめ演習"],
    };
  }

  if (templateId === "material-simple-beam-point-rect") {
    const lengthDecimeters = random.int(30, 70);
    const length = lengthDecimeters / 10;
    const leftDistance = random.int(8, lengthDecimeters - 8) / 10;
    const rightDistance = length - leftDistance;
    const load = random.int(4, 20);
    const width = random.int(6, 18) * 10;
    const height = random.int(12, 26) * 10;
    const reactionA = load * rightDistance / length;
    const reactionB = load * leftDistance / length;
    const maxMoment = load * leftDistance * rightDistance / length;
    const inertia = width * height ** 3 / 12;
    const sectionModulus = width * height ** 2 / 6;
    const stress = maxMoment * 1e6 / sectionModulus;
    return {
      templateId,
      category: "はり・曲げ応力",
      title: "偏心集中荷重を受ける長方形断面単純支持ばり",
      prompt: "左右の支点反力を求め、集中荷重点の最大曲げモーメントから最大曲げ応力を計算せよ。解答欄には最大曲げ応力を入力する。",
      context: `支間L=${length} m、左支点からa=${leftDistance} mの位置に集中荷重P=${load} kN。断面は幅b=${width} mm、高さh=${height} mmの長方形。`,
      answer: `${rounded(stress, 2)} MPa`,
      numericAnswer: rounded(stress, 6),
      tolerance: Math.max(0.3, stress * 0.005),
      expectedUnit: "MPa",
      acceptedUnitScales: { MPa: 1, "N/mm2": 1, GPa: 1000 },
      formula: "\\begin{aligned}R_A&=\\frac{P(L-a)}{L}\\\\R_B&=\\frac{Pa}{L}\\\\M_{max}&=\\frac{Pa(L-a)}{L}\\\\I&=\\frac{bh^3}{12}\\\\Z&=\\frac{2I}{h}=\\frac{bh^2}{6}\\\\\\sigma_{max}&=\\frac{M_{max}}{Z}\\end{aligned}",
      steps: [
        `\\(L-a=${rounded(rightDistance, 2)}\\,\\mathrm{m}\\)、\\(R_A=\\frac{${load}(${rounded(rightDistance, 2)})}{${length}}=${rounded(reactionA, 3)}\\,\\mathrm{kN}\\)、\\(R_B=${rounded(reactionB, 3)}\\,\\mathrm{kN}\\)。`,
        `荷重点で最大となり、\\(M_{max}=\\frac{${load}(${leftDistance})(${rounded(rightDistance, 2)})}{${length}}=${rounded(maxMoment, 4)}\\,\\mathrm{kN\\,m}\\)。`,
        `\\(I=\\frac{${width}(${height})^3}{12}=${rounded(inertia, 1)}\\,\\mathrm{mm^4}\\)、\\(Z=\\frac{${width}(${height})^2}{6}=${rounded(sectionModulus, 1)}\\,\\mathrm{mm^3}\\)。`,
        `\\(\\sigma_{max}=\\frac{${rounded(maxMoment * 1e6, 0)}}{${rounded(sectionModulus, 1)}}=${rounded(stress, 2)}\\,\\mathrm{N/mm^2}=${rounded(stress, 2)}\\,\\mathrm{MPa}\\)。`,
      ],
      reason: "一般位置の集中荷重について、つり合いから反力を求め、荷重点の最大曲げモーメントを長方形断面の断面係数へ接続する。",
      explanation: `最大曲げ応力は${rounded(stress, 2)} MPa。aとL-aを取り違えず、曲げモーメントをkN·mからN·mmへ変換してからZで割る。`,
      parameters: { lengthDecimeters, length, leftDistance, rightDistance, load, width, height, reactionA, reactionB, maxMoment, inertia, sectionModulus, stress },
      sourceLabel: "材料力学範囲ZIP p.10・11",
      sourcePages: [10, 11],
      sourceReferenceIds: ["mm-f-bending-stress", "mm-f-rectangle-bending", "mm-f-simple-point-general"],
      finiteValues: [lengthDecimeters, length, leftDistance, rightDistance, load, width, height, reactionA, reactionB, maxMoment, inertia, sectionModulus, stress],
      denominators: [length, 12, 6, sectionModulus],
      radicands: [],
      difficulty: 3,
      subpartCount: 4,
      sourceBasis: ["範囲ZIP p.10の共通問題シート", "範囲ZIP p.11の一般位置集中荷重と長方形断面の曲げ応力"],
    };
  }

  if (templateId === "material-simple-beam-udl-rect") {
    const length = random.int(4, 12) / 2;
    const intensity = random.int(3, 16) / 2;
    const width = random.int(6, 18) * 10;
    const height = random.int(12, 26) * 10;
    const resultant = intensity * length;
    const reaction = resultant / 2;
    const maxMoment = intensity * length ** 2 / 8;
    const inertia = width * height ** 3 / 12;
    const sectionModulus = width * height ** 2 / 6;
    const stress = maxMoment * 1e6 / sectionModulus;
    return {
      templateId,
      category: "はり・曲げ応力",
      title: "等分布荷重を受ける長方形断面単純支持ばり",
      prompt: "等価集中荷重と左右の支点反力を求め、中央の最大曲げモーメントから最大曲げ応力を計算せよ。解答欄には最大曲げ応力を入力する。",
      context: `支間L=${length} mの単純支持ばり全体にw=${intensity} kN/m。断面は幅b=${width} mm、高さh=${height} mmの長方形。`,
      answer: `${rounded(stress, 2)} MPa`,
      numericAnswer: rounded(stress, 6),
      tolerance: Math.max(0.3, stress * 0.005),
      expectedUnit: "MPa",
      acceptedUnitScales: { MPa: 1, "N/mm2": 1, GPa: 1000 },
      formula: "\\begin{aligned}W&=wL\\\\R_A=R_B&=\\frac{wL}{2}\\\\M_{max}&=\\frac{wL^2}{8}\\\\I&=\\frac{bh^3}{12}\\\\Z&=\\frac{bh^2}{6}\\\\\\sigma_{max}&=\\frac{M_{max}}{Z}\\end{aligned}",
      steps: [
        `\\(W=wL=${intensity}(${length})=${rounded(resultant, 3)}\\,\\mathrm{kN}\\)、\\(R_A=R_B=${rounded(reaction, 3)}\\,\\mathrm{kN}\\)。`,
        `中央で最大となり、\\(M_{max}=\\frac{${intensity}(${length})^2}{8}=${rounded(maxMoment, 4)}\\,\\mathrm{kN\\,m}\\)。`,
        `\\(I=\\frac{${width}(${height})^3}{12}=${rounded(inertia, 1)}\\,\\mathrm{mm^4}\\)、\\(Z=\\frac{${width}(${height})^2}{6}=${rounded(sectionModulus, 1)}\\,\\mathrm{mm^3}\\)。`,
        `\\(\\sigma_{max}=\\frac{${rounded(maxMoment * 1e6, 0)}}{${rounded(sectionModulus, 1)}}=${rounded(stress, 2)}\\,\\mathrm{N/mm^2}=${rounded(stress, 2)}\\,\\mathrm{MPa}\\)。`,
      ],
      reason: "対称な等分布荷重を合力へ置き換え、単純支持ばりの中央最大モーメントと長方形断面の曲げ応力式を順に用いる。",
      explanation: `最大曲げ応力は${rounded(stress, 2)} MPa。荷重単位はkN/mのままMをkN·mで求め、応力計算時にN·mmへ変換する。`,
      parameters: { length, intensity, width, height, resultant, reaction, maxMoment, inertia, sectionModulus, stress },
      sourceLabel: "材料力学範囲ZIP p.10・11",
      sourcePages: [10, 11],
      sourceReferenceIds: ["mm-f-bending-stress", "mm-f-rectangle-bending", "mm-f-simple-udl"],
      finiteValues: [length, intensity, width, height, resultant, reaction, maxMoment, inertia, sectionModulus, stress],
      denominators: [2, 8, 12, 6, sectionModulus],
      radicands: [],
      difficulty: 3,
      subpartCount: 4,
      sourceBasis: ["範囲ZIP p.10の共通問題シート", "範囲ZIP p.11の単純支持ばり等分布荷重と長方形断面の曲げ応力"],
    };
  }

  if (templateId === "material-cantilever-tip-hollow") {
    const length = random.int(2, 8) / 2;
    const load = random.int(2, 12);
    const outerDiameter = random.int(10, 20) * 10;
    const innerDiameter = random.int(4, 9) * 10;
    const diameterFourthDifference = outerDiameter ** 4 - innerDiameter ** 4;
    const reaction = load;
    const maxMoment = load * length;
    const inertia = Math.PI * diameterFourthDifference / 64;
    const sectionModulus = Math.PI * diameterFourthDifference / (32 * outerDiameter);
    const stress = maxMoment * 1e6 / sectionModulus;
    return {
      templateId,
      category: "片持ちばり・曲げ応力",
      title: "先端集中荷重を受ける中空円断面片持ちばり",
      prompt: "固定端反力と固定端の最大曲げモーメントを求め、中空円断面の断面二次モーメント・断面係数から最大曲げ応力を計算せよ。解答欄には最大曲げ応力を入力する。",
      context: `長さL=${length} mの片持ちばりの自由端にP=${load} kN。断面は外径d_o=${outerDiameter} mm、内径d_i=${innerDiameter} mmの中空円。`,
      answer: `${rounded(stress, 2)} MPa`,
      numericAnswer: rounded(stress, 6),
      tolerance: Math.max(0.3, stress * 0.005),
      expectedUnit: "MPa",
      acceptedUnitScales: { MPa: 1, "N/mm2": 1, GPa: 1000 },
      formula: "\\begin{aligned}R&=P\\\\M_{max}&=PL\\\\I&=\\frac{\\pi(d_o^4-d_i^4)}{64}\\\\Z&=\\frac{2I}{d_o}=\\frac{\\pi(d_o^4-d_i^4)}{32d_o}\\\\\\sigma_{max}&=\\frac{M_{max}}{Z}\\end{aligned}",
      steps: [
        `径条件は\\(0<d_i=${innerDiameter}\\,\\mathrm{mm}<d_o=${outerDiameter}\\,\\mathrm{mm}\\)で、中空円断面が成立する。`,
        `固定端で\\(R=P=${reaction}\\,\\mathrm{kN}\\)、\\(M_{max}=PL=${load}(${length})=${rounded(maxMoment, 4)}\\,\\mathrm{kN\\,m}\\)。`,
        `\\(I=\\frac{\\pi[(${outerDiameter})^4-(${innerDiameter})^4]}{64}=${rounded(inertia, 1)}\\,\\mathrm{mm^4}\\)、\\(Z=\\frac{\\pi[(${outerDiameter})^4-(${innerDiameter})^4]}{32(${outerDiameter})}=${rounded(sectionModulus, 1)}\\,\\mathrm{mm^3}\\)。`,
        `\\(\\sigma_{max}=\\frac{${rounded(maxMoment * 1e6, 0)}}{${rounded(sectionModulus, 1)}}=${rounded(stress, 2)}\\,\\mathrm{N/mm^2}=${rounded(stress, 2)}\\,\\mathrm{MPa}\\)。`,
      ],
      reason: "自由端集中荷重の固定端モーメントを求め、中空円の外径四乗から内径四乗を差し引いた断面量で曲げ応力を評価する。",
      explanation: `最大曲げ応力は${rounded(stress, 2)} MPa。中空円断面では\\(d_i<d_o\\)を確認し、\\(d_o^4-d_i^4\\)を用いてIとZを求める。`,
      parameters: { length, load, outerDiameter, innerDiameter, diameterFourthDifference, reaction, maxMoment, inertia, sectionModulus, stress },
      sourceLabel: "材料力学範囲ZIP p.10・12",
      sourcePages: [10, 12],
      sourceReferenceIds: ["mm-f-bending-stress", "mm-f-hollow-bending", "mm-f-cantilever-tip"],
      finiteValues: [length, load, outerDiameter, innerDiameter, diameterFourthDifference, reaction, maxMoment, inertia, sectionModulus, stress],
      denominators: [64, 32 * outerDiameter, 2, sectionModulus],
      radicands: [],
      difficulty: 3,
      subpartCount: 4,
      sourceBasis: ["範囲ZIP p.10の共通問題シート", "範囲ZIP p.12の自由端集中荷重片持ちばりと中空円断面の曲げ応力"],
    };
  }

  if (templateId === "material-cantilever-udl-hollow") {
    const length = random.int(2, 8) / 2;
    const intensity = random.int(2, 12) / 2;
    const outerDiameter = random.int(10, 20) * 10;
    const innerDiameter = random.int(4, 9) * 10;
    const diameterFourthDifference = outerDiameter ** 4 - innerDiameter ** 4;
    const resultant = intensity * length;
    const reaction = resultant;
    const maxMoment = intensity * length ** 2 / 2;
    const inertia = Math.PI * diameterFourthDifference / 64;
    const sectionModulus = Math.PI * diameterFourthDifference / (32 * outerDiameter);
    const stress = maxMoment * 1e6 / sectionModulus;
    return {
      templateId,
      category: "片持ちばり・曲げ応力",
      title: "等分布荷重を受ける中空円断面片持ちばり",
      prompt: "等分布荷重を合力へ置き換えて固定端反力と最大曲げモーメントを求め、中空円断面の断面二次モーメント・断面係数から最大曲げ応力を計算せよ。解答欄には最大曲げ応力を入力する。",
      context: `長さL=${length} mの片持ちばり全体にw=${intensity} kN/m。断面は外径d_o=${outerDiameter} mm、内径d_i=${innerDiameter} mmの中空円。`,
      answer: `${rounded(stress, 2)} MPa`,
      numericAnswer: rounded(stress, 6),
      tolerance: Math.max(0.3, stress * 0.005),
      expectedUnit: "MPa",
      acceptedUnitScales: { MPa: 1, "N/mm2": 1, GPa: 1000 },
      formula: "\\begin{aligned}W&=wL\\\\R&=W\\\\M_{max}&=W\\frac{L}{2}=\\frac{wL^2}{2}\\\\I&=\\frac{\\pi(d_o^4-d_i^4)}{64}\\\\Z&=\\frac{2I}{d_o}=\\frac{\\pi(d_o^4-d_i^4)}{32d_o}\\\\\\sigma_{max}&=\\frac{M_{max}}{Z}\\end{aligned}",
      steps: [
        `径条件は\\(0<d_i=${innerDiameter}\\,\\mathrm{mm}<d_o=${outerDiameter}\\,\\mathrm{mm}\\)で、中空円断面が成立する。`,
        `\\(W=wL=${intensity}(${length})=${rounded(resultant, 3)}\\,\\mathrm{kN}\\)が固定端から\\(L/2\\)に作用し、\\(R=${rounded(reaction, 3)}\\,\\mathrm{kN}\\)、\\(M_{max}=\\frac{${intensity}(${length})^2}{2}=${rounded(maxMoment, 4)}\\,\\mathrm{kN\\,m}\\)。`,
        `\\(I=\\frac{\\pi[(${outerDiameter})^4-(${innerDiameter})^4]}{64}=${rounded(inertia, 1)}\\,\\mathrm{mm^4}\\)、\\(Z=\\frac{\\pi[(${outerDiameter})^4-(${innerDiameter})^4]}{32(${outerDiameter})}=${rounded(sectionModulus, 1)}\\,\\mathrm{mm^3}\\)。`,
        `\\(\\sigma_{max}=\\frac{${rounded(maxMoment * 1e6, 0)}}{${rounded(sectionModulus, 1)}}=${rounded(stress, 2)}\\,\\mathrm{N/mm^2}=${rounded(stress, 2)}\\,\\mathrm{MPa}\\)。`,
      ],
      reason: "等分布荷重の合力wLを中央に作用させ、固定端最大モーメントを中空円断面の断面係数へ接続する。",
      explanation: `最大曲げ応力は${rounded(stress, 2)} MPa。合力の作用位置L/2を確認し、中空円の\\(d_o^4-d_i^4\\)からIとZを求める。`,
      parameters: { length, intensity, outerDiameter, innerDiameter, diameterFourthDifference, resultant, reaction, maxMoment, inertia, sectionModulus, stress },
      sourceLabel: "材料力学範囲ZIP p.10・13",
      sourcePages: [10, 13],
      sourceReferenceIds: ["mm-f-bending-stress", "mm-f-hollow-bending", "mm-f-cantilever-udl-free"],
      finiteValues: [length, intensity, outerDiameter, innerDiameter, diameterFourthDifference, resultant, reaction, maxMoment, inertia, sectionModulus, stress],
      denominators: [2, 64, 32 * outerDiameter, sectionModulus],
      radicands: [],
      difficulty: 3,
      subpartCount: 4,
      sourceBasis: ["範囲ZIP p.10の共通問題シート", "範囲ZIP p.13の全長等分布荷重片持ちばりと中空円断面の曲げ応力"],
    };
  }

  const length = random.int(4, 12) / 2;
  const intensity = random.int(3, 12) / 2;
  const diameter = random.int(5, 12) * 10;
  const resultant = intensity * length;
  const reaction = resultant / 2;
  const maxMoment = intensity * length ** 2 / 8;
  const sectionModulus = Math.PI * diameter ** 3 / 32;
  const stress = maxMoment * 1e6 / sectionModulus;
  return {
    templateId,
    category: "はり・反力・SFD/BMD・曲げ応力",
    title: "反力からSFD/BMD・最大曲げ応力まで",
    prompt: "等価集中荷重と支点反力を求め、V(x)・M(x)を立ててSFD/BMDの形を判定し、最大曲げモーメントから最大曲げ応力を求めよ。解答欄には応力を入力する。",
    context: `支間L=${length} mの単純支持ばり全体にw=${intensity} kN/m。断面は直径d=${diameter} mmの中実円。`,
    answer: `${rounded(stress, 2)} MPa`,
    numericAnswer: rounded(stress, 6),
    tolerance: Math.max(0.3, stress * 0.005),
    expectedUnit: "MPa",
    acceptedUnitScales: { MPa: 1, "N/mm2": 1, GPa: 1000 },
    formula: "\\begin{aligned}R_A=R_B&=\\frac{wL}{2}\\\\V(x)&=R_A-wx\\\\M(x)&=R_Ax-\\frac{wx^2}{2}\\\\M_{max}&=\\frac{wL^2}{8}\\\\\\sigma_{max}&=\\frac{M_{max}}{\\frac{\\pi d^3}{32}}\\end{aligned}",
    steps: [
      `\\(W=wL=${intensity}(${length})=${rounded(resultant, 2)}\\,\\mathrm{kN}\\)、\\(R_A=R_B=${rounded(reaction, 2)}\\,\\mathrm{kN}\\)。`,
      `\\(V(x)=${rounded(reaction, 2)}-${intensity}x\\)、\\(M(x)=${rounded(reaction, 2)}x-${rounded(intensity / 2, 3)}x^2\\)。SFDは直線、BMDは放物線。`,
      `\\(V=0\\)となる中央で \\(M_{max}=\\frac{${intensity}(${length})^2}{8}=${rounded(maxMoment, 4)}\\,\\mathrm{kN\\,m}\\)。`,
      `\\(Z=\\frac{\\pi(${diameter})^3}{32}=${rounded(sectionModulus, 1)}\\,\\mathrm{mm^3}\\)、\\(\\sigma_{max}=\\frac{${rounded(maxMoment * 1e6, 0)}}{${rounded(sectionModulus, 1)}}=${rounded(stress, 2)}\\,\\mathrm{MPa}\\)。`,
    ],
    reason: "形式2の範囲一致部と同じく、荷重図→反力→せん断力→曲げモーメント→断面応力を一つのはりで追う。",
    explanation: `最終値は${rounded(stress, 2)} MPa。図では荷重と反力、SFDのゼロ交差、BMDの中央最大を対応させる。`,
    parameters: { length, intensity, diameter, resultant, reaction, maxMoment, sectionModulus, stress },
    sourceLabel: "材料力学範囲ZIP p.5〜8＋形式2第3問・第5問の範囲一致部",
    sourcePages: [5, 6, 8],
    sourceReferenceIds: ["mm-f-resultant", "mm-f-equilibrium", "mm-f-simple-udl", "mm-f-beam-diff", "mm-q-udl-mmax"],
    finiteValues: [length, intensity, diameter, resultant, reaction, maxMoment, sectionModulus, stress],
    denominators: [2, 8, sectionModulus],
    radicands: [],
    difficulty: 3,
    subpartCount: 5,
    sourceBasis: ["範囲ZIP p.5〜8の荷重・反力・SFD/BMD", "形式2第3問・第5問(1)(4)の範囲一致部"],
  };
}