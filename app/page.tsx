"use client";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { bookById, books, money, type Book } from "./books";
type User = {
    firstname: string;
    lastname: string;
    email: string;
};
type CartItem = {
    bookId: number;
    quantity: number;
};
type OrderItem = CartItem & {
    title: string;
    price: number;
};
type Order = {
    id: string;
    date: string;
    items: OrderItem[];
    total: number;
};
type View = "shop" | "checkout" | "orders";
type Notice = {
    message: string;
    error: boolean;
};
const keys = { user: "bookstore_user", cart: "bookstore_cart", orders: "bookstore_orders" };
const icons = {
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z M8 6h8 M8 10h6",
    bag: "M6 7h12l1 14H5L6 7Z M9 9V6a3 3 0 0 1 6 0v3",
    compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M16 8l-2.5 5.5L8 16l2.5-5.5L16 8Z",
    library: "M4 4v16 M9 3v17 M14 5v15 M19 2v18 M2 20h20",
    plus: "M12 5v14 M5 12h14",
    trash: "M3 6h18 M8 6V4h8v2 M6 6l1 15h10l1-15 M10 10v7 M14 10v7",
    x: "M18 6 6 18 M6 6l12 12",
    left: "M19 12H5 M12 19l-7-7 7-7",
    right: "M5 12h14 M12 5l7 7-7 7",
    check: "M20 6 9 17l-5-5",
    alert: "M12 9v4 M12 17h.01 M10.3 3.9 2.4 18a1.5 1.5 0 0 0 1.3 2.2h16.6a1.5 1.5 0 0 0 1.3-2.2l-7.9-14.1a1.5 1.5 0 0 0-2.6 0Z",
    sparkles: "M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z M19 16l.5 1.5L21 18l-1.5.5L19 20l-.5-1.5L17 18l1.5-.5L19 16Z",
} as const;
type IconName = keyof typeof icons;
function Icon({ name, className = "w-5 h-5" }: {
    name: IconName;
    className?: string;
}) {
    return <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icons[name]}/></svg>;
}
function readStorage<T>(key: string, fallback: T): T {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) as T : fallback;
    }
    catch {
        return fallback;
    }
}
function writeStorage(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch { /* The page remains usable without storage. */ }
}
function selectedView(): View {
    const view = new URLSearchParams(window.location.search).get("view");
    return view === "orders" || view === "checkout" ? view : "shop";
}
function href(view: View) { return view === "shop" ? "/" : `/?view=${view}`; }
function dateLabel(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}T/.test(value))
        return value;
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function BookCover({ book, mini = false }: {
    book: Book;
    mini?: boolean;
}) {
    if (mini)
        return <div className="w-12 h-16 shrink-0 rounded-md p-1.5 flex flex-col justify-between border border-outline bg-surface-lowest text-content  overflow-hidden" aria-hidden="true"><span className="text-[8px] font-bold tracking-widest opacity-70">AB</span><span className="text-[9px] font-display font-bold leading-tight line-clamp-2">{book.title}</span><span className="w-4 h-0.5 rounded-full bg-outline" /></div>;
    return <div className="book-cover" aria-hidden="true"><div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase opacity-80"><span>Aura Editorial</span><span className="w-2 h-2 rounded-full bg-outline" /></div><div className="text-center px-1"><span className="block w-8 h-0.5 mx-auto mb-3 bg-outline" /><span className="block font-display font-bold text-lg sm:text-xl leading-snug text-balance">{book.title}</span><span className="block text-xs text-muted font-medium mt-2 italic">{book.author}</span></div><div className="flex justify-between border-t border-outline pt-2 text-[10px] text-muted"><span>VOL. {String(book.id).padStart(2, "0")}</span><span className="uppercase tracking-wider font-semibold text-muted">Original</span></div></div>;
}
function Modal({ open, onClose, locked = false, children, className = "modal-dialog" }: {
    open: boolean;
    onClose: () => void;
    locked?: boolean;
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const dialog = ref.current; if (!dialog)
        return; if (open && !dialog.open)
        dialog.showModal(); if (!open && dialog.open)
        dialog.close(); }, [open]);
    return <dialog ref={ref} className={className} onCancel={(event) => { event.preventDefault(); if (!locked)
        onClose(); }} onClick={(event) => { if (locked || event.target !== event.currentTarget)
        return; const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
        onClose(); }}>{children}</dialog>;
}
function NavLink({ view, current, navigate, children, className }: {
    view: View;
    current: View;
    navigate: (view: View) => void;
    children: ReactNode;
    className: string;
}) {
    function onClick(event: MouseEvent<HTMLAnchorElement>) { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return; event.preventDefault(); navigate(view); }
    return <a href={href(view)} onClick={onClick} aria-current={current === view ? "page" : undefined} className={className}>{children}</a>;
}
export default function Home() {
    const [ready, setReady] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [view, setView] = useState<View>("shop");
    const [cartOpen, setCartOpen] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [cancelId, setCancelId] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [register, setRegister] = useState({ firstname: "", lastname: "", email: "" });
    const [touched, setTouched] = useState({ firstname: false, lastname: false, email: false });
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const reasonRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const timer = window.setTimeout(() => {
            const savedUser = readStorage<User | null>(keys.user, null);
            const savedCart = readStorage<CartItem[]>(keys.cart, []);
            const savedOrders = readStorage<Order[]>(keys.orders, []);
            setUser(savedUser && typeof savedUser.firstname === "string" ? savedUser : null);
            setCart(Array.isArray(savedCart) ? savedCart.filter((item) => bookById.has(item.bookId) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 200) : []);
            setOrders(Array.isArray(savedOrders) ? savedOrders : []);
            setView(selectedView());
            setReady(true);
        }, 0);
        const onPopState = () => setView(selectedView());
        window.addEventListener("popstate", onPopState);
        return () => { window.clearTimeout(timer); window.removeEventListener("popstate", onPopState); };
    }, []);
    useEffect(() => { if (ready)
        writeStorage(keys.user, user); }, [ready, user]);
    useEffect(() => { if (ready)
        writeStorage(keys.cart, cart); }, [ready, cart]);
    useEffect(() => { if (ready)
        writeStorage(keys.orders, orders); }, [ready, orders]);
    useEffect(() => () => { if (toastTimer.current)
        clearTimeout(toastTimer.current); }, []);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(register.email.trim());
    const validRegister = !!register.firstname.trim() && !!register.lastname.trim() && validEmail;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (bookById.get(item.bookId)?.price ?? 0) * item.quantity, 0);
    function toast(message: string, error = false) { setNotice({ message, error }); if (toastTimer.current)
        clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setNotice(null), 2600); }
    function navigate(next: View) { if (next === "checkout" && !cart.length)
        return; window.history.pushState({}, "", href(next)); setView(next); setCartOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
    function addToCart(book: Book) {
        const existing = cart.find((item) => item.bookId === book.id);
        if (existing?.quantity === 200) {
            toast(`Tope máximo alcanzado para “${book.title}” (200 unidades).`, true);
            return;
        }
        setCart((items) => existing ? items.map((item) => item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { bookId: book.id, quantity: 1 }]);
        toast(`“${book.title}” agregado al carrito.`);
    }
    function updateQuantity(bookId: number, value: number) {
        if (!Number.isFinite(value) || value < 1) {
            value = 1;
            toast("La cantidad debe ser al menos 1.", true);
        }
        if (value > 200) {
            value = 200;
            toast("La cantidad máxima permitida es 200.", true);
        }
        setCart((items) => items.map((item) => item.bookId === bookId ? { ...item, quantity: Math.trunc(value) } : item));
    }
    function removeFromCart(bookId: number) { setCart((items) => items.filter((item) => item.bookId !== bookId)); toast("Libro eliminado del carrito."); }
    function purchase() {
        if (!cart.length)
            return;
        const items = cart.flatMap((item) => { const book = bookById.get(item.bookId); return book ? [{ ...item, title: book.title, price: book.price }] : []; });
        setOrders((current) => [{ id: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, date: new Date().toISOString(), items, total: cartTotal }, ...current]);
        setCart([]);
        setSuccessOpen(true);
    }
    function cancelOrder() {
        if (!reason.trim()) {
            setReasonError(true);
            reasonRef.current?.focus();
            return;
        }
        setOrders((current) => current.filter((order) => order.id !== cancelId));
        setCancelId(null);
        setReason("");
        setReasonError(false);
        toast("Pedido cancelado y eliminado de tu lista.");
    }
    function submitRegistration(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!validRegister) {
            setTouched({ firstname: true, lastname: true, email: true });
            if (!register.firstname.trim()) firstNameRef.current?.focus();
            else if (!register.lastname.trim()) lastNameRef.current?.focus();
            else emailRef.current?.focus();
            return;
        }
        const next = { firstname: register.firstname.trim(), lastname: register.lastname.trim(), email: register.email.trim() };
        setUser(next);
        toast(`¡Bienvenido a Aura Books, ${next.firstname}!`);
    }
    return <div className="min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-surface focus:p-3 focus:rounded-lg">Saltar al contenido principal</a>
    <header className="sticky top-0 z-30 bg-surface-lowest/95 backdrop-blur-md border-b border-outline ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        <NavLink view="shop" current={view} navigate={navigate} className="flex items-center gap-3 group shrink-0"><span className="w-11 h-11 rounded-lg bg-primary text-on-primary flex items-center justify-center  group-hover:scale-105 transition-transform"><Icon name="book" className="w-6 h-6"/></span><span className="hidden sm:block"><span className="font-display font-bold text-2xl tracking-tight text-content block leading-tight" translate="no">Aura<span className="text-primary">Books</span></span><span className="text-[11px] font-medium tracking-widest uppercase text-muted">Librería de Selección</span></span></NavLink>
        <nav aria-label="Navegación principal" className="flex items-center gap-1 sm:gap-2 bg-surface/80 p-1.5 rounded-full border border-outline">
          <NavLink view="shop" current={view} navigate={navigate} className={`px-3 sm:px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-surface-raised transition-colors ${view === "shop" ? "bg-surface text-content " : "text-muted"}`}><Icon name="compass" className="w-4 h-4 text-primary"/><span>Comprar</span></NavLink>
          <NavLink view="orders" current={view} navigate={navigate} className={`px-3 sm:px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-surface-raised transition-colors ${view === "orders" ? "bg-surface text-content " : "text-muted"}`}><Icon name="library" className="w-4 h-4"/><span className="hidden min-[380px]:inline">Mis libros</span>{orders.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-surface-raised text-primary font-bold">{orders.length}</span>}</NavLink>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">{user && <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-outline text-sm"><span className="w-6 h-6 rounded-full bg-surface-raised text-primary flex items-center justify-center font-bold text-xs uppercase">{user.firstname.charAt(0)}</span><span className="font-medium text-content truncate max-w-32">Hola, {user.firstname}</span></div>}<button onClick={() => setCartOpen(true)} className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm  flex items-center gap-2.5" aria-label={`Abrir carrito de compras, ${cartCount} ${cartCount === 1 ? "libro" : "libros"}`}><Icon name="bag"/><span className="hidden sm:inline font-semibold">Carrito</span><span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-surface-raised text-content text-xs font-black tabular-nums">{cartCount}</span></button></div>
      </div>
    </header>
    <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {view === "shop" && <section className="space-y-8" aria-labelledby="catalog-title">
        <div className="relative overflow-hidden rounded-lg bg-surface-lowest text-content p-8 sm:p-12  border border-outline"><div className="relative z-10 max-w-2xl space-y-4"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised text-muted border border-outline text-xs font-semibold uppercase tracking-wider"><Icon name="sparkles" className="w-3.5 h-3.5"/>Curaduría Literaria 2025</div><h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-content leading-tight text-balance">Descubre lecturas que transforman tu universo.</h1><p className="text-muted text-base sm:text-lg leading-relaxed">Explora nuestra colección selecta de 10 obras imprescindibles. Portadas exclusivas, narrativas inolvidables y entrega inmediata para tu biblioteca.</p></div><div className="absolute right-10 top-10 opacity-10 pointer-events-none"><Icon name="book" className="w-64 h-64"/></div></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline pb-4"><div><h2 id="catalog-title" className="font-display text-2xl font-bold text-content">Catálogo Destacado</h2><p className="text-muted text-sm">Mostrando 10 títulos disponibles para envío y lectura</p></div><span className="self-start text-xs font-semibold text-muted uppercase tracking-wider bg-surface-raised px-3 py-1.5 rounded-lg border border-outline">Stock Garantizado · Offline First</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-7">{books.map((book) => <article key={book.id} className="bg-surface rounded-lg p-4 sm:p-5 flex flex-col justify-between border border-outline book-card group"><div className="space-y-4"><BookCover book={book}/><div><h3 className="font-display font-bold text-content text-base leading-snug line-clamp-1 group-hover:text-primary" title={book.title}>{book.title}</h3><p className="text-xs text-muted font-medium mt-0.5">{book.author}</p><p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">{book.description}</p></div></div><div className="pt-4 mt-4 border-t border-outline flex items-center justify-between gap-2"><div><span className="text-[10px] uppercase font-bold text-muted block">Precio</span><span className="text-base font-extrabold text-content tabular-nums">{money.format(book.price)}</span></div><button onClick={() => addToCart(book)} className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs flex items-center gap-1.5 " aria-label={`Agregar ${book.title} al carrito`}><Icon name="plus" className="w-3.5 h-3.5"/>Agregar</button></div></article>)}</div>
      </section>}
      {view === "checkout" && (cart.length ? <section className="space-y-8 max-w-4xl mx-auto"><div className="flex items-center justify-between gap-3 border-b border-outline pb-5"><NavLink view="shop" current={view} navigate={navigate} className="inline-flex items-center gap-2 text-muted hover:text-primary font-semibold text-sm py-2 px-3 rounded-lg hover:bg-surface-raised"><Icon name="left" className="w-4 h-4"/>Volver al catálogo</NavLink><span className="text-xs font-semibold px-3 py-1 bg-surface text-primary border border-outline rounded-full">Paso 2 de 2: Confirmación de Pedido</span></div><div className="bg-surface rounded-lg p-6 sm:p-10  border border-outline space-y-8"><div><h1 className="font-display text-3xl font-bold text-content">Resumen de tu Compra</h1><p className="text-muted text-sm mt-1">Revisa el detalle de los libros y confirma tu orden para procesar el pedido.</p></div><div className="divide-y divide-outline border-y border-outline">{cart.map((item) => { const book = bookById.get(item.bookId)!; return <div key={item.bookId} className="py-4 flex items-center justify-between gap-4"><div className="flex items-center gap-3 min-w-0"><BookCover book={book} mini/><div className="min-w-0"><h2 className="font-display font-bold text-content text-sm sm:text-base break-words">{book.title}</h2><p className="text-xs text-muted">{book.author}</p><p className="text-xs text-muted mt-1">Precio unitario: <strong>{money.format(book.price)}</strong></p></div></div><div className="text-right shrink-0"><span className="text-xs font-bold text-muted block">Cantidad: {item.quantity}</span><span className="font-display font-extrabold text-content text-base sm:text-lg tabular-nums">{money.format(book.price * item.quantity)}</span></div></div>; })}</div><div className="bg-surface-lowest rounded-lg p-6 border border-outline space-y-3"><div className="flex justify-between text-sm text-muted"><span>Subtotal de libros</span><span className="font-medium text-content tabular-nums">{money.format(cartTotal)}</span></div><div className="flex justify-between text-sm text-muted"><span>Envío estándar a domicilio <strong className="text-[11px] text-success bg-success/10 px-1.5 py-0.5 rounded">GRATIS</strong></span><span className="font-medium text-success">{money.format(0)}</span></div><div className="border-t border-outline pt-3 flex justify-between items-baseline"><span className="font-display text-lg font-bold text-content">Total a pagar:</span><span className="text-2xl sm:text-3xl font-extrabold text-primary tabular-nums">{money.format(cartTotal)}</span></div></div><div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-2"><NavLink view="shop" current={view} navigate={navigate} className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-outline text-content hover:bg-surface-raised font-semibold text-sm text-center">Seguir explorando</NavLink><button onClick={purchase} className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-base  flex items-center justify-center gap-2"><Icon name="check"/>Confirmar y Comprar</button></div></div></section> : <section className="max-w-2xl mx-auto bg-surface rounded-lg p-10 text-center border border-outline"><h1 className="font-display text-2xl font-bold">Tu carrito está vacío</h1><p className="mt-2 text-sm text-muted">Agrega libros para continuar con la compra.</p><NavLink view="shop" current={view} navigate={navigate} className="inline-block mt-5 px-5 py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm">Ir al Catálogo</NavLink></section>)}
      {view === "orders" && <section className="space-y-8 max-w-5xl mx-auto"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline pb-5"><div><h1 className="font-display text-3xl font-bold text-content">Mis Libros y Pedidos</h1><p className="text-muted text-sm mt-1">Historial de compras registradas en tu cuenta de Aura Books.</p></div><NavLink view="shop" current={view} navigate={navigate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-outline hover:bg-surface-raised text-content font-semibold text-sm self-start sm:self-auto"><Icon name="plus" className="w-4 h-4"/>Comprar más títulos</NavLink></div>{orders.length === 0 ? <div className="bg-surface rounded-lg p-10 sm:p-14 border border-outline text-center space-y-4"><div className="w-20 h-20 rounded-full bg-surface-raised text-muted mx-auto flex items-center justify-center"><Icon name="book" className="w-10 h-10"/></div><h2 className="font-display font-bold text-xl text-content">No tienes libros ni compras registradas</h2><p className="text-sm text-muted max-w-sm mx-auto">Cuando realices un pedido desde el carrito, aparecerá aquí con todo su detalle y opciones de gestión.</p><NavLink view="shop" current={view} navigate={navigate} className="inline-block mt-4 px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm">Ir a la Tienda</NavLink></div> : <div className="space-y-6">{orders.map((order) => <article key={order.id} className="bg-surface rounded-lg p-6 sm:p-7 border border-outline  space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline pb-4"><div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-raised text-content">Pedido #{order.id}</span><time className="text-xs text-muted font-medium" dateTime={order.date}>{dateLabel(order.date)}</time></div><p className="text-xs text-muted">Total de artículos: <strong className="text-content">{order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades</strong></p></div><div className="flex items-center gap-4"><div className="text-right"><span className="text-[11px] uppercase font-bold text-muted block">Total pagado</span><span className="font-display font-extrabold text-primary text-xl tabular-nums">{money.format(order.total)}</span></div><button onClick={() => { setCancelId(order.id); setReason(""); setReasonError(false); }} className="px-3.5 py-2 rounded-lg text-content bg-transparent border border-outline hover:bg-surface-raised font-semibold text-xs flex items-center gap-1.5"><Icon name="x" className="w-3.5 h-3.5"/>Cancelar pedido</button></div></div><div className="bg-surface-lowest/70 rounded-lg p-4 border border-outline divide-y divide-outline">{order.items.map((item) => <div key={item.bookId} className="flex items-center justify-between gap-3 text-sm py-2"><div className="flex items-center gap-3 min-w-0">{bookById.get(item.bookId) && <BookCover book={bookById.get(item.bookId)!} mini/>}<div className="min-w-0"><h2 className="font-display font-semibold text-content text-xs sm:text-sm break-words">{item.title}</h2><span className="text-xs text-muted">{item.quantity} × {money.format(item.price)}</span></div></div><span className="font-bold text-content text-xs sm:text-sm tabular-nums shrink-0">{money.format(item.price * item.quantity)}</span></div>)}</div></article>)}</div>}</section>}
    </main>
    <footer className="mt-auto border-t border-outline bg-surface py-8 text-center text-xs text-muted"><div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2"><Icon name="book" className="w-4 h-4 text-primary"/><span className="font-display font-semibold text-content" translate="no">AuraBooks SPA</span><span>· Librería Offline &amp; Persistente</span></div><p>© 2025 Aura Books Inc. Todos los derechos reservados. Datos locales protegidos.</p></div></footer>
    <Modal open={cartOpen && !!user} onClose={() => setCartOpen(false)} className="drawer-dialog"><div className="flex flex-col h-full"><div className="p-5 sm:p-6 border-b border-outline flex items-center justify-between bg-surface-lowest/70"><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-surface-raised text-primary flex items-center justify-center"><Icon name="bag"/></span><div><h2 className="font-display font-bold text-lg text-content">Carrito de Compras</h2><span className="text-xs text-muted font-medium">{cartCount} {cartCount === 1 ? "libro" : "libros"}</span></div></div><div className="flex items-center gap-2"><button onClick={() => { setCartOpen(false); setClearOpen(true); }} disabled={!cart.length} className="p-2 text-muted hover:text-content hover:bg-surface-raised rounded-lg disabled:opacity-40" aria-label="Vaciar todo el carrito"><Icon name="trash"/></button><button onClick={() => setCartOpen(false)} className="p-2 text-muted hover:text-content hover:bg-surface-raised rounded-lg" aria-label="Cerrar carrito"><Icon name="x"/></button></div></div><div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">{cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4"><div className="w-24 h-24 rounded-full bg-surface-raised border border-outline flex items-center justify-center text-muted"><Icon name="bag" className="w-12 h-12"/></div><h3 className="font-display font-bold text-content text-lg">Tu carrito está vacío</h3><p className="text-xs text-muted leading-relaxed max-w-xs">Aún no has agregado ningún título. Explora nuestro catálogo y selecciona algún libro para comenzar.</p><button onClick={() => setCartOpen(false)} className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary-hover">Explorar catálogo</button></div> : <div className="space-y-3">{cart.map((item) => { const book = bookById.get(item.bookId)!; return <div key={book.id} className="bg-surface rounded-lg p-3.5 border border-outline  flex gap-3 items-center"><BookCover book={book} mini/><div className="flex-1 min-w-0 space-y-1"><h3 className="font-display font-bold text-xs sm:text-sm text-content truncate" title={book.title}>{book.title}</h3><p className="text-[11px] text-muted">Unit: <strong className="text-content">{money.format(book.price)}</strong></p><p className="text-xs font-bold text-primary tabular-nums">Subtotal: {money.format(book.price * item.quantity)}</p></div><div className="flex flex-col items-end gap-2 shrink-0"><button onClick={() => removeFromCart(book.id)} className="p-1 text-muted hover:text-content hover:bg-surface-raised rounded-md" aria-label={`Eliminar ${book.title}`}><Icon name="trash" className="w-4 h-4"/></button><div className="flex items-center border border-outline rounded-lg bg-surface-lowest overflow-hidden"><button onClick={() => updateQuantity(book.id, item.quantity - 1)} className="px-2 py-0.5 text-muted hover:bg-surface-raised text-xs font-bold" aria-label={`Disminuir cantidad de ${book.title}`}>−</button><input type="number" min="1" max="200" name={`quantity-${book.id}`} key={`${book.id}-${item.quantity}`} defaultValue={item.quantity} onBlur={(event) => updateQuantity(book.id, Number(event.currentTarget.value))} onKeyDown={(event) => { if (event.key === "Enter")
        event.currentTarget.blur(); }} className="w-11 text-center bg-surface text-xs font-bold text-content py-0.5 border-x border-outline tabular-nums" aria-label={`Cantidad para ${book.title}`}/><button onClick={() => updateQuantity(book.id, item.quantity + 1)} className="px-2 py-0.5 text-muted hover:bg-surface-raised text-xs font-bold" aria-label={`Aumentar cantidad de ${book.title}`}>+</button></div></div></div>; })}</div>}</div><div className="p-5 sm:p-6 border-t border-outline bg-surface-lowest/90 space-y-4"><div className="space-y-1.5"><div className="flex justify-between text-xs text-muted"><span>Envío digital e impreso</span><span className="text-success font-semibold">Gratis</span></div><div className="flex justify-between items-baseline"><span className="text-sm font-semibold text-content">Total estimado:</span><span className="text-2xl font-display font-extrabold text-primary tabular-nums">{money.format(cartTotal)}</span></div></div><div className="grid grid-cols-2 gap-3"><button onClick={() => setCartOpen(false)} className="w-full py-3 px-4 rounded-lg border border-outline text-content bg-transparent hover:bg-surface-raised font-semibold text-sm">Devolver</button><button onClick={() => navigate("checkout")} disabled={!cart.length} className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-on-primary font-bold text-sm flex items-center justify-center gap-1.5">Comprar<Icon name="right" className="w-4 h-4"/></button></div></div></div></Modal>
    <Modal open={ready && !user} onClose={() => { }} locked><div className="bg-surface-lowest text-content p-7 text-center"><div className="w-14 h-14 mx-auto rounded-lg bg-surface-raised flex items-center justify-center mb-3"><Icon name="book" className="w-7 h-7 text-muted"/></div><h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Bienvenido a Bookstore</h2><p className="text-muted text-xs sm:text-sm mt-1.5">Crea tu perfil de lector para comenzar a explorar nuestro catálogo de libros.</p></div><form onSubmit={submitRegistration} noValidate className="p-6 sm:p-7 space-y-4">{(["firstname", "lastname", "email"] as const).map((field) => { const label = field === "firstname" ? "Nombre" : field === "lastname" ? "Apellido" : "Correo Electrónico"; const invalid = field === "email" ? !validEmail : !register[field].trim(); return <div key={field}><label htmlFor={`reg-${field}`} className="block text-xs font-bold uppercase tracking-wider text-content mb-1.5">{label} <span className="text-muted">*</span></label><input ref={field === "firstname" ? firstNameRef : field === "lastname" ? lastNameRef : emailRef} id={`reg-${field}`} name={field} type={field === "email" ? "email" : "text"} autoComplete={field === "email" ? "email" : field === "firstname" ? "given-name" : "family-name"} spellCheck={field === "email" ? false : undefined} value={register[field]} onChange={(event) => setRegister((current) => ({ ...current, [field]: event.target.value }))} onBlur={() => setTouched((current) => ({ ...current, [field]: true }))} aria-invalid={touched[field] && invalid} aria-describedby={touched[field] && invalid ? `error-${field}` : undefined} placeholder={field === "firstname" ? "Ej. Ana…" : field === "lastname" ? "Ej. García…" : "ana.garcia@ejemplo.com…"} className="w-full px-3.5 py-2.5 rounded-lg border border-outline text-content text-sm" required/><p id={`error-${field}`} aria-live="polite" className={`text-xs text-error mt-1 font-medium ${touched[field] && invalid ? "" : "hidden"}`}>{field === "email" ? "Ingresa un correo válido, por ejemplo usuario@dominio.com." : `Por favor ingresa tu ${label.toLowerCase()}.`}</p></div>; })}<div className="pt-3"><button type="submit" className="w-full py-3.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm tracking-wide  flex items-center justify-center gap-2"><Icon name="check" className="w-4 h-4"/>Crear usuario</button></div><p className="text-[11px] text-muted text-center">Registro obligatorio para navegar en la librería.</p></form></Modal>
    <Modal open={clearOpen} onClose={() => { setClearOpen(false); setCartOpen(true); }}><div className="p-6 space-y-4 text-center"><div className="w-12 h-12 rounded-full bg-surface-raised text-content mx-auto flex items-center justify-center"><Icon name="alert" className="w-6 h-6"/></div><h2 className="font-display text-xl font-bold text-content">¿Vaciar carrito?</h2><p className="text-sm text-muted">¿Seguro que quieres eliminar todo el carrito? Esta acción quitará todos los libros seleccionados.</p><div className="grid grid-cols-2 gap-3 pt-2"><button onClick={() => { setClearOpen(false); setCartOpen(true); }} className="py-2.5 px-4 rounded-lg border border-outline text-content hover:bg-surface-raised font-semibold text-sm">Cancelar</button><button onClick={() => { setCart([]); setClearOpen(false); setCartOpen(true); toast("Carrito vaciado exitosamente."); }} className="py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm">Confirmar</button></div></div></Modal>
    <Modal open={successOpen} onClose={() => { }} locked><div className="p-8 text-center space-y-5"><div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center"><Icon name="check" className="w-9 h-9"/></div><span className="inline-block text-xs uppercase tracking-widest text-success font-bold bg-success/10 px-3 py-1 rounded-full border border-success/30">¡Transacción Exitosa!</span><h2 className="font-display text-2xl sm:text-3xl font-bold text-content">¡Felicidades, compraste tus libros!</h2><p className="text-sm text-muted leading-relaxed">Tu pedido ha sido registrado correctamente y se encuentra disponible en tu sección personal de <strong>Mis libros</strong>.</p><button onClick={() => { setSuccessOpen(false); navigate("shop"); }} className="w-full py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm">Volver al dashboard</button></div></Modal>
    <Modal open={!!cancelId} onClose={() => setCancelId(null)}><div className="p-6 sm:p-7 space-y-5 relative"><button onClick={() => setCancelId(null)} className="absolute top-5 right-5 p-1 text-muted hover:text-content rounded-lg hover:bg-surface-raised" aria-label="Cerrar modal"><Icon name="x"/></button><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-surface-raised text-content flex items-center justify-center"><Icon name="x"/></span><div><h2 className="font-display text-lg font-bold text-content">Cancelar pedido</h2><p className="text-xs text-muted">Esta acción dará de baja el pedido registrado.</p></div></div><p className="text-sm text-content font-medium">¿Seguro que quieres cancelar este pedido?</p><div className="space-y-1.5"><label htmlFor="cancel-reason" className="block text-xs font-bold uppercase tracking-wider text-muted">Motivo de cancelación <span className="text-muted">* (Obligatorio)</span></label><textarea ref={reasonRef} id="cancel-reason" name="cancel-reason" autoComplete="off" rows={3} value={reason} onChange={(event) => { setReason(event.target.value); if (event.target.value.trim())
        setReasonError(false); }} placeholder="Explica brevemente por qué deseas cancelar el pedido…" aria-invalid={reasonError} aria-describedby={reasonError ? "err-cancel-reason" : undefined} className="w-full px-3 py-2 text-sm rounded-lg border border-outline text-content resize-none"/><p id="err-cancel-reason" aria-live="polite" className={`text-xs text-error font-medium ${reasonError ? "" : "hidden"}`}>Escribe un motivo para poder cancelar el pedido.</p></div><div className="grid grid-cols-2 gap-3 pt-2"><button onClick={() => setCancelId(null)} className="py-2.5 px-4 rounded-lg border border-outline text-content hover:bg-surface-raised font-semibold text-sm">Volver</button><button onClick={cancelOrder} className="py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm">Confirmar cancelación</button></div></div></Modal>
    <div role="status" aria-live="polite" className={`toast fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)] flex items-center gap-3 bg-surface-lowest text-content px-5 py-3 rounded-lg  border border-outline text-sm ${notice ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}><span className={`w-6 h-6 rounded-full flex items-center justify-center ${notice?.error ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}><Icon name={notice?.error ? "alert" : "check"} className="w-4 h-4"/></span><span className="font-medium">{notice?.message}</span></div>
  </div>;
}
