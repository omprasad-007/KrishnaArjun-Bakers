const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Helper to generate order and bill numbers
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KA-${dateStr}-${rand}`;
}

function generateBillNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-${dateStr}-${rand}`;
}

/**
 * 1. placeOrder - Atomic Firestore Transaction
 * Enforces NO NEGATIVE STOCK under any concurrent ordering scenario.
 */
exports.placeOrder = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be authenticated to place an order.");
  }

  const { order_date, items, notes } = request.data;
  if (!items || !items.length) {
    throw new HttpsError("invalid-argument", "Order must contain at least one item.");
  }

  return await db.runTransaction(async (transaction) => {
    // 1. Read user profile
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await transaction.get(userDocRef);
    const userData = userDoc.exists ? userDoc.data() : { name: "Customer", phone: "" };

    // 2. Read and validate each product
    const productRefs = items.map((item) => db.collection("products").doc(String(item.product_id)));
    const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

    let subtotal = 0;
    const orderItemsData = [];
    const productUpdates = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const prodDoc = productDocs[i];

      if (!prodDoc.exists) {
        throw new HttpsError("not-found", `Product with ID ${item.product_id} not found.`);
      }

      const prodData = prodDoc.data();

      if (!prodData.is_available || prodData.quantity <= 0) {
        throw new HttpsError("failed-precondition", `Product '${prodData.name}' is currently SOLD OUT.`);
      }

      if (prodData.quantity < item.quantity) {
        throw new HttpsError(
          "failed-precondition",
          `Only ${prodData.quantity} unit(s) of '${prodData.name}' are available. You requested ${item.quantity}.`
        );
      }

      const itemSubtotal = Math.round(prodData.price * item.quantity * 100) / 100;
      subtotal += itemSubtotal;

      orderItemsData.push({
        id: `item_${i + 1}`,
        product_id: prodDoc.id,
        product_name_snapshot: prodData.name,
        price_snapshot: prodData.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      const newQty = prodData.quantity - item.quantity;
      productUpdates.push({
        ref: prodDoc.ref,
        data: {
          quantity: newQty,
          is_available: newQty > 0,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        prodName: prodData.name,
        qtyChange: -item.quantity,
      });
    }

    const orderNumber = generateOrderNumber();
    const orderRef = db.collection("orders").doc();
    const roundedSubtotal = Math.round(subtotal * 100) / 100;

    const newOrderData = {
      id: orderRef.id,
      order_number: orderNumber,
      user_id: uid,
      userId: uid,
      order_date: order_date || new Date().toISOString().split("T")[0],
      status: "PENDING",
      subtotal: roundedSubtotal,
      discount: 0.0,
      total_amount: roundedSubtotal,
      notes: notes || "",
      items: orderItemsData,
      user: {
        id: uid,
        name: userData.name || "Customer",
        phone: userData.phone || "",
        village: userData.village || "Sangola",
      },
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 3. Perform atomic writes
    transaction.set(orderRef, newOrderData);

    for (const update of productUpdates) {
      transaction.update(update.ref, update.data);

      const txRef = db.collection("inventoryTransactions").doc();
      transaction.set(txRef, {
        id: txRef.id,
        product_id: update.ref.id,
        type: "ORDER_RESERVED",
        quantity: update.qtyChange,
        reference_type: "ORDER",
        reference_id: orderNumber,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 4. Create in-app notifications
    const notifRef = db.collection("notifications").doc();
    transaction.set(notifRef, {
      id: notifRef.id,
      user_id: uid,
      userId: uid,
      title: "Order Placed Successfully",
      message: `Your order #${orderNumber} for ₹${roundedSubtotal.toFixed(2)} has been received by KrishnaArjun Bakers.`,
      type: "ORDER_STATUS",
      is_read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, order: newOrderData };
  });
});

/**
 * 2. modifyOrderItems - Atomic Transaction
 * Validates stock bounds before allowing customer or admin modification.
 */
exports.modifyOrderItems = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const { order_id, items } = request.data;
  const orderRef = db.collection("orders").doc(order_id);

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }

    const orderData = orderDoc.data();
    if (!["PENDING", "ACCEPTED"].includes(orderData.status)) {
      throw new HttpsError("failed-precondition", `Order cannot be modified in status '${orderData.status}'.`);
    }

    const existingItemsMap = new Map(orderData.items.map((i) => [i.id, i]));
    const productRefs = [];
    const diffs = [];

    for (const mod of items) {
      const existing = existingItemsMap.get(mod.item_id);
      if (!existing) continue;

      const pRef = db.collection("products").doc(String(existing.product_id));
      productRefs.push(pRef);
      diffs.push({
        item: existing,
        oldQty: existing.quantity,
        newQty: mod.new_quantity,
        diff: mod.new_quantity - existing.quantity,
      });
    }

    const productDocs = await Promise.all(productRefs.map((r) => transaction.get(r)));
    const updatedOrderItems = [];
    let newSubtotal = 0;

    for (let i = 0; i < diffs.length; i++) {
      const { item, oldQty, newQty, diff } = diffs[i];
      const prodDoc = productDocs[i];

      if (diff > 0) {
        const prodData = prodDoc.data();
        if (prodData.quantity < diff) {
          throw new HttpsError(
            "failed-precondition",
            `Only ${prodData.quantity} additional unit(s) of '${item.product_name_snapshot}' are available.`
          );
        }
        transaction.update(prodDoc.ref, {
          quantity: prodData.quantity - diff,
          is_available: prodData.quantity - diff > 0,
        });

        const txRef = db.collection("inventoryTransactions").doc();
        transaction.set(txRef, {
          id: txRef.id,
          product_id: prodDoc.id,
          type: "QUANTITY_INCREASED",
          quantity: -diff,
          reference_type: "ORDER_MOD",
          reference_id: orderData.order_number,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else if (diff < 0) {
        const prodData = prodDoc.data();
        transaction.update(prodDoc.ref, {
          quantity: prodData.quantity + Math.abs(diff),
          is_available: true,
        });

        const txRef = db.collection("inventoryTransactions").doc();
        transaction.set(txRef, {
          id: txRef.id,
          product_id: prodDoc.id,
          type: "QUANTITY_DECREASED",
          quantity: Math.abs(diff),
          reference_type: "ORDER_MOD",
          reference_id: orderData.order_number,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      if (newQty > 0) {
        const itemSub = Math.round(item.price_snapshot * newQty * 100) / 100;
        newSubtotal += itemSub;
        updatedOrderItems.push({
          ...item,
          quantity: newQty,
          subtotal: itemSub,
        });
      }
    }

    const roundedSubtotal = Math.round(newSubtotal * 100) / 100;
    const finalStatus = updatedOrderItems.length === 0 ? "CANCELLED" : orderData.status;

    transaction.update(orderRef, {
      items: updatedOrderItems,
      subtotal: roundedSubtotal,
      total_amount: roundedSubtotal,
      status: finalStatus,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, total_amount: roundedSubtotal, status: finalStatus };
  });
});

/**
 * 3. updateOrderStatus - Manages Stock Rollback & Automated Digital Bill
 */
exports.updateOrderStatus = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Admin authentication required.");
  }

  const { order_id, status, notes } = request.data;
  const orderRef = db.collection("orders").doc(order_id);

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }

    const orderData = orderDoc.data();
    const oldStatus = orderData.status;

    // Stock Rollback on Cancel / Reject
    if (["CANCELLED", "REJECTED"].includes(status) && !["CANCELLED", "REJECTED"].includes(oldStatus)) {
      for (const item of orderData.items) {
        const prodRef = db.collection("products").doc(String(item.product_id));
        const prodDoc = await transaction.get(prodRef);
        if (prodDoc.exists) {
          transaction.update(prodRef, {
            quantity: prodDoc.data().quantity + item.quantity,
            is_available: true,
          });

          const txRef = db.collection("inventoryTransactions").doc();
          transaction.set(txRef, {
            id: txRef.id,
            product_id: prodRef.id,
            type: "ORDER_CANCELLED",
            quantity: item.quantity,
            reference_type: "ORDER_CANCEL",
            reference_id: orderData.order_number,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // Automated Bill on READY or COMPLETED
    if (["READY", "RECEIVED", "COMPLETED"].includes(status)) {
      const billQuery = await db.collection("bills").where("order_id", "==", order_id).limit(1).get();
      if (billQuery.empty) {
        const billRef = db.collection("bills").doc();
        transaction.set(billRef, {
          id: billRef.id,
          bill_number: generateBillNumber(),
          order_id: order_id,
          userId: orderData.user_id,
          subtotal: orderData.subtotal,
          discount: orderData.discount || 0,
          total: orderData.total_amount,
          status: status === "COMPLETED" ? "PAID" : "PENDING",
          order: orderData,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    transaction.update(orderRef, {
      status,
      notes: notes ? `${orderData.notes || ""} [Admin: ${notes}]`.trim() : orderData.notes,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify customer
    const notifRef = db.collection("notifications").doc();
    transaction.set(notifRef, {
      id: notifRef.id,
      user_id: orderData.user_id,
      userId: orderData.user_id,
      title: `Order #${orderData.order_number} ${status}`,
      message: `Your bakery order status is now ${status}.`,
      type: "ORDER_STATUS",
      is_read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, status };
  });
});
