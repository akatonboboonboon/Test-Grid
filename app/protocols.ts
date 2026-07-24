import { PROTOCOL_DESCRIPTIONS } from "./protocol-descriptions";

export type Layer = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ProtocolCard = {
  id: string;
  label: string;
  fullName?: string;
  description?: string;
  layer: Layer;
  layers?: Layer[];
  source: 1 | 2 | "custom";
  note?: string;
  enabled: boolean;
};

type OfficialProtocolSeed = {
  id: string;
  label: string;
  layer: Layer;
  layers?: Layer[];
};

export const ALL_LAYERS: Layer[] = [1, 2, 3, 4, 5, 6, 7];

/** 正式な「ネットワーク範囲.pdf」に掲載された50項目の正式名称。 */
export const PROTOCOL_FORMAL_NAMES: Record<string, string> = {
  "1000BASE-T": "1000BASE-T Gigabit Ethernet over Twisted-Pair Cable",
  "IEEE 802.11ax": "Institute of Electrical and Electronics Engineers 802.11ax High-Efficiency Wireless LAN Standard",
  "Bluetooth": "Bluetooth",
  "Zigbee": "Zigbee",
  "ツイストペアケーブル": "Twisted-Pair Cable",
  "光ファイバー": "Optical Fiber",
  "ARP": "Address Resolution Protocol",
  "GARP": "Gratuitous Address Resolution Protocol",
  "PPP": "Point-to-Point Protocol",
  "PAP": "Password Authentication Protocol",
  "CHAP": "Challenge-Handshake Authentication Protocol",
  "PPPoE": "Point-to-Point Protocol over Ethernet",
  "RADIUS": "Remote Authentication Dial-In User Service",
  "L2TP": "Layer 2 Tunneling Protocol",
  "IPv4": "Internet Protocol version 4",
  "IPv6": "Internet Protocol version 6",
  "ICMP": "Internet Control Message Protocol",
  "NDP": "Neighbor Discovery Protocol",
  "DHCP": "Dynamic Host Configuration Protocol",
  "RIP": "Routing Information Protocol",
  "OSPF": "Open Shortest Path First",
  "EIGRP": "Enhanced Interior Gateway Routing Protocol",
  "BGP": "Border Gateway Protocol",
  "IPsec": "Internet Protocol Security",
  "PPTP": "Point-to-Point Tunneling Protocol",
  "OpenFlow": "OpenFlow",
  "TCP": "Transmission Control Protocol",
  "UDP": "User Datagram Protocol",
  "SIP": "Session Initiation Protocol",
  "RTSP": "Real-Time Streaming Protocol",
  "SSL/TLS": "Secure Sockets Layer / Transport Layer Security",
  "ALPN": "Application-Layer Protocol Negotiation",
  "QUIC": "QUIC (the formal name is no longer treated as an acronym)",
  "HTTP": "Hypertext Transfer Protocol",
  "HTTPS": "Hypertext Transfer Protocol Secure",
  "DNS": "Domain Name System",
  "SMTP": "Simple Mail Transfer Protocol",
  "POP3": "Post Office Protocol version 3",
  "IMAP4": "Internet Message Access Protocol version 4",
  "SSH": "Secure Shell",
  "Telnet": "Telnet",
  "FTP": "File Transfer Protocol",
  "TFTP": "Trivial File Transfer Protocol",
  "SNMP": "Simple Network Management Protocol",
  "NTP": "Network Time Protocol",
  "CDP": "Cisco Discovery Protocol",
  "LLDP": "Link Layer Discovery Protocol",
  "STP": "Spanning Tree Protocol",
  "VRRP": "Virtual Router Redundancy Protocol",
  "HSRP": "Hot Standby Router Protocol",
};

const OFFICIAL_PROTOCOL_SEEDS: OfficialProtocolSeed[] = [
  { id: "l1-1000base-t", label: "1000BASE-T", layer: 1 },
  { id: "l1-ieee-802-11ax", label: "IEEE 802.11ax", layer: 1 },
  { id: "l1-bluetooth", label: "Bluetooth", layer: 1, layers: [1, 2] },
  { id: "l1-zigbee", label: "Zigbee", layer: 1, layers: [1, 2] },
  { id: "l1-twisted-pair-cable", label: "ツイストペアケーブル", layer: 1 },
  { id: "l1-optical-fiber", label: "光ファイバー", layer: 1 },

  { id: "l2-arp", label: "ARP", layer: 2 },
  { id: "l2-garp", label: "GARP", layer: 2 },
  { id: "l2-ppp", label: "PPP", layer: 2 },
  { id: "l2-pap", label: "PAP", layer: 2 },
  { id: "l2-chap", label: "CHAP", layer: 2 },
  { id: "l2-pppoe", label: "PPPoE", layer: 2 },
  { id: "l2-radius", label: "RADIUS", layer: 2, layers: [2, 7] },
  { id: "l2-l2tp", label: "L2TP", layer: 2, layers: [2, 3] },

  { id: "l3-ipv4", label: "IPv4", layer: 3 },
  { id: "l3-ipv6", label: "IPv6", layer: 3 },
  { id: "l3-icmp", label: "ICMP", layer: 3 },
  { id: "l3-ndp", label: "NDP", layer: 3 },
  { id: "l3-dhcp", label: "DHCP", layer: 3, layers: [3, 7] },
  { id: "l3-rip", label: "RIP", layer: 3 },
  { id: "l3-ospf", label: "OSPF", layer: 3 },
  { id: "l3-eigrp", label: "EIGRP", layer: 3 },
  { id: "l3-bgp", label: "BGP", layer: 3 },
  { id: "l3-ipsec", label: "IPsec", layer: 3 },
  { id: "l3-pptp", label: "PPTP", layer: 3, layers: [3, 2] },
  { id: "l3-openflow", label: "OpenFlow", layer: 3, layers: [3, 7] },

  { id: "l4-tcp", label: "TCP", layer: 4 },
  { id: "l4-udp", label: "UDP", layer: 4 },

  { id: "l5-sip", label: "SIP", layer: 5 },
  { id: "l5-rtsp", label: "RTSP", layer: 5 },

  { id: "l6-ssl-tls", label: "SSL/TLS", layer: 6 },
  { id: "l6-alpn", label: "ALPN", layer: 6 },
  { id: "l6-quic", label: "QUIC", layer: 6, layers: [6, 4] },

  { id: "l7-http", label: "HTTP", layer: 7 },
  { id: "l7-https", label: "HTTPS", layer: 7 },
  { id: "l7-dns", label: "DNS", layer: 7 },
  { id: "l7-smtp", label: "SMTP", layer: 7 },
  { id: "l7-pop3", label: "POP3", layer: 7 },
  { id: "l7-imap4", label: "IMAP4", layer: 7 },
  { id: "l7-ssh", label: "SSH", layer: 7 },
  { id: "l7-telnet", label: "Telnet", layer: 7 },
  { id: "l7-ftp", label: "FTP", layer: 7 },
  { id: "l7-tftp", label: "TFTP", layer: 7 },
  { id: "l7-snmp", label: "SNMP", layer: 7 },
  { id: "l7-ntp", label: "NTP", layer: 7 },
  { id: "l7-cdp", label: "CDP", layer: 7, layers: [7, 2] },
  { id: "l7-lldp", label: "LLDP", layer: 7, layers: [7, 2] },
  { id: "l7-stp", label: "STP", layer: 7, layers: [7, 2] },
  { id: "l7-vrrp", label: "VRRP", layer: 7, layers: [7, 3] },
  { id: "l7-hsrp", label: "HSRP", layer: 7, layers: [7, 3] },
];

function officialLayerNote(seed: OfficialProtocolSeed) {
  if (!seed.layers || seed.layers.length < 2) return undefined;
  const secondary = seed.layers.filter((layer) => layer !== seed.layer);
  return `正式PDFではL${seed.layer}に掲載。括弧内の${secondary.map((layer) => `L${layer}`).join("・")}でも正解です。`;
}

export const DEFAULT_CARDS: ProtocolCard[] = OFFICIAL_PROTOCOL_SEEDS.map((seed) => ({
  id: seed.id,
  label: seed.label,
  fullName: PROTOCOL_FORMAL_NAMES[seed.label],
  description: PROTOCOL_DESCRIPTIONS[seed.label],
  layer: seed.layer,
  layers: seed.layers,
  source: seed.layer <= 2 ? 1 : 2,
  note: officialLayerNote(seed),
  enabled: true,
}));

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function storageRead<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function storageWrite(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage availability should never block a practice session.
  }
}

export function isLayer(value: unknown): value is Layer {
  return typeof value === "number" && ALL_LAYERS.includes(value as Layer);
}

export function cardLayers(card: ProtocolCard): Layer[] {
  const layers = card.layers?.filter(isLayer);
  return layers?.length ? [...new Set(layers)] : [card.layer];
}

export function cardLayerLabel(card: ProtocolCard) {
  return cardLayers(card).map((layer) => `L${layer}`).join(" / ");
}

export function normalizeCards(value: unknown): ProtocolCard[] {
  if (!Array.isArray(value)) return DEFAULT_CARDS;

  const normalized = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<ProtocolCard>;
    if (typeof candidate.id !== "string" || typeof candidate.label !== "string" || !isLayer(candidate.layer)) return [];
    const label = candidate.label.trim();
    if (!label) return [];
    const source = candidate.source === 1 || candidate.source === 2 || candidate.source === "custom"
      ? candidate.source
      : "custom";
    const fullName = typeof candidate.fullName === "string" && candidate.fullName.trim()
      ? candidate.fullName.trim()
      : undefined;
    const description = typeof candidate.description === "string" && candidate.description.trim()
      ? candidate.description.trim()
      : undefined;
    const layers = Array.isArray(candidate.layers)
      ? [...new Set(candidate.layers.filter(isLayer))]
      : undefined;
    return [{
      id: candidate.id,
      label,
      fullName,
      description,
      layer: candidate.layer,
      layers: layers?.length ? layers : undefined,
      source,
      note: typeof candidate.note === "string" ? candidate.note : undefined,
      enabled: candidate.enabled !== false,
    } satisfies ProtocolCard];
  });

  const savedById = new Map(normalized.map((card) => [card.id, card]));
  const officialIds = new Set(DEFAULT_CARDS.map((card) => card.id));

  // 正式IDに一致する項目だけON/OFF状態を引き継ぐ。名称・層・説明は正本を優先する。
  const officialCards = DEFAULT_CARDS.map((fallback) => ({
    ...fallback,
    enabled: savedById.get(fallback.id)?.enabled !== false,
  }));

  // 利用者が明示的に追加したカードは維持するが、旧96項目の既定カードは復活させない。
  const customCards = normalized.filter((card) => card.source === "custom" && !officialIds.has(card.id));
  return [...officialCards, ...customCards];
}
