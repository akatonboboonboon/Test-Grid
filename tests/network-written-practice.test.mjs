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
  const [descriptionsSource, protocolsSource, writtenSource] = await Promise.all([
    readFile(new URL("protocol-descriptions.ts", appUrl), "utf8"),
    readFile(new URL("protocols.ts", appUrl), "utf8"),
    readFile(new URL("network-written-data.ts", appUrl), "utf8"),
  ]);
  const descriptionsUrl = dataUrl(compile(descriptionsSource));
  const protocolsUrl = dataUrl(compile(protocolsSource).replace(
    'from "./protocol-descriptions";',
    `from "${descriptionsUrl}";`,
  ));
  return import(dataUrl(compile(writtenSource).replace(
    'from "./protocols";',
    `from "${protocolsUrl}";`,
  )));
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

test("written answers require length, a correct layer, and matched content", async () => {
  const data = await readFile(new URL("network-written-data.ts", appUrl), "utf8");
  assert.match(data, /replace\(\/\\s\/gu, ""\)/);
  assert.match(data, /characterCount >= 20/);
  assert.match(data, /term\.expectedLayers\.includes\(choice\)/);
  assert.match(data, /qualified: enoughCharacters && layerCorrect && contentMatched/);
  assert.match(data, /contentMatched/);
  assert.match(data, /estimatedScore/);
  assert.doesNotMatch(data, /choice === "cross"/);
  assert.doesNotMatch(data, /const candidates: string\[\] = \[term\]/);
  assert.match(data, /answerWithoutRepeatedTerm/);
  assert.match(data, /normalizedAnswer\.split\(normalizedTerm\)\.join\(""\)/);

  const written = await loadWrittenData();
  const term = written.NETWORK_WRITTEN_TERMS.find((item) => item.keywords.length > 0);
  assert.ok(term);
  const correctLayer = term.expectedLayers[0];
  const wrongLayer = [1, 2, 3, 4, 5, 6, 7].find((layer) => !term.expectedLayers.includes(layer));
  assert.ok(wrongLayer);
  const contentAnswer = `${term.keywords[0]}を使ってネットワーク上の必要な処理を正しく実現する方式です`;

  assert.equal(written.evaluateNetworkWrittenAnswer(term, "あ".repeat(20), correctLayer).qualified, false);
  assert.equal(written.evaluateNetworkWrittenAnswer(term, contentAnswer, wrongLayer).qualified, false);
  assert.equal(written.evaluateNetworkWrittenAnswer(term, term.keywords[0], correctLayer).qualified, false);
  assert.equal(written.evaluateNetworkWrittenAnswer(term, contentAnswer, correctLayer).qualified, true);
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
  assert.match(page, /内容キーワードを1つ以上含める/);
  assert.match(page, /evaluation\.contentMatched \? "✓" : "×"/);
  assert.match(page, /3条件クリア/);
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
