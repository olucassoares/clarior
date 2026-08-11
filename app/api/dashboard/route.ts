import { calculateSavingsRate, percentage } from "../../../lib/finance";
import { ensureDatabase, getDatabaseConnection, getOwnerId, queryRows } from "../../../lib/database";

export async function GET(request: Request) {
  try {
    const ownerId = getOwnerId(request);
    await ensureDatabase(ownerId);
    const month = new Date().toISOString().slice(0, 7);
    const db = await getDatabaseConnection();
    const [summary, budget] = await db.batch([
      db.prepare("SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount_cents ELSE 0 END),0) AS income_cents, COALESCE(SUM(CASE WHEN type='expense' THEN amount_cents ELSE 0 END),0) AS expense_cents FROM transactions WHERE owner_id=? AND substr(occurred_at,1,7)=?").bind(ownerId, month),
      db.prepare("SELECT amount_cents FROM budgets WHERE owner_id=? AND month=? LIMIT 1").bind(ownerId, month),
    ]);
    const summaryRow = (summary.results?.[0] || { income_cents: 0, expense_cents: 0 }) as Record<string, number>;
    const incomeCents = Number(summaryRow.income_cents || 0);
    const expenseCents = Number(summaryRow.expense_cents || 0);
    const budgetCents = Number((budget.results?.[0] as Record<string, number> | undefined)?.amount_cents || 0);
    const transactions = await queryRows("SELECT t.id, t.description, t.amount_cents, t.type, t.occurred_at, c.name AS category_name, c.color AS category_color FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.owner_id=? ORDER BY t.occurred_at DESC, t.created_at DESC LIMIT 30", ownerId);
    const categories = await queryRows("SELECT c.name, c.color, SUM(t.amount_cents) AS amount_cents FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.owner_id=? AND t.type='expense' AND substr(t.occurred_at,1,7)=? GROUP BY c.id ORDER BY amount_cents DESC", ownerId, month);
    return Response.json({
      summary: { balanceCents: incomeCents - expenseCents, incomeCents, expenseCents, savingsCents: incomeCents - expenseCents, savingsRate: calculateSavingsRate(incomeCents, expenseCents) },
      budget: { amountCents: budgetCents, spentCents: expenseCents, availableCents: Math.max(0, budgetCents - expenseCents), usedPercentage: percentage(expenseCents, budgetCents) },
      transactions,
      categories,
      owner: ownerId,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao carregar o painel." }, { status: 500 });
  }
}
