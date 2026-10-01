import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { bookById } from "../books";
import { keys, maxQuantity } from "../constants/store";
import { readStorage, writeStorage } from "../lib/storage";
import type { CartItem, Order, Customer } from "../types/store";

export function useStoredStore(syncView: () => void): {
  ready: boolean;
  customer: Customer | null;
  setCustomer: Dispatch<SetStateAction<Customer | null>>;
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
} {
  const [ready, setReady] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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
  }, [syncView]);

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
  };
}
