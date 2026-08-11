import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("categories_owner_name_type_idx").on(table.ownerId, table.name, table.type)]);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  occurredAt: text("occurred_at").notNull(),
  notes: text("notes").notNull().default(""),
  idempotencyKey: text("idempotency_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("transactions_owner_date_idx").on(table.ownerId, table.occurredAt),
  uniqueIndex("transactions_owner_idempotency_idx").on(table.ownerId, table.idempotencyKey),
]);

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  month: text("month").notNull(),
  amountCents: integer("amount_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("budgets_owner_month_idx").on(table.ownerId, table.month)]);
