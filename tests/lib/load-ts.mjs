// Loads a pure src/lib TypeScript module for node:test: transpiles it and its "@/lib/…" imports
// (recursively) into data: URLs, so a pure module can share helpers without a build step.
import { readFile } from "node:fs/promises";
import ts from "typescript";

const root = new URL("../../src/lib/", import.meta.url);

async function toDataUrl(name) {
  const source = await readFile(new URL(`${name}.ts`, root), "utf8");
  let compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const match of [...compiled.matchAll(/from "@\/lib\/([A-Za-z0-9]+)"/g)]) {
    compiled = compiled.replace(match[0], `from "${await toDataUrl(match[1])}"`);
  }
  return `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
}

export async function loadLib(name) {
  return import(await toDataUrl(name));
}
