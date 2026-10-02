import db from "..";
import { booksTable } from "../schema";

export async function getBooks() {
  const rows = await db.select().from(booksTable);

  return rows.map((row) => ({
    id: row.book_id,
    title: row.name,
    author: row.author,
    price: Number(row.price),
    description: row.description,
  }));
}
