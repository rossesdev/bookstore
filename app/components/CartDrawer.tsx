import { maxQuantity } from "../constants/store";
import { money, type BookById } from "../lib/books";
import type { CartItem } from "../types/store";
import BookCover from "./BookCover";
import Icon from "./Icon";
import Modal from "./Modal";

export default function CartDrawer({
  open,
  cart,
  bookById,
  cartCount,
  cartTotal,
  onClose,
  onClearRequest,
  onCheckout,
  removeFromCart,
  updateQuantity,
}: {
  open: boolean;
  cart: CartItem[];
  bookById: BookById;
  cartCount: number;
  cartTotal: number;
  onClose: () => void;
  onClearRequest: () => void;
  onCheckout: () => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, value: number) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} className="drawer-dialog">
      <div className="flex flex-col h-full">
        <div className="p-5 sm:p-6 border-b border-outline flex items-center justify-between bg-surface-lowest/70">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-surface-raised text-primary flex items-center justify-center">
              <Icon name="bag" />
            </span>
            <div>
              <h2 className="font-display font-bold text-lg text-content">
                Carrito de Compras
              </h2>
              <span className="text-xs text-muted font-medium">
                {cartCount} {cartCount === 1 ? "libro" : "libros"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onClearRequest();
              }}
              disabled={!cart.length}
              className="p-2 text-muted hover:text-content hover:bg-surface-raised rounded-lg disabled:opacity-40"
              aria-label="Vaciar todo el carrito"
            >
              <Icon name="trash" />
            </button>
            <button
              onClick={() => onClose()}
              className="p-2 text-muted hover:text-content hover:bg-surface-raised rounded-lg"
              aria-label="Cerrar carrito"
            >
              <Icon name="x" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-24 h-24 rounded-full bg-surface-raised border border-outline flex items-center justify-center text-muted">
                <Icon name="bag" className="w-12 h-12" />
              </div>
              <h3 className="font-display font-bold text-content text-lg">
                Tu carrito está vacío
              </h3>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                Aún no has agregado ningún título. Explora nuestro catálogo y
                selecciona algún libro para comenzar.
              </p>
              <button
                onClick={() => onClose()}
                className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary-hover"
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const book = bookById.get(item.bookId)!;
                return (
                  <div
                    key={book.id}
                    className="bg-surface rounded-lg p-3.5 border border-outline  flex gap-3 items-center"
                  >
                    <BookCover book={book} mini />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3
                        className="font-display font-bold text-xs sm:text-sm text-content truncate"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-muted">
                        Unit:{" "}
                        <strong className="text-content">
                          {money.format(book.price)}
                        </strong>
                      </p>
                      <p className="text-xs font-bold text-primary tabular-nums">
                        Subtotal: {money.format(book.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => removeFromCart(book.id)}
                        className="p-1 text-muted hover:text-content hover:bg-surface-raised rounded-md"
                        aria-label={`Eliminar ${book.title}`}
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                      <div className="flex items-center border border-outline rounded-lg bg-surface-lowest overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(book.id, item.quantity - 1)
                          }
                          className="px-2 py-0.5 text-muted hover:bg-surface-raised text-xs font-bold"
                          aria-label={`Disminuir cantidad de ${book.title}`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={maxQuantity}
                          name={`quantity-${book.id}`}
                          key={`${book.id}-${item.quantity}`}
                          defaultValue={item.quantity}
                          onBlur={(event) =>
                            updateQuantity(
                              book.id,
                              Number(event.currentTarget.value),
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter")
                              event.currentTarget.blur();
                          }}
                          className="w-11 text-center bg-surface text-xs font-bold text-content py-0.5 border-x border-outline tabular-nums"
                          aria-label={`Cantidad para ${book.title}`}
                        />
                        <button
                          onClick={() =>
                            updateQuantity(book.id, item.quantity + 1)
                          }
                          className="px-2 py-0.5 text-muted hover:bg-surface-raised text-xs font-bold"
                          aria-label={`Aumentar cantidad de ${book.title}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6 border-t border-outline bg-surface-lowest/90 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted">
              <span>Envío digital e impreso</span>
              <span className="text-success font-semibold">Gratis</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-content">
                Total estimado:
              </span>
              <span className="text-2xl font-display font-extrabold text-primary tabular-nums">
                {money.format(cartTotal)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onClose()}
              className="w-full py-3 px-4 rounded-lg border border-outline text-content bg-transparent hover:bg-surface-raised font-semibold text-sm"
            >
              Devolver
            </button>
            <button
              onClick={() => onCheckout()}
              disabled={!cart.length}
              className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-on-primary font-bold text-sm flex items-center justify-center gap-1.5"
            >
              Comprar
              <Icon name="right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
