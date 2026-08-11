import { calculateSavingsRate, percentage } from "../../../lib/finance";
import { ensureDatabase, getDatabaseConnection, getOwnerId, queryRows } from "../../../lib/database";

export async function GET(request: Request) {
  try {
    const ownerId = getOwnerId(request);
    await ensureDatabase(ownerId);
    const url = new URL(request.url);
    const requestedPeriod = url.searchParams.get("period");
    const period = requestedPeriod === "30" || requestedPeriod === "90" ? requestedPeriod : "month";
    const month = new Date().toISOString().slice(0, 7);
    const periodWhere = period === "month" ? "substr(occurred_at,1,7)=?" : "occurred_at::date >= CURRENT_DATE + (?::interval)";
    const periodValue = period === "month" ? month : `-${Number(period) - 1} days`;
    const db = await getDatabaseConnection();
    const [summary, budget, budgetSpend] = await db.batch([
      db.prepare(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount_cents ELSE 0 END),0) AS income_cents, COALESCE(SUM(CASE WHEN type='expense' THEN amount_cents ELSE 0 END),0) AS expense_cents FROM transactions WHERE owner_id=? AND ${periodWhere}`).bind(ownerId, periodValue),
      db.prepare("SELECT amount_cents FROM budgets WHERE owner_id=? AND month=? LIMIT 1").bind(ownerId, month),
      db.prepare("SELECT COALESCE(SUM(amount_cents),0) AS expense_cents FROM transactions WHERE owner_id=? AND type='expense' AND substr(occurred_at,1,7)=?").bind(ownerId, month),
    ]);
    const summaryRow = (summary.results?.[0] || { income_cents: 0, expense_cents: 0 }) as Record<string, number>;
    const incomeCents = Number(summaryRow.income_cents || 0);
    const expenseCents = Number(summaryRow.expense_cents || 0);
    const budgetCents = Number((budget.results?.[0] as Record<string, number> | undefined)?.amount_cents || 0);
    const monthlyExpenseCents = Number((budgetSpend.results?.[0] as Record<string, number> | undefined)?.expense_cents || 0);
    const transactions = await queryRows(`SELECT t.id, t.description, t.amount_cents, t.type, t.occurred_at, c.name AS category_name, c.color AS category_color FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.owner_id=? AND ${periodWhere.replaceAll("occurred_at", "t.occurred_at")} ORDER BY t.occurred_at DESC, t.created_at DESC LIMIT 100`, ownerId, periodValue);
    const categories = await queryRows(`SELECT c.name, c.color, SUM(t.amount_cents) AS amount_cents FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.owner_id=? AND t.type='expense' AND ${periodWhere.replaceAll("occurred_at", "t.occurred_at")} GROUP BY c.id ORDER BY amount_cents DESC`, ownerId, periodValue);
    return Response.json({
      summary: { balanceCents: incomeCents - expenseCents, incomeCents, expenseCents, savingsCents: incomeCents - expenseCents, savingsRate: calculateSavingsRate(incomeCents, expenseCents) },
      budget: { amountCents: budgetCents, spentCents: monthlyExpenseCents, availableCents: Math.max(0, budgetCents - monthlyExpenseCents), usedPercentage: percentage(monthlyExpenseCents, budgetCents) },
      transactions,
      categories,
      period,
      owner: ownerId,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao carregar o painel." }, { status: 500 });
  }
}
