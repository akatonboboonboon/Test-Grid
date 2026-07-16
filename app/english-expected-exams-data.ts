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

export type EnglishExpectedUnit = "ch15" | "ch16" | "ch18";
export type EnglishExpectedSectionId =
  | "vocab-ja-en"
  | "vocab-en-ja"
  | "language"
  | "order"
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

export const ENGLISH_EXPECTED_EXAM_SECTIONS: EnglishExpectedSection[] = [
  { id: "vocab-ja-en", number: "I", title: "語彙・熟語｜日→英", instruction: "日本語に対応する教材表現を英語で書きなさい。", page: 1 },
  { id: "vocab-en-ja", number: "II", title: "語彙・熟語｜英→日", instruction: "英語表現の意味を自然な日本語で書きなさい。", page: 1 },
  { id: "language", number: "III", title: "語形・文法・文脈", instruction: "選択肢または空欄に、文法と文脈の両方に合う答えを入れなさい。", page: 1 },
  { id: "order", number: "IV", title: "本文主要文法｜語句整序", instruction: "提示された語句をすべて一度ずつ使い、本文どおりの英文を完成させなさい。", page: 2 },
  { id: "true-false", number: "V", title: "本文 True / False", instruction: "Chapter 15・16・18の本文内容と一致すれば T、一致しなければ F を選びなさい。", page: 2 },
  { id: "reading", number: "VI", title: "本文参照・内容理解", instruction: "本文の該当箇所を根拠に、最も適切なものを1つ選びなさい。", page: 3 },
  { id: "translation", number: "VII", title: "本文和訳", instruction: "主語・述語・修飾関係を保ち、英文を自然な日本語に訳しなさい。", page: 3 },
];

const UNIT_LABELS: Record<EnglishExpectedUnit, string> = {
  ch15: "Chapter 15｜新しい生命体を作り出す企業",
  ch16: "Chapter 16｜スパコンで天気予報①",
  ch18: "Chapter 18｜高齢化社会に強力な助っ人",
};

type BaseQuestion = Omit<EnglishExpectedQuestion, "id" | "section" | "points">;

function findExistingQuestion(id: string): EnglishQuestion & { unit: EnglishExpectedUnit } {
  const question = ENGLISH_QUESTIONS.find((candidate) => candidate.id === id);
  if (!question) throw new Error(`Expected English range question not found: ${id}`);
  if (question.unit !== "ch15" && question.unit !== "ch16" && question.unit !== "ch18") {
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
  (["ch15", "ch16", "ch18"] as EnglishExpectedUnit[]).map((unit) => [
    unit,
    ENGLISH_VOCAB.filter((card) => card.unit === unit),
  ]),
) as Record<EnglishExpectedUnit, EnglishVocabCard[]>;

const VOCAB_STEP: Record<EnglishExpectedUnit, number> = { ch15: 7, ch16: 5, ch18: 5 };

function vocabularySequence(unit: EnglishExpectedUnit) {
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
    explanation: `判定は ${answer}。${reason}\n\n根拠は本文第${paragraph}段落です。${answer === "F" ? "誤っている語句を本文の事実へ直してから覚えます。" : "主語・数値・因果関係まで本文と一致しています。"}`,
    reference,
  };
}

const TRUE_FALSE_BANK: Record<EnglishExpectedUnit, BaseQuestion[]> = {
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
  return {
    sourceId: id,
    unit,
    genre: "長文内容理解",
    format: "choice",
    prompt,
    options,
    answer,
    explanation: `${reason}\n\n他の選択肢：${wrongReasons}`,
    reference: quote(unit, paragraph),
  };
}

const READING_BANK: Record<EnglishExpectedUnit, BaseQuestion[]> = {
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

const GRAMMAR_POOLS: Record<EnglishExpectedUnit, string[]> = {
  ch15: ["ch15-prep-1", "ch15-prep-2", "ch15-prep-3", "ch15-prep-4", "ch15-summary-1", "ch15-summary-2", "ch15-summary-3", "ch15-summary-4"],
  ch16: ["ch16-word-1", "ch16-word-2", "ch16-word-3", "ch16-homepage-1", "ch16-homepage-2", "ch16-homepage-3", "ch16-homepage-4", "ch16-homepage-5"],
  ch18: ["ch18-relative-1", "ch18-relative-2", "ch18-summary-1", "ch18-summary-2", "ch18-summary-3", "ch18-summary-4", "ch18-interview-1", "ch18-interview-2", "ch18-interview-3", "ch18-interview-4"],
};

const ORDER_POOLS: Record<EnglishExpectedUnit, string[]> = {
  ch15: ["passage-order-ch15-1", "passage-order-ch15-2", "passage-order-ch15-3", "passage-order-ch15-4"],
  ch16: ["passage-order-ch16-1", "passage-order-ch16-2", "passage-order-ch16-3", "passage-order-ch16-4"],
  ch18: ["passage-order-ch18-1", "passage-order-ch18-2", "passage-order-ch18-3", "passage-order-ch18-4"],
};

const TRANSLATION_PARAGRAPHS: Record<EnglishExpectedUnit, number[]> = {
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

function buildExam(number: number): EnglishExpectedExam {
  const index = number - 1;
  const examId = `english-expected-${String(number).padStart(2, "0")}`;
  const vocab15 = vocabularySequence("ch15");
  const vocab16 = vocabularySequence("ch16");
  const vocab18 = vocabularySequence("ch18");

  const jaEnCards = [
    ...cyclePick(vocab15, index * 3, 2),
    ...cyclePick(vocab16, index * 4, 2),
    ...cyclePick(vocab18, index * 3, 1),
  ];
  const enJaCards = [
    ...cyclePick(vocab15, index * 3 + 2, 1),
    ...cyclePick(vocab16, index * 4 + 2, 2),
    ...cyclePick(vocab18, index * 3 + 1, 2),
  ];
  const language = [
    existingToBase(GRAMMAR_POOLS.ch15[index % GRAMMAR_POOLS.ch15.length]),
    existingToBase(GRAMMAR_POOLS.ch16[index % GRAMMAR_POOLS.ch16.length]),
    ...cyclePick(GRAMMAR_POOLS.ch18, index * 2, 2).map(existingToBase),
  ];
  const order = (["ch15", "ch16", "ch18"] as EnglishExpectedUnit[]).map((unit) => (
    existingToBase(ORDER_POOLS[unit][index % ORDER_POOLS[unit].length])
  ));
  const trueFalseQuestions = (["ch15", "ch16", "ch18"] as EnglishExpectedUnit[]).flatMap((unit) => (
    cyclePick(TRUE_FALSE_BANK[unit], index * 2, 2)
  ));
  const reading = (["ch15", "ch16", "ch18"] as EnglishExpectedUnit[]).map((unit) => (
    READING_BANK[unit][index % READING_BANK[unit].length]
  ));
  const translationUnits = ["ch15", "ch16", "ch18"] as EnglishExpectedUnit[];
  const translation = translationUnits.map((unit) => (
    translationBase(unit, TRANSLATION_PARAGRAPHS[unit][index])
  ));
  const translationPoints = translationUnits.map((_, unitIndex) => unitIndex === index % 3 ? 6 : 7);

  const staged: Array<{ base: BaseQuestion; section: EnglishExpectedSectionId; points: number }> = [
    ...jaEnCards.map((card) => ({ base: vocabularyBase(card, "ja-en"), section: "vocab-ja-en" as const, points: 2 })),
    ...enJaCards.map((card) => ({ base: vocabularyBase(card, "en-ja"), section: "vocab-en-ja" as const, points: 2 })),
    ...language.map((base) => ({ base, section: "language" as const, points: 3 })),
    ...order.map((base) => ({ base, section: "order" as const, points: 5 })),
    ...trueFalseQuestions.map((base) => ({ base, section: "true-false" as const, points: 3 })),
    ...reading.map((base) => ({ base, section: "reading" as const, points: 5 })),
    ...translation.map((base, unitIndex) => ({ base, section: "translation" as const, points: translationPoints[unitIndex] })),
  ];
  const questions = staged.map((item, questionIndex) => scored(item.base, item.section, item.points, examId, questionIndex));
  const total = questions.reduce((sum, question) => sum + question.points, 0);
  if (total !== ENGLISH_EXPECTED_EXAM_TOTAL_POINTS) throw new Error(`${examId} has ${total} points`);
  if (questions.some((question) => !(["ch15", "ch16", "ch18"] as string[]).includes(question.unit))) {
    throw new Error(`${examId} includes an out-of-range chapter`);
  }

  const focuses = [
    "基本語彙から本文根拠までを均等配分",
    "数値・受動態・関係詞を重点確認",
    "語源語彙と主要構文を横断",
    "紛らわしいT/Fと数値の照合",
    "本文の因果・対比・目的表現を確認",
    "3章総仕上げ・未出段落中心",
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
