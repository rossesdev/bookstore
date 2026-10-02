import type { Book } from "../types/store";

export type BookById = ReadonlyMap<number, Book>;

export const createBookById = (books: Book[]): BookById =>
  new Map(books.map((book) => [book.id, book]));

export const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});
