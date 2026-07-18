export type MaterialMechanicsGeneratorTemplateId =
  | "material-solid-shaft-stress"
  | "material-hollow-shaft-stress"
  | "material-coil-spring-deflection"
  | "material-simple-beam-udl";

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
    parameterRange: "d=18〜40 mm、T=0.30〜2.50 kN·m",
    formula: "\\tau_{max}=\\frac{16T}{\\pi d^3}",
    sourceReferenceIds: ["mm-f-solid", "mm-f-tau-max"],
    sourceLabel: "材料力学範囲ZIP p.2・3・9",
  },
  {
    id: "material-hollow-shaft-stress",
    title: "中空丸軸の最大せん断応力",
    category: "中空軸設計",
    parameterRange: "do=50〜100 mm、di/do=0.40〜0.70、T=1.0〜12.0 kN·m",
    formula: "\\tau_{max}=\\frac{16Td_o}{\\pi(d_o^4-d_i^4)}",
    sourceReferenceIds: ["mm-f-hollow", "mm-f-tau-max"],
    sourceLabel: "材料力学範囲ZIP p.2・9",
  },
  {
    id: "material-coil-spring-deflection",
    title: "密巻コイルばねのたわみ",
    category: "コイルばね",
    parameterRange: "G=76〜82 GPa、d=10〜22 mm、D=80〜220 mm、n=5〜12、P=200〜1500 N",
    formula: "\\delta=\\frac{8nPD^3}{Gd^4}",
    sourceReferenceIds: ["mm-f-spring-rate", "mm-f-spring-deflection"],
    sourceLabel: "材料力学範囲ZIP p.4・9",
  },
  {
    id: "material-simple-beam-udl",
    title: "等分布荷重を受ける単純支持ばり",
    category: "はり・反力・BMD",
    parameterRange: "L=2.0〜8.0 m、w=1.0〜6.0 kN/m",
    formula: "R_A=R_B=\\frac{wL}{2},\\quad M_{max}=\\frac{wL^2}{8}",
    sourceReferenceIds: ["mm-f-resultant", "mm-f-equilibrium", "mm-f-simple-udl", "mm-f-beam-diff"],
    sourceLabel: "材料力学範囲ZIP p.5〜8＋形式2範囲一致部",
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