import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:workers") {
      return { shortCircuit: true, url: "data:text/javascript,export const env = {};" };
    }
    return nextResolve(specifier, context);
  },
});

async function render(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html", host: "localhost" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the all-subject essentials guide with real math markup", async () => {
  const response = await render("/essentials?subject=subject-7");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /試験直前・これだけは覚える/);
  assert.match(html, /これだけは、/);
  assert.match(html, /確率統計/);
  assert.match(html, /Σなし/);
  assert.match(html, /class="[^"]*statistics-math/);
  assert.match(html, /href="\/subjects\/subject-7"/);
});
