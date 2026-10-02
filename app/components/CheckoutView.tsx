import { money, type BookById } from "../lib/books";
import type { CartItem, Order, View } from "../types/store";
import BookCover from "./BookCover";
import Icon from "./Icon";
import NavLink from "./NavLink";

export default function CheckoutView({
  cart,
  cartTotal,
  pendingOrder,
  creating,
  paying,
  bookById,
  view,
  navigate,
  createPendingOrder,
  payPendingOrder,
}: {
  cart: CartItem[];
  cartTotal: number;
  pendingOrder: Order | null;
  creating: boolean;
  paying: boolean;
  bookById: BookById;
  view: View;
  navigate: (view: View) => void;
  createPendingOrder: () => void;
  payPendingOrder: (id: number) => void;
}) {
  const activeOrder = cart.length ? null : pendingOrder;
  const items = activeOrder?.items ?? cart.map((item) => ({
    ...item,
    title: bookById.get(item.bookId)!.title,
    price: bookById.get(item.bookId)!.price,
  }));
  const total = activeOrder?.total ?? cartTotal;

  return items.length ? (
    <section className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 border-b border-outline pb-5">
        <NavLink
          view="shop"
          current={view}
          navigate={navigate}
          className="inline-flex items-center gap-2 text-muted hover:text-primary font-semibold text-sm py-2 px-3 rounded-lg hover:bg-surface-raised"
        >
          <Icon name="left" className="w-4 h-4" />
          Volver al catálogo
        </NavLink>
        <span className="text-xs font-semibold px-3 py-1 bg-surface text-primary border border-outline rounded-full">
          {activeOrder ? "Paso 2 de 2: Pagar" : "Paso 1 de 2: Crear pedido"}
        </span>
      </div>
      <div className="bg-surface rounded-lg p-6 sm:p-10  border border-outline space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-content">
            {activeOrder ? `Pedido #${activeOrder.order_id} pendiente de pago` : "Resumen de tu compra"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {activeOrder
              ? "Tu pedido ya está guardado. Puedes pagarlo ahora o volver después desde Mis libros."
              : "Revisa los libros y crea el pedido. Podrás pagarlo en el siguiente paso."}
          </p>
        </div>
        <div className="divide-y divide-outline border-y border-outline">
          {items.map((item) => {
            const book = bookById.get(item.bookId)!;
            return (
              <div
                key={item.bookId}
                className="py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookCover book={book} mini />
                  <div className="min-w-0">
                    <h2 className="font-display font-bold text-content text-sm sm:text-base break-words">
                      {item.title}
                    </h2>
                    <p className="text-xs text-muted">{book.author}</p>
                    <p className="text-xs text-muted mt-1">
                      Precio unitario:{" "}
                      <strong>{money.format(item.price)}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-muted block">
                    Cantidad: {item.quantity}
                  </span>
                  <span className="font-display font-extrabold text-content text-base sm:text-lg tabular-nums">
                    {money.format(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-surface-lowest rounded-lg p-6 border border-outline space-y-3">
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal de libros</span>
            <span className="font-medium text-content tabular-nums">
              {money.format(total)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>
              Envío estándar a domicilio{" "}
              <strong className="text-[11px] text-success bg-success/10 px-1.5 py-0.5 rounded">
                GRATIS
              </strong>
            </span>
            <span className="font-medium text-success">{money.format(0)}</span>
          </div>
          <div className="border-t border-outline pt-3 flex justify-between items-baseline">
            <span className="font-display text-lg font-bold text-content">
              Total a pagar:
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-primary tabular-nums">
              {money.format(total)}
            </span>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-2">
          <NavLink
            view="shop"
            current={view}
            navigate={navigate}
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-outline text-content hover:bg-surface-raised font-semibold text-sm text-center"
          >
            Seguir explorando
          </NavLink>
          <button
            onClick={() => activeOrder ? payPendingOrder(activeOrder.order_id) : createPendingOrder()}
            disabled={creating || paying}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-base  flex items-center justify-center gap-2"
          >
            <Icon name="check" />
            {creating ? "Creando pedido…" : paying ? "Procesando pago…" : activeOrder ? "Pagar" : "Crear pedido"}
          </button>
        </div>
      </div>
    </section>
  ) : (
    <section className="max-w-2xl mx-auto bg-surface rounded-lg p-10 text-center border border-outline">
      <h1 className="font-display text-2xl font-bold">Tu carrito está vacío</h1>
      <p className="mt-2 text-sm text-muted">
        Agrega libros para continuar con la compra.
      </p>
      <NavLink
        view="shop"
        current={view}
        navigate={navigate}
        className="inline-block mt-5 px-5 py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm"
      >
        Ir al Catálogo
      </NavLink>
    </section>
  );
}
