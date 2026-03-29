export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  colorVariants?: ProductColorVariant[];
  category?: string;
  stock: number;
  createdAt: Date;
}

export interface ProductColorVariant {
  name: string;
  hex?: string;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductColorVariant;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantName?: string | null;
  variantHex?: string | null;
  variantImageUrl?: string | null;
}

export interface ClientInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  email?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  usageLimit?: number;
  isActive: boolean;
  expiryDate?: Date;
  usageCount: number;
}

export interface Order {
  id: string;
  client: ClientInfo;
  items: OrderItem[];
  total: number;
  discount?: number;
  shippingFee?: number;
  promoCode?: string;
  status: 'pending' | 'paid' | 'preparing' | 'shipped' | 'done';
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'done';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
