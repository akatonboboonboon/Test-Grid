export type Layer = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ProtocolCard = {
  id: string;
  label: string;
  layer: Layer;
  source: 1 | 2 | "custom";
  note?: string;
  enabled: boolean;
};

export const ALL_LAYERS: Layer[] = [1, 2, 3, 4, 5, 6, 7];

export const DEFAULT_CARDS: ProtocolCard[] = [
  ...["EAP", "PEAP", "WEP", "TKIP", "ARP", "GARP", "PPP", "PAP", "CHAP", "PPTP", "L2TP", "CDP", "LLDP", "STP", "RSTP", "MSTP"].map(
    (label) => ({ id: `l2-${label.toLowerCase()}`, label, layer: 2 as Layer, source: 1 as const, enabled: true }),
  ),
  ...["IGP", "EGP", "RIP", "EIGRP", "BGP", "DHCP", "ICMP", "NDP", "ESP", "HSRP", "VRRP"].map(
    (label) => ({ id: `l3-${label.toLowerCase()}`, label, layer: 3 as Layer, source: 2 as const, enabled: true }),
  ),
  {
    id: "l3-fhrp",
    label: "FHRP",
    layer: 3,
    source: 2,
    note: "写真では補助見出しとして記載",
    enabled: true,
  },
  ...["UDP", "TCP"].map((label) => ({
    id: `l4-${label.toLowerCase()}`,
    label,
    layer: 4 as Layer,
    source: 2 as const,
    enabled: true,
  })),
  ...["HTTP", "SMTP", "IMAP", "SCP", "SFTP", "NTP", "SNMP", "FTP", "TFTP", "SIP", "RTP"].map(
    (label) => ({ id: `l7-${label.toLowerCase()}`, label, layer: 7 as Layer, source: 2 as const, enabled: true }),
  ),
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

export function normalizeCards(value: unknown): ProtocolCard[] {
  if (!Array.isArray(value)) return DEFAULT_CARDS;
  const normalized = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<ProtocolCard>;
    if (typeof candidate.id !== "string" || typeof candidate.label !== "string" || !isLayer(candidate.layer)) return [];
    const label = candidate.label.trim().toUpperCase();
    if (!label) return [];
    const source = candidate.source === 1 || candidate.source === 2 || candidate.source === "custom" ? candidate.source : "custom";
    return [{
      id: candidate.id,
      label,
      layer: candidate.layer,
      source,
      note: typeof candidate.note === "string" ? candidate.note : undefined,
      enabled: candidate.enabled !== false,
    } satisfies ProtocolCard];
  });
  return normalized.length ? normalized : DEFAULT_CARDS;
}
