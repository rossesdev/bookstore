import type { User, View } from "../types/store";
import Icon from "./Icon";
import NavLink from "./NavLink";

export default function StoreHeader({
  view,
  navigate,
  user,
  ordersCount,
  cartCount,
  onOpenCart,
}: {
  view: View;
  navigate: (view: View) => void;
  user: User | null;
  ordersCount: number;
  cartCount: number;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-surface-lowest/95 backdrop-blur-md border-b border-outline ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        <NavLink
          view="shop"
          current={view}
          navigate={navigate}
          className="flex items-center gap-3 group shrink-0"
        >
          <span className="w-11 h-11 rounded-lg bg-primary text-on-primary flex items-center justify-center  group-hover:scale-105 transition-transform">
            <Icon name="book" className="w-6 h-6" />
          </span>
          <span className="hidden sm:block">
            <span
              className="font-display font-bold text-2xl tracking-tight text-content block leading-tight"
              translate="no"
            >
              Aura<span className="text-primary">Books</span>
            </span>
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted">
              Librería de Selección
            </span>
          </span>
        </NavLink>
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-1 sm:gap-2 bg-surface/80 p-1.5 rounded-full border border-outline"
        >
          <NavLink
            view="shop"
            current={view}
            navigate={navigate}
            className={`px-3 sm:px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-surface-raised transition-colors ${view === "shop" ? "bg-surface text-content " : "text-muted"}`}
          >
            <Icon name="compass" className="w-4 h-4 text-primary" />
            <span>Comprar</span>
          </NavLink>
          <NavLink
            view="orders"
            current={view}
            navigate={navigate}
            className={`px-3 sm:px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-surface-raised transition-colors ${view === "orders" ? "bg-surface text-content " : "text-muted"}`}
          >
            <Icon name="library" className="w-4 h-4" />
            <span className="hidden min-[380px]:inline">Mis libros</span>
            {ordersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-surface-raised text-primary font-bold">
                {ordersCount}
              </span>
            )}
          </NavLink>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-outline text-sm">
              <span className="w-6 h-6 rounded-full bg-surface-raised text-primary flex items-center justify-center font-bold text-xs uppercase">
                {user.firstname.charAt(0)}
              </span>
              <span className="font-medium text-content truncate max-w-32">
                Hola, {user.firstname}
              </span>
            </div>
          )}
          <button
            onClick={() => onOpenCart()}
            className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm  flex items-center gap-2.5"
            aria-label={`Abrir carrito de compras, ${cartCount} ${cartCount === 1 ? "libro" : "libros"}`}
          >
            <Icon name="bag" />
            <span className="hidden sm:inline font-semibold">Carrito</span>
            <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-surface-raised text-content text-xs font-black tabular-nums">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
