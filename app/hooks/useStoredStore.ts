import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { loadOrders } from "../actions";
import { keys, maxQuantity } from "../constants/store";
import type { BookById } from "../lib/books";
import { readStorage, writeStorage } from "../lib/storage";
import type { CartItem, Order, Customer } from "../types/store";

export function useStoredStore(
  syncView: () => void,
  bookById: BookById,
): {
  ready: boolean;
  customer: Customer | null;
  setCustomer: Dispatch<SetStateAction<Customer | null>>;
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  ordersLoading: boolean;
  ordersError: boolean;
} {
  const [ready, setReady] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoadedCustomerId, setOrdersLoadedCustomerId] = useState<number | null>(null);
  const [ordersError, setOrdersError] = useState(false);
  const ordersLoading = !!customer && ordersLoadedCustomerId !== customer.customer_id;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedUser = readStorage<Customer | null>(keys.user, null);
      const savedCart = readStorage<CartItem[]>(keys.cart, []);
      setCustomer(
        savedUser && typeof savedUser.firstname === "string" ? savedUser : null,
      );
      setCart(
        Array.isArray(savedCart)
          ? savedCart.filter(
              (item) =>
                bookById.has(item.bookId) &&
                Number.isInteger(item.quantity) &&
                item.quantity >= 1 &&
                item.quantity <= maxQuantity,
            )
          : [],
      );
      syncView();
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [syncView, bookById]);

  useEffect(() => {
    const customerId = customer?.customer_id;
    if (!customerId) return;

    let active = true;
    loadOrders(customerId)
      .then((loaded) => {
        if (active) {
          setOrders(loaded);
          setOrdersError(false);
          setOrdersLoadedCustomerId(customerId);
        }
      })
      .catch(() => {
        if (active) {
          setOrdersError(true);
          setOrdersLoadedCustomerId(customerId);
        }
      });
    return () => {
      active = false;
    };
  }, [customer?.customer_id]);

  useEffect(() => {
    if (ready) writeStorage(keys.user, customer);
  }, [ready, customer]);
  useEffect(() => {
    if (ready) writeStorage(keys.cart, cart);
  }, [ready, cart]);

  return {
    ready,
    customer,
    setCustomer,
    cart,
    setCart,
    orders,
    setOrders,
    ordersLoading,
    ordersError,
  };
}
