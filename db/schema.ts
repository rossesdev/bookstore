import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "cancelled",
]);

export const customersTable = pgTable("customers", {
  customer_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstname: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const booksTable = pgTable(
  "books",
  {
    book_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    author: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
  },
  (table) => [check("books_price_non_negative", sql`${table.price} >= 0`)],
);

export const ordersTable = pgTable(
  "orders",
  {
    order_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    customer_id: integer()
      .notNull()
      .references(() => customersTable.customer_id, { onDelete: "restrict" }),
    status: orderStatusEnum().default("pending").notNull(),
    order_version: integer().default(1).notNull(),
    total: numeric({ precision: 12, scale: 2 }).notNull(),
    updated_at: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_customer_id_idx").on(table.customer_id),
    check("orders_version_positive", sql`${table.order_version} >= 1`),
  ],
);

export const orderItemsTable = pgTable(
  "order_items",
  {
    item_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    order_id: integer()
      .notNull()
      .references(() => ordersTable.order_id, { onDelete: "cascade" }),
    book_id: integer()
      .notNull()
      .references(() => booksTable.book_id, { onDelete: "restrict" }),
    qty: integer().notNull(),
    unit_price: numeric({ precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    unique("order_items_order_id_book_id_unique").on(
      table.order_id,
      table.book_id,
    ),
    index("order_items_book_id_idx").on(table.book_id),
    check(
      "order_items_qty_between_1_and_200",
      sql`${table.qty} between 1 and 200`,
    ),
    check("order_items_unit_price_non_negative", sql`${table.unit_price} >= 0`),
  ],
);

export const outboxTable = pgTable(
  "outbox",
  {
    event_id: uuid().defaultRandom().primaryKey(),
    order_id: integer()
      .notNull()
      .references(() => ordersTable.order_id, { onDelete: "restrict" }),
    customer_id: integer()
      .notNull()
      .references(() => customersTable.customer_id, { onDelete: "restrict" }),
    order_version: integer().notNull(),
    occurred_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
    status: orderStatusEnum().notNull(),
    total: numeric({ precision: 12, scale: 2 }).notNull(),
    published_at: timestamp({ withTimezone: true }),
  },
  (table) => [
    unique("outbox_order_id_version_unique").on(
      table.order_id,
      table.order_version,
    ),
    index("outbox_published_at_idx").on(table.published_at),
    check("outbox_version_positive", sql`${table.order_version} >= 1`),
  ],
);
