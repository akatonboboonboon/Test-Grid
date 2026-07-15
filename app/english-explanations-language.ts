import { ENGLISH_QUESTIONS, type EnglishQuestion } from "./english-data";

const EXACT_LANGUAGE_GROUPS = new Set([
  "語彙・熟語（日→英）",
  "語彙・熟語（英→日）",
  "英→日",
  "単数形",
  "語形・文脈",
  "時間・単位",
  "前置詞＋関係代名詞",
]);

export function isLanguageStudyQuestion(question: EnglishQuestion) {
  return EXACT_LANGUAGE_GROUPS.has(question.group)
    || question.group.startsWith("語順整序｜")
    || question.group.includes("単数")
    || question.group.includes("複数")
    || question.group.includes("意味");
}

function detail(parts: string[]) {
  return parts.join("\n");
}

const SPECIAL_EXPLANATIONS: Record<string, string> = {
  "ch15-prep-1": detail([
    "【意味・構造】8 hours a day で「1日8時間」。回数・量 + a day/week/month は、それだけで「1日／週／月につき」を表します。",
    "【正解】空欄には何も置きません。works 8 hours が勤務時間、a day が頻度を付け加えています。",
    "【誤答】per は per day の形なら使えますが per a day とはしません。by は by the day、in は「～の中で」の意味になるため、この a day の前には置けません。",
    "【覚え方】数字 + times/hours + a + 単位を一つの型として覚えます。",
  ]),
  "ch15-prep-2": detail([
    "【意味・構造】2,000 yen per week は「週につき2,000円」。per は「～ごとに」で、冠詞を伴わない単位名詞の前に置きます。",
    "【正解】per。costs 2,000 yen が料金、per week が料金の単位です。",
    "【誤答】前置詞なしなら a week が必要です。by は by the week なら「週単位で」、at は価格の単位を導けません。",
    "【比較】a week / per week / by the week はいずれも可能ですが、冠詞と前置詞を混ぜないことが重要です。",
  ]),
  "ch15-prep-3": detail([
    "【意味・構造】get paid by the hour は「時間給で支払われる」。by the + 単位は、測定・計算・支払いの基準を示す定型表現です。",
    "【正解】by。受動表現 get paid に、支払い基準 by the hour が続きます。",
    "【誤答】per を使うなら per hour であり per the hour にはしません。前置詞なしの the hour はつながらず、for the hour は「その1時間の間」の意味です。",
    "【覚え方】paid by the hour、sold by the kilo のように by the + 計量単位でまとめます。",
  ]),
  "ch15-prep-4": detail([
    "【意味・構造】twice a month で「月2回」。頻度を表す twice と a month が直接結び付きます。",
    "【正解】前置詞なし。is published が受動態、twice a month が出版頻度です。",
    "【誤答】per を使うなら twice per month とし、per a month とはしません。by a month と on a month は頻度表現になりません。",
    "【覚え方】once a day、twice a month、three times a year を同じ語順で覚えます。",
  ]),
  "ch16-word-1": detail([
    "【意味・文型】narrow A down to B は「AをBまで狭める」。could の後なので動詞原形 narrow が入ります。",
    "【正解】narrow。each block が目的語、down to 3.5 kilometers が到達した細かさを示します。",
    "【誤答】map は「地図化する」ですが map A down to B という縮小の型にはなりません。surface は自動詞で「表面化する」で、目的語 each block を取れません。",
    "【覚え方】候補を絞る narrow the choices down to three と同じ型です。",
  ]),
  "ch16-word-2": detail([
    "【意味・文型】surface は自動詞で「表面に出る、問題が明らかになる」。start to の後は動詞原形です。",
    "【正解】surface。The problems が主語なので「問題が表面化し始めた」という自然な意味になります。",
    "【誤答】map は通常「～を地図化する」という他動詞、narrow は「～を狭める」という他動詞で、この文の problems を主語にした意味に合いません。",
    "【覚え方】名詞 surface「表面」から、動詞 surface「表面に出る」を連想します。",
  ]),
  "ch16-word-3": detail([
    "【意味・活用】map は「地図化する、対応関係を明らかにする」。have の後には過去分詞が必要です。",
    "【正解】mapped。map は短母音 + 1子音字で終わるため、語尾の p を重ねて map–mapped–mapped とします。",
    "【文法】Researchers have mapped ... は現在完了で、「研究者たちが初めてゲノムを解析・地図化した」という完了結果を表します。",
    "【注意】maped は綴り誤り、mapping も have の直後には置けません。",
  ]),
  "ch18-relative-1": detail([
    "【構造】a system in which computers recognize users' intentions は「コンピューターが利用者の意図を認識するシステム」。in which 以下が system を説明します。",
    "【正解】in。元の関係は computers recognize ... in the system なので、the system を which に替えて前置詞を前へ出すと in which です。",
    "【言い換え】a system where computers ... とも言えますが、問題は which の前の前置詞を問うため in が必要です。",
    "【覚え方】場所そのものだけでなく、system・situation・case のような「枠組みの中で」にも in which を使います。",
  ]),
  "ch18-relative-2": detail([
    "【構造】telecommunication technology in which multiple wheelchairs will be connected は「複数の車椅子が接続される通信技術」。in which 節全体が technology を修飾します。",
    "【正解】in。車椅子がその技術・仕組みの中で接続される、という関係を作ります。",
    "【文法】which は先行詞 technology を受け、will be connected は未来の受動態です。主節の動詞は後ろの enables です。",
    "【注意】by which なら「その技術によって」という手段を強調しますが、教材本文は仕組みの中での接続を表す in which です。",
  ]),
  "ch19-meaning-drastically": detail([
    "【意味・品詞】drastically は副詞で「大幅に、劇的に」。形容詞 drastic「抜本的な」に副詞語尾 -ally が付いた形です。",
    "【正解理由】prices are drastically different なら「価格が大幅に異なる」となり、程度を表す副詞として different を修飾します。",
    "【誤答】automatically は「自動的に」、to date は「現在まで」、fraudulently は「不正に」で、いずれも変化・差の大きさを表しません。",
    "【覚え方】drastic change「劇的な変化」→ change drastically「劇的に変化する」と品詞を対で覚えます。",
  ]),
  "ch19-meaning-existing": detail([
    "【意味・品詞】existing は形容詞で「既存の、現存する」。動詞 exist「存在する」に -ing が付き、名詞の前で状態を表します。",
    "【正解理由】existing species は「すでに存在している種、既存種」です。",
    "【誤答】extinct は「絶滅した」、experimental は「実験上の」、malicious は「悪質な」で、存在しているという中心義がありません。",
    "【覚え方】exist「存在する」→ existence「存在」→ existing「存在している」を語族で結びます。",
  ]),
  "ch19-meaning-distinguish": detail([
    "【意味・品詞】distinguish は動詞で「見分ける、区別する」。distinguish A from B で「AとBを区別する」です。",
    "【正解理由】外見が似た二種類を識別する文脈なので「見分ける、区別する」が合います。",
    "【誤答】accumulate は「蓄積する」、depend on は「依存する」、announce は「発表する」で、比較対象を識別する意味になりません。",
    "【覚え方】distinct「別個の、はっきり異なる」と同じ語族として覚えます。",
  ]),
  "ch19-singular-1": detail([
    "【正解】families の単数形は family。",
    "【活用】子音字 + y で終わる名詞は、複数形で y を i に替えて -es を付けます。family → families、逆変換では -ies → -y です。",
    "【注意】familie は英語の単数形ではありません。生物分類では family が「科」を表します。",
  ]),
  "ch19-singular-2": detail([
    "【正解】species の単数形は species。",
    "【活用】species は単数・複数が同形の名詞です。one species / many species のどちらでも綴りは変わりません。",
    "【見分け方】数は冠詞・数量詞と動詞で判断します。This species is ... / These species are ... のように一致させます。",
  ]),
  "ch19-singular-3": detail([
    "【正解】fungi の単数形は fungus。",
    "【活用】fungus はラテン語系の複数形 fungi を取ります。語尾 -i を機械的に -us に戻すのではなく、fungus–fungi を一組で覚えます。",
    "【発音・記憶】綴りの対をカード化し、one fungus / several fungi と数量表現ごと練習すると定着します。",
  ]),
  "ch19-singular-4": detail([
    "【正解】genera の単数形は genus。",
    "【活用】genus は「属」、genera はその不規則な複数形です。英語の通常の -s 複数ではありません。",
    "【関連語】生物分類では family「科」→ genus「属」→ species「種」の順で範囲が狭くなります。",
  ]),
};

const ORDER_GUIDANCE: Record<string, string> = {
  "order-04": "The man を主語、built を動詞、his business を目的語にし、句動詞 build ... up を作ります。from scratch「ゼロから」は方法・出発点を表すため文末に置きます。",
  "order-05": "The game + is watched で受動態を作り、行為者を by millions of people で示します。millions of は必ず of と一緒に数量表現として扱います。",
  "order-06": "倍数比較は twice as + 形容詞 + as の固定語順です。This room is が骨格、that room が比較対象です。",
  "order-07": "had to の後は動詞原形 modify。目的語 the height of the table の後に、目的を表す to make it fit を置きます。",
  "order-08": "This firm manufactures cars が主節です。割合は at the rate of + 数量、単位は per day の順で後置します。",
  "order-09": "If you convert A into B で条件節を作り、主節は直接疑問文 how many minutes does that make? の語順にします。",
  "order-10": "The woman + built up + a large fortune の第3文型です。build up は「徐々に築き上げる」という句動詞で、目的語を後ろに置けます。",
  "order-11": "give + 人 + 物の第4文型で gave us a detailed explanation とし、explanation of the project が内容を示します。",
  "order-12": "複数主語 Grasslands に動詞 cover を続けます。分数は one third of、所有格 Earth's が surface を限定します。",
  "order-13": "命令文 Make sure の後に、目的語となる節 your facts are accurate を通常の平叙文語順で置きます。",
  "order-14": "The event has been postponed で現在完了受動態です。延期先 to tomorrow、理由 due to heavy rain の順に情報を加えます。",
  "order-15": "The class was divided into groups が受動態の骨格です。用途・目的を for a group project で後置します。",
  "order-16": "Volcanic activity が主語、led to が動詞句です。the formation of the Hawaiian Islands を目的語にし、時を文末に置きます。",
  "order-17": "Economic stability is a crucial factor が主節。for a country's development が「何にとっての要素か」を説明します。",
  "order-18": "形式主語 It + be + 形容詞 + to do の型です。while riding a bicycle は while you are riding ... を縮めた副詞節です。",
  "order-19": "The doctor's decision was based on ... で「決定は～に基づいた」という受動表現を作ります。test results は複合名詞です。",
  "order-20": "We need to reduce が主語・動詞の骨格。atmospheric は形容詞として carbon dioxide levels の前に置きます。",
  "order-21": "measure はこの文では「寸法が～ある」という連結動詞です。The pool measures + 数量 + deep の語順になります。",
  "order-22": "助動詞 should の後は動詞原形 narrow。your topic が目的語、for the presentation が目的を示します。",
  "order-23": "split the check は「勘定を割る」の定型表現です。We should + 動詞原形、for this meal はどの食事の勘定かを示します。",
  "order-24": "have no intention of doing が「～する意向がない」の型です。of は前置詞なので getting と動名詞を続けます。",
  "order-25": "be in line with を分割せず一つの述語として置き、each other を with の目的語にします。",
  "order-26": "The system uses machine learning が主節。目的を表す to predict の後に目的語 weather patterns を置きます。",
  "order-27": "want to put A into practical use で「Aを実用に移す」。A に当たる the English sentences には関係節 that I memorized が付きます。",
  "order-28": "The students are learning が現在進行形。目的語は the importance of cooperation という名詞のまとまりです。",
  "order-29": "aim to do の型で aim to be とし、補語 the top athletes、範囲 in the world を続けます。",
  "order-30": "recognize + 人 + from + 手掛かりで「～から人を見分ける」。instantly は recognized を修飾する副詞です。",
  "order-31": "will の後に動詞原形 perform。perform surgery が「手術を行う」、on the patient's heart が手術対象です。",
  "order-32": "decide to do の型で decided to share。the workload が目的語、evenly が分担の仕方を示す副詞です。",
  "order-33": "The user detects obstacles が主語・動詞・目的語。via a network は「ネットワーク経由で」という手段を表す前置詞句です。",
  "order-34": "The case included が主節。a number of + 複数名詞を使い、different kinds of fraud を一まとまりにします。",
  "order-35": "主節は The publisher halted the release of the book。when 節では found の内容を the author had lied ... と過去完了で示します。",
  "order-36": "The employee was dismissed で受動態。理由は due to、fraudulent は形容詞として activities を前から修飾します。",
  "order-37": "determine の目的語は間接疑問 what kind of car it is。間接疑問では疑問文の is it ではなく平叙文語順 it is にします。",
  "order-38": "be about to do が「まさに～するところ」。They are about to announce ... の後に目的語 the winner を置きます。",
  "order-39": "distinguish A from B の固定構文です。A は fantasy、B は reality で、助動詞 cannot の後は原形 distinguish です。",
  "order-40": "This sensor sets off an alarm が主節。when 節は主語 it、三単現 detects、目的語 smoke の順です。",
  "order-41": "should の後は動詞原形 avoid、avoid の後は動名詞 mislabeling。the product contents が mislabeling の目的語です。",
  "order-42": "He has an important role が主節で、in the organization が役割の場を示します。冠詞 an は important の母音音の前に置きます。",
  "order-43": "The tourists visited many cities が主節。including Tokyo and Kyoto は具体例を追加する分詞・前置詞的なまとまりです。",
  "order-44": "compare A with B の型です。主語 He と同じ人を目的語にするので再帰代名詞 himself を使います。",
  "order-45": "現在進行形 My sister is applying。apply to + 学校、several + 複数形 graduate schools、時 this month の順です。",
  "order-46": "Scientists have developed で現在完了。an artificial tissue が目的語、to help heal wounds が目的を示し、help の後は原形 heal を使えます。",
  "order-47": "複数主語 Plastic containers of sashimi に are を一致させます。場所は on the store shelves と前置詞句で示します。",
  "passage-order-ch15-1": "Ch.15本文第4段落の一文です。Others が主語、create が動詞、moisturizers が目的語です。that は moisturizers を先行詞とし、can be used が助動詞を伴う受動態、in cosmetics が用途を示します。",
  "passage-order-ch15-2": "Ch.15本文第6段落の主節です。Some believe の後には、接続詞 that が省略された目的語節 this kind of work marks ... が続きます。節内では this kind of work が主語、marks が動詞です。",
  "passage-order-ch15-3": "Ch.15本文第8段落の重要部分です。Since + 過去形は現在まで続く起点を示すため、主節は現在完了 Amyris has become ... になります。it was founded は受動態です。",
  "passage-order-ch15-4": "Ch.15本文第9段落の重要部分です。The scientists + are building で現在進行形を作り、目的語 entire genomes、方法・出発点を表す from scratch を続けます。",
  "passage-order-ch16-1": "Ch.16本文第2段落の一文です。主語 Cloud formation and movements は複数なので are predicted。which 節は主語全体を補足し、based on atmospheric conditions は予測の根拠を示します。",
  "passage-order-ch16-2": "Ch.16本文第4段落の重要部分です。Previous attempts を主語に現在完了 have been able to を置きます。narrow A down to B は『AをBまで狭める』の固定語順です。",
  "passage-order-ch16-3": "Ch.16本文第5段落の重要部分です。本文の集合名詞 team に合わせて were able to を使います。split A into B のAは the Earth's surface、Bは some 63 billion hexagonal blocks です。",
  "passage-order-ch16-4": "Ch.16本文第7段落の重要部分です。will の後は原形 work。work on の on は前置詞なので、その後は動名詞 improving を置きます。for 以下が改善の目的です。",
  "passage-order-ch18-1": "Ch.18本文第2段落の重要部分です。expects の目的語は that 節です。節内の robot wheelchairs が実用化される側なので、未来受動態 will be put to practical use を使います。",
  "passage-order-ch18-2": "Ch.18本文第4段落の重要部分です。will have の目的語が sensors。関係代名詞 that は sensors を受け、複数先行詞に合わせて detect を用います。",
  "passage-order-ch18-3": "Ch.18本文第6段落の重要部分です。include の目的語は a system。元の関係 computers recognize ... in the system から、前置詞を関係代名詞の前へ出した in which を作ります。",
  "passage-order-ch18-4": "Ch.18本文第8段落の重要部分です。Multiple wheelchairs will be connected で未来受動態を作り、手段を by networks で示します。so that 以下は目的・結果で、will be able to + 原形を使います。",
  "passage-order-ch19-1": "Ch.19本文第2段落の重要部分です。助動詞 can の後は原形 determine。easily は動詞を修飾し、based on their DNA sequence information は判断の根拠を示します。",
  "passage-order-ch19-2": "Ch.19本文第4段落の一文です。形式主語 It + be + 形容詞 + for 人 + to do の型です。distinguish between ... は『～の間を見分ける』という定型表現です。",
  "passage-order-ch19-3": "Ch.19本文第6段落の重要部分です。compare A with B のAは the DNA sequences of living objects、Bは those stored in DNA databases。those は DNA sequences の反復を避け、stored 以下が後ろから修飾します。",
  "passage-order-ch19-4": "Ch.19本文第8段落の重要部分です。determine の目的語は間接疑問 which families or genera new species belong to。間接疑問では疑問文語順にせず、主語 new species を動詞 belong の前へ置きます。",
};

const VOCAB_ORIGIN_NOTES: Record<string, string> = {
  "life-form / organism": "life-form は life「生命」+ form「形・形態」の直訳で「生命の形」。organism は organ「器官」と同系で、器官が組織された生き物という発想の語です。",
  laboratory: "中世ラテン語系の laboratorium「仕事をする場所」に由来し、labor「労働・作業」と同じ語族です。実験という作業を行う場所から「実験室」になりました。",
  cell: "ラテン語 cella「小部屋」に由来します。顕微鏡で見た区画が小さな部屋のようだったため、生物の「細胞」を表すようになりました。",
  "dna sequence": "DNA は deoxyribonucleic acid の略。sequence はラテン語 sequi「後に続く」と同系で、塩基が順に続く「配列」を表します。",
  petrochemicals: "petro- は petroleum「石油」、chemicals は「化学製品」。石油を原料とする化学製品という複合語の直訳です。",
  "type out": "type は「文字を打つ」、out は「最後まで・外へ出す」という完了感を加えます。頭の中の内容を文字として打ち出すため「キーボードで打ち込む」です。",
  "robotic arm": "robotic は robot + 形容詞語尾 -ic、arm は人の「腕」。腕の形と働きをするロボット部品なので robotic arm です。",
  "mix together": "mix「混ぜる」に together「一緒に」を添え、別々の物を一体にする意味を明示した表現です。",
  compound: "ラテン語 componere「一緒に置く」と同系で、com-「共に」+ pound/pose「置く」という成り立ちです。複数の元素を組み合わせたものから「化合物」です。",
  desired: "desire「望む」の過去分詞 desired が形容詞化し、「望まれた」から文脈上「目的の」という意味になります。",
  "biotech company": "biotech は biotechnology の短縮形で、bio-「生命」+ technology「技術」。それを扱う company なので「バイオテクノロジー企業」です。",
  "genetically modified": "genetically は genetic「遺伝の」+ -ally の副詞、modified は modify「変更する」の過去分詞。「遺伝的に変更された」が直訳です。",
  yeast: "古英語系で発酵に関わる泡・酵母を指した語とされ、パンや酒を膨らませ発酵させるものという古い用法が現在の意味につながっています。",
  "at a dizzying rate": "dizzy は「目が回る」、dizzying は「目を回らせるような」、rate は「速度」。目が回るほどの速度という比喩で「めまぐるしい速度で」です。",
  "convert a into b": "convert はラテン語 convertere「向きを変える」と同系で、con-「共に」+ vert「回す」。into が変化後の状態 B を導き、AをBへ変える型です。",
  medicine: "ラテン語 medicina「治療術・医術」に由来し、mederi「治す」と同系です。治療に使う物へ意味が広がり「医薬品」も表します。",
  moisturizer: "moisture「水分」+ -ize「～の状態にする」+ -er「物・人」。水分のある状態にする物なので「保湿剤」です。",
  cosmetics: "ギリシャ語 kosmos「秩序・装い」から派生した語族で、身なりを整え飾るための品という意味から「化粧品」です。",
  biofuel: "bio-「生物・生命」+ fuel「燃料」の直訳で、生物由来の材料から作る燃料を指します。",
  "renewable energy source": "renewable は re-「再び」+ new「新しい」+ -able「できる」、energy source は「エネルギーの供給源」。再び補える供給源という構成です。",
  "chief science officer": "chief「最高位の」+ science「科学」+ officer「役職者」。役職名を上位概念から順に重ねた複合名詞で「最高科学責任者」です。",
  "industrial revolution": "industrial は industry「産業」+ -al、revolution はラテン語 revolvere「回転させる」と同系。社会が回転するほどの大変化という比喩で「産業革命」です。",
  "living system": "living「生きている」+ system「相互に関係する仕組み」。生命活動をする一まとまりの仕組みなので「生物システム」です。",
  biofactory: "bio-「生物」+ factory「工場」。生物の働きを製造設備のように利用するため「バイオ工場」という比喩になります。",
  substance: "ラテン語 substantia に由来し、sub-「下に」+ stare「立つ」、性質の下に実体として存在するものという発想から「物質」です。",
  tricky: "trick「仕掛け・難所」+ 形容詞語尾 -y。仕掛けがあるように簡単には扱えないため「扱いづらい、難しい」です。",
  "biological means of production": "biological「生物学的な」+ means「手段」+ of production「生産の」。生物を使う生産手段という構成をそのまま表します。",
  revolutionize: "revolution「革命」+ 動詞化語尾 -ize「～化する」。革命を起こすほど変えるため「大変革をもたらす」です。",
  transform: "ラテン語系の trans-「越えて・別の状態へ」+ form「形」。形を別の状態へ移すことから「変える、変革する」です。",
  "environmental safety": "environmental は environment「環境」+ -al「～の」、safety は safe「安全な」+ -ty。環境面での安全性という構成です。",
  "bio-security": "bio-「生命・生物」+ security「安全保障」。生物・病原体などに関する安全を守る概念です。",
  revive: "ラテン語 revivere「再び生きる」に由来し、re-「再び」+ viv「生きる」。消えかけた議論を再び生かすため「再燃させる」です。",
  "ethical debate": "ethical はギリシャ語 ethos「慣習・人格」と同系の ethic「倫理」+ -al、debate は「論争」。倫理をめぐる論争という直訳です。",
  "play god": "play は「役を演じる」。人間が生命創造など本来は神の領域と考えられた役割を担うという比喩から「神を演じる」です。",
  "in the pipeline": "pipeline は物を目的地へ流す管。製品が完成へ向かう工程を管の中を流れている物にたとえ、「開発中・進行中」を表します。",
  "be founded": "found はラテン語 fundus「底・基礎」と同系で、土台を据えることから「設立する」。be founded はその受動態で「創業される」です。",
  "a decade": "decade はギリシャ語 deka「10」に由来するため、時間について使えば「10年間」です。",
  legend: "ラテン語 legenda「読まれるべきもの」に由来し、語り継がれる物語、さらに語り継がれるほど有名な人物・存在へ意味が広がりました。",
  "at the intersection of a and b": "intersection は inter-「間で」+ section「切ること」。二本の線が互いに切り合う交点から、二分野が交わる領域を表します。",
  "genetic engineering": "genetic は gene「遺伝子」+ -ic、engineering は設計・操作の技術。遺伝子を設計・操作する技術という複合語です。",
  swap: "古くから「一つを別の物と取り替える・交換する」ことを表す語で、一方を出してもう一方を得る相互交換のイメージが中心です。",
  gene: "1909年にデンマークの研究者ヨハンセンが作った学術語で、ギリシャ語 genos「誕生・種族」と同系です。形質を生み出す単位から「遺伝子」です。",
  genome: "gene と、全体・総体を表す学術語尾 -ome を組み合わせて作られた語で、遺伝情報の一そろい全体を指します。",
  "from scratch": "scratch は競走で地面に引いたスタート線を指した用法があります。何も進んでいない線から始めるため「ゼロから」です。",

  accurate: "ラテン語 accuratus「注意深く行われた」と同系で、ad-「～へ」+ cura「注意・配慮」の発想があります。注意を尽くして誤りがないため「正確な」です。",
  "essential factor": "essential は essence「本質」+ -ial、factor はラテン語 facere「作る」と同系で「結果を作る要因」。本質的で欠かせない要因を表します。",
  "weather forecast": "forecast は fore-「前もって」+ cast「投げる・見積もる」。先の状態を前もって見積もるため、weather と合わせて「天気予報」です。",
  "atmospheric conditions": "atmosphere はギリシャ語 atmos「蒸気」+ sphaira「球」、conditions は「状態」。地球を包む気体の球の状態という構成です。",
  meteorological: "meteorology はギリシャ語 meteoros「空中のもの」+ logos「学問」、-ical は形容詞語尾。空中現象を扱う学問に関するため「気象の」です。",
  detailed: "detail はフランス語系で「細かく切り分ける」という語史を持ち、全体を小部分に分けて示すことから「詳細」、detailed で「詳細な」です。",
  "cloud map": "cloud「雲」+ map「地図」の直訳で、雲の位置や動きを地図状に表したものです。",
  "earth's surface": "Earth's は Earth の所有格、surface はラテン語系の super-「上」+ face「面」と結び付く語。地球の外側の面なので「地球表面」です。",
  "processing supercomputer": "processing は process「処理すること」、supercomputer は super-「超・高性能」+ computer。処理を担う高性能計算機という構成です。",
  "accurate forecast": "accurate「注意深く誤りのない」+ forecast「前もって見積もること」。誤差の少ない予測なので「正確な予報」です。",
  typhoon: "語史は複雑で、東アジアの「大風」に対応する音やギリシャ語 Typhon など複数の形が英語 typhoon に影響したとされます。いずれも巨大な暴風を指す語として定着しました。",
  "heavy rain": "heavy は重量の「重い」から、量・程度が大きい意味へ広がりました。雨量が多く激しい rain なので「大雨」です。",
  "divide a into b": "divide はラテン語 dividere「分ける」に由来し、into が分割後の区分 B を導きます。Aを分けてBという構成にする型です。",
  "square block": "square「正方形の」+ block「区画・かたまり」。正方形に区切った一区画という見た目をそのまま表します。",
  "cloud formation": "cloud「雲」+ formation「形成」。formation は form「形」+ -ation「過程」で、雲が形作られる過程です。",
  movement: "move「動く」+ 名詞語尾 -ment「動作・結果」。動くことや動いた様子から「動き」です。",
  predict: "ラテン語 praedicere「前もって言う」と同系で、pre-「前もって」+ dict「言う」。起こる前に言うため「予測する」です。",
  "based on": "base は「土台」。判断や説明を情報という土台の上に置く比喩から、be based on で「～に基づく」です。",
  "meteorological institution": "meteorological「気象学上の」+ institution「設立された機関」。気象を扱う組織という複合名詞です。",
  measure: "ラテン語 mensura「測った量」、metiri「測る」と同系です。動詞では測定するほか、寸法がどれだけあるかを表します。",
  "previous attempt": "previous はラテン語 praevius「先に行く」に由来し、pre-「前」+ via「道」の発想があります。先に行われた attempt なので「従来の試み」です。",
  "narrow a down to b": "narrow「幅を狭くする」を候補・範囲へ比喩的に使い、down to が縮小の到達点 B を示します。",
  "split a into b": "split は一つの物を裂いて複数にする語。into が分割後の部分 B を導き、AをBに分割する型です。",
  hexagonal: "ギリシャ語系の hexa-「6」+ gon「角」+ 形容詞語尾 -al。6つの角を持つため「六角形の」です。",
  "space ... apart": "space を動詞で「間隔を置く」と使い、apart「離れて」が離れ方を補います。... に対象を入れ「～の間隔を空ける」です。",
  reproduce: "re-「再び」+ produce「生み出す」。同じ状態をもう一度生み出すことから「再現する」です。",
  devastate: "ラテン語 devastare「荒廃させる」と同系で、vastus「荒れ果てた・空の」という語根を含みます。土地を荒れ地にするほどの被害から現在の意味です。",
  "entire globe": "entire「欠けた部分のない全体」+ globe「球体」。地球という球の全域を指すため「地球全体」です。",
  "work on": "work「作業する」+ on「対象に接して」。ある対象に作業を続けるイメージから「～に取り組む」です。",
  improve: "中英語で「利益を生む・価値を高める」という用法から発達し、状態や質をより良くする一般的な意味になりました。",
  "natural disaster": "natural は nature + -al、disaster はイタリア語 disastro「凶星」に由来し、dis-「悪い」+ astro「星」という古い発想を持ちます。自然がもたらす災害です。",

  utilize: "ラテン語 utilis「役に立つ」と同系の utile「有用な」+ 動詞化語尾 -ize。役立つものとして使うため「活用する」です。",
  "advanced technology": "advanced は advance「前へ進む」の過去分詞形容詞、technology はギリシャ語 techne「技術」+ logos「学問」。前へ進んだ技術なので「先端技術」です。",
  "nervous system": "nervous はラテン語 nervus「腱・神経」+ -ous、system はギリシャ語由来で「組み合わされた全体」。神経が連携する系です。",
  "telecommunication technology": "tele-「遠く」+ communication「情報を共有すること」+ technology「技術」。遠距離で情報をやり取りする技術という構成です。",
  "home electronic appliance": "home「家庭」+ electronic「電子式の」+ appliance「器具」。家庭で使う電子器具を修飾語から中心語の順に並べています。",
  intention: "ラテン語 intendere「～へ伸ばす・向ける」と同系で、心をある目的へ向けることから「意図」です。",
  "brain wave": "brain「脳」+ wave「波」。脳の電気活動が波形として記録されるため「脳波」です。",
  "in line with": "line「一直線」に並び同じ方向を向くイメージを、考えや方針の一致へ広げた表現です。",
  graying: "gray「灰色になる」+ -ing。髪が白髪になることが年齢上昇の象徴なので、社会全体について「高齢化」を表します。",
  "put to practical use": "put A to use は「Aを使用状態に置く」、practical が「実際的な」を加えます。研究段階の物を実際に使う状態へ移すため「実用化する」です。",
  "nursing care facility": "nursing care「介護・看護」+ facility「設備を備えた施設」。何のための施設かを前から重ねた複合名詞です。",
  "labor shortage": "labor「労働力」+ shortage「不足」。short「足りない」+ -age「状態」から、労働力が足りない状態を表します。",
  "research institute": "research「詳しく調べる研究」+ institute「設立された組織」。研究を目的として設けられた機関なので「研究所」です。",
  "machinery manufacturer": "machinery は machine の集合、manufacturer は manufacture「製造する」+ -er。機械類を製造する者・会社を表します。",
  sensor: "ラテン語 sentire「感じる」と同系の sense「感知する」+ 行為者・装置の -or。感じ取る装置なので「センサー」です。",
  detect: "ラテン語 detegere「覆いを取る」と同系で、de-「外す」+ tect「覆う」。隠れていたものを露出させ見つけるため「検知する」です。",
  analyze: "ギリシャ語 analysis は ana-「上へ・ばらして」+ lysis「解くこと」。全体を要素へ解きほぐして調べるため「分析する」です。",
  recognize: "ラテン語 recognoscere「再び知る」と同系で、re-「再び」+ cogn「知る」。以前の知識と照合して分かるため「認識する」です。",
  direction: "ラテン語 dirigere「まっすぐ導く」と同系で、direct「向ける」+ -ion。向けられた先から「方向」です。",
  multiple: "ラテン語 multiplex「多く折り重なった」に由来し、multi-「多く」+ -ple「折り重なる」の構成です。多数から成る意味になります。",
  obstacle: "ラテン語 obstare「前に立ちはだかる」と同系で、ob-「前に」+ sta「立つ」。進路の前に立つものから「障害物」です。",
  uneven: "un-「～でない」+ even「平らな・均等な」。平らでないため「凹凸のある」です。",
  "current location": "current はラテン語 currere「走る」と同系で「今流れている」から「現在の」、location は locate「位置づける」+ -ion。今いる位置です。",
  destination: "ラテン語 destinare「定める・固定する」と同系で、旅の終点として定めた場所から「目的地」です。",
  route: "フランス語 route「道」に由来し、出発地から目的地まで通る道筋を表します。",
  latest: "late「時間的に後の」に最上級語尾 -est が付き、「最も後の」から「最も新しい、最新の」です。",
  "avoid danger": "avoid は古フランス語系で「空にする・離れておく」という意味から発達しました。danger から距離を取るため「危険を避ける」です。",
  cooperation: "co-「共に」+ operation「働き・活動」。複数の人が共に働くことから「協力」です。",
  "aim to": "aim は標的へ狙いを定める語。標的を未来の行動に置き換え、aim to do で「～することを目指す」です。",
  perform: "古フランス語 parfornir「完全に成し遂げる」と同系で、課された行為を最後まで行うことから「実行する」です。",
  share: "古英語 scearu「分け前・分割」と同系で、自分の分け前を他者と分けることから「共有する、分担する」です。",
  via: "ラテン語 via「道」に由来します。ある道・経路を通ることから前置詞「～を経由して」になりました。",

  determine: "ラテン語 determinare「境界を定める」と同系で、de- + terminus「境界」。選択肢に境界を引き一つに定めるため「決定・特定する」です。",
  prevent: "ラテン語 praevenire「先に来る」と同系で、pre-「前に」+ vent「来る」。問題より先回りして止めるため「防ぐ」です。",
  "dna barcoding": "barcode は線のパターンで商品を識別する仕組み。DNA配列を生物ごとの識別コードに見立てるため DNA barcoding と呼びます。",
  "living object": "living「生きている」+ object「対象・物」。ソフトウェアが識別する生きた対象という構成で「生物」を表します。",
  "be based on": "base「土台」の上に置かれた状態を受動形 be based で表し、on がその土台となる情報を導きます。",
  automatically: "ギリシャ語 automatos「自ら動く」と同系の automatic + 副詞語尾 -ally。人の操作なしに自ら動く様子から「自動的に」です。",
  database: "data はラテン語 datum「与えられたもの」の複数形、base は情報を置く基盤。データを集めた基盤なので「データベース」です。",
  experience: "ラテン語 experiri「試す」と同系で、実際に試し通って得た知識・出来事から「経験」です。",
  environmental: "environment「周囲を取り巻く環境」+ 形容詞語尾 -al。「環境に関する」を表します。",
  species: "ラテン語 species「外見・種類」に由来し、spec「見る」と同系です。共通の姿を持つ種類という発想から生物の「種」になりました。",
  fungus: "ラテン語 fungus「キノコ」に由来する学術語です。英語でも菌類を表し、伝統的な複数形 fungi を持ちます。",
  organism: "ギリシャ語 organon「道具・器官」と同系の organ + -ism。器官が組織されて働く生きた全体を表します。",
  virus: "ラテン語 virus「毒・有害な液体」に由来し、病気を引き起こす微小な感染性因子へ意味が専門化しました。",
  family: "ラテン語 familia「家に属する人々・家族」に由来します。共通の祖先でまとまる集団という発想が生物分類の「科」に転用されました。",
  genus: "ラテン語 genus「誕生・血統・種類」に由来し、gene とも遠い語族関係があります。似た種をまとめる分類の「属」です。",
  halt: "ゲルマン語系で「保つ・止まる」と関係する語がフランス語を経て英語に入り、動きを止める意味になりました。",
  "food fraud": "food「食品」+ fraud「欺く行為」。食品の内容・産地などで人を欺くため「食品偽装」です。",
  "fraudulent mislabeling": "fraudulent「詐欺的な」+ mis-「誤って」+ labeling「表示」。人を欺く悪質な誤表示という構成です。",
  "farm products": "farm「農場」+ products「生産された物」。農場で生産された物なので「農産物」です。",
  "dna sequence information": "DNA sequence「DNAの並び」+ information「情報」。配列そのものが持つ識別情報を表す複合名詞です。",
  "yellowfin tuna": "yellow「黄色」+ fin「ひれ」+ tuna「マグロ」。黄色いひれが目立つ特徴から yellowfin tuna「キハダマグロ」です。",
  "pacific bluefin tuna": "Pacific「太平洋の」+ bluefin「青いひれの」+ tuna「マグロ」。生息域と外見上の特徴を重ねた名称です。",
  drastically: "drastic はギリシャ語 drastikos「活動的・強力な」と同系で、-ally で副詞化します。強い作用を及ぼす様子から「大幅に」です。",
  distinguish: "ラテン語 distinguere「印を付けて分ける」と同系で、dis-「分けて」+ stingu「印を付ける」の発想です。印の違いで見分けるため「区別する」です。",
  existing: "ラテン語 existere「外へ立ち現れる」と同系の exist「存在する」+ -ing。すでに存在している状態から「既存の」です。",
  "to date": "date を時間の到達点として使い、その日付・現在という境界までを to が示すため「現在までのところ」です。",
  tissue: "古フランス語 tissu「織られた物」、ラテン語 texere「織る」と同系です。細胞が織物のように組み合わさったものから生物の「組織」です。",
  mislabeling: "mis-「誤って」+ label「表示する」+ -ing。誤った表示をする行為・結果から「不当表示、誤表示」です。",
  "play a central role": "role は巻物に書かれた俳優の「役」から、組織内の機能へ意味が広がりました。central role は中心的な役、play はその役を果たすことです。",
  "belong to": "belong は歴史的に「～に属する・関係する」を表すようになった動詞で、to が帰属先を導きます。人や物がどこに収まるかを示す型です。",
  "be related to": "related はラテン語 referre の過去分詞 relatus「関係づけられた」と同系です。be related で結び付きのある状態、to が相手を導きます。",
  fraud: "ラテン語 fraus「欺き・損害」に由来し、意図的に人をだます行為から「詐欺」です。",
  fraudulent: "fraud「詐欺」+ 形容詞を作る -ulent。詐欺の性質を持つため「詐欺の、不正な」です。",
  announce: "ラテン語 annuntiare「知らせをもたらす」と同系で、ad-「～へ」+ nuntius「使者・知らせ」。公に知らせるため「発表する」です。",
  "set off an alarm": "set off には装置・反応を「作動させる、引き起こす」意味があります。alarm を始動状態にするため「警報を作動させる」です。",
  including: "include はラテン語 includere「中に閉じ込める」と同系で、in-「中に」+ clud「閉じる」。-ing 形で例を範囲内に入れる「～を含む」です。",
  "compare a with b": "compare はラテン語 comparare「並べて等しくする」と同系で、com-「共に」+ par「等しい」。AとBを並べて見るため「比較する」です。",
  "graduate school": "graduate はラテン語 gradus「段階・学位」と同系で、学位という段階を進む人・課程を表します。学士後の学位段階を学ぶ school です。",
};

function extractJapaneseMeaning(question: EnglishQuestion) {
  return question.prompt.match(/「(.+?)」/)?.[1] ?? question.prompt;
}

function inferVocabularyShape(expression: string, japanese: string) {
  const lower = expression.toLocaleLowerCase("en");
  if (expression.includes(" / ")) {
    return "スラッシュで示された表現はいずれも正答候補です。意味の重なりを押さえつつ、綴りは別々に練習します。";
  }
  if (/\bA\b.*\bB\b/.test(expression)) {
    return "A・B は入れ替える目的語の位置です。動詞だけでなく、A と B の語順および前置詞まで含めた構文として覚えます。";
  }
  if (expression.includes("...")) {
    return "... の位置に目的語を入れる構文です。前後の語を離さず、枠の形で再現できるようにします。";
  }
  if (lower.startsWith("be ")) {
    return "be 動詞と一緒に用いる述語表現です。時制に応じて be の形を変え、後半の語順は保ちます。";
  }
  if (lower === "via") {
    return "前置詞で、経路・手段を表す名詞の前に置きます。via a network のように後ろに目的語を取ります。";
  }
  if (lower === "including") {
    return "include の -ing 形で、ここでは「～を含めて」と具体例を追加する前置詞のように働きます。";
  }
  if (lower === "measure" || lower === "swap") {
    return "動詞として用い、主語・時制に応じて measures/measured または swaps/swapped のように活用します。";
  }
  if (lower === "tricky") {
    return "形容詞で、名詞を前から修飾するか be 動詞の後で「扱いづらい、難しい」という状態を表します。";
  }
  if (expression.includes(" ")) {
    if (japanese.includes("する") || japanese.includes("～")) {
      return "複数語から成る動詞句・定型表現です。中心動詞と前置詞・副詞を一つのチャンクとして使います。";
    }
    return "複数語で一つの意味を作る複合語・名詞句です。英語の修飾語→中心語の語順ごと覚えます。";
  }
  if (/ly$/i.test(expression)) {
    return "語尾 -ly を持つ副詞で、動詞・形容詞・文全体の様子や程度を修飾します。";
  }
  if (/(?:tion|sion|ment|ness|ity|ance|ence|ism)$/i.test(expression)) {
    return "名詞を作りやすい語尾を持つ語です。文中では主語・目的語・前置詞の目的語になれます。";
  }
  if (/(?:al|ical|ive|ous|able|ible|ful|less|ic)$/i.test(expression)) {
    return "形容詞を作りやすい語尾を持ち、名詞を修飾したり be 動詞の補語になったりします。";
  }
  if (japanese.includes("する") || japanese.includes("させる") || japanese.includes("与える")) {
    return "動詞として用い、主語の後で時制・三単現・分詞の形に活用します。";
  }
  if (japanese.includes("の") || japanese.includes("な、") || japanese.endsWith("な")) {
    return "主に形容詞として名詞を説明する語です。名詞の前または be 動詞の後で使います。";
  }
  return "主に名詞として覚える語です。冠詞、単数・複数、よく一緒に使う語も併せて確認します。";
}

function buildMemoryHint(expression: string) {
  return VOCAB_ORIGIN_NOTES[expression.toLocaleLowerCase("en")] ?? "";
}

function buildVocabularyExplanation(question: EnglishQuestion) {
  const japanese = extractJapaneseMeaning(question);
  const variants = question.accepted && question.accepted.length > 1
    ? "採点では " + question.accepted.map((answer) => "「" + answer + "」").join("、") + " を受け付けます。"
    : "";
  return detail([
    "【意味】「" + japanese + "」に対応する教材表現は「" + question.answer + "」です。" + variants,
    "【品詞・形】" + inferVocabularyShape(question.answer, japanese),
    "【語源・覚え方】" + buildMemoryHint(question.answer),
    "【正解の理由】日本語の中心概念を「" + question.answer + "」が表します。意味だけでなく、空白・ハイフン・前置詞を含む語形全体を正解として再現します。",
    question.explanation ? "【補足】" + question.explanation : "",
  ].filter(Boolean));
}

function buildReverseVocabularyExplanation(question: EnglishQuestion) {
  const expression = question.prompt.match(/「(.+?)」/)?.[1] ?? question.prompt;
  const variants = Array.from(new Set([question.answer, ...(question.accepted ?? [])]));
  return detail([
    "【意味】「" + expression + "」は、教材では「" + question.answer + "」を表します。" + (variants.length > 1 ? "「" + variants.join("」「") + "」も意味の核が同じ正答候補です。" : ""),
    "【品詞・形】" + inferVocabularyShape(expression, question.answer),
    "【語源・覚え方】" + buildMemoryHint(expression),
    "【正解の理由】英語表現「" + expression + "」が指す中心概念を、日本語では「" + question.answer + "」と表せるためです。本文中の使われ方まで思い出して答えます。",
    "【採点】語順や言い回しが模範解答と完全一致しなくても、同義語または意味の核が合っていれば正解として扱います。自動判定が外れた場合は、解説下のボタンで正解へ変更できます。",
    question.explanation ? "【補足】" + question.explanation : "",
  ].filter(Boolean));
}

function buildOrderExplanation(question: EnglishQuestion) {
  const guidance = ORDER_GUIDANCE[question.id];
  if (!guidance) return "";
  return detail([
    "【完成文】" + question.answer,
    "【文法構造】" + guidance,
    "【組み立て方】まず主語と時制を担う動詞を固定し、次に目的語・補語、最後に前置詞句や時・場所の修飾語を置きます。",
    "【正解の理由】提示語をすべて一度ずつ使い、定型表現と修飾関係を崩さない語順が「" + question.answer + "」です。",
  ]);
}

function buildLanguageExplanation(question: EnglishQuestion) {
  if (question.group === "語彙・熟語（日→英）") return buildVocabularyExplanation(question);
  if (question.group === "語彙・熟語（英→日）") return buildReverseVocabularyExplanation(question);
  if (question.group.startsWith("語順整序｜")) return buildOrderExplanation(question);
  return SPECIAL_EXPLANATIONS[question.id] ?? "";
}

const TARGET_QUESTIONS = ENGLISH_QUESTIONS.filter(isLanguageStudyQuestion);
const VOCAB_TARGET_QUESTIONS = TARGET_QUESTIONS.filter(
  (question) => question.group === "語彙・熟語（日→英）",
);

export const ENGLISH_LANGUAGE_EXPLANATIONS: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(TARGET_QUESTIONS.map((question) => [question.id, buildLanguageExplanation(question)])),
);

export const ENGLISH_LANGUAGE_EXPLANATION_TARGET_IDS: readonly string[] = Object.freeze(
  TARGET_QUESTIONS.map((question) => question.id),
);

export const ENGLISH_LANGUAGE_EXPLANATION_MISSING_IDS: readonly string[] = Object.freeze(
  ENGLISH_LANGUAGE_EXPLANATION_TARGET_IDS.filter(
    (id) => !ENGLISH_LANGUAGE_EXPLANATIONS[id]?.trim(),
  ),
);

export const ENGLISH_LANGUAGE_GENERIC_ORIGIN_IDS: readonly string[] = Object.freeze(
  VOCAB_TARGET_QUESTIONS
    .filter((question) => !VOCAB_ORIGIN_NOTES[question.answer.toLocaleLowerCase("en")]?.trim())
    .map((question) => question.id),
);
