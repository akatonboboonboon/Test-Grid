import {
  ENGLISH_PASSAGES,
  ENGLISH_QUESTIONS,
} from "./english-data";
import type { EnglishQuestion } from "./english-data";

export type EnglishReadingOptionExplanation = {
  option: string;
  isCorrect: boolean;
  reason: string;
};

export type EnglishReadingExplanation = {
  questionId: string;
  reference: {
    label: string;
    passageId?: string;
    paragraphNumbers: number[];
    english: string;
  };
  naturalTranslation: string;
  correctReason: string;
  optionAnalysis?: EnglishReadingOptionExplanation[];
  readingTip?: string;
};

type ExplanationSeed = {
  passageId?: string;
  paragraphNumbers?: number[];
  referenceLabel?: string;
  referenceEnglish?: string;
  naturalTranslation?: string;
  correctReason: string;
  optionReasons?: Record<string, string>;
  readingTip?: string;
};

type TranslationGuidance = {
  correctReason: string;
  readingTip: string;
};

const PASSAGE_TRANSLATION_GUIDANCE: Record<string, TranslationGuidance> = {
  "passage-amyris-translation-1": {
    correctReason: "For scientist Jack Newman は『ニューマン氏にとって』という判断の立場を示す。creating a new life-form が主語、has become が述語で、as simple as this の内容をコロン以後の types out と clicks が具体化している。",
    readingTip: "コロンの前を結論、後ろを具体例として読む。type out は単なる type ではなく『文字として打ち込む』。",
  },
  "passage-amyris-translation-2": {
    correctReason: "Nearby in the laboratory は場所を示す副詞句で、主語は robotic arms。start to mix together が動作、to produce the desired cells は目的を表す不定詞なので、『目的の細胞を作るために化合物を混ぜ始める』となる。",
    readingTip: "desired は『望んでいる』ではなく、cells を修飾する過去分詞形容詞『目的の』。",
  },
  "passage-amyris-translation-3": {
    correctReason: "主語は Newman’s biotech company、述語は is creating。mostly forms of genetically modified yeast は organisms の中心的な中身を補足し、at a dizzying rate of more than 1,500 a day が生産速度を示す。",
    readingTip: "more than 1,500 a day は『1日に1,500を超える』であり、総数ではない。",
  },
  "passage-amyris-translation-4": {
    correctReason: "Some、Others、still others が『～するものもあれば…』という三つの並列を作る。that can be used in cosmetics は moisturizers を、a renewable energy source usually made from corn は biofuel を説明する。",
    readingTip: "convert A into B を『AをBに変える』と取り、medicine・moisturizer・biofuel の三用途を落とさない。",
  },
  "passage-amyris-translation-5": {
    correctReason: "the same way (that) you might build an app は『アプリを作るのと同じように』という比較であり、アプリを使って細胞を作るという意味ではない。said Newman 以下は引用の話者と肩書を示す。",
    readingTip: "the same way を手段と誤読しない。might は可能性というより、たとえを柔らかくする働き。",
  },
  "passage-amyris-translation-6": {
    correctReason: "Some believe の目的語は this kind of work marks ... 以下全体。ダッシュ後の one は a third industrial revolution を言い換え、based on using living systems as biofactories がその革命の基盤を説明する。too tricky or too expensive to ... は substances を後ろから修飾する。",
    readingTip: "grow in nature と make with petrochemicals の二つを、too tricky or too expensive の共通の対象として並列に読む。",
  },
  "passage-amyris-translation-7": {
    correctReason: "主語 The rush to biological means of production に対し、promises to revolutionize / transform と、but 以下の raises / revives が対比される。技術の利益だけでなく、安全性・安全保障・倫理という問題も述べる文である。",
    readingTip: "questions about A and B と debates about C を分け、playing God は直訳調の『神を演じること』という倫理表現として扱う。",
  },
  "passage-amyris-translation-8": {
    correctReason: "Since it was founded a decade ago が起点を示し、Amyris has become ... と現在完了で現在までの変化を述べる。creating more than 3 million new organisms は付帯状況・実績を補足する分詞句である。",
    readingTip: "at the intersection of biology and engineering は物理的交差点ではなく『生物学と工学が交わる分野』。",
  },
  "passage-amyris-translation-9": {
    correctReason: "Unlike traditional genetic engineering が対比の基準。which typically involves swapping a few genes は traditional genetic engineering を説明し、本文の scientists はそれとは異なり entire genomes を from scratch で構築している。",
    readingTip: "a few genes と entire genomes、swapping と building from scratch の二組の対比を押さえる。",
  },
  "passage-weather-translation-1": {
    correctReason: "A group of scientists が主語、have created が述語。using the K computer は手段、ダッシュで囲まれた Japan’s fastest ... は K computer の同格説明、that could help ... は detailed cloud map の効用を示す。",
    readingTip: "that の先行詞を supercomputer ではなく cloud map と捉えると、『地図が予報に役立つ』という論理が通る。",
  },
  "passage-weather-translation-2": {
    correctReason: "With a cloud map は『雲地図を用いると』。is divided と are predicted の二つの受動態が骨格で、which are essential factors ... は Cloud formation and movements を補足する。based on は予測の根拠を示す。",
    readingTip: "each block は各区画であり、雲そのものを区画に分けるのではない。",
  },
  "passage-weather-translation-3": {
    correctReason: "computers at meteorological institutions が主語。such as the Japan Meteorological Agency は機関の例、measuring 20 km by 20 km は squares の寸法を示す分詞句である。",
    readingTip: "divide A into B は『AをBに分ける』。20 km by 20 km は『20km四方』。",
  },
  "passage-weather-translation-4": {
    correctReason: "Previous attempts to use high-tech supercomputers が主語で、have been able to narrow ... down to が述語。to use ... は attempts の内容、down to 3.5 kilometers は区画をその大きさまで細かくしたことを示す。",
    readingTip: "narrow down to は数値が小さくなる改善を表し、『3.5kmだけ狭くした』ではない。",
  },
  "passage-weather-translation-5": {
    correctReason: "By using the K computer が手段、the team were able to split ... and successfully reproduced ... が二つの成果。with each block spaced only 870 meters apart は各区画の間隔を補足する。63 billion が修飾するのは cloud movements ではなく hexagonal blocks。",
    readingTip: "split A into B、with + 名詞 + 過去分詞、reproduce cloud movement の三構造を順に処理する。",
  },
  "passage-weather-translation-6": {
    correctReason: "When 節が試験を行った状況を示し、主節の the cloud map showed ... が結果。to reproduce cloud movement は tested the system の目的で、across the entire globe は雲の範囲を示す。",
    readingTip: "Typhoon No. 15 in August 2012 を一まとまりの固有の事例として訳す。",
  },
  "passage-weather-translation-7": {
    correctReason: "will work on improving が今後の取り組み、for more accurate ... forecasting が目的。as there has been an increase ... は理由を示し、『自然災害が増えているため』とつなぐ。",
    readingTip: "work on の後は動名詞 improving。such natural disasters は直前の typhoons and heavy rain を受ける。",
  },
  "passage-wheelchair-translation-1": {
    correctReason: "The ... Ministry said の目的語が it aims ... 以下。which は robot wheelchairs を修飾し、detect users’ intentions と automatically move が並列。from their brain waves は検知元、in line with the users’ will は移動が意志に沿うことを示す。",
    readingTip: "it は ministry を受ける。read users’ minds という題名表現を、本文では detect intentions from brain waves と具体化している。",
  },
  "passage-wheelchair-translation-2": {
    correctReason: "While 節は高齢化が続く状況を示す。expects that 以下が総務省の見込みで、will be put to practical use は受動態。where は nursing care facilities を受け、そこで labor shortage が予想されると補足する。",
    readingTip: "graying を人口増加とせず『高齢化』、put to practical use を『実用化する』と取る。",
  },
  "passage-wheelchair-translation-3": {
    correctReason: "In cooperation with ... が協力相手を列挙し、the ministry aims to put ... が主節。possibly in 2017 は実用化時期の見込みを表す。",
    readingTip: "三つの協力相手 research institutes / telecommunications companies / machinery manufacturers を落とさない。",
  },
  "passage-wheelchair-translation-4": {
    correctReason: "主語 The planned robot wheelchairs、述語 will have。that detect ... は sensors を修飾し、by analyzing ... が検知方法を示す。moving automatically は車椅子がその結果自動で動くことを補足する。",
    readingTip: "analyzing の目的語は brain waves と nervous system activity の両方。",
  },
  "passage-wheelchair-translation-5": {
    correctReason: "have studied は現在完了で、これまで研究してきたことを示す。needed for the robot wheelchairs は technologies を後ろから修飾する過去分詞句である。",
    readingTip: "needed の主語を institutions と誤認せず、『車椅子に必要とされる技術』とまとめる。",
  },
  "passage-wheelchair-translation-6": {
    correctReason: "They は前文の technologies を受ける。a system in which ... が技術の具体例で、if users think about the directions が認識の条件。二つ目の in which は directions を受け、『進みたい方向』を表す。",
    readingTip: "for example right or left は directions の例。which が二度出るため先行詞をそれぞれ確認する。",
  },
  "passage-wheelchair-translation-7": {
    correctReason: "have successfully moved と performed が並列で、実験で既に達成した二つの成果を表す。short distances は移動距離、involving home electronic appliances は operations の内容を説明する。",
    readingTip: "successfully は moved だけでなく、文脈上二つの実験成果全体にかかる。",
  },
  "passage-wheelchair-translation-8": {
    correctReason: "plans to establish が計画、in which ... は telecommunication technology の内容。multiple wheelchairs will be connected が受動態で、so that 以下が目的・結果として情報共有を示す。",
    readingTip: "車椅子を物理的に連結するのではなく、by networks によるネットワーク接続。about の後の obstacles and uneven surfaces が共有情報の内容。",
  },
  "passage-wheelchair-translation-9": {
    correctReason: "Under the planned system が条件・枠組みを示し、wheelchairs will calculate が骨格。目的語は current locations と routes to destinations の二つである。",
    readingTip: "routes to destinations は『目的地そのもの』ではなく『目的地までの経路』。",
  },
  "passage-wheelchair-translation-10": {
    correctReason: "The latest information ... が長い主語で、will be sent が受動態。that have passed ... は wheelchairs を、that avoid danger は routes を修飾する。to help them choose ... は送信の目的を示す。",
    readingTip: "them は other wheelchairs、より自然にはその利用者を含む『ほかの車椅子側』を指すと理解する。",
  },
  "passage-dna-translation-1": {
    correctReason: "A group of researchers at Kyoto University が主語、has developed が述語。that can prevent ... は DNA barcoding software の機能を説明し、farm products and seafood が不当表示の対象である。",
    readingTip: "fraudulent mislabeling は単なる誤記ではなく『悪質な／不正な表示』。",
  },
  "passage-dna-translation-2": {
    correctReason: "Utilizing ... は主節の users を意味上の主語とする分詞構文で、『ソフトを利用することで』。determine the species of living objects ができること、based on ... が判断根拠を示す。",
    readingTip: "species は単複同形。ここでは各生物の『種』を特定する意味。",
  },
  "passage-dna-translation-3": {
    correctReason: "主語は The development of the software で、was announced は受動態。in the U.S. scientific research journal PLOS ONE が発表媒体を示す。",
    readingTip: "software itself ではなく『ソフトウェアの開発』が発表された。",
  },
  "passage-dna-translation-4": {
    correctReason: "第1文は二種のマグロの prices が drastically different。第2文は if they are used in cooking が条件で、it is difficult even for experts to distinguish between them が結果を述べる。",
    readingTip: "they / them は二種のマグロを受ける。even for experts により、調理後の判別の難しさを強調している。",
  },
  "passage-dna-translation-5": {
    correctReason: "If you use this software が条件、you can easily detect mislabeling が結果。said Akifumi Tanabe 以下が引用の話者で、who played the central role ... は田辺氏の役割を補足する。",
    readingTip: "play the central role in ... は『～で中心的役割を果たす』。",
  },
  "passage-dna-translation-6": {
    correctReason: "The researchers が主語、created が述語。including ... は研究者の範囲を補足し、that can compare A with B は software の機能。those stored in DNA databases の those は DNA sequences を指す。",
    readingTip: "compare A with B のAは実物由来の配列、Bはデータベース保存済みの配列。",
  },
  "passage-dna-translation-7": {
    correctReason: "By comparing ... が手段、the software can automatically determine ... が主節。the species the tissue came from は関係語が省略された形で、『その組織が由来する種』を意味する。",
    readingTip: "came from の主語は tissue。製品そのものではなく組織の由来種を判定する。",
  },
  "passage-dna-translation-8": {
    correctReason: "Even in the case of new species が譲歩的条件。determine の目的語として which families or genera they belong to と which existing species they are related to の二つの間接疑問が並列する。",
    readingTip: "they は new species。family と genus は分類階級、existing species は既知の種。",
  },
  "passage-dna-translation-9": {
    correctReason: "Databases が主語、have been released が現在完了の受動態。that store ... は databases を修飾し、including fungi and viruses は約288,000種に含まれる例を示す。",
    readingTip: "in Japan, the United States and Europe はデータベースの公開地域であり、専門家の所属地域ではない。",
  },
  "passage-dna-translation-10": {
    correctReason: "To date が現在までの範囲を示し、the work ... has mostly depended on ... が骨格。to determine ... は work の内容で、which species living organisms belong to は determine の目的語となる間接疑問である。",
    readingTip: "depend on A and B のAは experts’ knowledge、Bは their experience。mostly は『主に』で、完全に・唯一ではない。",
  },
};

const STATIC_EXPLANATION_SEEDS: Record<string, ExplanationSeed> = {
  "ch15-tf-1": {
    passageId: "passage-amyris",
    paragraphNumbers: [3, 8, 9],
    correctReason: "本文はAmyrisが遺伝子組み換え酵母を中心とする新しい生命体を大量に作り、創業以来300万を超える生命体を生み、従来と異なりゲノム全体をゼロから構築していると説明する。記事の中心はまさに『新しい生命体を作るバイオ企業の紹介』なのでT。",
    readingTip: "main purpose は一文だけでなく、記事全体で繰り返される主語・話題を確認する。",
  },
  "ch15-tf-2": {
    passageId: "passage-amyris",
    paragraphNumbers: [5],
    correctReason: "本文は build a cell the same way you might build an app と比較しているだけで、iPhoneアプリを使用して細胞を作るとは述べていない。設問は『同じように』を『アプリを使って』へすり替えているためF。",
    readingTip: "the same way は類似性、by using は手段。言い換えで前置詞関係が変わっていないかを見る。",
  },
  "ch15-tf-3": {
    passageId: "passage-amyris",
    paragraphNumbers: [7],
    correctReason: "本文は environmental safety と bio-security に関する疑問を生み、playing God をめぐる ethical debates を再燃させると明記する。ethical and environmental questions という設問はその要約なのでT。",
    readingTip: "raises questions と revives debates は否定的影響を列挙する合図。",
  },
  "ch16-tf-1": {
    passageId: "passage-weather",
    paragraphNumbers: [1],
    correctReason: "科学者グループがK computerを用いて詳細な雲地図を作り、それが台風や大雨のより正確な予報に役立つ可能性があると本文にある。supercomputer と predict the weather の関係が一致するためT。",
    readingTip: "help provide more accurate forecasts は help predict the weather の具体化。",
  },
  "ch16-tf-2": {
    passageId: "passage-weather",
    paragraphNumbers: [2],
    correctReason: "Cloud formation and movements は weather forecasts における essential factors と明記されている。『雲の形成は予報で考慮すべき重要事項』という設問は本文と一致するためT。",
    readingTip: "essential factors を important to consider と言い換えている。",
  },
  "ch16-tf-3": {
    passageId: "passage-weather",
    paragraphNumbers: [5],
    correctReason: "約630億なのは地球表面を分割した hexagonal blocks の数であり、cloud movements の数ではない。設問は数値が修飾する名詞をすり替えているためF。",
    readingTip: "数値問題では数字だけでなく、直後・直前の単位と被修飾語をセットで照合する。",
  },
  "ch16-tf-4": {
    passageId: "passage-weather",
    paragraphNumbers: [2, 5],
    correctReason: "本文は各小区画の atmospheric conditions に基づき雲の形成・動きを予測すると説明し、K computer が区画を約870m間隔まで細分化したと述べる。小地域の気象情報を使うという設問はこの内容の妥当な要約なのでT。",
    readingTip: "設問が複数段落をまとめている場合、方法の説明と装置の具体的成果をつなげて読む。",
  },
  "ch16-tf-5": {
    passageId: "passage-weather",
    paragraphNumbers: [6, 7],
    correctReason: "第6段落で台風15号を使って system を tested したこと、第7段落で今後 system を improving すると述べている。過去の試験と将来の改良の両方が一致するためT。",
    readingTip: "was tested と will be improved に対応する時制表現を別々の段落から拾う。",
  },
  "ch19-tf-1": {
    passageId: "passage-dna",
    paragraphNumbers: [1, 2, 5],
    correctReason: "記事の中心は食品偽装を防ぎ、DNAから種を容易に特定できる新ソフトウェアの開発と機能である。消費者への警告を主目的とする記事ではないためF。",
    readingTip: "warn customers という行為主体・目的は本文にない。タイトルと第1段落で記事の主題を確認する。",
  },
  "ch19-tf-2": {
    passageId: "passage-dna",
    paragraphNumbers: [6, 7],
    correctReason: "本文は植物・魚など実物由来のDNA配列を、DNA databases に stored された配列と compare すると説明する。設問は比較の二項を正しく言い換えているためT。",
    readingTip: "those stored in DNA databases の those が DNA sequences を指すことを押さえる。",
  },
  "ch19-tf-3": {
    passageId: "passage-dna",
    paragraphNumbers: [5],
    correctReason: "田辺氏はソフトウェアを使えば mislabeling を easily detect できると明言する。『不当表示食品を見つけやすくなる』という設問と一致するためT。",
    readingTip: "easily detect と easier to find は品詞を変えた同義の言い換え。",
  },
  "ch19-tf-4": {
    passageId: "passage-dna",
    paragraphNumbers: [8],
    correctReason: "本文は新種であっても、どの families or genera に属するかを判定できると述べる。family も検出できるという設問は明記された機能なのでT。",
    readingTip: "Even in the case of new species が新種にも機能が及ぶことを示す。",
  },
  "ch19-tf-5": {
    passageId: "passage-dna",
    paragraphNumbers: [9, 10],
    correctReason: "日米欧はDNAデータベースが公開された地域であり、専門家の国籍・所在地ではない。また本文は識別作業が mostly experts’ knowledge and experience に依存したと述べるだけで、『その三地域の専門家だけ』とは限定していないためF。",
    readingTip: "隣接段落の情報を混ぜた誤文に注意する。only は本文の mostly より強い限定。",
  },
  "ch18-read-1": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [1, 4],
    correctReason: "本文は車椅子が users’ intentions を their brain waves と nervous system activity の分析によって検知すると説明する。設問の commands は intentions の言い換えなので their brain waves が正解。",
    optionReasons: {
      "their voices": "音声認識についての記述はなく、検知元は脳波と神経系活動。",
      "their brain waves": "本文の detect users’ intentions from their brain waves と直接一致する。",
      "their hands": "手の動きや手動操作を読むとは書かれていない。",
      "their helpers": "介助者から指示を受けるのではなく、利用者本人の意図を検知する。",
    },
    readingTip: "設問の commands と本文の intentions のような同義言い換えを見抜く。",
  },
  "ch18-read-2": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [7],
    correctReason: "実験で成功したのは short distances の移動と、home electronic appliances に関わる simple operations。選択肢では operating home electronic appliances が後者を正しく言い換えている。",
    optionReasons: {
      "traveling a long distance": "本文は short distances であり、long は反対。",
      "connecting with each other": "複数車椅子のネットワーク接続は将来計画で、実験成功事項ではない。",
      "operating home electronic appliances": "performed simple operations involving home electronic appliances と一致する。",
      "receiving information from users": "利用者の意図検知は開発機能だが、この実験結果として列挙された成功事項ではない。",
    },
    readingTip: "During the trial に対応する In their experiments の段落だけを根拠にする。",
  },
  "ch18-read-3": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [8, 10],
    correctReason: "ネットワーク接続された車椅子の利用者は obstacles and uneven surfaces の情報を共有し、危険を避ける経路選択に使う。share data concerning uneven paths が一致する。",
    optionReasons: {
      "move obstacles": "障害物の情報を共有するのであり、障害物自体を動かすとは書かれていない。",
      "physically link together": "by networks による通信接続であって、車椅子を物理的に連結するのではない。",
      "calculate the cheapest route": "計算するのは目的地までの経路で、最安経路という費用条件はない。",
      "share data concerning uneven paths": "uneven surfaces について share information するという本文と一致する。",
    },
    readingTip: "本文語 uneven surfaces が選択肢では uneven paths / data concerning ... に言い換えられている。",
  },
  "ch18-translation-1": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [2],
    correctReason: "While は高齢化が続く状況、expects that は総務省の見込み、will be put to practical use は実用化、where 以下は介護施設で労働力不足が予測されることを表す。これらをすべて保つ第1選択肢が正解。",
    optionReasons: {
      "日本の高齢化が続く中、総務省は、労働力不足が予想される介護施設でロボット車椅子が実用化されると見込んでいる。": "graying、expects、put to practical use、where 以下を過不足なく訳している。",
      "日本の人口が増える中、総務省は介護施設の閉鎖を予想している。": "graying を人口増加と誤訳し、実用化を施設閉鎖へ置き換えている。",
      "労働力不足が解消したので、車椅子の研究は中止された。": "labor shortage is predicted は不足の解消ではなく予測。研究中止の記述もない。",
      "介護施設はロボット車椅子を海外へ輸出する予定である。": "主語・動作とも本文にない。期待しているのは総務省で、内容は施設での実用化。",
    },
    readingTip: "where の先行詞 nursing care facilities を先に確定すると修飾関係を崩しにくい。",
  },
  "ch18-translation-2": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [7],
    correctReason: "have successfully moved と performed が並列し、short distances と simple operations involving home electronic appliances がそれぞれの内容。二つの成功事項を正しく訳した第1選択肢が正解。",
    optionReasons: {
      "実験では、車椅子は短距離の移動に成功し、家庭電化製品に関わる簡単な操作を行った。": "原文の二つの動作と修飾語を正確に保持している。",
      "車椅子は長距離を移動したが、家電の操作には失敗した。": "short を long に反転し、successfully performed を失敗へ変えている。",
      "家庭電化製品が車椅子を短距離だけ運んだ。": "主語は wheelchairs。家電は operations が関わる対象で、車椅子を運ぶ主体ではない。",
      "実験は家庭ではなく研究所だけで行われた。": "実験場所の対比は本文にない。home は home electronic appliances の一部。",
    },
    readingTip: "and で結ばれた moved / performed を同じ主語 wheelchairs につなぐ。",
  },
  "ch18-translation-3": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [9],
    correctReason: "Under the planned system は計画中の仕組みの下で、will calculate の目的語は current locations と routes to destinations。両方を正確に訳した第1選択肢が正解。",
    optionReasons: {
      "計画中のシステムでは、車椅子が現在地と目的地までの経路を計算する。": "文の主語・動詞・二つの目的語を正確に訳している。",
      "利用者が現在地を忘れた場合だけ目的地を変更する。": "利用者が忘れる条件も目的地変更も本文にない。",
      "計画では目的地の位置を人が毎回入力する。": "入力操作や人間主体の記述はなく、車椅子が計算する。",
      "車椅子は現在地の情報を計算せず共有する。": "calculate を否定して share に変えており、本文と逆。",
    },
    readingTip: "routes to destinations を『目的地の経路』ではなく『目的地までの経路』と自然に処理する。",
  },
  "ch19-abstract-method": {
    referenceLabel: "設問文",
    referenceEnglish: "The survey was completed in 2012 and all interviews were conducted over the telephone.",
    naturalTranslation: "調査は2012年に完了し、すべての面接は電話で行われた。",
    correctReason: "調査の実施時期と、面接を電話で行ったというデータ収集手順を述べる文である。研究で『何をどのように行ったか』に当たるため② 実験の方法。",
    optionReasons: {
      "① 研究の背景・目的": "研究の必要性や目的を示す表現がなく、実施手順を述べている。",
      "② 実験の方法": "調査時期と面接手段という具体的な方法が示されている。",
      "③ 実験結果": "得られた数値・傾向・差などの結果は提示されていない。",
      "④ 結論": "結果の解釈や最終的主張を述べていない。",
    },
    readingTip: "was completed / were conducted のような実施動詞と、年・手段はMethodsの典型的な手掛かり。",
  },
  "ch19-abstract-purpose": {
    referenceLabel: "設問文",
    referenceEnglish: "The purpose of this study is to examine the effects of indoor heating on pets.",
    naturalTranslation: "本研究の目的は、室内暖房がペットに与える影響を調べることである。",
    correctReason: "The purpose of this study is to ... と研究目的を直接宣言しているため、① 研究の背景・目的。",
    optionReasons: {
      "① 研究の背景・目的": "purpose という明示語により研究目的だと判断できる。",
      "② 実験の方法": "対象や測定・実施手順は説明されていない。",
      "③ 実験結果": "何が判明したかという結果がない。",
      "④ 結論": "結果に基づく解釈・提言ではなく、これから調べる目的を述べる。",
    },
    readingTip: "purpose / aim / objective / investigate は背景・目的を見分ける主要語。",
  },
  "ch19-meaning-drastically": {
    passageId: "passage-dna",
    paragraphNumbers: [4],
    correctReason: "Prices ... are drastically different は二種のマグロの価格差が非常に大きいことを述べる。drastically は変化・差の程度が著しいことを表す副詞なので『大幅に』。",
    optionReasons: {
      "大幅に": "drastically の文脈に合う基本義。",
      "自動的に": "automatically の意味。",
      "現在まで": "to date の意味。",
      "不正に": "fraudulently に近い意味で、drastically ではない。",
    },
    readingTip: "different を修飾しているので、方法ではなく差の程度を表す副詞を選ぶ。",
  },
  "ch19-meaning-existing": {
    passageId: "passage-dna",
    paragraphNumbers: [8],
    correctReason: "new species と対比され、関連先として existing species が挙げられている。新種に対する『すでに存在する／既存の種』という意味なので『既存の』。",
    optionReasons: {
      "既存の": "new species と対比される existing の正しい意味。",
      "絶滅した": "extinct の意味で、existing とは反対方向。",
      "実験中の": "experimental / under experiment に相当し、本文の分類関係とは無関係。",
      "悪質な": "fraudulent の意味。",
    },
    readingTip: "同じ文の new と existing の対比を語義推定に使う。",
  },
  "ch19-meaning-distinguish": {
    passageId: "passage-dna",
    paragraphNumbers: [4],
    correctReason: "distinguish between them は、調理された二種のマグロを見分けること。したがって『見分ける、区別する』。",
    optionReasons: {
      "見分ける、区別する": "distinguish (between A and B) の正しい意味。",
      "蓄積する": "store / accumulate の意味。",
      "依存する": "depend on の意味。",
      "発表する": "announce の意味。",
    },
    readingTip: "distinguish between A and B を一まとまりで覚える。",
  },
  "ch15-summary-1": {
    passageId: "passage-amyris",
    paragraphNumbers: [3, 8],
    naturalTranslation: "そのバイオ企業は、コンピューターとロボットを使って300万を超える新しい生命体を作り出してきた。",
    correctReason: "空欄の直後に目的語 over 3 million new organisms があるため他動詞が必要。本文の creating more than 3 million new organisms と意味も一致する created が正解。",
    optionReasons: {
      arisen: "arise は『生じる』という自動詞で、生命体を目的語に取れない。",
      been: "been だけでは目的語を取れず、『生命体を作った』という意味にならない。",
      become: "become は補語を取る連結動詞で、new organisms を作る意味では使えない。",
      created: "create + 目的語で『生命体を作り出す』となり、本文の実績と一致する。",
    },
    readingTip: "has の後の過去分詞だけでなく、空欄後が目的語か補語かを確認する。",
  },
  "ch15-summary-2": {
    passageId: "passage-amyris",
    paragraphNumbers: [8, 9],
    naturalTranslation: "その企業は、新しい種類の遺伝子工学を象徴する存在になった。",
    correctReason: "本文の Amyris has become a legend を a symbol に言い換えた要約。企業自身が象徴的存在へ『なった』という変化を表す become が意図された正解。",
    optionReasons: {
      arisen: "arise は自動詞だが a symbol を補語としてこの形では取れず、has arisen a symbol は不成立。",
      been: "has been a symbol は文法上可能だが、『以前から象徴だった』という状態になり、本文の has become が示す変化を失う。",
      become: "become + 名詞補語で『象徴になった』となり、本文の has become a legend に対応する。",
      created: "has created a symbol なら『象徴を作った』となり、企業自身が象徴になったという本文と主語・意味関係が異なる。",
    },
    readingTip: "この設問は been も文単独では成立し得るため、本文の has become という表現を決め手にする。",
  },
  "ch15-summary-3": {
    passageId: "passage-amyris",
    paragraphNumbers: [7],
    naturalTranslation: "新しい生命体を作ることの倫理性をめぐって批判が存在してきた。",
    correctReason: "標準的な存在構文 there has been + 名詞で『批判があった』とする問題。本文の raises questions と revives ethical debates を criticism にまとめている。",
    optionReasons: {
      arisen: "there has arisen criticism も非常に硬い文体では成立し得るが、この語群問題では通常の存在構文 there has been が想定され、arisen は第4問の Hope has arisen に対応する。",
      been: "there has been criticism は最も自然な存在構文で、批判・論争があることを表す。",
      become: "there has become criticism はこの意味では不自然で、become の補語構造にも合わない。",
      created: "there has created criticism では created の主語がなく、受動なら has been created が必要。",
    },
    readingTip: "文単独の可能性だけでなく、4問共通の語群を一度ずつ使う対応関係も確認する。",
  },
  "ch15-summary-4": {
    passageId: "passage-amyris",
    paragraphNumbers: [6, 7],
    naturalTranslation: "化学産業に新たな革命が起こるという期待が生まれている。",
    correctReason: "Hope が自ら『生じる』という自動詞 arise の現在完了 has arisen が自然。第三次産業革命の始まり、化学産業を変革する見込みという本文を要約している。",
    optionReasons: {
      arisen: "Hope has arisen で『期待が生じた』となり、意味・文型とも一致する。",
      been: "Hope has been for ... は文脈次第で状態を表せるが、この文の『期待が生まれた』という変化と本文の展開に合わない。",
      become: "become は後ろに名詞・形容詞補語を必要とし、for 句だけでは意図した構造にならない。",
      created: "Hope を作られたものとして表すなら has been created が必要で、has created では Hope が何かを作る主語になる。",
    },
    readingTip: "arise は目的語を取らず、『問題・希望・必要性などが生じる』でよく使う。",
  },
  "ch18-summary-1": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [1],
    naturalTranslation: "総務省はロボット車椅子の開発を開始する計画である。",
    correctReason: "本文の aims to start a project to develop ... を、plans to start developing ... と言い換えたもの。start + 動名詞で『開発を始める』となる。",
    optionReasons: {
      share: "share developing という連結は不自然で、共有対象となる名詞もない。",
      connect: "connect developing は文型不成立で、ネットワーク接続は別の計画。",
      start: "start developing で『開発を始める』となり本文と一致する。",
      recognize: "recognize developing では『開発中だと認識する』に近く、計画開始の意味にならない。",
    },
    readingTip: "plan to + 動詞、start + 動名詞という二段構造を確認する。",
  },
  "ch18-summary-2": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [1, 4, 6],
    naturalTranslation: "車椅子は利用者の指示を認識し、自動的に動く。",
    correctReason: "本文の computers recognize users’ intentions と detect users’ intentions を commands に要約している。目的語 commands と自然に結び付く recognize が正解。",
    optionReasons: {
      share: "指示を他者と共有する機能ではなく、利用者の意図を認識する機能。",
      connect: "connect commands では接続先がなく、車椅子同士の接続とも別内容。",
      start: "start their commands は文型・意味とも不自然。",
      recognize: "recognize users’ commands で『利用者の指示を認識する』となり本文と一致する。",
    },
    readingTip: "intentions / commands、detect / recognize の言い換え関係を見る。",
  },
  "ch18-summary-3": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [8],
    naturalTranslation: "総務省はネットワークを使って複数の車椅子を接続することを目指している。",
    correctReason: "本文の multiple wheelchairs will be connected by networks を能動態で要約した文。connect A using networks が正しい。",
    optionReasons: {
      share: "share multiple wheelchairs では車椅子を共同所有する意味になり、ネットワーク接続ではない。",
      connect: "connect multiple wheelchairs using networks が本文の受動表現を正しく能動化している。",
      start: "start multiple wheelchairs は車椅子を始動させる意味になり、相互接続を表さない。",
      recognize: "複数の車椅子を認識することが計画の目的ではない。",
    },
    readingTip: "本文の受動態 be connected by networks を、要約の connect A using networks に変換する。",
  },
  "ch18-summary-4": {
    passageId: "passage-wheelchair",
    paragraphNumbers: [8, 10],
    naturalTranslation: "ネットワークによって、利用者は危険な場所についての情報を共有できる。",
    correctReason: "本文の users will be able to share information about obstacles and uneven surfaces、および危険場所の最新情報を他車椅子へ送る説明に対応する。share information が正解。",
    optionReasons: {
      share: "share information で『情報を共有する』となり本文の表現と一致する。",
      connect: "connect information だけでは何と何を接続するか不足し、本文の情報共有を表せない。",
      start: "start information という目的語関係は不自然。",
      recognize: "情報を認識することではなく、利用者間で共有することがネットワークの目的。",
    },
    readingTip: "enable A to do の do に入る動詞を、本文の同じ目的語 information から判断する。",
  },
  "ch19-summary-1": {
    passageId: "passage-dna",
    paragraphNumbers: [1, 5],
    naturalTranslation: "このソフトウェアは、誤って表示された食品を検出できる。",
    correctReason: "本文の fraudulent mislabeling と detect mislabeling を incorrectly labeled foods に言い換えている。labeled を修飾し『誤って表示された』とする incorrectly が正解。",
    optionReasons: {
      automatically: "『自動的に表示された食品』となり、不当表示という検出対象を表さない。",
      already: "『すでに表示された食品』だけでは表示が正しいか誤りかを示さない。",
      incorrectly: "incorrectly labeled で『誤って／不正に表示された』となり mislabeling に対応する。",
      commonly: "『一般によく表示される食品』となり、偽装・誤表示の意味がない。",
    },
    readingTip: "空欄は過去分詞 labeled を修飾する副詞。本文語 mislabeling を分解して言い換える。",
  },
  "ch19-summary-2": {
    passageId: "passage-dna",
    paragraphNumbers: [6],
    naturalTranslation: "それは実物のDNA配列を、データベースにすでに保存されている配列と比較する。",
    correctReason: "those stored in DNA databases は保存済みの配列を指す。要約では sequences already stored とし、stored の時点が比較より前であることを already で明示する。",
    optionReasons: {
      automatically: "本文で自動的なのは種の判定であり、配列が自動保存されたとは述べない。",
      already: "already stored で『すでに保存されている』となり、データベース既存配列を表す。",
      incorrectly: "配列が誤って保存されているという記述はなく、照合の信頼性とも逆。",
      commonly: "一般的に保存されるという頻度ではなく、比較時点で保存済みであることが要点。",
    },
    readingTip: "those stored ... の過去分詞修飾を、sequences already stored ... に展開した要約。",
  },
  "ch19-summary-3": {
    passageId: "passage-dna",
    paragraphNumbers: [7],
    naturalTranslation: "ソフトウェアは製品の種を自動的に検出する。",
    correctReason: "本文に the software can automatically determine the species とそのままある。detects を修飾して方法を表す automatically が正解。",
    optionReasons: {
      automatically: "本文の automatically determine に直接対応し、ソフトによる自動判定を示す。",
      already: "『すでに検出する』では時間関係が不自然で、自動機能という本文の要点を表さない。",
      incorrectly: "誤って検出するのではなく、偽装を正しく見破るためのソフト。",
      commonly: "通常検出するという頻度ではなく、自動で処理する方法が述べられている。",
    },
    readingTip: "determine と detect はここでは『種を特定する』という近い意味で置き換えられている。",
  },
  "ch19-summary-4": {
    passageId: "passage-dna",
    paragraphNumbers: [10],
    naturalTranslation: "その作業は一般に、専門家の知識と経験に頼ってきた。",
    correctReason: "本文の has mostly depended on を、選択肢中で最も近い has commonly depended on に言い換えたもの。歴史的に専門家依存が通常だったという要約なので commonly。",
    optionReasons: {
      automatically: "自動依存という意味になり、従来は人間の専門知識に頼ったという本文と合わない。",
      already: "『すでに依存した』は完了時点を示すだけで、mostly の『主として』を表せない。",
      incorrectly: "専門家に頼ることが誤りだったとは本文は評価していない。",
      commonly: "mostly と完全な同義ではないが、選択肢中では『通常・一般に専門家へ依存してきた』という要約に最も近い。",
    },
    readingTip: "この問題では本文の mostly に完全一致する語がない。語調を強めすぎず、最も近い頻度副詞を選ぶ。",
  },
};

const PASSAGE_TRANSLATION_SEEDS: Record<string, ExplanationSeed> = Object.fromEntries(
  ENGLISH_PASSAGES.flatMap((passage) =>
    passage.paragraphs.flatMap((_, index) => {
      const questionId = `${passage.id}-translation-${index + 1}`;
      const guidance = PASSAGE_TRANSLATION_GUIDANCE[questionId];
      if (!guidance) return [];
      return [[
        questionId,
        {
          passageId: passage.id,
          paragraphNumbers: [index + 1],
          correctReason: guidance.correctReason,
          readingTip: guidance.readingTip,
        } satisfies ExplanationSeed,
      ]];
    }),
  ),
);

const ALL_EXPLANATION_SEEDS: Record<string, ExplanationSeed> = {
  ...STATIC_EXPLANATION_SEEDS,
  ...PASSAGE_TRANSLATION_SEEDS,
};

export const ENGLISH_READING_EXPLANATION_GROUPS = [
  "長文 True / False",
  "長文内容理解",
  "和訳",
  "長文和訳",
  "要約穴埋め",
  "Abstract構成",
  "英→日",
] as const;

const TARGET_GROUP_SET = new Set<string>(ENGLISH_READING_EXPLANATION_GROUPS);
const PASSAGE_BY_ID = new Map(ENGLISH_PASSAGES.map((passage) => [passage.id, passage]));

function isReadingExplanationTarget(question: EnglishQuestion) {
  return Boolean(question.passageId) || TARGET_GROUP_SET.has(question.group);
}

const TARGET_QUESTIONS = ENGLISH_QUESTIONS.filter(isReadingExplanationTarget);

export const ENGLISH_READING_EXPLANATION_TARGET_IDS = TARGET_QUESTIONS.map(
  (question) => question.id,
);

export const ENGLISH_READING_EXPLANATION_MISSING_IDS =
  ENGLISH_READING_EXPLANATION_TARGET_IDS.filter(
    (questionId) => !ALL_EXPLANATION_SEEDS[questionId],
  );

function isTrueFalseQuestion(question: EnglishQuestion) {
  return question.options?.length === 2
    && question.options.includes("T")
    && question.options.includes("F");
}

export const ENGLISH_READING_EXPLANATION_OPTION_GAPS = TARGET_QUESTIONS.flatMap(
  (question) => {
    if (!question.options || isTrueFalseQuestion(question)) return [];
    const reasons = ALL_EXPLANATION_SEEDS[question.id]?.optionReasons;
    return question.options
      .filter((option) => !reasons?.[option])
      .map((option) => `${question.id}::${option}`);
  },
);

function getReference(seed: ExplanationSeed) {
  const paragraphNumbers = seed.paragraphNumbers ?? [];
  if (seed.passageId) {
    const passage = PASSAGE_BY_ID.get(seed.passageId);
    const paragraphs = paragraphNumbers
      .map((number) => passage?.paragraphs[number - 1])
      .filter((paragraph): paragraph is { en: string; ja: string } => Boolean(paragraph));
    return {
      label: seed.referenceLabel
        ?? `本文 第${paragraphNumbers.join("・")}段落`,
      passageId: seed.passageId,
      paragraphNumbers,
      english: paragraphs.map((paragraph) => paragraph.en).join(" "),
      japanese: paragraphs.map((paragraph) => paragraph.ja).join(" "),
    };
  }

  return {
    label: seed.referenceLabel ?? "設問文",
    passageId: undefined,
    paragraphNumbers,
    english: seed.referenceEnglish ?? "",
    japanese: "",
  };
}

export const ENGLISH_READING_EXPLANATION_REFERENCE_GAPS = TARGET_QUESTIONS.flatMap(
  (question) => {
    const seed = ALL_EXPLANATION_SEEDS[question.id];
    if (!seed) return [];
    const reference = getReference(seed);
    return reference.english && (seed.naturalTranslation || reference.japanese)
      ? []
      : [question.id];
  },
);

function trueFalseOptionReason(
  question: EnglishQuestion,
  option: string,
  correctReason: string,
) {
  if (option === question.answer) {
    return `${option}が正しい。${correctReason}`;
  }
  return `正答は${question.answer}であるため、${option}は選べない。${correctReason}`;
}

function materializeExplanation(
  question: EnglishQuestion,
  seed: ExplanationSeed,
): EnglishReadingExplanation {
  const reference = getReference(seed);
  const optionAnalysis = question.options?.map((option) => ({
    option,
    isCorrect: option === question.answer,
    reason: seed.optionReasons?.[option]
      ?? trueFalseOptionReason(question, option, seed.correctReason),
  }));

  return {
    questionId: question.id,
    reference: {
      label: reference.label,
      passageId: reference.passageId,
      paragraphNumbers: reference.paragraphNumbers,
      english: reference.english,
    },
    naturalTranslation: seed.naturalTranslation ?? reference.japanese,
    correctReason: seed.correctReason,
    optionAnalysis,
    readingTip: seed.readingTip,
  };
}

export const ENGLISH_READING_EXPLANATIONS: Record<string, EnglishReadingExplanation> =
  Object.fromEntries(
    TARGET_QUESTIONS.flatMap((question) => {
      const seed = ALL_EXPLANATION_SEEDS[question.id];
      return seed ? [[question.id, materializeExplanation(question, seed)]] : [];
    }),
  );

export const ENGLISH_READING_EXPLANATION_UNUSED_IDS = Object.keys(
  ALL_EXPLANATION_SEEDS,
).filter((questionId) => !ENGLISH_READING_EXPLANATION_TARGET_IDS.includes(questionId));
