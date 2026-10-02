"use server";

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import db from "../db";
import { getOrders } from "../db/queries/orders";
import {
  booksTable,
  customersTable,
  outboxTable,
  ordersTable,
  orderItemsTable,
} from "../db/schema";
import { maxQuantity } from "./constants/store";
import type { CreateOrderInput, CustomerInput } from "./types/store";

export async function createCustomer(user: CustomerInput) {
  const firstname = user.firstname.trim();
  const lastname = user.lastname.trim();
  const email = user.email.trim();

  if (!firstname || !lastname || !email) {
    throw new Error("Invalid user");
  }

  const [createdUser] = await db
    .insert(customersTable)
    .values({
      firstname: firstname,
      lastname: lastname,
      email: email,
    })
    .returning();

  return createdUser;
}

export async function createOrder(order: CreateOrderInput) {
  if (
    !Number.isSafeInteger(order.customer_id) ||
    order.customer_id < 1 ||
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    order.items.some(
      (item) =>
        !Number.isSafeInteger(item.bookId) ||
        item.bookId < 1 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > maxQuantity,
    )
  ) {
    throw new Error("Invalid order");
  }

  return db.transaction(async (tx) => {
    const bookIds = order.items.map((item) => item.bookId);
    if (new Set(bookIds).size !== bookIds.length) {
      throw new Error("Duplicate book");
    }
    const books = await tx
      .select({ id: booksTable.book_id, title: booksTable.name, price: booksTable.price })
      .from(booksTable)
      .where(inArray(booksTable.book_id, bookIds));
    if (books.length !== bookIds.length) {
      throw new Error("Book not found");
    }
    const bookById = new Map(books.map((book) => [book.id, book]));
    const totalCents = order.items.reduce(
      (total, item) =>
        total + Math.round(Number(bookById.get(item.bookId)!.price) * 100) * item.quantity,
      0,
    );
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
      throw new Error("Invalid total");
    }

    const [createdOrder] = await tx
      .insert(ordersTable)
      .values({
        customer_id: order.customer_id,
        status: "pending",
        order_version: 1,
        total: (totalCents / 100).toFixed(2),
      })
      .returning();

    await tx
      .insert(orderItemsTable)
      .values(
        order.items.map((item) => ({
          order_id: createdOrder.order_id,
          book_id: item.bookId,
          qty: item.quantity,
          unit_price: bookById.get(item.bookId)!.price,
        })),
      );

    await tx.insert(outboxTable).values({
      order_id: createdOrder.order_id,
      customer_id: createdOrder.customer_id,
      order_version: createdOrder.order_version,
      occurred_at: createdOrder.created_at,
      status: createdOrder.status,
      total: "0.00",
    });

    return {
      order: createdOrder,
      items: order.items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        title: bookById.get(item.bookId)!.title,
        price: Number(bookById.get(item.bookId)!.price),
      })),
    };
  });
}

export async function payOrder(orderId: number, customerId: number) {
  if (
    !Number.isSafeInteger(orderId) ||
    orderId < 1 ||
    !Number.isSafeInteger(customerId) ||
    customerId < 1
  ) {
    throw new Error("Invalid order");
  }

  return db.transaction(async (tx) => {
    const [paid] = await tx
      .update(ordersTable)
      .set({ status: "paid", order_version: sql`${ordersTable.order_version} + 1` })
      .where(
        and(
          eq(ordersTable.order_id, orderId),
          eq(ordersTable.customer_id, customerId),
          eq(ordersTable.status, "pending"),
          eq(ordersTable.order_version, 1),
        ),
      )
      .returning();
    if (!paid) throw new Error("Pending order not found");

    await tx.insert(outboxTable).values({
      order_id: paid.order_id,
      customer_id: paid.customer_id,
      order_version: paid.order_version,
      occurred_at: paid.updated_at,
      status: paid.status,
      total: paid.total,
    });
    return paid;
  });
}

export async function loadOrders(customerId: number) {
  if (!Number.isSafeInteger(customerId) || customerId < 1) {
    throw new Error("Invalid customer");
  }
  return getOrders(customerId);
}

export async function cancelOrder(orderId: number, customerId: number) {
  if (
    !Number.isSafeInteger(orderId) ||
    orderId < 1 ||
    !Number.isSafeInteger(customerId) ||
    customerId < 1
  ) {
    throw new Error("Invalid order");
  }

  return db.transaction(async (tx) => {
    const [previous] = await tx
      .select({ status: ordersTable.status, total: ordersTable.total })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.order_id, orderId),
          eq(ordersTable.customer_id, customerId),
        ),
      )
      .for("update");
    if (!previous || previous.status === "cancelled") {
      throw new Error("Order not found");
    }

    const [cancelled] = await tx
      .update(ordersTable)
      .set({
        status: "cancelled",
        total: previous.status === "paid" ? `-${previous.total}` : "0.00",
        order_version: sql`${ordersTable.order_version} + 1`,
      })
      .where(
        and(
          eq(ordersTable.order_id, orderId),
          eq(ordersTable.customer_id, customerId),
          ne(ordersTable.status, "cancelled"),
        ),
      )
      .returning();
    if (!cancelled) throw new Error("Order not found");

    await tx.insert(outboxTable).values({
      order_id: cancelled.order_id,
      customer_id: cancelled.customer_id,
      order_version: cancelled.order_version,
      occurred_at: cancelled.updated_at,
      status: cancelled.status,
      total: cancelled.total,
    });
  });
}
