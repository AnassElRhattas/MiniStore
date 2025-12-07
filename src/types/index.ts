export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ClientInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface Order {
  id: string;
  client: ClientInfo;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'preparing' | 'shipped' | 'done';
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'done';
