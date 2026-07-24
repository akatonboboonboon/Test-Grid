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
    id: "english-ch14-storage",
    kind: "term",
    title: "Ch.14 蓄電池の中核語",
    value: "storage battery＝蓄電池、redox flow battery＝レドックスフロー電池、electrolytic solution＝電解液、vanadium＝バナジウム、charge / discharge＝充電／放電、life span＝寿命。",
    cue: "発電量が一定しない再生可能エネルギーを、大容量の蓄電池でならす本文の流れと結び付ける。",
    pitfall: "batteryを乾電池だけと考えない。本文ではバナジウム電解液を使う大型の蓄電設備。",
    keywords: ["Chapter 14", "storage battery", "redox flow", "vanadium"],
  },
  {
    id: "english-ch14-grammar",
    kind: "rule",
    title: "Ch.14 本文直結4表現",
    value: "be aimed at＋-ing＝…することを目的とする、by＋-ing＝…することによって、account for＝…を占める、allow A to do＝Aが…することを可能にする。",
    cue: "目的→手段→割合→可能化という役割で、前後の内容から形を選ぶ。",
    pitfall: "at と by は前置詞なので後ろは動名詞。allow の後ろは A + to不定詞。",
    keywords: ["Chapter 14", "aimed at", "account for", "allow"],
  },
  {
    id: "english-ch14-able",
    kind: "term",
    title: "Ch.14 -able 語形",
    value: "disposable＝使い捨ての、erasable＝消去できる、adjustable＝調整できる、rechargeable＝再充電できる。",
    cue: "-able は『…できる』。dis-pose-able、erase-able、adjust-able、re-charge-able と分ける。",
    pitfall: "rechargeable の re-（再び）と、disposable の dispose（処分する）を落とさない。",
    keywords: ["Chapter 14", "able", "disposable", "rechargeable"],
  },
  {
    id: "english-toeic-evidence",
    kind: "check",
    title: "TOEIC Reading 根拠対応",
    value: "standard＝basic、overnight shipping＝$50、誤配の原因＝wrong address。別資料では tradition、代名詞 It、one device per team、順序語 Afterward が正答。",
    cue: "設問と同じ意味の言い換え、料金、住所、代名詞の指示先、出来事の順序を本文へ戻って確認する。",
    pitfall: "記憶だけで選ばず、設問ごとに本文の根拠文を一つ指差してから答える。",
    keywords: ["TOEIC", "standard", "overnight", "Afterward"],
  },
  {
    id: "english-housing-contrast",
    kind: "term",
    title: "Housing 対比語",
    value: "landlord＝家主 ↔ tenant＝借主、rent＝家賃／借りる、lease＝賃貸借契約、mortgage＝住宅ローン、furnished＝家具付きの、equipped＝設備の整った、affordable＝手頃な。",
    cue: "貸す側・借りる側、毎月の家賃・契約・購入資金を対で区別する。",
    pitfall: "rent と lease と mortgage を全部『家』だけで覚えず、支払い・契約・融資の違いまで言えるようにする。",
    keywords: ["Housing", "landlord", "tenant", "mortgage"],
  },
  {
    id: "english-medical-contrast",
    kind: "term",
    title: "Medical 対比語",
    value: "inpatient＝入院患者 ↔ outpatient＝外来患者、confidentiality＝守秘義務、disclose＝開示する、blood pressure＝血圧、occupational therapy＝作業療法、surgery＝手術。",
    cue: "in / out の接頭辞、confidential（秘密の）、occupation（作業・職業）から意味を戻す。",
    pitfall: "surgery は外科・手術の両方。therapy と treatment を日本語一語だけで潰さず場面で区別する。",
    keywords: ["Medical", "inpatient", "outpatient", "confidentiality"],
  },
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
    id: "network-official-layer1-media",
    kind: "rule",
    title: "L1：有線・無線の規格と媒体",
    value: "正式範囲PDFでは1000BASE-T、IEEE 802.11ax、ツイストペアケーブル、光ファイバーが第1層。",
    cue: "信号を何で、どの規格で伝えるかを答える項目。",
    pitfall: "1000BASE-Tは1Gbpsの有線LAN、802.11axはWi-Fi 6。媒体名2つも出題対象。",
    keywords: ["1000BASE-T", "IEEE 802.11ax", "ツイストペアケーブル", "光ファイバー"],
  },
  {
    id: "network-official-radio-dual-layer",
    kind: "rule",
    title: "Bluetooth / Zigbee",
    value: "正式PDFの掲載位置は第1層。括弧内指定により第2層でも正解。Bluetoothは近距離、Zigbeeは低消費電力・メッシュ。",
    cue: "無線の物理方式とリンク制御の両面を持つ2項目。",
    pitfall: "層即答ではL1またはL2。記述ではBluetoothとZigbeeの用途を入れ替えない。",
    keywords: ["Bluetooth", "Zigbee", "近距離", "メッシュ"],
  },
  {
    id: "network-official-arp-garp",
    kind: "rule",
    title: "ARP / GARP",
    value: "第2層。ARPは同一LANでIPv4からMACを解決し、GARPは自分のIP/MAC対応を要求なしで通知する。",
    cue: "IPとMACの対応を扱うとき。",
    pitfall: "IPv6の近隣探索はNDP。GARPは通常の問い合わせへの応答ではない。",
    keywords: ["ARP", "GARP", "IPv4", "MAC"],
  },
  {
    id: "network-official-ppp-auth",
    kind: "rule",
    title: "PPP・認証・トンネル",
    value: "PPP、PAP、CHAP、PPPoEはL2。RADIUSはPDF上L2／一般的L7、L2TPはPDF上L2／一般的L3も正解。",
    cue: "2点間接続、PPP認証、Ethernet収容、AAA、トンネルを区別する。",
    pitfall: "PAPは平文に近い単純認証、CHAPはチャレンジ応答。RADIUSとL2TPの括弧内層を落とさない。",
    keywords: ["PPP", "PAP", "CHAP", "PPPoE", "RADIUS", "L2TP"],
  },
  {
    id: "network-official-ip-support",
    kind: "rule",
    title: "IPv4 / IPv6 / ICMP / NDP / DHCP",
    value: "PDFでは全てL3。IPv4は32bit、IPv6は128bit、ICMPはエラー・診断、NDPはIPv6近隣探索、DHCPはIP設定の自動貸与。DHCPはL7も正解。",
    cue: "IP配送そのものと、IP通信を成立させる補助機能。",
    pitfall: "ARP（L2・IPv4）とNDP（L3・IPv6）、DNSとDHCPを混同しない。",
    keywords: ["IPv4", "IPv6", "ICMP", "NDP", "DHCP"],
  },
  {
    id: "network-official-routing",
    kind: "rule",
    title: "RIP / OSPF / EIGRP / BGP",
    value: "全てL3。RIP＝ホップ数、OSPF＝リンク状態・最短経路、EIGRP＝DUAL・複合メトリック、BGP＝AS間・ポリシー。",
    cue: "経路選択方式の違いを1語ずつ固定する。",
    pitfall: "BGPを単なる最短経路、OSPFをAS間プロトコルとして説明しない。",
    keywords: ["RIP", "OSPF", "EIGRP", "BGP", "AS"],
  },
  {
    id: "network-official-vpn-sdn",
    kind: "rule",
    title: "IPsec / PPTP / OpenFlow",
    value: "PDFではL3。IPsecはIP暗号・認証、PPTPはPPPをGREで運ぶ旧式VPN、OpenFlowはSDNコントローラーがフロー表を制御する。PPTPはL2/L3、OpenFlowはL7も正解。",
    cue: "VPNの保護・トンネル方式と、SDN制御を切り分ける。",
    pitfall: "PPTPを安全な現行暗号方式と説明しない。OpenFlowは経路交換プロトコルではない。",
    keywords: ["IPsec", "PPTP", "OpenFlow", "VPN", "SDN"],
  },
  {
    id: "network-official-transport",
    kind: "rule",
    title: "TCP / UDP",
    value: "第4層。TCPは接続・順序・ACK・再送で信頼性を確保し、UDPは接続や到着順を保証しない軽量なデータグラム転送。",
    cue: "端点間転送、ポート、再送・順序保証を問われたとき。",
    pitfall: "TCPとUDPの長所を逆にしない。QUICは正式PDFではL6掲載でL4も正解。",
    keywords: ["TCP", "UDP", "ACK", "再送", "データグラム"],
  },
  {
    id: "network-official-session",
    kind: "rule",
    title: "SIP / RTSP",
    value: "正式PDFでは第5層。SIPはIP電話・会議の呼制御、RTSPはストリーミングの再生・停止・位置指定を制御する。",
    cue: "会話セッションを始めるSIP、映像再生を操作するRTSP。",
    pitfall: "SIPが音声本体を運ぶ、RTSPが動画データ本体を運ぶ、と書かない。",
    keywords: ["SIP", "RTSP", "呼制御", "ストリーミング"],
  },
  {
    id: "network-official-presentation",
    kind: "rule",
    title: "SSL/TLS / ALPN / QUIC",
    value: "正式PDFでは第6層。SSL/TLSは暗号化・認証、ALPNはTLS中の上位プロトコル交渉、QUICはUDP上でTLSと多重ストリームを統合する。QUICはL4も正解。",
    cue: "安全な表現・交渉・HTTP/3基盤をまとめて区別する。",
    pitfall: "旧資料のSSH/TLS複数層分類は使わない。SSL/TLSはL6、SSHはL7だけ。",
    keywords: ["SSL/TLS", "ALPN", "QUIC", "TLS", "HTTP/3"],
  },
  {
    id: "network-official-applications",
    kind: "rule",
    title: "L7：Web・名前・メール・運用",
    value: "HTTP/HTTPS、DNS、SMTP、POP3、IMAP4、SSH、Telnet、FTP、TFTP、SNMP、NTPは第7層。",
    cue: "Web、名前解決、メール送受信、遠隔操作、ファイル転送、監視、時刻同期の12項目。",
    pitfall: "SMTPは送信、POP3は端末取得、IMAP4はサーバー同期。SSHは暗号化、Telnetは平文。FTPとTFTPも区別する。",
    keywords: ["HTTP", "HTTPS", "DNS", "SMTP", "POP3", "IMAP4", "SSH", "Telnet", "FTP", "TFTP", "SNMP", "NTP"],
  },
  {
    id: "network-official-discovery-redundancy",
    kind: "rule",
    title: "CDP / LLDP / STP / VRRP / HSRP",
    value: "PDF掲載は全てL7。括弧内指定によりCDP・LLDP・STPはL2、VRRP・HSRPはL3でも正解。前3つは隣接発見・L2ループ防止、後2つは既定GW冗長化。",
    cue: "PDFの掲載層と、一般的な実装層の両方を覚える代表5項目。",
    pitfall: "CDPはCisco独自、LLDPは標準。VRRPは標準のMaster/Backup、HSRPはCiscoのActive/Standby。",
    keywords: ["CDP", "LLDP", "STP", "VRRP", "HSRP"],
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
