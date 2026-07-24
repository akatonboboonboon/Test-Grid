import type { Layer } from "./protocols";

export type StrictNetworkRubricDimension = "対象" | "動作" | "固有特徴";

export type StrictNetworkRubricItem = {
  dimension: StrictNetworkRubricDimension;
  label: string;
  aliases: string[];
};

export type StrictNetworkContradiction = {
  label: string;
  patterns: RegExp[];
};

export type StrictNetworkContentGrade = {
  matchedItems: string[];
  expectedItems: string[];
  matchedDimensions: StrictNetworkRubricDimension[];
  requiredItems: 3;
  detailMatched: boolean;
  actionMatched: boolean;
  contradictions: string[];
};

type StrictRubric = {
  items: [StrictNetworkRubricItem, StrictNetworkRubricItem, StrictNetworkRubricItem];
  contradictions: StrictNetworkContradiction[];
};

type GradeableNetworkTerm = {
  term: string;
  keywords: string[];
  expectedLayers: Layer[];
};

type RubricPart = [label: string, aliases: string[]];

function rubric(
  target: RubricPart,
  action: RubricPart,
  distinctive: RubricPart,
  contradictions: StrictNetworkContradiction[] = [],
): StrictRubric {
  return {
    items: [
      { dimension: "対象", label: target[0], aliases: target[1] },
      { dimension: "動作", label: action[0], aliases: action[1] },
      { dimension: "固有特徴", label: distinctive[0], aliases: distinctive[1] },
    ],
    contradictions,
  };
}

function conflict(label: string, ...patterns: RegExp[]): StrictNetworkContradiction {
  return { label, patterns };
}

/**
 * 「ネットワーク範囲.pdf」（2026-07-24）の正式50項目専用ルーブリック。
 * 各項目は必ず、対象・動作・その用語でなければならない固有特徴を1つずつ持つ。
 * OSI層だけに通用する「通信する」「転送する」などの汎用語では満点にならない。
 */
const STRICT_RUBRICS: Record<string, StrictRubric> = {
  "1000BASE-T": rubric(
    ["ツイストペアの有線LAN", ["ツイストペア", "銅線", "有線LAN"]],
    ["イーサネット信号を伝送", ["イーサネットの信号を伝送", "Ethernet信号を伝送", "電気信号を伝送"]],
    ["1Gbps・4対8芯", ["1Gbps", "1000Mbps", "4対", "8芯", "ギガビット"]],
  ),
  "IEEE 802.11ax": rubric(
    ["多数端末の無線LAN", ["無線LAN", "多数端末", "Wi-Fi"]],
    ["無線通信効率を高める", ["通信効率を高め", "効率を向上", "同時通信"]],
    ["Wi-Fi 6・OFDMA", ["Wi-Fi 6", "WiFi6", "OFDMA", "802.11ax"]],
  ),
  Bluetooth: rubric(
    ["近距離端末・周辺機器", ["近距離", "周辺機器", "端末同士"]],
    ["無線接続", ["無線接続", "無線で接続", "無線通信"]],
    ["2.4GHz・低消費電力", ["2.4GHz", "低消費電力", "省電力"]],
  ),
  Zigbee: rubric(
    ["センサー・IoT機器", ["センサー", "IoT機器", "IoT端末"]],
    ["多数端末を無線接続", ["多数の端末", "無線接続", "無線で接続"]],
    ["低速低消費電力・メッシュ", ["メッシュ", "低速", "低消費電力", "省電力"]],
  ),
  ツイストペアケーブル: rubric(
    ["対になった銅線", ["2本の銅線", "銅線", "より対線"]],
    ["線をより合わせてノイズ低減", ["より合わせ", "撚り合わせ", "ノイズを減", "漏話を減"]],
    ["電気信号のLAN媒体", ["電気信号", "LAN", "伝送媒体"]],
  ),
  光ファイバー: rubric(
    ["光信号", ["光の点滅", "光信号", "光でデータ"]],
    ["長距離・大容量伝送", ["長距離", "大容量", "高速伝送"]],
    ["電磁ノイズに強い", ["電磁ノイズ", "ノイズの影響を受けにく", "電磁誘導"]],
  ),
  ARP: rubric(
    ["同一LANのIPv4宛先", ["同一LAN", "LAN内", "IPv4アドレス"]],
    ["IPからMACを問い合わせる", ["MACアドレスを問い合わせ", "MACアドレスを解決", "IPアドレスに対応するMAC"]],
    ["フレーム送信先を特定", ["フレーム送信先", "ARP要求", "ARP応答", "ブロードキャスト"]],
    [conflict("変換方向が逆", /MAC(アドレス)?からIP(アドレス)?/u)],
  ),
  GARP: rubric(
    ["自分のIP・MAC対応", ["自分のIPアドレス", "自分のIPとMAC", "自身のIP"]],
    ["要求なしで通知", ["問い合わせを受けず", "要求なし", "自発的に通知", "ブロードキャストで通知"]],
    ["重複検出・切替通知", ["重複検出", "重複アドレス", "切替通知", "ARPキャッシュを更新"]],
  ),
  PPP: rubric(
    ["2点間リンク", ["2点間", "ポイントツーポイント", "直結回線"]],
    ["フレーム化とリンク確立", ["フレーム化", "リンク確立", "リンクを確立"]],
    ["LCP・認証・NCP", ["LCP", "NCP", "認証", "ネットワーク層プロトコルを設定"]],
  ),
  PAP: rubric(
    ["利用者名・パスワード", ["利用者名", "ユーザー名", "パスワード"]],
    ["資格情報を送って認証", ["送って認証", "送信して認証", "本人確認"]],
    ["平文・2ウェイ", ["暗号化せず", "平文", "2ウェイ", "2段階"]],
    [conflict("CHAPとの混同", /チャレンジ.*ハッシュ/u, /パスワード(自体)?を送ら(ない|ず)/u)],
  ),
  CHAP: rubric(
    ["チャレンジと共有秘密", ["チャレンジ", "乱数", "共有秘密", "パスワード"]],
    ["ハッシュ応答で認証", ["ハッシュ応答", "ハッシュ値", "応答を照合", "認証"]],
    ["パスワードを送らない", ["パスワード自体を送ら", "パスワードを送信しない", "3ウェイ"]],
    [conflict("PAPとの混同", /パスワード.*(平文|暗号化せず).*送/u)],
  ),
  PPPoE: rubric(
    ["PPPフレームとEthernet", ["PPPフレーム", "PPPをイーサネット", "Ethernet上"]],
    ["Ethernet上でカプセル化", ["イーサネット上で運", "Ethernetで運", "カプセル化"]],
    ["回線利用者認証・IP設定", ["利用者の認証", "回線認証", "IP設定", "セッションID"]],
  ),
  RADIUS: rubric(
    ["利用者とネットワーク機器", ["利用者", "ネットワーク機器", "アクセス要求"]],
    ["AAAを集中管理", ["集中管理", "認証", "認可", "利用記録"]],
    ["認証・認可・アカウンティング", ["AAA", "アカウンティング", "利用記録", "RADIUSサーバー"]],
  ),
  L2TP: rubric(
    ["PPPなどのL2フレーム", ["PPP", "レイヤー2フレーム", "L2フレーム"]],
    ["IP網越しにトンネル転送", ["IP網", "トンネル転送", "トンネリング"]],
    ["単体暗号化なし・IPsec併用", ["暗号化しない", "暗号化は行わない", "IPsecと組み合わせ", "IPsecなどと組み合わせ", "IPsecを併用"]],
    [conflict("単体で暗号化すると誤認", /L2TP.*暗号化(する|を行う)/u)],
  ),
  IPv4: rubric(
    ["IPアドレスで端末・網を識別", ["IPアドレス", "端末とネットワーク", "宛先を識別"]],
    ["ルーター越しにパケット中継", ["パケットを中継", "ルーターを越", "ネットワーク間で配送"]],
    ["32ビット", ["32ビット", "32bit", "ドット付き10進"]],
  ),
  IPv6: rubric(
    ["IPアドレスで端末・網を識別", ["IPアドレス", "端末とネットワーク", "宛先を識別"]],
    ["広い空間を提供・近隣探索", ["アドレス空間を提供", "近隣探索", "パケットを配送", "ルーティング"]],
    ["128ビット・NDP", ["128ビット", "128bit", "NDP", "広いアドレス空間"]],
  ),
  ICMP: rubric(
    ["IP通信のエラー・制御情報", ["エラー", "到達不能", "時間超過", "制御情報"]],
    ["送信元へ通知・疎通診断", ["通知", "疎通確認", "到達確認", "診断"]],
    ["ping・Echo", ["ping", "Echo", "エコー"]],
    [conflict("DHCPとの混同", /IP(アドレス)?.*(自動)?(配布|割り当)/u)],
  ),
  NDP: rubric(
    ["IPv6の近隣端末・ルーター", ["IPv6", "近隣端末", "ルーター", "プレフィックス"]],
    ["リンク層アドレス等を探索", ["リンク層アドレス", "MACアドレス", "近隣探索", "ルーター探索"]],
    ["ICMPv6・DAD", ["ICMPv6", "重複アドレス", "DAD", "RA", "NS", "NA"]],
  ),
  DHCP: rubric(
    ["端末のIP通信設定", ["端末へ", "端末のIP通信", "IP通信設定"]],
    ["設定を自動貸与・割当", ["自動的に貸し出", "自動配布", "自動設定", "自動割り当"]],
    ["複数設定・リース/DORA", ["サブネットマスク", "ゲートウェイ", "DNSなどの設定", "リース", "DORA", "Discover", "Offer", "Request", "ACK"]],
    [conflict("DNSとの混同", /ドメイン(名)?.*IP(アドレス)?.*(変換|対応|解決)/u, /名前解決/u)],
  ),
  RIP: rubric(
    ["ルーター間の経路情報", ["経路情報", "ルーティング情報", "宛先ネットワーク"]],
    ["距離ベクトルを定期交換", ["定期交換", "距離ベクトル", "経路を交換"]],
    ["ホップ数・最大15", ["ホップ数", "最大15", "15ホップ"]],
  ),
  OSPF: rubric(
    ["同一AS内のリンク状態", ["リンク状態", "同一AS", "AS内", "トポロジ"]],
    ["最短経路を計算", ["最短経路", "経路を計算", "SPF"]],
    ["Dijkstra・エリア・IGP", ["ダイクストラ", "Dijkstra", "エリア", "IGP"]],
    [conflict("BGPとの混同", /(AS間|自律システム間).*経路/u)],
  ),
  EIGRP: rubric(
    ["同一AS内の経路", ["経路", "ルーティング", "IGP"]],
    ["DUALで経路計算・収束", ["DUAL", "経路を計算", "高速な収束"]],
    ["複合メトリック・予備経路", ["帯域幅", "遅延", "複合メトリック", "フィージブルサクセサ", "予備経路"]],
  ),
  BGP: rubric(
    ["異なるAS間の経路", ["AS間", "自律システム間", "インターネットの経路"]],
    ["到達経路を交換・選択", ["経路を交換", "到達経路", "経路を選択"]],
    ["AS_PATH・運用ポリシー", ["ASパス", "AS_PATH", "AS番号", "運用ポリシー", "パスベクトル"]],
    [conflict("OSPFとの混同", /同一AS内/u, /リンク状態.*最短経路/u)],
  ),
  IPsec: rubric(
    ["IPパケット", ["IPパケット", "IP通信", "ネットワーク層"]],
    ["暗号化・認証・完全性確認", ["暗号化", "送信元認証", "完全性", "改ざん検知"]],
    ["AH・ESP・VPN", ["AH", "ESP", "VPN", "トンネルモード", "再送攻撃"]],
  ),
  PPTP: rubric(
    ["PPPフレーム", ["PPPフレーム", "PPP"]],
    ["GREでトンネル転送", ["GRE", "トンネル", "カプセル化"]],
    ["TCP制御・旧式で脆弱", ["TCP", "1723", "旧式", "安全性が不足", "脆弱"]],
  ),
  OpenFlow: rubric(
    ["スイッチのフロー表", ["フロー表", "フローテーブル", "スイッチ"]],
    ["コントローラーが処理規則を設定", ["コントローラー", "規則を設定", "処理を指示", "集中制御"]],
    ["SDN・制御/転送分離", ["SDN", "制御プレーン", "データプレーン", "条件に一致するパケット"]],
  ),
  TCP: rubric(
    ["アプリ間のバイト列", ["バイト列", "アプリケーション間", "端点間"]],
    ["接続確立して信頼転送", ["接続を確立", "接続確立", "信頼できる", "確実に届け"]],
    ["番号・ACK・再送・順序制御", ["番号付け", "シーケンス番号", "確認応答", "ACK", "再送", "順序制御", "流量制御"]],
    [conflict("UDPとの混同", /接続(を)?確立(しない|せず|不要)/u, /接続なし/u, /再送(しない|せず|を行わない)/u, /順序.*保証しない/u)],
  ),
  UDP: rubric(
    ["アプリ間のデータグラム", ["データグラム", "アプリケーション間", "端点間"]],
    ["接続なしで送信", ["接続を確立しない", "接続確立や到着", "接続不要", "コネクションレス", "接続なし"]],
    ["到着順序・再送保証なし", ["到着を保証しない", "順序を保証しない", "順序保証を行わず", "再送しない", "軽量", "軽い処理", "リアルタイム"]],
    [conflict("TCPとの混同", /確認応答.*再送/u, /信頼性.*保証/u, /接続を確立.*再送/u)],
  ),
  SIP: rubric(
    ["IP電話・映像会議の相手", ["IP電話", "映像会議", "通話相手"]],
    ["呼出・応答・終了を制御", ["呼び出", "応答", "セッション終了", "確立", "切断"]],
    ["SDP交渉・シグナリング", ["SDP", "通信条件の交渉", "シグナリング", "INVITE"]],
  ),
  RTSP: rubric(
    ["ストリーミング配信", ["ストリーミング", "動画配信", "メディア配信"]],
    ["再生状態を遠隔操作", ["再生", "一時停止", "早送り", "位置指定", "遠隔操作"]],
    ["PLAY・PAUSE等の複数制御", ["PLAY", "PAUSE", "再生、一時停止", "再生一時停止", "DESCRIBE", "SETUP", "RTPとは別"]],
  ),
  "SSL/TLS": rubric(
    ["アプリケーション通信", ["アプリケーション通信", "通信内容", "クライアントとサーバー"]],
    ["暗号化・相手認証", ["暗号化", "相手を認証", "サーバー認証", "改ざんを検出"]],
    ["証明書・ハンドシェイク", ["証明書", "ハンドシェイク", "共通鍵", "TLS"]],
  ),
  ALPN: rubric(
    ["アプリケーションプロトコル", ["アプリケーションプロトコル", "HTTP/2", "HTTP/1.1"]],
    ["TLS中に使用方式を交渉", ["TLSハンドシェイク中", "TLS中", "プロトコルを交渉", "選択"]],
    ["接続前に接続後の方式を合意", ["接続後に使用", "追加の往復", "ALPN拡張", "ネゴシエーション"]],
  ),
  QUIC: rubric(
    ["多重ストリーム", ["多重ストリーム", "複数ストリーム", "HTTP/3"]],
    ["UDP上で信頼転送", ["UDP上", "UDPを使", "信頼性", "再送"]],
    ["TLS 1.3統合・接続短縮", ["TLS 1.3", "TLS1.3", "0-RTT", "接続開始を短縮", "HTTP/3の基盤"]],
  ),
  HTTP: rubric(
    ["Web資源", ["Webページ", "Web資源", "HTML", "API", "URL"]],
    ["要求と応答で転送", ["要求", "リクエスト", "応答", "レスポンス", "転送"]],
    ["クライアント/サーバー・メソッド", ["クライアント", "サーバー", "GET", "POST", "メソッド", "状態コード", "ステートレス"]],
  ),
  HTTPS: rubric(
    ["HTTPのWeb通信", ["HTTP通信", "Webページ", "Web通信", "API"]],
    ["TLSで暗号化", ["TLSで暗号化", "暗号化"]],
    ["認証・機密性・完全性", ["サーバー認証", "機密性", "完全性", "証明書", "443"]],
  ),
  DNS: rubric(
    ["ドメイン名・資源レコード", ["ドメイン名", "ホスト名", "資源レコード"]],
    ["名前とIP等を対応付け", ["IPアドレスに変換", "対応付け", "名前解決", "問い合わせ"]],
    ["階層分散・A/AAAA/MX", ["階層", "分散", "Aレコード", "AAAA", "MX"]],
    [conflict("DHCPとの混同", /IP(アドレス)?.*(自動)?(配布|割り当|貸し出)/u)],
  ),
  SMTP: rubric(
    ["電子メール", ["電子メール", "メール"]],
    ["投稿・送信・中継", ["送信", "投稿", "中継"]],
    ["メールサーバー間配送", ["メールサーバー間", "サーバー間", "宛先サーバー", "ポート25"]],
    [conflict("受信専用方式との混同", /受信箱.*(取得|同期)/u, /メール.*ダウンロード/u)],
  ),
  POP3: rubric(
    ["サーバーの受信メール", ["受信箱", "メールサーバー", "メッセージ"]],
    ["端末へ取得・ダウンロード", ["端末へ取得", "ダウンロード", "受信", "取り込"]],
    ["主に端末側で管理", ["端末側で管理", "ローカルで管理", "サーバーから削除", "オフライン"]],
    [conflict("IMAP4との混同", /複数端末.*同期/u, /既読状態.*同期/u)],
  ),
  IMAP4: rubric(
    ["サーバー上のメール", ["サーバー上", "メールサーバー", "受信メール"]],
    ["状態・フォルダーを同期", ["同期", "既読状態", "フォルダー", "管理"]],
    ["複数端末・サーバー保持", ["複数端末", "サーバー上に保持", "一元管理"]],
    [conflict("POP3との混同", /端末側で管理/u, /サーバーから削除/u)],
  ),
  SSH: rubric(
    ["遠隔端末・コマンド", ["遠隔ログイン", "リモートログイン", "コマンド実行", "遠隔端末"]],
    ["暗号化して安全に接続", ["暗号化", "安全に", "相手認証"]],
    ["トンネル・SFTP・22", ["トンネリング", "ポート22", "SFTP", "SCP", "公開鍵"]],
  ),
  Telnet: rubric(
    ["遠隔端末", ["遠隔端末", "遠隔ログイン", "リモート端末"]],
    ["文字ベースで接続", ["文字ベース", "コマンド操作", "接続"]],
    ["平文・非暗号化", ["暗号化しない", "暗号化されない", "平文", "ポート23"]],
    [conflict("SSHとの混同", /暗号化.*安全/u, /公開鍵.*認証/u)],
  ),
  FTP: rubric(
    ["ファイル", ["ファイル", "ディレクトリ", "一覧"]],
    ["認証後に送受信・操作", ["送受信", "転送", "一覧操作", "アップロード", "ダウンロード"]],
    ["制御用とデータ用の別接続", ["制御用接続", "データ用接続", "2つの接続", "ポート21", "アクティブ", "パッシブ"]],
    [conflict("標準FTPを暗号化方式と誤認", /FTP.*暗号化(する|される)/u)],
  ),
  TFTP: rubric(
    ["起動・設定ファイル", ["起動ファイル", "設定ファイル", "小さなファイル", "ファイル"]],
    ["UDPで単純転送", ["UDP", "単純な手順", "転送"]],
    ["認証・一覧なし", ["認証がない", "認証なし", "認証や一覧機能を持たず", "一覧機能を持たない", "一覧機能を持たず", "ポート69"]],
  ),
  SNMP: rubric(
    ["ネットワーク機器の管理情報", ["ネットワーク機器", "管理情報", "MIB"]],
    ["取得・変更・監視", ["取得", "変更", "管理", "監視"]],
    ["マネージャ/エージェント・Trap", ["マネージャ", "エージェント", "Trap", "Inform"]],
  ),
  NTP: rubric(
    ["機器の時計・時刻", ["時計", "時刻", "機器の時刻"]],
    ["基準時刻へ同期・補正", ["同期", "時刻を合わせ", "補正"]],
    ["階層・Stratum・遅延見積", ["階層", "Stratum", "ストラタム", "通信遅延", "ポート123"]],
  ),
  CDP: rubric(
    ["直結するCisco機器", ["Cisco機器", "シスコ機器", "隣接装置"]],
    ["装置・ポート情報を通知・発見", ["通知", "発見", "装置名", "機種", "ポート"]],
    ["Cisco独自・L2", ["Cisco独自", "シスコ独自", "独自方式", "レイヤー2"]],
  ),
  LLDP: rubric(
    ["隣接する異種メーカー機器", ["隣接する機器", "異なるメーカー", "マルチベンダ"]],
    ["装置・ポート情報を通知・発見", ["通知", "発見", "装置名", "ポート"]],
    ["IEEE標準・L2", ["標準方式", "IEEE 802.1AB", "802.1AB", "レイヤー2"]],
    [conflict("CDPとの混同", /Cisco(機器)?(だけ|専用|独自)/u, /シスコ独自/u)],
  ),
  STP: rubric(
    ["冗長なスイッチリンク", ["冗長リンク", "冗長経路", "スイッチ間"]],
    ["一部を待機・遮断して木構造化", ["待機", "遮断", "ブロック", "木構造", "ルートブリッジ"]],
    ["L2ループ防止", ["レイヤー2のループ", "L2ループ", "ループを防止", "ブロードキャストストーム"]],
    [conflict("ルーティングとの混同", /IPアドレス.*最短経路/u, /ルーター.*経路表/u)],
  ),
  VRRP: rubric(
    ["複数ルーターの既定GW", ["複数ルーター", "デフォルトゲートウェイ", "既定ゲートウェイ"]],
    ["仮想IPを共有し障害時切替", ["仮想IP", "共有", "障害時", "切り替"]],
    ["標準・Master/Backup", ["Master", "Backup", "マスター", "バックアップ", "標準プロトコル", "VRRP"]],
  ),
  HSRP: rubric(
    ["複数ルーターの既定GW", ["複数ルーター", "デフォルトゲートウェイ", "既定ゲートウェイ"]],
    ["仮想IP・MACで障害時切替", ["仮想IP", "仮想MAC", "共有", "障害時", "切り替"]],
    ["Cisco独自・Active/Standby", ["Cisco", "シスコ", "Active", "Standby", "アクティブ", "スタンバイ"]],
  ),
};

export const NETWORK_STRICT_RUBRIC_TERMS = Object.freeze(Object.keys(STRICT_RUBRICS));

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/[\s、。・／/（）()「」『』,.:：_-]/gu, "");
}

function matchedItemsFor(rubricValue: StrictRubric, normalizedAnswer: string) {
  return rubricValue.items.filter((item) => (
    item.aliases.some((alias) => normalizedAnswer.includes(normalize(alias)))
  ));
}

export function gradeNetworkWrittenContent(term: GradeableNetworkTerm, answer: string): StrictNetworkContentGrade {
  const normalizedAnswer = normalize(answer);
  const normalizedTerm = normalize(term.term);
  const answerWithoutTerm = normalizedTerm ? normalizedAnswer.split(normalizedTerm).join("") : normalizedAnswer;
  const rubricValue = STRICT_RUBRICS[term.term];
  if (!rubricValue) {
    return {
      matchedItems: [],
      expectedItems: [],
      matchedDimensions: [],
      requiredItems: 3,
      detailMatched: false,
      actionMatched: false,
      contradictions: [`正式50項目の専用ルーブリックが未登録：${term.term}`],
    };
  }

  const matched = matchedItemsFor(rubricValue, answerWithoutTerm);
  const matchedDimensions = matched.map((item) => item.dimension);
  const contradictions = rubricValue.contradictions
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(normalizedAnswer)))
    .map((rule) => rule.label);

  if (matchedDimensions.length <= 1) {
    const wrongTerm = Object.entries(STRICT_RUBRICS).find(([otherTerm, otherRubric]) => (
      otherTerm !== term.term && matchedItemsFor(otherRubric, normalizedAnswer).length === 3
    ));
    if (wrongTerm) contradictions.push(`別用語「${wrongTerm[0]}」の説明`);
  }

  return {
    matchedItems: matched.map((item) => `${item.dimension}：${item.label}`),
    expectedItems: rubricValue.items.map((item) => `${item.dimension}：${item.label}`),
    matchedDimensions,
    requiredItems: 3,
    detailMatched: matchedDimensions.length === 3,
    actionMatched: matchedDimensions.includes("動作"),
    contradictions: [...new Set(contradictions)],
  };
}