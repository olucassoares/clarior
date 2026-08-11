import { getDatabase, type DatabaseRow } from "../db/runtime";

type AppRow = DatabaseRow & Record<string, string | number | null>;

export function getOwnerId(request: Request) {
  return request.headers.get("x-user-email")?.trim().toLowerCase() || "demo@clarior.local";
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getDatabaseConnection() {
  return getDatabase();
}

export async function ensureDatabase(ownerId: string) {
  const db = await getDatabaseConnection();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('income','expense')), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS categories_owner_name_type_idx ON categories(owner_id, name, type)"),
    db.prepare("CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, description TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents > 0), type TEXT NOT NULL CHECK(type IN ('income','expense')), category_id TEXT NOT NULL, occurred_at TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', idempotency_key TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(category_id) REFERENCES categories(id))"),
    db.prepare("CREATE INDEX IF NOT EXISTS transactions_owner_date_idx ON transactions(owner_id, occurred_at DESC)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS transactions_owner_idempotency_idx ON transactions(owner_id, idempotency_key) WHERE idempotency_key IS NOT NULL"),
    db.prepare("CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, month TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents > 0), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS budgets_owner_month_idx ON budgets(owner_id, month)"),
  ]);

  const count = await db.prepare("SELECT COUNT(*) AS total FROM transactions WHERE owner_id = ?").bind(ownerId).first<{ total: number }>();
  if (Number(count?.total || 0) > 0) return;

  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = Math.max(1, now.getUTCDate());
  const date = (offset: number) => `${yyyy}-${mm}-${String(Math.max(1, day - offset)).padStart(2, "0")}`;
  const categorySeeds = [
    ["cat-salary", "Salário", "#7557f6", "income"], ["cat-extra", "Receita extra", "#13a979", "income"],
    ["cat-food", "Alimentação", "#7557f6", "expense"], ["cat-home", "Moradia", "#f1a255", "expense"],
    ["cat-transport", "Transporte", "#4ea5db", "expense"], ["cat-subscriptions", "Assinaturas", "#e55462", "expense"], ["cat-other", "Outros", "#b8b4c4", "expense"],
  ];
  await db.batch(categorySeeds.map(([id, name, color, type]) => db.prepare("INSERT INTO categories (id, owner_id, name, color, type) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING").bind(`${ownerId}:${id}`, ownerId, name, color, type)));

  const transactionSeeds: Array<[string,string,number,string,string,string]> = [
    ["seed-salary", "Salário", 520000, "income", "cat-salary", date(0)], ["seed-netflix", "Netflix", 3990, "expense", "cat-subscriptions", date(0)],
    ["seed-uber", "Uber", 2840, "expense", "cat-transport", date(1)], ["seed-ifood", "iFood", 4780, "expense", "cat-food", date(1)],
    ["seed-freelance", "Projeto freelance", 85000, "income", "cat-extra", date(3)], ["seed-rent", "Aluguel", 160000, "expense", "cat-home", date(5)],
    ["seed-market", "Mercado", 78215, "expense", "cat-food", date(6)], ["seed-fuel", "Combustível", 8940, "expense", "cat-transport", date(8)],
  ];
  await db.batch(transactionSeeds.map(([id, description, amount, type, category, occurred]) => db.prepare("INSERT INTO transactions (id, owner_id, description, amount_cents, type, category_id, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING").bind(`${ownerId}:${id}`, ownerId, description, amount, type, `${ownerId}:${category}`, occurred)));
  await db.prepare("INSERT INTO budgets (id, owner_id, month, amount_cents) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING").bind(`${ownerId}:budget:${yyyy}-${mm}`, ownerId, `${yyyy}-${mm}`, 500000).run();
}

export async function queryRows<T extends AppRow>(query: string, ...values: unknown[]) {
  const result = await (await getDatabaseConnection()).prepare(query).bind(...values).all<T>();
  return result.results || [];
}
