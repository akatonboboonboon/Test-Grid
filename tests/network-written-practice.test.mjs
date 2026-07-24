import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const appUrl = new URL("../app/", import.meta.url);

const OFFICIAL_TERMS = [
  "1000BASE-T", "IEEE 802.11ax", "Bluetooth", "Zigbee", "ツイストペアケーブル", "光ファイバー",
  "ARP", "GARP", "PPP", "PAP", "CHAP", "PPPoE", "RADIUS", "L2TP",
  "IPv4", "IPv6", "ICMP", "NDP", "DHCP", "RIP", "OSPF", "EIGRP", "BGP", "IPsec", "PPTP", "OpenFlow",
  "TCP", "UDP", "SIP", "RTSP", "SSL/TLS", "ALPN", "QUIC",
  "HTTP", "HTTPS", "DNS", "SMTP", "POP3", "IMAP4", "SSH", "Telnet", "FTP", "TFTP", "SNMP", "NTP",
  "CDP", "LLDP", "STP", "VRRP", "HSRP",
];

const PDF_LAYER_EXCEPTIONS = new Map([
  ["Bluetooth", [1, 2]], ["Zigbee", [1, 2]], ["RADIUS", [2, 7]], ["L2TP", [2, 3]],
  ["DHCP", [3, 7]], ["PPTP", [3, 2]], ["OpenFlow", [3, 7]], ["QUIC", [6, 4]],
  ["CDP", [7, 2]], ["LLDP", [7, 2]], ["STP", [7, 2]], ["VRRP", [7, 3]], ["HSRP", [7, 3]],
]);

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;

async function loadWrittenModules() {
  const [descriptionsSource, protocolsSource, gradingSource, writtenSource] = await Promise.all([
    readFile(new URL("protocol-descriptions.ts", appUrl), "utf8"),
    readFile(new URL("protocols.ts", appUrl), "utf8"),
    readFile(new URL("network-written-grading.ts", appUrl), "utf8"),
    readFile(new URL("network-written-data.ts", appUrl), "utf8"),
  ]);
  const descriptionsUrl = dataUrl(compile(descriptionsSource));
  const protocolsUrl = dataUrl(compile(protocolsSource).replace(
    'from "./protocol-descriptions";',
    `from "${descriptionsUrl}";`,
  ));
  const gradingUrl = dataUrl(compile(gradingSource).replace(
    'from "./protocols";',
    `from "${protocolsUrl}";`,
  ));
  const writtenUrl = dataUrl(compile(writtenSource)
    .replace('from "./protocols";', `from "${protocolsUrl}";`)
    .replace('from "./network-written-grading";', `from "${gradingUrl}";`));
  const [written, grading] = await Promise.all([import(writtenUrl), import(gradingUrl)]);
  return { written, grading };
}

test("network written bank exactly follows the official 2026-07-24 PDF 50 terms", async () => {
  const { written, grading } = await loadWrittenModules();
  assert.equal(written.NETWORK_WRITTEN_SOURCE, "ネットワーク範囲.pdf（2026-07-24）");
  assert.equal(written.NETWORK_WRITTEN_TERMS.length, 50);
  assert.deepEqual(written.NETWORK_WRITTEN_TERMS.map((item) => item.term), OFFICIAL_TERMS);
  assert.deepEqual([...grading.NETWORK_STRICT_RUBRIC_TERMS], OFFICIAL_TERMS);
  assert.ok(written.NETWORK_WRITTEN_TERMS.every((item) => item.source === "network-range-pdf-2026-07-24"));
  assert.ok(written.NETWORK_WRITTEN_TERMS.every((item) => item.fullName && item.modelAnswer.length >= 20));
});

test("parenthesized PDF layers and listed layers are both accepted", async () => {
  const { written } = await loadWrittenModules();
  const byTerm = new Map(written.NETWORK_WRITTEN_TERMS.map((item) => [item.term, item]));
  for (const [termName, expectedLayers] of PDF_LAYER_EXCEPTIONS) {
    const term = byTerm.get(termName);
    assert.ok(term, termName);
    assert.deepEqual(term.expectedLayers, expectedLayers, termName);
    assert.equal(term.listedLayer, expectedLayers[0], termName);
    assert.deepEqual(term.alternateLayers, expectedLayers.slice(1), termName);
    assert.match(term.layerExceptionReason, /正式PDF.*括弧内/u, termName);
    for (const layer of expectedLayers) assert.equal(written.networkWrittenLayerCorrect(term, layer), true, `${termName} L${layer}`);
    const unrelated = [1, 2, 3, 4, 5, 6, 7].find((layer) => !expectedLayers.includes(layer));
    assert.equal(written.networkWrittenLayerCorrect(term, unrelated), false, termName);
  }
});

test("all official model answers satisfy their dedicated 10-point rubric", async () => {
  const { written } = await loadWrittenModules();
  const failures = [];
  for (const term of written.NETWORK_WRITTEN_TERMS) {
    const grade = written.evaluateNetworkWrittenAnswer(term, term.modelAnswer, term.listedLayer);
    if (grade.characterCount < 20 || grade.estimatedScore !== 10 || !grade.qualified || grade.contradictions.length) {
      failures.push(`${term.term}: dimensions=${grade.matchedDimensions.join("/")}; contradictions=${grade.contradictions.join("/")}`);
    }
  }
  assert.deepEqual(failures, []);
});

test("strict scoring applies 0/3/5/8/10 and never grants full credit for generic layer wording", async () => {
  const { written } = await loadWrittenModules();
  const tcp = written.NETWORK_WRITTEN_TERMS.find((item) => item.term === "TCP");
  const dns = written.NETWORK_WRITTEN_TERMS.find((item) => item.term === "DNS");
  assert.ok(tcp && dns);

  const generic = written.evaluateNetworkWrittenAnswer(tcp, "TCPはトランスポート層で通信を処理する便利な方式です。", 4);
  assert.equal(generic.estimatedScore, 3);
  assert.equal(generic.qualified, false);

  const targetOnly = written.evaluateNetworkWrittenAnswer(tcp, "TCPはアプリケーション間のバイト列を対象として扱う通信方式です。", 4);
  assert.equal(targetOnly.estimatedScore, 5);
  const targetAndAction = written.evaluateNetworkWrittenAnswer(tcp, "TCPはアプリケーション間のバイト列を接続確立後に確実に届ける方式です。", 4);
  assert.equal(targetAndAction.estimatedScore, 8);

  const fullAnswer = "TCPはアプリケーション間のバイト列を接続確立後、確認応答と再送で順序どおり確実に届ける。";
  assert.equal(written.evaluateNetworkWrittenAnswer(tcp, fullAnswer, 4).estimatedScore, 10);
  assert.equal(written.evaluateNetworkWrittenAnswer(tcp, fullAnswer, 3).estimatedScore, 3);
  assert.equal(written.evaluateNetworkWrittenAnswer(tcp, "接続して再送する。", 4).estimatedScore, 0);

  const contradiction = written.evaluateNetworkWrittenAnswer(
    tcp,
    "TCPはアプリケーション間のデータグラムを接続なしで送り、再送も順序保証もしない方式です。",
    4,
  );
  assert.equal(contradiction.estimatedScore, 0);
  assert.ok(contradiction.contradictions.length > 0);

  const wrongTerm = written.evaluateNetworkWrittenAnswer(
    dns,
    "DHCPは端末へIPアドレスやサブネットマスクをリース期間付きで自動割り当てする。",
    7,
  );
  assert.equal(wrongTerm.estimatedScore, 0);
  assert.match(wrongTerm.contradictions.join(" "), /別用語/u);
});

test("six written mocks are 50 minutes, 10 terms, 100 points and cover every listed layer", async () => {
  const { written } = await loadWrittenModules();
  assert.equal(written.NETWORK_WRITTEN_MOCKS.length, 6);
  const termsById = new Map(written.NETWORK_WRITTEN_TERMS.map((term) => [term.id, term]));
  for (const mock of written.NETWORK_WRITTEN_MOCKS) {
    assert.equal(mock.durationMinutes, 50, mock.id);
    assert.equal(mock.totalPoints, 100, mock.id);
    assert.equal(mock.pointsPerQuestion, 10, mock.id);
    assert.equal(mock.termIds.length, 10, mock.id);
    assert.equal(new Set(mock.termIds).size, 10, mock.id);
    assert.ok(mock.termIds.every((id) => termsById.has(id)), mock.id);
    const listedLayers = new Set(mock.termIds.map((id) => termsById.get(id).listedLayer));
    assert.deepEqual(listedLayers, new Set([1, 2, 3, 4, 5, 6, 7]), mock.id);
  }
});

test("written UI identifies the official PDF, explains strict dimensions, and prunes legacy progress IDs", async () => {
  const [page, mocks, layout, css] = await Promise.all([
    readFile(new URL("subjects/network/written/page.tsx", appUrl), "utf8"),
    readFile(new URL("network-written-mocks.tsx", appUrl), "utf8"),
    readFile(new URL("subjects/network/written/layout.tsx", appUrl), "utf8"),
    readFile(new URL("network-written.module.css", appUrl), "utf8"),
  ]);
  const combined = `${page}\n${mocks}\n${layout}`;
  assert.match(combined, /ネットワーク範囲\.pdf/u);
  assert.match(combined, /2026-07-24/u);
  assert.match(combined, /正式50語/u);
  assert.doesNotMatch(combined, /既存96|元写真|最初の層別写真|形式1・2/u);
  assert.match(page, /OFFICIAL_TERM_IDS\.has/u);
  assert.match(page, /matchedDimensions\.includes\("対象"\)/u);
  assert.match(page, /matchedDimensions\.includes\("動作"\)/u);
  assert.match(page, /matchedDimensions\.includes\("固有特徴"\)/u);
  assert.match(combined, /layerExceptionReason/u);
  assert.match(combined, /正式名称/u);
  assert.match(combined, /模範解答/u);
  assert.match(page, /追試用・層即答/u);
  assert.match(css, /@media \(max-width: 680px\)/u);
  assert.match(css, /overflow-wrap: anywhere/u);
});
