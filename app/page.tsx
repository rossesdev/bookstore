"use client";

import { useState } from "react";
import StoreHeader from "./components/StoreHeader";
import CatalogView from "./components/CatalogView";
import CheckoutView from "./components/CheckoutView";
import OrdersView from "./components/OrdersView";
import StoreFooter from "./components/StoreFooter";
import CartDrawer from "./components/CartDrawer";
import RegistrationDialog from "./components/RegistrationDialog";
import ClearCartDialog from "./components/ClearCartDialog";
import PurchaseSuccessDialog from "./components/PurchaseSuccessDialog";
import CancelOrderDialog from "./components/CancelOrderDialog";
import NoticeToast from "./components/NoticeToast";
import { useStoredStore } from "./hooks/useStoredStore";
import { useStoreNavigation } from "./hooks/useStoreNavigation";
import { useCart } from "./hooks/useCart";
import { useOrders } from "./hooks/useOrders";
import { useNotice } from "./hooks/useNotice";
import { useRegistrationForm } from "./hooks/useRegistrationForm";
import { useCancellationForm } from "./hooks/useCancellationForm";
import type { View } from "./types/store";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { view, syncView, navigate: navigateTo } = useStoreNavigation();
  const { ready, user, setUser, cart, setCart, orders, setOrders } =
    useStoredStore(syncView);
  const { notice, toast } = useNotice();
  const { cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart } =
    useCart(cart, setCart, toast);
  const { purchase, cancelOrder } = useOrders(
    cart, cartTotal, setCart, setOrders, toast, () => setSuccessOpen(true),
  );
  const registration = useRegistrationForm(setUser, toast);
  const cancellation = useCancellationForm(cancelOrder);

  function navigate(next: View) {
    navigateTo(next, cart.length, () => setCartOpen(false));
  }

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-surface focus:p-3 focus:rounded-lg"
      >
        Saltar al contenido principal
      </a>
      <StoreHeader
        view={view}
        navigate={navigate}
        user={user}
        ordersCount={orders.length}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />
      <main
        id="main-content"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
      >
        {view === "shop" && <CatalogView addToCart={addToCart} />}
        {view === "checkout" && (
          <CheckoutView
            cart={cart}
            cartTotal={cartTotal}
            view={view}
            navigate={navigate}
            purchase={purchase}
          />
        )}
        {view === "orders" && (
          <OrdersView
            orders={orders}
            view={view}
            navigate={navigate}
            onCancelOrder={cancellation.openCancel}
          />
        )}
      </main>
      <StoreFooter />
      <CartDrawer
        open={cartOpen && !!user}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClose={() => setCartOpen(false)}
        onClearRequest={() => setClearOpen(true)}
        onCheckout={() => navigate("checkout")}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />
      <RegistrationDialog open={ready && !user} form={registration} />
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
