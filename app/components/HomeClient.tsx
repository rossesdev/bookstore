"use client";

import { useMemo, useState } from "react";
import { useCancellationForm } from "../hooks/useCancellationForm";
import { useCart } from "../hooks/useCart";
import { useNotice } from "../hooks/useNotice";
import { useOrders } from "../hooks/useOrders";
import { useRegistrationForm } from "../hooks/useRegistrationForm";
import { useStoredStore } from "../hooks/useStoredStore";
import { useStoreNavigation } from "../hooks/useStoreNavigation";
import { createBookById } from "../lib/books";
import type { Book, View } from "../types/store";
import CancelOrderDialog from "./CancelOrderDialog";
import CartDrawer from "./CartDrawer";
import CatalogView from "./CatalogView";
import CheckoutView from "./CheckoutView";
import ClearCartDialog from "./ClearCartDialog";
import NoticeToast from "./NoticeToast";
import OrdersView from "./OrdersView";
import PurchaseSuccessDialog from "./PurchaseSuccessDialog";
import RegistrationDialog from "./RegistrationDialog";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";

export default function HomeClient({ books }: { books: Array<Book> }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const bookById = useMemo(() => createBookById(books), [books]);
  const { view, syncView, navigate: navigateTo } = useStoreNavigation();
  const {
    ready,
    customer,
    setCustomer,
    cart,
    setCart,
    orders,
    setOrders,
    ordersLoading,
    ordersError,
  } = useStoredStore(syncView, bookById);
  const { notice, toast } = useNotice();
  const {
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart(cart, bookById, setCart, toast);
  const {
    checkoutOrder,
    creating,
    payingOrderId,
    createPendingOrder,
    payPendingOrder,
    cancelOrder,
  } = useOrders(
    customer,
    cart,
    bookById,
    setCart,
    setOrders,
    toast,
    () => setSuccessOpen(true),
  );
  const registration = useRegistrationForm(setCustomer, toast);
  const cancellation = useCancellationForm(cancelOrder);

  function navigate(next: View) {
    navigateTo(next, cart.length, () => setCartOpen(false));
  }

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:bg-surface focus:p-3 focus:rounded-lg"
      >
        Saltar al contenido principal
      </a>
      <StoreHeader
        view={view}
        navigate={navigate}
        user={customer}
        ordersCount={orders.length}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />
      <main
        id="main-content"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
      >
        {view === "shop" && <CatalogView books={books} addToCart={addToCart} />}
        {view === "checkout" && (
          <CheckoutView
            cart={cart}
            cartTotal={cartTotal}
            pendingOrder={checkoutOrder}
            creating={creating}
            paying={payingOrderId !== null}
            bookById={bookById}
            view={view}
            navigate={navigate}
            createPendingOrder={createPendingOrder}
            payPendingOrder={payPendingOrder}
          />
        )}
        {view === "orders" && (
          <OrdersView
            orders={orders}
            loading={ordersLoading}
            error={ordersError}
            bookById={bookById}
            view={view}
            navigate={navigate}
            onCancelOrder={cancellation.openCancel}
            onPayOrder={payPendingOrder}
            payingOrderId={payingOrderId}
          />
        )}
      </main>
      <StoreFooter />
      <CartDrawer
        open={cartOpen && !!customer}
        cart={cart}
        bookById={bookById}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClose={() => setCartOpen(false)}
        onClearRequest={() => setClearOpen(true)}
        onCheckout={() => navigate("checkout")}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />
      <RegistrationDialog open={ready && !customer} form={registration} />
      <ClearCartDialog
        open={clearOpen}
        onCancel={() => {
          setClearOpen(false);
          setCartOpen(true);
        }}
        onConfirm={() => {
          clearCart();
          setClearOpen(false);
          setCartOpen(true);
        }}
      />
      <PurchaseSuccessDialog
        open={successOpen}
        onContinue={() => {
          setSuccessOpen(false);
          navigate("shop");
        }}
      />
      <CancelOrderDialog form={cancellation} />
      <NoticeToast notice={notice} />
    </div>
  );
}
