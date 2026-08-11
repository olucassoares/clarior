CREATE TABLE "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"month" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"description" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"type" text NOT NULL,
	"category_id" text NOT NULL,
	"occurred_at" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_owner_month_idx" ON "budgets" USING btree ("owner_id","month");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_owner_name_type_idx" ON "categories" USING btree ("owner_id","name","type");--> statement-breakpoint
CREATE INDEX "transactions_owner_date_idx" ON "transactions" USING btree ("owner_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_owner_idempotency_idx" ON "transactions" USING btree ("owner_id","idempotency_key");