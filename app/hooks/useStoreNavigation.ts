import { useCallback, useEffect, useState } from "react";
import { href, selectedView } from "../lib/navigation";
import type { View } from "../types/store";

export function useStoreNavigation() {
  const [view, setView] = useState<View>("shop");
  const syncView = useCallback(() => setView(selectedView()), []);

  useEffect(() => {
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, [syncView]);

  function navigate(next: View, cartLength: number, closeCart: () => void) {
    if (next === "checkout" && !cartLength) return;
    window.history.pushState({}, "", href(next));
    setView(next);
    closeCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return { view, syncView, navigate };
}
