import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("declares the Clarior document metadata in the App Router", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /<html\s+lang="pt-BR">/);
  assert.match(layout, /title:\s*"Clarior \| Finanças pessoais"/);
  assert.match(layout, /description:\s*"O controle do seu dinheiro com clareza e sem complicação\."/);
  assert.match(layout, /icon:\s*"\/favicon\.svg"/);
});
