import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const root = new URL("../", import.meta.url);
const enginePromise = importTypeScriptGraph("../app/test-builder-engine.ts", import.meta.url);

async function loadSyncMerge() {
  const [engine, source] = await Promise.all([
    enginePromise,
    readFile(new URL("app/account-sync.tsx", root), "utf8"),
  ]);
  const helperSource = source.slice(0, source.indexOf("function mergeRawValue"));
  const withoutImports = helperSource.replace(/import\s+(?:[\s\S]*?\s+from\s+)?["'][^"']+["'];?\s*/gu, "");
  const injected = `
    const {
      TEST_BUILDER_MAX_COLLECTION_BYTES,
      TEST_BUILDER_STORAGE_KEY,
      readProjects,
      writeProjects,
    } = globalThis.__testBuilderSyncEngine;
    ${withoutImports}
  `;
  const javascript = ts.transpileModule(injected, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "account-sync-merge.ts",
  }).outputText;
  globalThis.__testBuilderSyncEngine = engine;
  try {
    const moduleUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
    return { engine, merge: (await import(moduleUrl)).mergeTestBuilderProjectCollections };
  } finally {
    delete globalThis.__testBuilderSyncEngine;
  }
}

function input(index) {
  return {
    grade: 4,
    period: "first-final",
    subject: "同期テスト",
    title: `想定試験${index}`,
    durationMinutes: 50,
    totalPoints: 100,
    questionCount: 2,
    difficulty: 2,
    scopeText: "用語A::答えA::解説A\n用語B::答えB::解説B\n用語C::答えC::解説C\n用語D::答えD::解説D",
    formatText: "全2問。記述2問。",
    seed: `sync-${index}`,
  };
}

test("test builder sync unions by projectId with local ordering first", async () => {
  const { engine, merge } = await loadSyncMerge();
  const shared = engine.generateTestProject(input("shared"));
  const localOnly = engine.generateTestProject(input("local"));
  const remoteOnly = engine.generateTestProject(input("remote"));
  const merged = engine.readProjects(merge(
    engine.writeProjects([remoteOnly, shared]),
    engine.writeProjects([localOnly, shared]),
  ));
  assert.deepEqual(merged.map((project) => project.projectId), [
    localOnly.projectId,
    shared.projectId,
    remoteOnly.projectId,
  ]);
});

test("test builder sync keeps the healthy side when the other collection is corrupt", async () => {
  const { engine, merge } = await loadSyncMerge();
  const local = engine.generateTestProject(input("healthy-local"));
  const remote = engine.generateTestProject(input("healthy-remote"));
  assert.deepEqual(engine.readProjects(merge("not-json", engine.writeProjects([local]))), [local]);
  assert.deepEqual(engine.readProjects(merge(engine.writeProjects([remote]), "not-json")), [remote]);
});

test("test builder sync drops remote tail only after preserving the local-first valid prefix", async () => {
  const { engine, merge } = await loadSyncMerge();
  const encoder = new TextEncoder();
  const makeCollection = (prefix) => {
    const projects = [];
    for (let index = 0; index < 200; index += 1) {
      projects.push(engine.generateTestProject(input(`${prefix}-${index}`)));
      if (encoder.encode(engine.writeProjects(projects)).byteLength >= engine.TEST_BUILDER_MAX_COLLECTION_BYTES * 0.55) break;
    }
    return projects;
  };
  const local = makeCollection("local");
  const remote = makeCollection("remote");
  const completeUnion = [...local, ...remote];
  const mergedRaw = merge(engine.writeProjects(remote), engine.writeProjects(local));
  const merged = engine.readProjects(mergedRaw);
  assert.ok(encoder.encode(mergedRaw).byteLength <= engine.TEST_BUILDER_MAX_COLLECTION_BYTES);
  assert.ok(merged.length < completeUnion.length);
  assert.ok(merged.length > local.length);
  assert.deepEqual(merged.slice(0, local.length), local);
  assert.deepEqual(merged, completeUnion.slice(0, merged.length));
});

test("test builder sync stores OCR output text without carrying image payloads", async () => {
  const { engine, merge } = await loadSyncMerge();
  const project = engine.generateTestProject({
    ...input("ocr"),
    scopeText: "OCR extracted scope text",
  });
  const mergedRaw = merge("[]", engine.writeProjects([project]));
  const [merged] = engine.readProjects(mergedRaw);
  assert.equal(merged.input.scopeText, "OCR extracted scope text");
  assert.doesNotMatch(mergedRaw, /data:image|blob:/u);
});
