export type Layer = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ProtocolCard = {
  id: string;
  label: string;
  fullName?: string;
  layer: Layer;
  layers?: Layer[];
  source: 1 | 2 | "custom";
  note?: string;
  enabled: boolean;
};

export const ALL_LAYERS: Layer[] = [1, 2, 3, 4, 5, 6, 7];

export const PROTOCOL_FORMAL_NAMES: Record<string, string> = {
  "イーサネット": "Ethernet（有線LAN規格。略語ではない）",
  "10BASE-T": "10 Mbps Baseband Ethernet over Twisted-Pair Cable",
  "IEEE 802.11": "Institute of Electrical and Electronics Engineers 802.11 — Wireless LAN MAC/PHY Standard",
  "Bluetooth": "Bluetooth（近距離無線通信規格。略語ではない）",
  "Zigbee": "Zigbee（低消費電力・近距離メッシュ無線通信規格。略語ではない）",
  "IEEE 802.1X": "Institute of Electrical and Electronics Engineers 802.1X — Port-Based Network Access Control",
  "EAP": "Extensible Authentication Protocol",
  "EAPoL": "Extensible Authentication Protocol over LAN",
  "RADIUS": "Remote Authentication Dial-In User Service",
  "EAP-TLS": "Extensible Authentication Protocol – Transport Layer Security",
  "PEAP": "Protected Extensible Authentication Protocol",
  "EAP-SIM/AKA": "Extensible Authentication Protocol – Subscriber Identity Module / Authentication and Key Agreement",
  "WEP": "Wired Equivalent Privacy",
  "WPA": "Wi-Fi Protected Access",
  "WPA2": "Wi-Fi Protected Access 2",
  "WPA3": "Wi-Fi Protected Access 3",
  "RC4": "Rivest Cipher 4",
  "TKIP": "Temporal Key Integrity Protocol",
  "AES": "Advanced Encryption Standard",
  "AES256": "Advanced Encryption Standard（256-bit Key）",
  "ARP": "Address Resolution Protocol",
  "GARP": "Gratuitous ARP（Gratuitous Address Resolution Protocol）",
  "PPP": "Point-to-Point Protocol",
  "PAP": "Password Authentication Protocol",
  "CHAP": "Challenge-Handshake Authentication Protocol",
  "PPPoE": "Point-to-Point Protocol over Ethernet",
  "IPoE": "Internet Protocol over Ethernet",
  "PPTP": "Point-to-Point Tunneling Protocol",
  "GRE": "Generic Routing Encapsulation",
  "L2TP": "Layer 2 Tunneling Protocol",
  "L2TP over IPsec": "Layer 2 Tunneling Protocol over Internet Protocol Security",
  "CDP": "Cisco Discovery Protocol",
  "LLDP": "Link Layer Discovery Protocol",
  "STP": "Spanning Tree Protocol",
  "RSTP": "Rapid Spanning Tree Protocol",
  "MSTP": "Multiple Spanning Tree Protocol",
  "IPv4": "Internet Protocol version 4",
  "IPv6": "Internet Protocol version 6",
  "IGP": "Interior Gateway Protocol",
  "EGP": "Exterior Gateway Protocol",
  "RIP": "Routing Information Protocol",
  "RIPv2": "Routing Information Protocol version 2",
  "RIPng": "Routing Information Protocol next generation",
  "OSPF": "Open Shortest Path First",
  "OSPFv2": "Open Shortest Path First version 2",
  "OSPFv3": "Open Shortest Path First version 3",
  "EIGRP": "Enhanced Interior Gateway Routing Protocol",
  "EIGRP for IPv6": "Enhanced Interior Gateway Routing Protocol for IPv6",
  "BGP": "Border Gateway Protocol",
  "DHCP": "Dynamic Host Configuration Protocol",
  "DHCPv4": "Dynamic Host Configuration Protocol for IPv4",
  "ICMP": "Internet Control Message Protocol",
  "ICMPv4": "Internet Control Message Protocol for IPv4",
  "ICMPv6": "Internet Control Message Protocol for IPv6",
  "NDP": "Neighbor Discovery Protocol",
  "IPsec": "Internet Protocol Security",
  "IKE": "Internet Key Exchange",
  "ESP": "Encapsulating Security Payload",
  "AH": "Authentication Header",
  "IKEv1": "Internet Key Exchange version 1",
  "IKEv2": "Internet Key Exchange version 2",
  "FHRP": "First Hop Redundancy Protocol",
  "HSRP": "Hot Standby Router Protocol",
  "VRRP": "Virtual Router Redundancy Protocol",
  "UDP": "User Datagram Protocol",
  "TCP": "Transmission Control Protocol",
  "QUIC": "QUIC（旧称: Quick UDP Internet Connections。現在は略語ではない正式名称）",
  "SSH": "Secure Shell",
  "TLS": "Transport Layer Security",
  "SSL2.0": "Secure Sockets Layer version 2.0",
  "SSL3.0": "Secure Sockets Layer version 3.0",
  "TLS1.0": "Transport Layer Security version 1.0",
  "TLS1.1": "Transport Layer Security version 1.1",
  "TLS1.2": "Transport Layer Security version 1.2",
  "TLS1.3": "Transport Layer Security version 1.3",
  "SSL": "Secure Sockets Layer",
  "HTTP": "Hypertext Transfer Protocol",
  "HTTP/0.9": "Hypertext Transfer Protocol version 0.9",
  "HTTP/1.0": "Hypertext Transfer Protocol version 1.0",
  "HTTP/1.1": "Hypertext Transfer Protocol version 1.1",
  "HTTP/2": "Hypertext Transfer Protocol version 2",
  "HTTP/3": "Hypertext Transfer Protocol version 3",
  "DNS": "Domain Name System",
  "SMTP": "Simple Mail Transfer Protocol",
  "POP3": "Post Office Protocol version 3",
  "IMAP": "Internet Message Access Protocol",
  "Telnet": "Telnet Protocol（遠隔端末接続プロトコル。略語ではない）",
  "SCP": "Secure Copy Protocol",
  "SFTP": "SSH File Transfer Protocol",
  "NTP": "Network Time Protocol",
  "SNMP": "Simple Network Management Protocol",
  "Syslog": "The Syslog Protocol（イベントログ転送方式。略語ではない）",
  "FTP": "File Transfer Protocol",
  "TFTP": "Trivial File Transfer Protocol",
  "SIP": "Session Initiation Protocol",
  "RTP": "Real-time Transport Protocol",
};

function cardId(label: string, layer: Layer) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `l${layer}-${slug}`;
}

function makeCards(labels: string[], layer: Layer, source: 1 | 2): ProtocolCard[] {
  return labels.map((label) => ({
    id: cardId(label, layer),
    label,
    fullName: PROTOCOL_FORMAL_NAMES[label],
    layer,
    source,
    enabled: true,
  }));
}

export const DEFAULT_CARDS: ProtocolCard[] = [
  {
    id: "l1-ethernet",
    label: "イーサネット",
    fullName: PROTOCOL_FORMAL_NAMES["イーサネット"],
    layer: 1,
    layers: [1, 2],
    source: 1,
    note: "写真では第1層と第2層の両方に記載",
    enabled: true,
  },
  ...makeCards(["10BASE-T", "IEEE 802.11", "Bluetooth", "Zigbee"], 1, 1),
  ...makeCards([
    "IEEE 802.1X",
    "EAP",
    "EAPoL",
    "RADIUS",
    "EAP-TLS",
    "PEAP",
    "EAP-SIM/AKA",
    "WEP",
    "WPA",
    "WPA2",
    "WPA3",
    "RC4",
    "TKIP",
    "AES",
    "AES256",
    "ARP",
    "GARP",
    "PPP",
    "PAP",
    "CHAP",
    "PPPoE",
    "IPoE",
    "PPTP",
    "GRE",
    "L2TP",
    "L2TP over IPsec",
    "CDP",
    "LLDP",
    "STP",
    "RSTP",
    "MSTP",
  ], 2, 1),
  ...makeCards([
    "IPv4",
    "IPv6",
    "IGP",
    "EGP",
    "RIP",
    "RIPv2",
    "RIPng",
    "OSPF",
    "OSPFv2",
    "OSPFv3",
    "EIGRP",
    "EIGRP for IPv6",
    "BGP",
    "DHCP",
    "DHCPv4",
    "ICMP",
    "ICMPv4",
    "ICMPv6",
    "NDP",
    "IPsec",
    "IKE",
    "ESP",
    "AH",
    "IKEv1",
    "IKEv2",
    "FHRP",
    "HSRP",
    "VRRP",
  ], 3, 2),
  ...makeCards(["UDP", "TCP", "QUIC"], 4, 2),
  {
    ...makeCards(["SSH"], 5, 2)[0],
    layers: [5, 7],
    note: "写真では第5層と第7層の両方に記載",
  },
  {
    ...makeCards(["TLS"], 5, 2)[0],
    layers: [5, 6],
    note: "写真では第5層と第6層の両方に記載",
  },
  ...makeCards(["SSL2.0", "SSL3.0", "TLS1.0", "TLS1.1", "TLS1.2", "TLS1.3"], 5, 2),
  ...makeCards(["SSL"], 6, 2),
  ...makeCards([
    "HTTP",
    "HTTP/0.9",
    "HTTP/1.0",
    "HTTP/1.1",
    "HTTP/2",
    "HTTP/3",
    "DNS",
    "SMTP",
    "POP3",
    "IMAP",
    "Telnet",
    "SCP",
    "SFTP",
    "NTP",
    "SNMP",
    "Syslog",
    "FTP",
    "TFTP",
    "SIP",
    "RTP",
  ], 7, 2),
];

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
    const source = candidate.source === 1 || candidate.source === 2 || candidate.source === "custom" ? candidate.source : "custom";
    const fullName = typeof candidate.fullName === "string" && candidate.fullName.trim()
      ? candidate.fullName.trim()
      : undefined;
    const layers = Array.isArray(candidate.layers)
      ? [...new Set(candidate.layers.filter(isLayer))]
      : undefined;
    return [{
      id: candidate.id,
      label,
      fullName,
      layer: candidate.layer,
      layers: layers?.length ? layers : undefined,
      source,
      note: typeof candidate.note === "string" ? candidate.note : undefined,
      enabled: candidate.enabled !== false,
    } satisfies ProtocolCard];
  });
  const savedById = new Map(normalized.map((card) => [card.id, card]));
  const defaultIds = new Set(DEFAULT_CARDS.map((card) => card.id));
  const mergedDefaults = DEFAULT_CARDS.map((fallback) => {
    const saved = savedById.get(fallback.id);
    if (!saved) return fallback;
    return {
      ...fallback,
      ...saved,
      fullName: saved.fullName ?? (saved.label === fallback.label ? fallback.fullName : undefined),
      layers: saved.layers ?? (saved.layer === fallback.layer ? fallback.layers : undefined),
      note: saved.note ?? fallback.note,
      source: fallback.source,
    };
  });
  const customCards = normalized.filter((card) => card.source === "custom" && !defaultIds.has(card.id));
  return [...mergedDefaults, ...customCards];
}
