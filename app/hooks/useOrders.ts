import { useState, type Dispatch, type SetStateAction } from "react";
import {
  cancelOrder as cancelStoredOrder,
  createOrder,
  payOrder as payStoredOrder,
} from "../actions";
import type { BookById } from "../lib/books";
import type { CartItem, Customer, Order } from "../types/store";

export function useOrders(
  customer: Customer | null,
  cart: CartItem[],
  bookById: BookById,
  setCart: Dispatch<SetStateAction<CartItem[]>>,
  setOrders: Dispatch<SetStateAction<Order[]>>,
  toast: (message: string, error?: boolean) => void,
  onPurchase: () => void,
) {
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [creating, setCreating] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);

  async function createPendingOrder() {
    if (!cart.length || creating) return;
    const customerID = customer?.customer_id;
    if (!customerID) return;
    if (cart.some((item) => !bookById.has(item.bookId))) {
      toast("Hay libros que ya no están disponibles.", true);
      return;
    }

    setCreating(true);
    try {
      const { order, items } = await createOrder({
        customer_id: customerID,
        items: cart,
      });
      const pendingOrder: Order = {
        order_id: order.order_id,
        customer_id: order.customer_id,
        status: order.status,
        order_version: order.order_version,
        total: Number(order.total),
        items,
        created_at: order.created_at.toISOString(),
        updated_at: order.updated_at.toISOString(),
      };
      setOrders((current) => [pendingOrder, ...current]);
      setCheckoutOrder(pendingOrder);
      setCart([]);
    } catch {
      toast("No se pudo crear el pedido.", true);
    } finally {
      setCreating(false);
    }
  }

  async function payPendingOrder(id: number) {
    if (!customer?.customer_id || payingOrderId !== null) return;
    setPayingOrderId(id);
    try {
      const paid = await payStoredOrder(id, customer.customer_id);
      setOrders((current) =>
        current.map((order) =>
          order.order_id === id
            ? {
                ...order,
                status: paid.status,
                order_version: paid.order_version,
                updated_at: paid.updated_at.toISOString(),
              }
            : order,
        ),
      );
      setCheckoutOrder((current) => current?.order_id === id ? null : current);
      onPurchase();
    } catch {
      toast("No se pudo confirmar el pago.", true);
    } finally {
      setPayingOrderId(null);
    }
  }

  async function cancelOrder(id: number) {
    if (!customer?.customer_id) return false;
    try {
      await cancelStoredOrder(id, customer.customer_id);
      setOrders((current) => current.filter((order) => order.order_id !== id));
      toast("Pedido cancelado y eliminado de tu lista.");
      return true;
    } catch {
      toast("No se pudo cancelar el pedido.", true);
      return false;
    }
  }

  return { checkoutOrder, creating, payingOrderId, createPendingOrder, payPendingOrder, cancelOrder };
}
