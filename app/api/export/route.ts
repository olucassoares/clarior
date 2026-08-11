import { ensureDatabase, getOwnerId, queryRows } from "../../../lib/database";
import { safeCsvCell } from "../../../lib/finance";

export async function GET(request: Request) {
  const ownerId = getOwnerId(request);
  await ensureDatabase(ownerId);
  const rows = await queryRows("SELECT t.occurred_at, t.description, c.name AS category, t.type, t.amount_cents FROM transactions t JOIN categories c ON c.id=t.category_id WHERE t.owner_id=? ORDER BY t.occurred_at DESC", ownerId);
  const header = ["Data", "Descrição", "Categoria", "Tipo", "Valor (BRL)"].map(safeCsvCell).join(",");
  const body = rows.map((row) => [row.occurred_at, row.description, row.category, row.type === "income" ? "Receita" : "Despesa", (Number(row.amount_cents) / 100).toFixed(2).replace(".", ",")].map(safeCsvCell).join(","));
  return new Response(`\uFEFF${[header, ...body].join("\r\n")}`, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=clarior-transacoes.csv", "cache-control": "no-store" },
  });
}
