import type { Dispatch, SetStateAction } from "react";
import { bookById } from "../books";
import type { CartItem, Order } from "../types/store";

export function useOrders(
  cart: CartItem[],
  cartTotal: number,
  setCart: Dispatch<SetStateAction<CartItem[]>>,
  setOrders: Dispatch<SetStateAction<Order[]>>,
  toast: (message: string) => void,
  onPurchase: () => void,
) {
  function purchase() {
    if (!cart.length) return;
    const items = cart.flatMap((item) => {
      const book = bookById.get(item.bookId);
      return book ? [{ ...item, title: book.title, price: book.price }] : [];
    });
    setOrders((current) => [
      {
        id: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        date: new Date().toISOString(),
        items,
        total: cartTotal,
      },
      ...current,
    ]);
    setCart([]);
    onPurchase();
  }

  function cancelOrder(id: string) {
    setOrders((current) => current.filter((order) => order.id !== id));
    toast("Pedido cancelado y eliminado de tu lista.");
  }

  return { purchase, cancelOrder };
}
