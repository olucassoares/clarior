import { createId, ensureDatabase, getDatabaseConnection, getOwnerId, queryRows } from "../../../lib/database";
import { validateTransaction } from "../../../lib/finance";

export async function GET(request: Request) {
  const ownerId = getOwnerId(request);
  await ensureDatabase(ownerId);
  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
  const rows = await queryRows("SELECT t.id, t.description, t.amount_cents, t.type, t.occurred_at, t.notes, c.name AS category_name, c.color AS category_color FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.owner_id=? ORDER BY t.occurred_at DESC, t.created_at DESC LIMIT ?", ownerId, limit);
  return Response.json({ transactions: rows });
}

export async function POST(request: Request) {
  try {
    const ownerId = getOwnerId(request);
    await ensureDatabase(ownerId);
    const payload = await request.json() as Record<string, unknown>;
    const validation = validateTransaction(payload);
    if ("error" in validation) return Response.json({ error: validation.error }, { status: 400 });
    const { description, category, type, occurredAt, amountCents } = validation.data;
    const db = await getDatabaseConnection();
    let categoryRow = await db.prepare("SELECT id FROM categories WHERE owner_id=? AND name=? AND type=? LIMIT 1").bind(ownerId, category, type).first<{ id: string }>();
    if (!categoryRow) {
      const categoryId = createId("cat");
      await db.prepare("INSERT INTO categories (id, owner_id, name, color, type) VALUES (?, ?, ?, ?, ?)").bind(categoryId, ownerId, category, type === "income" ? "#13a979" : "#7557f6", type).run();
      categoryRow = { id: categoryId };
    }
    const idempotencyKey = request.headers.get("idempotency-key") || null;
    if (idempotencyKey) {
      const existing = await db.prepare("SELECT id FROM transactions WHERE owner_id=? AND idempotency_key=? LIMIT 1").bind(ownerId, idempotencyKey).first<{ id: string }>();
      if (existing) return Response.json({ transaction: existing, duplicate: true }, { status: 200 });
    }
    const id = createId("txn");
    await db.prepare("INSERT INTO transactions (id, owner_id, description, amount_cents, type, category_id, occurred_at, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, ownerId, description, amountCents, type, categoryRow.id, occurredAt, idempotencyKey).run();
    return Response.json({ transaction: { id, description, amount_cents: amountCents, type, category_name: category, occurred_at: occurredAt } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível salvar a transação." }, { status: 500 });
  }
}
