import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const appUrl = new URL("../app/", import.meta.url);

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;

async function loadWrittenData() {
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
  return import(dataUrl(compile(writtenSource)
    .replace('from "./protocols";', `from "${protocolsUrl}";`)
    .replace('from "./network-written-grading";', `from "${gradingUrl}";`)));
}

test("network written bank is derived only from the original 96 protocol cards", async () => {
  const data = await readFile(new URL("network-written-data.ts", appUrl), "utf8");
  assert.match(data, /NETWORK_WRITTEN_TERMS:[\s\S]*DEFAULT_CARDS\.map/);
  assert.match(data, /cardLayers\(card\)/);
  assert.match(data, /fullName: card\.fullName\?\.trim\(\)/);
  assert.doesNotMatch(data, /NETWORK_EXAM_SHEET_TERMS/);
  assert.doesNotMatch(data, /new-exam-sheet/);
  for (const outOfScopeTerm of ["AS番号", "DMZ", "L2スイッチ", "OpenFlow", "OSI参照モデル", "VXLAN", "WAF", "負荷分散装置", "ルーター"]) {
    assert.doesNotMatch(data, new RegExp(`sheet\\(\\"${outOfScopeTerm}`));
  }
});

test("written answers use the strict past-paper 0/3/5/8/10 rubric", async () => {
  const data = await readFile(new URL("network-written-data.ts", appUrl), "utf8");
  const grading = await readFile(new URL("network-written-grading.ts", appUrl), "utf8");
  assert.match(data, /characterCount >= 20/);
  assert.match(data, /!enoughCharacters \? 0/);
  assert.match(data, /!layerCorrect \? \(strictContent\.detailMatched/);
  assert.match(data, /qualified: fullyQualified/);
  assert.match(grading, /STRICT_RUBRICS/);
  assert.match(grading, /contradictions/);
  assert.match(grading, /requiredItems/);

  const written = await loadWrittenData();
  const tcp = written.NETWORK_WRITTEN_TERMS.find((item) => item.term === "TCP");
  assert.ok(tcp);

  const generic = written.evaluateNetworkWrittenAnswer(
    tcp,
    "TCPはネットワークでデータ通信を行う便利なプロトコルです。",
    4,
  );
  assert.equal(generic.estimatedScore, 3);
  assert.equal(generic.qualified, false);

  const partial = written.evaluateNetworkWrittenAnswer(
    tcp,
    "TCPは接続を確立し、確認応答を用いてデータを転送する。",
    4,
  );
  assert.equal(partial.estimatedScore, 8);
  assert.equal(partial.qualified, false);

  const fullAnswer = "TCPは接続確立後、番号付け・確認応答・再送を行い、順序どおり信頼性あるバイト列を届ける。";
  const full = written.evaluateNetworkWrittenAnswer(tcp, fullAnswer, 4);
  assert.equal(full.estimatedScore, 10);
  assert.equal(full.qualified, true);
  assert.equal(written.evaluateNetworkWrittenAnswer(tcp, fullAnswer, 3).estimatedScore, 3);
  assert.equal(written.evaluateNetworkWrittenAnswer(tcp, "接続して再送する。", 4).estimatedScore, 0);

  const contradiction = written.evaluateNetworkWrittenAnswer(
    tcp,
    "TCPは接続を確立せず、確認応答や再送も行わず、高速なデータグラムを送る。",
    4,
  );
  assert.equal(contradiction.estimatedScore, 0);
  assert.ok(contradiction.contradictions.length > 0);
});
test("network written route identifies format-only sheets and never offers their terms", async () => {
  const [page, css, networkHub, cardsPage] = await Promise.all([
    readFile(new URL("subjects/network/written/page.tsx", appUrl), "utf8"),
    readFile(new URL("network-written.module.css", appUrl), "utf8"),
    readFile(new URL("subjects/network/page.tsx", appUrl), "utf8"),
    readFile(new URL("subjects/network/cards/page.tsx", appUrl), "utf8"),
  ]);
  assert.match(page, /好きなプロトコルを選び/);
  assert.match(page, /空白を除き20文字以上/);
  assert.match(page, /対象・動作・固有の特徴/);
  assert.match(page, /evaluation\.detailMatched/);
  assert.match(page, /過去問相当の10点基準/);
  assert.match(page, /既存96プロトコルだけを出題/);
  assert.match(page, /形式だけを参照/);
  assert.match(page, /印字された用語は今回の範囲へ追加していません/);
  assert.match(page, /ランダムに選ぶ/);
  assert.match(page, /role="radiogroup"/);
  assert.doesNotMatch(page, /value: "cross"/);
  assert.doesNotMatch(page, /配布用紙の全用語/);
  assert.match(page, /current\.fullName/);
  assert.match(page, /正式名称/);
  assert.match(page, /模範解答/);
  assert.match(page, /test-grid:network-written:v1/);
  assert.match(page, /completedIds/);
  assert.match(page, /追試用・層即答/);
  assert.match(networkHub, /href="\/subjects\/network\/written"/);
  assert.match(networkHub, /本試験対策・新形式/);
  assert.match(networkHub, /追試対策・時間制限つき練習/);
  assert.match(cardsPage, /href="\/subjects\/network\/written"/);
  assert.match(cardsPage, /本試験・20文字記述へ/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /max-width: 100%/);
  assert.match(css, /overflow-wrap: anywhere/);
});
