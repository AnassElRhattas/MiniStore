import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, ProductColorVariant, PromoCode } from '../types';

interface CartContextType {
  items: CartItem[];
  promoCode: PromoCode | null;
  addItem: (product: Product, quantity: number, variant?: ProductColorVariant) => void;
  removeItem: (productId: string, variantName?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantName?: string) => void;
  clearCart: () => void;
  setPromoCode: (promo: PromoCode | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountAmount: () => number;
  getFinalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mini-store-cart';
const PROMO_STORAGE_KEY = 'mini-store-promo';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
    if (savedPromo) {
      try {
        const parsedPromo = JSON.parse(savedPromo);
        setPromoCode(parsedPromo);
      } catch (error) {
        console.error('Error loading promo from localStorage:', error);
      }
    }
  }, []);

  // Save cart and promo to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promoCode) {
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promoCode));
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  }, [promoCode]);

  const addItem = (product: Product, quantity: number, variant?: ProductColorVariant) => {
    // Don't add if product is out of stock
    if (product.stock <= 0) {
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id && item.variant?.name === variant?.name);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Limit quantity to available stock
        const limitedQuantity = Math.min(newQuantity, product.stock);
        
        return prevItems.map(item =>
          item.product.id === product.id && item.variant?.name === variant?.name
            ? { ...item, quantity: limitedQuantity }
            : item
        );
      } else {
        // Limit initial quantity to available stock
        const limitedQuantity = Math.min(quantity, product.stock);
        return [...prevItems, { product, quantity: limitedQuantity, variant }];
      }
    });
  };

  const removeItem = (productId: string, variantName?: string) => {
    setItems(prevItems => prevItems.filter(item => !(item.product.id === productId && item.variant?.name === variantName)));
  };

  const updateQuantity = (productId: string, quantity: number, variantName?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantName);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id === productId && item.variant?.name === variantName) {
          // Limit quantity to available stock
          const limitedQuantity = Math.min(quantity, item.product.stock);
          return { ...item, quantity: limitedQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode(null);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    if (!promoCode) return 0;
    const total = getTotalPrice();
    if (promoCode.discountType === 'percentage') {
      return (total * promoCode.discountValue) / 100;
    } else {
      return Math.min(promoCode.discountValue, total);
    }
  };

  const getFinalPrice = () => {
    return Math.max(0, getTotalPrice() - getDiscountAmount());
  };

  const value: CartContextType = {
    items,
    promoCode,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setPromoCode,
    getTotalItems,
    getTotalPrice,
    getDiscountAmount,
    getFinalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
