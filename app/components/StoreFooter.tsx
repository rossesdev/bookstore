import Icon from "./Icon";

export default function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-outline bg-surface py-8 text-center text-xs text-muted">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon name="book" className="w-4 h-4 text-primary" />
          <span
            className="font-display font-semibold text-content"
            translate="no"
          >
            AuraBooks SPA
          </span>
          <span>· Librería Offline &amp; Persistente</span>
        </div>
        <p>
          © 2025 Aura Books Inc. Todos los derechos reservados. Datos locales
          protegidos.
        </p>
      </div>
    </footer>
  );
}
