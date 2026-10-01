import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { bookById } from "../books";
import { keys, maxQuantity } from "../constants/store";
import { readStorage, writeStorage } from "../lib/storage";
import type { CartItem, Order, User } from "../types/store";

export function useStoredStore(syncView: () => void): {
  ready: boolean;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
} {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedUser = readStorage<User | null>(keys.user, null);
      const savedCart = readStorage<CartItem[]>(keys.cart, []);
      const savedOrders = readStorage<Order[]>(keys.orders, []);
      setUser(
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
      setOrders(Array.isArray(savedOrders) ? savedOrders : []);
      syncView();
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [syncView]);

  useEffect(() => {
    if (ready) writeStorage(keys.user, user);
  }, [ready, user]);
  useEffect(() => {
    if (ready) writeStorage(keys.cart, cart);
  }, [ready, cart]);
  useEffect(() => {
    if (ready) writeStorage(keys.orders, orders);
  }, [ready, orders]);

  return { ready, user, setUser, cart, setCart, orders, setOrders };
}
