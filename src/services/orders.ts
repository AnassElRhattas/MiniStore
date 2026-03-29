import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, orderBy, serverTimestamp, runTransaction, onSnapshot, increment } from 'firebase/firestore';
import { Order, OrderStatus, CartItem, ClientInfo, PromoCode } from '../types';
import { getShippingFee } from '../utils/shipping';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const PROMO_COLLECTION = 'promo_codes';

export const ordersService = {
  async createOrder(clientInfo: ClientInfo, cartItems: CartItem[], promoCode: PromoCode | null = null): Promise<Order> {
    try {
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Le panier est vide.');
      }
      
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      let discount = 0;

      if (promoCode) {
        if (promoCode.discountType === 'percentage') {
          discount = (subtotal * promoCode.discountValue) / 100;
        } else {
          discount = Math.min(promoCode.discountValue, subtotal);
        }
      }

      const shippingFee = getShippingFee(clientInfo.city);
      const total = subtotal - discount + shippingFee;
      
      const orderData = {
        client: clientInfo,
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          variantName: item.variant?.name || null,
          variantHex: item.variant?.hex || null,
          variantImageUrl: item.variant?.imageUrl || null,
        })),
        total,
        discount,
        shippingFee,
        promoCode: promoCode?.code || null,
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
            throw new Error(`Produit introuvable : ${item.product.name}`);
          }
          
          const currentStock = productDoc.data().stock;
          if (currentStock < item.quantity) {
            throw new Error(`Stock insuffisant pour : ${item.product.name}`);
          }
          stockById.set(item.product.id, currentStock);
        }

        // Increment promo usage if applicable
        if (promoCode) {
          const promoRef = doc(db, PROMO_COLLECTION, promoCode.id);
          transaction.update(promoRef, {
            usageCount: increment(1)
          });
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
      console.error('Error getting order by id:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const allowed: OrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'done'];
      if (!allowed.includes(status)) {
        throw new Error(`Statut de commande invalide : ${status}`);
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

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Order));
      
      callback(orders);
    }, (error) => {
      console.error('Error subscribing to orders:', error);
    });
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
