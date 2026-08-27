import firebaseService from './firebaseService';

/**
 * Unified API & Firebase Bridge Client
 * Provides seamless access to Firebase Auth, Cloud Firestore real-time listeners,
 * and atomic server transactions for KrishnaArjun Bakers.
 */
class ApiBridge {
  // --- AUTH ---
  async login(phone, password) {
    return await firebaseService.login(phone, password);
  }

  async register(userData) {
    return await firebaseService.register(userData);
  }

  async getMe(uid) {
    return await firebaseService.getUserProfile(uid);
  }

  async updateProfile(uid, data) {
    return await firebaseService.updateUserProfile(uid, data);
  }

  // --- ADMIN TEAM & ROLES ---
  subscribeToAdmins(callback) {
    return firebaseService.subscribeToAdmins(callback);
  }

  async getAdmins() {
    return await firebaseService.getAdmins();
  }

  async getAllUsers() {
    return await firebaseService.getAllUsers();
  }

  async promoteToAdmin(userId) {
    return await firebaseService.promoteToAdmin(userId);
  }

  async demoteAdmin(userId) {
    return await firebaseService.demoteAdmin(userId);
  }

  // --- PRODUCTS ---
  subscribeToProducts(callback) {
    return firebaseService.subscribeToProducts(callback);
  }

  async getProducts() {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToProducts((prods) => {
        unsub();
        resolve(prods);
      });
    });
  }

  async getCategories() {
    const prods = await this.getProducts();
    return [...new Set(prods.map((p) => p.category))];
  }

  async createProduct(data) {
    return await firebaseService.createProduct(data);
  }

  async updateProduct(id, data) {
    return await firebaseService.updateProduct(id, data);
  }

  async updateProductStock(id, delta, reason) {
    return await firebaseService.adjustProductStock(id, delta, reason);
  }

  async deleteProduct(id) {
    return await firebaseService.deleteProduct(id);
  }

  // --- ORDERS ---
  subscribeToOrders(userId, isAdmin, callback) {
    return firebaseService.subscribeToOrders(userId, isAdmin, callback);
  }

  subscribeToOrder(orderId, callback) {
    return firebaseService.subscribeToOrder(orderId, callback);
  }

  async getOrders(userId, isAdmin) {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToOrders(userId, isAdmin, (orders) => {
        unsub();
        resolve(orders);
      });
    });
  }

  async getOrder(orderId) {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToOrder(orderId, (order) => {
        unsub();
        resolve(order);
      });
    });
  }

  async createOrder(payload, user) {
    return await firebaseService.placeOrder(payload, user);
  }

  async modifyOrderItems(orderId, items, user) {
    return await firebaseService.modifyOrderItems(orderId, items, user);
  }

  async updateOrderStatus(orderId, status, notes = '') {
    return await firebaseService.updateOrderStatus(orderId, status, notes);
  }

  async cancelOrder(orderId, user) {
    return await firebaseService.updateOrderStatus(orderId, 'CANCELLED', 'Cancelled by customer');
  }

  // --- BULK ORDERS ---
  subscribeToBulkOrders(userId, isAdmin, callback) {
    return firebaseService.subscribeToBulkOrders(userId, isAdmin, callback);
  }

  async getBulkOrders(userId, isAdmin) {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToBulkOrders(userId, isAdmin, (bulks) => {
        unsub();
        resolve(bulks);
      });
    });
  }

  async createBulkOrder(payload, user) {
    return await firebaseService.createBulkOrder(payload, user);
  }

  async updateBulkOrder(bulkId, updates) {
    return await firebaseService.updateBulkOrder(bulkId, updates);
  }

  async convertBulkToOrder(bulkId, user) {
    return await firebaseService.convertBulkToOrder(bulkId, user);
  }

  // --- INVENTORY LEDGER ---
  subscribeToInventoryTransactions(callback) {
    return firebaseService.subscribeToInventoryTransactions(callback);
  }

  async getInventoryTransactions() {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToInventoryTransactions((txs) => {
        unsub();
        resolve(txs);
      });
    });
  }

  async getLowStockSummary() {
    const prods = await this.getProducts();
    return prods
      .filter((p) => p.quantity <= (p.low_stock_threshold || 10))
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        low_stock_threshold: p.low_stock_threshold,
        unit: p.unit,
        is_sold_out: p.quantity <= 0,
      }));
  }

  // --- BILLS ---
  subscribeToBills(userId, isAdmin, callback) {
    return firebaseService.subscribeToBills(userId, isAdmin, callback);
  }

  async getBills(userId, isAdmin) {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToBills(userId, isAdmin, (bills) => {
        unsub();
        resolve(bills);
      });
    });
  }

  async getBillByOrder(orderId) {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToBills(null, true, (bills) => {
        unsub();
        const found = bills.find((b) => b.order_id === orderId);
        resolve(found || null);
      });
    });
  }

  // --- NOTIFICATIONS ---
  subscribeToNotifications(userId, callback) {
    return firebaseService.subscribeToNotifications(userId, callback);
  }

  async getNotifications(userId) {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToNotifications(userId, (notifs) => {
        unsub();
        resolve(notifs);
      });
    });
  }

  async markNotificationRead(id) {
    return await firebaseService.markNotificationRead(id);
  }

  async markAllNotificationsRead(userId) {
    return await firebaseService.markAllNotificationsRead(userId);
  }

  // --- REAL-TIME CHAT ---
  subscribeToMessages(customerId, callback) {
    return firebaseService.subscribeToMessages(customerId, callback);
  }

  subscribeToConversations(callback) {
    return firebaseService.subscribeToConversations(callback);
  }

  async getMessages(customerId) {
    return new Promise((resolve) => {
      const unsub = firebaseService.subscribeToMessages(customerId, (msgs) => {
        unsub();
        resolve(msgs);
      });
    });
  }

  async sendMessage(customerId, text, senderId, receiverId, orderId = null) {
    return await firebaseService.sendMessage(customerId, senderId, receiverId, text, orderId);
  }

  // --- CALENDAR SUMMARY ---
  async getDailyCalendarSummary(date) {
    const [prods, orders, bulks] = await Promise.all([
      this.getProducts(),
      this.getOrders(null, true),
      this.getBulkOrders(null, true),
    ]);

    const activeOrders = orders.filter(
      (o) => o.order_date === date && !['CANCELLED', 'REJECTED'].includes(o.status)
    );
    const activeBulks = bulks.filter(
      (b) => b.required_date === date && b.status !== 'REJECTED'
    );

    const productMap = {};
    for (const p of prods) {
      productMap[p.id] = {
        product_id: p.id,
        product_name: p.name,
        category: p.category,
        unit: p.unit,
        regular_order_qty: 0,
        bulk_order_qty: 0,
        total_required_qty: 0,
        current_in_stock: p.quantity,
      };
    }

    for (const ord of activeOrders) {
      for (const item of ord.items || []) {
        if (productMap[item.product_id]) {
          productMap[item.product_id].regular_order_qty += item.quantity;
          productMap[item.product_id].total_required_qty += item.quantity;
        }
      }
    }

    for (const blk of activeBulks) {
      for (const item of blk.items || []) {
        const qty = item.approved_quantity !== null ? item.approved_quantity : item.requested_quantity;
        if (productMap[item.product_id]) {
          productMap[item.product_id].bulk_order_qty += qty;
          productMap[item.product_id].total_required_qty += qty;
        }
      }
    }

    const reqList = Object.values(productMap).filter(
      (p) => p.total_required_qty > 0 || p.current_in_stock > 0
    );
    reqList.sort((a, b) => b.total_required_qty - a.total_required_qty);

    return {
      date,
      total_orders: activeOrders.length,
      total_bulk_orders: activeBulks.length,
      products_required: reqList,
    };
  }

  // --- DASHBOARD & REPORTS ---
  async getDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [orders, bulks, prods] = await Promise.all([
      this.getOrders(null, true),
      this.getBulkOrders(null, true),
      this.getProducts(),
    ]);

    const todayOrders = orders.filter((o) => o.order_date === todayStr);
    const validToday = todayOrders.filter((o) => !['CANCELLED', 'REJECTED'].includes(o.status));
    const todaySales = validToday.reduce((acc, o) => acc + (o.total_amount || 0), 0);

    const completed = orders.filter((o) => ['COMPLETED', 'READY', 'RECEIVED'].includes(o.status));
    const totalSales = completed.reduce((acc, o) => acc + (o.total_amount || 0), 0);

    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const preparingOrders = orders.filter((o) => o.status === 'PREPARING').length;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

    const tomorrowOrders = orders.filter(
      (o) => o.order_date === tomorrowStr && !['CANCELLED', 'REJECTED'].includes(o.status)
    ).length;

    const pendingBulks = bulks.filter((b) => ['PENDING', 'REVIEWING'].includes(b.status)).length;
    const lowStock = prods.filter((p) => p.quantity <= (p.low_stock_threshold || 10)).length;
    const available = prods.filter((p) => p.is_available && p.quantity > 0).length;

    return {
      today_orders_count: todayOrders.length,
      pending_orders_count: pendingOrders,
      preparing_orders_count: preparingOrders,
      completed_orders_count: completedOrders,
      today_sales: Math.round(todaySales * 100) / 100,
      total_sales: Math.round(totalSales * 100) / 100,
      available_products_count: available,
      low_stock_products_count: lowStock,
      tomorrow_orders_count: tomorrowOrders,
      pending_bulk_orders_count: pendingBulks,
    };
  }

  async getSalesTrend(days = 7) {
    const orders = await this.getOrders(null, true);
    const trend = [];
    const baseDate = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      const dayOrders = orders.filter(
        (o) => o.order_date === dStr && !['CANCELLED', 'REJECTED'].includes(o.status)
      );
      const daySales = dayOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

      trend.push({
        period: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        sales: Math.round(daySales * 100) / 100,
        order_count: dayOrders.length,
      });
    }

    return trend;
  }

  async getTopProducts(limit = 5) {
    const orders = await this.getOrders(null, true);
    const validOrders = orders.filter((o) => !['CANCELLED', 'REJECTED'].includes(o.status));

    const itemMap = {};
    for (const ord of validOrders) {
      for (const item of ord.items || []) {
        if (!itemMap[item.product_name_snapshot]) {
          itemMap[item.product_name_snapshot] = {
            product_id: item.product_id,
            product_name: item.product_name_snapshot,
            category: 'Bakery',
            total_quantity_sold: 0,
            total_revenue: 0,
          };
        }
        itemMap[item.product_name_snapshot].total_quantity_sold += item.quantity;
        itemMap[item.product_name_snapshot].total_revenue += item.subtotal;
      }
    }

    const sorted = Object.values(itemMap).sort((a, b) => b.total_quantity_sold - a.total_quantity_sold);
    return sorted.slice(0, limit);
  }

  async getCustomers() {
    const orders = await this.getOrders(null, true);
    const custMap = {};

    for (const ord of orders) {
      const uId = ord.userId || ord.user_id;
      if (!uId) continue;

      if (!custMap[uId]) {
        custMap[uId] = {
          id: uId,
          name: ord.user?.name || 'Customer',
          phone: ord.user?.phone || '',
          village: ord.user?.village || 'Sangola',
          district: 'Solapur',
          total_orders: 0,
          total_spending: 0,
          created_at: ord.created_at,
        };
      }

      custMap[uId].total_orders += 1;
      if (!['CANCELLED', 'REJECTED'].includes(ord.status)) {
        custMap[uId].total_spending += ord.total_amount || 0;
      }
    }

    return Object.values(custMap);
  }

  async seedInitialBakeryData() {
    return await firebaseService.seedFirestoreDatabase();
  }
}

export const api = new ApiBridge();
export default api;
