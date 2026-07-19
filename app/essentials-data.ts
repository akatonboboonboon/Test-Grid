import type { SubjectId } from "./study-data";

export type EssentialKind = "term" | "formula" | "rule" | "check";

export type EssentialMath = {
  label?: string;
  tex: string;
};

export type EssentialItem = {
  id: string;
  kind: EssentialKind;
  title: string;
  value: string;
  math?: readonly EssentialMath[];
  cue: string;
  pitfall: string;
  keywords?: readonly string[];
};

export type EssentialSubject = {
  id: SubjectId;
  order: number;
  name: string;
  englishName: string;
  accent: string;
  examDate: string;
  examDateLabel: string;
  description: string;
  items: readonly EssentialItem[];
};

export const ENGLISH_ESSENTIALS: EssentialItem[] = [
  {
    id: "english-convert",
    kind: "term",
    title: "convert A into B",
    value: "AをBに変換する。本文では convert sugar into medicines。",
    cue: "「AをBへ変える」なら into の前が材料A、後ろが変換後B。",
    pitfall: "convert A to B ではなく、教材本文の語順 convert A into B をそのまま覚える。",
    keywords: ["変換", "sugar", "medicines", "Chapter 15"],
  },
  {
    id: "english-from-scratch",
    kind: "term",
    title: "from scratch",
    value: "ゼロから、一から。build entire genomes from scratch まで一塊で覚える。",
    cue: "何もない状態から作り上げる内容で出る熟語。",
    pitfall: "scratch 単独の『ひっかく』ではない。文末の from scratch を落とさない。",
    keywords: ["ゼロから", "genomes", "Chapter 15"],
  },
  {
    id: "english-since-perfect",
    kind: "rule",
    title: "Since節＋現在完了",
    value: "Since + 過去形, S + has/have + 過去分詞。起点から現在までの変化を表す。",
    cue: "Since it was founded ... のように、過去の起点と現在の結果を結ぶ文。",
    pitfall: "Since節まで現在完了にしない。起点側は過去形、主節側が現在完了。",
    keywords: ["現在完了", "founded", "has become", "Chapter 15"],
  },
  {
    id: "english-divide-into",
    kind: "rule",
    title: "divide / split A into B",
    value: "AをBに分ける・分割する。Earth’s surface を blocks に分ける文で使う。",
    cue: "全体Aを複数の区画Bに分割する説明。",
    pitfall: "into を落とさない。divide の目的語が先、分割後の単位が後。",
    keywords: ["split", "blocks", "surface", "Chapter 16"],
  },
  {
    id: "english-narrow-down",
    kind: "rule",
    title: "have been able to narrow A down to B",
    value: "AをBまで絞り込むことができた。",
    cue: "過去から現在までに予報範囲・候補を狭められた、という成果。",
    pitfall: "to は able to と down to の2か所。been と過去分詞 able の形も崩さない。",
    keywords: ["narrow down", "現在完了", "Chapter 16"],
  },
  {
    id: "english-work-on",
    kind: "rule",
    title: "work on＋動名詞",
    value: "work on improving ... ＝…の改善に取り組む。",
    cue: "研究者や企業が継続的に改善・開発している文。",
    pitfall: "on は前置詞なので、後ろは improve ではなく improving。",
    keywords: ["動名詞", "improving", "Chapter 16"],
  },
  {
    id: "english-ch18-words",
    kind: "term",
    title: "Ch.18 小テスト直結4語",
    value: "advanced technology＝先端技術、nervous system＝神経系、uneven＝凹凸のある、predict＝予測する。",
    cue: "un＋even は『平らでない』、pre＋dict は『前もって言う』と分解する。",
    pitfall: "advanced を『進歩した』だけ、nervous を『緊張した』だけで訳さない。",
    keywords: ["robot wheelchair", "Chapter 18", "語源"],
  },
  {
    id: "english-future-passive",
    kind: "rule",
    title: "put to practical use の未来受動態",
    value: "will be put to practical use ＝ 実用化される。",
    cue: "ロボット車いすが将来『実用化される』側にある文。",
    pitfall: "will put では能動になる。will be + 過去分詞 put の be を落とさない。",
    keywords: ["未来受動態", "Chapter 18"],
  },
  {
    id: "english-in-which",
    kind: "rule",
    title: "前置詞＋関係代名詞 in which",
    value: "a system in which computers recognize ... の形。元は computers recognize ... in the system。",
    cue: "先行詞の中で・その仕組みの中で、という場所や枠組みを説明する。",
    pitfall: "in の根拠は元文の in the system。which の前へ移したら後ろへ in を重ねない。",
    keywords: ["関係代名詞", "Chapter 18"],
  },
  {
    id: "english-so-that",
    kind: "rule",
    title: "so that＋will be able to",
    value: "so that S will be able to V ＝ SがVできるように。",
    cue: "前の技術・ネットワーク化が、後ろの能力を可能にする目的・結果。",
    pitfall: "so と that を離さない。will be connected と will be able to の二つの be を区別する。",
    keywords: ["目的", "結果", "Chapter 18"],
  },
];

export const NETWORK_ESSENTIALS: EssentialItem[] = [
  {
    id: "network-ethernet",
    kind: "rule",
    title: "Ethernet",
    value: "第1層・第2層の両方。有線LANの信号伝送とMACフレーム配送を担う。",
    cue: "教材中でL1/L2の両方に置かれる代表カード。",
    pitfall: "どちらか一方だけで答えない。層即答では『1・2』をセットで返す。",
    keywords: ["イーサネット", "MAC", "物理層", "データリンク層"],
  },
  {
    id: "network-auth-l2",
    kind: "rule",
    title: "IEEE 802.1X / EAP / EAPoL / RADIUS",
    value: "教材では全て第2層。802.1X＝接続前認証、EAP＝認証の枠組み、EAPoL＝端末〜AP、RADIUS＝AAAサーバー側。",
    cue: "無線・有線LANへ接続する前の認証一式。",
    pitfall: "EAP自体を一つの認証方式と決めつけない。EAPoL と RADIUS の区間を逆にしない。",
    keywords: ["認証", "AAA", "第2層"],
  },
  {
    id: "network-wifi-security",
    kind: "rule",
    title: "WEP → WPA → WPA2 → WPA3",
    value: "全て第2層。WEP/RC4は危険、WPA＝TKIP、WPA2＝AES-CCMP、WPA3＝SAE。",
    cue: "無線LANの暗号化世代を古い順に問う問題。",
    pitfall: "世代順と暗号方式の対応を入れ替えない。WPA3の鍵交換はSAE。",
    keywords: ["無線LAN", "RC4", "TKIP", "AES", "SAE"],
  },
  {
    id: "network-arp",
    kind: "term",
    title: "ARP",
    value: "Address Resolution Protocol。第2層。同一LAN内でIPv4アドレスからMACアドレスを解決する。",
    cue: "IPv4の宛先IPは分かるが、LAN上の送信先MACが分からないとき。",
    pitfall: "IPv6の近隣探索はNDP。ARPを第3層と答えない。",
    keywords: ["Address Resolution Protocol", "IPv4", "MAC"],
  },
  {
    id: "network-spanning-tree",
    kind: "rule",
    title: "STP / RSTP / MSTP",
    value: "第2層。STP＝L2ループ防止、RSTP＝高速収束、MSTP＝複数VLANを複数ツリーへまとめる。",
    cue: "スイッチを冗長接続したときのループ対策。R＝Rapid、M＝Multiple。",
    pitfall: "ルーティングプロトコルと混同しない。3つともSpanning Tree系。",
    keywords: ["ループ", "VLAN", "第2層"],
  },
  {
    id: "network-network-layer",
    kind: "rule",
    title: "IPv4 / IPv6 / ICMP / NDP",
    value: "教材では第3層。IPv4＝32bit、IPv6＝128bit、ICMP＝エラー通知・診断、NDP＝IPv6近隣探索。",
    cue: "IPでネットワーク間を運ぶ、またはIP通信を補助する働き。",
    pitfall: "ARP（L2・IPv4）とNDP（L3・IPv6）を対で区別する。",
    keywords: ["ネットワーク層", "32bit", "128bit", "ping"],
  },
  {
    id: "network-routing",
    kind: "rule",
    title: "RIP / OSPF / BGP",
    value: "第3層。RIP＝ホップ数、OSPF＝リンク状態・最短経路、BGP＝AS間・ポリシー。",
    cue: "経路選択ならRIP/OSPF/BGP。RIP・OSPFはIGP、BGPはAS間。",
    pitfall: "BGPを単なる最短経路プロトコルにしない。AS間ではポリシーも効く。",
    keywords: ["routing", "IGP", "EGP", "AS"],
  },
  {
    id: "network-transport",
    kind: "rule",
    title: "TCP / UDP / QUIC",
    value: "第4層。TCP＝信頼性・順序・再送、UDP＝軽量・無保証、QUIC＝UDP上の暗号化ストリーム。",
    cue: "端末間の転送方法・ポート・信頼性を問う問題。HTTP/3の基盤はQUIC。",
    pitfall: "HTTP/3自体は第7層、基盤のQUICは第4層。",
    keywords: ["transport", "HTTP/3", "再送", "ポート"],
  },
  {
    id: "network-overlap-layers",
    kind: "rule",
    title: "SSH と TLS の複数層",
    value: "写真・教材準拠では SSH＝第5層/第7層、TLS＝第5層/第6層。",
    cue: "層が一つに決まらないカードとして、そのまま複数番号で覚える。",
    pitfall: "一般的な別分類へ勝手に補正せず、この試験の手書き資料の層で答える。",
    keywords: ["セッション層", "プレゼンテーション層", "アプリケーション層"],
  },
  {
    id: "network-applications",
    kind: "rule",
    title: "HTTP・DNS・メール系",
    value: "第7層。HTTP＝Web、DNS＝名前解決、SMTP＝送信、POP3＝取得、IMAP＝サーバー同期。",
    cue: "利用者が直接使うサービスや名前・メールの機能。",
    pitfall: "SMTPは送る。POP3/IMAPは受ける。POP3とIMAPの保存方式も区別する。",
    keywords: ["application", "Web", "mail", "名前解決"],
  },
];

export const MECHANICAL_ESSENTIALS: EssentialItem[] = [
  {
    id: "mechanical-free-vibration",
    kind: "formula",
    title: "非減衰自由振動と固有角振動数",
    value: "質量から見た等価剛性を使う、1自由度系の出発点。",
    math: [
      { label: "運動方程式", tex: "m\\ddot{x}+kx=0" },
      { label: "固有角振動数", tex: "\\omega_n=\\sqrt{\\frac{k}{m}}" },
    ],
    cue: "外力なし・減衰なし・質量mとばねkがある。",
    pitfall: "個々のばね定数ではなく、質量から見た等価剛性 \\(k_{eq}\\) を入れる。",
    keywords: ["自由振動", "固有振動数"],
  },
  {
    id: "mechanical-initial-response",
    kind: "formula",
    title: "初期条件を入れた自由振動解",
    value: "初期変位 \\(x_0\\)、初速度 \\(v_0\\) から応答を作る。",
    math: [{ tex: "x(t)=x_0\\cos(\\omega_nt)+\\frac{v_0}{\\omega_n}\\sin(\\omega_nt)" }],
    cue: "問題文に初期変位・初速度が与えられる。",
    pitfall: "sinの係数は \\(v_0\\) ではなく \\(v_0/\\omega_n\\)。",
  },
  {
    id: "mechanical-frequency-period",
    kind: "formula",
    title: "角振動数・周波数・周期",
    value: "rad/s、Hz、sを相互変換する最小セット。",
    math: [{ tex: "f_n=\\frac{\\omega_n}{2\\pi},\\qquad T_n=\\frac{2\\pi}{\\omega_n}=\\frac1{f_n}" }],
    cue: "答えの単位がHzまたは周期sで求められている。",
    pitfall: "rad/sをHzへ直すときは \\(2\\pi\\) を掛けず、割る。",
  },
  {
    id: "mechanical-springs",
    kind: "rule",
    title: "ばねの直列・並列",
    value: "並列は変位が共通、直列は力が共通。複合系は内側から整理する。",
    math: [
      { label: "並列", tex: "k_{eq}=k_1+k_2+\\cdots" },
      { label: "直列2本", tex: "k_{eq}=\\frac{k_1k_2}{k_1+k_2}" },
    ],
    cue: "複数ばねを一つの等価ばねへ置き換える。",
    pitfall: "直列と並列の式を逆にしない。接続図の同じ変位・同じ力を先に見る。",
  },
  {
    id: "mechanical-beam-stiffness",
    kind: "formula",
    title: "はりの等価剛性",
    value: "荷重点のたわみ \\(\\delta=P/k\\) として、はりをばねへ置換する。",
    math: [
      { label: "片持ちはり先端", tex: "k=\\frac{3EI}{l^3}" },
      { label: "単純支持中央", tex: "\\delta=\\frac{Pl^3}{48EI},\\qquad k=\\frac{48EI}{l^3}" },
    ],
    cue: "はり先端・中央に質量や集中荷重がある振動問題。",
    pitfall: "係数3と48、長さの3乗を取り違えない。",
  },
  {
    id: "mechanical-laplace",
    kind: "formula",
    title: "ラプラス変換の最小セット",
    value: "伝達関数へ入力を掛け、部分分数にして逆変換する。",
    math: [
      { tex: "\\mathcal L\\{\\delta(t)\\}=1,\\quad \\mathcal L\\{1\\}=\\frac1s,\\quad Y(s)=G(s)U(s)" },
      { tex: "\\frac1{s+a}\\leftrightarrow e^{-at},\\qquad \\frac1{(s+a)^2}\\leftrightarrow te^{-at}" },
    ],
    cue: "インパルス応答・ステップ応答・逆ラプラスを求める。",
    pitfall: "単位ステップ入力なら \\(G(s)\\) に \\(1/s\\) を掛けてから分解する。",
  },
  {
    id: "mechanical-damping-basics",
    kind: "formula",
    title: "粘性減衰・臨界減衰・減衰比",
    value: "減衰係数cを臨界値で割り、応答の分類へつなげる。",
    math: [
      { tex: "m\\ddot{x}+c\\dot{x}+kx=0" },
      { tex: "c_c=2\\sqrt{mk},\\qquad \\zeta=\\frac{c}{c_c}" },
    ],
    cue: "ダンパc、臨界減衰、減衰比が出る。",
    pitfall: "cの単位は \\(\\mathrm{N\\,s/m}=\\mathrm{kg/s}\\)。",
  },
  {
    id: "mechanical-damping-cases",
    kind: "rule",
    title: "減衰の3分類",
    value: "\\(\\zeta>1\\)：過減衰、\\(\\zeta=1\\)：臨界減衰、\\(0<\\zeta<1\\)：不足減衰。",
    cue: "減衰比から波形が振動するかを判定する。",
    pitfall: "振動しながら減衰するのは不足減衰だけ。臨界減衰は最速の非振動応答。",
  },
  {
    id: "mechanical-underdamped",
    kind: "formula",
    title: "不足減衰の角振動数と応答",
    value: "指数包絡の中で、減衰固有角振動数 \\(\\omega_d\\) で振動する。",
    math: [
      { tex: "\\omega_d=\\omega_n\\sqrt{1-\\zeta^2}" },
      { tex: "x=e^{-\\zeta\\omega_nt}\\left(C_1\\cos\\omega_dt+C_2\\sin\\omega_dt\\right)" },
    ],
    cue: "\\(0<\\zeta<1\\) で時刻歴応答を求める。",
    pitfall: "包絡の \\(\\zeta\\omega_n\\) と、中の振動数 \\(\\omega_d\\) を混同しない。",
  },
  {
    id: "mechanical-log-decrement",
    kind: "formula",
    title: "対数減衰率から減衰比",
    value: "減衰波形の離れたピークから減衰比を逆算する。",
    math: [
      { tex: "\\delta=\\frac1n\\ln\\frac{x_i}{x_{i+n}}" },
      { tex: "\\zeta=\\frac{\\delta}{\\sqrt{4\\pi^2+\\delta^2}}\\approx\\frac{\\delta}{2\\pi}" },
    ],
    cue: "ピーク振幅と何周期離れているかが与えられる。",
    pitfall: "n周期離れていれば、対数の振幅比を必ずnで割る。近似は小減衰だけ。",
  },
  {
    id: "mechanical-rotation",
    kind: "formula",
    title: "回転1自由度系",
    value: "並進の \\(m,c,k\\) を回転の \\(J,C_\\theta,K_\\theta\\) へ置き換える。",
    math: [
      { tex: "J\\ddot{\\theta}+C_\\theta\\dot{\\theta}+K_\\theta\\theta=0" },
      { tex: "\\omega_n=\\sqrt{\\frac{K_\\theta}{J}}" },
    ],
    cue: "変位ではなく角変位 \\(\\theta\\)、質量ではなく慣性モーメントJ。",
    pitfall: "並進のばね定数kをそのまま入れず、ねじり剛性 \\(K_\\theta\\) へ換算する。",
  },
  {
    id: "mechanical-lever",
    kind: "formula",
    title: "レバー系の腕二乗換算",
    value: "変位で腕が1回、モーメントでもう1回掛かるので腕の長さは二乗で効く。",
    math: [{ tex: "J=ml^2,\\qquad C_\\theta=cl_2^2,\\qquad K_\\theta=kl_1^2" }],
    cue: "質量・ダンパ・ばねが回転軸から距離lに取り付く。",
    pitfall: "腕の長さを1乗で換算しない。各要素の取り付け位置 \\(l_1,l_2\\) も区別する。",
  },
];
