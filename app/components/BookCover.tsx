import type { Book } from "../books";

export default function BookCover({ book, mini = false }: { book: Book; mini?: boolean }) {
  if (mini)
    return (
      <div
        className="w-12 h-16 shrink-0 rounded-md p-1.5 flex flex-col justify-between border border-outline bg-surface-lowest text-content  overflow-hidden"
        aria-hidden="true"
      >
        <span className="text-[8px] font-bold tracking-widest opacity-70">
          AB
        </span>
        <span className="text-[9px] font-display font-bold leading-tight line-clamp-2">
          {book.title}
        </span>
        <span className="w-4 h-0.5 rounded-full bg-outline" />
      </div>
    );
  return (
    <div className="book-cover" aria-hidden="true">
      <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase opacity-80">
        <span>Aura Editorial</span>
        <span className="w-2 h-2 rounded-full bg-outline" />
      </div>
      <div className="text-center px-1">
        <span className="block w-8 h-0.5 mx-auto mb-3 bg-outline" />
        <span className="block font-display font-bold text-lg sm:text-xl leading-snug text-balance">
          {book.title}
        </span>
        <span className="block text-xs text-muted font-medium mt-2 italic">
          {book.author}
        </span>
      </div>
      <div className="flex justify-between border-t border-outline pt-2 text-[10px] text-muted">
        <span>VOL. {String(book.id).padStart(2, "0")}</span>
        <span className="uppercase tracking-wider font-semibold text-muted">
          Original
        </span>
      </div>
    </div>
  );
}
