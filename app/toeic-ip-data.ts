/**
 * TOEIC L&R IP preparation content for this site.
 *
 * Every script, passage, option, explanation, and CSS scene description below
 * is original content written for this project. Nothing is copied from an
 * official sample, a recalled test, or a commercially published question.
 */

export type ToeicPart = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ToeicSection = "listening" | "reading";
export type ToeicDifficulty = "basic" | "standard" | "advanced";
export type ToeicDeliveryMode = "paper" | "online-msa";
export type ToeicAccent = "US" | "UK" | "Canada" | "Australia-NewZealand";

export type ToeicAbility =
  | "L_GIST_SHORT"
  | "L_GIST_EXTENDED"
  | "L_DETAIL_SHORT"
  | "L_DETAIL_EXTENDED"
  | "L_PRAGMATIC"
  | "R_INFERENCE"
  | "R_DETAIL"
  | "R_CONNECT"
  | "R_VOCAB"
  | "R_GRAMMAR";

export type ToeicTopic =
  | "corporate-development"
  | "dining"
  | "entertainment"
  | "finance"
  | "general-business"
  | "health"
  | "property"
  | "manufacturing"
  | "office"
  | "personnel"
  | "purchasing"
  | "technology"
  | "travel";

export type ToeicQuestionKind =
  | "photograph"
  | "question-response"
  | "conversation"
  | "talk"
  | "incomplete-sentence"
  | "text-completion"
  | "reading-comprehension";

export type ToeicScene = {
  key: string;
  altJa: string;
  setting: "office" | "warehouse" | "restaurant" | "street";
  layers: Array<{
    kind: "background" | "person" | "furniture" | "object" | "vehicle";
    token: string;
    position: "left" | "center" | "right" | "foreground" | "background";
  }>;
};

export type ToeicChart = {
  kind: "table" | "schedule" | "notice";
  title: string;
  headers: string[];
  rows: string[][];
  altJa: string;
};

export type ToeicQuestion = {
  id: string;
  part: ToeicPart;
  section: ToeicSection;
  kind: ToeicQuestionKind;
  prompt: string;
  choices: string[];
  /** Zero-based index into choices. */
  answerIndex: number;
  explanationJa: string;
  evidence: string;
  ability: ToeicAbility[];
  topic: ToeicTopic;
  difficulty: ToeicDifficulty;
  /** Full original transcript. A test UI should hide it until the answer is submitted. */
  script?: string;
  /** A CSS-renderable scene; no external photograph is required. */
  scene?: ToeicScene;
  /** Full original reading stimulus. */
  passage?: string;
  /** Optional text-equivalent visual information. */
  chart?: ToeicChart;
};

export type ToeicVocabulary = {
  id: string;
  term: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "phrase";
  meaningJa: string;
  collocation: string;
  example: string;
  exampleJa: string;
  topic: ToeicTopic;
  difficulty: ToeicDifficulty;
};

export type ToeicFormatPart = {
  part: ToeicPart;
  nameJa: string;
  questionCount: number;
  noteJa: string;
};

export type ToeicOnlineUnit = {
  section: ToeicSection;
  unit: 1 | 2;
  questionCount: number;
  durationMinutes?: number;
  partCounts: Partial<Record<ToeicPart, number>>;
  adaptive: boolean;
};

export type ToeicFormat = {
  id: string;
  mode: ToeicDeliveryMode;
  nameJa: string;
  totalQuestions: number;
  approximateMinutes: number;
  listening: { questionCount: number; approximateMinutes: number };
  reading: { questionCount: number; minutes: number };
  scoreRange: { listening: string; reading: string; total: string; increment: 5 };
  parts?: ToeicFormatPart[];
  units?: ToeicOnlineUnit[];
  notesJa: string[];
  resourceIds: string[];
};

export type ToeicStudyPhase = {
  id: string;
  weekStart: number;
  weekEnd: number;
  dateStart: string;
  dateEnd: string;
  titleJa: string;
  focusParts: ToeicPart[];
  goalsJa: string[];
  weeklyTasksJa: string[];
};

export type ToeicOfficialResource = {
  id: string;
  title: string;
  publisher: "IIBC" | "ETS";
  url: string;
  descriptionJa: string;
  checkedOn: string;
};

export const TOEIC_SUBJECT = {
  id: "toeic-lr-ip",
  nameJa: "TOEIC IP対策",
  baseSubjectId: "english",
  separateSubject: true,
  examDate: "2026-12-25",
  studyStartDate: "2026-07-31",
  totalStudyWeeks: 21,
  deliveryModeRequiresConfirmation: true,
  targetScoreRequiresUserInput: true,
} as const;

export const TOEIC_COPYRIGHT_NOTICE = {
  contentLabelJa: "形式準拠オリジナル教材",
  policyJa:
    "非公開の過去問、記憶再現問題、流出問題、公式Directionsの転載は行わない。公式サンプルは複製せず公式ページへ案内する。",
  scoreNoticeJa:
    "練習問題の正答率は公式スコアではない。公式の素点換算表は公開されていないため、未校正の正答率を公式換算点として表示しない。",
} as const;

export const TOEIC_OFFICIAL_RESOURCES: ToeicOfficialResource[] = [
  {
    id: "iibc-lr-format",
    title: "テストの形式と構成｜TOEIC Listening & Reading Test",
    publisher: "IIBC",
    url: "https://www.iibc-global.org/toeic/test/lr/about/format.html",
    descriptionJa: "マークシート方式の時間、問題数、Part 1〜7の公式構成。",
    checkedOn: "2026-07-31",
  },
  {
    id: "iibc-ip-online-guide",
    title: "TOEIC L&R IPテスト（オンライン）受験のしおり",
    publisher: "IIBC",
    url: "https://www.iibc-global.org/hubfs/library/default/toeic/corporate/lrip_online/pdf/iponline-jyukenkankyo-sb.pdf",
    descriptionJa: "オンラインMSA方式のUnit構成、時間、問題数、操作上の注意。",
    checkedOn: "2026-07-31",
  },
  {
    id: "iibc-abilities",
    title: "デジタル公式認定証・公式認定証の形式",
    publisher: "IIBC",
    url: "https://www.iibc-global.org/toeic/test/lr/guide04/guide04_02.html",
    descriptionJa: "Listening・Reading各5項目のAbilities Measuredの説明。",
    checkedOn: "2026-07-31",
  },
  {
    id: "ets-lr-overview",
    title: "About the TOEIC Listening and Reading Test",
    publisher: "ETS",
    url: "https://www.ets.org/toeic/about/listening-reading.html",
    descriptionJa: "TOEIC L&Rの目的とListening・Readingの基本構成。",
    checkedOn: "2026-07-31",
  },
  {
    id: "ets-score-guide",
    title: "TOEIC Listening & Reading Score User Guide",
    publisher: "ETS",
    url: "https://www.ets.org/pdfs/toeic/toeic-listening-reading-score-user-guide.pdf",
    descriptionJa: "採点、スコア尺度、職場場面、スコア解釈に関する公式ガイド。",
    checkedOn: "2026-07-31",
  },
  {
    id: "ets-preparation",
    title: "Preparation Materials for the TOEIC Tests",
    publisher: "ETS",
    url: "https://www.ets.org/toeic/test-takers/prepare.html",
    descriptionJa: "公式ハンドブックと公式サンプルへの案内。",
    checkedOn: "2026-07-31",
  },
];

export const TOEIC_FORMATS: ToeicFormat[] = [
  {
    id: "paper",
    mode: "paper",
    nameJa: "IPテスト・マークシート方式",
    totalQuestions: 200,
    approximateMinutes: 120,
    listening: { questionCount: 100, approximateMinutes: 45 },
    reading: { questionCount: 100, minutes: 75 },
    scoreRange: { listening: "5〜495", reading: "5〜495", total: "10〜990", increment: 5 },
    parts: [
      { part: 1, nameJa: "写真描写問題", questionCount: 6, noteJa: "1枚の写真に対する4つの説明文を一度だけ聞く。" },
      { part: 2, nameJa: "応答問題", questionCount: 25, noteJa: "質問または発言と3つの応答を一度だけ聞く。" },
      { part: 3, nameJa: "会話問題", questionCount: 39, noteJa: "13会話、各3問。2〜3人、図表問題を含む。" },
      { part: 4, nameJa: "説明文問題", questionCount: 30, noteJa: "10トーク、各3問。図表問題を含む。" },
      { part: 5, nameJa: "短文穴埋め問題", questionCount: 30, noteJa: "文法・語彙・語法。" },
      { part: 6, nameJa: "長文穴埋め問題", questionCount: 16, noteJa: "4文書、各4問。単語・句・一文を補う。" },
      { part: 7, nameJa: "読解問題", questionCount: 54, noteJa: "単一文書29問、複数文書25問。" },
    ],
    notesJa: [
      "Listeningの音声は一度だけ放送される。",
      "Readingは75分内でPart間の時間配分を受験者が管理する。",
      "誤答による追加減点はないため全問に回答する。",
    ],
    resourceIds: ["iibc-lr-format", "ets-score-guide"],
  },
  {
    id: "online-msa",
    mode: "online-msa",
    nameJa: "TOEIC L&R IPテスト（オンライン）MSA方式",
    totalQuestions: 90,
    approximateMinutes: 62,
    listening: { questionCount: 45, approximateMinutes: 25 },
    reading: { questionCount: 45, minutes: 37 },
    scoreRange: { listening: "5〜495", reading: "5〜495", total: "10〜990", increment: 5 },
    units: [
      { section: "listening", unit: 1, questionCount: 25, partCounts: { 1: 3, 2: 4, 3: 9, 4: 9 }, adaptive: false },
      { section: "listening", unit: 2, questionCount: 20, partCounts: { 2: 5, 3: 9, 4: 6 }, adaptive: true },
      { section: "reading", unit: 1, questionCount: 25, durationMinutes: 23, partCounts: { 5: 5, 6: 4, 7: 16 }, adaptive: false },
      { section: "reading", unit: 2, questionCount: 20, durationMinutes: 14, partCounts: { 5: 7, 6: 4, 7: 9 }, adaptive: true },
    ],
    notesJa: [
      "各SectionのUnit 1は共通25問、Unit 2はUnit 1の正誤状況に応じた20問。",
      "Unit 1の余り時間はUnit 2へ繰り越されず、Unit 2からUnit 1へ戻れない。",
      "Readingは各Unit内に限り回答を確認・修正できる。",
      "本サイトの適応分岐は学習用で、ETSの採点・分岐ロジックを再現するものではない。",
    ],
    resourceIds: ["iibc-ip-online-guide", "ets-score-guide"],
  },
];

export const TOEIC_STUDY_PHASES: ToeicStudyPhase[] = [
  {
    id: "diagnostic",
    weekStart: 1,
    weekEnd: 1,
    dateStart: "2026-07-31",
    dateEnd: "2026-08-06",
    titleJa: "診断と受験方式の確定",
    focusParts: [1, 2, 3, 4, 5, 6, 7],
    goalsJa: ["マークシート／オンラインを確認する。", "Part別正答率と解答時間の基準値を作る。", "目標スコアを決める。"],
    weeklyTasksJa: ["全Part診断1回", "誤答分類", "Listening・Readingの優先技能を各2つ選定"],
  },
  {
    id: "foundation",
    weekStart: 2,
    weekEnd: 5,
    dateStart: "2026-08-07",
    dateEnd: "2026-09-03",
    titleJa: "語彙・文法・短い音声",
    focusParts: [1, 2, 5],
    goalsJa: ["職場語彙を毎日反復する。", "質問型と間接応答を聞き分ける。", "基礎文法を一周する。"],
    weeklyTasksJa: ["語彙60語以上", "Part 1・2時間制セット", "Part 5文法セット2回"],
  },
  {
    id: "extended-listening",
    weekStart: 6,
    weekEnd: 9,
    dateStart: "2026-09-04",
    dateEnd: "2026-10-01",
    titleJa: "会話・トークと長文穴埋め",
    focusParts: [3, 4, 6],
    goalsJa: ["設問先読みと要点把握を習慣化する。", "複数話者・複数アクセントに慣れる。", "文脈をまたぐ接続を判断する。"],
    weeklyTasksJa: ["会話・トーク各4セット", "ディクテーション2本", "Part 6時間制セット"],
  },
  {
    id: "reading",
    weekStart: 10,
    weekEnd: 13,
    dateStart: "2026-10-02",
    dateEnd: "2026-10-29",
    titleJa: "Part 7の根拠検索と情報統合",
    focusParts: [6, 7],
    goalsJa: ["詳細・推測・目的の根拠を区別する。", "単一文書から複数文書へ進む。", "言い換え表現を蓄積する。"],
    weeklyTasksJa: ["単一文書5セット", "複数文書3セット", "Reading時間制演習"],
  },
  {
    id: "integration",
    weekStart: 14,
    weekEnd: 17,
    dateStart: "2026-10-30",
    dateEnd: "2026-11-26",
    titleJa: "全Part統合と弱点適応",
    focusParts: [1, 2, 3, 4, 5, 6, 7],
    goalsJa: ["弱点60％・間隔復習25％・混合15％で学習する。", "一度聞き・時間制限下の正答率を上げる。"],
    weeklyTasksJa: ["混合ミニ模試1回", "最弱技能の集中セット2回", "翌日復習"],
  },
  {
    id: "mocks",
    weekStart: 18,
    weekEnd: 20,
    dateStart: "2026-11-27",
    dateEnd: "2026-12-17",
    titleJa: "本番形式模試",
    focusParts: [1, 2, 3, 4, 5, 6, 7],
    goalsJa: ["受験方式と同じUnit・時間構成で解く。", "模試翌日に全誤答を根拠つきで直す。"],
    weeklyTasksJa: ["本番形式模試1回", "技能別レポート", "再演習セット"],
  },
  {
    id: "taper",
    weekStart: 21,
    weekEnd: 21,
    dateStart: "2026-12-18",
    dateEnd: "2026-12-24",
    titleJa: "最終調整",
    focusParts: [1, 2, 3, 4, 5, 6, 7],
    goalsJa: ["12月20日までに最終模試を終える。", "新規教材を増やさず誤答と語彙を確認する。"],
    weeklyTasksJa: ["最終リハーサル", "誤答上位20件の確認", "受験環境の確認"],
  },
];

const OFFICE_SHELF_SCENE: ToeicScene = {
  key: "office-person-placing-folders",
  altJa: "オフィスで女性が壁際の棚へ青いフォルダーを置いている。中央には空の机があり、窓や他の人物はいない。",
  setting: "office",
  layers: [
    { kind: "background", token: "office-wall", position: "background" },
    { kind: "furniture", token: "tall-shelf", position: "right" },
    { kind: "person", token: "standing-worker", position: "center" },
    { kind: "object", token: "blue-folders", position: "right" },
    { kind: "furniture", token: "empty-desk", position: "left" },
  ],
};

const LOADING_VAN_SCENE: ToeicScene = {
  key: "warehouse-worker-loading-van",
  altJa: "倉庫前で男性が段ボール箱を開いた配送車の後部へ持ち上げている。左側の地面には台車がある。",
  setting: "warehouse",
  layers: [
    { kind: "background", token: "warehouse-door", position: "background" },
    { kind: "vehicle", token: "open-delivery-van", position: "right" },
    { kind: "person", token: "worker-carrying-box", position: "center" },
    { kind: "object", token: "hand-truck", position: "left" },
  ],
};

const RESTAURANT_SCENE: ToeicScene = {
  key: "restaurant-set-empty-tables",
  altJa: "無人のレストランで、複数のテーブルに皿、グラス、ナプキンが整然と並び、椅子は各テーブルの周りに置かれている。",
  setting: "restaurant",
  layers: [
    { kind: "background", token: "restaurant-wall", position: "background" },
    { kind: "furniture", token: "round-tables", position: "center" },
    { kind: "furniture", token: "dining-chairs", position: "foreground" },
    { kind: "object", token: "place-settings", position: "center" },
  ],
};

const PRINTER_SCENE: ToeicScene = {
  key: "office-technician-checking-printer",
  altJa: "オフィスの複合機の前で作業員がひざをつき、開いた給紙トレイを確認している。床に紙は散らばっていない。",
  setting: "office",
  layers: [
    { kind: "background", token: "office-hallway", position: "background" },
    { kind: "object", token: "large-printer", position: "right" },
    { kind: "person", token: "kneeling-technician", position: "center" },
    { kind: "object", token: "open-paper-tray", position: "right" },
  ],
};

const P3_MEETING_SCRIPT = `Leah (UK): Daniel, Room Four is no longer available at two o'clock. The maintenance team needs to repair its projector.
Daniel (US): That's when our vendor presentation begins. Is Room Seven free?
Leah: It is, but only from two to three. That should be enough for the presentation.
Daniel: Good. Please update the calendar invitation and ask reception to direct our visitors there.
Leah: I'll do both right away.`;

const P3_BAGS_SCRIPT = `Amina (Canada): We need eighty gift bags for Saturday's client event. What do we have in stock?
Leo (Australia-New Zealand): The warehouse has fifty black bags and forty blue ones.
Nora (US): The client requested that all of the bags be the same color.
Amina: Can our supplier deliver thirty more black bags by Friday?
Leo: Yes, if we place the order before noon. I'll call the supplier now.
Nora: And I'll confirm the final color choice with the client.`;

const BAG_STOCK_CHART: ToeicChart = {
  kind: "table",
  title: "Warehouse Stock",
  headers: ["Item", "Black", "Blue"],
  rows: [["Gift bags", "50", "40"]],
  altJa: "倉庫在庫表。ギフトバッグは黒50個、青40個。",
};

const P4_WATER_SCRIPT = `Announcer (UK): Attention, staff on the fourth floor. The water service will be shut off from one until three tomorrow afternoon while a damaged pipe is repaired. The kitchen sink and drinking fountain on the fourth floor will be unavailable, but the restrooms on the third floor will remain open. Please fill any water bottles before one o'clock. The Facilities Department will send an e-mail as soon as service has been restored.`;

const P4_SHUTTLE_SCRIPT = `Omar (Canada): Hello, Ms. Chen. This is Omar from the Lakeside Hotel calling about your airport shuttle reservation for six thirty on Monday morning. Because of road construction at the airport, the pickup point has changed from Door Two to Door Five at the east terminal. Your driver will be holding a blue Lakeside Hotel sign. If your flight schedule changes, please call us by Sunday evening so that we can adjust the reservation.`;

const P6_WORKSHOP_PASSAGE = `To: Registered Participants
From: Harbor Training Center
Subject: Project Planning Workshop

Thank you for registering for our project planning workshop. The session was originally scheduled for September 8, but it [1] because the building will undergo a safety inspection that day. The workshop will now take place on September 15 in Room 305. All existing registrations [2] automatically to the new date. If the new date is not convenient, please contact us by September 10 for a full refund. We appreciate [3] understanding. [4]`;

const P7_PARKING_PASSAGE = `From: Facilities Office
To: All Employees
Subject: Temporary Parking Arrangements

Starting Monday, September 14, the west parking lot will be closed for three days while its surface is renewed. During this period, employees should park in the public lot behind Central Station. Show your staff identification card at the booth, and the parking fee will be waived. A company shuttle will leave that lot every fifteen minutes from 7:00 to 10:00 A.M. and from 4:00 to 7:00 P.M. Visitors should continue to use the east lot beside the main entrance. If heavy rain is forecast, the resurfacing work will begin on September 21 instead. The Facilities Office will send a final update on Friday afternoon.`;

const P7_ORDER_PASSAGE = `DOCUMENT 1 — Message from Greenway Café
To: orders@oaklinesupply.example
From: Mira Santos, Greenway Café
Subject: Order AP-482

Our delivery arrived this morning, but it contained only 600 of the 1,000 paper cups listed on our order. The eight boxes of tea bags were missing, and twelve of the twenty-four saucers were cracked. We need the cups and tea for a customer event on Friday. Please tell me when the missing and replacement items can arrive.

DOCUMENT 2 — Order Record AP-482
Paper cups: ordered 1,000 / received 600
Tea bags: ordered 8 boxes / received 0
Saucers: ordered 24 / received 24 / damaged 12

DOCUMENT 3 — Supplier Reply
To: Mira Santos
From: Evan Cole, Oakline Supply

I apologize for the packing error. The remaining 400 cups, all eight boxes of tea bags, and twelve replacement saucers will leave our warehouse by express service today. They are scheduled to reach your café by noon on Thursday. There will be no additional shipping charge. Please return the damaged saucers using the prepaid label attached to this message.`;

const ORDER_CHART: ToeicChart = {
  kind: "table",
  title: "Order AP-482",
  headers: ["Item", "Ordered", "Received", "Problem"],
  rows: [
    ["Paper cups", "1,000", "600", "400 missing"],
    ["Tea bags", "8 boxes", "0", "8 boxes missing"],
    ["Saucers", "24", "24", "12 damaged"],
  ],
  altJa: "注文AP-482の表。紙コップ400個と茶葉8箱が不足し、受け取った皿24枚のうち12枚が破損。",
};

export const TOEIC_QUESTIONS: ToeicQuestion[] = [
  {
    id: "toeic-p1-001",
    part: 1,
    section: "listening",
    kind: "photograph",
    prompt: "場面を最も正確に表す説明を選んでください。",
    choices: [
      "A woman is placing folders on a shelf.",
      "Some windows are being washed.",
      "Several people are seated around a table.",
      "A cabinet is being moved through a doorway.",
    ],
    answerIndex: 0,
    explanationJa: "女性がフォルダーを棚へ置いている場面なのでAが正解です。placing A on Bは「AをBの上へ置いている」。",
    evidence: "正解音声: “A woman is placing folders on a shelf.” 場面の人物・動作・対象がすべて一致する。",
    ability: ["L_GIST_SHORT", "L_DETAIL_SHORT"],
    topic: "office",
    difficulty: "basic",
    script: "(A) A woman is placing folders on a shelf. (B) Some windows are being washed. (C) Several people are seated around a table. (D) A cabinet is being moved through a doorway.",
    scene: OFFICE_SHELF_SCENE,
  },
  {
    id: "toeic-p1-002",
    part: 1,
    section: "listening",
    kind: "photograph",
    prompt: "場面を最も正確に表す説明を選んでください。",
    choices: [
      "The vehicle is parked under a bridge.",
      "A customer is signing a receipt.",
      "A man is loading a box into a van.",
      "Packages are lined up on a store counter.",
    ],
    answerIndex: 2,
    explanationJa: "男性が箱を配送車へ積み込んでいるためCです。load A into Bで「AをBへ積み込む」。",
    evidence: "正解音声: “A man is loading a box into a van.” 男性、箱、配送車、積み込み動作が一致する。",
    ability: ["L_GIST_SHORT", "L_DETAIL_SHORT"],
    topic: "purchasing",
    difficulty: "basic",
    script: "(A) The vehicle is parked under a bridge. (B) A customer is signing a receipt. (C) A man is loading a box into a van. (D) Packages are lined up on a store counter.",
    scene: LOADING_VAN_SCENE,
  },
  {
    id: "toeic-p1-003",
    part: 1,
    section: "listening",
    kind: "photograph",
    prompt: "場面を最も正確に表す説明を選んでください。",
    choices: [
      "Diners are reading menus by a window.",
      "Several tables have been set for a meal.",
      "A server is carrying a tray outdoors.",
      "Chairs are being stacked in a corner.",
    ],
    answerIndex: 1,
    explanationJa: "食器が並べられた複数のテーブルを述べるBが正解です。have been setは準備済みの状態を表します。",
    evidence: "正解音声: “Several tables have been set for a meal.” 無人でも、食事の準備が整った状態を正確に表す。",
    ability: ["L_GIST_SHORT", "L_DETAIL_SHORT"],
    topic: "dining",
    difficulty: "standard",
    script: "(A) Diners are reading menus by a window. (B) Several tables have been set for a meal. (C) A server is carrying a tray outdoors. (D) Chairs are being stacked in a corner.",
    scene: RESTAURANT_SCENE,
  },
  {
    id: "toeic-p1-004",
    part: 1,
    section: "listening",
    kind: "photograph",
    prompt: "場面を最も正確に表す説明を選んでください。",
    choices: [
      "Documents are scattered across the floor.",
      "A machine is being pushed down a hallway.",
      "The man is hanging a picture on a wall.",
      "A technician is examining an office machine.",
    ],
    answerIndex: 3,
    explanationJa: "作業員が複合機を点検しているためDです。examiningは「詳しく調べている」。",
    evidence: "正解音声: “A technician is examining an office machine.” 人物の職種、行動、対象が場面と一致する。",
    ability: ["L_GIST_SHORT", "L_DETAIL_SHORT"],
    topic: "technology",
    difficulty: "standard",
    script: "(A) Documents are scattered across the floor. (B) A machine is being pushed down a hallway. (C) The man is hanging a picture on a wall. (D) A technician is examining an office machine.",
    scene: PRINTER_SCENE,
  },
  {
    id: "toeic-p2-001",
    part: 2,
    section: "listening",
    kind: "question-response",
    prompt: "質問に対する最も自然な応答を選んでください。",
    choices: ["In Conference Room B.", "Yes, I reviewed it.", "By the end of the quarter."],
    answerIndex: 0,
    explanationJa: "Whereは場所を尋ねるため、会議室を答えるAが自然です。reviewの音の重なりだけでBを選ばないことが重要です。",
    evidence: "質問: “Where is the quarterly review being held?” 場所を直接示すのは “In Conference Room B.”。",
    ability: ["L_GIST_SHORT", "L_PRAGMATIC"],
    topic: "office",
    difficulty: "basic",
    script: "Questioner (US): Where is the quarterly review being held? (A) In Conference Room B. (B) Yes, I reviewed it. (C) By the end of the quarter.",
  },
  {
    id: "toeic-p2-002",
    part: 2,
    section: "listening",
    kind: "question-response",
    prompt: "質問に対する最も自然な応答を選んでください。",
    choices: ["The revision was helpful.", "I sent it this morning.", "At the front desk."],
    answerIndex: 1,
    explanationJa: "否定疑問ですが、送付済みであることを答えるBが自然です。Haven't you ... yet?に単純なYes/Noがなくても、事実を答えればよい形式です。",
    evidence: "質問: “Haven't you sent the revised invoice yet?” 応答 “I sent it this morning.” が送付状況を直接説明する。",
    ability: ["L_DETAIL_SHORT", "L_PRAGMATIC"],
    topic: "finance",
    difficulty: "standard",
    script: "Questioner (UK): Haven't you sent the revised invoice yet? (A) The revision was helpful. (B) I sent it this morning. (C) At the front desk.",
  },
  {
    id: "toeic-p2-003",
    part: 2,
    section: "listening",
    kind: "question-response",
    prompt: "質問に対する最も自然な応答を選んでください。",
    choices: ["Ms. Patel from Human Resources.", "It starts at nine thirty.", "On the second floor."],
    answerIndex: 0,
    explanationJa: "Whoは人物を尋ねるので、担当者名を答えるAが正解です。Bは時刻、Cは場所への応答です。",
    evidence: "質問: “Who will lead the new-employee orientation?” 人物を示す “Ms. Patel from Human Resources.” が対応する。",
    ability: ["L_GIST_SHORT", "L_DETAIL_SHORT"],
    topic: "personnel",
    difficulty: "basic",
    script: "Questioner (Canada): Who will lead the new-employee orientation? (A) Ms. Patel from Human Resources. (B) It starts at nine thirty. (C) On the second floor.",
  },
  {
    id: "toeic-p2-004",
    part: 2,
    section: "listening",
    kind: "question-response",
    prompt: "依頼に対する最も自然な応答を選んでください。",
    choices: ["The equipment is quite efficient.", "Near the loading entrance.", "I'll call the supplier now."],
    answerIndex: 2,
    explanationJa: "配送変更の依頼に対し、供給業者へ電話するという行動を示すCが適切です。",
    evidence: "依頼: “Could you reschedule the equipment delivery?” 応答 “I'll call the supplier now.” は変更手続きの次の行動を示す。",
    ability: ["L_GIST_SHORT", "L_PRAGMATIC"],
    topic: "purchasing",
    difficulty: "standard",
    script: "Questioner (Australia-New Zealand): Could you reschedule the equipment delivery? (A) The equipment is quite efficient. (B) Near the loading entrance. (C) I'll call the supplier now.",
  },
  {
    id: "toeic-p3-001",
    part: 3,
    section: "listening",
    kind: "conversation",
    prompt: "Why is Room Four unavailable?",
    choices: ["It is too small.", "Its projector needs repair.", "A client is using it.", "Its furniture is being replaced."],
    answerIndex: 1,
    explanationJa: "Leahが保守担当者によるプロジェクター修理を理由として述べています。",
    evidence: "Leah: “The maintenance team needs to repair its projector.”",
    ability: ["L_DETAIL_EXTENDED"],
    topic: "office",
    difficulty: "standard",
    script: P3_MEETING_SCRIPT,
  },
  {
    id: "toeic-p3-002",
    part: 3,
    section: "listening",
    kind: "conversation",
    prompt: "What do the speakers decide to do?",
    choices: ["Shorten the vendor list.", "Move the presentation to another day.", "Use Room Seven.", "Replace the projector themselves."],
    answerIndex: 2,
    explanationJa: "Room Sevenが2時から3時まで空いており、発表には十分だと合意しています。",
    evidence: "Daniel: “Is Room Seven free?” Leah: “It is ... That should be enough for the presentation.”",
    ability: ["L_GIST_EXTENDED", "L_DETAIL_EXTENDED"],
    topic: "office",
    difficulty: "standard",
    script: P3_MEETING_SCRIPT,
  },
  {
    id: "toeic-p3-003",
    part: 3,
    section: "listening",
    kind: "conversation",
    prompt: "What will Leah most likely do next?",
    choices: ["Revise an invitation and contact reception.", "Order a new projector.", "Meet the vendor in the lobby.", "Extend the room reservation."],
    answerIndex: 0,
    explanationJa: "Danielの2つの依頼に対してLeahが両方すぐ行うと答えています。",
    evidence: "Daniel: “Please update the calendar invitation and ask reception ...” Leah: “I'll do both right away.”",
    ability: ["L_PRAGMATIC", "L_DETAIL_EXTENDED"],
    topic: "office",
    difficulty: "standard",
    script: P3_MEETING_SCRIPT,
  },
  {
    id: "toeic-p3-004",
    part: 3,
    section: "listening",
    kind: "conversation",
    prompt: "Look at the chart. How many black gift bags are currently in stock?",
    choices: ["30", "50", "80", "90"],
    answerIndex: 1,
    explanationJa: "会話と在庫表のどちらにも黒いバッグは50個と示されています。",
    evidence: "Leo: “The warehouse has fifty black bags ...” 表のBlack欄も50。",
    ability: ["L_DETAIL_EXTENDED", "R_DETAIL"],
    topic: "purchasing",
    difficulty: "standard",
    script: P3_BAGS_SCRIPT,
    chart: BAG_STOCK_CHART,
  },
  {
    id: "toeic-p3-005",
    part: 3,
    section: "listening",
    kind: "conversation",
    prompt: "Why will Leo contact the supplier?",
    choices: ["To obtain thirty more black bags", "To return forty blue bags", "To change the event date", "To request a lower warehouse fee"],
    answerIndex: 0,
    explanationJa: "同色80個を揃えるため、在庫50個に加えて黒いバッグ30個が必要です。",
    evidence: "Amina: “Can our supplier deliver thirty more black bags by Friday?” Leo: “I'll call the supplier now.”",
    ability: ["L_GIST_EXTENDED", "L_DETAIL_EXTENDED"],
    topic: "purchasing",
    difficulty: "advanced",
    script: P3_BAGS_SCRIPT,
    chart: BAG_STOCK_CHART,
  },
  {
    id: "toeic-p3-006",
    part: 3,
    section: "listening",
    kind: "conversation",
    prompt: "What does Nora say she will do?",
    choices: ["Count the bags again", "Drive to the warehouse", "Prepare an invoice", "Confirm a color choice with the client"],
    answerIndex: 3,
    explanationJa: "最後にNoraが顧客へ最終的な色を確認すると明言しています。",
    evidence: "Nora: “I'll confirm the final color choice with the client.”",
    ability: ["L_DETAIL_EXTENDED"],
    topic: "purchasing",
    difficulty: "standard",
    script: P3_BAGS_SCRIPT,
    chart: BAG_STOCK_CHART,
  },
  {
    id: "toeic-p4-001",
    part: 4,
    section: "listening",
    kind: "talk",
    prompt: "What is the purpose of the announcement?",
    choices: ["To introduce a new facilities manager", "To explain a temporary water interruption", "To announce an office relocation", "To invite staff to a safety class"],
    answerIndex: 1,
    explanationJa: "配管修理に伴う断水時間と利用できない設備を知らせるアナウンスです。",
    evidence: "“The water service will be shut off from one until three ... while a damaged pipe is repaired.”",
    ability: ["L_GIST_EXTENDED"],
    topic: "property",
    difficulty: "standard",
    script: P4_WATER_SCRIPT,
  },
  {
    id: "toeic-p4-002",
    part: 4,
    section: "listening",
    kind: "talk",
    prompt: "What will be unavailable on the fourth floor?",
    choices: ["The elevators", "The meeting rooms", "The kitchen sink and drinking fountain", "The emergency exits"],
    answerIndex: 2,
    explanationJa: "4階の流し台と給水器が使えないと具体的に述べられています。",
    evidence: "“The kitchen sink and drinking fountain on the fourth floor will be unavailable.”",
    ability: ["L_DETAIL_EXTENDED"],
    topic: "property",
    difficulty: "basic",
    script: P4_WATER_SCRIPT,
  },
  {
    id: "toeic-p4-003",
    part: 4,
    section: "listening",
    kind: "talk",
    prompt: "What are employees asked to do before one o'clock?",
    choices: ["Fill their water bottles", "Move to the third floor", "Read an e-mail from a manager", "Report a damaged pipe"],
    answerIndex: 0,
    explanationJa: "断水前に水筒へ水を入れるよう依頼されています。",
    evidence: "“Please fill any water bottles before one o'clock.”",
    ability: ["L_DETAIL_EXTENDED", "L_PRAGMATIC"],
    topic: "property",
    difficulty: "basic",
    script: P4_WATER_SCRIPT,
  },
  {
    id: "toeic-p4-004",
    part: 4,
    section: "listening",
    kind: "talk",
    prompt: "Why is Omar calling Ms. Chen?",
    choices: ["To confirm a room upgrade", "To report a change to a shuttle pickup point", "To recommend an earlier flight", "To request payment for a reservation"],
    answerIndex: 1,
    explanationJa: "工事により空港送迎の乗車場所が変更されたことを知らせる電話です。",
    evidence: "“Because of road construction ... the pickup point has changed from Door Two to Door Five.”",
    ability: ["L_GIST_EXTENDED", "L_DETAIL_EXTENDED"],
    topic: "travel",
    difficulty: "standard",
    script: P4_SHUTTLE_SCRIPT,
  },
  {
    id: "toeic-p4-005",
    part: 4,
    section: "listening",
    kind: "talk",
    prompt: "Where should Ms. Chen meet the driver?",
    choices: ["At Door Two of the west terminal", "In the hotel lobby", "At the rental-car counter", "At Door Five of the east terminal"],
    answerIndex: 3,
    explanationJa: "新しい乗車場所は東ターミナルのDoor Fiveです。",
    evidence: "“The pickup point has changed ... to Door Five at the east terminal.”",
    ability: ["L_DETAIL_EXTENDED"],
    topic: "travel",
    difficulty: "basic",
    script: P4_SHUTTLE_SCRIPT,
  },
  {
    id: "toeic-p4-006",
    part: 4,
    section: "listening",
    kind: "talk",
    prompt: "What should Ms. Chen do if her flight schedule changes?",
    choices: ["Call the hotel by Sunday evening", "Find a driver with a red sign", "Cancel the shuttle online", "Wait at the original pickup point"],
    answerIndex: 0,
    explanationJa: "フライト変更時は日曜夕方までにホテルへ電話するよう求められています。",
    evidence: "“If your flight schedule changes, please call us by Sunday evening.”",
    ability: ["L_DETAIL_EXTENDED", "L_PRAGMATIC"],
    topic: "travel",
    difficulty: "standard",
    script: P4_SHUTTLE_SCRIPT,
  },
  {
    id: "toeic-p5-001",
    part: 5,
    section: "reading",
    kind: "incomplete-sentence",
    prompt: "The finance team reviewed the proposal _____ before approving it.",
    choices: ["care", "carefully", "careful", "cares"],
    answerIndex: 1,
    explanationJa: "動詞reviewedを修飾する副詞carefullyが必要です。carefulは形容詞です。",
    evidence: "空所はreviewedの方法を説明する位置なので、副詞carefullyが文法的に適合する。",
    ability: ["R_GRAMMAR"],
    topic: "finance",
    difficulty: "basic",
  },
  {
    id: "toeic-p5-002",
    part: 5,
    section: "reading",
    kind: "incomplete-sentence",
    prompt: "A list of approved suppliers _____ posted beside the purchasing office.",
    choices: ["is", "are", "have", "were"],
    answerIndex: 0,
    explanationJa: "主語の中心は単数のA listです。of approved suppliersは修飾語なのでisを選びます。",
    evidence: "主語と動詞の一致はlist— is。直前の複数名詞suppliersに引かれない。",
    ability: ["R_GRAMMAR"],
    topic: "purchasing",
    difficulty: "standard",
  },
  {
    id: "toeic-p5-003",
    part: 5,
    section: "reading",
    kind: "incomplete-sentence",
    prompt: "By the time the auditors arrive next Monday, the accounting staff _____ the monthly report.",
    choices: ["completes", "completed", "has completed", "will have completed"],
    answerIndex: 3,
    explanationJa: "未来の時点までの完了を表すため、未来完了will have completedが適切です。",
    evidence: "By the time + 現在形arriveと、未来の基準時までの完了を示すwill have completedが対応する。",
    ability: ["R_GRAMMAR"],
    topic: "finance",
    difficulty: "advanced",
  },
  {
    id: "toeic-p5-004",
    part: 5,
    section: "reading",
    kind: "incomplete-sentence",
    prompt: "All replacement parts _____ from the regional warehouse tomorrow.",
    choices: ["ship", "shipped", "will be shipped", "shipping"],
    answerIndex: 2,
    explanationJa: "部品は「発送される」側なので、未来の受動態will be shippedが必要です。",
    evidence: "tomorrowが未来を示し、主語partsとshipの関係は受動なのでwill be shipped。",
    ability: ["R_GRAMMAR"],
    topic: "manufacturing",
    difficulty: "standard",
  },
  {
    id: "toeic-p5-005",
    part: 5,
    section: "reading",
    kind: "incomplete-sentence",
    prompt: "Ms. Ito is the consultant _____ designed the new inventory system.",
    choices: ["whose", "who", "where", "what"],
    answerIndex: 1,
    explanationJa: "先行詞consultantは人で、空所はdesignedの主語になるためwhoです。",
    evidence: "who designed ... がconsultantを説明する主格の関係代名詞節を作る。",
    ability: ["R_GRAMMAR"],
    topic: "technology",
    difficulty: "standard",
  },
  {
    id: "toeic-p5-006",
    part: 5,
    section: "reading",
    kind: "incomplete-sentence",
    prompt: "The outdoor reception will proceed _____ light rain is forecast.",
    choices: ["during", "unless", "although", "because of"],
    answerIndex: 2,
    explanationJa: "「小雨予報だが実施する」という逆接なのでalthoughです。後ろが主語＋動詞の節である点も根拠です。",
    evidence: "although + “light rain is forecast”で完全な節を導き、前後の逆接関係を表す。",
    ability: ["R_GRAMMAR", "R_CONNECT"],
    topic: "entertainment",
    difficulty: "standard",
  },
  {
    id: "toeic-p6-001",
    part: 6,
    section: "reading",
    kind: "text-completion",
    prompt: "Select the best answer for blank [1].",
    choices: ["postpones", "has been postponed", "postponing", "will postpone"],
    answerIndex: 1,
    explanationJa: "sessionは延期される側で、現在までに決まった変更を述べるためhas been postponedが適切です。",
    evidence: "“The session was originally scheduled ... but it [1] because ...” は予定済みの回が延期されたことを示す。",
    ability: ["R_GRAMMAR", "R_CONNECT"],
    topic: "personnel",
    difficulty: "standard",
    passage: P6_WORKSHOP_PASSAGE,
  },
  {
    id: "toeic-p6-002",
    part: 6,
    section: "reading",
    kind: "text-completion",
    prompt: "Select the best answer for blank [2].",
    choices: ["transferred", "had transferred", "will be transferred", "are transferring"],
    answerIndex: 2,
    explanationJa: "registrationsは新日程へ移される側で、今後行われるためwill be transferredです。",
    evidence: "“All existing registrations [2] automatically to the new date.” 主語registrationsとtransferは受動関係。",
    ability: ["R_GRAMMAR"],
    topic: "personnel",
    difficulty: "standard",
    passage: P6_WORKSHOP_PASSAGE,
  },
  {
    id: "toeic-p6-003",
    part: 6,
    section: "reading",
    kind: "text-completion",
    prompt: "Select the best answer for blank [3].",
    choices: ["your", "you", "yours", "yourself"],
    answerIndex: 0,
    explanationJa: "名詞understandingを前から限定する所有格yourが必要です。",
    evidence: "定型表現 “We appreciate your understanding.” は「ご理解に感謝します」。",
    ability: ["R_GRAMMAR", "R_VOCAB"],
    topic: "personnel",
    difficulty: "basic",
    passage: P6_WORKSHOP_PASSAGE,
  },
  {
    id: "toeic-p6-004",
    part: 6,
    section: "reading",
    kind: "text-completion",
    prompt: "Select the best sentence for blank [4].",
    choices: [
      "The inspection team has not selected a building.",
      "The workshop fee increased earlier this year.",
      "Room 305 is used only by the accounting department.",
      "A revised agenda will be e-mailed to participants next week.",
    ],
    answerIndex: 3,
    explanationJa: "日程変更の案内を締めくくる追加情報として、参加者へ改訂版の予定を送るDが自然です。",
    evidence: "本文は登録者への変更通知であり、“A revised agenda ...” は新日程・会場情報を受ける実務的な次の案内になる。",
    ability: ["R_CONNECT", "R_INFERENCE"],
    topic: "personnel",
    difficulty: "advanced",
    passage: P6_WORKSHOP_PASSAGE,
  },
  {
    id: "toeic-p7-001",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "What is the purpose of the e-mail?",
    choices: ["To recruit shuttle drivers", "To explain temporary parking changes", "To announce a new station", "To collect parking fees"],
    answerIndex: 1,
    explanationJa: "西駐車場の一時閉鎖と、その間の従業員・来訪者の駐車方法を説明するメールです。",
    evidence: "件名“Temporary Parking Arrangements”と、閉鎖期間・代替駐車場・送迎の説明が根拠。",
    ability: ["R_INFERENCE", "R_DETAIL"],
    topic: "property",
    difficulty: "standard",
    passage: P7_PARKING_PASSAGE,
  },
  {
    id: "toeic-p7-002",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "Where should employees park while the west lot is closed?",
    choices: ["Beside the main entrance", "At the west terminal", "Behind Central Station", "Under the office building"],
    answerIndex: 2,
    explanationJa: "従業員はCentral Stationの裏にある公共駐車場を利用するよう指示されています。",
    evidence: "“Employees should park in the public lot behind Central Station.”",
    ability: ["R_DETAIL"],
    topic: "property",
    difficulty: "basic",
    passage: P7_PARKING_PASSAGE,
  },
  {
    id: "toeic-p7-003",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "What will most likely happen if heavy rain is forecast?",
    choices: ["The work will begin on September 21.", "The east lot will close permanently.", "Employees will pay the full parking fee.", "The Friday update will be canceled."],
    answerIndex: 0,
    explanationJa: "大雨予報の場合、舗装工事の開始日が9月21日に延期されるとあります。",
    evidence: "“If heavy rain is forecast, the resurfacing work will begin on September 21 instead.”",
    ability: ["R_INFERENCE", "R_DETAIL"],
    topic: "property",
    difficulty: "standard",
    passage: P7_PARKING_PASSAGE,
  },
  {
    id: "toeic-p7-004",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "According to the e-mail, what should visitors do?",
    choices: ["Take the company shuttle", "Show an employee card", "Arrive after 10:00 A.M.", "Continue to use the east lot"],
    answerIndex: 3,
    explanationJa: "来訪者はこれまでどおり正面玄関横の東駐車場を利用します。",
    evidence: "“Visitors should continue to use the east lot beside the main entrance.”",
    ability: ["R_DETAIL"],
    topic: "property",
    difficulty: "basic",
    passage: P7_PARKING_PASSAGE,
  },
  {
    id: "toeic-p7-005",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "The word “resurfacing” is closest in meaning to",
    choices: ["measuring traffic", "renewing a surface", "building a station", "marking an entrance"],
    answerIndex: 1,
    explanationJa: "resurfaceは道路や床などの表面を新しくすることです。本文冒頭のsurface is renewedも言い換えの手掛かりです。",
    evidence: "“while its surface is renewed” と “the resurfacing work” が同じ作業を指す。",
    ability: ["R_VOCAB", "R_CONNECT"],
    topic: "property",
    difficulty: "standard",
    passage: P7_PARKING_PASSAGE,
  },
  {
    id: "toeic-p7-006",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "Why did Ms. Santos contact Oakline Supply?",
    choices: ["To report missing and damaged items", "To request a new café menu", "To cancel a customer event", "To change the billing address"],
    answerIndex: 0,
    explanationJa: "紙コップと茶葉が不足し、皿が破損していたため、納品上の複数の問題を報告しています。",
    evidence: "Document 1: “only 600 ... tea bags were missing, and twelve ... saucers were cracked.”",
    ability: ["R_INFERENCE", "R_CONNECT", "R_DETAIL"],
    topic: "purchasing",
    difficulty: "standard",
    passage: P7_ORDER_PASSAGE,
    chart: ORDER_CHART,
  },
  {
    id: "toeic-p7-007",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "How many additional paper cups will Oakline Supply send?",
    choices: ["12", "24", "400", "600"],
    answerIndex: 2,
    explanationJa: "注文1,000個に対し600個受領済みなので、不足は400個です。返信にもremaining 400 cupsと明記されています。",
    evidence: "Order Record: ordered 1,000 / received 600. Supplier Reply: “The remaining 400 cups ...”",
    ability: ["R_CONNECT", "R_DETAIL"],
    topic: "purchasing",
    difficulty: "standard",
    passage: P7_ORDER_PASSAGE,
    chart: ORDER_CHART,
  },
  {
    id: "toeic-p7-008",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "When are the additional items expected to arrive?",
    choices: ["Wednesday morning", "By noon on Thursday", "Friday evening", "The following Monday"],
    answerIndex: 1,
    explanationJa: "供給業者の返信に、木曜日の正午までに到着予定とあります。",
    evidence: "Supplier Reply: “They are scheduled to reach your café by noon on Thursday.”",
    ability: ["R_DETAIL"],
    topic: "purchasing",
    difficulty: "basic",
    passage: P7_ORDER_PASSAGE,
    chart: ORDER_CHART,
  },
  {
    id: "toeic-p7-009",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "What is Ms. Santos asked to return?",
    choices: ["The unused paper cups", "The tea boxes", "The original order form", "The damaged saucers"],
    answerIndex: 3,
    explanationJa: "破損した皿を添付の前払い返送ラベルで返すよう依頼されています。",
    evidence: "Supplier Reply: “Please return the damaged saucers using the prepaid label ...”",
    ability: ["R_CONNECT", "R_DETAIL"],
    topic: "purchasing",
    difficulty: "basic",
    passage: P7_ORDER_PASSAGE,
    chart: ORDER_CHART,
  },
  {
    id: "toeic-p7-010",
    part: 7,
    section: "reading",
    kind: "reading-comprehension",
    prompt: "What is indicated about the express shipment?",
    choices: ["Oakline Supply will not charge extra for it.", "It contains a revised invoice.", "It will arrive after the customer event.", "Greenway Café must collect it at a warehouse."],
    answerIndex: 0,
    explanationJa: "速達便に追加送料はかからないと供給業者が明記しています。",
    evidence: "Supplier Reply: “There will be no additional shipping charge.”",
    ability: ["R_INFERENCE", "R_DETAIL"],
    topic: "purchasing",
    difficulty: "standard",
    passage: P7_ORDER_PASSAGE,
    chart: ORDER_CHART,
  },
];

type ToeicVocabularySeed = [
  term: string,
  partOfSpeech: ToeicVocabulary["partOfSpeech"],
  meaningJa: string,
  collocation: string,
  example: string,
  exampleJa: string,
  topic: ToeicTopic,
  difficulty: ToeicDifficulty,
];

const TOEIC_VOCABULARY_SEEDS: ToeicVocabularySeed[] = [
  ["agenda", "noun", "議題、予定表", "meeting agenda", "Lena added the budget review to tomorrow's agenda.", "レナは明日の議題に予算確認を加えた。", "office", "basic"],
  ["applicant", "noun", "応募者", "job applicant", "Each applicant will receive an interview schedule by e-mail.", "各応募者には面接予定がメールで届く。", "personnel", "basic"],
  ["approve", "verb", "承認する", "approve a proposal", "The director approved the revised training proposal.", "部長は修正版の研修案を承認した。", "general-business", "basic"],
  ["arrange", "verb", "手配する", "arrange transportation", "We arranged transportation from the airport to the hotel.", "空港からホテルまでの交通を手配した。", "travel", "basic"],
  ["available", "adjective", "利用できる、空いている", "available seats", "Only six seats are available for the afternoon seminar.", "午後のセミナーは6席だけ空いている。", "office", "basic"],
  ["budget", "noun", "予算", "annual budget", "The team stayed within its annual advertising budget.", "チームは年間広告予算内に収めた。", "finance", "basic"],
  ["candidate", "noun", "候補者", "qualified candidate", "Three qualified candidates advanced to the final interview.", "3人の有資格候補者が最終面接へ進んだ。", "personnel", "standard"],
  ["client", "noun", "顧客、依頼主", "meet with a client", "The designer will meet with the client on Tuesday.", "デザイナーは火曜日に依頼主と会う。", "general-business", "basic"],
  ["confirm", "verb", "確認する", "confirm a reservation", "Please confirm your reservation before Friday.", "金曜日までに予約を確認してください。", "travel", "basic"],
  ["contract", "noun", "契約", "sign a contract", "Both companies signed a two-year service contract.", "両社は2年間のサービス契約に署名した。", "general-business", "standard"],
  ["convenient", "adjective", "都合がよい、便利な", "convenient location", "The new branch is in a convenient location near the station.", "新支店は駅近くの便利な場所にある。", "property", "basic"],
  ["deadline", "noun", "締め切り", "meet a deadline", "The editor hired an assistant to meet the publication deadline.", "編集者は発行期限に間に合わせるため助手を雇った。", "office", "basic"],
  ["delay", "noun", "遅延", "shipping delay", "A storm caused a two-day shipping delay.", "嵐により配送が2日遅れた。", "purchasing", "basic"],
  ["deliver", "verb", "配達する、届ける", "deliver a package", "The courier delivered the package before noon.", "配達員は正午前に荷物を届けた。", "purchasing", "basic"],
  ["department", "noun", "部署", "sales department", "The sales department moved to the fourth floor.", "営業部は4階へ移った。", "office", "basic"],
  ["discount", "noun", "割引", "receive a discount", "Members receive a discount on conference registration.", "会員は会議登録料の割引を受ける。", "general-business", "basic"],
  ["distribute", "verb", "配布する", "distribute materials", "Staff will distribute the workshop materials at the entrance.", "職員が入口で研修資料を配布する。", "personnel", "standard"],
  ["equipment", "noun", "設備、機器", "safety equipment", "All safety equipment is inspected every month.", "すべての安全設備は毎月点検される。", "manufacturing", "basic"],
  ["estimate", "noun", "見積もり", "cost estimate", "The contractor provided a detailed cost estimate.", "請負業者は詳細な費用見積もりを提出した。", "property", "standard"],
  ["facility", "noun", "施設", "production facility", "The company opened a production facility outside the city.", "会社は市外に生産施設を開設した。", "manufacturing", "standard"],
  ["feedback", "noun", "意見、反応", "customer feedback", "Customer feedback led us to simplify the order form.", "顧客の意見を受けて注文書を簡略化した。", "general-business", "standard"],
  ["guarantee", "verb", "保証する", "guarantee delivery", "The carrier cannot guarantee delivery during the storm.", "運送会社は嵐の間の配達を保証できない。", "purchasing", "standard"],
  ["headquarters", "noun", "本社", "corporate headquarters", "The quarterly meeting will be held at corporate headquarters.", "四半期会議は本社で開かれる。", "office", "standard"],
  ["invoice", "noun", "請求書", "issue an invoice", "The supplier issued an invoice for the replacement parts.", "供給業者は交換部品の請求書を発行した。", "finance", "basic"],
  ["itinerary", "noun", "旅程表", "travel itinerary", "Your updated travel itinerary is attached to this message.", "更新済みの旅程表をこのメッセージに添付した。", "travel", "standard"],
  ["maintenance", "noun", "保守、整備", "routine maintenance", "The elevator is closed for routine maintenance.", "エレベーターは定期保守のため停止している。", "property", "basic"],
  ["manufacture", "verb", "製造する", "manufacture components", "The plant manufactures components for medical devices.", "その工場は医療機器の部品を製造する。", "manufacturing", "standard"],
  ["negotiate", "verb", "交渉する", "negotiate a price", "Our purchasing manager negotiated a lower price.", "購買部長はより低い価格を交渉した。", "general-business", "standard"],
  ["notify", "verb", "通知する", "notify customers", "Please notify customers of the schedule change.", "日程変更を顧客へ通知してください。", "general-business", "standard"],
  ["postpone", "verb", "延期する", "postpone a meeting", "The organizers postponed the meeting until next week.", "主催者は会議を来週まで延期した。", "office", "basic"],
  ["procedure", "noun", "手順、手続き", "safety procedure", "New employees must review the emergency procedure.", "新入社員は緊急時の手順を確認しなければならない。", "personnel", "standard"],
  ["purchase", "verb", "購入する", "purchase supplies", "The clinic purchased new waiting-room chairs.", "診療所は待合室用の新しい椅子を購入した。", "health", "basic"],
  ["receipt", "noun", "領収書", "keep a receipt", "Keep the receipt if you plan to claim the expense.", "経費を申請するなら領収書を保管してください。", "finance", "basic"],
  ["recruit", "verb", "採用する、募集する", "recruit technicians", "The factory plans to recruit twelve technicians.", "工場は技術者12人を採用する予定だ。", "personnel", "standard"],
  ["refund", "noun", "返金", "request a refund", "Guests may request a refund up to two days before the tour.", "参加者はツアー2日前まで返金を申請できる。", "travel", "basic"],
  ["register", "verb", "登録する", "register for a seminar", "Employees can register for the seminar online.", "従業員はオンラインでセミナーに登録できる。", "personnel", "basic"],
  ["renew", "verb", "更新する", "renew a membership", "Members must renew their subscriptions by March 1.", "会員は3月1日までに購読を更新しなければならない。", "entertainment", "standard"],
  ["repair", "verb", "修理する", "repair a machine", "A technician repaired the packaging machine yesterday.", "技術者が昨日包装機を修理した。", "manufacturing", "basic"],
  ["reservation", "noun", "予約", "make a reservation", "I made a dinner reservation for six people.", "6人分の夕食予約をした。", "dining", "basic"],
  ["schedule", "noun", "予定、時刻表", "production schedule", "The updated production schedule begins on Monday.", "更新後の生産予定は月曜日から始まる。", "manufacturing", "basic"],
  ["shipment", "noun", "出荷品、発送", "track a shipment", "Use this number to track your shipment.", "この番号で発送品を追跡してください。", "purchasing", "basic"],
  ["stock", "noun", "在庫", "in stock", "The blue model is currently in stock.", "青色のモデルは現在在庫がある。", "purchasing", "basic"],
  ["submit", "verb", "提出する", "submit a report", "Submit your travel report within five business days.", "出張報告書を5営業日以内に提出してください。", "office", "basic"],
  ["supplier", "noun", "供給業者", "local supplier", "A local supplier can deliver the materials tomorrow.", "地元の供給業者が明日資材を届けられる。", "purchasing", "basic"],
  ["survey", "noun", "調査、アンケート", "customer survey", "More than 300 shoppers completed the customer survey.", "300人を超える買い物客が顧客調査に回答した。", "general-business", "standard"],
  ["temporary", "adjective", "一時的な", "temporary closure", "The notice explains the temporary closure of the lobby.", "掲示はロビーの一時閉鎖を説明している。", "property", "basic"],
  ["transfer", "verb", "移す、転送する", "transfer a call", "The receptionist transferred the call to accounting.", "受付係は電話を経理へ転送した。", "office", "standard"],
  ["venue", "noun", "会場", "event venue", "The event venue is a short walk from the station.", "イベント会場は駅から歩いてすぐだ。", "entertainment", "standard"],
  ["warranty", "noun", "保証書、保証期間", "under warranty", "The printer will be repaired at no cost because it is under warranty.", "プリンターは保証期間内なので無料修理される。", "technology", "standard"],
  ["warehouse", "noun", "倉庫", "regional warehouse", "Extra chairs are stored in the regional warehouse.", "予備の椅子は地域倉庫に保管されている。", "purchasing", "basic"],
  ["attach", "verb", "添付する", "attach a document", "I attached the revised floor plan to the e-mail.", "メールに修正版の平面図を添付した。", "office", "basic"],
  ["authorize", "verb", "正式に許可する", "authorize a payment", "Only department managers may authorize this payment.", "この支払いを承認できるのは部門長だけだ。", "finance", "advanced"],
  ["brochure", "noun", "案内冊子", "travel brochure", "The brochure lists three guided city tours.", "案内冊子には3つの市内ガイドツアーが載っている。", "travel", "basic"],
  ["complimentary", "adjective", "無料の", "complimentary breakfast", "Hotel guests receive a complimentary breakfast.", "宿泊客には無料の朝食が提供される。", "travel", "standard"],
  ["conference", "noun", "会議、大会", "annual conference", "The annual conference attracted researchers from nine countries.", "年次大会には9か国から研究者が集まった。", "corporate-development", "basic"],
  ["efficient", "adjective", "効率的な", "energy-efficient equipment", "The restaurant installed more efficient refrigerators.", "レストランはより効率的な冷蔵庫を導入した。", "dining", "standard"],
  ["expense", "noun", "経費、費用", "travel expense", "Meal costs are included in the travel expense policy.", "食事代は出張経費規定に含まれる。", "finance", "basic"],
  ["inspect", "verb", "点検する", "inspect a facility", "Engineers will inspect the facility before it reopens.", "技術者は施設の再開前に点検する。", "property", "standard"],
  ["inventory", "noun", "在庫、在庫一覧", "check inventory", "The clerk checks inventory every Friday.", "店員は毎週金曜日に在庫を確認する。", "purchasing", "standard"],
  ["orientation", "noun", "研修、説明会", "employee orientation", "The employee orientation includes a tour of the laboratory.", "社員研修には研究所見学が含まれる。", "personnel", "standard"],
];

export const TOEIC_VOCAB: ToeicVocabulary[] = TOEIC_VOCABULARY_SEEDS.map(
  ([term, partOfSpeech, meaningJa, collocation, example, exampleJa, topic, difficulty], index) => ({
    id: `toeic-vocab-${String(index + 1).padStart(3, "0")}`,
    term,
    partOfSpeech,
    meaningJa,
    collocation,
    example,
    exampleJa,
    topic,
    difficulty,
  }),
);
