export type EnglishUnit = {
  id: string;
  title: string;
  shortTitle: string;
};

export type EnglishVocabCard = {
  id: string;
  unit: string;
  en: string;
  ja: string;
  note?: string;
};

export type EnglishQuestionReference = {
  label: string;
  quote: string;
  translation?: string;
};

export type EnglishQuestion = {
  id: string;
  unit: string;
  group: string;
  format: "input" | "choice" | "order" | "translation";
  grading?: "japanese-semantic";
  prompt: string;
  answer: string;
  accepted?: string[];
  options?: string[];
  tokens?: string[];
  explanation?: string;
  passageId?: string;
  reference?: EnglishQuestionReference;
};

export type EnglishPassage = {
  id: string;
  unit: string;
  title: string;
  titleJa: string;
  paragraphs: Array<{ en: string; ja: string }>;
};

export const ENGLISH_EXCLUDED_SOURCE_MARKERS = Object.freeze([
  "What's new?",
  "What’s new?",
] as const);

export function isEnglishPoolItemInScope(item: unknown) {
  if (!item || typeof item !== "object") return false;
  const unit = "unit" in item && typeof item.unit === "string" ? item.unit : "";
  if (unit === "exam-sample" || unit === "ch19") return false;
  const sourceText = JSON.stringify(item);
  return !ENGLISH_EXCLUDED_SOURCE_MARKERS.some((marker) => sourceText.includes(marker));
}

export const ENGLISH_UNITS: EnglishUnit[] = [
  { id: "ch14", title: "Chapter 14｜再生可能エネルギー導入拡大の鍵", shortTitle: "Ch.14 大型蓄電池と再生可能エネルギー" },
  { id: "ch15", title: "Chapter 15｜新しい生命体を作り出す企業", shortTitle: "Ch.15 新しい生命体を作り出す企業" },
  { id: "ch16", title: "Chapter 16｜スパコンで天気予報①", shortTitle: "Ch.16 スパコンで天気予報①" },
  { id: "ch18", title: "Chapter 18｜高齢化社会に強力な助っ人", shortTitle: "Ch.18 高齢化社会に強力な助っ人" },
  { id: "toeic", title: "TOEIC Reading｜広告・手紙・市イベント", shortTitle: "TOEIC Reading 追加2セット" },
  { id: "housing", title: "Key Vocabulary｜Housing", shortTitle: "Housing 語彙15語" },
  { id: "medical", title: "Key Vocabulary｜Medical", shortTitle: "Medical 語彙15語" },
];

type RawVocab = [unit: string, en: string, ja: string, note?: string];

const RAW_VOCAB: RawVocab[] = [
  ["exam-sample", "lean against", "～にもたれかかる"],
  ["exam-sample", "load", "積み込む"],
  ["exam-sample", "across from", "～の向かい側に"],
  ["exam-sample", "gather", "集まる／集める"],
  ["exam-sample", "in a line", "一列に"],
  ["exam-sample", "reach for", "～を取ろうと手を伸ばす"],
  ["exam-sample", "occupied", "使用中の／ふさがっている"],
  ["exam-sample", "clerk", "店員、事務員"],
  ["exam-sample", "passenger", "乗客"],
  ["exam-sample", "pedestrian", "歩行者"],
  ["exam-sample", "annual", "年1回の、毎年の"],
  ["exam-sample", "audience", "聴衆、観客"],
  ["exam-sample", "bankrupt", "破産した"],
  ["exam-sample", "capability", "能力"],
  ["exam-sample", "strategy", "戦略"],
  ["exam-sample", "temporary", "一時的な"],
  ["exam-sample", "guarantee", "保証する／保証"],

  ["ch15", "life-form / organism", "生命体、生物"],
  ["ch15", "laboratory", "実験室"],
  ["ch15", "cell", "細胞"],
  ["ch15", "DNA sequence", "DNA配列"],
  ["ch15", "petrochemicals", "石油化学製品"],
  ["ch15", "type out", "キーボードで打ち込む"],
  ["ch15", "robotic arm", "ロボットアーム"],
  ["ch15", "mix together", "混ぜ合わせる"],
  ["ch15", "compound", "化合物"],
  ["ch15", "desired", "目的の、望まれた"],
  ["ch15", "biotech company", "バイオテクノロジー企業"],
  ["ch15", "genetically modified", "遺伝子組み換えの"],
  ["ch15", "yeast", "酵母"],
  ["ch15", "at a dizzying rate", "めまぐるしい速度で"],
  ["ch15", "convert A into B", "AをBに変換する"],
  ["ch15", "medicine", "医薬品"],
  ["ch15", "moisturizer", "保湿剤"],
  ["ch15", "cosmetics", "化粧品"],
  ["ch15", "biofuel", "バイオ燃料"],
  ["ch15", "renewable energy source", "再生可能エネルギー源"],
  ["ch15", "chief science officer", "最高科学責任者"],
  ["ch15", "industrial revolution", "産業革命"],
  ["ch15", "living system", "生物システム、生物"],
  ["ch15", "biofactory", "バイオ工場"],
  ["ch15", "substance", "物質"],
  ["ch15", "tricky", "扱いづらい、難しい"],
  ["ch15", "biological means of production", "生物学的生産手段"],
  ["ch15", "revolutionize", "大変革をもたらす"],
  ["ch15", "transform", "変える、変革する"],
  ["ch15", "environmental safety", "環境上の安全性"],
  ["ch15", "bio-security", "生物学的安全保障"],
  ["ch15", "revive", "再燃させる"],
  ["ch15", "ethical debate", "倫理的論争"],
  ["ch15", "play God", "神を演じる"],
  ["ch15", "in the pipeline", "開発中で、進行中で"],
  ["ch15", "be founded", "創業される"],
  ["ch15", "a decade", "10年間"],
  ["ch15", "legend", "伝説的な存在"],
  ["ch15", "at the intersection of A and B", "AとBが交わる領域で"],
  ["ch15", "genetic engineering", "遺伝子工学"],
  ["ch15", "swap", "入れ替える"],
  ["ch15", "gene", "遺伝子"],
  ["ch15", "genome", "ゲノム"],
  ["ch15", "from scratch", "ゼロから"],

  ["ch16", "accurate", "正確な"],
  ["ch16", "essential factor", "不可欠な要素"],
  ["ch16", "weather forecast", "天気予報"],
  ["ch16", "atmospheric conditions", "大気の状況"],
  ["ch16", "meteorological", "気象の、気象学上の"],
  ["ch16", "detailed", "詳細な"],
  ["ch16", "cloud map", "雲地図"],
  ["ch16", "Earth's surface", "地球表面"],
  ["ch16", "processing supercomputer", "処理用スーパーコンピュータ"],
  ["ch16", "accurate forecast", "正確な予報"],
  ["ch16", "typhoon", "台風"],
  ["ch16", "heavy rain", "大雨"],
  ["ch16", "divide A into B", "AをBに分ける"],
  ["ch16", "square block", "正方形の区画"],
  ["ch16", "cloud formation", "雲の形成"],
  ["ch16", "movement", "動き"],
  ["ch16", "predict", "予測する"],
  ["ch16", "based on", "～に基づいて"],
  ["ch16", "meteorological institution", "気象機関"],
  ["ch16", "measure", "～の大きさである"],
  ["ch16", "previous attempt", "従来の試み"],
  ["ch16", "narrow A down to B", "AをBまで狭める"],
  ["ch16", "split A into B", "AをBに分割する"],
  ["ch16", "hexagonal", "六角形の"],
  ["ch16", "space ... apart", "～の間隔を空ける"],
  ["ch16", "reproduce", "再現する"],
  ["ch16", "devastate", "甚大な被害を与える"],
  ["ch16", "entire globe", "地球全体"],
  ["ch16", "work on", "～に取り組む"],
  ["ch16", "improve", "改善する"],
  ["ch16", "natural disaster", "自然災害"],

  ["ch18", "utilize", "活用する"],
  ["ch18", "advanced technology", "先端技術", "advanced は advance（前進させる）+ -ed。技術が前へ進んだ状態から『先進の・先端の』を表す。"],
  ["ch18", "nervous system", "神経系", "nervous は nerve（神経）と同系。本文では nervous system activity（神経系の活動）として使われる。"],
  ["ch18", "telecommunication technology", "情報通信技術"],
  ["ch18", "home electronic appliance", "家庭電化製品"],
  ["ch18", "intention", "意図"],
  ["ch18", "brain wave", "脳波"],
  ["ch18", "in line with", "～に沿って、～と一致して"],
  ["ch18", "graying", "高齢化"],
  ["ch18", "put to practical use", "実用化する"],
  ["ch18", "nursing care facility", "介護施設、老人ホーム"],
  ["ch18", "labor shortage", "労働力不足"],
  ["ch18", "research institute", "研究所"],
  ["ch18", "machinery manufacturer", "機械メーカー"],
  ["ch18", "sensor", "センサー、検知器"],
  ["ch18", "detect", "検知する"],
  ["ch18", "analyze", "分析する"],
  ["ch18", "predict", "予測する、予想する", "pre-（前もって）+ dict（言う）から『前もって言う＝予測・予想する』。"],
  ["ch18", "recognize", "認識する"],
  ["ch18", "direction", "方向"],
  ["ch18", "multiple", "多数の"],
  ["ch18", "obstacle", "障害物"],
  ["ch18", "uneven", "凹凸のある、平らでない、段差のある、不均一な", "un-（〜でない）+ even（平らな・均等な）。本文の uneven surfaces は『凹凸・段差のある路面』。"],
  ["ch18", "current location", "現在地"],
  ["ch18", "destination", "目的地"],
  ["ch18", "route", "経路"],
  ["ch18", "latest", "最新の"],
  ["ch18", "avoid danger", "危険を避ける"],
  ["ch18", "cooperation", "協力"],
  ["ch18", "aim to", "～することを目指す"],
  ["ch18", "perform", "行う"],
  ["ch18", "share", "共有する、分担する"],
  ["ch18", "via", "～を経由して"],

  ["ch19", "determine", "特定する、決定する"],
  ["ch19", "utilize", "利用する、活用する"],
  ["ch19", "prevent", "防ぐ、阻止する"],
  ["ch19", "DNA barcoding", "DNAバーコーディング"],
  ["ch19", "living object", "生物"],
  ["ch19", "be based on", "～に基づく"],
  ["ch19", "automatically", "自動的に"],
  ["ch19", "database", "データベース"],
  ["ch19", "experience", "経験"],
  ["ch19", "detect", "見破る、検知する"],
  ["ch19", "environmental", "環境の"],
  ["ch19", "species", "種（単数・複数が同形）"],
  ["ch19", "fungus", "菌類、キノコ類", "複数形 fungi"],
  ["ch19", "organism", "生物"],
  ["ch19", "virus", "ウイルス", "複数形 viruses"],
  ["ch19", "family", "科", "複数形 families"],
  ["ch19", "genus", "属", "複数形 genera"],
  ["ch19", "halt", "阻止する、中止する"],
  ["ch19", "food fraud", "食品偽装"],
  ["ch19", "fraudulent mislabeling", "悪質な不当表示"],
  ["ch19", "farm products", "農産物"],
  ["ch19", "DNA sequence information", "DNA配列情報"],
  ["ch19", "yellowfin tuna", "キハダマグロ"],
  ["ch19", "Pacific bluefin tuna", "太平洋クロマグロ"],
  ["ch19", "drastically", "大幅に"],
  ["ch19", "distinguish", "見分ける、区別する"],
  ["ch19", "existing", "既存の"],
  ["ch19", "to date", "現在までのところ"],
  ["ch19", "tissue", "組織"],
  ["ch19", "mislabeling", "不当表示、誤表示"],
  ["ch19", "play a central role", "中心的役割を果たす"],
  ["ch19", "belong to", "～に属する"],
  ["ch19", "be related to", "～と関連している"],
  ["ch19", "fraud", "詐欺、詐欺行為"],
  ["ch19", "fraudulent", "詐欺の、不正な"],
  ["ch19", "announce", "発表する"],
  ["ch19", "set off an alarm", "警報を作動させる"],
  ["ch19", "including", "～を含む"],
  ["ch19", "compare A with B", "AとBを比較する"],
  ["ch19", "graduate school", "大学院"],
];

const ADDITIONAL_RAW_VOCAB: RawVocab[] = [
  ["ch14", "storage battery", "蓄電池", "storage は store（蓄える）+ -age、battery は電池。電力を蓄える装置を表す複合語。"],
  ["ch14", "power generation", "発電", "generate はラテン語系の「生み出す」に由来し、generation は生み出すこと。"],
  ["ch14", "power supply", "電力供給", "supply は「必要なものを満たす・供給する」。power と組み合わせて電力供給。"],
  ["ch14", "life span", "寿命", "span は両端の間に広がる長さ。生命が続く時間の幅から「寿命」。"],
  ["ch14", "suspension bridge", "つり橋", "suspend（つるす）+ -sion。ケーブルで橋面をつる構造を表す。"],
  ["ch14", "renewable", "再生可能な", "renew（再び新しくする）+ -able（～できる）。"],
  ["ch14", "disposable", "使い捨ての", "dispose（処分する）+ -able（～できる）。処分できることから「使い捨ての」。"],
  ["ch14", "erasable", "消すことのできる", "erase（消す）+ -able（～できる）。"],
  ["ch14", "adjustable", "調節可能な", "adjust（調節する）+ -able（～できる）。"],
  ["ch14", "rechargeable", "再充電可能な", "re-（再び）+ charge（充電する）+ -able（～できる）。"],
  ["ch14", "build", "建設する、築く", "古英語 byldan「住居を建てる」と同系。物理的な建設から仕組みを築く意味へ広がる。"],
  ["ch14", "in a bid to", "～しようとして、～するために", "bid は「試み・入札」。in a bid to do で、ある目的を達成しようとする試みを表す。"],
  ["ch14", "rectify", "是正する、修正する", "ラテン語 rectus「まっすぐな」と同系で、誤りを正しい状態へ直す。"],
  ["ch14", "address", "対処する", "問題へ注意・働きかけを向けることから「対処する」。"],
  ["ch14", "defect", "欠点、欠陥", "de-（離れて）+ facere（作る）と同系で、本来あるべき状態を欠くこと。"],
  ["ch14", "fluctuation", "変動", "fluctuate（上下する）+ -tion。波のように上がり下がりする変化。"],
  ["ch14", "affect", "影響を及ぼす", "ラテン語 ad-「～へ」+ facere「作用する」と同系。動詞 affect と名詞 effect を区別する。"],
  ["ch14", "account for", "～を占める、～を説明する", "account は計算・説明。割合を計算に入れる意味から「～を占める」。"],
  ["ch14", "boost", "押し上げる、促進する", "下から押し上げて量や勢いを増すイメージ。"],
  ["ch14", "be aimed at", "～を目的とする", "aim（狙い）+ at（標的）を受動形で用いる定型表現。"],
  ["ch14", "favorable", "好都合な、好ましい", "favor（好意・支持）+ -able。都合よく働く状態。"],
  ["ch14", "dispense", "出す、分配する、販売する", "dis-（分けて）+ pendere（量る）と同系。必要量ずつ分けて出す。"],
  ["ch14", "cover", "費用を補う、賄う", "覆って不足を埋めるイメージから、費用を「賄う」意味へ広がった。"],
  ["ch14", "development", "開発、発展", "develop（発展させる・開発する）+ 名詞語尾 -ment。"],
  ["ch14", "what is called", "いわゆる", "what is called A は直訳すると「Aと呼ばれるもの」で、名詞の前に置いて「いわゆるA」。"],
  ["ch14", "utility", "公共事業体、電力会社", "ラテン語 utilis「役に立つ」と同系。公共に役立つ電気・水道等の事業体を指す。"],
  ["ch14", "allow", "～を可能にする、許す", "allow + 目的語 + to do で「目的語が～するのを可能にする」。"],
  ["ch14", "redox flow battery", "レドックスフロー電池", "redox は reduction（還元）+ oxidation（酸化）の合成語。"],
  ["ch14", "electrolytic solution", "電解液", "electro-（電気）+ lytic（分解の）から、電気を通す溶液。"],
  ["ch14", "vanadium", "バナジウム", "元素名。レドックスフロー電池の電解液に用いられる。"],
  ["ch14", "capacity", "容量、生産能力", "capable（能力がある）と同系で、入れられる量・処理できる量。"],
  ["ch14", "discharge", "放出する、放電する", "dis-（外へ）+ charge（電荷・負荷）。蓄えた電気を外へ出す。"],
  ["ch14", "convert A into B", "AをBに変換する", "con-（一緒に）+ vert（向きを変える）。into が変換後の姿Bを導く。"],

  ["housing", "affordable", "手頃な、無理なく買える", "afford（余裕がある）+ -able（～できる）。"],
  ["housing", "comfort", "快適さ、安らぎ", "古フランス語 conforter「力づける」と同系で、苦痛を和らげ安心させることから「快適さ」。"],
  ["housing", "condominium", "分譲マンション、区分所有住宅", "ラテン語 con-「共同で」+ dominium「所有権」。建物を共同所有し、各戸を区分所有する形。"],
  ["housing", "to decorate", "飾る、内装を施す", "ラテン語 decorare「飾る」と同系。decor（装飾）に動詞語尾 -ate が付いた形。"],
  ["housing", "fully equipped", "設備が完全に整った", "full + -ly の副詞 fully が、equip の過去分詞 equipped「設備を備えた」を強める。"],
  ["housing", "to furnish", "家具を備え付ける", "古フランス語 fournir「備える・供給する」と同系。furniture（家具）の語幹として覚える。"],
  ["housing", "furthermore", "さらに、そのうえ", "further「さらに」+ more「もっと」を重ねた接続副詞。情報を追加する。"],
  ["housing", "household goods", "家庭用品、家財道具", "house + hold から household「世帯」、goods「品物」。家庭で使う物品を表す。"],
  ["housing", "landlord", "家主、大家", "land「土地」+ lord「所有者・主人」。土地・住宅を貸す側。"],
  ["housing", "lease", "賃貸借契約、賃貸する", "アングロフランス語系の「放す・貸す」に由来し、一定期間使用権を渡す契約。"],
  ["housing", "microwave oven", "電子レンジ", "micro-「小さい」+ wave「波」から microwave「マイクロ波」、oven「加熱器」。"],
  ["housing", "mortgage", "住宅ローン、抵当", "古フランス語 mort「死んだ」+ gage「誓約・担保」。返済または差押えで終わる担保契約。"],
  ["housing", "rent", "家賃、賃借する", "古フランス語 rente「定期収入」と同系。定期的に払う賃料、または借りる動作。"],
  ["housing", "suburban", "郊外の", "sub-「下・近く」+ urban「都市の」。都市の周辺に位置することを表す。"],
  ["housing", "tenant", "借家人、入居者", "ラテン語 tenere「保持する」と同系。契約で物件を保持・使用する借り手。"],

  ["medical", "accommodation", "収容施設、宿泊設備", "ラテン語 accommodare「適合させる」と同系。人に合う場所を用意することから宿泊設備・収容。"],
  ["medical", "ambulance", "救急車", "フランス語 hôpital ambulant「移動病院」に由来し、ambulare「歩く・移動する」と同系。"],
  ["medical", "blood pressure", "血圧", "blood「血液」+ pressure「圧力」。血管壁にかかる圧力を表す複合語。"],
  ["medical", "confidentiality", "守秘義務、機密性", "confidential「内密の」+ 名詞語尾 -ity。語幹はラテン語 fidere「信頼する」と同系。"],
  ["medical", "to disclose", "開示する、明らかにする", "dis-「離して」+ close「閉じる」。閉じた情報を開いて見せるイメージ。"],
  ["medical", "to donate", "寄付する、提供する", "ラテン語 donum「贈り物」と同系。donor（提供者）・donation（寄付）も同じ語族。"],
  ["medical", "duty", "義務、勤務", "due「当然支払うべき」と同系で、自分が果たすべき務めを表す。"],
  ["medical", "evaluation", "評価", "value「価値」につながる evaluate「価値を見積もる」+ -tion。"],
  ["medical", "inpatient", "入院患者", "in「中で」+ patient「患者」。病院内に滞在して治療を受ける人。"],
  ["medical", "to investigate", "調査する、検査する", "ラテン語 vestigium「足跡」と同系で、跡をたどって詳しく調べるイメージ。"],
  ["medical", "to misuse", "誤用する、乱用する", "mis-「誤って・悪く」+ use「使う」。目的外または不適切に使う。"],
  ["medical", "occupational therapy", "作業療法", "occupation「活動・仕事」+ ギリシャ語系 therapy「治療」。作業活動を用いる治療。"],
  ["medical", "outpatient", "外来患者", "out「外で」+ patient「患者」。入院せず、外から通院して診療を受ける人。"],
  ["medical", "surgery", "手術、外科", "ギリシャ語 kheirourgia「手の仕事」に由来し、手を用いる治療から手術・外科。"],
  ["medical", "temperature", "体温、温度", "ラテン語 temperare「適度にする・調整する」と同系で、熱さ冷たさの程度。"],

  ["ch15", "intersection", "交差点、交差する領域", "範囲補足小テストの指定語。inter-「間で」+ section「切ること」から、線が交わる点や二分野が交わる領域を表す。"],
  ["ch15", "involve", "～を含む、伴う", "範囲補足小テストの指定語。in-「中へ」+ ラテン語 volvere「巻く」と同系で、物事の中へ巻き込むことから「含む・伴う」。"],
];

export const ENGLISH_VOCAB: EnglishVocabCard[] = [...RAW_VOCAB, ...ADDITIONAL_RAW_VOCAB]
  .map(([unit, en, ja, note], index) => ({
    id: `ev-${String(index + 1).padStart(3, "0")}`,
    unit,
    en,
    ja,
    note,
  }))
  .filter(isEnglishPoolItemInScope);

const ADDITIONAL_ENGLISH_PASSAGES: EnglishPassage[] = [
  {
    id: "passage-big-battery",
    unit: "ch14",
    title: "Big battery eyes green energy era",
    titleJa: "大型蓄電池が再生可能エネルギー時代を見据える",
    paragraphs: [
      {
        en: "Japan will build the world's largest storage battery system in Hokkaido as early as autumn of 2013 in a bid to rectify fluctuations in the electricity produced by renewable energy sources.",
        ja: "日本は、再生可能エネルギー源で作られる電力の変動を是正するため、早ければ2013年秋に北海道で世界最大の蓄電池システムを建設する。",
      },
      {
        en: "The project is aimed at promoting renewable energy by addressing a key defect—inconsistent power generation.",
        ja: "この計画は、主要な欠点である不安定な発電へ対処することで、再生可能エネルギーを促進することを目的としている。",
      },
      {
        en: "The electricity generated by such sources accounts for only 1.6 percent of the nation's total, partly because solar and wind power are affected by the changes in the weather.",
        ja: "こうした電源による電力は国全体のわずか1.6パーセントを占めるにすぎず、その一因は太陽光・風力発電が天候の変化に影響されることである。",
      },
      {
        en: "To raise renewable energy's role in the national energy mix, the Ministry of Economy, Trade and Industry pushed for the development of a large storage system that would store electricity when weather conditions are favorable and dispense it when the weather fails.",
        ja: "国のエネルギー構成における再生可能エネルギーの役割を高めるため、経済産業省は、天候が好都合なときに電力を蓄え、天候が悪化したときに送り出す大型蓄電システムの開発を推進した。",
      },
      {
        en: "Sumitomo Electric Industries Ltd. and Hokkaido Electric Power Co. are leading the storage project, and the ministry has provided ¥20 billion to cover all development and manufacturing costs.",
        ja: "住友電気工業株式会社と北海道電力株式会社が蓄電計画を主導し、経済産業省は開発・製造費のすべてを賄うため200億円を拠出した。",
      },
      {
        en: "For the project, Hokkaido Electric will build what is called a “redox flow” battery system, produced by Sumitomo, at a substation in the town of Abira.",
        ja: "この計画のため、北海道電力は安平町の変電所に、住友電工製のいわゆる「レドックスフロー」電池システムを建設する。",
      },
      {
        en: "With a capacity of 60,000 kWh, the system will be as high as a six-story building.",
        ja: "容量6万kWhのそのシステムは、6階建ての建物ほどの高さになる。",
      },
      {
        en: "A redox flow battery repeats charging and discharging operations in a tank, using an electrolytic solution of vanadium.",
        ja: "レドックスフロー電池は、バナジウムの電解液を用いてタンク内で充電と放電を繰り返す。",
      },
      {
        en: "While it is safe and has a life span of 10 to 20 years, it can be readily converted into a large system, experts say.",
        ja: "安全で寿命が10年から20年ある一方、容易に大規模システムへ変換できると専門家はいう。",
      },
      {
        en: "The ministry believes that using such batteries will allow utilities to buy 10 percent more electricity from green energy sources.",
        ja: "経済産業省は、このような蓄電池を使えば、電力会社がグリーンエネルギー源からの電力を10パーセント多く購入できるようになると考えている。",
      },
    ],
  },
  {
    id: "passage-keller-attire",
    unit: "toeic",
    title: "Keller Attire advertisement and customer letter",
    titleJa: "Keller Attireの広告と顧客からの手紙",
    paragraphs: [
      {
        en: "Renting a suit from Keller Attire has never been easier! We now have an expanded range of men's formal wear in sizes XS to XXL, all available to rent online.",
        ja: "Keller Attireでのスーツレンタルはこれまでになく簡単です。XSからXXLまで紳士用礼服の品ぞろえを拡大し、すべてオンラインで借りられます。",
      },
      {
        en: "Whether you are attending a wedding, a black-tie event, or some other special occasion, we have the perfect suit for you. Visit our Web site at www.kellerattire.com to see our full range of styles, colors, and fabrics. Our style experts are ready to chat with you about your choices and walk you through our super-accurate online Measuring Wizard. We will help you find a great suit that fits you perfectly!",
        ja: "結婚式、正装行事、その他の特別な機会のいずれでも、あなたにぴったりのスーツがあります。ウェブサイトではスタイル、色、生地の全品ぞろえを確認でき、専門家が選択を相談し、精度の高いオンライン採寸機能を案内します。ぴったり合う素敵なスーツ探しをお手伝いします。",
      },
      {
        en: "Our standard delivery service will get your order to you in three to five days. For faster service, we offer overnight delivery for an additional charge of $50.",
        ja: "通常配送は3日から5日です。急ぎの場合は、追加料金50ドルで翌日配送を利用できます。",
      },
      {
        en: "I recently ordered a suit from Keller Attire to wear to an important client dinner in New York. I chose your overnight delivery service and provided a New York address for delivery. However, the suit was delivered to my home address in Dallas instead—I was already on my way to New York at the time!",
        ja: "私は最近、ニューヨークでの重要な顧客との夕食会で着るためKeller Attireのスーツを注文しました。翌日配送を選び、ニューヨークの住所を指定しましたが、スーツは代わりにダラスの自宅へ届き、その時私はすでにニューヨークへ向かっていました。",
      },
      {
        en: "Your customer service team handled the problem with spotless professionalism. As there was not enough time to send a replacement, they arranged for a local rental company to deliver a similar suit to my hotel at no additional cost to me.",
        ja: "顧客対応チームは非の打ちどころのないプロ意識で問題に対処しました。代替品を送る時間がなかったため、現地のレンタル会社を手配し、追加料金なしで同様のスーツをホテルへ届けました。",
      },
      {
        en: "I am extremely grateful for your team's superior customer service. I will certainly use Keller Attire again in the future.",
        ja: "御社チームの優れた顧客対応に心から感謝しています。今後も必ずKeller Attireを利用します。",
      },
    ],
  },
  {
    id: "passage-eston-scavenger-hunt",
    unit: "toeic",
    title: "Eston City Scavenger Hunt announcement",
    titleJa: "Eston市スカベンジャーハントのお知らせ",
    paragraphs: [
      {
        en: "This year's Eston City Scavenger Hunt (ECSH) is coming soon! Now in its seventh year, the ECSH has become a tradition for local residents. Gather clues, solve challenges, and uncover hidden details about historical sites throughout the city.",
        ja: "今年のEston市スカベンジャーハント（ECSH）が間もなく開催されます。7年目を迎え、ECSHは地域住民の恒例行事になりました。手がかりを集め、課題を解き、市内各地の史跡に隠された細部を発見してください。",
      },
      {
        en: "The ECSH starts in Founders Park at 10:00 A.M. on July 20. It takes two to four hours to complete, and a smartphone is required. All of the sites are within walking distance of the park. You will need only one device per team.",
        ja: "ECSHは7月20日午前10時にFounders Parkで始まります。完了には2時間から4時間かかり、スマートフォンが必要です。全地点は公園から徒歩圏内で、1チームにつき端末は1台だけで構いません。",
      },
      {
        en: "Afterward, join your neighbors to celebrate with refreshments and music in the park. Register online at www.estoncity.gov/ecsh by July 18 or in person on the day of the event.",
        ja: "終了後は公園で軽食と音楽を楽しみ、近隣の人々と祝いましょう。www.estoncity.gov/ecshで7月18日までにオンライン登録するか、当日に会場で登録してください。",
      },
    ],
  },
];

const LEGACY_ENGLISH_PASSAGES: EnglishPassage[] = [
  {
    id: "passage-amyris",
    unit: "ch15",
    title: "Scientists now creating millions of organisms from scratch",
    titleJa: "Chapter 15｜新しい生命体を作り出す企業",
    paragraphs: [
      {
        en: "For scientist Jack Newman, creating a new life-form has become as simple as this: He types out a DNA sequence on his laptop, and clicks ‘send.’",
        ja: "科学者ジャック・ニューマン氏にとって、新しい生命体を作ることは、ノートパソコンでDNA配列を打ち込み「送信」をクリックするほど簡単になった。",
      },
      {
        en: "Nearby in the laboratory, robotic arms start to mix together some compounds to produce the desired cells.",
        ja: "近くの実験室では、目的の細胞を作るために、ロボットアームがいくつかの化合物を混ぜ始める。",
      },
      {
        en: "Newman’s biotech company is creating new organisms, mostly forms of genetically modified yeast, at a dizzying rate of more than 1,500 a day.",
        ja: "ニューマン氏のバイオ企業は、主に遺伝子組み換え酵母の形をした新しい生命体を、1日1,500個を超えるめまぐるしい速度で作っている。",
      },
      {
        en: "Some convert sugar into medicines. Others create moisturizers that can be used in cosmetics. And still others make biofuel, a renewable energy source usually made from corn.",
        ja: "砂糖を医薬品に変換するもの、化粧品に使える保湿剤を作るもの、さらに通常はトウモロコシから作られる再生可能エネルギー源であるバイオ燃料を作るものもある。",
      },
      {
        en: "You can now build a cell the same way you might build an app for your iPhone, said Newman, chief science officer of Amyris.",
        ja: "「今ではiPhone用アプリを作るのと同じように細胞を作れます」と、Amyrisの最高科学責任者ニューマン氏は述べた。",
      },
      {
        en: "Some believe this kind of work marks the beginning of a third industrial revolution—one based on using living systems as biofactories for creating substances that are too tricky or too expensive to grow in nature or to make with petrochemicals.",
        ja: "この仕事は、生物をバイオ工場として使い、自然界で育てたり石油化学製品から作ったりするには難しすぎる、または高価すぎる物質を生み出す第三次産業革命の始まりだと考える人もいる。",
      },
      {
        en: "The rush to biological means of production promises to revolutionize the chemical industry and transform the economy, but it also raises questions about environmental safety and bio-security and revives ethical debates about playing God. Hundreds of products are in the pipeline.",
        ja: "生物学的な生産手段への動きは、化学産業と経済を変革すると期待される一方、環境上の安全性や生物学的安全保障への疑問を生み、「神を演じること」に関する倫理論争を再燃させる。何百もの製品が開発中である。",
      },
      {
        en: "Since it was founded a decade ago, Amyris has become a legend in the field that sits at the intersection of biology and engineering, creating more than 3 million new organisms.",
        ja: "10年前の創業以来、Amyrisは生物学と工学の交差する分野で伝説的存在となり、300万を超える新しい生命体を作ってきた。",
      },
      {
        en: "Unlike traditional genetic engineering, which typically involves swapping a few genes, the scientists are building entire genomes from scratch.",
        ja: "通常は少数の遺伝子を入れ替える従来の遺伝子工学とは異なり、科学者たちはゲノム全体をゼロから構築している。",
      },
    ],
  },
  {
    id: "passage-weather",
    unit: "ch16",
    title: "Japanese supercomputer shows detailed cloud movements on Earth’s surface",
    titleJa: "Chapter 16｜スパコンで天気予報①",
    paragraphs: [
      {
        en: "A group of scientists have created a detailed cloud map of the Earth’s surface using the K computer—Japan’s fastest processing supercomputer—that could help provide more accurate forecasts for typhoons and heavy rain.",
        ja: "科学者グループは、日本最速の処理用スーパーコンピュータ「京」を使って地球表面の詳細な雲地図を作った。この地図は台風や大雨をより正確に予報する助けとなる可能性がある。",
      },
      {
        en: "With a cloud map, the Earth’s surface is divided into square blocks. Cloud formation and movements, which are essential factors in weather forecasts, are predicted based on atmospheric conditions in each block.",
        ja: "雲地図では地球表面を正方形の区画に分け、天気予報に不可欠な雲の形成と動きを各区画の大気条件に基づいて予測する。",
      },
      {
        en: "Typically, computers at meteorological institutions, such as the Japan Meteorological Agency, divide each block into squares measuring 20 km by 20 km.",
        ja: "通常、気象庁などの気象機関のコンピュータは、各区画を20km四方に分割する。",
      },
      {
        en: "Previous attempts to use high-tech supercomputers have been able to narrow each block down to 3.5 kilometers.",
        ja: "従来の高性能スーパーコンピュータでは、各区画を3.5km四方まで狭めることができた。",
      },
      {
        en: "By using the K computer, the team were able to split the Earth’s surface into some 63 billion hexagonal blocks, with each block spaced only 870 meters apart, and successfully reproduced cloud movement in each block.",
        ja: "「京」を使ったチームは地球表面を約630億個の六角形区画に分け、区画同士の間隔をわずか870mにし、各区画の雲の動きを再現することに成功した。",
      },
      {
        en: "When the team tested the system to reproduce cloud movement during Typhoon No. 15 in August 2012, the cloud map showed a detailed picture of clouds across the entire globe.",
        ja: "チームが2012年8月の台風15号の雲の動きを再現するテストを行ったところ、雲地図は地球全体の雲を詳細に示した。",
      },
      {
        en: "The team will work on improving the system for more accurate typhoon and heavy rain forecasting, as there has been an increase in such natural disasters.",
        ja: "こうした自然災害が増加しているため、チームはより正確な台風・大雨予報に向けてシステム改善に取り組む。",
      },
    ],
  },
  {
    id: "passage-wheelchair",
    unit: "ch18",
    title: "Robot wheelchairs would read users’ minds",
    titleJa: "Chapter 18｜高齢化社会に強力な助っ人",
    paragraphs: [
      {
        en: "The Internal Affairs and Communications Ministry said it aims to start a project to develop robot wheelchairs, which detect users’ intentions from their brain waves and automatically move in line with the users’ will.",
        ja: "総務省は、脳波から利用者の意図を読み取り、利用者の意志に沿って自動的に動くロボット車椅子を開発するプロジェクトの開始を目指していると述べた。",
      },
      {
        en: "While the graying of Japan’s population continues, the ministry expects that robot wheelchairs will be put to practical use in nursing care facilities, where a labor shortage is predicted.",
        ja: "日本人口の高齢化が続く中、総務省は、労働力不足が予想される介護施設でロボット車椅子が実用化されることを期待している。",
      },
      {
        en: "In cooperation with research institutes, telecommunications companies and machinery manufacturers, the ministry aims to put the technology to practical use possibly in 2017.",
        ja: "研究所、通信会社、機械メーカーと協力し、総務省はこの技術を2017年にも実用化することを目指している。",
      },
      {
        en: "The planned robot wheelchairs will have sensors that detect users’ intentions by analyzing their brain waves and nervous system activity, moving automatically.",
        ja: "計画中のロボット車椅子は、脳波と神経系の活動を分析して利用者の意図を検知するセンサーを備え、自動的に動く。",
      },
      {
        en: "Some research institutions have studied technologies needed for the robot wheelchairs.",
        ja: "一部の研究機関はロボット車椅子に必要な技術を研究してきた。",
      },
      {
        en: "They include a system in which computers recognize users’ intentions if users think about the directions, for example right or left, in which they want to move.",
        ja: "その技術には、利用者が右・左など進みたい方向を思い浮かべると、コンピューターが利用者の意図を認識するシステムが含まれる。",
      },
      {
        en: "In their experiments, wheelchairs have successfully moved short distances and performed simple operations involving home electronic appliances.",
        ja: "実験では、車椅子は短距離の移動に成功し、家庭電化製品に関わる簡単な操作を行った。",
      },
      {
        en: "The ministry also plans to establish telecommunication technology in which multiple wheelchairs will be connected by networks so that their users will be able to share information about obstacles and uneven surfaces.",
        ja: "総務省は、多数の車椅子をネットワークで接続し、利用者が障害物や凹凸のある表面について情報を共有できる通信技術の確立も計画している。",
      },
      {
        en: "Under the planned system, wheelchairs will calculate current locations and routes to destinations.",
        ja: "計画中のシステムでは、車椅子が現在地と目的地までの経路を計算する。",
      },
      {
        en: "The latest information from wheelchairs that have passed through dangerous places will be sent to other wheelchairs to help them choose routes that avoid danger.",
        ja: "危険な場所を通過した車椅子からの最新情報は、危険を避ける経路選びを助けるため、ほかの車椅子に送られる。",
      },
    ],
  },
  {
    id: "passage-dna",
    unit: "ch19",
    title: "Kyoto researchers develop DNA software that can halt food fraud",
    titleJa: "Chapter 19｜食品偽装を見破るソフト",
    paragraphs: [
      {
        en: "A group of researchers at Kyoto University has developed DNA barcoding software that can prevent the fraudulent mislabeling of farm products and seafood.",
        ja: "京都大学の研究者グループが、農産物や水産物の悪質な不当表示を防止できるDNAバーコーディングソフトウェアを開発した。",
      },
      {
        en: "Utilizing the newly developed software, users can easily determine the species of living objects based on their DNA sequence information.",
        ja: "新開発のソフトウェアを利用すれば、ユーザーは生物のDNA配列情報に基づいて、その種を容易に特定できる。",
      },
      {
        en: "The development of the software was announced in the U.S. scientific research journal PLOS ONE.",
        ja: "そのソフトウェアの開発は、米国の科学学術誌PLOS ONEで発表された。",
      },
      {
        en: "Prices of yellowfin tuna and Pacific bluefin tuna are drastically different. But if they are used in cooking, it is difficult even for experts to distinguish between them.",
        ja: "キハダマグロと太平洋クロマグロでは価格が大幅に異なる。しかし料理に使われてしまうと、専門家でさえ両者を見分けるのは難しい。",
      },
      {
        en: "If you use this software, you can easily detect mislabeling, said Akifumi Tanabe, who played the central role in the software’s development.",
        ja: "「このソフトウェアを使えば、不当表示を簡単に見抜くことができます」と、ソフトウェア開発で中心的役割を果たした田辺氏は述べた。",
      },
      {
        en: "The researchers, including those of the university’s Graduate School of Global Environmental Studies, created software that can compare the DNA sequences of plants, fish and other living objects with those stored in DNA databases.",
        ja: "大学院地球環境学堂の研究者を含む研究者グループは、植物や魚、その他の生物のDNA配列を、DNAデータベースに蓄積されたものと照合できるソフトウェアを作り上げた。",
      },
      {
        en: "By comparing the DNA barcoding, the software can automatically determine the species the tissue came from.",
        ja: "DNAバーコーディングを比較することで、そのソフトウェアは、その組織がどの種のものかを自動的に特定できる。",
      },
      {
        en: "Even in the case of new species, the software can determine which families or genera they belong to and which existing species they are related to.",
        ja: "新種の場合でも、そのソフトウェアは、それらがどの科や属に入るか、またどの既存種と関連しているかを特定できる。",
      },
      {
        en: "Databases have been released in Japan, the United States and Europe that store the DNA sequences of a total of about 288,000 species of living organisms, including fungi and viruses.",
        ja: "菌類やウイルスを含む合計約28万8千種の生物のDNA配列を蓄積したデータベースが、日米欧で公開されている。",
      },
      {
        en: "To date, the work to determine which species living organisms belong to has mostly depended on the knowledge of experts and their experience.",
        ja: "現在まで、生物がどの種に属するかを特定する作業は、主に専門家の知識と経験に頼ってきた。",
      },
    ],
  },
].filter((passage) => passage.unit !== "ch19");

export const ENGLISH_PASSAGES: EnglishPassage[] = [
  ...ADDITIONAL_ENGLISH_PASSAGES,
  ...LEGACY_ENGLISH_PASSAGES,
].filter(isEnglishPoolItemInScope);

type RawOrder = [
  unit: string,
  keyword: string,
  prompt: string,
  tokens: string[],
  answer: string,
];

const ORDER_QUESTIONS: RawOrder[] = [
  ["exam-sample", "substantially", "語句を並べ替え：トム・ブラウンの研修は、従業員が業績を大幅に改善するのに役立った。", ["Tom Brown's training", "has helped", "employees", "improve", "their performance", "substantially"], "Tom Brown's training has helped employees improve their performance substantially."],
  ["exam-sample", "be surrounded by", "語句を並べ替え：その建物は大木に囲まれています。", ["The building", "is", "surrounded", "by", "large trees"], "The building is surrounded by large trees."],
  ["exam-sample", "be connected to", "語句を並べ替え：男性の頭部は天井に繋げられています。", ["The man's head", "is", "connected", "to", "the ceiling"], "The man's head is connected to the ceiling."],

  ["ch15", "from scratch", "その男性は一からビジネスを立ち上げた。", ["The man", "built", "his business up", "from", "scratch"], "The man built his business up from scratch."],
  ["ch15", "millions of", "その試合は何百万人もの人が見ています。", ["The game", "is", "watched", "by", "millions", "of", "people"], "The game is watched by millions of people."],
  ["ch15", "twice as ... as", "この部屋はあの部屋の2倍の大きさだ。", ["This room", "is", "twice", "as big", "as", "that room"], "This room is twice as big as that room."],
  ["ch15", "modify", "合うようにテーブルの高さを修正しなければならなかった。", ["They", "had", "to", "modify", "the height", "of", "the table", "to", "make", "it fit"], "They had to modify the height of the table to make it fit."],
  ["ch15", "at the rate of", "この会社は一日に200台の割合で車を製造している。", ["This firm", "manufactures", "cars", "at", "the rate", "of", "two hundred", "per day"], "This firm manufactures cars at the rate of two hundred per day."],
  ["ch15", "convert A into B", "48時間を分に直すと何分ですか？", ["If", "you", "convert", "48 hours", "into minutes", "how many minutes", "does that make"], "If you convert 48 hours into minutes, how many minutes does that make?"],
  ["ch15", "build up", "その女性は大きな財産を築き上げた。", ["The woman", "built up", "a", "large", "fortune"], "The woman built up a large fortune."],

  ["ch16", "detailed", "部長は私達にその企画の詳細な説明を提供してくれた。", ["The manager", "gave", "us", "a detailed", "explanation of", "the project"], "The manager gave us a detailed explanation of the project."],
  ["ch16", "surface", "草原が地表の3分の1を覆っています。", ["Grasslands", "cover", "one", "third of", "the Earth's", "surface"], "Grasslands cover one third of the Earth's surface."],
  ["ch16", "accurate", "あなたの言う事実が正確であることを確認してください。", ["Make", "sure", "your", "facts", "are", "accurate"], "Make sure your facts are accurate."],
  ["ch16", "heavy rain", "そのイベントは大雨のために明日に延期になりました。", ["The event", "has", "been", "postponed", "to tomorrow", "due to", "heavy", "rain"], "The event has been postponed to tomorrow due to heavy rain."],
  ["ch16", "be divided into", "クラスはグループプロジェクトのためにグループに分けられました。", ["The class", "was", "divided", "into", "groups", "for", "a group project"], "The class was divided into groups for a group project."],
  ["ch16", "formation", "火山活動が約500万年前にハワイ諸島の形成につながった。", ["Volcanic", "activity", "led to", "the formation", "of", "the Hawaiian Islands", "around 5 million", "years ago"], "Volcanic activity led to the formation of the Hawaiian Islands around 5 million years ago."],
  ["ch16", "factor", "経済の安定性は、国の発展にとって重要な要素です。", ["Economic", "stability", "is", "a crucial", "factor", "for", "a country's", "development"], "Economic stability is a crucial factor for a country's development."],
  ["ch16", "essential", "自転車に乗る時に、ヘルメットをかぶるのは不可欠です。", ["It's", "essential", "to", "wear", "a helmet", "while riding", "a bicycle"], "It's essential to wear a helmet while riding a bicycle."],
  ["ch16", "based on", "その医師の決断は検査結果に基づいていた。", ["The doctor's", "decision", "was", "based on", "the test", "results"], "The doctor's decision was based on the test results."],
  ["ch16", "atmospheric", "大気中の二酸化炭素レベルを下げる必要があります。", ["We", "need", "to", "reduce", "atmospheric", "carbon dioxide", "levels"], "We need to reduce atmospheric carbon dioxide levels."],
  ["ch16", "measure", "そのプールは3メートルの深さがある。", ["The", "pool", "measures", "3", "meters", "deep"], "The pool measures 3 meters deep."],
  ["ch16", "narrow", "そのプレゼンのためのテーマを狭めるべきです。", ["You", "should", "narrow", "your", "topic", "for", "the presentation"], "You should narrow your topic for the presentation."],
  ["ch16", "split", "この食事は割り勘にするべきです。", ["We", "should", "split", "the check", "for this", "meal"], "We should split the check for this meal."],

  ["ch18", "intention", "彼らには結婚する意向はなかった。", ["They", "had", "no", "intention of", "getting", "married"], "They had no intention of getting married."],
  ["ch18", "in line with", "双方の意見は一致していた。", ["The", "two sides", "are", "in", "line", "with", "each", "other"], "The two sides are in line with each other."],
  ["ch18", "predict", "そのシステムは気象パターンを予測するのに機械学習を使っている。", ["The system", "uses", "machine learning", "to", "predict", "weather", "patterns"], "The system uses machine learning to predict weather patterns."],
  ["ch18", "put into practical use", "暗記した英文を実践で応用したい。", ["I", "want to", "put", "the English", "sentences", "that I memorized", "into", "practical use"], "I want to put the English sentences that I memorized into practical use."],
  ["ch18", "cooperation", "その学生たちは協力することの大切さを学んでいる。", ["The students", "are", "learning", "the importance", "of", "cooperation"], "The students are learning the importance of cooperation."],
  ["ch18", "aim to", "彼らは世界一のスポーツ選手になることを目指している。", ["They", "aim", "to be", "the top", "athletes", "in", "the world"], "They aim to be the top athletes in the world."],
  ["ch18", "recognize", "私は彼の声からすぐに彼だと分かった。", ["I", "recognized", "him", "instantly from", "his", "voice"], "I recognized him instantly from his voice."],
  ["ch18", "perform", "外科医は患者の心臓に手術を行います。", ["The surgeon", "will", "perform", "surgery", "on the patient's", "heart"], "The surgeon will perform surgery on the patient's heart."],
  ["ch18", "share", "チームは仕事を均等に分担することにしました。", ["The", "team", "decided", "to", "share", "the", "workload", "evenly"], "The team decided to share the workload evenly."],
  ["ch18", "via", "ユーザーはネットワークを経由して障害物を検知します。", ["The", "user", "detects", "obstacles", "via", "a network"], "The user detects obstacles via a network."],

  ["ch19", "fraud", "そのケースには、さまざまな異なる手口の詐欺が含まれていた。", ["The case", "included", "a number", "of", "different", "kinds of", "fraud"], "The case included a number of different kinds of fraud."],
  ["ch19", "halt", "著者が情報源を偽っていたことがわかり、出版社はその本の発行を中止した。", ["The publisher", "halted", "the release", "of", "the book", "when", "they found", "the author", "had lied about", "his sources"], "The publisher halted the release of the book when they found the author had lied about his sources."],
  ["ch19", "fraudulent", "その従業員は詐欺行為のため解雇された。", ["The employee", "was", "dismissed", "due", "to", "fraudulent", "activities"], "The employee was dismissed due to fraudulent activities."],
  ["ch19", "determine", "専門家は、それがどのような種類の車であるかをはっきりさせるだろう。", ["Experts", "will", "determine", "what", "kind of", "car", "it is"], "Experts will determine what kind of car it is."],
  ["ch19", "announce", "彼らは受賞者を発表するところだ。", ["They", "are", "about", "to", "announce", "the", "winner"], "They are about to announce the winner."],
  ["ch19", "distinguish", "その子供はまだ空想と現実を区別できない。", ["The", "child", "still cannot", "distinguish", "fantasy", "from", "reality"], "The child still cannot distinguish fantasy from reality."],
  ["ch19", "detect", "このセンサーは煙を感知すると警報を作動させる。", ["This", "sensor", "sets off", "an alarm", "when", "it", "detects", "smoke"], "This sensor sets off an alarm when it detects smoke."],
  ["ch19", "mislabeling", "我が社は食品内容の誤表示を避けるべきです。", ["Our", "company", "should", "avoid", "mislabeling", "the product", "contents"], "Our company should avoid mislabeling the product contents."],
  ["ch19", "play a role", "彼にはその団体での重要な役割があります。", ["He", "has", "an", "important", "role", "in", "the organization"], "He has an important role in the organization."],
  ["ch19", "including", "その観光客は東京と京都を含む多くの都市を訪れました。", ["The tourists", "visited", "many", "cities", "including", "Tokyo", "and Kyoto"], "The tourists visited many cities, including Tokyo and Kyoto."],
  ["ch19", "compare A with B", "彼は自分を兄たちと比べるべきではない。", ["He", "shouldn't", "compare", "himself", "with", "his", "brothers"], "He shouldn't compare himself with his brothers."],
  ["ch19", "graduate school", "私の姉は今月、いくつかの大学院に出願しています。", ["My", "sister", "is", "applying", "to", "several", "graduate", "schools", "this", "month"], "My sister is applying to several graduate schools this month."],
  ["ch19", "tissue", "科学者たちが、傷を治す助けとなる人工組織を開発した。", ["Scientists", "have", "developed", "an artificial", "tissue", "to help", "heal", "wounds"], "Scientists have developed an artificial tissue to help heal wounds."],
  ["ch19", "container", "刺身のプラスチックの入れ物が、店の棚の上にあります。", ["Plastic", "containers of", "sashimi", "are", "on", "the store", "shelves"], "Plastic containers of sashimi are on the store shelves."],
];

const CH15_RANGE_QUIZ_SOURCE_LABEL = "Chapter 15 範囲補足小テスト（提供写真）";

function ch15RangeQuizReference(quote: string, translation: string): EnglishQuestionReference {
  return {
    label: CH15_RANGE_QUIZ_SOURCE_LABEL,
    quote,
    translation,
  };
}

const CORE_QUESTIONS: EnglishQuestion[] = [
  {
    id: "sample-his",
    unit: "exam-sample",
    group: "文法・語形",
    format: "choice",
    prompt: "The team leader evaluated all of his team members on ( ___ ) own.",
    options: ["he", "his", "him", "himself"],
    answer: "his",
    explanation: "on one's own（自分で）のone'sに、主語と対応する所有格hisを入れます。",
  },
  {
    id: "sample-efficiently",
    unit: "exam-sample",
    group: "文法・語形",
    format: "choice",
    prompt: "He works so ( ___ ) that everyone trusts him.",
    options: ["efficient", "efficiency", "efficiently", "more efficient"],
    answer: "efficiently",
    explanation: "動詞worksを修飾するため、副詞efficientlyを選びます。",
  },
  {
    id: "sample-significant",
    unit: "exam-sample",
    group: "文法・語形",
    format: "choice",
    prompt: "The difference between the two results was so ( ___ ).",
    options: ["signify", "significant", "significantly", "significance"],
    answer: "significant",
    explanation: "be動詞の補語には形容詞significant（重要な／かなりの）を置きます。",
  },
  {
    id: "sample-correction",
    unit: "exam-sample",
    group: "誤文訂正",
    format: "input",
    prompt: "誤りを2か所直す：After completing intensive training, sales staff will have to visit them clients by theirs.",
    answer: "them → their / theirs → themselves",
    accepted: ["them to their, theirs to themselves", "them→their theirs→themselves", "their themselves"],
    explanation: "clientsの前は所有格their、by oneself（自分たちで）はby themselvesです。",
  },
  {
    id: "sample-weight",
    unit: "exam-sample",
    group: "語形変化",
    format: "input",
    prompt: "3つの空欄を同じ語の適切な形で埋める：The pendulum (1) 200 tons. / It is a (2) pendulum. / It is 200 tons in (3).",
    answer: "weighs / 200-ton / weight",
    accepted: ["weighs, 200-ton, weight", "weighs 200 ton weight"],
    explanation: "動詞weighs、複合形容詞200-ton、名詞weightを使い分けます。",
  },
  {
    id: "sample-prompted",
    unit: "exam-sample",
    group: "疑問文",
    format: "input",
    prompt: "「何が彼女にこのレビューを書かせたのですか」を英訳する。",
    answer: "What prompted her to write this review?",
    accepted: ["what prompted her to write this review"],
    explanation: "prompt A to doで「Aに～するよう促す」です。What自体が主語なのでdidは不要です。",
  },

  {
    id: "ch15-prep-1",
    unit: "ch15",
    group: "時間・単位",
    format: "choice",
    prompt: "The maintenance engineer works 8 hours ( ___ ) a day.",
    options: ["前置詞なし", "per", "by", "in"],
    answer: "前置詞なし",
    explanation: "a day自体で「1日につき」を表すため前置詞は置きません。",
  },
  {
    id: "ch15-prep-2",
    unit: "ch15",
    group: "時間・単位",
    format: "choice",
    prompt: "The rental fee of the device costs 2,000 yen ( ___ ) week.",
    options: ["前置詞なし", "per", "by", "at"],
    answer: "per",
    explanation: "per + 単位で「～につき」です。",
    reference: ch15RangeQuizReference(
      "The rental fee of the device costs 2000 yen ( ___ ) week. Choices: by / per",
      "その装置のレンタル料は1週間につき2,000円です。",
    ),
  },
  {
    id: "ch15-prep-3",
    unit: "ch15",
    group: "時間・単位",
    format: "choice",
    prompt: "The researcher gets paid ( ___ ) the hour.",
    options: ["前置詞なし", "per", "by", "for"],
    answer: "by",
    explanation: "by the hourで「時間単位で」です。",
    reference: ch15RangeQuizReference(
      "The researcher gets paid ( ___ ) the hour. Choices: by / per",
      "その研究者は時間給で報酬を受け取ります。",
    ),
  },
  {
    id: "ch15-prep-4",
    unit: "ch15",
    group: "時間・単位",
    format: "choice",
    prompt: "This science magazine is published twice ( ___ ) a month.",
    options: ["前置詞なし", "per", "by", "on"],
    answer: "前置詞なし",
    explanation: "twice a monthで「月2回」です。",
    reference: ch15RangeQuizReference(
      "This science magazine is published twice ( ___ ) a month. Choices: by / per / no word",
      "この科学雑誌は月に2回発行されます。",
    ),
  },
  {
    id: "ch15-tf-1",
    unit: "ch15",
    group: "長文 True / False",
    format: "choice",
    prompt: "The main purpose of the article is to introduce a biotechnology company that creates new organisms.",
    options: ["T", "F"],
    answer: "T",
    passageId: "passage-amyris",
  },
  {
    id: "ch15-tf-2",
    unit: "ch15",
    group: "長文 True / False",
    format: "choice",
    prompt: "A new cell can be built by using an iPhone application.",
    options: ["T", "F"],
    answer: "F",
    explanation: "本文は「iPhoneアプリを作るのと同じように」であり、iPhoneアプリを使うとは述べていません。",
    passageId: "passage-amyris",
  },
  {
    id: "ch15-tf-3",
    unit: "ch15",
    group: "長文 True / False",
    format: "choice",
    prompt: "The article says the technology raises ethical and environmental questions.",
    options: ["T", "F"],
    answer: "T",
    passageId: "passage-amyris",
  },
  {
    id: "ch15-summary-1",
    unit: "ch15",
    group: "要約穴埋め",
    format: "choice",
    prompt: "A biotech company has ( ___ ) over 3 million new organisms using computers and robots.",
    options: ["arisen", "been", "become", "created"],
    answer: "created",
  },
  {
    id: "ch15-summary-2",
    unit: "ch15",
    group: "要約穴埋め",
    format: "choice",
    prompt: "The company has ( ___ ) a symbol of a new kind of genetic engineering.",
    options: ["arisen", "been", "become", "created"],
    answer: "become",
  },
  {
    id: "ch15-summary-3",
    unit: "ch15",
    group: "要約穴埋め",
    format: "choice",
    prompt: "There has ( ___ ) criticism concerning the ethics of creating new life forms.",
    options: ["arisen", "been", "become", "created"],
    answer: "been",
  },
  {
    id: "ch15-summary-4",
    unit: "ch15",
    group: "要約穴埋め",
    format: "choice",
    prompt: "Hope has ( ___ ) for a new revolution in the chemical industry.",
    options: ["arisen", "been", "become", "created"],
    answer: "arisen",
  },

  {
    id: "ch16-word-1",
    unit: "ch16",
    group: "語形・文脈",
    format: "choice",
    prompt: "High-tech supercomputers could ( ___ ) each block down to 3.5 kilometers.",
    options: ["map", "narrow", "surface"],
    answer: "narrow",
  },
  {
    id: "ch16-word-2",
    unit: "ch16",
    group: "語形・文脈",
    format: "choice",
    prompt: "The problems started to ( ___ ) in the 1980s.",
    options: ["map", "narrow", "surface"],
    answer: "surface",
  },
  {
    id: "ch16-word-3",
    unit: "ch16",
    group: "語形・文脈",
    format: "input",
    prompt: "mapを適切な形にする：Researchers have ( ___ ) the genome of a spider for the first time.",
    answer: "mapped",
    explanation: "現在完了haveの後なので過去分詞。語尾pを重ねてmappedです。",
  },
  ...[
    ["Scientists are using a supercomputer to help predict the weather.", "T"],
    ["Cloud formations are important to consider when making weather forecasts.", "T"],
    ["There were about 63 billion cloud movements over the Earth's surface.", "F"],
    ["The K computer uses weather information from small areas to predict cloud formations.", "T"],
    ["The system was tested and will be further improved.", "T"],
  ].map(([prompt, answer], index) => ({
    id: `ch16-tf-${index + 1}`,
    unit: "ch16",
    group: "長文 True / False",
    format: "choice" as const,
    prompt,
    options: ["T", "F"],
    answer,
    passageId: "passage-weather",
  })),

  {
    id: "ch18-relative-1",
    unit: "ch18",
    group: "前置詞＋関係代名詞",
    format: "input",
    prompt: "Technologies needed for robot wheelchairs include a system ( ___ ) which computers recognize users' intentions when the users think about a direction.",
    answer: "in",
    explanation: "元の関係は computers recognize users' intentions in the system。the system を which に替え、前置詞 in を前へ出して a system in which ... とします。where への言い換えはできますが、where which とはしません。",
  },
  {
    id: "ch18-relative-2",
    unit: "ch18",
    group: "前置詞＋関係代名詞",
    format: "input",
    prompt: "Telecommunication technology ( ___ ) which multiple wheelchairs will be connected enables users to share information.",
    answer: "in",
  },
  {
    id: "ch18-read-1",
    unit: "ch18",
    group: "長文内容理解",
    format: "choice",
    prompt: "The robot wheelchairs detect the users' commands by reading ...",
    options: ["their voices", "their brain waves", "their hands", "their helpers"],
    answer: "their brain waves",
    passageId: "passage-wheelchair",
  },
  {
    id: "ch18-read-2",
    unit: "ch18",
    group: "長文内容理解",
    format: "choice",
    prompt: "During the trial, the wheelchairs succeeded in ...",
    options: ["traveling a long distance", "connecting with each other", "operating home electronic appliances", "receiving information from users"],
    answer: "operating home electronic appliances",
    passageId: "passage-wheelchair",
  },
  {
    id: "ch18-read-3",
    unit: "ch18",
    group: "長文内容理解",
    format: "choice",
    prompt: "According to the article, the wheelchairs will be able to ...",
    options: ["move obstacles", "physically link together", "calculate the cheapest route", "share data concerning uneven paths"],
    answer: "share data concerning uneven paths",
    passageId: "passage-wheelchair",
  },
  {
    id: "ch18-translation-1",
    unit: "ch18",
    group: "和訳",
    format: "choice",
    prompt: "While the graying of Japan's population continues, the ministry expects that robot wheelchairs will be put to practical use in nursing care facilities, where a labor shortage is predicted.",
    options: [
      "日本の高齢化が続く中、総務省は、労働力不足が予想される介護施設でロボット車椅子が実用化されると見込んでいる。",
      "日本の人口が増える中、総務省は介護施設の閉鎖を予想している。",
      "労働力不足が解消したので、車椅子の研究は中止された。",
      "介護施設はロボット車椅子を海外へ輸出する予定である。",
    ],
    answer: "日本の高齢化が続く中、総務省は、労働力不足が予想される介護施設でロボット車椅子が実用化されると見込んでいる。",
    passageId: "passage-wheelchair",
  },
  {
    id: "ch18-translation-2",
    unit: "ch18",
    group: "和訳",
    format: "choice",
    prompt: "In their experiments, wheelchairs have successfully moved short distances and performed simple operations involving home electronic appliances.",
    options: [
      "実験では、車椅子は短距離の移動に成功し、家庭電化製品に関わる簡単な操作を行った。",
      "車椅子は長距離を移動したが、家電の操作には失敗した。",
      "家庭電化製品が車椅子を短距離だけ運んだ。",
      "実験は家庭ではなく研究所だけで行われた。",
    ],
    answer: "実験では、車椅子は短距離の移動に成功し、家庭電化製品に関わる簡単な操作を行った。",
    passageId: "passage-wheelchair",
  },
  {
    id: "ch18-translation-3",
    unit: "ch18",
    group: "和訳",
    format: "choice",
    prompt: "Under the planned system, wheelchairs will calculate current locations and routes to destinations.",
    options: [
      "計画中のシステムでは、車椅子が現在地と目的地までの経路を計算する。",
      "利用者が現在地を忘れた場合だけ目的地を変更する。",
      "計画では目的地の位置を人が毎回入力する。",
      "車椅子は現在地の情報を計算せず共有する。",
    ],
    answer: "計画中のシステムでは、車椅子が現在地と目的地までの経路を計算する。",
    passageId: "passage-wheelchair",
  },
  {
    id: "ch19-abstract-method",
    unit: "ch19",
    group: "Abstract構成",
    format: "choice",
    prompt: "The survey was completed in 2012 and all interviews were conducted over the telephone. この文はAbstractのどの部分か。",
    options: ["① 研究の背景・目的", "② 実験の方法", "③ 実験結果", "④ 結論"],
    answer: "② 実験の方法",
  },
  {
    id: "ch19-abstract-purpose",
    unit: "ch19",
    group: "Abstract構成",
    format: "choice",
    prompt: "The purpose of this study is to examine the effects of indoor heating on pets. この文はAbstractのどの部分か。",
    options: ["① 研究の背景・目的", "② 実験の方法", "③ 実験結果", "④ 結論"],
    answer: "① 研究の背景・目的",
  },
  {
    id: "ch19-meaning-drastically",
    unit: "ch19",
    group: "英→日",
    format: "choice",
    prompt: "drastically の意味を選ぶ。",
    options: ["大幅に", "自動的に", "現在まで", "不正に"],
    answer: "大幅に",
  },
  {
    id: "ch19-meaning-existing",
    unit: "ch19",
    group: "英→日",
    format: "choice",
    prompt: "existing の意味を選ぶ。",
    options: ["既存の", "絶滅した", "実験中の", "悪質な"],
    answer: "既存の",
  },
  {
    id: "ch19-meaning-distinguish",
    unit: "ch19",
    group: "英→日",
    format: "choice",
    prompt: "distinguish の意味を選ぶ。",
    options: ["見分ける、区別する", "蓄積する", "依存する", "発表する"],
    answer: "見分ける、区別する",
  },
  ...[
    ["The ministry plans to ( ___ ) developing robot wheelchairs.", ["share", "connect", "start", "recognize"], "start"],
    ["The wheelchairs ( ___ ) their users' commands and move automatically.", ["share", "connect", "start", "recognize"], "recognize"],
    ["The ministry aims to ( ___ ) multiple wheelchairs using networks.", ["share", "connect", "start", "recognize"], "connect"],
    ["Networks enable users to ( ___ ) information about dangerous places.", ["share", "connect", "start", "recognize"], "share"],
  ].map(([prompt, options, answer], index) => ({
    id: `ch18-summary-${index + 1}`,
    unit: "ch18",
    group: "要約穴埋め",
    format: "choice" as const,
    prompt: prompt as string,
    options: options as string[],
    answer: answer as string,
  })),
  ...[
    ["And ( ___ ) long did you test the ThinkChair for?", "how"],
    ["As a wheelchair user, ( ___ ) did you think about the ThinkChair?", "what"],
    ["( ___ ) did you experience these problems? — Mostly at the beginning.", "when"],
    ["But you said it was quite good. ( ___ )? — Because it showed the shortest route.", "why"],
  ].map(([prompt, answer], index) => ({
    id: `ch18-interview-${index + 1}`,
    unit: "ch18",
    group: "疑問詞",
    format: "input" as const,
    prompt,
    answer,
  })),

  ...[
    ["families", "family"],
    ["species", "species"],
    ["fungi", "fungus"],
    ["genera", "genus"],
  ].map(([prompt, answer], index) => ({
    id: `ch19-singular-${index + 1}`,
    unit: "ch19",
    group: "単数形",
    format: "input" as const,
    prompt: `次の語を単数形にする：${prompt}`,
    answer,
  })),
  ...[
    ["The main purpose of this article is to warn customers about food fraud.", "F"],
    ["The software compares DNA sequences from a database with those from actual food.", "T"],
    ["Mislabeled food is easier to find with the new software.", "T"],
    ["The family of a new species can also be detected with this software.", "T"],
    ["Until now, only experts from Japan, the U.S. and Europe could identify unknown organisms.", "F"],
  ].map(([prompt, answer], index) => ({
    id: `ch19-tf-${index + 1}`,
    unit: "ch19",
    group: "長文 True / False",
    format: "choice" as const,
    prompt,
    options: ["T", "F"],
    answer,
    passageId: "passage-dna",
  })),
  ...[
    ["The software can detect ( ___ ) labeled foods.", "incorrectly"],
    ["It compares actual DNA sequences to sequences ( ___ ) stored in databases.", "already"],
    ["The software ( ___ ) detects the species of the product.", "automatically"],
    ["The process has ( ___ ) depended on experts' knowledge and experience.", "commonly"],
  ].map(([prompt, answer], index) => ({
    id: `ch19-summary-${index + 1}`,
    unit: "ch19",
    group: "要約穴埋め",
    format: "choice" as const,
    prompt,
    options: ["automatically", "already", "incorrectly", "commonly"],
    answer,
  })),
  ...[
    ["Today is Tuesday and you want to know about the weather for the whole of Japan on the weekend.", "National weather / Weekly forecast"],
    ["You want to know how much sun protection you will need today.", "Weather data / UV index"],
    ["You want to know more about a blizzard that your friends told you about.", "Weather warnings / Snow"],
    ["Today is Friday and you want to know about the weather in your area tomorrow.", "Regional weather / 3-day forecast"],
    ["You want to know about today's air quality.", "Weather data / Air pollution"],
  ].map(([prompt, answer], index) => ({
    id: `ch16-homepage-${index + 1}`,
    unit: "ch16",
    group: "情報検索",
    format: "choice" as const,
    prompt,
    options: [
      "National weather / Weekly forecast",
      "Regional weather / 3-day forecast",
      "Weather data / UV index",
      "Weather data / Air pollution",
      "Weather warnings / Snow",
    ],
    answer,
  })),
];

const VOCAB_QUESTIONS: EnglishQuestion[] = ENGLISH_VOCAB.map((card) => ({
  id: `question-${card.id}`,
  unit: card.unit,
  group: "語彙・熟語（日→英）",
  format: "input",
  prompt: `「${card.ja}」を英語で答える。`,
  answer: card.en,
  accepted: card.en.split(/\s*\/\s*/).map((answer) => answer.trim()),
  explanation: card.note,
}));

function japaneseMeaningCandidates(meaning: string) {
  const candidates = meaning
    .split(/\s*(?:、|\/|／)\s*/)
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  return candidates.length > 1 ? candidates : undefined;
}

const REVERSE_VOCAB_QUESTIONS: EnglishQuestion[] = ENGLISH_VOCAB.map((card) => ({
  id: `reverse-question-${card.id}`,
  unit: card.unit,
  group: "語彙・熟語（英→日）",
  format: "input",
  grading: "japanese-semantic",
  prompt: `「${card.en}」の意味を日本語で答える。`,
  answer: card.ja,
  accepted: japaneseMeaningCandidates(card.ja),
  explanation: card.note,
}));

const BUILT_ORDER_QUESTIONS: EnglishQuestion[] = ORDER_QUESTIONS.map(
  ([unit, keyword, prompt, tokens, answer], index) => ({
    id: `order-${String(index + 1).padStart(2, "0")}`,
    unit,
    group: `語順整序｜${keyword}`,
    format: "order",
    prompt,
    tokens,
    answer,
  }),
);

const PASSAGE_ORDER_QUESTIONS: EnglishQuestion[] = [
  {
    id: "passage-order-ch15-1",
    unit: "ch15",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.15 本文第4段落から一文を並べ替え：他のものは、化粧品に使える保湿剤を作る。",
    tokens: ["Others", "create", "moisturizers", "that", "can be used", "in cosmetics"],
    answer: "Others create moisturizers that can be used in cosmetics.",
  },
  {
    id: "passage-order-ch15-2",
    unit: "ch15",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.15 本文第6段落の重要部分を並べ替え：この種の仕事が第三次産業革命の始まりを示すと考える人もいる。",
    tokens: ["Some", "believe", "this kind of work", "marks", "the beginning", "of a third industrial revolution"],
    answer: "Some believe this kind of work marks the beginning of a third industrial revolution.",
  },
  {
    id: "passage-order-ch15-3",
    unit: "ch15",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.15 本文第8段落の重要部分を並べ替え：10年前の創業以来、Amyrisはその分野で伝説的な存在になった。",
    tokens: ["Since", "it was founded", "a decade ago", "Amyris", "has become", "a legend", "in the field"],
    answer: "Since it was founded a decade ago, Amyris has become a legend in the field.",
  },
  {
    id: "passage-order-ch15-4",
    unit: "ch15",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.15 本文第9段落の重要部分を並べ替え：科学者たちはゲノム全体をゼロから構築している。",
    tokens: ["The scientists", "are building", "entire genomes", "from scratch"],
    answer: "The scientists are building entire genomes from scratch.",
  },
  {
    id: "passage-order-ch16-1",
    unit: "ch16",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.16 本文第2段落から一文を並べ替え：天気予報に不可欠な雲の形成と動きは、各区画の大気条件に基づいて予測される。",
    tokens: ["Cloud formation and movements", "which are essential factors", "in weather forecasts", "are predicted", "based on atmospheric conditions", "in each block"],
    answer: "Cloud formation and movements, which are essential factors in weather forecasts, are predicted based on atmospheric conditions in each block.",
  },
  {
    id: "passage-order-ch16-2",
    unit: "ch16",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.16 本文第4段落の重要部分を並べ替え：従来の試みでは、各区画を3.5kmまで狭めることができた。",
    tokens: ["Previous attempts", "have been able", "to narrow", "each block", "down to", "3.5 kilometers"],
    answer: "Previous attempts have been able to narrow each block down to 3.5 kilometers.",
  },
  {
    id: "passage-order-ch16-3",
    unit: "ch16",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.16 本文第5段落の重要部分を並べ替え：チームは地球表面を約630億個の六角形区画に分割できた。",
    tokens: ["The team", "were able", "to split", "the Earth's surface", "into", "some 63 billion", "hexagonal blocks"],
    answer: "The team were able to split the Earth's surface into some 63 billion hexagonal blocks.",
  },
  {
    id: "passage-order-ch16-4",
    unit: "ch16",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.16 本文第7段落の重要部分を並べ替え：チームは、より正確な台風・大雨予報のためにシステム改善へ取り組む。",
    tokens: ["The team", "will work on", "improving", "the system", "for more accurate", "typhoon and heavy rain forecasting"],
    answer: "The team will work on improving the system for more accurate typhoon and heavy rain forecasting.",
  },
  {
    id: "passage-order-ch18-1",
    unit: "ch18",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.18 本文第2段落の重要部分を並べ替え：総務省は、ロボット車椅子が介護施設で実用化されると見込んでいる。",
    tokens: ["The ministry", "expects", "that robot wheelchairs", "will be put", "to practical use", "in nursing care facilities"],
    answer: "The ministry expects that robot wheelchairs will be put to practical use in nursing care facilities.",
  },
  {
    id: "passage-order-ch18-2",
    unit: "ch18",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.18 本文第4段落の重要部分を並べ替え：計画中のロボット車椅子は、利用者の意図を検知するセンサーを備える。",
    tokens: ["The planned robot wheelchairs", "will have", "sensors", "that detect", "users' intentions"],
    answer: "The planned robot wheelchairs will have sensors that detect users' intentions.",
  },
  {
    id: "passage-order-ch18-3",
    unit: "ch18",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.18 本文第6段落の重要部分を並べ替え：それらには、コンピューターが利用者の意図を認識するシステムが含まれる。",
    tokens: ["They", "include", "a system", "in which", "computers", "recognize", "users' intentions"],
    answer: "They include a system in which computers recognize users' intentions.",
  },
  {
    id: "passage-order-ch18-4",
    unit: "ch18",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.18 本文第8段落の重要部分を並べ替え：複数の車椅子は、利用者が情報を共有できるようネットワークで接続される。",
    tokens: ["Multiple wheelchairs", "will be connected", "by networks", "so that", "their users", "will be able", "to share information"],
    answer: "Multiple wheelchairs will be connected by networks so that their users will be able to share information.",
  },
  {
    id: "passage-order-ch19-1",
    unit: "ch19",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.19 本文第2段落の重要部分を並べ替え：利用者はDNA配列情報に基づいて、生物の種を容易に特定できる。",
    tokens: ["Users", "can easily determine", "the species", "of living objects", "based on", "their DNA sequence information"],
    answer: "Users can easily determine the species of living objects based on their DNA sequence information.",
  },
  {
    id: "passage-order-ch19-2",
    unit: "ch19",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.19 本文第4段落から一文を並べ替え：専門家でさえ、それらを見分けるのは難しい。",
    tokens: ["It", "is difficult", "even for experts", "to distinguish", "between them"],
    answer: "It is difficult even for experts to distinguish between them.",
  },
  {
    id: "passage-order-ch19-3",
    unit: "ch19",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.19 本文第6段落の重要部分を並べ替え：ソフトウェアは、生物のDNA配列をデータベースに保存されたものと比較できる。",
    tokens: ["The software", "can compare", "the DNA sequences", "of living objects", "with those", "stored in DNA databases"],
    answer: "The software can compare the DNA sequences of living objects with those stored in DNA databases.",
  },
  {
    id: "passage-order-ch19-4",
    unit: "ch19",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.19 本文第8段落の重要部分を並べ替え：ソフトウェアは、新種がどの科または属に属するかを特定できる。",
    tokens: ["The software", "can determine", "which families or genera", "new species", "belong to"],
    answer: "The software can determine which families or genera new species belong to.",
  },
].map((question): EnglishQuestion => ({
  ...question,
  format: "order",
  tokens: question.answer.trim().split(/\s+/u),
}));

const PASSAGE_TRANSLATION_QUESTIONS: EnglishQuestion[] = ENGLISH_PASSAGES.flatMap((passage) =>
  passage.paragraphs.map((paragraph, index) => ({
    id: `${passage.id}-translation-${index + 1}`,
    unit: passage.unit,
    group: "長文和訳",
    format: "translation" as const,
    prompt: `次の英文を自然な日本語に訳す：${paragraph.en}`,
    answer: paragraph.ja,
    explanation: `主語・動作・修飾関係を押さえた模範訳です。表現が異なっても、本文の重要な情報が合っていれば正解として扱います。`,
    passageId: passage.id,
  })),
);

function withEnglishQuestionReference(question: EnglishQuestion): EnglishQuestion {
  if (question.reference) return question;
  if (question.format === "order") {
    if (!question.id.startsWith("passage-order-")) return question;
    const passage = ENGLISH_PASSAGES.find((candidate) => candidate.unit === question.unit);
    const paragraphNumber = Number(question.prompt.match(/第(\d+)段落/u)?.[1]);
    const paragraphIndex = paragraphNumber - 1;
    if (!passage || !Number.isInteger(paragraphIndex) || !passage.paragraphs[paragraphIndex]) {
      return question;
    }
    const contextStart = Math.max(0, paragraphIndex - 1);
    const contextEnd = Math.min(passage.paragraphs.length, paragraphIndex + 2);
    const context = passage.paragraphs.slice(contextStart, contextEnd);
    const quote = context.map((paragraph, offset) => {
      const actualIndex = contextStart + offset;
      if (actualIndex !== paragraphIndex) return `${actualIndex + 1}. ${paragraph.en}`;
      const redacted = paragraph.en.includes(question.answer)
        ? paragraph.en.replace(question.answer, "［並べ替え対象文］")
        : "［並べ替え対象文］";
      return `${actualIndex + 1}. ${redacted}`;
    }).join("\n");
    const translation = context
      .map((paragraph, offset) => `${contextStart + offset + 1}. ${paragraph.ja}`)
      .join("\n");
    return {
      ...question,
      reference: {
        label: `${passage.title} 第${paragraphNumber}段落の周辺本文（対象文は伏せています）`,
        quote,
        translation,
      },
    };
  }
  if (!question.passageId) return question;

  const passage = ENGLISH_PASSAGES.find((candidate) => candidate.id === question.passageId);
  if (!passage) return question;
  const sourcePrompt = question.prompt
    .replace(/^次の英文を自然な日本語に訳す：/u, "")
    .trim();
  const paragraphIndex = passage.paragraphs.findIndex((paragraph) => (
    paragraph.en === sourcePrompt
    || paragraph.en.includes(sourcePrompt)
    || sourcePrompt.includes(paragraph.en)
    || paragraph.ja === question.answer
  ));
  const paragraph = paragraphIndex >= 0 ? passage.paragraphs[paragraphIndex] : undefined;
  return {
    ...question,
    reference: {
      label: paragraph
        ? `${passage.title} 第${paragraphIndex + 1}段落`
        : `${passage.title} 本文`,
      quote: paragraph?.en ?? passage.paragraphs.map((item) => item.en).join("\n"),
      translation: paragraph?.ja ?? passage.paragraphs.map((item) => item.ja).join("\n"),
    },
  };
}

const CH14_FINAL_NOTE_TAKING_REFERENCE: EnglishQuestionReference = {
  label: "Chapter 14 最終問題｜Target Genre: Note-taking",
  quote: [
    "About ( 1 ) % of Japan's energy supply comes from oil. The transportation sector, however, uses almost ( 2 ) % oil because there are so many gasoline-powered cars.",
    "Therefore, Japan needs to improve its stable supply of energy. The government's new goal, then, is to reduce the use of oil in the transportation sector to ( 3 ) % by 2030.",
    "Promoting the development of new technology for batteries and building charging stations may lead to the widespread use of electric cars by ( 4 ).",
    "Word bank: 100 / 80 / 50 / 2030 / gasoline-powered / electric",
  ].join("\n"),
  translation: "日本のエネルギー供給の約50％は石油に由来する。しかし輸送部門では、ガソリン車が非常に多いため、ほぼ100％石油を使用している。したがって日本はエネルギーの安定供給体制を改善する必要がある。そこで政府の新しい目標は、2030年までに輸送部門の石油使用割合を80％まで引き下げることである。電池の新技術開発を促進し、充電設備を整備することによって、2030年までに電気自動車が広く普及する可能性がある。",
};

const CH15_FINAL_CONVERSATION_REFERENCE: EnglishQuestionReference = {
  label: "Chapter 15 最終問題｜Target Genre: Corporate profile",
  quote: [
    "Ken: Hi, Eriko, how's the ( 1 ) hunt going? I'm not having much ( 2 ).",
    "Eriko: Hi, Ken. That's too ( 3 ). I'm sure you'll ( 4 ) something soon. Actually, I found a job.",
    "Ken: No way! That's great. ( 5 ) will you work? What ( 6 ) of job is it?",
    "Eriko: I'll be working for Amyris. It's a biotech company that makes products, like cosmetics and fuels, from synthetic ( 7 ).",
    "Ken: Really? That sounds interesting. ( 8 ) do they do that?",
    "Eriko: Well, for example, I'll be working as a ( 9 ) engineer who will design new yeast microbes. I'll then use the new yeast to change plant ( 10 ) into new molecules.",
    "Ken: Wow, that's pretty ( 11 ). Well, I'm really happy for you. Congratulations on your job!",
    "Eriko: Thanks and good luck ( 12 ) a job!",
  ].join("\n"),
  translation: "ケン「やあエリコ、就職活動はどう？僕はなかなかうまくいっていないんだ。」エリコ「やあケン。それは残念。きっとすぐに何か見つかるよ。実は私は仕事が決まったの。」ケン「まさか！すごいね。どこで働くの？どんな仕事？」エリコ「Amyrisで働く予定よ。合成分子から化粧品や燃料などの製品を作るバイオテクノロジー企業なの。」ケン「本当？面白そう。どうやって作るの？」エリコ「例えば、新しい酵母微生物を設計する化学技術者として働くの。その新しい酵母を使い、植物由来の糖を新しい分子に変えるのよ。」ケン「わあ、かなり複雑だね。本当によかった。就職おめでとう！」エリコ「ありがとう。ケンも仕事探し、頑張ってね！」",
};

const CH15_FINAL_COMPLETED_CONVERSATION_REFERENCE: EnglishQuestionReference = {
  ...CH15_FINAL_CONVERSATION_REFERENCE,
  quote: [
    "Ken: Hi, Eriko, how's the job hunt going? I'm not having much luck.",
    "Eriko: Hi, Ken. That's too bad. I'm sure you'll find something soon. Actually, I found a job.",
    "Ken: No way! That's great. Where will you work? What kind of job is it?",
    "Eriko: I'll be working for Amyris. It's a biotech company that makes products, like cosmetics and fuels, from synthetic molecules.",
    "Ken: Really? That sounds interesting. How do they do that?",
    "Eriko: Well, for example, I'll be working as a chemical engineer who will design new yeast microbes. I'll then use the new yeast to change plant sugars into new molecules.",
    "Ken: Wow, that's pretty complicated. Well, I'm really happy for you. Congratulations on your job!",
    "Eriko: Thanks and good luck finding a job!",
  ].join("\n"),
};

const CH14_CH15_FINAL_QUESTIONS: EnglishQuestion[] = [
  ...[
    {
      id: "ch14-final-note-taking-1",
      prompt: "About ( 1 ) % of Japan's energy supply comes from oil. 空欄（1）を写真の語群から選びなさい。",
      answer: "50",
      explanation: "about は概数を示す。50％は日本全体、100％は現在の輸送部門、80％は2030年の輸送部門目標である。",
    },
    {
      id: "ch14-final-note-taking-2",
      prompt: "The transportation sector, however, uses almost ( 2 ) % oil. 空欄（2）を写真の語群から選びなさい。",
      answer: "100",
      explanation: "almost が「ほぼ」を示し、ガソリン車が多いため輸送部門は現在ほぼ100％石油に依存している。",
    },
    {
      id: "ch14-final-note-taking-3",
      prompt: "The government's goal is to reduce the use of oil in the transportation sector to ( 3 ) % by 2030. 空欄（3）を選びなさい。",
      answer: "80",
      explanation: "reduce A to 80% は「Aを結果として80％まで減らす」。reduce A by 80%「80％分減らす」と区別する。",
    },
    {
      id: "ch14-final-note-taking-4",
      prompt: "The new technology may lead to the widespread use of electric cars by ( 4 ). 空欄（4）を選びなさい。",
      answer: "2030",
      explanation: "by + 年で「その年までに」。数値の50・100・80は割合であり、期限を示す空欄には入らない。",
    },
  ].map((item) => ({
    ...item,
    unit: "ch14",
    group: "Note-taking｜本文参照｜配布最終問題",
    format: "choice" as const,
    options: ["100", "80", "50", "2030", "gasoline-powered", "electric"],
    reference: CH14_FINAL_NOTE_TAKING_REFERENCE,
  })),
  ...[
    {
      id: "ch15-final-dialogue-1",
      prompt: "Hi, Eriko, how's the ( 1 ) hunt going? 空欄（1）に入る1語を書きなさい。",
      answer: "job",
      options: ["job", "work", "career", "employment"],
      explanation: "job hunt で「職探し・就職活動」という定型名詞句になる。",
    },
    {
      id: "ch15-final-dialogue-2",
      prompt: "I'm not having much ( 2 ). 空欄（2）に入る1語を書きなさい。",
      answer: "luck",
      options: ["luck", "time", "work", "chance"],
      explanation: "have much luck は「うまくいく、成果がある」。否定文では not have much luck となる。",
    },
    {
      id: "ch15-final-dialogue-3",
      prompt: "That's too ( 3 ). 空欄（3）に入る1語を書きなさい。",
      answer: "bad",
      options: ["bad", "badly", "worse", "sadly"],
      explanation: "That's too bad. は「それは残念」という定型句。be動詞後なので形容詞 bad を置く。",
    },
    {
      id: "ch15-final-dialogue-4",
      prompt: "I'm sure you'll ( 4 ) something soon. 空欄（4）に入る1語を書きなさい。",
      answer: "find",
      options: ["find", "found", "finding", "to find"],
      explanation: "助動詞 will の後は動詞原形。find something で「何かを見つける」。",
    },
    {
      id: "ch15-final-dialogue-5",
      prompt: "( 5 ) will you work? 空欄（5）に入る1語を書きなさい。",
      answer: "Where",
      accepted: ["Where", "where"],
      options: ["Where", "What", "How", "Who"],
      explanation: "勤務場所を尋ねるので Where will you work? とする。",
    },
    {
      id: "ch15-final-dialogue-6",
      prompt: "What ( 6 ) of job is it? 空欄（6）に入る1語を書きなさい。",
      answer: "kind",
      options: ["kind", "kinds", "kindly", "place"],
      explanation: "What kind of + 単数名詞で「どんな種類の～」を表す。",
    },
    {
      id: "ch15-final-dialogue-7",
      prompt: "It makes products, like cosmetics and fuels, from synthetic ( 7 ). 空欄（7）に入る1語を書きなさい。",
      answer: "molecules",
      options: ["molecules", "molecule", "molecular", "microbes"],
      explanation: "synthetic は形容詞で、複数の合成分子を表す名詞複数形 molecules が続く。",
    },
    {
      id: "ch15-final-dialogue-8",
      prompt: "( 8 ) do they do that? 空欄（8）に入る1語を書きなさい。",
      answer: "How",
      accepted: ["How", "how"],
      options: ["How", "What", "Why", "Where"],
      explanation: "直前で述べた製造方法を尋ねるため How do they do that? とする。",
    },
    {
      id: "ch15-final-dialogue-9",
      prompt: "I'll be working as a ( 9 ) engineer who will design new yeast microbes. 空欄（9）に入る1語を書きなさい。",
      answer: "chemical",
      options: ["chemical", "chemistry", "chemically", "mechanical"],
      explanation: "chemical engineer で「化学技術者」。a + 形容詞 + 単数名詞の語順になる。",
    },
    {
      id: "ch15-final-dialogue-10",
      prompt: "I'll use the new yeast to change plant ( 10 ) into new molecules. 空欄（10）に入る1語を書きなさい。",
      answer: "sugars",
      options: ["sugars", "sugared", "sugary", "molecules"],
      explanation: "plant sugars は「植物由来の糖」。change A into B は「AをBに変える」。",
    },
    {
      id: "ch15-final-dialogue-11",
      prompt: "Wow, that's pretty ( 11 ). 空欄（11）に入る1語を書きなさい。",
      answer: "complicated",
      options: ["complicated", "complicate", "complication", "complicating"],
      explanation: "pretty はここでは「かなり」という副詞で、後ろに形容詞 complicated を置く。",
    },
    {
      id: "ch15-final-dialogue-12",
      prompt: "Thanks and good luck ( 12 ) a job! 空欄（12）に入る1語を書きなさい。",
      answer: "finding",
      options: ["finding", "find", "found", "to find"],
      explanation: "good luck doing で「～するのがうまくいくといいね」。動名詞 finding を用いる。",
    },
  ].map((item) => ({
    ...item,
    unit: "ch15",
    group: "会話穴埋め｜本文参照｜配布最終問題",
    format: "input" as const,
    reference: CH15_FINAL_CONVERSATION_REFERENCE,
  })),
  ...[
    {
      id: "ch15-final-corporate-profile-1",
      prompt: "What kind of company is Amyris?",
      options: [
        "A company that creates new plant sugars",
        "A company that makes new molecules",
        "A company that makes advertisements for cosmetics",
        "A company that builds new laboratories",
      ],
      answer: "A company that makes new molecules",
      explanation: "会話の change plant sugars into new molecules が直接の根拠。植物糖は材料であり、作るものは新しい分子である。",
    },
    {
      id: "ch15-final-corporate-profile-2",
      prompt: "Who found a job?",
      options: ["Eriko", "Ken", "Both Eriko and Ken", "Neither person"],
      answer: "Eriko",
      explanation: "Eriko が Actually, I found a job. と述べる。Ken はまだ I'm not having much luck. の状態である。",
    },
    {
      id: "ch15-final-corporate-profile-3",
      prompt: "What kind of job did the person get?",
      options: ["Mechanical engineer", "Plant engineer", "Systems engineer", "Chemical engineer"],
      answer: "Chemical engineer",
      explanation: "Eriko の I'll be working as a chemical engineer. が直接の根拠である。",
    },
  ].map((item) => ({
    ...item,
    unit: "ch15",
    group: "Corporate profile｜本文参照｜配布最終問題",
    format: "choice" as const,
    reference: CH15_FINAL_COMPLETED_CONVERSATION_REFERENCE,
  })),
];

export const CH15_RANGE_QUIZ_SOURCE_IDS = [
  "ch15-range-quiz-translation-1",
  "ch15-range-quiz-translation-2",
  "ch15-range-quiz-translation-3",
  "ch15-range-quiz-vocab-intersection",
  "ch15-range-quiz-vocab-genetic-engineering",
  "ch15-range-quiz-vocab-involve",
  "ch15-range-quiz-vocab-revive",
  "ch15-range-quiz-order-leaning",
  "ch15-range-quiz-order-eyes-closed",
  "ch15-range-quiz-term-petrochemicals",
  "ch15-range-quiz-term-dna-sequence",
] as const;

const CH15_RANGE_QUIZ_QUESTIONS: EnglishQuestion[] = [
  {
    id: "ch15-range-quiz-translation-1",
    unit: "ch15",
    group: "範囲補足小テスト｜和訳",
    format: "translation",
    grading: "japanese-semantic",
    prompt: "次の英文を、挿入部分の働きと数量表現を落とさず自然な日本語に訳しなさい。Newman’s biotech company is creating new organisms, mostly forms of genetically modified yeast, at a dizzying rate of more than 1,500 a day.",
    answer: "ニューマン氏のバイオテクノロジー企業は、主に遺伝子組み換え酵母の形をした新しい生命体を、1日1,500体を超えるめまぐるしい速度で作り出している。",
    accepted: ["ニューマン氏のバイオ企業は、主に遺伝子組み換え酵母の形態である新しい生物を、1日に1500体を超える驚異的な速さで作っている。"],
    options: [
      "ニューマン氏のバイオテクノロジー企業は、主に遺伝子組み換え酵母の形をした新しい生命体を、1日1,500体を超えるめまぐるしい速度で作り出している。",
      "ニューマン氏の企業は、遺伝子組み換え酵母を年間1,500体だけ作っている。",
      "ニューマン氏は、1日に1,500個を超えるアプリを使って酵母を改造している。",
      "ニューマン氏の会社は、遺伝子組み換えを行わずに既存の生命体を保存している。",
    ],
    explanation: "主節は Newman’s biotech company / is creating / new organisms。mostly forms of genetically modified yeast は organisms の中身を同格的に補足し、genetically modified は過去分詞で yeast を修飾します。at a dizzying rate が速度、of more than 1,500 a day がその具体量です。a day は前置詞なしで「1日につき」と訳します。",
    reference: ch15RangeQuizReference(
      "Newman’s biotech company is creating new organisms, mostly forms of genetically modified yeast, at a dizzying rate of more than 1,500 a day.",
      "ニューマン氏のバイオテクノロジー企業は、主に遺伝子組み換え酵母の形をした新しい生命体を、1日1,500体を超えるめまぐるしい速度で作り出している。",
    ),
  },
  {
    id: "ch15-range-quiz-translation-2",
    unit: "ch15",
    group: "範囲補足小テスト｜和訳",
    format: "translation",
    grading: "japanese-semantic",
    prompt: "Some と Others の対比、convert A into B、関係節を保って訳しなさい。Some convert sugar into medicines. Others create moisturizers that can be used in cosmetics.",
    answer: "砂糖を医薬品に変換するものもあれば、化粧品に使用できる保湿剤を作り出すものもある。",
    accepted: ["砂糖を薬に変えるものもあれば、化粧品に使える保湿剤を作るものもある。"],
    options: [
      "砂糖を医薬品に変換するものもあれば、化粧品に使用できる保湿剤を作り出すものもある。",
      "医薬品を砂糖に戻すものと、化粧品を保湿剤として使うものがある。",
      "すべての生命体が砂糖と化粧品から同じ医薬品を作る。",
      "一部の研究者だけが医薬品と化粧品を購入している。",
    ],
    explanation: "Some ... Others ... は「～するものもあれば、別のものは…」という対比です。convert A into B は A を材料、B を変換後の結果として読むため、sugar が材料、medicines が生成物です。that can be used in cosmetics は moisturizers を修飾する関係節で、can be used は助動詞を伴う受動態です。",
    reference: ch15RangeQuizReference(
      "Some convert sugar into medicines. Others create moisturizers that can be used in cosmetics.",
      "砂糖を医薬品に変換するものもあれば、化粧品に使用できる保湿剤を作り出すものもある。",
    ),
  },
  {
    id: "ch15-range-quiz-translation-3",
    unit: "ch15",
    group: "範囲補足小テスト｜和訳",
    format: "translation",
    grading: "japanese-semantic",
    prompt: "数量表現と熟語の意味を保って訳しなさい。Hundreds of products are in the pipeline.",
    answer: "何百もの製品が現在開発中である。",
    accepted: ["何百もの製品が進行中である。", "数百の製品が開発段階にある。"],
    options: [
      "何百もの製品が現在開発中である。",
      "何百本ものパイプの中に製品が入っている。",
      "数百社が完成品を販売している。",
      "製品の開発は数百日後に始まる。",
    ],
    explanation: "Hundreds of + 複数名詞は「何百もの～」。in the pipeline は物理的な配管の中ではなく、「計画・開発が進行中で」という熟語です。主語 products が複数なので be 動詞は are になります。",
    reference: ch15RangeQuizReference(
      "Hundreds of products are in the pipeline.",
      "何百もの製品が現在開発中である。",
    ),
  },
  {
    id: "ch15-range-quiz-vocab-intersection",
    unit: "ch15",
    group: "範囲補足小テスト｜語彙（英→日）",
    format: "input",
    grading: "japanese-semantic",
    prompt: "範囲補足小テスト：intersection の日本語の意味を書きなさい。",
    answer: "交差点、交差する領域",
    accepted: ["交差点", "交点", "交差する領域"],
    options: ["交差点、交差する領域", "遺伝子工学", "～を含む、伴う", "再燃させる"],
    explanation: "intersection は inter-「間で」+ section「切ること」。二本の線が互いに切り合う場所から「交差点・交点」、本文の at the intersection of biology and engineering では「生物学と工学が交わる領域」を表します。",
    reference: ch15RangeQuizReference("Vocabulary: intersection", "交差点、交差する領域"),
  },
  {
    id: "ch15-range-quiz-vocab-genetic-engineering",
    unit: "ch15",
    group: "範囲補足小テスト｜語彙（英→日）",
    format: "input",
    grading: "japanese-semantic",
    prompt: "範囲補足小テスト：genetic engineering の日本語の意味を書きなさい。",
    answer: "遺伝子工学",
    accepted: ["遺伝子工学", "遺伝子操作技術"],
    options: ["遺伝子工学", "交差点、交差する領域", "生物学的安全保障", "化学工学"],
    explanation: "genetic は gene「遺伝子」+ 形容詞語尾 -ic、engineering は設計・操作の技術です。遺伝子を設計・操作する工学分野なので「遺伝子工学」。本文では traditional genetic engineering と新しい手法が対比されます。",
    reference: ch15RangeQuizReference("Vocabulary: genetic engineering", "遺伝子工学"),
  },
  {
    id: "ch15-range-quiz-vocab-involve",
    unit: "ch15",
    group: "範囲補足小テスト｜語彙（英→日）",
    format: "input",
    grading: "japanese-semantic",
    prompt: "範囲補足小テスト：involve の日本語の意味を書きなさい。",
    answer: "～を含む、伴う",
    accepted: ["含む", "伴う", "～を含む", "～を伴う", "関与させる"],
    options: ["～を含む、伴う", "再燃させる", "交換する", "ゼロから作る"],
    explanation: "involve は in-「中へ」+ ラテン語 volvere「巻く」と同系で、対象を物事の中へ巻き込むイメージです。本文の involves swapping a few genes は「少数の遺伝子を入れ替えることを含む」と読みます。",
    reference: ch15RangeQuizReference("Vocabulary: involve", "～を含む、伴う"),
  },
  {
    id: "ch15-range-quiz-vocab-revive",
    unit: "ch15",
    group: "範囲補足小テスト｜語彙（英→日）",
    format: "input",
    grading: "japanese-semantic",
    prompt: "範囲補足小テスト：revive の日本語の意味を書きなさい。",
    answer: "再燃させる、復活させる",
    accepted: ["再燃させる", "復活させる", "よみがえらせる", "再び活発にする"],
    options: ["再燃させる、復活させる", "～を含む、伴う", "変換する", "大変革をもたらす"],
    explanation: "revive は re-「再び」+ viv「生きる」で、再び生命や勢いを与える語です。本文では revive the ethical debate として、生命体を作ることを巡る「倫理的論争を再燃させる」と使われます。",
    reference: ch15RangeQuizReference("Vocabulary: revive", "再燃させる、復活させる"),
  },
  {
    id: "ch15-range-quiz-order-leaning",
    unit: "ch15",
    group: "語順整序｜範囲補足小テスト",
    format: "order",
    prompt: "「ある男の人が壁にもたれかかって立っています。」を並べ替えなさい。写真の印刷語群にある with は、この完成文では使わない。",
    answer: "A man is standing, leaning against the wall.",
    tokens: ["A", "man", "is", "standing,", "leaning", "against", "the", "wall."],
    options: [
      "A man is standing, leaning against the wall.",
      "A man standing, is against leaning the wall.",
      "A man leaning is standing, against the wall.",
      "A man against the is standing, leaning wall.",
    ],
    explanation: "主節は A man / is standing。コンマ後の leaning against the wall は、同じ男性が同時にしている動作を補足する現在分詞句です。lean against + 物で「～にもたれかかる」というまとまりになるため、この構造に with は入りません。",
    reference: ch15RangeQuizReference(
      "並べ替え対象文（日本語）：ある男の人が壁にもたれかかって立っています。 印刷語群：against / standing, / the / is / a man / with / leaning / wall",
      "A man is standing, leaning against the wall.",
    ),
  },
  {
    id: "ch15-range-quiz-order-eyes-closed",
    unit: "ch15",
    group: "語順整序｜範囲補足小テスト",
    format: "order",
    prompt: "「ある男の人が目を閉じて座っています。」を、eyes / sitting / a / man / closed / is / his / with を使って並べ替えなさい。",
    answer: "A man is sitting with his eyes closed.",
    tokens: ["A", "man", "is", "sitting", "with", "his", "eyes", "closed."],
    options: [
      "A man is sitting with his eyes closed.",
      "A man with his eyes is sitting closed.",
      "A man his eyes is sitting with closed.",
      "A man is with his eyes sitting closed.",
    ],
    explanation: "主節は A man / is sitting。with his eyes closed は with + 目的語 his eyes + 補語 closed の付帯状況で、「目が閉じられた状態で」を表します。closed は eyes の状態を説明する過去分詞で、主節の動詞ではありません。",
    reference: ch15RangeQuizReference(
      "並べ替え対象文（日本語）：ある男の人が目を閉じて座っています。 語群：eyes / sitting / a man / closed / is / his / with",
      "A man is sitting with his eyes closed.",
    ),
  },
  {
    id: "ch15-range-quiz-term-petrochemicals",
    unit: "ch15",
    group: "範囲補足小テスト｜専門語（日→英）",
    format: "input",
    prompt: "範囲補足小テスト：「石油化学製品」を英語で書きなさい。",
    answer: "petrochemicals",
    accepted: ["petrochemicals", "petrochemical products"],
    options: ["petrochemicals", "petroleum", "biochemicals", "cosmetics"],
    explanation: "petro- は petroleum「石油」、chemicals は「化学製品」。複数の製品群を指す教材表現なので複数形 petrochemicals を用います。petroleum は石油そのもの、cosmetics は化粧品です。",
    reference: ch15RangeQuizReference("石油化学製品 p__________", "petrochemicals"),
  },
  {
    id: "ch15-range-quiz-term-dna-sequence",
    unit: "ch15",
    group: "範囲補足小テスト｜専門語（日→英）",
    format: "input",
    prompt: "範囲補足小テスト：「DNA配列」を英語で書きなさい。",
    answer: "DNA sequence",
    accepted: ["DNA sequence", "dna sequence"],
    options: ["DNA sequence", "DNA security", "genetic engineering", "gene swap"],
    explanation: "DNA は deoxyribonucleic acid の略、sequence はラテン語 sequi「後に続く」と同系で、要素が順に並ぶ「配列」です。本文では type out a DNA sequence と単数形で使われています。",
    reference: ch15RangeQuizReference("DNA配列 DNA s__________", "DNA sequence"),
  },
];
const ADDITIONAL_CORE_QUESTIONS: EnglishQuestion[] = [
  ...CH15_RANGE_QUIZ_QUESTIONS,
  ...CH14_CH15_FINAL_QUESTIONS,
  {
    id: "ch14-able-disposable",
    unit: "ch14",
    group: "語形・文脈",
    format: "choice",
    prompt: "接尾辞 -able を使う語のうち「使い捨ての」を表すものを選ぶ。",
    options: ["disposable", "erasable", "adjustable", "rechargeable"],
    answer: "disposable",
    explanation: "dispose（処分する）+ -able で、使用後に処分できる「使い捨ての」。他は順に「消せる」「調節可能な」「再充電可能な」。",
  },
  {
    id: "ch14-able-rechargeable",
    unit: "ch14",
    group: "語形・文脈",
    format: "choice",
    prompt: "re- + charge + -able の語形成から「再充電可能な」を表す語を選ぶ。",
    options: ["disposable", "erasable", "adjustable", "rechargeable"],
    answer: "rechargeable",
    explanation: "re- は「再び」、charge は「充電する」、-able は「～できる」。三要素を合わせて「再充電可能な」。",
  },
  {
    id: "passage-order-ch14-1",
    unit: "ch14",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.14 本文第2段落を並べ替え：この計画は、発電の欠点へ対処することで再生可能エネルギーを促進することを目的とする。",
    answer: "The project is aimed at promoting renewable energy by addressing a key defect—inconsistent power generation.",
    tokens: "The project is aimed at promoting renewable energy by addressing a key defect—inconsistent power generation.".split(/\s+/u),
  },
  {
    id: "passage-order-ch14-2",
    unit: "ch14",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.14 本文第3段落を並べ替え：このような電源による電力は国全体の1.6パーセントにすぎない。",
    answer: "The electricity generated by such sources accounts for only 1.6 percent of the nation's total, partly because solar and wind power are affected by the changes in the weather.",
    tokens: "The electricity generated by such sources accounts for only 1.6 percent of the nation's total, partly because solar and wind power are affected by the changes in the weather.".split(/\s+/u),
  },
  {
    id: "passage-order-ch14-3",
    unit: "ch14",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.14 本文第9段落を並べ替え：安全で寿命が10年から20年ある一方、大規模システムへ容易に変換できる。",
    answer: "While it is safe and has a life span of 10 to 20 years, it can be readily converted into a large system, experts say.",
    tokens: "While it is safe and has a life span of 10 to 20 years, it can be readily converted into a large system, experts say.".split(/\s+/u),
  },
  {
    id: "passage-order-ch14-4",
    unit: "ch14",
    group: "語順整序｜本文主要文法",
    format: "order",
    prompt: "Ch.14 本文第10段落を並べ替え：蓄電池の利用で電力会社はグリーンエネルギー電力を10パーセント多く購入できる。",
    answer: "Using such batteries will allow utilities to buy 10 percent more electricity from green energy sources.",
    tokens: "Using such batteries will allow utilities to buy 10 percent more electricity from green energy sources.".split(/\s+/u),
  },
  ...[
    ["ch14-order-bid", "その企業は建設計画の入札を募った。", "The corporation invited bids for the construction project."],
    ["ch14-order-rectify", "この状況を修正するには、かなり時間がかかるだろう。", "It will take quite some time to rectify this situation."],
    ["ch14-order-fluctuation", "その管理者は価格変動の記録を取り続けた。", "The manager kept a record of price fluctuations."],
    ["ch14-order-address", "そのチームは問題に対処する必要があった。", "The team needed to address the issue."],
    ["ch14-order-defect", "助手はプログラムの重大な欠陥を見つけた。", "The assistant found a major defect in the program."],
    ["ch14-order-account", "この国では以前、喫煙者が80パーセントを超えていた。", "In this country, smokers used to account for more than 80%."],
    ["ch14-order-affect", "オゾン層の破壊は環境に影響を及ぼす。", "The destruction of the ozone layer affects the environment."],
    ["ch14-order-favorable", "天気は出航に適している。", "The weather is favorable for sailing."],
    ["ch14-order-dispense", "自動販売機はさまざまな商品を販売する。", "Vending machines dispense a variety of goods."],
    ["ch14-order-cover", "この品物の価格では製造費を補えない。", "The price of this article does not cover the cost of its manufacture."],
    ["ch14-order-development", "新薬の開発には12年から15年かかる。", "The development of a new medicine takes 12 to 15 years."],
    ["ch14-order-called", "その少年はいわゆる天才である。", "The boy is what is called a genius."],
    ["ch14-order-capacity", "この機械には1時間に100個を処理する能力がある。", "This machine has the capacity to process 100 units per hour."],
    ["ch14-order-discharge", "その工場は汚水を排出する。", "The factory discharges polluted water."],
    ["ch14-order-convert", "原本ファイルをPDFに変換してください。", "Convert the original file into a PDF."],
    ["ch14-order-utility", "公共料金の支払いに使えるクレジットカードがある。", "There is a credit card you can use to pay utility bills."],
    ["ch14-order-allow", "その博物館では私たちが写真を撮ることを認めている。", "The museum allows us to take pictures."],
  ].map(([id, prompt, answer]) => ({
    id,
    unit: "ch14",
    group: "語順整序｜追加範囲例文",
    format: "order" as const,
    prompt: "語句を並べ替える：" + prompt,
    answer,
    tokens: answer.split(/\s+/u),
  })),
  ...[
    ["ch14-tf-1", "According to the article, renewable energy is a consistent source of electricity.", "F", "第3段落は天候で発電量が変わるため、再生可能エネルギーの供給はinconsistentだと説明している。"],
    ["ch14-tf-2", "Renewable energy is only a small part of Japan's electricity generation.", "T", "第3段落の約1.6パーセントという割合は、発電全体の小さな一部であることを示す。"],
    ["ch14-tf-3", "The Japanese government is helping to pay for the storage system.", "T", "第5段落は経済産業省が開発・製造費を賄う200億円を拠出したと述べる。"],
    ["ch14-tf-4", "The storage battery system will be housed in six buildings.", "F", "第7段落はシステムの高さをa six-story buildingにたとえており、6棟に収容するとは述べていない。"],
    ["ch14-tf-5", "Sales of renewable energy will probably increase if the batteries are used.", "T", "第10段落は蓄電池により電力会社が再生可能エネルギー電力を10パーセント多く利用できるとする。"],
  ].map(([id, prompt, answer, explanation]) => ({
    id,
    unit: "ch14",
    group: "長文 True / False",
    format: "choice" as const,
    prompt,
    options: ["T", "F"],
    answer,
    explanation,
    passageId: "passage-big-battery",
  })),
  ...[
    ["ch14-summary-1", "Japan is to build the ( ___ ) largest storage battery system in an effort to address a key concern of renewable energy and inconsistent power generation.", ["world's", "country's", "company's", "city's"], "world's"],
    ["ch14-summary-2", "With the ( ___ ) backing, the battery storage system will store energy in good weather and release energy in times of need.", ["government's", "customer's", "expert's", "landlord's"], "government's"],
    ["ch14-summary-3", "( ___ ) battery storage system will store energy in good weather and release energy in times of need.", ["Hokkaido's", "Tokyo's", "Kagoshima's", "Dallas's"], "Hokkaido's"],
    ["ch14-summary-4", "The redox flow battery has a vanadium solution, a life span of up to 20 years, and the ( ___ ) capacity is 60,000 kWh.", ["system's", "weather's", "article's", "building's"], "system's"],
  ].map(([id, prompt, options, answer]) => ({
    id,
    unit: "ch14",
    group: "要約穴埋め",
    format: "choice" as const,
    prompt: prompt as string,
    options: options as string[],
    answer: answer as string,
    explanation: "本文全体の数値・用語を照合すると「" + answer + "」が要約文を正しく完成させる。",
    passageId: "passage-big-battery",
  })),
  {
    id: "ch16-extra-weather-map-order",
    unit: "ch16",
    group: "語順整序｜追加範囲テスト",
    format: "order",
    prompt: "「これはある特定の日の日本の天気図です。」となるように並べ替える。",
    answer: "This is a weather map of Japan on a particular day.",
    tokens: "This is a weather map of Japan on a particular day.".split(/\s+/u),
  },
  ...[
    ["ch16-extra-map", "Researchers have ( ___ ) the genome of a spider for the first time.", ["mapped", "narrowed", "surfaced"], "mapped", "現在完了 have の後なので map の過去分詞 mapped。genome を地図化する比喩で「解読した」。"],
    ["ch16-extra-surface", "The problem started to ( ___ ) in the 1980s.", ["map", "narrow", "surface"], "surface", "start to の後は動詞原形。surface は「表面化する」。"],
    ["ch16-extra-narrow", "High-tech supercomputers could ( ___ ) each block down to 3.5 kilometers.", ["map", "narrow", "surface"], "narrow", "助動詞 could の後は原形で、narrow A down to B「AをBまで狭める」。"],
    ["ch16-extra-formation", "formation の意味を選ぶ。", ["形成", "分割", "六角形の"], "形成", "form（形作る）+ -ation で「形成」。"],
    ["ch16-extra-split", "split（動詞）の意味を選ぶ。", ["分割する", "予測する", "測定する"], "分割する", "一つのものを複数部分へ分ける動詞。"],
    ["ch16-extra-hexagonal", "hexagonal の意味を選ぶ。", ["六角形の", "正方形の", "球状の"], "六角形の", "hexa-「6」+ -gon「角」+ -al「～の」。"],
  ].map(([id, prompt, options, answer, explanation]) => ({
    id,
    unit: "ch16",
    group: "語形・文脈",
    format: "choice" as const,
    prompt,
    options: options as string[],
    answer,
    explanation,
  })),
  ...[
    ["toeic-keller-181", "What would NOT be available to customers who visit Keller Attire's Web site?", ["Shoes to match a suit", "Professional advice", "Images of different styles", "A way to find correct sizes"], "Shoes to match a suit", "サイトには専門家の助言、各スタイルの画像、採寸機能があるが、スーツに合う靴は掲載されていない。"],
    ["toeic-keller-182", "In the advertisement, the word “standard” in paragraph 3, line 1, is closest in meaning to", ["basic", "routine", "average", "affordable"], "basic", "standard deliveryは追加料金のない通常・基本の配送なのでbasicが最も近い。"],
    ["toeic-keller-183", "Why did Mr. Varela write to Ms. Ford?", ["To report a mistake in an advertisement", "To express his concern about a policy", "To invite her to meet his clients", "To praise her company's customer service"], "To praise her company's customer service", "手紙は問題解決時のspotless professionalismを称賛している。"],
    ["toeic-keller-184", "What is suggested about Mr. Varela?", ["He lives in New York", "He is dissatisfied with a service", "He was unable to attend a dinner", "He paid $50 for delivery"], "He paid $50 for delivery", "overnight deliveryは追加50ドルで、彼はそのサービスを選んだと手紙にある。"],
    ["toeic-keller-185", "What problem did Mr. Varela have with the suit he ordered?", ["It did not fit.", "It was the wrong color.", "It was delivered late.", "It arrived at the wrong address."], "It arrived at the wrong address.", "指定したニューヨークではなくダラスの自宅へ配送された。"],
  ].map(([id, prompt, options, answer, explanation]) => ({
    id,
    unit: "toeic",
    group: "長文内容理解",
    format: "choice" as const,
    prompt,
    options: options as string[],
    answer,
    explanation,
    passageId: "passage-keller-attire",
  })),
  ...[
    ["toeic-eston-135", "The event has become a ( ___ ) for local residents.", ["tradition", "traditional", "traditions", "traditionally"], "tradition", "冠詞aの後、前置詞forの前には単数名詞traditionが入る。"],
    ["toeic-eston-136", "( ___ ) takes two to four hours to complete, and a smartphone is required.", ["Another", "Each", "Mine", "It"], "It", "前文のthe ECSHを受けて主語になる代名詞Itが必要。"],
    ["toeic-eston-137", "Which sentence best follows the smartphone requirement?", ["The park map is very detailed.", "City hall was built 75 years ago.", "You will need only one device per team.", "Feedback from participants would be helpful."], "You will need only one device per team.", "smartphone is requiredを受け、チーム当たりの必要台数を補足する。"],
    ["toeic-eston-138", "( ___ ), join your neighbors for refreshments and music in the park.", ["Afterward", "However", "Similarly", "Rather"], "Afterward", "探索終了後の行動なので時間の順序を表すAfterward。"],
  ].map(([id, prompt, options, answer, explanation]) => ({
    id,
    unit: "toeic",
    group: "TOEIC Reading",
    format: "choice" as const,
    prompt,
    options: options as string[],
    answer,
    explanation,
    passageId: "passage-eston-scavenger-hunt",
  })),
  ...[
    ["toeic-part5-104", "Sunnyville Public Library is ( ___ ) today because of a problem with the electrical system.", ["certain", "closed", "returned", "simple"], "closed", "be動詞isの後には状態を表す過去分詞closed「閉館している」が入る。"],
    ["toeic-part5-105", "Ms. Suzuki ( ___ ) as a leader in the Asian financial services industry.", ["recognizes", "recognizing", "is recognized", "has recognized"], "is recognized", "Ms. Suzukiは認められる側なので受動態is recognized as「～として認められている」。"],
    ["toeic-part5-106", "Before meeting with the board, Mr. Ortiz practiced his ( ___ ) several times.", ["presentation", "leader", "seminar", "education"], "presentation", "所有格hisの後でpracticedの目的語になる名詞presentation「発表」が必要。"],
  ].map(([id, prompt, options, answer, explanation]) => ({
    id,
    unit: "toeic",
    group: "語形・文脈",
    format: "choice" as const,
    prompt,
    options: options as string[],
    answer,
    explanation,
  })),
];

export const ENGLISH_QUESTIONS: EnglishQuestion[] = [
  ...ADDITIONAL_CORE_QUESTIONS,
  ...CORE_QUESTIONS,
  ...BUILT_ORDER_QUESTIONS,
  ...PASSAGE_ORDER_QUESTIONS,
  ...VOCAB_QUESTIONS,
  ...REVERSE_VOCAB_QUESTIONS,
  ...PASSAGE_TRANSLATION_QUESTIONS,
]
  .filter(isEnglishPoolItemInScope)
  .map(withEnglishQuestionReference);
