import { money, type Book } from "../books";
import BookCover from "./BookCover";
import Icon from "./Icon";

export default function BookCard({
  book,
  onAddToCart,
}: {
  book: Book;
  onAddToCart: (book: Book) => void;
}) {
  return (
    <article className="bg-surface rounded-lg p-4 sm:p-5 flex flex-col justify-between border border-outline book-card group">
      <div className="space-y-4">
        <BookCover book={book} />
        <div>
          <h3
            className="font-display font-bold text-content text-base leading-snug line-clamp-1 group-hover:text-primary"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="text-xs text-muted font-medium mt-0.5">
            {book.author}
          </p>
          <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>
      </div>
      <div className="pt-4 mt-4 border-t border-outline flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted block">
            Precio
          </span>
          <span className="text-base font-extrabold text-content tabular-nums">
            {money.format(book.price)}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(book)}
          className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs flex items-center gap-1.5 "
          aria-label={`Agregar ${book.title} al carrito`}
        >
          <Icon name="plus" className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>
    </article>
  );
}
