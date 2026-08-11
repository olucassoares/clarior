export type TransactionType = "income" | "expense";

export function parseAmountToCents(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  if (typeof value !== "string") return Number.NaN;
  const normalized = value
    .trim()
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

export function validateTransaction(input: Record<string, unknown>) {
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const type = input.type === "income" || input.type === "expense" ? input.type : null;
  const occurredAt = typeof input.occurredAt === "string" ? input.occurredAt : "";
  const amountCents = parseAmountToCents(input.amount);

  if (description.length < 2 || description.length > 80) return { error: "Descrição deve ter entre 2 e 80 caracteres." } as const;
  if (!category || category.length > 40) return { error: "Categoria inválida." } as const;
  if (!type) return { error: "Tipo de transação inválido." } as const;
  if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > 100_000_000) return { error: "Valor deve ser maior que zero." } as const;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredAt) || Number.isNaN(Date.parse(`${occurredAt}T00:00:00Z`))) return { error: "Data inválida." } as const;
  return { data: { description, category, type, occurredAt, amountCents } } as const;
}

export function calculateSavingsRate(incomeCents: number, expenseCents: number) {
  if (incomeCents <= 0) return 0;
  return Math.max(0, Math.round(((incomeCents - expenseCents) / incomeCents) * 100));
}

export function percentage(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function safeCsvCell(value: unknown) {
  const text = String(value ?? "");
  const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${protectedText.replace(/"/g, '""')}"`;
}
