import type { Dispatch, SetStateAction } from "react";
import { bookById } from "../books";
import type { CartItem, Customer, Order } from "../types/store";
import { createOrder } from "../actions";

export function useOrders(
  customer: Customer | null,
  cart: CartItem[],
  cartTotal: number,
  setCart: Dispatch<SetStateAction<CartItem[]>>,
  setOrders: Dispatch<SetStateAction<Order[]>>,
  toast: (message: string) => void,
  onPurchase: () => void,
) {
  async function purchase() {
    if (!cart.length) return;
    if (cartTotal <= 0) return;

    const customerID = customer?.customer_id;

    const items = cart.flatMap((item) => {
      const book = bookById.get(item.bookId);
      return book ? [{ ...item, title: book.title, price: book.price }] : [];
    });

    if (!customerID) return;

    const order = {
      customer_id: customerID,
      total: cartTotal,
      items,
    };

    const { order: persistedOrder } = await createOrder(order);
    const completedOrder: Order = {
      ...order,
      order_id: persistedOrder.order_id,
      status: persistedOrder.status,
      created_at: persistedOrder.created_at.toISOString(),
      updated_at: persistedOrder.updated_at.toISOString(),
    };

    setCart([]);
    setOrders((current) => [completedOrder, ...current]);
    onPurchase();
  }

  function cancelOrder(id: number) {
    setOrders((current) => current.filter((order) => order.order_id !== id));
    toast("Pedido cancelado y eliminado de tu lista.");
  }

  return { purchase, cancelOrder };
}
