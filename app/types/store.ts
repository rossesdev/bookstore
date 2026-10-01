export type User = {
  firstname: string;
  lastname: string;
  email: string;
};

export type CartItem = {
  bookId: number;
  quantity: number;
};

export type OrderItem = CartItem & {
  title: string;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
};

export type View = "shop" | "checkout" | "orders";

export type Notice = {
  message: string;
  error: boolean;
};
