export type EnglishCh18QuizSectionId = "q1" | "q2" | "q3a" | "q3b" | "q3c" | "q4" | "q5";

export type EnglishCh18QuizItem = {
  id: string;
  section: EnglishCh18QuizSectionId;
  prompt: string;
  answer: string;
  accepted: string[];
  explanation: string;
  reference: string;
};

export type EnglishCh18QuizSection = {
  id: EnglishCh18QuizSectionId;
  questionNumber: number;
  subNumber?: number;
  title: string;
  instruction: string;
  source?: string;
  translationFrame?: string;
};

export const ENGLISH_CH18_QUIZ_STORAGE_KEY = "test-grid:english:ch18-quiz18:v1";

export const ENGLISH_CH18_QUIZ_SECTIONS: EnglishCh18QuizSection[] = [
  {
    id: "q1",
    questionNumber: 1,
    title: "英単語",
    instruction: "次の日本語に対応する英単語を書きなさい。冒頭のアルファベットで始めます。",
  },
  {
    id: "q2",
    questionNumber: 2,
    title: "前置詞",
    instruction: "（　）に適切な前置詞を入れなさい。",
    source: "Technologies needed for robot wheelchairs include a system (　　) which computers recognize users’ intentions when the users think about a direction.",
  },
  {
    id: "q3a",
    questionNumber: 3,
    subNumber: 1,
    title: "和訳完成（1）",
    instruction: "英文を読み、和訳の3つの空欄を完成させなさい。",
    source: "While the graying of Japan’s population continues, the ministry expects that robot wheelchairs will be put to practical use in nursing care facilities, where a labor shortage is predicted.",
    translationFrame: "日本の［①］が続く中、総務省は、［②］が予想される介護施設で、ロボット車椅子が［③］ようになると見込んでいる。",
  },
  {
    id: "q3b",
    questionNumber: 3,
    subNumber: 2,
    title: "和訳完成（2）",
    instruction: "英文を読み、和訳の4つの空欄を完成させなさい。",
    source: "In their experiments, wheelchairs have successfully moved short distances and performed simple operations involving home electronic appliances.",
    translationFrame: "［①］では、車椅子は［②］をうまく移動し、また［③］を含む簡単な操作を［④］。",
  },
  {
    id: "q3c",
    questionNumber: 3,
    subNumber: 3,
    title: "和訳完成（3）",
    instruction: "英文を読み、和訳の5つの空欄を完成させなさい。",
    source: "Under the planned system, wheelchairs will calculate current locations and routes to destinations.",
    translationFrame: "［①］の下では、車椅子が［②］の［③］と［④］までのルートを［⑤］。",
  },
  {
    id: "q4",
    questionNumber: 4,
    title: "英語表現の意味",
    instruction: "次の英語表現の日本語の意味を答えなさい。カタカナで答えるのは不可です。",
  },
  {
    id: "q5",
    questionNumber: 5,
    title: "語句整序",
    instruction: "日本語に対応する英文になるよう、（　）内の語句を並べ替えなさい。",
    source: "ユーザーはネットワークを経由して障害物を検知します。\nThe ( a network / detects / user / obstacles / via ).",
  },
];

export const ENGLISH_CH18_QUIZ_ITEMS: EnglishCh18QuizItem[] = [
  {
    id: "ch18-quiz18-q1-1",
    section: "q1",
    prompt: "先端技術　a_______ technology",
    answer: "advanced",
    accepted: ["advanced"],
    reference: "Chapter 18 語彙：advanced technology",
    explanation: "advanced は advance（前へ進む・進歩させる）の過去分詞からできた形容詞で、「進歩した」から「先進的な・先端の」という意味になります。technology を後ろからではなく前から修飾して advanced technology（先端技術）です。advance や advancing のまま書かないこと、語尾を -ed まで入れることが採点点です。",
  },
  {
    id: "ch18-quiz18-q1-2",
    section: "q1",
    prompt: "神経系　n_______ system",
    answer: "nervous",
    accepted: ["nervous"],
    reference: "Chapter 18 語彙：nervous system",
    explanation: "nervous は nerve（神経）に「〜の性質をもつ」を表す -ous が付いた形です。日常会話の nervous は「緊張した」ですが、nervous system では「神経の」という専門的な意味になり、全体で「神経系」です。nerve system と名詞のままにしたり、語尾を -us と誤記したりしないようにします。",
  },
  {
    id: "ch18-quiz18-q2-1",
    section: "q2",
    prompt: "a system (　　) which computers recognize users’ intentions",
    answer: "in",
    accepted: ["in"],
    reference: "Chapter 18 本文：前置詞＋関係代名詞",
    explanation: "先行詞は a system です。後半は computers recognize users’ intentions in the system（コンピューターがそのシステム内で利用者の意図を認識する）という関係なので、the system を which に置き換えて in which とします。which だけでは「そのシステムの中で」という関係が欠けます。where に言い換えられる場合もありますが、実物問題は前置詞だけを入れるため正解は in です。",
  },
  {
    id: "ch18-quiz18-q3a-1",
    section: "q3a",
    prompt: "和訳空欄①：the graying of Japan’s population",
    answer: "日本の人口の高齢化",
    accepted: ["日本の人口の高齢化", "日本人口の高齢化", "人口の高齢化", "高齢化"],
    reference: "Chapter 18 本文 第2段落：While the graying of Japan’s population continues ...",
    explanation: "graying は gray（白髪になる・高齢化する）に -ing が付いた名詞的用法で、the graying of Japan’s population は「日本の人口の高齢化」です。While S + V はここでは同時進行・背景を表し、「〜する一方で」より「〜が続く中」と読むと自然です。単に「白髪化」と直訳せず、population と結び付けて社会の高齢化を表す点が重要です。",
  },
  {
    id: "ch18-quiz18-q3a-2",
    section: "q3a",
    prompt: "和訳空欄②：a labor shortage is predicted",
    answer: "労働力不足",
    accepted: ["労働力不足", "労働力の不足", "人手不足", "人手の不足", "労働者不足", "労働者の不足"],
    reference: "Chapter 18 本文 第2段落：where a labor shortage is predicted",
    explanation: "labor は「労働・労働力」、shortage は short（不足した）と同系で「不足」です。a labor shortage で「労働力不足／人手不足」。where は直前の nursing care facilities を受け、その施設で不足が予想されるという関係です。predicted は受動態なので「（不足を）予測する」ではなく「不足が予想される」とします。",
  },
  {
    id: "ch18-quiz18-q3a-3",
    section: "q3a",
    prompt: "和訳空欄③：will be put to practical use",
    answer: "実用化される",
    accepted: ["実用化される", "実用に供される", "実際に使われる", "実用に使われる", "実用される", "実用化する"],
    reference: "Chapter 18 本文 第2段落：will be put to practical use",
    explanation: "put A to practical use は「Aを実用に供する／実用化する」という定型表現です。ここでは A に当たる robot wheelchairs が主語になった受動態 will be put なので「ロボット車椅子が実用化される」と訳します。expects that ... will ... は「…するようになると見込んでいる」。put を「置く」とだけ訳すと文脈に合いません。",
  },
  {
    id: "ch18-quiz18-q3b-1",
    section: "q3b",
    prompt: "和訳空欄①：In their experiments",
    answer: "彼らの実験",
    accepted: ["彼らの実験", "彼らが行った実験", "その実験", "実験"],
    reference: "Chapter 18 本文 第7段落：In their experiments ...",
    explanation: "In their experiments は文全体の場面を示す前置詞句で「彼らの実験では」です。their は研究者・開発側を指します。in を機械的に「〜の中に」とせず、実験という状況では「〜では」と訳すのが自然です。この前置詞句の後に主節 wheelchairs have ... が続きます。",
  },
  {
    id: "ch18-quiz18-q3b-2",
    section: "q3b",
    prompt: "和訳空欄②：have successfully moved short distances",
    answer: "短い距離",
    accepted: ["短い距離", "短距離", "わずかな距離", "短い距離をうまく移動した", "短距離をうまく移動した", "短い距離を移動することに成功した"],
    reference: "Chapter 18 本文 第7段落：wheelchairs have successfully moved short distances",
    explanation: "short distances は複数形でも、日本語では数え上げず「短い距離／短距離」とします。have moved は現在完了で、実験で達成できた結果を現在につなげています。successfully は success（成功）＋ -ful ＋ -ly で「うまく・成功して」。move を他動詞の「距離を動かした」と誤解せず、車椅子がその距離を移動したと取ります。",
  },
  {
    id: "ch18-quiz18-q3b-3",
    section: "q3b",
    prompt: "和訳空欄③：home electronic appliances",
    answer: "家庭用電気機器",
    accepted: ["家庭用電気機器", "家庭用電気製品", "家庭用電子機器", "家庭用電子製品", "家電", "家電製品", "家庭電化製品"],
    reference: "Chapter 18 本文 第7段落：operations involving home electronic appliances",
    explanation: "appliance は「（特定用途の）器具」で、home electronic appliances は「家庭用電気機器／家電製品」です。involving は現在分詞で直前の simple operations を説明し、「家電を含む・家電に関わる簡単な操作」となります。home を「家」、electronic を「電子的」と一語ずつ不自然に並べず、まとまりで訳します。",
  },
  {
    id: "ch18-quiz18-q3b-4",
    section: "q3b",
    prompt: "和訳空欄④：have ... performed simple operations",
    answer: "行った",
    accepted: ["行った", "実行した", "操作した", "行うことに成功した", "実行することに成功した", "行うことができた"],
    reference: "Chapter 18 本文 第7段落：have successfully moved ... and performed ...",
    explanation: "performed は perform（実行する・行う）の過去分詞です。have が moved と performed の両方にかかり、have successfully [moved ...] and [performed ...] という並列です。したがって「移動し、簡単な操作を行った（ことに成功した）」となります。performed を舞台の「演じた」と訳すのは、operations との組み合わせに合いません。",
  },
  {
    id: "ch18-quiz18-q3c-1",
    section: "q3c",
    prompt: "和訳空欄①：Under the planned system",
    answer: "計画されたシステム",
    accepted: ["計画されたシステム", "計画中のシステム", "予定されているシステム", "予定されたシステム", "その計画されたシステム"],
    reference: "Chapter 18 本文 第9段落：Under the planned system ...",
    explanation: "planned は plan の過去分詞が形容詞として system を修飾し、「計画された／計画中のシステム」です。Under は物理的な「下」ではなく、制度・方式のもとでという意味で、句全体は「計画されたシステムのもとでは」となります。planning system（計画を立てるシステム）とは意味が異なります。",
  },
  {
    id: "ch18-quiz18-q3c-2",
    section: "q3c",
    prompt: "和訳空欄②：current（current locations の前半）",
    answer: "現在",
    accepted: ["現在", "今", "現時点", "現在の"],
    reference: "Chapter 18 本文 第9段落：current locations",
    explanation: "current はラテン語の「走る・流れる」に由来し、「流れている」から「現在の」という意味になりました。current location で「現在地」です。この文脈では名詞の current（電流・流れ）ではなく、locations を修飾する形容詞なので「現在の」と訳します。",
  },
  {
    id: "ch18-quiz18-q3c-3",
    section: "q3c",
    prompt: "和訳空欄③：locations（current locations の後半）",
    answer: "位置",
    accepted: ["位置", "場所", "所在地", "現在地"],
    reference: "Chapter 18 本文 第9段落：current locations",
    explanation: "location は locate（位置を定める）と同系で「位置・場所」です。current locations 全体なら「現在位置／現在地」。原文が複数形でも、日本語では車椅子ごとの位置をまとめて自然に「位置」とできます。location を destination（目的地）と取り違えないことがポイントです。",
  },
  {
    id: "ch18-quiz18-q3c-4",
    section: "q3c",
    prompt: "和訳空欄④：destinations",
    answer: "目的地",
    accepted: ["目的地", "行き先", "到着地", "目的の場所"],
    reference: "Chapter 18 本文 第9段落：routes to destinations",
    explanation: "destination は destine（行き先を定める）と同系で「目的地・行き先」です。routes to destinations は「目的地までのルート」。to は到達点を示します。current locations が出発側、destinations が到着側なので、この2語を逆にしないよう対で覚えます。",
  },
  {
    id: "ch18-quiz18-q3c-5",
    section: "q3c",
    prompt: "和訳空欄⑤：will calculate",
    answer: "計算する",
    accepted: ["計算する", "算出する", "割り出す", "計算で求める", "導き出す", "算定する"],
    reference: "Chapter 18 本文 第9段落：wheelchairs will calculate current locations and routes ...",
    explanation: "calculate は「計算する・算出する」で、目的語は [current locations] and [routes to destinations] の2つです。will は計画中のシステムで将来行うことを表します。日本語では位置や経路を「割り出す」とすると自然です。routes だけに calculate がかかると読み落とさないよう、and の左右を確認します。",
  },
  {
    id: "ch18-quiz18-q4-1",
    section: "q4",
    prompt: "uneven",
    answer: "でこぼこのある／平らでない",
    accepted: ["でこぼこのある／平らでない", "でこぼこのある", "でこぼこした", "でこぼこな", "凹凸のある", "凹凸がある", "平らでない", "段差のある", "段差がある", "不均一な", "むらのある"],
    reference: "Chapter 18 語彙：uneven",
    explanation: "even には「平らな・均一な」という意味があり、反対を作る接頭辞 un- が付いた uneven は「平らでない、でこぼこのある、不均一な」です。カタカナ読みでは意味を答えたことになりません。本文の車椅子の走行環境では、uneven ground/surface のような物理的な凹凸を表す訳が特に適切です。",
  },
  {
    id: "ch18-quiz18-q4-2",
    section: "q4",
    prompt: "predict",
    answer: "予測する／予想する",
    accepted: ["予測する／予想する", "予測する", "予想する", "予見する", "予測", "予想", "見越す"],
    reference: "Chapter 18 語彙：predict",
    explanation: "predict は pre-（前もって）＋ dict（言う）から成り、文字どおり「前もって言う」から「予測する・予想する」です。本文の is predicted では受動態になり「予想される」。名詞 prediction や形容詞 predictable と語形を混同せず、ここでは動詞の原形 predict を日本語で答えます。",
  },
  {
    id: "ch18-quiz18-q5-1",
    section: "q5",
    prompt: "The ( a network / detects / user / obstacles / via ).",
    answer: "The user detects obstacles via a network.",
    accepted: ["The user detects obstacles via a network.", "The user detects obstacles via a network"],
    reference: "Chapter 18 語順整序：The user detects obstacles via a network.",
    explanation: "英文の骨格は The user（主語）＋ detects（動詞）＋ obstacles（目的語）です。主語 user は三人称単数なので detect ではなく detects。via a network は「ネットワークを経由して」という手段を表す前置詞句で、目的語の後ろに置きます。via の直後には名詞句 a network が必要です。語順は SVO＋手段となり、The user detects obstacles via a network. です。",
  },
];

export const ENGLISH_CH18_QUIZ_TOTAL_POINTS = ENGLISH_CH18_QUIZ_ITEMS.length;
