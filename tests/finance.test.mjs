import assert from "node:assert/strict";
import test from "node:test";
import { calculateSavingsRate, parseAmountToCents, percentage, safeCsvCell, validateTransaction } from "../lib/finance.ts";

test("converte valores brasileiros para centavos", () => {
  assert.equal(parseAmountToCents("R$ 1.249,90"), 124990);
  assert.equal(parseAmountToCents("39,90"), 3990);
});

test("calcula taxa de economia sem divisão por zero", () => {
  assert.equal(calculateSavingsRate(605000, 258765), 57);
  assert.equal(calculateSavingsRate(0, 1200), 0);
});

test("calcula percentuais de orçamento", () => {
  assert.equal(percentage(250000, 500000), 50);
  assert.equal(percentage(100, 0), 0);
});

test("valida uma transação correta", () => {
  const result = validateTransaction({ description: "Mercado", category: "Alimentação", type: "expense", amount: "89,90", occurredAt: "2026-08-08" });
  assert.deepEqual(result, { data: { description: "Mercado", category: "Alimentação", type: "expense", amountCents: 8990, occurredAt: "2026-08-08" } });
});

test("rejeita valores e tipos inválidos", () => {
  assert.ok("error" in validateTransaction({ description: "X", category: "", type: "credit", amount: 0, occurredAt: "ontem" }));
});

test("protege exportações CSV contra fórmulas", () => {
  assert.equal(safeCsvCell("=IMPORTXML()"), '"\'=IMPORTXML()"');
  assert.equal(safeCsvCell('Mercado "Central"'), '"Mercado ""Central"""');
});
