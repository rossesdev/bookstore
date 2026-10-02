import { getBooks } from "../db/queries/books";
import HomeClient from "./components/HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const books = await getBooks();
  return <HomeClient books={books} />;
}
