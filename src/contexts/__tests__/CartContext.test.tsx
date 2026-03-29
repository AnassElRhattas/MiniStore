import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { CartItem } from '@/types';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 10.99,
  image: 'test.jpg',
  description: 'Test description',
  stock: 5,
  category: 'test',
};

const mockCartItem = {
  product: mockProduct,
  quantity: 2,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('useCart hook', () => {
    it('should throw error when used outside CartProvider', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');
      
      consoleSpy.mockRestore();
    });

    it('should work correctly within CartProvider', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.items).toEqual([]);
      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({ product: mockProduct, quantity: 1 });
      expect(result.current.getTotalItems()).toBe(1);
      expect(result.current.getTotalPrice()).toBe(10.99);
    });

    it('should treat different color variants as different items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const red = { name: 'Rouge', hex: '#ff0000', imageUrl: 'red.jpg' };
      const blue = { name: 'Bleu', hex: '#0000ff', imageUrl: 'blue.jpg' };
      
      act(() => {
        result.current.addItem(mockProduct, 1, red);
        result.current.addItem(mockProduct, 2, blue);
      });
      
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items.find(i => i.variant?.name === 'Rouge')?.quantity).toBe(1);
      expect(result.current.items.find(i => i.variant?.name === 'Bleu')?.quantity).toBe(2);
      expect(result.current.getTotalItems()).toBe(3);
    });

    it('should increase quantity for existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
        result.current.addItem(mockProduct, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items.find(i => i.product.id === mockProduct.id)?.quantity).toBe(3);
      expect(result.current.getTotalItems()).toBe(3);
      expect(result.current.getTotalPrice()).toBe(32.97);
    });

    it('should not exceed stock limit', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 10);
      });

      expect(result.current.items.find(i => i.product.id === mockProduct.id)?.quantity).toBe(5); // Limited by stock
    });

    it('should handle out of stock products', () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(outOfStockProduct, 1);
      });

      expect(result.current.items).toHaveLength(0); // Out of stock products should not be added
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
        result.current.removeItem('1');
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });

    it('should handle removing non-existent item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.removeItem('999');
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should remove only the selected variant', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const red = { name: 'Rouge', hex: '#ff0000', imageUrl: 'red.jpg' };
      const blue = { name: 'Bleu', hex: '#0000ff', imageUrl: 'blue.jpg' };
      
      act(() => {
        result.current.addItem(mockProduct, 1, red);
        result.current.addItem(mockProduct, 1, blue);
        result.current.removeItem(mockProduct.id, 'Rouge');
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].variant?.name).toBe('Bleu');
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
        result.current.updateQuantity('1', 3);
      });

      expect(result.current.items.find(i => i.product.id === mockProduct.id)?.quantity).toBe(3);
      expect(result.current.getTotalItems()).toBe(3);
      expect(result.current.getTotalPrice()).toBe(32.97);
    });

    it('should update quantity for a specific variant', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const red = { name: 'Rouge', hex: '#ff0000', imageUrl: 'red.jpg' };
      const blue = { name: 'Bleu', hex: '#0000ff', imageUrl: 'blue.jpg' };
      
      act(() => {
        result.current.addItem(mockProduct, 1, red);
        result.current.addItem(mockProduct, 1, blue);
        result.current.updateQuantity(mockProduct.id, 4, 'Bleu');
      });
      
      expect(result.current.items.find(i => i.variant?.name === 'Rouge')?.quantity).toBe(1);
      expect(result.current.items.find(i => i.variant?.name === 'Bleu')?.quantity).toBe(4);
    });

    it('should remove item if quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
        result.current.updateQuantity('1', 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should not exceed stock limit', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
        result.current.updateQuantity('1', 10);
      });

      expect(result.current.items.find(i => i.product.id === mockProduct.id)?.quantity).toBe(5); // Limited by stock
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
        result.current.addItem({ ...mockProduct, id: '2' }, 2);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });
  });

  describe('localStorage integration', () => {
    it('should load cart from localStorage on mount', () => {
      const savedCart = [mockCartItem];
      localStorage.getItem.mockReturnValue(JSON.stringify(savedCart));

      const { result } = renderHook(() => useCart(), { wrapper });
      
      expect(result.current.items).toEqual(savedCart);
      expect(localStorage.getItem).toHaveBeenCalledWith('mini-store-cart');
    });

    it('should save cart to localStorage when items change', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addItem(mockProduct, 1);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mini-store-cart',
        JSON.stringify(result.current.items)
      );
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useCart(), { wrapper });
      
      expect(result.current.items).toEqual([]);
      expect(result.current.getTotalItems()).toBe(0);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple different products', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const product2 = { ...mockProduct, id: '2', price: 20.99 };
      const product3 = { ...mockProduct, id: '3', price: 5.99 };
      
      act(() => {
        result.current.addItem(mockProduct, 2);
        result.current.addItem(product2, 1);
        result.current.addItem(product3, 3);
      });

      expect(result.current.items).toHaveLength(3);
      expect(result.current.getTotalItems()).toBe(6);
      expect(result.current.getTotalPrice()).toBe(2 * 10.99 + 1 * 20.99 + 3 * 5.99);
    });

    it('should handle cart operations in sequence', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const product2 = { ...mockProduct, id: '2', price: 15.99 };
      
      act(() => {
        result.current.addItem(mockProduct, 2);
        result.current.addItem(product2, 1);
        result.current.updateQuantity('1', 1);
        result.current.removeItem('2');
        result.current.addItem(mockProduct, 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.getTotalPrice()).toBe(21.98);
    });
  });
});
