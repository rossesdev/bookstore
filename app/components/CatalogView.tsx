import { books, type Book } from "../books";
import BookCard from "./BookCard";
import Icon from "./Icon";

export default function CatalogView({
  addToCart,
}: {
  addToCart: (book: Book) => void;
}) {
  return (
    <section className="space-y-8" aria-labelledby="catalog-title">
      <div className="relative overflow-hidden rounded-lg bg-surface-lowest text-content p-8 sm:p-12  border border-outline">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised text-muted border border-outline text-xs font-semibold uppercase tracking-wider">
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            Curaduría Literaria 2025
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-content leading-tight text-balance">
            Descubre lecturas que transforman tu universo.
          </h1>
          <p className="text-muted text-base sm:text-lg leading-relaxed">
            Explora nuestra colección selecta de 10 obras imprescindibles.
            Portadas exclusivas, narrativas inolvidables y entrega
            inmediata para tu biblioteca.
          </p>
        </div>
        <div className="absolute right-10 top-10 opacity-10 pointer-events-none">
          <Icon name="book" className="w-64 h-64" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline pb-4">
        <div>
          <h2
            id="catalog-title"
            className="font-display text-2xl font-bold text-content"
          >
            Catálogo Destacado
          </h2>
          <p className="text-muted text-sm">
            Mostrando 10 títulos disponibles para envío y lectura
          </p>
        </div>
        <span className="self-start text-xs font-semibold text-muted uppercase tracking-wider bg-surface-raised px-3 py-1.5 rounded-lg border border-outline">
          Stock Garantizado · Offline First
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-7">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onAddToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}
