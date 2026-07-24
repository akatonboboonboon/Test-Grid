import type { Layer } from "./protocols";

export type StrictNetworkRubricItem = {
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
  requiredItems: number;
  detailMatched: boolean;
  actionMatched: boolean;
  contradictions: string[];
};

type StrictRubric = {
  items: StrictNetworkRubricItem[];
  contradictions?: StrictNetworkContradiction[];
};

type GradeableNetworkTerm = {
  term: string;
  keywords: string[];
  expectedLayers: Layer[];
};

const STRICT_RUBRICS: Record<string, StrictRubric> = {
  HTTP: {
    items: [
      { label: "要求", aliases: ["要求", "リクエスト", "GET", "POST"] },
      { label: "応答", aliases: ["応答", "レスポンス", "状態コード", "ヘッダー"] },
      { label: "Web資源", aliases: ["Web", "ウェブ", "Webページ", "HTML", "URL", "資源"] },
    ],
  },
  DNS: {
    items: [
      { label: "ドメイン名", aliases: ["ドメイン", "ホスト名", "名前情報"] },
      { label: "IPアドレス", aliases: ["IPアドレス", "IP"] },
      { label: "名前解決", aliases: ["変換", "対応付け", "名前解決", "問い合わせ"] },
    ],
    contradictions: [
      { label: "DHCPとの混同（IP設定の自動配布）", patterns: [/IP(アドレス)?.*(自動)?配布/u, /設定.*自動配布/u] },
    ],
  },
  SMTP: {
    items: [
      { label: "電子メール", aliases: ["電子メール", "メール"] },
      { label: "送信", aliases: ["送信", "投稿", "差し出"] },
      { label: "サーバー間中継", aliases: ["中継", "メールサーバー間", "サーバー同士", "宛先側"] },
    ],
    contradictions: [
      { label: "POP3・IMAPとの混同（メール受信）", patterns: [/メール.*受信/u, /受信箱.*取得/u, /メール.*ダウンロード/u] },
    ],
  },
  FTP: {
    items: [
      { label: "ファイル", aliases: ["ファイル"] },
      { label: "制御用接続", aliases: ["制御用接続", "制御接続", "制御用", "ポート21"] },
      { label: "データ用接続", aliases: ["データ用接続", "データ接続", "データ用", "送受信", "転送"] },
    ],
    contradictions: [
      { label: "標準FTPを暗号化方式として説明", patterns: [/FTP.*暗号化(する|される|を行う)/u, /通信内容.*暗号化(する|される)/u] },
    ],
  },
  NTP: {
    items: [
      { label: "時刻", aliases: ["時刻", "時計"] },
      { label: "基準時刻", aliases: ["基準時刻", "時刻サーバー", "時刻サーバ", "基準時計"] },
      { label: "同期", aliases: ["同期", "時刻を合わせ", "時計を合わせ", "補正"] },
    ],
  },
  SNMP: {
    items: [
      { label: "機器管理・監視", aliases: ["管理", "監視", "障害"] },
      { label: "MIB", aliases: ["MIB", "管理情報"] },
      { label: "マネージャ／エージェント", aliases: ["マネージャ", "エージェント", "管理側", "機器側", "Trap", "Inform"] },
    ],
  },
  TCP: {
    items: [
      { label: "接続確立", aliases: ["接続確立", "接続を確立", "コネクション"] },
      { label: "確認応答・再送", aliases: ["確認応答", "ACK", "再送"] },
      { label: "信頼性・順序制御", aliases: ["信頼", "順序", "番号付け", "フロー制御", "輻輳制御"] },
    ],
    contradictions: [
      { label: "UDPとの混同（再送・接続を行わない）", patterns: [/再送(しない|せず|を行わない|も?行わず)/u, /接続(を)?確立(しない|せず|不要)/u, /順序.*保証しない/u] },
    ],
  },
  UDP: {
    items: [
      { label: "接続を確立しない", aliases: ["接続確立をしない", "接続を確立しない", "接続なし", "接続不要", "コネクションレス"] },
      { label: "到着・順序・再送を保証しない", aliases: ["再送しない", "再送を行わない", "保証しない", "順序を保証しない", "到着を保証しない"] },
      { label: "軽量・リアルタイム", aliases: ["高速", "処理が軽い", "軽量", "リアルタイム", "データグラム"] },
    ],
    contradictions: [
      { label: "TCPとの混同（確認応答・再送で信頼性を保証）", patterns: [/確認応答.*再送/u, /再送(する|を行う|によって)/u, /信頼性.*保証/u] },
    ],
  },
  IPv4: {
    items: [
      { label: "32ビット", aliases: ["32ビット", "32bit"] },
      { label: "IPアドレス", aliases: ["IPアドレス", "端末とネットワーク", "宛先"] },
      { label: "パケット配送", aliases: ["パケット", "ルーター", "ルーティング", "ベストエフォート", "ネットワーク間"] },
    ],
  },
  ICMP: {
    items: [
      { label: "エラー通知", aliases: ["エラー", "到達不能", "時間超過"] },
      { label: "制御・診断", aliases: ["制御情報", "診断", "疎通確認", "到達確認"] },
      { label: "ping／Echo", aliases: ["ping", "Ping", "Echo", "エコー"] },
    ],
    contradictions: [
      { label: "DHCPとの混同（IP設定の配布）", patterns: [/IP(アドレス)?.*(自動)?配布/u, /設定.*割り当/u] },
    ],
  },
  DHCP: {
    items: [
      { label: "IP通信設定", aliases: ["IPアドレス", "サブネットマスク", "デフォルトゲートウェイ", "DNS"] },
      { label: "自動配布", aliases: ["自動配布", "自動設定", "自動的に割り当", "自動割り当"] },
      { label: "リース／DORA", aliases: ["リース", "Discover", "Offer", "Request", "ACK", "DORA"] },
    ],
    contradictions: [
      { label: "DNSとの混同（ドメイン名の名前解決）", patterns: [/ドメイン名.*IPアドレス.*(変換|対応)/u, /名前解決/u] },
    ],
  },
  OSPF: {
    items: [
      { label: "リンク状態", aliases: ["リンク状態", "ネットワーク全体の地図", "トポロジ"] },
      { label: "最短経路", aliases: ["最短経路", "SPF", "ダイクストラ"] },
      { label: "IGP・同一AS内", aliases: ["IGP", "同一AS", "AS内", "エリア"] },
    ],
    contradictions: [
      { label: "BGPとの混同（AS間の経路交換）", patterns: [/(AS間|自律システム間).*経路/u] },
    ],
  },
  BGP: {
    items: [
      { label: "AS間", aliases: ["AS間", "自律システム間", "インターネット"] },
      { label: "経路交換", aliases: ["経路情報", "経路交換", "到達可能"] },
      { label: "ASパス・ポリシー", aliases: ["ASパス", "AS番号", "運用ポリシー", "属性"] },
    ],
    contradictions: [
      { label: "OSPFとの混同（同一AS内の最短経路計算）", patterns: [/同一AS内/u, /リンク状態.*最短経路/u] },
    ],
  },
  ARP: {
    items: [
      { label: "同一LAN", aliases: ["同一LAN", "LAN内", "同一リンク"] },
      { label: "IPv4アドレス", aliases: ["IPv4アドレス", "IPアドレス"] },
      { label: "MACアドレスを解決", aliases: ["MACアドレス", "MAC", "問い合わせ", "対応"] },
    ],
    contradictions: [
      { label: "変換方向が逆", patterns: [/MACアドレスからIPアドレス/u, /MAC.*IP.*調べ/u] },
    ],
  },
  STP: {
    items: [
      { label: "冗長リンクを遮断", aliases: ["冗長リンク", "冗長経路", "待機状態", "遮断", "ブロック"] },
      { label: "レイヤー2ループ防止", aliases: ["ループ", "ブロードキャストストーム", "循環"] },
      { label: "木構造・障害時切替", aliases: ["木構造", "スパニングツリー", "障害時", "経路を切り替"] },
    ],
    contradictions: [
      { label: "ルーティングプロトコルとの混同", patterns: [/IPアドレス.*最短経路/u, /ルーター.*経路表/u] },
    ],
  },
};

const RUBRIC_ALIAS_EXPANSIONS: Record<string, string[]> = {
  暗号: ["暗号", "暗号化", "盗聴"], 認証: ["認証", "本人確認", "証明書"],
  経路: ["経路", "ルーティング", "ルーター"], パケット: ["パケット", "データグラム"],
  フレーム: ["フレーム"], MAC: ["MAC", "MACアドレス"], ポート: ["ポート", "ポート番号"],
  再送: ["再送", "確認応答", "ACK"], 名前: ["名前", "ドメイン", "ホスト名"],
  IPアドレス: ["IPアドレス", "IP"], メール: ["メール", "電子メール"], 時刻: ["時刻", "時計"],
  同期: ["同期", "合わせ", "補正"], ファイル: ["ファイル"], 転送: ["転送", "送受信", "配送"],
  HTTP: ["HTTP", "リクエスト", "レスポンス"], Web: ["Web", "ウェブ", "HTML", "URL"],
  管理: ["管理", "MIB", "マネージャ"], 監視: ["監視", "Trap", "Inform", "障害"],
  ログ: ["ログ", "記録"], イベント: ["イベント", "メッセージ"], 音声: ["音声", "通話"],
  映像: ["映像", "動画"], 接続: ["接続", "コネクション"], セッション: ["セッション", "接続"],
  信号: ["信号", "電波", "電気"], 伝送: ["伝送", "送受信", "通信"], 媒体: ["媒体", "ケーブル", "無線"],
  リンク: ["リンク", "同一LAN"], 通信: ["通信", "データ"], 要求: ["要求", "リクエスト"],
  サービス: ["サービス", "アプリケーション"], 変換: ["変換", "表現"], データ: ["データ", "情報"],
};

const LAYER_FALLBACK: Record<Layer, StrictNetworkRubricItem[]> = {
  1: [{ label: "伝送対象", aliases: ["信号", "ビット", "電波"] }, { label: "伝送媒体・方式", aliases: ["ケーブル", "無線", "媒体", "伝送"] }],
  2: [{ label: "フレーム", aliases: ["フレーム"] }, { label: "同一リンク・MAC", aliases: ["同一LAN", "同一リンク", "MAC"] }],
  3: [{ label: "パケット・IP", aliases: ["パケット", "IPアドレス", "IP"] }, { label: "経路・ネットワーク間", aliases: ["経路", "ルーティング", "ネットワーク間"] }],
  4: [{ label: "端末間転送", aliases: ["端末間", "転送", "通信"] }, { label: "ポート・信頼性", aliases: ["ポート", "再送", "順序", "信頼"] }],
  5: [{ label: "セッション", aliases: ["セッション", "接続"] }, { label: "確立・維持・終了", aliases: ["確立", "維持", "終了"] }],
  6: [{ label: "データ表現", aliases: ["表現", "変換", "データ"] }, { label: "暗号化", aliases: ["暗号", "暗号化"] }],
  7: [{ label: "アプリケーション", aliases: ["アプリケーション", "サービス"] }, { label: "具体的な通信機能", aliases: ["要求", "応答", "転送", "管理", "同期"] }],
};

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/[\s、。・／/（）()「」『』,.:：-]/gu, "");
}

function fallbackItems(term: GradeableNetworkTerm) {
  const items = term.keywords.map((keyword) => ({
    label: keyword,
    aliases: RUBRIC_ALIAS_EXPANSIONS[keyword] ?? [keyword],
  }));
  if (items.length < 2) term.expectedLayers.forEach((layer) => items.push(...LAYER_FALLBACK[layer]));
  return [...new Map(items.map((item) => [item.label, item])).values()];
}

export function gradeNetworkWrittenContent(term: GradeableNetworkTerm, answer: string): StrictNetworkContentGrade {
  const normalizedAnswer = normalize(answer);
  const normalizedTerm = normalize(term.term);
  const answerWithoutTerm = normalizedTerm ? normalizedAnswer.split(normalizedTerm).join("") : normalizedAnswer;
  const rubric = STRICT_RUBRICS[term.term];
  const items = rubric?.items ?? fallbackItems(term);
  const requiredItems = Math.min(3, Math.max(2, items.length));
  const matchedItems = items
    .filter((item) => item.aliases.some((alias) => answerWithoutTerm.includes(normalize(alias))))
    .map((item) => item.label);
  const contradictions = (rubric?.contradictions ?? [])
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(normalizedAnswer)))
    .map((rule) => rule.label);
  const actionMatched = /(送|受|転送|配送|交換|通知|取得|変更|管理|監視|同期|暗号|認証|変換|対応|割り当|配布|問い合わせ|確認|再送|制御|保証|識別|計算|選択|遮断|防止|構成|確立|接続|利用|使用|定め|守|届け|運|中継|ルーティング|保存|設定)/u.test(answerWithoutTerm);
  return {
    matchedItems,
    expectedItems: items.map((item) => item.label),
    requiredItems,
    detailMatched: matchedItems.length >= requiredItems,
    actionMatched,
    contradictions,
  };
}