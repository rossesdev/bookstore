import type { View } from "../types/store";

export function selectedView(): View {
  const view = new URLSearchParams(window.location.search).get("view");
  return view === "orders" || view === "checkout" ? view : "shop";
}

export function href(view: View) {
  return view === "shop" ? "/" : `/?view=${view}`;
}
