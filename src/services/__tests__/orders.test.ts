import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, doc, runTransaction, serverTimestamp, getDocs, getDoc, updateDoc } from 'firebase/firestore';
vi.mock('../../firebase/config', () => ({
  auth: {} as any,
  db: {} as any,
  storage: {} as any,
}));
import { createOrder, getAllOrders, updateOrderStatus } from '../orders';
import { CartItem, Order, OrderStatus, Product, OrderItem, ClientInfo } from '../../types';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => ({})),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

const product1: Product = {
  id: '1',
  name: 'Test Product 1',
  price: 10.99 as unknown as number,
  description: 'Test description 1',
  imageUrl: 'test1.jpg',
  stock: 5,
  createdAt: new Date(),
};

const product2: Product = {
  id: '2',
  name: 'Test Product 2',
  price: 15.99 as unknown as number,
  description: 'Test description 2',
  imageUrl: 'test2.jpg',
  stock: 3,
  createdAt: new Date(),
};

const mockCartItems: CartItem[] = [
  { product: product1, quantity: 2 },
  { product: product2, quantity: 1 },
];

const mockClientInfo: ClientInfo = {
  name: 'John Doe',
  phone: '+1234567890',
  address: '123 Main St, City, Country',
};

const mockOrder: Order = {
  id: 'order-123',
  items: mockCartItems.map<OrderItem>((ci) => ({
    productId: ci.product.id,
    name: ci.product.name,
    price: ci.product.price,
    quantity: ci.quantity,
  })),
  total: ciTotal(mockCartItems),
  client: mockClientInfo,
  status: 'pending',
  createdAt: new Date(),
};

function ciTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

describe('Orders Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully with sufficient stock', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: vi.fn().mockReturnValue(true),
          data: vi.fn().mockReturnValue({ stock: 5 }),
        }),
        update: vi.fn(),
        set: vi.fn(),
      };

      const mockDocRef = { id: 'order-123' };
      (doc as any).mockReturnValue(mockDocRef);
      (runTransaction as any).mockImplementation(async (db, callback) => {
        return callback(mockTransaction);
      });

      (getDoc as any).mockResolvedValue({
        id: mockDocRef.id,
        data: () => ({ createdAt: { toDate: () => new Date() } }),
      });

      const result = await createOrder(mockCartItems, mockClientInfo);

      expect(runTransaction).toHaveBeenCalled();
      expect(mockTransaction.get).toHaveBeenCalledTimes(2);
      expect(mockTransaction.update).toHaveBeenCalledTimes(2);
      expect(result).toBe('order-123');
    });

    it('should throw error when product stock is insufficient', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: vi.fn().mockReturnValue(true),
          data: vi.fn().mockReturnValue({ stock: 1 }),
        }),
        update: vi.fn(),
      };

      (runTransaction as any).mockImplementation(async (db, callback) => {
        return callback(mockTransaction);
      });

      await expect(createOrder(mockCartItems, mockClientInfo)).rejects.toThrow(
        'Insufficient stock for product: Test Product 1'
      );

      expect(runTransaction).toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it('should throw error when product does not exist', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: vi.fn().mockReturnValue(false),
        }),
        update: vi.fn(),
      };

      (runTransaction as any).mockImplementation(async (db, callback) => {
        return callback(mockTransaction);
      });

      await expect(createOrder(mockCartItems, mockClientInfo)).rejects.toThrow(
        'Product not found: Test Product 1'
      );

      expect(runTransaction).toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it('should handle empty cart', async () => {
      await expect(createOrder([], mockClientInfo)).rejects.toThrow(
        'Cart is empty'
      );
    });

    it('should calculate total correctly', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: vi.fn().mockReturnValue(true),
          data: vi.fn().mockReturnValue({ stock: 10 }),
        }),
        update: vi.fn(),
        set: vi.fn(),
      };

      const mockDocRef = { id: 'order-123' };
      (doc as any).mockReturnValue(mockDocRef);
      (runTransaction as any).mockImplementation(async (db, callback) => {
        return callback(mockTransaction);
      });

      (getDoc as any).mockResolvedValue({
        id: mockDocRef.id,
        data: () => ({ createdAt: { toDate: () => new Date() } }),
      });

      await createOrder(mockCartItems, mockClientInfo);

      expect(runTransaction).toHaveBeenCalled();
      const expectedTotal = 2 * 10.99 + 1 * 15.99; // 37.97
      
      // Verify that the order data contains the correct total
      const setCall = mockTransaction.set.mock.calls[0];
      expect(setCall[1].total).toBeCloseTo(expectedTotal, 2);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders successfully', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'order-1',
            data: () => ({
              ...mockOrder,
              id: 'order-1',
              createdAt: { toDate: () => new Date('2023-01-01') },
              updatedAt: { toDate: () => new Date('2023-01-01') },
            }),
          },
          {
            id: 'order-2',
            data: () => ({
              ...mockOrder,
              id: 'order-2',
              status: 'paid' as OrderStatus,
              createdAt: { toDate: () => new Date('2023-01-02') },
              updatedAt: { toDate: () => new Date('2023-01-02') },
            }),
          },
        ],
      };

      (collection as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await getAllOrders();

      expect(collection).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('order-1');
      expect(result[0].status).toBe('pending');
      expect(result[1].id).toBe('order-2');
      expect(result[1].status).toBe('paid');
    });

    it('should return empty array when no orders exist', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      (collection as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await getAllOrders();

      expect(collection).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle Firestore errors', async () => {
      (collection as any).mockReturnValue({});
      (getDocs as any).mockRejectedValue(new Error('Firestore error'));

      await expect(getAllOrders()).rejects.toThrow('Firestore error');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockDocRef = { id: 'order-123' };
      (doc as any).mockReturnValue(mockDocRef);
      (updateDoc as any).mockResolvedValue(undefined);
      (getDoc as any).mockResolvedValue({
        id: mockDocRef.id,
        data: () => ({ createdAt: { toDate: () => new Date() } }),
      });

      await updateOrderStatus('order-123', 'paid');

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        status: 'paid',
        updatedAt: expect.any(Object), // serverTimestamp mock
      });
    });

    it('should throw error for invalid status transition', async () => {
      const invalidStatus = 'invalid-status' as OrderStatus;

      await expect(updateOrderStatus('order-123', invalidStatus)).rejects.toThrow(
        'Invalid order status: invalid-status'
      );

      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should handle Firestore update errors', async () => {
      const mockDocRef = { id: 'order-123' };
      (doc as any).mockReturnValue(mockDocRef);
      (updateDoc as any).mockRejectedValue(new Error('Update failed'));

      await expect(updateOrderStatus('order-123', 'paid')).rejects.toThrow('Update failed');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete order lifecycle', async () => {
      // Step 1: Create order
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: vi.fn().mockReturnValue(true),
          data: vi.fn().mockReturnValue({ stock: 10 }),
        }),
        update: vi.fn(),
        set: vi.fn(),
      };

      const mockDocRef = { id: 'order-123' };
      (doc as any).mockReturnValue(mockDocRef);
      (runTransaction as any).mockImplementation(async (db, callback) => {
        return callback(mockTransaction);
      });

      (getDoc as any).mockResolvedValue({
        id: mockDocRef.id,
        data: () => ({ createdAt: { toDate: () => new Date() } }),
      });

      const orderId = await createOrder(mockCartItems, mockClientInfo);
      expect(orderId).toBe('order-123');

      // Step 2: Get all orders
      const mockQuerySnapshot = {
        docs: [
          {
            id: orderId,
            data: () => ({
              ...mockOrder,
              id: orderId,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          },
        ],
      };

      (getDocs as any).mockResolvedValue(mockQuerySnapshot);
      const orders = await getAllOrders();
      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe(orderId);

      // Step 3: Update order status
      (updateDoc as any).mockResolvedValue(undefined);
      await updateOrderStatus(orderId, 'paid');
      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ status: 'paid' })
      );
    });

    it('should handle concurrent stock updates', async () => {
      let stockCount = 5;
      
      const mockTransaction = {
        get: vi.fn().mockImplementation(() => {
          const currentStock = stockCount;
          return Promise.resolve({
            exists: vi.fn().mockReturnValue(true),
            data: vi.fn().mockReturnValue({ stock: currentStock }),
          });
        }),
        update: vi.fn().mockImplementation((ref, data) => {
          stockCount = data.stock;
        }),
        set: vi.fn(),
      };

      (runTransaction as any).mockImplementation(async (db, callback) => {
        return callback(mockTransaction);
      });

      (getDoc as any).mockResolvedValue({
        id: 'order-123',
        data: () => ({ createdAt: { toDate: () => new Date() } }),
      });

      // First order should succeed
      const cartItems1: CartItem[] = [{ product: product1, quantity: 3 }];
      await createOrder(cartItems1, mockClientInfo);
      expect(stockCount).toBe(2); // 5 - 3 = 2

      // Second order with quantity > remaining stock should fail
      const cartItems2: CartItem[] = [{ product: product1, quantity: 3 }];
      await expect(createOrder(cartItems2, mockClientInfo)).rejects.toThrow(
        'Insufficient stock for product: Test Product 1'
      );
      expect(stockCount).toBe(2); // Stock unchanged

      // Third order with quantity <= remaining stock should succeed
      const cartItems3: CartItem[] = [{ product: product1, quantity: 2 }];
      await createOrder(cartItems3, mockClientInfo);
      expect(stockCount).toBe(0); // 2 - 2 = 0
    });
  });
});
