import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Cloud Function: Send order confirmation email (placeholder)
export const sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    
    // Placeholder for email sending logic
    // In a real implementation, you would integrate with an email service like SendGrid
    console.log(`New order created: ${context.params.orderId}`);
    console.log(`Customer: ${order.client.name} (${order.client.email})`);
    console.log(`Total: ${order.total} DH`);
    
    // You could also send notifications to admin here
    // For example, send a notification to admin about new order
    
    return null;
  });

// Cloud Function: Update product stock after order
export const updateProductStock = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Only proceed if status changed to "paid" from "pending"
    if (before.status === 'pending' && after.status === 'paid') {
      const batch = db.batch();
      
      // Update stock for each product in the order
      for (const item of after.items) {
        const productRef = db.collection('products').doc(item.id);
        const productDoc = await productRef.get();
        
        if (productDoc.exists) {
          const currentStock = productDoc.data()?.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          batch.update(productRef, { stock: newStock });
        }
      }
      
      await batch.commit();
      console.log(`Stock updated for order: ${context.params.orderId}`);
    }
    
    return null;
  });

// Cloud Function: Handle order cancellation
export const handleOrderCancellation = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Only proceed if status changed from "paid" to "cancelled"
    if (before.status === 'paid' && after.status === 'cancelled') {
      const batch = db.batch();
      
      // Restore stock for each product in the order
      for (const item of after.items) {
        const productRef = db.collection('products').doc(item.id);
        const productDoc = await productRef.get();
        
        if (productDoc.exists) {
          const currentStock = productDoc.data()?.stock || 0;
          const newStock = currentStock + item.quantity;
          
          batch.update(productRef, { stock: newStock });
        }
      }
      
      await batch.commit();
      console.log(`Stock restored for cancelled order: ${context.params.orderId}`);
    }
    
    return null;
  });

// Cloud Function: Clean up old orders (optional maintenance function)
export const cleanupOldOrders = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const oldOrders = await db
      .collection('orders')
      .where('createdAt', '<', thirtyDaysAgo)
      .where('status', '==', 'done')
      .limit(100)
      .get();
    
    const batch = db.batch();
    oldOrders.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleaned up ${oldOrders.docs.length} old orders`);
    
    return null;
  });

// Cloud Function: Get admin statistics
export const getAdminStats = functions.https
  .onCall(async (data, context) => {
    // Verify admin authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    // Check if user is admin
    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'User must be an admin');
    }
    
    try {
      // Get statistics
      const ordersSnapshot = await db.collection('orders').get();
      const productsSnapshot = await db.collection('products').get();
      
      const totalOrders = ordersSnapshot.size;
      const totalProducts = productsSnapshot.size;
      
      // Calculate order status counts
      const statusCounts = {
        pending: 0,
        paid: 0,
        preparing: 0,
        shipped: 0,
        done: 0
      };
      
      let totalRevenue = 0;
      
      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data();
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        if (order.status === 'paid' || order.status === 'done') {
          totalRevenue += order.total || 0;
        }
      });
      
      // Calculate stock information
      const lowStockProducts = productsSnapshot.docs.filter(doc => {
        const product = doc.data();
        return product.stock <= 5 && product.stock > 0;
      }).length;
      
      const outOfStockProducts = productsSnapshot.docs.filter(doc => {
        const product = doc.data();
        return product.stock === 0;
      }).length;
      
      return {
        totalOrders,
        totalProducts,
        totalRevenue,
        statusCounts,
        lowStockProducts,
        outOfStockProducts
      };
      
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw new functions.https.HttpsError('internal', 'Failed to get statistics');
    }
  });