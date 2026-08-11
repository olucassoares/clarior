import assert from "node:assert/strict";
import test from "node:test";

import { budgetPace, countEntries } from "../lib/dashboard-view.ts";

test("conta entradas e saídas sem depender da interface", () => {
  assert.deepEqual(countEntries([{ type: "income" }, { type: "expense" }, { type: "expense" }]), { income: 1, expense: 2 });
});

test("traduz o uso do orçamento em orientação objetiva", () => {
  assert.equal(budgetPace(56), "Ritmo confortável");
  assert.equal(budgetPace(75), "Acompanhe de perto");
  assert.equal(budgetPace(95), "Limite próximo");
});
