import { access, readFile } from "node:fs/promises";
import ts from "typescript";

const moduleUrlCache = new Map();

function toDataUrl(javascript) {
  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

async function resolveLocalModule(parent, specifier) {
  const raw = new URL(specifier, parent);
  const candidates = /\.[cm]?[jt]sx?$/u.test(raw.pathname)
    ? [raw]
    : [".ts", ".tsx", ".mjs", ".js"].map((extension) => new URL(raw.href + extension));
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next TypeScript/JavaScript extension.
    }
  }
  throw new Error(`Cannot resolve ${specifier} from ${parent.href}`);
}

async function compileModuleToUrl(moduleUrl) {
  const key = moduleUrl.href;
  if (moduleUrlCache.has(key)) return moduleUrlCache.get(key);

  const promise = (async () => {
    const source = await readFile(moduleUrl, "utf8");
    let javascript = ts.transpileModule(source, {
      compilerOptions: {
        jsx: moduleUrl.pathname.endsWith(".tsx") ? ts.JsxEmit.ReactJSX : undefined,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: moduleUrl.pathname,
    }).outputText;

    const specifiers = new Set();
    for (const match of javascript.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/gu)) {
      specifiers.add(match[1]);
    }
    for (const specifier of specifiers) {
      const dependency = await resolveLocalModule(moduleUrl, specifier);
      const dependencyUrl = await compileModuleToUrl(dependency);
      javascript = javascript
        .replaceAll(`"${specifier}"`, JSON.stringify(dependencyUrl))
        .replaceAll(`'${specifier}'`, JSON.stringify(dependencyUrl));
    }
    return toDataUrl(javascript);
  })();

  moduleUrlCache.set(key, promise);
  return promise;
}

export async function importTypeScriptGraph(relativePath, baseUrl = import.meta.url) {
  const moduleUrl = relativePath instanceof URL ? relativePath : new URL(relativePath, baseUrl);
  return import(await compileModuleToUrl(moduleUrl));
}
