export type Layer = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ProtocolCard = {
  id: string;
  label: string;
  layer: Layer;
  layers?: Layer[];
  source: 1 | 2 | "custom";
  note?: string;
  enabled: boolean;
};

export const ALL_LAYERS: Layer[] = [1, 2, 3, 4, 5, 6, 7];

function cardId(label: string, layer: Layer) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `l${layer}-${slug}`;
}

function makeCards(labels: string[], layer: Layer, source: 1 | 2): ProtocolCard[] {
  return labels.map((label) => ({
    id: cardId(label, layer),
    label,
    layer,
    source,
    enabled: true,
  }));
}

export const DEFAULT_CARDS: ProtocolCard[] = [
  {
    id: "l1-ethernet",
    label: "イーサネット",
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
    const layers = Array.isArray(candidate.layers)
      ? [...new Set(candidate.layers.filter(isLayer))]
      : undefined;
    return [{
      id: candidate.id,
      label,
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
      layers: saved.layers ?? (saved.layer === fallback.layer ? fallback.layers : undefined),
      note: saved.note ?? fallback.note,
      source: fallback.source,
    };
  });
  const customCards = normalized.filter((card) => card.source === "custom" && !defaultIds.has(card.id));
  return [...mergedDefaults, ...customCards];
}
