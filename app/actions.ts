"use server";

import db from "../db";
import { customersTable, ordersTable, orderItemsTable } from "../db/schema";
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
  if (!order.items || order.items.length === 0) {
    throw new Error("Order must have at least one item");
  }

  return db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(ordersTable)
      .values({
        customer_id: order.customer_id,
        total: order.total.toFixed(2),
      })
      .returning();

    const createdItems = await tx
      .insert(orderItemsTable)
      .values(
        order.items.map((item) => ({
          order_id: createdOrder.order_id,
          book_id: item.bookId,
          qty: item.quantity,
          unit_price: item.price.toFixed(2),
        })),
      )
      .returning();

    return { order: createdOrder, items: createdItems };
  });
}
