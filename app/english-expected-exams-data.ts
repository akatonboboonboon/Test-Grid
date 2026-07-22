import {
  ENGLISH_PASSAGES,
  ENGLISH_QUESTIONS,
  ENGLISH_VOCAB,
  type EnglishQuestion,
  type EnglishVocabCard,
} from "./english-data";
import { ENGLISH_EXTRA_EXPLANATIONS } from "./english-explanations-extra";
import { ENGLISH_LANGUAGE_EXPLANATIONS } from "./english-explanations-language";
import { ENGLISH_READING_EXPLANATIONS } from "./english-explanations-reading";

export type EnglishExpectedUnit = "ch14" | "ch15" | "ch16" | "ch18" | "toeic" | "housing" | "medical";
type CoreEnglishExpectedUnit = "ch15" | "ch16" | "ch18";
export type EnglishExpectedSectionId =
  | "vocab-ja-en"
  | "vocab-en-ja"
  | "language"
  | "summary-abstract"
  | "order"
  | "sentence-ja-en"
  | "true-false"
  | "reading"
  | "translation";
export type EnglishExpectedFormat = "input" | "choice" | "order" | "translation";

export type EnglishExpectedReference = {
  label: string;
  paragraph?: number;
  quote?: string;
  translation?: string;
};

export type EnglishExpectedQuestion = {
  id: string;
  sourceId: string;
  unit: EnglishExpectedUnit;
  section: EnglishExpectedSectionId;
  genre: string;
  format: EnglishExpectedFormat;
  points: number;
  prompt: string;
  answer: string;
  accepted?: string[];
  options?: string[];
  tokens?: string[];
  semantic?: boolean;
  explanation: string;
  reference: EnglishExpectedReference;
};

export type EnglishExpectedExam = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  durationMinutes: 50;
  totalPoints: 100;
  questions: EnglishExpectedQuestion[];
};

export type EnglishExpectedSection = {
  id: EnglishExpectedSectionId;
  number: string;
  title: string;
  instruction: string;
  page: 1 | 2 | 3;
};

export const ENGLISH_EXPECTED_EXAM_STORAGE_KEY = "test-grid:english:expected-exam:v1";
export const ENGLISH_EXPECTED_EXAM_DURATION_MINUTES = 50;
export const ENGLISH_EXPECTED_EXAM_TOTAL_POINTS = 100;
const CORE_ENGLISH_EXPECTED_UNITS: CoreEnglishExpectedUnit[] = ["ch15", "ch16", "ch18"];
export const ENGLISH_EXPECTED_SCOPE_UNITS: EnglishExpectedUnit[] = ["ch14", "ch15", "ch16", "ch18", "toeic", "housing", "medical"];
export const ENGLISH_EXPECTED_FORMAT_ONLY_SOURCES = ["英語.pdf", "英語テスト過去問.zip"] as const;
export const ENGLISH_EXPECTED_SOURCE_POLICY =
  "追加教材の指定範囲（Chapter 14・15・16・18、TOEIC Reading、Housing・Medical語彙）から出題し、Chapter 14冒頭の対象外欄とChapter 19は使わない。";

export const ENGLISH_EXPECTED_EXAM_SECTIONS: EnglishExpectedSection[] = [
  { id: "vocab-ja-en", number: "I", title: "語彙・熟語｜日→英", instruction: "日本語に対応する教材表現を英語で書きなさい。", page: 1 },
  { id: "vocab-en-ja", number: "II", title: "語彙・熟語｜英→日", instruction: "英語表現の意味を自然な日本語で書きなさい。", page: 1 },
  { id: "language", number: "III", title: "語形・文法・文脈", instruction: "選択肢または空欄に、文法と文脈の両方に合う答えを入れなさい。", page: 1 },
  { id: "summary-abstract", number: "IV", title: "要約穴埋め・Abstract構成", instruction: "本文全体の流れとAbstract各文の役割を判断し、最も適切なものを選びなさい。", page: 1 },
  { id: "order", number: "V", title: "本文主要文法｜一文整序", instruction: "本文から抜き出した一文を、提示された単語をすべて一度ずつ使って完成させなさい。", page: 2 },
  { id: "sentence-ja-en", number: "VI", title: "本文主要文｜日→英", instruction: "日本語を、本文で用いられた語彙と文法に沿って英訳しなさい。", page: 2 },
  { id: "true-false", number: "VII", title: "本文 True / False", instruction: "指定範囲の本文内容と一致すれば T、一致しなければ F を選びなさい。", page: 2 },
  { id: "reading", number: "VIII", title: "本文参照・内容理解", instruction: "本文の該当箇所を根拠に、最も適切なものを1つ選びなさい。", page: 3 },
  { id: "translation", number: "IX", title: "本文抜粋｜英→日", instruction: "主語・述語・修飾関係を保ち、英文を自然な日本語に訳しなさい。", page: 3 },
];

const UNIT_LABELS: Record<EnglishExpectedUnit, string> = {
  ch14: "Chapter 14｜大型蓄電池と再生可能エネルギー",
  ch15: "Chapter 15｜新しい生命体を作り出す企業",
  ch16: "Chapter 16｜スパコンで天気予報①",
  ch18: "Chapter 18｜高齢化社会に強力な助っ人",
  toeic: "TOEIC Reading｜広告・手紙・市イベント",
  housing: "Key Vocabulary｜Housing",
  medical: "Key Vocabulary｜Medical",
};

type BaseQuestion = Omit<EnglishExpectedQuestion, "id" | "section" | "points">;

function findExistingQuestion(id: string): EnglishQuestion & { unit: EnglishExpectedUnit } {
  const question = ENGLISH_QUESTIONS.find((candidate) => candidate.id === id);
  if (!question) throw new Error(`Expected English range question not found: ${id}`);
  if (!ENGLISH_EXPECTED_SCOPE_UNITS.some((unit) => unit === question.unit)) {
    throw new Error(`Out-of-range question rejected: ${id}`);
  }
  return question as EnglishQuestion & { unit: EnglishExpectedUnit };
}

function readingExplanation(question: EnglishQuestion) {
  const detail = ENGLISH_READING_EXPLANATIONS[question.id];
  if (!detail) return null;
  const optionNotes = detail.optionAnalysis?.map((item) => (
    `${item.isCorrect ? "正答" : "誤答"}「${item.option}」：${item.reason}`
  )).join("\n");
  return {
    explanation: [detail.correctReason, optionNotes, detail.readingTip ? `読み方：${detail.readingTip}` : ""]
      .filter(Boolean)
      .join("\n\n"),
    reference: {
      label: detail.reference.label,
      paragraph: detail.reference.paragraphNumbers[0],
      quote: detail.reference.english,
      translation: detail.naturalTranslation,
    },
  };
}

function existingToBase(id: string): BaseQuestion {
  const question = findExistingQuestion(id);
  const reading = readingExplanation(question);
  const language = ENGLISH_LANGUAGE_EXPLANATIONS[id];
  const extra = ENGLISH_EXTRA_EXPLANATIONS[id];
  return {
    sourceId: question.id,
    unit: question.unit,
    genre: question.group,
    format: question.format,
    prompt: question.prompt,
    answer: question.answer,
    accepted: question.accepted,
    options: question.options,
    tokens: question.tokens,
    semantic: question.grading === "japanese-semantic" || question.format === "translation",
    explanation: reading?.explanation
      ?? language
      ?? extra
      ?? question.explanation
      ?? `正解は「${question.answer}」です。文の骨格、品詞、本文の該当表現を順に照合します。`,
    reference: reading?.reference ?? {
      label: `${UNIT_LABELS[question.unit]}・範囲演習「${question.group}」`,
    },
  };
}

function splitMeaning(value: string) {
  return value.split(/\s*(?:、|\/|／)\s*/).map((part) => part.trim()).filter(Boolean);
}

function vocabularyBase(card: EnglishVocabCard, direction: "ja-en" | "en-ja"): BaseQuestion {
  const sourceId = direction === "ja-en" ? `question-${card.id}` : `reverse-question-${card.id}`;
  const explanation = ENGLISH_LANGUAGE_EXPLANATIONS[sourceId]
    ?? `${card.en} は「${card.ja}」を表します。語形と本文中のまとまりを一緒に確認します。`;
  return {
    sourceId,
    unit: card.unit as EnglishExpectedUnit,
    genre: direction === "ja-en" ? "語彙・熟語（日→英）" : "語彙・熟語（英→日）",
    format: "input",
    prompt: direction === "ja-en" ? `「${card.ja}」を英語で答えなさい。` : `「${card.en}」の意味を日本語で答えなさい。`,
    answer: direction === "ja-en" ? card.en : card.ja,
    accepted: direction === "ja-en" ? splitMeaning(card.en) : splitMeaning(card.ja),
    semantic: direction === "en-ja",
    explanation,
    reference: { label: `${UNIT_LABELS[card.unit as EnglishExpectedUnit]}・教材語彙` },
  };
}

const VOCAB_BY_UNIT = Object.fromEntries(
  CORE_ENGLISH_EXPECTED_UNITS.map((unit) => [
    unit,
    ENGLISH_VOCAB.filter((card) => card.unit === unit),
  ]),
) as Record<CoreEnglishExpectedUnit, EnglishVocabCard[]>;

const VOCAB_STEP: Record<CoreEnglishExpectedUnit, number> = { ch15: 7, ch16: 5, ch18: 5 };

function vocabularySequence(unit: CoreEnglishExpectedUnit) {
  const cards = VOCAB_BY_UNIT[unit];
  return cards.map((_, index) => cards[(index * VOCAB_STEP[unit]) % cards.length]);
}

function cyclePick<T>(items: readonly T[], start: number, count: number) {
  return Array.from({ length: count }, (_, offset) => items[(start + offset) % items.length]);
}

function quote(unit: EnglishExpectedUnit, paragraph: number) {
  const passage = ENGLISH_PASSAGES.find((candidate) => candidate.unit === unit);
  const source = passage?.paragraphs[paragraph - 1];
  if (!passage || !source) throw new Error(`Passage reference not found: ${unit} paragraph ${paragraph}`);
  return { label: `${UNIT_LABELS[unit]}・本文第${paragraph}段落`, paragraph, quote: source.en, translation: source.ja };
}

function redactedOrderQuote(unit: EnglishExpectedUnit, paragraph: number, answer: string) {
  const passage = ENGLISH_PASSAGES.find((candidate) => candidate.unit === unit);
  const targetIndex = paragraph - 1;
  if (!passage || !passage.paragraphs[targetIndex]) {
    throw new Error(`Passage reference not found: ${unit} paragraph ${paragraph}`);
  }
  const contextStart = Math.max(0, targetIndex - 1);
  const contextEnd = Math.min(passage.paragraphs.length, targetIndex + 2);
  const context = passage.paragraphs.slice(contextStart, contextEnd);
  return {
    label: `${UNIT_LABELS[unit]}・本文第${paragraph}段落の周辺（対象文は伏せています）`,
    paragraph,
    quote: context.map((item, offset) => {
      const actualIndex = contextStart + offset;
      if (actualIndex !== targetIndex) return `${actualIndex + 1}. ${item.en}`;
      const redacted = item.en.includes(answer)
        ? item.en.replace(answer, "［並べ替え対象文］")
        : "［並べ替え対象文］";
      return `${actualIndex + 1}. ${redacted}`;
    }).join("\n"),
    translation: context
      .map((item, offset) => `${contextStart + offset + 1}. ${item.ja}`)
      .join("\n"),
  };
}

function trueFalse(
  unit: EnglishExpectedUnit,
  id: string,
  prompt: string,
  answer: "T" | "F",
  paragraph: number,
  reason: string,
): BaseQuestion {
  const reference = quote(unit, paragraph);
  return {
    sourceId: id,
    unit,
    genre: "長文 True / False",
    format: "choice",
    prompt,
    answer,
    options: ["T", "F"],
    explanation: [
      `判定：${answer}。${reason}`,
      `根拠箇所：本文第${paragraph}段落。主語・数値・因果関係を原文と照合します。`,
      `反対選択肢「${answer === "T" ? "F" : "T"}」が誤りである理由：${answer === "T" ? "設問文の内容が根拠英文と一致しており、否定できる相違点がないためです。" : `設問文には本文と異なる語句・数値・関係があります。正しくは「${reason}」です。`}`,
    ].join("\n\n"),
    reference,
  };
}

const TRUE_FALSE_BANK: Record<CoreEnglishExpectedUnit, BaseQuestion[]> = {
  ch15: [
    trueFalse("ch15", "expected-tf-15-1", "Jack Newman types a DNA sequence on a laptop and clicks ‘send.’", "T", 1, "本文は生命体作成の開始操作をこの二つの動作で具体化しています。"),
    trueFalse("ch15", "expected-tf-15-2", "Robotic arms mix compounds in order to produce the desired cells.", "T", 2, "to produce は目的を表し、ロボットアームが化合物を混ぜる理由と一致します。"),
    trueFalse("ch15", "expected-tf-15-3", "The company creates more than 1,500 new organisms a month.", "F", 3, "本文は a day（1日につき）であり、a month ではありません。"),
    trueFalse("ch15", "expected-tf-15-4", "All of the new organisms described in the article make the same product.", "F", 4, "医薬品、保湿剤、バイオ燃料という複数の用途が述べられています。"),
    trueFalse("ch15", "expected-tf-15-5", "Some people regard this work as the beginning of a third industrial revolution.", "T", 6, "Some believe ... marks the beginning ... と明記されています。"),
    trueFalse("ch15", "expected-tf-15-6", "The article says biological production raises no safety or ethical questions.", "F", 7, "環境安全、生物学的安全保障、倫理的論争という問題を raises / revives すると述べています。"),
    trueFalse("ch15", "expected-tf-15-7", "Amyris has created more than 3 million organisms since it was founded a decade ago.", "T", 8, "a decade ago と more than 3 million の両方が本文の実績と一致します。"),
    trueFalse("ch15", "expected-tf-15-8", "Traditional genetic engineering normally builds entire genomes from scratch.", "F", 9, "従来型は swapping a few genes、本文の科学者たちは entire genomes from scratch で対比されています。"),
  ],
  ch16: [
    trueFalse("ch16", "expected-tf-16-1", "The detailed cloud map may improve forecasts for typhoons and heavy rain.", "T", 1, "could help provide more accurate forecasts と述べています。"),
    trueFalse("ch16", "expected-tf-16-2", "In a cloud map, the Earth’s surface is divided into square blocks.", "T", 2, "is divided into square blocks という受動態の内容そのものです。"),
    trueFalse("ch16", "expected-tf-16-3", "Computers at the Japan Meteorological Agency usually use 3.5-kilometer squares.", "F", 3, "通常は20 km by 20 km。3.5 km は previous attempts の到達値です。"),
    trueFalse("ch16", "expected-tf-16-4", "Earlier high-tech supercomputer attempts narrowed each block to 3.5 kilometers.", "T", 4, "Previous attempts ... down to 3.5 kilometers と一致します。"),
    trueFalse("ch16", "expected-tf-16-5", "The K computer divided the surface into about 63 billion hexagonal blocks.", "T", 5, "some 63 billion hexagonal blocks の数・形・対象がすべて一致します。"),
    trueFalse("ch16", "expected-tf-16-6", "Each K-computer block was spaced about 870 kilometers apart.", "F", 5, "単位は meters であり kilometers ではありません。"),
    trueFalse("ch16", "expected-tf-16-7", "The system was tested using cloud movement from Typhoon No. 15 in August 2012.", "T", 6, "台風番号と時期の両方が本文と一致します。"),
    trueFalse("ch16", "expected-tf-16-8", "The team has no plan to improve the forecasting system further.", "F", 7, "will work on improving the system と、今後の改善を明記しています。"),
  ],
  ch18: [
    trueFalse("ch18", "expected-tf-18-1", "The ministry aims to develop robot wheelchairs that detect users’ intentions from brain waves.", "T", 1, "開発主体、検知対象、検知元が本文と一致します。"),
    trueFalse("ch18", "expected-tf-18-2", "The planned wheelchairs detect users’ intentions mainly from their voices.", "F", 1, "本文は from their brain waves であり、voices ではありません。"),
    trueFalse("ch18", "expected-tf-18-3", "A labor shortage is predicted in nursing care facilities.", "T", 2, "where 以下が介護施設で予想される労働力不足を説明しています。"),
    trueFalse("ch18", "expected-tf-18-4", "The ministry plans to put the technology to use without cooperation from outside organizations.", "F", 3, "研究所、通信会社、機械メーカーとの cooperation が明記されています。"),
    trueFalse("ch18", "expected-tf-18-5", "Sensors will analyze brain waves and nervous system activity.", "T", 4, "by analyzing their brain waves and nervous system activity と一致します。"),
    trueFalse("ch18", "expected-tf-18-6", "Users must physically turn the wheelchair before a computer can recognize a direction.", "F", 6, "利用者は進みたい方向を think about することで意図を認識させます。"),
    trueFalse("ch18", "expected-tf-18-7", "The experimental wheelchairs successfully traveled long distances.", "F", 7, "本文は short distances であり long distances ではありません。"),
    trueFalse("ch18", "expected-tf-18-8", "Networked wheelchair users will share information about obstacles and uneven surfaces.", "T", 8, "共有主体・情報内容とも本文の記述に一致します。"),
    trueFalse("ch18", "expected-tf-18-9", "Wheelchairs will calculate their current locations and routes to destinations.", "T", 9, "calculate の二つの目的語がそのまま述べられています。"),
    trueFalse("ch18", "expected-tf-18-10", "Information from wheelchairs that passed dangerous places will help other wheelchairs avoid danger.", "T", 10, "情報の発信元、受信先、目的が本文と一致します。"),
  ],
};

function readingChoice(
  unit: EnglishExpectedUnit,
  id: string,
  prompt: string,
  options: string[],
  answer: string,
  paragraph: number,
  reason: string,
  wrongReasons: string,
): BaseQuestion {
  const optionAnalysis = options.map((option) => (
    option === answer
      ? `正答「${option}」：${reason}`
      : `誤答「${option}」：本文第${paragraph}段落の該当事実と一致しません。${wrongReasons}`
  )).join("\n");
  return {
    sourceId: id,
    unit,
    genre: "長文内容理解",
    format: "choice",
    prompt,
    options,
    answer,
    explanation: `根拠の読み取り：${reason}\n\n選択肢別の検討\n${optionAnalysis}`,
    reference: quote(unit, paragraph),
  };
}

const READING_BANK: Record<CoreEnglishExpectedUnit, BaseQuestion[]> = {
  ch15: [
    readingChoice("ch15", "expected-read-15-1", "What begins after Newman enters a DNA sequence and clicks ‘send’?", ["Robotic arms mix compounds", "Customers download an app", "Corn is harvested", "Genes are removed by hand"], "Robotic arms mix compounds", 2, "第2段落は、近くの実験室でロボットアームが目的の細胞を作るため化合物を混ぜ始めると説明します。", "アプリは作り方の比喩、トウモロコシはバイオ燃料、手作業での遺伝子除去は書かれていません。"),
    readingChoice("ch15", "expected-read-15-2", "At what rate is the company creating new organisms?", ["More than 1,500 a day", "Exactly 1,500 a year", "Three million a day", "One organism a decade"], "More than 1,500 a day", 3, "at a dizzying rate of more than 1,500 a day が正答の直接根拠です。", "three million は創業以来の累計、a decade は会社の創業時期です。"),
    readingChoice("ch15", "expected-read-15-3", "Which product is described as a renewable energy source usually made from corn?", ["Biofuel", "Medicine", "Moisturizer", "Petrochemicals"], "Biofuel", 4, "同格 a renewable energy source usually made from corn が biofuel を説明します。", "medicine と moisturizer は別の生成物、petrochemicals は従来の製造原料として後段に出ます。"),
    readingChoice("ch15", "expected-read-15-4", "What is the proposed third industrial revolution based on?", ["Using living systems as biofactories", "Replacing all computers with people", "Growing only corn", "Swapping one gene by hand"], "Using living systems as biofactories", 6, "ダッシュ後の one based on ... が第三次産業革命の内容を定義します。", "残る三つは本文の革命の基盤として述べられていません。"),
    readingChoice("ch15", "expected-read-15-5", "Which concern is raised alongside the promised benefits?", ["Environmental safety and bio-security", "A shortage of cloud maps", "The price of wheelchairs", "A lack of DNA databases"], "Environmental safety and bio-security", 7, "but it also raises questions about ... が利益との対比で懸念を示します。", "残る選択肢は別章の話題、または本文にない内容です。"),
    readingChoice("ch15", "expected-read-15-6", "How does the new work differ from traditional genetic engineering?", ["It builds entire genomes from scratch", "It only swaps a few genes", "It avoids using cells", "It produces no new organisms"], "It builds entire genomes from scratch", 9, "Unlike 以下で、従来型の swapping a few genes と新しい entire genomes from scratch が対比されます。", "few genes は従来型側であり、細胞や生命体を使わないとは書かれていません。"),
  ],
  ch16: [
    readingChoice("ch16", "expected-read-16-1", "What may the detailed cloud map help forecast more accurately?", ["Typhoons and heavy rain", "Earthquakes and volcanoes", "Only temperature", "Ocean prices"], "Typhoons and heavy rain", 1, "第1段落末尾が予報対象を明記しています。", "ほかの現象・対象はこの本文で予報対象にしていません。"),
    readingChoice("ch16", "expected-read-16-2", "What square size do meteorological institutions typically use?", ["20 km by 20 km", "3.5 m by 3.5 m", "870 km apart", "63 billion km"], "20 km by 20 km", 3, "measuring 20 km by 20 km が squares の寸法です。", "3.5 km は従来の高性能機、870 m は京の間隔、63 billion は区画数です。"),
    readingChoice("ch16", "expected-read-16-3", "How small had previous supercomputer attempts made each block?", ["3.5 kilometers", "20 kilometers", "870 kilometers", "63 billion meters"], "3.5 kilometers", 4, "narrow each block down to 3.5 kilometers が直接の根拠です。", "20 km は通常値、870 m は京の区画間隔、63 billion は個数です。"),
    readingChoice("ch16", "expected-read-16-4", "Which pair correctly describes the K-computer model?", ["About 63 billion hexagonal blocks / 870 meters apart", "20 square blocks / 3.5 meters apart", "870 billion circles / 63 meters apart", "One global block / 20 kilometers apart"], "About 63 billion hexagonal blocks / 870 meters apart", 5, "some 63 billion hexagonal blocks と spaced only 870 meters apart を組み合わせた選択肢が正解です。", "数、形、単位のいずれかを入れ替えた選択肢は本文と一致しません。"),
    readingChoice("ch16", "expected-read-16-5", "Which event was used to test the cloud-movement system?", ["Typhoon No. 15 in August 2012", "Heavy rain in 2017", "Typhoon No. 20 in 870", "A blizzard in Europe"], "Typhoon No. 15 in August 2012", 6, "When 節に試験対象と時期がまとめて示されています。", "その他の日付・現象は本文にありません。"),
    readingChoice("ch16", "expected-read-16-6", "Why will the team continue improving the system?", ["Such natural disasters have increased", "The K computer cannot show clouds", "Meteorological institutions have closed", "Square blocks are illegal"], "Such natural disasters have increased", 7, "as there has been an increase in such natural disasters が理由です。", "残る選択肢は本文の事実と反対、または記載がありません。"),
  ],
  ch18: [
    readingChoice("ch18", "expected-read-18-1", "How will robot wheelchairs detect users’ intentions?", ["From brain waves", "From voice volume", "From hand signals only", "From weather forecasts"], "From brain waves", 1, "detect users’ intentions from their brain waves が直接の根拠です。", "音声・手信号・天気予報による検知は本文にありません。"),
    readingChoice("ch18", "expected-read-18-2", "What did wheelchairs do successfully in experiments?", ["Moved short distances and performed simple operations", "Traveled between cities", "Built home appliances", "Removed all obstacles"], "Moved short distances and performed simple operations", 7, "現在完了の二つの動作 have moved / performed が正答を構成します。", "長距離移動、家電製造、障害物除去は述べられていません。"),
    readingChoice("ch18", "expected-read-18-3", "What information will networked users be able to share?", ["Obstacles and uneven surfaces", "The price of biofuel", "Cloud formation", "DNA sequences"], "Obstacles and uneven surfaces", 8, "share information about の目的語が obstacles and uneven surfaces です。", "他の三つは別章の内容で、この通信技術が共有する情報ではありません。"),
    readingChoice("ch18", "expected-read-18-4", "Where does the ministry expect robot wheelchairs to be put to practical use?", ["Nursing care facilities", "Meteorological institutions", "Biotech laboratories", "Petrochemical factories"], "Nursing care facilities", 2, "in nursing care facilities が実用化の場所です。", "残る施設は別章の語彙であり、本文第2段落の場所ではありません。"),
    readingChoice("ch18", "expected-read-18-5", "What will the wheelchair sensors analyze?", ["Brain waves and nervous system activity", "Only current locations", "Cloud maps", "Genomes from scratch"], "Brain waves and nervous system activity", 4, "by analyzing ... がセンサーの検知方法を示します。", "現在地はシステムが計算し、雲地図とゲノムは別章です。"),
    readingChoice("ch18", "expected-read-18-6", "How will information from dangerous places help other wheelchairs?", ["It will help them choose routes that avoid danger", "It will make them travel farther", "It will turn off their sensors", "It will predict labor shortages"], "It will help them choose routes that avoid danger", 10, "to help them choose routes that avoid danger が情報送信の目的です。", "移動距離、センサー停止、労働力予測はこの文の目的ではありません。"),
  ],
};

function detailedChoice(
  unit: EnglishExpectedUnit,
  id: string,
  genre: string,
  prompt: string,
  options: string[],
  answer: string,
  paragraph: number,
  correctReason: string,
  wrongReasons: Partial<Record<string, string>> = {},
): BaseQuestion {
  const optionAnalysis = options.map((option) => (
    option === answer
      ? `正答「${option}」：${correctReason}`
      : `誤答「${option}」：${wrongReasons[option] ?? "空欄前後の文法、本文の因果関係、またはAbstract内の文の役割に合いません。"}`
  )).join("\n");
  return {
    sourceId: id,
    unit,
    genre,
    format: "choice",
    prompt,
    options,
    answer,
    explanation: `正答の理由：${correctReason}\n\n選択肢別の検討\n${optionAnalysis}`,
    reference: quote(unit, paragraph),
  };
}

function summaryFromExisting(id: string, paragraph: number, correctReason: string): BaseQuestion {
  const base = existingToBase(id);
  if (!base.options) throw new Error(`Summary choices not found: ${id}`);
  return detailedChoice(base.unit, id, "要約穴埋め", base.prompt, base.options, base.answer, paragraph, correctReason);
}

const SUMMARY_BANK: Record<CoreEnglishExpectedUnit, BaseQuestion[]> = {
  ch15: [
    summaryFromExisting("ch15-summary-1", 8, "現在完了 has の後は過去分詞 created。本文の『300万を超える生命体を作ってきた』という実績を要約します。"),
    summaryFromExisting("ch15-summary-2", 8, "has become で『～になった』。創業以来から現在までの変化を現在完了で表します。"),
    summaryFromExisting("ch15-summary-3", 7, "There has been ... が存在を述べる現在完了。倫理面の批判が生じているという本文の対比に合います。"),
    summaryFromExisting("ch15-summary-4", 6, "arise は『生じる』という自動詞で、Hope has arisen の過去分詞として使います。"),
    detailedChoice("ch15", "expected-summary-15-5", "要約穴埋め", "Robotic arms mix compounds ( ___ ) the desired cells.", ["to produce", "produced", "producing", "produce"], "to produce", 2, "to produce は目的を示す不定詞で『目的の細胞を作るために』となります。", { produced: "過去分詞だけでは mix の目的を表せません。", producing: "本文は同時進行ではなく目的を表します。", produce: "mix compounds の直後に原形だけは置けません。" }),
    detailedChoice("ch15", "expected-summary-15-6", "要約穴埋め", "Unlike traditional engineering, scientists build entire genomes ( ___ ).", ["from scratch", "at scratch", "by scratch", "for scratch"], "from scratch", 9, "from scratch は『ゼロから』という本文の熟語で、新旧の遺伝子工学の違いを要約します。"),
  ],
  ch16: [
    detailedChoice("ch16", "expected-summary-16-1", "要約穴埋め", "The detailed cloud map could help ( ___ ) more accurate forecasts.", ["provide", "provides", "provided", "providing"], "provide", 1, "help + 動詞原形なので provide。地図がより正確な予報に役立つという目的を要約します。"),
    detailedChoice("ch16", "expected-summary-16-2", "要約穴埋め", "In a cloud map, the Earth's surface is ( ___ ) into square blocks.", ["divided", "dividing", "divide", "division"], "divided", 2, "is divided は受動態で『分けられる』。surface が分割される側です。"),
    detailedChoice("ch16", "expected-summary-16-3", "要約穴埋め", "Cloud formation is predicted ( ___ ) atmospheric conditions in each block.", ["based on", "because", "apart from", "instead of"], "based on", 2, "based on は『～に基づいて』で、予測の根拠を示します。"),
    detailedChoice("ch16", "expected-summary-16-4", "要約穴埋め", "Previous attempts narrowed each block ( ___ ) 3.5 kilometers.", ["down to", "up from", "apart by", "into of"], "down to", 4, "narrow A down to B で『AをBまで狭める』という範囲熟語です。"),
    detailedChoice("ch16", "expected-summary-16-5", "要約穴埋め", "The team split the Earth's surface ( ___ ) about 63 billion hexagonal blocks.", ["into", "from", "at", "with"], "into", 5, "split A into B で『AをBに分割する』。630億個の六角形区画が分割後の形です。"),
    detailedChoice("ch16", "expected-summary-16-6", "要約穴埋め", "The team will work on ( ___ ) the forecasting system.", ["improving", "improve", "improved", "improvement"], "improving", 7, "work on の on は前置詞なので動名詞 improving を続けます。"),
  ],
  ch18: [
    summaryFromExisting("ch18-summary-1", 1, "plans to の後では start が原形で入り、車椅子開発プロジェクトの開始を表します。"),
    summaryFromExisting("ch18-summary-2", 6, "recognize はコンピューターが利用者の意図を『認識する』という本文の中心動作です。"),
    summaryFromExisting("ch18-summary-3", 8, "connect A using networks で複数の車椅子をネットワーク接続する計画を要約します。"),
    summaryFromExisting("ch18-summary-4", 8, "enable A to share B の share が、障害物や路面情報を『共有する』働きを表します。"),
    detailedChoice("ch18", "expected-summary-18-5", "要約穴埋め", "Sensors detect users' intentions by ( ___ ) brain waves and nervous system activity.", ["analyzing", "analyze", "analyzed", "analysis"], "analyzing", 4, "前置詞 by の後は動名詞 analyzing。検知の手段を表します。"),
    detailedChoice("ch18", "expected-summary-18-6", "要約穴埋め", "The latest information helps users choose routes that ( ___ ) danger.", ["avoid", "avoids", "avoided", "avoiding"], "avoid", 10, "先行詞 routes が複数なので関係節の動詞は avoid。情報共有の目的を要約します。"),
  ],
};

const ABSTRACT_ROLE_OPTIONS = [
  "① 研究の背景・目的",
  "② 実験・分析の方法",
  "③ 結果",
  "④ 結論・意義",
];

const ABSTRACT_ROLE_GUIDE: Record<string, string> = {
  "① 研究の背景・目的": "研究を行う理由・課題・目的を示す部分で、操作手順や得られた数値ではありません。",
  "② 実験・分析の方法": "何を用い、どのように調べたかを示す部分で、成果そのものや将来への評価ではありません。",
  "③ 結果": "実験・開発で実際に得られた事実や数値を示す部分で、研究目的や手順ではありません。",
  "④ 結論・意義": "結果から言えること、実用上の意味、今後への示唆を述べる部分で、単なる手順や観測値ではありません。",
};

function abstractChoice(
  unit: EnglishExpectedUnit,
  id: string,
  sentence: string,
  answer: string,
  paragraph: number,
  reason: string,
): BaseQuestion {
  const wrongReasons = Object.fromEntries(ABSTRACT_ROLE_OPTIONS.map((option) => [option, ABSTRACT_ROLE_GUIDE[option]]));
  return detailedChoice(
    unit,
    id,
    "Abstract構成",
    `次のAbstract中の一文は、どの役割に当たるか。\n${sentence}`,
    ABSTRACT_ROLE_OPTIONS,
    answer,
    paragraph,
    `${reason} ${ABSTRACT_ROLE_GUIDE[answer]}`,
    wrongReasons,
  );
}

const ABSTRACT_BANK: BaseQuestion[] = [
  abstractChoice("ch15", "expected-abstract-01", "This study examines how a biotechnology company creates new organisms with computers and robots.", "① 研究の背景・目的", 1, "examines how ... は、この研究が何を明らかにするかを宣言しています。"),
  abstractChoice("ch15", "expected-abstract-02", "DNA sequences were entered into computers, and robotic arms mixed compounds to produce desired cells.", "② 実験・分析の方法", 2, "入力と混合作業という具体的な工程を過去形・受動態で述べています。"),
  abstractChoice("ch15", "expected-abstract-03", "The company has created more than three million new organisms since it was founded.", "③ 結果", 8, "300万を超えるという実績値は、実際に得られた成果です。"),
  abstractChoice("ch16", "expected-abstract-04", "The team divided the Earth's surface into about 63 billion hexagonal blocks and simulated cloud movement.", "② 実験・分析の方法", 5, "区画分割とシミュレーションという分析手順を述べています。"),
  abstractChoice("ch16", "expected-abstract-05", "The simulation produced a detailed picture of clouds across the entire globe.", "③ 結果", 6, "シミュレーション後に得られた雲画像という観測結果です。"),
  abstractChoice("ch18", "expected-abstract-06", "Networked robot wheelchairs may reduce danger and support nursing care in an aging society.", "④ 結論・意義", 10, "技術が社会で持つ価値と実用上の意味をまとめています。"),
];
function languageChoice(
  unit: EnglishExpectedUnit,
  id: string,
  prompt: string,
  options: string[],
  answer: string,
  paragraph: number,
  reason: string,
): BaseQuestion {
  return detailedChoice(unit, id, "語形・文法・文脈", prompt, options, answer, paragraph, reason);
}

const LANGUAGE_BANK: Record<CoreEnglishExpectedUnit, BaseQuestion[]> = {
  ch15: [
    existingToBase("ch15-prep-1"),
    existingToBase("ch15-prep-2"),
    existingToBase("ch15-prep-3"),
    existingToBase("ch15-prep-4"),
    languageChoice("ch15", "expected-language-15-perfect", "Since it was founded a decade ago, Amyris ( ___ ) a legend in the field.", ["has become", "became", "becomes", "had become"], "has become", 8, "since + 過去形が起点を示し、現在までの変化なので現在完了 has become を使います。"),
    languageChoice("ch15", "expected-language-15-unlike", "( ___ ) traditional genetic engineering, the scientists are building entire genomes from scratch.", ["Unlike", "Like", "Because", "During"], "Unlike", 9, "従来方式と新方式を対比するため『～と異なり』の Unlike が入ります。"),
  ],
  ch16: [
    existingToBase("ch16-word-1"),
    existingToBase("ch16-word-2"),
    existingToBase("ch16-word-3"),
    existingToBase("ch16-homepage-1"),
    existingToBase("ch16-homepage-2"),
    existingToBase("ch16-homepage-3"),
  ],
  ch18: [
    existingToBase("ch18-relative-1"),
    existingToBase("ch18-relative-2"),
    existingToBase("ch18-interview-1"),
    existingToBase("ch18-interview-2"),
    existingToBase("ch18-interview-3"),
    existingToBase("ch18-interview-4"),
  ],
};

const ORDER_POOLS: Record<CoreEnglishExpectedUnit, string[]> = {
  ch15: ["passage-order-ch15-1", "passage-order-ch15-2", "passage-order-ch15-3", "passage-order-ch15-4"],
  ch16: ["passage-order-ch16-1", "passage-order-ch16-2", "passage-order-ch16-3", "passage-order-ch16-4"],
  ch18: ["passage-order-ch18-1", "passage-order-ch18-2", "passage-order-ch18-3", "passage-order-ch18-4"],
};

const ORDER_PARAGRAPHS: Record<string, number> = {
  "passage-order-ch14-1": 2,
  "passage-order-ch14-2": 3,
  "passage-order-ch14-3": 9,
  "passage-order-ch14-4": 10,
  "passage-order-ch15-1": 4,
  "passage-order-ch15-2": 6,
  "passage-order-ch15-3": 8,
  "passage-order-ch15-4": 9,
  "passage-order-ch16-1": 2,
  "passage-order-ch16-2": 4,
  "passage-order-ch16-3": 5,
  "passage-order-ch16-4": 7,
  "passage-order-ch18-1": 2,
  "passage-order-ch18-2": 4,
  "passage-order-ch18-3": 6,
  "passage-order-ch18-4": 8,
};

const ORDER_GRAMMAR_NOTES: Record<string, string> = {
  "passage-order-ch14-1": "be aimed at の後は動名詞 promoting、手段を表す by の後は addressing を置きます。",
  "passage-order-ch14-2": "過去分詞 generated が electricity を後置修飾し、accounts for が主節の動詞になります。",
  "passage-order-ch14-3": "While 節で安全性と寿命を示し、主節の受動態 can be converted into と対比させます。",
  "passage-order-ch14-4": "動名詞句 Using such batteries が主語、allow A to do が『Aが～できるようにする』を表します。",
  "passage-order-ch15-1": "主語 Others の後に動詞 create、目的語 moisturizers、先行詞を修飾する関係節 that can be used ... を続けます。",
  "passage-order-ch15-2": "believe の目的語となる節では this kind of work が主語、marks が三人称単数の動詞です。",
  "passage-order-ch15-3": "Since + 過去形で起点を示し、主節は現在完了 has become で現在までの変化を表します。",
  "passage-order-ch15-4": "現在進行形 are building の目的語 entire genomes に、起点を示す熟語 from scratch が続きます。",
  "passage-order-ch16-1": "主語 Cloud formation and movements と動詞 are predicted の間へ、非制限用法の which 節を挿入します。",
  "passage-order-ch16-2": "have been able to + 原形と、narrow A down to B の二つの型を崩さず並べます。",
  "passage-order-ch16-3": "be able to split A into B の順で、Aが地球表面、Bが630億個の六角形区画です。",
  "passage-order-ch16-4": "work on の後は動名詞 improving、for の後へ目的となる forecasting を置きます。",
  "passage-order-ch18-1": "expects の目的語となる that 節内で、robot wheelchairs を受動態 will be put to practical use が説明します。",
  "passage-order-ch18-2": "sensors を主格の関係代名詞 that と動詞 detect で後置修飾します。",
  "passage-order-ch18-3": "a system の後に前置詞＋関係代名詞 in which を置き、その内部を computers recognize ... の語順にします。",
  "passage-order-ch18-4": "受動態 will be connected の後に手段 by networks、目的 so that S will be able to ... を続けます。",
};

function passageOrderBase(id: string): BaseQuestion {
  const base = existingToBase(id);
  const paragraph = ORDER_PARAGRAPHS[id];
  if (!paragraph) throw new Error(`Order paragraph not found: ${id}`);
  return {
    ...base,
    genre: "本文主要文法・一文整序",
    tokens: base.answer.trim().split(/\s+/u),
    explanation: `模範語順：${base.answer}\n\n語順の理由：${ORDER_GRAMMAR_NOTES[id]}\n\n各語を一語ずつ確認し、主語→動詞→目的語・補語→修飾語の骨格を先に作ります。`,
    reference: redactedOrderQuote(base.unit, paragraph, base.answer),
  };
}

function sentenceJaEn(
  unit: EnglishExpectedUnit,
  id: string,
  prompt: string,
  answer: string,
  paragraph: number,
  grammar: string,
): BaseQuestion {
  return {
    sourceId: id,
    unit,
    genre: "本文抜粋・日→英",
    format: "input",
    prompt,
    answer,
    accepted: [answer.replace(/[.!?]$/u, "")],
    explanation: `模範解答：${answer}\n\n文法・語彙：${grammar}\n\n日本語だけを直訳するのではなく、本文の主語・時制・態・修飾関係を再現します。`,
    reference: quote(unit, paragraph),
  };
}

const SENTENCE_JA_EN_BANK: Record<CoreEnglishExpectedUnit, BaseQuestion[]> = {
  ch15: [
    sentenceJaEn("ch15", "expected-ja-en-15-1", "目的の細胞を作るために、ロボットアームがいくつかの化合物を混ぜ始める。", "Robotic arms start to mix together some compounds to produce the desired cells.", 2, "start to + 動詞原形、目的の不定詞 to produce、desired cells の語順を使います。"),
    sentenceJaEn("ch15", "expected-ja-en-15-2", "他のものは、化粧品に使える保湿剤を作る。", "Others create moisturizers that can be used in cosmetics.", 4, "moisturizers を関係代名詞 that 以下の受動態 can be used が修飾します。"),
    sentenceJaEn("ch15", "expected-ja-en-15-3", "この種の仕事が第三次産業革命の始まりを示すと考える人もいる。", "Some believe this kind of work marks the beginning of a third industrial revolution.", 6, "believe の後は that が省略された目的語節。work は単数なので marks です。"),
    sentenceJaEn("ch15", "expected-ja-en-15-4", "10年前の創業以来、Amyrisはその分野で伝説的な存在になった。", "Since it was founded a decade ago, Amyris has become a legend in the field.", 8, "Since節は過去形 was founded、主節は現在完了 has become を使います。"),
    sentenceJaEn("ch15", "expected-ja-en-15-5", "科学者たちはゲノム全体をゼロから構築している。", "The scientists are building entire genomes from scratch.", 9, "進行中の動作は are building、from scratch は『ゼロから』です。"),
    sentenceJaEn("ch15", "expected-ja-en-15-6", "砂糖を医薬品に変換するものもある。", "Some convert sugar into medicines.", 4, "convert A into B の型で、A=sugar、B=medicines とします。"),
  ],
  ch16: [
    sentenceJaEn("ch16", "expected-ja-en-16-1", "科学者グループは、『京』を使って地球表面の詳細な雲地図を作った。", "A group of scientists have created a detailed cloud map of the Earth’s surface using the K computer.", 1, "現在完了 have created と、手段を示す分詞句 using the K computer を使います。"),
    sentenceJaEn("ch16", "expected-ja-en-16-2", "雲地図では、地球表面は正方形の区画に分けられる。", "With a cloud map, the Earth’s surface is divided into square blocks.", 2, "surface は分けられる側なので受動態 is divided into を使います。"),
    sentenceJaEn("ch16", "expected-ja-en-16-3", "通常、気象機関のコンピューターは各区画を20km四方に分割する。", "Typically, computers at meteorological institutions divide each block into squares measuring 20 km by 20 km.", 3, "divide A into B と、squares を後ろから説明する measuring ... を使います。"),
    sentenceJaEn("ch16", "expected-ja-en-16-4", "従来の高性能スーパーコンピューターでは、各区画を3.5kmまで狭めることができた。", "Previous attempts to use high-tech supercomputers have been able to narrow each block down to 3.5 kilometers.", 4, "have been able to と narrow A down to B を組み合わせます。"),
    sentenceJaEn("ch16", "expected-ja-en-16-5", "『京』を使い、チームは地球表面を約630億個の六角形区画に分けることができた。", "By using the K computer, the team were able to split the Earth’s surface into some 63 billion hexagonal blocks.", 5, "By + 動名詞で手段、were able to で達成、split A into B で分割を表します。"),
    sentenceJaEn("ch16", "expected-ja-en-16-6", "チームは、より正確な台風・大雨予報に向けてシステム改善に取り組む。", "The team will work on improving the system for more accurate typhoon and heavy rain forecasting.", 7, "未来の計画 will work on と、前置詞 on の後の動名詞 improving を使います。"),
  ],
  ch18: [
    sentenceJaEn("ch18", "expected-ja-en-18-1", "総務省は、ロボット車椅子が介護施設で実用化されると見込んでいる。", "The ministry expects that robot wheelchairs will be put to practical use in nursing care facilities.", 2, "expects that S V の目的語節内で、will be put の受動態を使います。"),
    sentenceJaEn("ch18", "expected-ja-en-18-2", "計画中のロボット車椅子は、利用者の意図を検知するセンサーを備える。", "The planned robot wheelchairs will have sensors that detect users’ intentions.", 4, "sensors を主格の関係代名詞 that と detect で後置修飾します。"),
    sentenceJaEn("ch18", "expected-ja-en-18-3", "その技術には、コンピューターが利用者の意図を認識するシステムが含まれる。", "They include a system in which computers recognize users’ intentions.", 6, "a system in which ... の前置詞＋関係代名詞を使います。"),
    sentenceJaEn("ch18", "expected-ja-en-18-4", "複数の車椅子は、利用者が情報を共有できるようネットワークで接続される。", "Multiple wheelchairs will be connected by networks so that their users will be able to share information.", 8, "受動態 will be connected、手段 by、目的 so that S will be able to ... の順です。"),
    sentenceJaEn("ch18", "expected-ja-en-18-5", "計画中のシステムでは、車椅子が現在地と目的地までの経路を計算する。", "Under the planned system, wheelchairs will calculate current locations and routes to destinations.", 9, "Under ... で条件を示し、calculate A and B の並列を作ります。"),
    sentenceJaEn("ch18", "expected-ja-en-18-6", "危険な場所を通過した車椅子からの最新情報は、危険を避ける経路選びを助けるため、ほかの車椅子に送られる。", "The latest information from wheelchairs that have passed through dangerous places will be sent to other wheelchairs to help them choose routes that avoid danger.", 10, "主語 information を二つの that 節が修飾し、主節は受動態 will be sent、目的は to help で表します。"),
  ],
};
const TRANSLATION_PARAGRAPHS: Record<CoreEnglishExpectedUnit, number[]> = {
  ch15: [1, 4, 6, 7, 8, 9],
  ch16: [1, 2, 4, 5, 6, 7],
  ch18: [1, 2, 4, 6, 8, 10],
};

function translationBase(unit: EnglishExpectedUnit, paragraph: number): BaseQuestion {
  const sourceId = `${unit === "ch15" ? "passage-amyris" : unit === "ch16" ? "passage-weather" : "passage-wheelchair"}-translation-${paragraph}`;
  const question = existingToBase(sourceId);
  return { ...question, genre: "長文和訳", semantic: true, reference: quote(unit, paragraph) };
}

function scored(
  base: BaseQuestion,
  section: EnglishExpectedSectionId,
  points: number,
  examId: string,
  index: number,
): EnglishExpectedQuestion {
  return { ...base, id: `${examId}-q${String(index + 1).padStart(2, "0")}-${base.sourceId}`, section, points };
}

const ADDITIONAL_VOCAB_UNITS = ["ch14", "housing", "medical"] as const;
const ADDITIONAL_LANGUAGE_IDS = [
  "toeic-part5-104",
  "ch16-extra-map",
  "toeic-part5-105",
  "ch16-extra-surface",
  "toeic-part5-106",
  "ch16-extra-narrow",
] as const;
const CH14_SUMMARY_IDS = ["ch14-summary-1", "ch14-summary-2", "ch14-summary-3", "ch14-summary-4"] as const;
const CH14_ORDER_IDS = ["passage-order-ch14-1", "passage-order-ch14-2", "passage-order-ch14-3", "passage-order-ch14-4"] as const;
const CH14_TRUE_FALSE_IDS = ["ch14-tf-1", "ch14-tf-2", "ch14-tf-3", "ch14-tf-4", "ch14-tf-5"] as const;
const TOEIC_READING_IDS = [
  "toeic-keller-181",
  "toeic-keller-182",
  "toeic-keller-183",
  "toeic-keller-184",
  "toeic-keller-185",
  "toeic-eston-135",
] as const;

function additionalVocabularyCard(unit: typeof ADDITIONAL_VOCAB_UNITS[number], index: number) {
  const cards = ENGLISH_VOCAB.filter((card) => card.unit === unit);
  const card = cards[index % cards.length];
  if (!card) throw new Error(`Additional vocabulary not found: ${unit}`);
  return card;
}

function buildExam(number: number): EnglishExpectedExam {
  const index = number - 1;
  const examId = `english-expected-${String(number).padStart(2, "0")}`;
  const units = CORE_ENGLISH_EXPECTED_UNITS;
  const vocabSequences: Record<CoreEnglishExpectedUnit, EnglishVocabCard[]> = {
    ch15: vocabularySequence("ch15"),
    ch16: vocabularySequence("ch16"),
    ch18: vocabularySequence("ch18"),
  };
  const vocabStarts: Record<CoreEnglishExpectedUnit, number> = { ch15: index * 3, ch16: index * 4, ch18: index * 3 };
  const pickVocab = (unit: CoreEnglishExpectedUnit, offset: number) => (
    vocabSequences[unit][(vocabStarts[unit] + offset) % vocabSequences[unit].length]
  );
  const jaExtraUnit = units[index % units.length];
  const enExtraUnit = units[(index + 1) % units.length];
  const jaEnCards = [
    ...units.map((unit) => pickVocab(unit, 0)),
    pickVocab(jaExtraUnit, 2),
  ];
  const enJaCards = [
    ...units.map((unit) => pickVocab(unit, 1)),
    pickVocab(enExtraUnit, 3),
  ];
  jaEnCards[3] = additionalVocabularyCard(ADDITIONAL_VOCAB_UNITS[index % ADDITIONAL_VOCAB_UNITS.length], index);
  enJaCards[3] = additionalVocabularyCard(ADDITIONAL_VOCAB_UNITS[(index + 1) % ADDITIONAL_VOCAB_UNITS.length], index + 4);

  const language = units.map((unit) => LANGUAGE_BANK[unit][index]);
  const languageExtraUnit: CoreEnglishExpectedUnit = index % 2 === 0 ? "ch15" : "ch18";
  language.push(LANGUAGE_BANK[languageExtraUnit][(index + 3) % LANGUAGE_BANK[languageExtraUnit].length]);
  language[0] = existingToBase(ADDITIONAL_LANGUAGE_IDS[index]);

  const summaryAbstract = [
    ...units.map((unit) => SUMMARY_BANK[unit][index]),
    ABSTRACT_BANK[index],
  ];
  summaryAbstract[0] = existingToBase(CH14_SUMMARY_IDS[index % CH14_SUMMARY_IDS.length]);
  const order = units.map((unit) => passageOrderBase(ORDER_POOLS[unit][index % ORDER_POOLS[unit].length]));
  order[0] = passageOrderBase(CH14_ORDER_IDS[index % CH14_ORDER_IDS.length]);
  const sentenceJaEn = units.map((unit) => SENTENCE_JA_EN_BANK[unit][index]);
  const trueFalseQuestions = units.flatMap((unit) => cyclePick(TRUE_FALSE_BANK[unit], index * 2, 2));
  trueFalseQuestions[0] = existingToBase(CH14_TRUE_FALSE_IDS[index % CH14_TRUE_FALSE_IDS.length]);
  const reading = units.map((unit) => READING_BANK[unit][index % READING_BANK[unit].length]);
  reading[0] = existingToBase(TOEIC_READING_IDS[index]);
  const translation = units.map((unit) => translationBase(unit, TRANSLATION_PARAGRAPHS[unit][index]));
  translation[0] = existingToBase(`passage-big-battery-translation-${index + 1}`);

  const staged: Array<{ base: BaseQuestion; section: EnglishExpectedSectionId; points: number }> = [
    ...jaEnCards.map((card) => ({ base: vocabularyBase(card, "ja-en"), section: "vocab-ja-en" as const, points: 2 })),
    ...enJaCards.map((card) => ({ base: vocabularyBase(card, "en-ja"), section: "vocab-en-ja" as const, points: 2 })),
    ...language.map((base) => ({ base, section: "language" as const, points: 3 })),
    ...summaryAbstract.map((base) => ({ base, section: "summary-abstract" as const, points: 3 })),
    ...order.map((base) => ({ base, section: "order" as const, points: 5 })),
    ...sentenceJaEn.map((base) => ({ base, section: "sentence-ja-en" as const, points: 3 })),
    ...trueFalseQuestions.map((base) => ({ base, section: "true-false" as const, points: 2 })),
    ...reading.map((base) => ({ base, section: "reading" as const, points: 4 })),
    ...translation.map((base) => ({ base, section: "translation" as const, points: 4 })),
  ];
  const questions = staged.map((item, questionIndex) => scored(item.base, item.section, item.points, examId, questionIndex));
  const total = questions.reduce((sum, question) => sum + question.points, 0);
  if (total !== ENGLISH_EXPECTED_EXAM_TOTAL_POINTS) throw new Error(`${examId} has ${total} points`);
  if (questions.some((question) => !ENGLISH_EXPECTED_SCOPE_UNITS.includes(question.unit))) {
    throw new Error(`${examId} includes an out-of-range chapter`);
  }

  const focuses = [
    "本文の骨格と語彙をつなぐ総合回",
    "時制・態・関係詞を根拠から確認",
    "要約とAbstract構成を含む実戦回",
    "数値・単位・因果関係を精査",
    "日英双方向と本文参照を横断",
    "追加範囲総仕上げ・全大問形式",
  ];
  return {
    id: examId,
    number,
    title: `英語 予想模試 ${String(number).padStart(2, "0")}`,
    subtitle: focuses[index],
    durationMinutes: 50,
    totalPoints: 100,
    questions,
  };
}
export const ENGLISH_EXPECTED_EXAMS: EnglishExpectedExam[] = Array.from(
  { length: 6 },
  (_, index) => buildExam(index + 1),
);

const PASSAGE_ID_BY_UNIT: Partial<Record<EnglishExpectedUnit, string>> = {
  ch14: "passage-big-battery",
  ch15: "passage-amyris",
  ch16: "passage-weather",
  ch18: "passage-wheelchair",
};

/**
 * 本番と同じ大問比率で作った、通常確認テスト向けの実戦問題プール。
 * 単語だけに偏らず、文法・要約・一文整序・本文参照・和訳を毎回含む
 * 予想模試6回分を、そのまま自動採点可能な EnglishQuestion へ変換する。
 */
export const ENGLISH_EXAM_LEVEL_QUESTIONS: EnglishQuestion[] = ENGLISH_EXPECTED_EXAMS.flatMap(
  (exam) => exam.questions.map((question) => ({
    id: `exam-level-${question.id}`,
    unit: question.unit,
    group: question.genre,
    format: question.format,
    grading: question.semantic ? "japanese-semantic" as const : undefined,
    prompt: question.prompt,
    answer: question.answer,
    accepted: question.accepted,
    options: question.options,
    tokens: question.tokens,
    explanation: `${question.explanation}\n\n出典・根拠：${question.reference.label}${question.reference.quote ? `\n本文：${question.reference.quote}` : ""}${question.reference.translation ? `\n和訳：${question.reference.translation}` : ""}`,
    reference: question.reference.quote
      ? {
          label: question.reference.label,
          quote: question.reference.quote,
          translation: question.reference.translation,
        }
      : undefined,
    passageId: ["order", "sentence-ja-en", "true-false", "reading", "translation"].includes(question.section)
      ? PASSAGE_ID_BY_UNIT[question.unit]
      : undefined,
  })),
);
