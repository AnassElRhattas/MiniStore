import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, orderBy, serverTimestamp, runTransaction } from 'firebase/firestore';
import { Order, OrderStatus, CartItem, ClientInfo } from '../types';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

export const ordersService = {
  async createOrder(clientInfo: ClientInfo, cartItems: CartItem[]): Promise<Order> {
    try {
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      const orderData = {
        client: clientInfo,
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      // Use transaction to check stock and create order
      const orderRef = await runTransaction(db, async (transaction) => {
        const stockById = new Map<string, number>();
        // Check stock for all products
        for (const item of cartItems) {
          const productRef = doc(db, PRODUCTS_COLLECTION, item.product.id);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            throw new Error(`Product not found: ${item.product.name}`);
          }
          
          const currentStock = productDoc.data().stock;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${item.product.name}`);
          }
          stockById.set(item.product.id, currentStock);
        }

        // Create the order
        const newOrderRef = doc(collection(db, ORDERS_COLLECTION));
        transaction.set(newOrderRef, orderData);

        // Update stock for all products based on current value
        for (const item of cartItems) {
          const productRef = doc(db, PRODUCTS_COLLECTION, item.product.id);
          const currentStock = stockById.get(item.product.id) ?? 0;
          transaction.update(productRef, {
            stock: currentStock - item.quantity,
          });
        }

        return newOrderRef;
      });

      const orderDoc = await getDoc(orderRef);
      return {
        id: orderDoc.id,
        ...orderDoc.data(),
        createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
      } as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Order));
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const allowed: OrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'done'];
      if (!allowed.includes(status)) {
        throw new Error(`Invalid order status: ${status}`);
      }
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
      
      const updatedDoc = await getDoc(orderRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate() || new Date(),
      } as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (orderDoc.exists()) {
        return {
          id: orderDoc.id,
          ...orderDoc.data(),
          createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
        } as Order;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },
};

export async function createOrder(cartItems: CartItem[], clientInfo: ClientInfo): Promise<string> {
  const order = await ordersService.createOrder(clientInfo, cartItems);
  return order.id;
}

export async function getAllOrders() {
  return ordersService.getAllOrders();
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return ordersService.updateOrderStatus(orderId, status);
}
