import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { db, auth } from '../firebase/config';

// Helper to generate IDs
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KA-${dateStr}-${rand}`;
}

function generateBillNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-${dateStr}-${rand}`;
}

function generateBulkRequestNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BLK-${dateStr}-${rand}`;
}

class FirebaseBakeryService {
  // --- AUTHENTICATION ---
  async login(email, password) {
    const cleanEmail = email.trim();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;
      const uid = fbUser.uid;

      // Base profile
      let profile = {
        id: uid,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        phone: '',
        role: 'CUSTOMER',
        village: 'Sangola',
      };

      // Fetch Firestore document with actual role assigned in DB
      try {
        const userDocPromise = getDoc(doc(db, 'users', uid));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
        const userDoc = await Promise.race([userDocPromise, timeoutPromise]);
        if (userDoc.exists()) {
          profile = { id: uid, ...userDoc.data() };
        } else {
          setDoc(doc(db, 'users', uid), profile).catch(() => {});
        }
      } catch {
        // Fallback to local profile
      }

      return profile;
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        throw new Error('Invalid email address or password.');
      } else if (err.code === 'auth/too-many-requests') {
        throw new Error('Too many login attempts. Please wait a moment.');
      }
      throw err;
    }
  }

  async register(userData) {
    const email = userData.email.trim();
    const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
    const uid = userCredential.user.uid;

    // All public signups are assigned CUSTOMER role by default
    const profile = {
      id: uid,
      name: userData.name,
      phone: userData.phone || '',
      email: email,
      role: 'CUSTOMER',
      address: userData.address || '',
      village: userData.village || 'Sangola',
      taluka: userData.taluka || 'Sangola',
      district: userData.district || 'Solapur',
      state: userData.state || 'Maharashtra',
      created_at: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), profile);
    return profile;
  }

  async logout() {
    await signOut(auth);
  }

  subscribeToUserProfile(uid, callback) {
    if (!uid) return () => {};
    const userDocRef = doc(db, 'users', uid);
    return onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: uid, ...docSnap.data() });
      }
    }, (err) => {
      console.warn('Profile subscription warning:', err);
    });
  }

  async getUserProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { id: uid, ...userDoc.data() } : null;
  }

  async updateUserProfile(uid, data) {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { ...data, id: uid, updated_at: new Date().toISOString() }, { merge: true });
    return this.getUserProfile(uid);
  }

  // --- ADMIN TEAM & USER ROLES (Admin only) ---
  subscribeToAdmins(callback) {
    const q = query(collection(db, 'users'), where('role', '==', 'ADMIN'));
    return onSnapshot(q, (snapshot) => {
      const admins = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(admins);
    });
  }

  async getAdmins() {
    const q = query(collection(db, 'users'), where('role', '==', 'ADMIN'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getAllUsers() {
    const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async createAdminAccount(adminData) {
    const email = adminData.email.trim();
    const password = adminData.password;

    // Use secondary Firebase App instance to prevent logging out the current admin
    const { initializeApp: initSecondaryApp } = await import('firebase/app');
    const { getAuth: getSecondaryAuth } = await import('firebase/auth');

    const tempApp = initSecondaryApp(firebaseConfig, `TempAdmin-${Date.now()}`);
    const tempAuth = getSecondaryAuth(tempApp);

    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    const uid = userCredential.user.uid;
    await signOut(tempAuth);

    const profile = {
      id: uid,
      name: adminData.name,
      email: email,
      phone: adminData.phone || '',
      role: 'ADMIN',
      address: adminData.address || 'Bakery Outlet, Sangola',
      village: 'Sangola',
      taluka: 'Sangola',
      district: 'Solapur',
      state: 'Maharashtra',
      created_at: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), profile);
    return profile;
  }

  async promoteToAdmin(userId) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: 'ADMIN', updated_at: new Date().toISOString() });
  }

  async demoteAdmin(userId) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: 'CUSTOMER', updated_at: new Date().toISOString() });
  }

  // --- PRODUCTS (Real-time & Operations) ---
  subscribeToProducts(callback) {
    const q = query(collection(db, 'products'), orderBy('category'));
    return onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(prods);
    });
  }

  async createProduct(productData) {
    const prodRef = doc(collection(db, 'products'));
    const data = {
      ...productData,
      id: prodRef.id,
      quantity: Number(productData.quantity) || 0,
      price: Number(productData.price) || 0,
      low_stock_threshold: Number(productData.low_stock_threshold) || 10,
      is_available: Number(productData.quantity) > 0,
      created_at: new Date().toISOString(),
    };
    await setDoc(prodRef, data);

    // Initial stock transaction
    if (data.quantity > 0) {
      await addDoc(collection(db, 'inventoryTransactions'), {
        product_id: prodRef.id,
        type: 'OPENING_STOCK',
        quantity: data.quantity,
        reference_type: 'INITIAL_PRODUCT',
        reference_id: `PROD-${prodRef.id}`,
        created_at: new Date().toISOString(),
      });
    }
    return data;
  }

  async updateProduct(productId, updates) {
    const prodRef = doc(db, 'products', productId);
    await updateDoc(prodRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }

  async adjustProductStock(productId, delta, reason = 'Stock adjustment') {
    return await runTransaction(db, async (transaction) => {
      const prodRef = doc(db, 'products', productId);
      const prodDoc = await transaction.get(prodRef);

      if (!prodDoc.exists()) {
        throw new Error('Product not found.');
      }

      const prodData = prodDoc.data();
      const newQty = prodData.quantity + delta;

      if (newQty < 0) {
        throw new Error(`Insufficient stock for '${prodData.name}'. Current: ${prodData.quantity}`);
      }

      transaction.update(prodRef, {
        quantity: newQty,
        is_available: newQty > 0,
        updated_at: new Date().toISOString(),
      });

      const txRef = doc(collection(db, 'inventoryTransactions'));
      transaction.set(txRef, {
        id: txRef.id,
        product_id: productId,
        type: delta > 0 ? 'STOCK_ADDED' : 'MANUAL_ADJUSTMENT',
        quantity: delta,
        reference_type: 'ADMIN_RESTOCK',
        reference_id: reason,
        created_at: new Date().toISOString(),
      });
    });
  }

  async deleteProduct(productId) {
    await deleteDoc(doc(db, 'products', productId));
  }

  // --- ORDERS (Atomic Transaction & Real-time onSnapshot) ---
  subscribeToOrders(userId, isAdmin, callback) {
    let q;
    if (isAdmin) {
      q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    } else {
      q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('created_at', 'desc')
      );
    }
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(orders);
    });
  }

  subscribeToOrder(orderId, callback) {
    return onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    });
  }

  async placeOrder(orderPayload, user) {
    if (!user || !user.id) {
      throw new Error("You must be logged in to place a bakery order. Please sign in or create an account.");
    }
    return await runTransaction(db, async (transaction) => {
      const productDocs = await Promise.all(
        orderPayload.items.map((item) =>
          transaction.get(doc(db, 'products', String(item.product_id)))
        )
      );

      let subtotal = 0;
      const orderItems = [];
      const productUpdates = [];

      for (let i = 0; i < orderPayload.items.length; i++) {
        const item = orderPayload.items[i];
        const pDoc = productDocs[i];

        if (!pDoc.exists()) {
          throw new Error(`Product ${item.product_id} not found.`);
        }

        const pData = pDoc.data();
        if (!pData.is_available || pData.quantity <= 0) {
          throw new Error(`Product '${pData.name}' is currently SOLD OUT.`);
        }

        if (pData.quantity < item.quantity) {
          throw new Error(
            `Only ${pData.quantity} unit(s) of '${pData.name}' available. You requested ${item.quantity}.`
          );
        }

        const itemSub = Math.round(pData.price * item.quantity * 100) / 100;
        subtotal += itemSub;

        orderItems.push({
          id: `item_${i + 1}`,
          product_id: pDoc.id,
          product_name_snapshot: pData.name,
          price_snapshot: pData.price,
          quantity: item.quantity,
          subtotal: itemSub,
        });

        const newStock = pData.quantity - item.quantity;
        productUpdates.push({
          ref: pDoc.ref,
          data: {
            quantity: newStock,
            is_available: newStock > 0,
          },
          name: pData.name,
          delta: -item.quantity,
        });
      }

      const orderNumber = generateOrderNumber();
      const orderRef = doc(collection(db, 'orders'));
      const roundedTotal = Math.round(subtotal * 100) / 100;

      const orderData = {
        id: orderRef.id,
        order_number: orderNumber,
        userId: user.id,
        user_id: user.id,
        order_date: orderPayload.order_date,
        status: 'PENDING',
        subtotal: roundedTotal,
        discount: 0.0,
        total_amount: roundedTotal,
        notes: orderPayload.notes || '',
        items: orderItems,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          village: user.village || 'Sangola',
        },
        created_at: new Date().toISOString(),
      };

      // Atomic Writes
      transaction.set(orderRef, orderData);

      for (const u of productUpdates) {
        transaction.update(u.ref, u.data);

        const txRef = doc(collection(db, 'inventoryTransactions'));
        transaction.set(txRef, {
          id: txRef.id,
          product_id: u.ref.id,
          type: 'ORDER_RESERVED',
          quantity: u.delta,
          reference_type: 'ORDER',
          reference_id: orderNumber,
          created_at: new Date().toISOString(),
        });
      }

      // Notification
      const notifRef = doc(collection(db, 'notifications'));
      transaction.set(notifRef, {
        id: notifRef.id,
        userId: user.id,
        user_id: user.id,
        title: 'Order Placed Successfully',
        message: `Your order #${orderNumber} for ₹${roundedTotal.toFixed(2)} is confirmed.`,
        type: 'ORDER_STATUS',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      return orderData;
    });
  }

  async modifyOrderItems(orderId, itemsPayload, user) {
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists()) throw new Error('Order not found.');
      const order = orderDoc.data();

      if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
        throw new Error(`Order cannot be modified in '${order.status}' status.`);
      }

      const itemsMap = new Map(order.items.map((i) => [i.id, i]));
      const diffs = [];
      const pDocs = [];

      for (const mod of itemsPayload) {
        const item = itemsMap.get(mod.item_id);
        if (!item) continue;

        const pRef = doc(db, 'products', String(item.product_id));
        const pDoc = await transaction.get(pRef);
        pDocs.push(pDoc);

        diffs.push({
          item,
          oldQty: item.quantity,
          newQty: mod.new_quantity,
          diff: mod.new_quantity - item.quantity,
          pDoc,
        });
      }

      const updatedItems = [];
      let newSubtotal = 0;

      for (const d of diffs) {
        const { item, newQty, diff, pDoc } = d;
        if (diff > 0) {
          const pData = pDoc.data();
          if (pData.quantity < diff) {
            throw new Error(`Only ${pData.quantity} additional units of '${item.product_name_snapshot}' available.`);
          }
          transaction.update(pDoc.ref, {
            quantity: pData.quantity - diff,
            is_available: pData.quantity - diff > 0,
          });

          const txRef = doc(collection(db, 'inventoryTransactions'));
          transaction.set(txRef, {
            id: txRef.id,
            product_id: pDoc.id,
            type: 'QUANTITY_INCREASED',
            quantity: -diff,
            reference_type: 'ORDER_MOD',
            reference_id: order.order_number,
            created_at: new Date().toISOString(),
          });
        } else if (diff < 0) {
          const pData = pDoc.data();
          transaction.update(pDoc.ref, {
            quantity: pData.quantity + Math.abs(diff),
            is_available: true,
          });

          const txRef = doc(collection(db, 'inventoryTransactions'));
          transaction.set(txRef, {
            id: txRef.id,
            product_id: pDoc.id,
            type: 'QUANTITY_DECREASED',
            quantity: Math.abs(diff),
            reference_type: 'ORDER_MOD',
            reference_id: order.order_number,
            created_at: new Date().toISOString(),
          });
        }

        if (newQty > 0) {
          const itemSub = Math.round(item.price_snapshot * newQty * 100) / 100;
          newSubtotal += itemSub;
          updatedItems.push({
            ...item,
            quantity: newQty,
            subtotal: itemSub,
          });
        }
      }

      const roundedSubtotal = Math.round(newSubtotal * 100) / 100;
      const finalStatus = updatedItems.length === 0 ? 'CANCELLED' : order.status;

      transaction.update(orderRef, {
        items: updatedItems,
        subtotal: roundedSubtotal,
        total_amount: roundedSubtotal,
        status: finalStatus,
        updated_at: new Date().toISOString(),
      });

      return { ...order, items: updatedItems, total_amount: roundedSubtotal, status: finalStatus };
    });
  }

  async updateOrderStatus(orderId, newStatus, notes = '') {
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) throw new Error('Order not found.');

      const order = orderDoc.data();
      const oldStatus = order.status;

      // Rollback stock on Cancel/Reject
      if (['CANCELLED', 'REJECTED'].includes(newStatus) && !['CANCELLED', 'REJECTED'].includes(oldStatus)) {
        for (const item of order.items) {
          const pRef = doc(db, 'products', String(item.product_id));
          const pDoc = await transaction.get(pRef);
          if (pDoc.exists()) {
            transaction.update(pRef, {
              quantity: pDoc.data().quantity + item.quantity,
              is_available: true,
            });

            const txRef = doc(collection(db, 'inventoryTransactions'));
            transaction.set(txRef, {
              id: txRef.id,
              product_id: pRef.id,
              type: 'ORDER_CANCELLED',
              quantity: item.quantity,
              reference_type: 'ORDER_CANCEL',
              reference_id: order.order_number,
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      // Generate Bill if READY or COMPLETED
      if (['READY', 'RECEIVED', 'COMPLETED'].includes(newStatus)) {
        const billRef = doc(db, 'bills', orderId);
        const billDoc = await transaction.get(billRef);
        if (!billDoc.exists()) {
          transaction.set(billRef, {
            id: billRef.id,
            bill_number: generateBillNumber(),
            order_id: orderId,
            userId: order.userId,
            subtotal: order.subtotal,
            discount: order.discount || 0,
            total: order.total_amount,
            status: newStatus === 'COMPLETED' ? 'PAID' : 'PENDING',
            order: order,
            created_at: new Date().toISOString(),
          });
        }
      }

      transaction.update(orderRef, {
        status: newStatus,
        notes: notes ? `${order.notes || ''} [Admin: ${notes}]`.trim() : order.notes,
        updated_at: new Date().toISOString(),
      });

      // Notification
      const notifRef = doc(collection(db, 'notifications'));
      transaction.set(notifRef, {
        id: notifRef.id,
        userId: order.userId,
        title: `Order #${order.order_number} ${newStatus}`,
        message: `Your order is now ${newStatus}.`,
        type: 'ORDER_STATUS',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      return { ...order, status: newStatus };
    });
  }

  // --- BULK / FESTIVAL ORDERS ---
  subscribeToBulkOrders(userId, isAdmin, callback) {
    let q;
    if (isAdmin) {
      q = query(collection(db, 'bulkOrders'), orderBy('created_at', 'desc'));
    } else {
      q = query(collection(db, 'bulkOrders'), where('userId', '==', userId), orderBy('created_at', 'desc'));
    }
    return onSnapshot(q, (snapshot) => {
      const bulks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(bulks);
    });
  }

  async createBulkOrder(bulkPayload, user) {
    const bulkRef = doc(collection(db, 'bulkOrders'));
    const reqNum = generateBulkRequestNumber();

    const itemsData = await Promise.all(
      bulkPayload.items.map(async (i) => {
        const pDoc = await getDoc(doc(db, 'products', String(i.product_id)));
        const pData = pDoc.exists() ? pDoc.data() : { name: 'Product', price: 0 };
        return {
          id: `item_${Math.random().toString(36).substr(2, 6)}`,
          product_id: i.product_id,
          product_name_snapshot: pData.name,
          requested_quantity: i.requested_quantity,
          approved_quantity: i.requested_quantity,
          price_snapshot: pData.price,
        };
      })
    );

    const bulkData = {
      id: bulkRef.id,
      request_number: reqNum,
      userId: user.id,
      user_id: user.id,
      event_name: bulkPayload.event_name,
      required_date: bulkPayload.required_date,
      required_time: bulkPayload.required_time || '08:00 AM',
      status: 'PENDING',
      notes: bulkPayload.notes || '',
      admin_notes: '',
      items: itemsData,
      user: {
        name: user.name,
        phone: user.phone,
        village: user.village || 'Sangola',
      },
      created_at: new Date().toISOString(),
    };

    await setDoc(bulkRef, bulkData);
    return bulkData;
  }

  async updateBulkOrder(bulkId, updates) {
    const bulkRef = doc(db, 'bulkOrders', bulkId);
    await updateDoc(bulkRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }

  async convertBulkToOrder(bulkId, user) {
    const bulkDoc = await getDoc(doc(db, 'bulkOrders', bulkId));
    if (!bulkDoc.exists()) throw new Error('Bulk order not found.');
    const bulk = bulkDoc.data();

    const orderPayload = {
      order_date: bulk.required_date,
      notes: `Converted from Bulk Order #${bulk.request_number} (${bulk.event_name})`,
      items: bulk.items.map((i) => ({
        product_id: i.product_id,
        quantity: i.approved_quantity !== null ? i.approved_quantity : i.requested_quantity,
      })),
    };

    const newOrder = await this.placeOrder(orderPayload, {
      id: bulk.userId,
      name: bulk.user.name,
      phone: bulk.user.phone,
      village: bulk.user.village,
    });

    await updateDoc(doc(db, 'bulkOrders', bulkId), {
      status: 'ACCEPTED',
      converted_order_id: newOrder.id,
    });

    return newOrder;
  }

  // --- REAL-TIME CHAT (Firestore Native) ---
  subscribeToMessages(customerId, callback) {
    const convId = `conv_${customerId}`;
    const q = query(
      collection(db, `conversations/${convId}/messages`),
      orderBy('created_at', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(msgs);
    });
  }

  async sendMessage(customerId, senderId, receiverId, messageText, orderId = null) {
    const convId = `conv_${customerId}`;
    const msgRef = doc(collection(db, `conversations/${convId}/messages`));

    const msgData = {
      id: msgRef.id,
      conversation_id: convId,
      sender_id: senderId,
      receiver_id: receiverId,
      order_id: orderId,
      message: messageText,
      message_type: 'TEXT',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    await setDoc(msgRef, msgData);

    // Update conversation metadata
    await setDoc(
      doc(db, 'conversations', convId),
      {
        id: convId,
        customer_id: customerId,
        last_message: messageText,
        last_message_time: new Date().toISOString(),
        latest_order_id: orderId,
      },
      { merge: true }
    );

    return msgData;
  }

  subscribeToConversations(callback) {
    const q = query(collection(db, 'conversations'), orderBy('last_message_time', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(convs);
    });
  }

  // --- NOTIFICATIONS & BILLS ---
  subscribeToNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('created_at', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(notifs);
    });
  }

  async markNotificationRead(notifId) {
    await updateDoc(doc(db, 'notifications', notifId), { is_read: true });
  }

  async markAllNotificationsRead(userId) {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('is_read', '==', false));
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((d) => updateDoc(d.ref, { is_read: true }));
    await Promise.all(updates);
  }

  subscribeToBills(userId, isAdmin, callback) {
    let q;
    if (isAdmin) {
      q = query(collection(db, 'bills'), orderBy('created_at', 'desc'));
    } else {
      q = query(collection(db, 'bills'), where('userId', '==', userId), orderBy('created_at', 'desc'));
    }
    return onSnapshot(q, (snapshot) => {
      const bills = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(bills);
    });
  }

  subscribeToInventoryTransactions(callback) {
    const q = query(collection(db, 'inventoryTransactions'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(txs);
    });
  }

  // --- SEED FIRESTORE DATA ---
  async seedFirestoreDatabase() {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    if (!productsSnapshot.empty) {
      return { seeded: false, message: 'Firestore already seeded.' };
    }

    const products = [
      {
        name: 'Fresh Ladi Pav (Pack of 6)',
        category: 'Bread & Pav',
        description: 'Soft, fluffy, freshly baked daily morning ladi pav. Perfect for Misal and Vada Pav.',
        price: 30.0,
        unit: 'packet',
        quantity: 120,
        low_stock_threshold: 25,
        image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600',
        available_from: '06:00 AM',
        available_until: '09:00 PM',
      },
      {
        name: 'Chakote Premium Milk Bread',
        category: 'Bread & Pav',
        description: 'Enriched nutritious milk bread from Chakote. Soft slice texture with golden crust.',
        price: 45.0,
        unit: 'packet',
        quantity: 75,
        low_stock_threshold: 15,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
        available_from: '06:00 AM',
        available_until: '09:00 PM',
      },
      {
        name: 'Chakote Crispy Elaichi Toast',
        category: 'Toast & Khari',
        description: 'Crispy, aromatic cardamom flavored golden toasted rusk. Best companion for morning chai.',
        price: 50.0,
        unit: 'packet',
        quantity: 90,
        low_stock_threshold: 20,
        image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600',
        available_from: '06:00 AM',
        available_until: '09:30 PM',
      },
      {
        name: 'Layered Butter Khari Biscuit',
        category: 'Toast & Khari',
        description: 'Melt-in-mouth flaky and crispy layered butter khari made with pure ingredients.',
        price: 55.0,
        unit: 'packet',
        quantity: 60,
        low_stock_threshold: 15,
        image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600',
        available_from: '06:00 AM',
        available_until: '09:30 PM',
      },
      {
        name: 'Chakote Sweet Cream Roll (Pack of 4)',
        category: 'Snacks & Rolls',
        description: 'Crispy wafer cones filled with rich vanilla cream. Loved by kids and adults.',
        price: 30.0,
        unit: 'packet',
        quantity: 80,
        low_stock_threshold: 20,
        image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600',
        available_from: '07:00 AM',
        available_until: '09:30 PM',
      },
      {
        name: 'Dutch Chocolate Truffle Cake (500g)',
        category: 'Cakes & Pastries',
        description: 'Rich dark chocolate sponge layered with smooth chocolate ganache and chocolate curls.',
        price: 380.0,
        unit: 'piece',
        quantity: 15,
        low_stock_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
        available_from: '08:00 AM',
        available_until: '10:00 PM',
      },
      {
        name: 'Fresh Pineapple Glaze Cake (500g)',
        category: 'Cakes & Pastries',
        description: 'Moist vanilla sponge topped with real pineapple compote and whipped cream.',
        price: 320.0,
        unit: 'piece',
        quantity: 12,
        low_stock_threshold: 4,
        image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600',
        available_from: '08:00 AM',
        available_until: '10:00 PM',
      },
      {
        name: 'Sangola Special Jeera Butter Cookies (250g)',
        category: 'Cookies & Biscuits',
        description: 'Savory, salted crunchy butter cookies baked with roasted cumin seeds.',
        price: 65.0,
        unit: 'box',
        quantity: 45,
        low_stock_threshold: 10,
        image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600',
        available_from: '07:00 AM',
        available_until: '09:30 PM',
      },
    ];

    for (const p of products) {
      await this.createProduct(p);
    }

    return { seeded: true, count: products.length };
  }
}

export const firebaseService = new FirebaseBakeryService();
export default firebaseService;
