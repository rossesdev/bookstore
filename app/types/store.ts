export type CustomerInput = {
  firstname: string;
  lastname: string;
  email: string;
};

export type Customer = CustomerInput & {
  customer_id: number;
};

export type CartItem = {
  bookId: number;
  quantity: number;
};

export type OrderItem = CartItem & {
  title: string;
  price: number;
};

export type OrderStatus = "pending" | "paid" | "cancelled";

export type CreateOrderInput = {
  customer_id: number;
  items: CartItem[];
};

export type Order = {
  order_id: number;
  customer_id: number;
  total: number;
  items: OrderItem[];
  status: OrderStatus;
  order_version: number;
  created_at: string;
  updated_at: string;
};

export type View = "shop" | "checkout" | "orders";

export type Notice = {
  message: string;
  error: boolean;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
};
