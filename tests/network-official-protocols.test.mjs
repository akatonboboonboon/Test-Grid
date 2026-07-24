import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const appUrl = new URL("../app/", import.meta.url);

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

function dataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

async function loadProtocols() {
  const [descriptionsSource, protocolsSource] = await Promise.all([
    readFile(new URL("protocol-descriptions.ts", appUrl), "utf8"),
    readFile(new URL("protocols.ts", appUrl), "utf8"),
  ]);
  const descriptionsUrl = dataUrl(compile(descriptionsSource));
  return import(dataUrl(compile(protocolsSource).replace(
    'from "./protocol-descriptions";',
    `from "${descriptionsUrl}";`,
  )));
}

const EXPECTED_BY_LAYER = {
  1: ["1000BASE-T", "IEEE 802.11ax", "Bluetooth", "Zigbee", "ツイストペアケーブル", "光ファイバー"],
  2: ["ARP", "GARP", "PPP", "PAP", "CHAP", "PPPoE", "RADIUS", "L2TP"],
  3: ["IPv4", "IPv6", "ICMP", "NDP", "DHCP", "RIP", "OSPF", "EIGRP", "BGP", "IPsec", "PPTP", "OpenFlow"],
  4: ["TCP", "UDP"],
  5: ["SIP", "RTSP"],
  6: ["SSL/TLS", "ALPN", "QUIC"],
  7: ["HTTP", "HTTPS", "DNS", "SMTP", "POP3", "IMAP4", "SSH", "Telnet", "FTP", "TFTP", "SNMP", "NTP", "CDP", "LLDP", "STP", "VRRP", "HSRP"],
};

const EXPECTED_ACCEPTED_LAYERS = {
  Bluetooth: [1, 2],
  Zigbee: [1, 2],
  RADIUS: [2, 7],
  L2TP: [2, 3],
  DHCP: [3, 7],
  PPTP: [3, 2],
  OpenFlow: [3, 7],
  QUIC: [6, 4],
  CDP: [7, 2],
  LLDP: [7, 2],
  STP: [7, 2],
  VRRP: [7, 3],
  HSRP: [7, 3],
};

test("official network PDF defines exactly 50 unique protocol cards", async () => {
  const { DEFAULT_CARDS, PROTOCOL_FORMAL_NAMES } = await loadProtocols();
  const expectedLabels = Object.values(EXPECTED_BY_LAYER).flat();

  assert.equal(DEFAULT_CARDS.length, 50);
  assert.equal(new Set(DEFAULT_CARDS.map((card) => card.id)).size, 50, "all IDs must be unique");
  assert.deepEqual(DEFAULT_CARDS.map((card) => card.label), expectedLabels);
  assert.deepEqual(
    Object.fromEntries(Object.keys(EXPECTED_BY_LAYER).map((layer) => [
      layer,
      DEFAULT_CARDS.filter((card) => card.layer === Number(layer)).map((card) => card.label),
    ])),
    EXPECTED_BY_LAYER,
  );

  for (const card of DEFAULT_CARDS) {
    assert.ok(card.fullName?.trim(), `${card.label}: formal name`);
    assert.equal(card.fullName, PROTOCOL_FORMAL_NAMES[card.label], `${card.label}: formal-name map`);
    assert.ok(card.description?.trim(), `${card.label}: description`);
    assert.ok([...card.description].length >= 20, `${card.label}: description must support a 20-character answer`);
  }
});

test("parenthesized PDF layers accept both the listed and recommended layers", async () => {
  const { DEFAULT_CARDS, cardLayers } = await loadProtocols();

  for (const card of DEFAULT_CARDS) {
    assert.deepEqual(
      cardLayers(card),
      EXPECTED_ACCEPTED_LAYERS[card.label] ?? [card.layer],
      `${card.label}: accepted layers`,
    );
    if (EXPECTED_ACCEPTED_LAYERS[card.label]) {
      assert.match(card.note ?? "", /正式PDFではL[1-7]に掲載/);
      assert.match(card.note ?? "", /でも正解です/);
    }
  }
});

test("normalizeCards migrates old 96-card storage without reviving removed defaults", async () => {
  const { DEFAULT_CARDS, normalizeCards } = await loadProtocols();
  const saved = [
    ...DEFAULT_CARDS,
    { id: "l2-tkip", label: "TKIP", layer: 2, source: 1, enabled: true },
    { id: "l6-ssl", label: "SSL", layer: 6, source: 2, enabled: true },
    { id: "l2-cdp", label: "CDP", layer: 2, source: 1, enabled: true },
    { id: "l4-quic", label: "QUIC", layer: 4, source: 2, enabled: true },
    { id: "custom-bfd", label: "BFD", layer: 3, source: "custom", enabled: true },
  ].map((card) => card.id === "l2-arp"
    ? { ...card, enabled: false, fullName: "古い正式名称", description: "古い説明", layers: [7] }
    : card);

  const migrated = normalizeCards(saved);
  assert.equal(migrated.length, 51, "50 official cards plus one explicit custom card");
  assert.equal(migrated.find((card) => card.id === "l2-arp")?.enabled, false, "matching official ID keeps enabled state");
  assert.equal(migrated.find((card) => card.id === "l2-arp")?.fullName, "Address Resolution Protocol");
  assert.deepEqual(migrated.find((card) => card.id === "l2-arp")?.layers, undefined);
  assert.ok(migrated.some((card) => card.id === "custom-bfd" && card.source === "custom"));

  for (const removedId of ["l2-tkip", "l6-ssl", "l2-cdp", "l4-quic"]) {
    assert.equal(migrated.some((card) => card.id === removedId), false, `${removedId} must not revive`);
  }

  for (const removedLabel of ["10BASE-T", "IEEE 802.11", "EAP", "WEP", "WPA3", "TKIP", "AES256", "IPoE", "GRE", "RSTP", "RIPv2", "IKE", "FHRP", "TLS1.3", "SFTP", "RTP"]) {
    assert.equal(migrated.some((card) => card.label === removedLabel), false, `${removedLabel} is outside the official 50`);
  }
});
test("network essentials covers the complete official 50 without retired groups", async () => {
  const source = await readFile(new URL("essentials-data.ts", appUrl), "utf8");
  const start = source.indexOf("export const NETWORK_ESSENTIALS");
  const end = source.indexOf("export const MECHANICAL_ESSENTIALS");
  assert.ok(start >= 0 && end > start, "NETWORK_ESSENTIALS block");
  const block = source.slice(start, end);

  for (const label of Object.values(EXPECTED_BY_LAYER).flat()) {
    assert.ok(block.includes(label), `${label}: represented in essentials`);
  }
  for (const retired of ["IEEE 802.1X", "EAPoL", "WPA3", "RSTP", "MSTP", "SSH と TLS の複数層"]) {
    assert.equal(block.includes(retired), false, `${retired}: retired from the official scope`);
  }
  assert.match(block, /QUIC[^\n]*L4も正解/u);
  assert.match(block, /SSHはL7だけ/u);
});