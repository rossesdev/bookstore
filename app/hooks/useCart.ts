import type { Dispatch, SetStateAction } from "react";
import { bookById, type Book } from "../books";
import { maxQuantity } from "../constants/store";
import type { CartItem } from "../types/store";

export function useCart(
  cart: CartItem[],
  setCart: Dispatch<SetStateAction<CartItem[]>>,
  toast: (message: string, error?: boolean) => void,
) {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + (bookById.get(item.bookId)?.price ?? 0) * item.quantity,
    0,
  );

  function addToCart(book: Book) {
    const existing = cart.find((item) => item.bookId === book.id);
    if (existing?.quantity === maxQuantity) {
      toast(`Tope máximo alcanzado para “${book.title}” (${maxQuantity} unidades).`, true);
      return;
    }
    setCart((items) =>
      existing
        ? items.map((item) =>
            item.bookId === book.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...items, { bookId: book.id, quantity: 1 }],
    );
    toast(`“${book.title}” agregado al carrito.`);
  }

  function updateQuantity(bookId: number, value: number) {
    if (!Number.isFinite(value) || value < 1) {
      value = 1;
      toast("La cantidad debe ser al menos 1.", true);
    }
    if (value > maxQuantity) {
      value = maxQuantity;
      toast(`La cantidad máxima permitida es ${maxQuantity}.`, true);
    }
    setCart((items) =>
      items.map((item) =>
        item.bookId === bookId
          ? { ...item, quantity: Math.trunc(value) }
          : item,
      ),
    );
  }

  function removeFromCart(bookId: number) {
    setCart((items) => items.filter((item) => item.bookId !== bookId));
    toast("Libro eliminado del carrito.");
  }

  function clearCart() {
    setCart([]);
    toast("Carrito vaciado exitosamente.");
  }

  return {
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
