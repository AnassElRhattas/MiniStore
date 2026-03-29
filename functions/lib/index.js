"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = exports.cleanupOldOrders = exports.handleOrderCancellation = exports.updateProductStock = exports.createOrder = exports.enqueueWhatsAppMessage = exports.sendOrderConfirmation = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
function normalizeMoroccoPhone(raw) {
    if (typeof raw !== 'string')
        return null;
    const digits = raw.replace(/[^0-9]/g, '');
    if (!digits)
        return null;
    if (digits.startsWith('0')) {
        return `212${digits.slice(1)}`;
    }
    return digits;
}
// Cloud Function: Send order confirmation email (placeholder)
exports.sendOrderConfirmation = functions.firestore
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
exports.enqueueWhatsAppMessage = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
    var _a, _b, _c, _d, _e;
    const order = snap.data();
    const phone = normalizeMoroccoPhone((_a = order === null || order === void 0 ? void 0 : order.client) === null || _a === void 0 ? void 0 : _a.phone);
    if (!phone) {
        console.log(`Order ${context.params.orderId} has no valid phone; skipping queue`);
        return null;
    }
    const total = typeof (order === null || order === void 0 ? void 0 : order.total) === 'number' ? order.total : 0;
    const clientName = typeof ((_b = order === null || order === void 0 ? void 0 : order.client) === null || _b === void 0 ? void 0 : _b.name) === 'string' ? order.client.name : '';
    const clientAddress = typeof ((_c = order === null || order === void 0 ? void 0 : order.client) === null || _c === void 0 ? void 0 : _c.address) === 'string' ? order.client.address : '';
    const frontendUrl = ((_e = (_d = functions.config()) === null || _d === void 0 ? void 0 : _d.app) === null || _e === void 0 ? void 0 : _e.frontend_url) ||
        'http://localhost:5173';
    const message = `📦 *COMMANDE REÇUE #${context.params.orderId}*\n\n` +
        `Bonjour *${clientName}*,\n` +
        `Merci pour votre achat ! Votre commande de *${Number(total).toFixed(2)} DH* est en cours de traitement.\n\n` +
        `📍 *Livraison à:* ${clientAddress}\n` +
        `🔎 *Suivre ma commande:* ${frontendUrl}/track-order\n` +
        `🧾 *ID commande:* ${context.params.orderId}\n\n` +
        `À bientôt !`;
    const queueDoc = {
        provider: 'whatsapp',
        orderId: context.params.orderId,
        phone,
        message,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('messageQueue').add(queueDoc);
    console.log(`Enqueued WhatsApp message for order: ${context.params.orderId}`);
    return null;
});
exports.createOrder = functions.https.onCall(async (data) => {
    const client = data === null || data === void 0 ? void 0 : data.client;
    const items = data === null || data === void 0 ? void 0 : data.items;
    const promoCode = typeof (data === null || data === void 0 ? void 0 : data.promoCode) === 'string' ? data.promoCode : null;
    if (!client || typeof client !== 'object') {
        throw new functions.https.HttpsError('invalid-argument', 'Client is required');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Items are required');
    }
    const clientName = typeof (client === null || client === void 0 ? void 0 : client.name) === 'string' ? client.name.trim() : '';
    const clientPhone = typeof (client === null || client === void 0 ? void 0 : client.phone) === 'string' ? client.phone.trim() : '';
    const clientAddress = typeof (client === null || client === void 0 ? void 0 : client.address) === 'string' ? client.address.trim() : '';
    const clientEmail = typeof (client === null || client === void 0 ? void 0 : client.email) === 'string' ? client.email.trim() : undefined;
    if (!clientName || !clientPhone || !clientAddress) {
        throw new functions.https.HttpsError('invalid-argument', 'Client name/phone/address are required');
    }
    const normalizedItems = items.map((it) => ({
        productId: typeof (it === null || it === void 0 ? void 0 : it.productId) === 'string' ? it.productId : typeof (it === null || it === void 0 ? void 0 : it.id) === 'string' ? it.id : '',
        quantity: typeof (it === null || it === void 0 ? void 0 : it.quantity) === 'number' ? it.quantity : Number((it === null || it === void 0 ? void 0 : it.quantity) || 0),
    }));
    if (normalizedItems.some((it) => !it.productId || !Number.isFinite(it.quantity) || it.quantity <= 0)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid items');
    }
    const orderRef = db.collection('orders').doc();
    const promoQuery = promoCode
        ? db.collection('promo_codes').where('code', '==', promoCode.toUpperCase()).where('isActive', '==', true).limit(1)
        : null;
    await db.runTransaction(async (tx) => {
        var _a, _b;
        const stockById = new Map();
        const productById = new Map();
        for (const item of normalizedItems) {
            const productRef = db.collection('products').doc(item.productId);
            const productSnap = await tx.get(productRef);
            if (!productSnap.exists) {
                throw new functions.https.HttpsError('not-found', `Product not found: ${item.productId}`);
            }
            const product = productSnap.data();
            const stock = typeof (product === null || product === void 0 ? void 0 : product.stock) === 'number' ? product.stock : 0;
            if (stock < item.quantity) {
                throw new functions.https.HttpsError('failed-precondition', `Insufficient stock for product: ${item.productId}`);
            }
            stockById.set(item.productId, stock);
            productById.set(item.productId, product);
        }
        let promoDocRef = null;
        let promoData = null;
        if (promoQuery) {
            const promoSnap = await tx.get(promoQuery);
            if (!promoSnap.empty) {
                const docSnap = promoSnap.docs[0];
                promoDocRef = docSnap.ref;
                promoData = docSnap.data();
                const expiryDate = ((_a = promoData === null || promoData === void 0 ? void 0 : promoData.expiryDate) === null || _a === void 0 ? void 0 : _a.toDate) ? promoData.expiryDate.toDate() : null;
                if (expiryDate && expiryDate < new Date()) {
                    promoDocRef = null;
                    promoData = null;
                }
                const usageLimit = typeof (promoData === null || promoData === void 0 ? void 0 : promoData.usageLimit) === 'number' ? promoData.usageLimit : null;
                const usageCount = typeof (promoData === null || promoData === void 0 ? void 0 : promoData.usageCount) === 'number' ? promoData.usageCount : 0;
                if (usageLimit !== null && usageCount >= usageLimit) {
                    promoDocRef = null;
                    promoData = null;
                }
            }
        }
        let subtotal = 0;
        const orderItems = normalizedItems.map((item) => {
            const product = productById.get(item.productId);
            const price = typeof (product === null || product === void 0 ? void 0 : product.price) === 'number' ? product.price : 0;
            subtotal += price * item.quantity;
            return {
                productId: item.productId,
                name: typeof (product === null || product === void 0 ? void 0 : product.name) === 'string' ? product.name : '',
                price,
                quantity: item.quantity,
            };
        });
        let discount = 0;
        if (promoDocRef && promoData) {
            const minOrderAmount = typeof (promoData === null || promoData === void 0 ? void 0 : promoData.minOrderAmount) === 'number' ? promoData.minOrderAmount : null;
            if (minOrderAmount !== null && subtotal < minOrderAmount) {
                promoDocRef = null;
                promoData = null;
            }
        }
        if (promoDocRef && promoData) {
            if (promoData.discountType === 'percentage') {
                const discountValue = typeof promoData.discountValue === 'number' ? promoData.discountValue : 0;
                discount = (subtotal * discountValue) / 100;
            }
            else {
                const discountValue = typeof promoData.discountValue === 'number' ? promoData.discountValue : 0;
                discount = Math.min(discountValue, subtotal);
            }
        }
        const total = Math.max(0, subtotal - discount);
        tx.set(orderRef, {
            client: Object.assign({ name: clientName, phone: clientPhone, address: clientAddress }, (clientEmail ? { email: clientEmail } : {})),
            items: orderItems,
            total,
            discount,
            promoCode: promoDocRef && promoData ? promoData.code : null,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        for (const item of normalizedItems) {
            const productRef = db.collection('products').doc(item.productId);
            const currentStock = (_b = stockById.get(item.productId)) !== null && _b !== void 0 ? _b : 0;
            tx.update(productRef, { stock: currentStock - item.quantity });
        }
        if (promoDocRef) {
            tx.update(promoDocRef, { usageCount: admin.firestore.FieldValue.increment(1) });
        }
    });
    const created = await orderRef.get();
    return Object.assign({ id: orderRef.id }, created.data());
});
// Cloud Function: Update product stock after order
exports.updateProductStock = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
    var _a;
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
                const currentStock = ((_a = productDoc.data()) === null || _a === void 0 ? void 0 : _a.stock) || 0;
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
exports.handleOrderCancellation = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
    var _a;
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
                const currentStock = ((_a = productDoc.data()) === null || _a === void 0 ? void 0 : _a.stock) || 0;
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
exports.cleanupOldOrders = functions.pubsub
    .schedule('0 2 * * *') // Run daily at 2 AM
    .timeZone('UTC')
    .onRun(async (context) => {
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const oldOrders = await db
        .collection('orders')
        .where('createdAt', '<', thirtyDaysAgo)
        .where('status', '==', 'done')
        .limit(100)
        .get();
    const batch = db.batch();
    oldOrders.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log(`Cleaned up ${oldOrders.docs.length} old orders`);
    return null;
});
// Cloud Function: Get admin statistics
exports.getAdminStats = functions.https
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
        ordersSnapshot.docs.forEach((docSnap) => {
            const order = docSnap.data();
            const key = order.status;
            statusCounts[key] = (statusCounts[key] || 0) + 1;
            if (order.status === 'paid' || order.status === 'done') {
                totalRevenue += order.total || 0;
            }
        });
        // Calculate stock information
        const lowStockProducts = productsSnapshot.docs.filter((docSnap) => {
            const product = docSnap.data();
            return product.stock <= 5 && product.stock > 0;
        }).length;
        const outOfStockProducts = productsSnapshot.docs.filter((docSnap) => {
            const product = docSnap.data();
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
    }
    catch (error) {
        console.error('Error getting admin stats:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get statistics');
    }
});
//# sourceMappingURL=index.js.map