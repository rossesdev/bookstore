import { and, desc, eq, ne } from "drizzle-orm";
import db from "..";
import { booksTable, orderItemsTable, ordersTable } from "../schema";
import type { Order } from "../../app/types/store";

export async function getOrders(customerId: number): Promise<Order[]> {
  const rows = await db
    .select({ order: ordersTable, item: orderItemsTable, book: booksTable })
    .from(ordersTable)
    .leftJoin(orderItemsTable, eq(orderItemsTable.order_id, ordersTable.order_id))
    .leftJoin(booksTable, eq(booksTable.book_id, orderItemsTable.book_id))
    .where(
      and(
        eq(ordersTable.customer_id, customerId),
        ne(ordersTable.status, "cancelled"),
      ),
    )
    .orderBy(desc(ordersTable.created_at), desc(ordersTable.order_id));

  const orders = new Map<number, Order>();
  for (const { order, item, book } of rows) {
    if (!orders.has(order.order_id)) {
      orders.set(order.order_id, {
        order_id: order.order_id,
        customer_id: order.customer_id,
        status: order.status,
        order_version: order.order_version,
        total: Number(order.total),
        created_at: order.created_at.toISOString(),
        updated_at: order.updated_at.toISOString(),
        items: [],
      });
    }
    if (item && book) {
      orders.get(order.order_id)!.items.push({
        bookId: item.book_id,
        quantity: item.qty,
        title: book.name,
        price: Number(item.unit_price),
      });
    }
  }
  return [...orders.values()];
}
