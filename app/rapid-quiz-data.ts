import { ENGLISH_VOCAB } from "./english-data";
import { APPLIED_MATH_FORMULAS } from "./applied-math-data";
import { MECHANICAL_DYNAMICS_FORMULAS } from "./mechanical-dynamics-data";
import { ALL_LAYERS, DEFAULT_CARDS, cardLayers, type ProtocolCard } from "./protocols";
import { SMART_CONTROL_CARDS } from "./smart-control-data";
import { TEXTBOOK_RESPONSE_CARDS } from "./smart-control-textbook-data";
import { STATISTICS_FORMULAS } from "./statistics-data";
import { THERMODYNAMICS_FORMULAS } from "./thermodynamics-data";
import { DEFAULT_SUBJECTS, type StudyCard, type SubjectId } from "./study-data";

export type RapidQuestion = {
  id: string;
  subjectId: SubjectId;
  topicLabel: string;
  prompt: string;
  answer: string;
  acceptedOptions: string[];
  options: string[];
  explanation: string;
  studyHref: string;
  mathOptions?: boolean;
};

export type RapidQuestionInstance = RapidQuestion & {
  instanceId: string;
};

export type RapidSubjectMeta = {
  id: SubjectId;
  name: string;
  accent: string;
  href: string;
  cardHref: string;
};

type ChoiceSeed = {
  id: string;
  topicLabel: string;
  prompt: string;
  answer: string;
  explanation: string;
  studyHref: string;
  options?: string[];
  acceptedOptions?: string[];
  mathOptions?: boolean;
};

export const RAPID_SUBJECTS: RapidSubjectMeta[] = DEFAULT_SUBJECTS.map((subject) => ({
  id: subject.id,
  name: subject.name,
  accent: subject.accent,
  href: subject.id === "network" ? "/subjects/network" : `/subjects/${subject.id}`,
  cardHref: subject.id === "network"
    ? "/subjects/network/cards"
    : subject.id === "subject-5" || subject.id === "subject-9"
      ? `/subjects/${subject.id}?mode=study`
      : `/subjects/${subject.id}?mode=cards`,
}));

export const RAPID_SUBJECT_IDS = RAPID_SUBJECTS.map((subject) => subject.id);

export function rapidSubjectMeta(subjectId: SubjectId) {
  return RAPID_SUBJECTS.find((subject) => subject.id === subjectId) ?? RAPID_SUBJECTS[0];
}

export function flashcardSearchHref(subjectId: SubjectId, query: string) {
  return `/cards?subject=${encodeURIComponent(subjectId)}&q=${encodeURIComponent(query)}`;
}

function stableHash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function rotated<T>(values: T[], amount: number) {
  if (!values.length) return values;
  const offset = ((amount % values.length) + values.length) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function buildChoicePool(subjectId: SubjectId, seeds: ChoiceSeed[]): RapidQuestion[] {
  const answerBank = unique(seeds.flatMap((seed) => seed.acceptedOptions ?? [seed.answer]));
  return seeds.map((seed, seedIndex) => {
    const supplied = unique(seed.options ?? []);
    const distractorBank = unique([
      ...supplied,
      ...rotated(answerBank, stableHash(seed.id) % Math.max(1, answerBank.length)),
    ]).filter((answer) => !(seed.acceptedOptions ?? [seed.answer]).includes(answer));
    const options = unique([
      seed.answer,
      ...distractorBank.slice(0, Math.max(1, 4 - 1)),
    ]);
    while (options.length < 2) options.push(`別の選択肢 ${options.length}`);
    return {
      ...seed,
      subjectId,
      studyHref: flashcardSearchHref(subjectId, seed.prompt),
      acceptedOptions: unique(seed.acceptedOptions ?? [seed.answer]),
      options: rotated(options.slice(0, 4), (stableHash(seed.id) + seedIndex) % Math.min(4, options.length)),
    };
  });
}

const ENGLISH_RAPID = buildChoicePool("subject-2", ENGLISH_VOCAB
  .filter((card) => ["ch15", "ch16", "ch18"].includes(card.unit))
  .map((card) => ({
    id: `rapid-${card.id}`,
    topicLabel: card.unit.toUpperCase(),
    prompt: `“${card.en}” の意味は？`,
    answer: card.ja,
    explanation: card.note ? `${card.ja}。覚え方：${card.note}` : `${card.en} は「${card.ja}」を表します。`,
    studyHref: "/subjects/subject-2?mode=cards",
  })));

export function networkCardsToRapid(cards: ProtocolCard[]) {
  return cards.map((card) => {
    const layers = cardLayers(card);
    const labels = layers.map((layer) => `L${layer}`);
    return {
      id: `rapid-${card.id}`,
      subjectId: "network" as const,
      topicLabel: "OSIレイヤー",
      prompt: `${card.label} は第何層？`,
      answer: labels.join(" / "),
      acceptedOptions: labels,
      options: ALL_LAYERS.map((layer) => `L${layer}`),
      explanation: [card.fullName, card.description, card.note].filter(Boolean).join("｜") || `${card.label} は ${labels.join(" / ")} に属します。`,
      studyHref: flashcardSearchHref("network", card.label),
    } satisfies RapidQuestion;
  });
}

const MECHANICAL_RAPID = buildChoicePool("subject-3", MECHANICAL_DYNAMICS_FORMULAS.map((card) => ({
  id: `rapid-${card.id}`,
  topicLabel: card.title,
  prompt: card.prompt,
  answer: card.formula,
  explanation: `${card.explanation} 覚え方：${card.cue}`,
  studyHref: "/subjects/subject-3?mode=cards",
  mathOptions: true,
})));

const THERMODYNAMICS_RAPID = buildChoicePool("subject-4", THERMODYNAMICS_FORMULAS.map((card) => ({
  id: `rapid-${card.id}`,
  topicLabel: card.title,
  prompt: card.prompt,
  answer: card.formula,
  explanation: `${card.explanation} 覚え方：${card.cue}`,
  studyHref: "/subjects/subject-4?mode=cards",
  mathOptions: true,
})));

const SMART_CONTROL_ALL_CARDS = [...SMART_CONTROL_CARDS, ...TEXTBOOK_RESPONSE_CARDS];
const SMART_CONTROL_RAPID = buildChoicePool("subject-6", SMART_CONTROL_ALL_CARDS.map((card) => ({
  id: `rapid-${card.id}`,
  topicLabel: card.title,
  prompt: card.prompt,
  answer: card.formula,
  explanation: `${card.explanation} 覚え方：${card.cue}`,
  studyHref: "/subjects/subject-6?mode=cards",
  mathOptions: true,
})));

const STATISTICS_RAPID = buildChoicePool("subject-7", STATISTICS_FORMULAS.map((card) => ({
  id: `rapid-${card.id}`,
  topicLabel: card.title,
  prompt: card.prompt,
  answer: card.formula,
  explanation: `${card.explanation} 覚え方：${card.cue}`,
  studyHref: "/subjects/subject-7?mode=cards",
  mathOptions: true,
})));

const APPLIED_MATH_RAPID = buildChoicePool("subject-8", APPLIED_MATH_FORMULAS.map((card) => ({
  id: `rapid-${card.id}`,
  topicLabel: card.title,
  prompt: card.prompt,
  answer: card.formula,
  explanation: `${card.explanation} 覚え方：${card.cue}`,
  studyHref: "/subjects/subject-8?mode=cards",
  mathOptions: true,
})));

const STATIC_POOLS: Record<SubjectId, RapidQuestion[]> = {
  "subject-2": ENGLISH_RAPID,
  network: networkCardsToRapid(DEFAULT_CARDS),
  "subject-3": MECHANICAL_RAPID,
  "subject-4": THERMODYNAMICS_RAPID,
  "subject-5": [],
  "subject-6": SMART_CONTROL_RAPID,
  "subject-7": STATISTICS_RAPID,
  "subject-8": APPLIED_MATH_RAPID,
  "subject-9": [],
};

export function getStaticRapidPool(subjectId: SubjectId) {
  return STATIC_POOLS[subjectId];
}

export function studyCardsToRapid(subjectId: SubjectId, cards: StudyCard[]) {
  const meta = rapidSubjectMeta(subjectId);
  return buildChoicePool(subjectId, cards.filter((card) => card.enabled).map((card) => ({
    id: `rapid-${card.id}`,
    topicLabel: "登録教材",
    prompt: card.prompt,
    answer: card.answer,
    explanation: `登録した暗記カードの答えは「${card.answer}」です。`,
    studyHref: meta.cardHref,
  })));
}

export function shuffleWith<T>(values: readonly T[], random: () => number = Math.random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function createRapidSession(pool: RapidQuestion[], count: number, random: () => number = Math.random) {
  if (!pool.length || count <= 0) return [];
  const result: RapidQuestionInstance[] = [];
  let cycle = shuffleWith(pool, random);
  for (let index = 0; index < count; index += 1) {
    if (index > 0 && index % pool.length === 0) {
      cycle = shuffleWith(pool, random);
      if (cycle.length > 1 && cycle[0].id === result[result.length - 1].id) {
        [cycle[0], cycle[1]] = [cycle[1], cycle[0]];
      }
    }
    const question = cycle[index % pool.length];
    result.push({ ...question, instanceId: `${question.id}-${index}` });
  }
  return result;
}

export function createBalancedRapidSession(
  pools: Record<SubjectId, RapidQuestion[]>,
  count: number,
  random: () => number = Math.random,
) {
  if (count < 9 || count > 999 || count % 9 !== 0) return [];
  if (RAPID_SUBJECT_IDS.some((subjectId) => !pools[subjectId]?.length)) return [];
  const perSubject = count / 9;
  const subjectQueues = Object.fromEntries(RAPID_SUBJECT_IDS.map((subjectId) => [
    subjectId,
    createRapidSession(pools[subjectId], perSubject, random),
  ])) as Record<SubjectId, RapidQuestionInstance[]>;
  const result: RapidQuestionInstance[] = [];
  for (let round = 0; round < perSubject; round += 1) {
    for (const subjectId of shuffleWith(RAPID_SUBJECT_IDS, random)) {
      result.push(subjectQueues[subjectId][round]);
    }
  }
  return result.map((question, index) => ({ ...question, instanceId: `${question.id}-balanced-${index}` }));
}

export function isRapidAnswerCorrect(question: RapidQuestion, selected: string | null) {
  return selected !== null && question.acceptedOptions.includes(selected);
}

export function normalizeOverallQuestionCount(value: number) {
  const bounded = Math.min(999, Math.max(9, Math.round(value)));
  return Math.min(999, Math.max(9, Math.round(bounded / 9) * 9));
}
