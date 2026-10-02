import { dateLabel } from "../lib/dateLabel";
import { money, type BookById } from "../lib/books";
import type { Order, View } from "../types/store";
import BookCover from "./BookCover";
import Icon from "./Icon";
import NavLink from "./NavLink";

export default function OrdersView({
  orders,
  loading,
  error,
  bookById,
  view,
  navigate,
  onCancelOrder,
  onPayOrder,
  payingOrderId,
}: {
  orders: Order[];
  loading: boolean;
  error: boolean;
  bookById: BookById;
  view: View;
  navigate: (view: View) => void;
  onCancelOrder: (id: number) => void;
  onPayOrder: (id: number) => void;
  payingOrderId: number | null;
}) {
  return (
    <section className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-content">
            Mis Libros y Pedidos
          </h1>
          <p className="text-muted text-sm mt-1">
            Historial de compras registradas en tu cuenta de Aura Books.
          </p>
        </div>
        <NavLink
          view="shop"
          current={view}
          navigate={navigate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-outline hover:bg-surface-raised text-content font-semibold text-sm self-start sm:self-auto"
        >
          <Icon name="plus" className="w-4 h-4" />
          Comprar más títulos
        </NavLink>
      </div>
      {loading || error ? (
        <p className="text-center text-muted" role="status">
          {loading ? "Cargando pedidos…" : "No se pudieron cargar tus pedidos."}
        </p>
      ) : orders.length === 0 ? (
        <div className="bg-surface rounded-lg p-10 sm:p-14 border border-outline text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-surface-raised text-muted mx-auto flex items-center justify-center">
            <Icon name="book" className="w-10 h-10" />
          </div>
          <h2 className="font-display font-bold text-xl text-content">
            No tienes libros ni compras registradas
          </h2>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Cuando realices un pedido desde el carrito, aparecerá aquí con todo
            su detalle y opciones de gestión.
          </p>
          <NavLink
            view="shop"
            current={view}
            navigate={navigate}
            className="inline-block mt-4 px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm"
          >
            Ir a la Tienda
          </NavLink>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article
              key={order.order_id}
              className="bg-surface rounded-lg p-6 sm:p-7 border border-outline  space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-raised text-content">
                      Pedido #{order.order_id}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {order.status === "paid" ? "Pagado" : "Pendiente de pago"}
                    </span>
                    <time
                      className="text-xs text-muted font-medium"
                      dateTime={order.created_at}
                    >
                      {dateLabel(order.created_at)}
                    </time>
                  </div>
                  <p className="text-xs text-muted">
                    Total de artículos:{" "}
                    <strong className="text-content">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      unidades
                    </strong>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] uppercase font-bold text-muted block">
                      {order.status === "paid" ? "Total pagado" : "Total pendiente"}
                    </span>
                    <span className="font-display font-extrabold text-primary text-xl tabular-nums">
                      {money.format(order.total)}
                    </span>
                  </div>
                  {order.status === "pending" && (
                    <button
                      onClick={() => onPayOrder(order.order_id)}
                      disabled={payingOrderId !== null}
                      className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs"
                    >
                      {payingOrderId === order.order_id ? "Procesando…" : "Pagar"}
                    </button>
                  )}
                  <button
                    onClick={() => onCancelOrder(order.order_id)}
                    className="px-3.5 py-2 rounded-lg text-content bg-transparent border border-outline hover:bg-surface-raised font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Icon name="x" className="w-3.5 h-3.5" />
                    Cancelar pedido
                  </button>
                </div>
              </div>
              <div className="bg-surface-lowest/70 rounded-lg p-4 border border-outline divide-y divide-outline">
                {order.items.map((item) => (
                  <div
                    key={item.bookId}
                    className="flex items-center justify-between gap-3 text-sm py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {bookById.get(item.bookId) && (
                        <BookCover book={bookById.get(item.bookId)!} mini />
                      )}
                      <div className="min-w-0">
                        <h2 className="font-display font-semibold text-content text-xs sm:text-sm wrap-break-word">
                          {item.title}
                        </h2>
                        <span className="text-xs text-muted">
                          {item.quantity} × {money.format(item.price)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-content text-xs sm:text-sm tabular-nums shrink-0">
                      {money.format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
