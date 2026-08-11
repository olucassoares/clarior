import { ensureDatabase, getOwnerId, queryRows } from "../../../lib/database";

export async function GET(request: Request) {
  const ownerId = getOwnerId(request);
  await ensureDatabase(ownerId);
  const url = new URL(request.url);
  const requested = Number(url.searchParams.get("days") || 30);
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const rows = await queryRows("SELECT t.type, c.name AS category, SUM(t.amount_cents) AS amount_cents, COUNT(*) AS entries FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.owner_id=? AND t.occurred_at::date >= CURRENT_DATE + (?::interval) GROUP BY t.type, c.name ORDER BY amount_cents DESC", ownerId, `-${days - 1} days`);
  return Response.json({ periodDays: days, groups: rows });
}
