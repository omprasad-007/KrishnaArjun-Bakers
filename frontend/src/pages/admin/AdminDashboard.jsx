import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  ShoppingBag,
  Flame,
  CheckCircle2,
  Clock,
  IndianRupee,
  Package,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Boxes,
  MessageSquare
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, ordersData, lowStockData] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders(),
        api.getLowStockSummary(),
      ]);
      setStats(statsData);
      setRecentOrders((ordersData || []).slice(0, 6));
      setLowStockItems((lowStockData || []).slice(0, 5));
    } catch (err) {
      toast.error("Failed to refresh dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadDashboardData();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-medium">Loading executive bakery dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍🍳</span>
            <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
              Bakery Operations Dashboard
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            KrishnaArjun Bakers • Real-time production ledger, live queue, and inventory health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/calendar"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Today's Baking Queue</span>
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#dac2b6]/60 text-xs font-bold text-[#6c2f00] hover:bg-[#f6f3f2] shadow-warm-sm transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales Revenue"
          value={`₹${(stats?.today_sales || 0).toFixed(2)}`}
          subtitle={`Total Sales: ₹${(stats?.total_sales || 0).toFixed(2)}`}
          icon={IndianRupee}
          color="amber"
          onClick={() => navigate('/admin/reports')}
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pending_orders_count || 0}
          subtitle="Awaiting bake confirmation"
          icon={Clock}
          color="primary"
          onClick={() => navigate('/admin/orders?status=PENDING')}
        />
        <StatCard
          title="In Oven (Preparing)"
          value={stats?.preparing_orders_count || 0}
          subtitle="Currently baking in kitchen"
          icon={Flame}
          color="amber"
          onClick={() => navigate('/admin/orders?status=PREPARING')}
        />
        <StatCard
          title="Completed Today"
          value={stats?.completed_orders_count || 0}
          subtitle="Delivered / picked up"
          icon={CheckCircle2}
          color="green"
          onClick={() => navigate('/admin/orders?status=COMPLETED')}
        />
      </div>

      {/* Secondary Operational Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/calendar')}
          className="bg-white rounded-2xl p-4 border border-[#dac2b6]/40 shadow-warm-sm hover:border-primary/40 cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-gray-500 font-semibold">Tomorrow's Pre-Orders</span>
            <div className="font-headline font-bold text-xl text-[#6c2f00] mt-0.5">
              {stats?.tomorrow_orders_count || 0} Orders
            </div>
          </div>
          <Calendar className="w-8 h-8 text-[#fea619]" />
        </div>

        <div
          onClick={() => navigate('/admin/bulk-orders')}
          className="bg-white rounded-2xl p-4 border border-[#dac2b6]/40 shadow-warm-sm hover:border-primary/40 cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-gray-500 font-semibold">Pending Festival Requests</span>
            <div className="font-headline font-bold text-xl text-[#855300] mt-0.5">
              {stats?.pending_bulk_orders_count || 0} Requests
            </div>
          </div>
          <Sparkles className="w-8 h-8 text-secondary" />
        </div>

        <div
          onClick={() => navigate('/admin/inventory')}
          className="bg-white rounded-2xl p-4 border border-[#dac2b6]/40 shadow-warm-sm hover:border-primary/40 cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-gray-500 font-semibold">Low Stock Warnings</span>
            <div className="font-headline font-bold text-xl text-[#dc2626] mt-0.5">
              {stats?.low_stock_products_count || 0} Items
            </div>
          </div>
          <AlertTriangle className="w-8 h-8 text-[#dc2626]" />
        </div>
      </div>

      {/* Two Columns: Recent Orders Feed + Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
            <h3 className="font-headline font-bold text-lg text-[#1b1c1c]">
              Recent Live Customer Orders
            </h3>
            <Link to="/admin/orders" className="text-xs font-bold text-[#8b4513] hover:underline flex items-center gap-1">
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-[#f6f3f2]">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-gray-900">
                        #{order.order_number}
                      </span>
                      <Badge
                        variant={
                          order.status === 'COMPLETED' ? 'success' :
                          order.status === 'PREPARING' ? 'secondary' :
                          order.status === 'READY' ? 'brand' :
                          order.status === 'CANCELLED' ? 'danger' : 'warning'
                        }
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Customer: <strong>{order.user?.name || "Customer"}</strong> ({order.user?.phone})
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Date: {order.order_date} • {order.items.length} item(s) • Total: <strong>₹{order.total_amount.toFixed(2)}</strong>
                    </p>
                  </div>

                  {/* Quick Action status button */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleQuickStatusChange(order.id, 'ACCEPTED')}
                        className="px-3 py-1.5 rounded-xl bg-[#8b4513] text-white text-xs font-bold shadow-warm-sm hover:bg-[#6c2f00]"
                      >
                        Accept
                      </button>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleQuickStatusChange(order.id, 'PREPARING')}
                        className="px-3 py-1.5 rounded-xl bg-[#fea619] text-[#6c2f00] text-xs font-bold shadow-warm-sm hover:bg-[#ffb95f]"
                      >
                        Bake (In Oven)
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleQuickStatusChange(order.id, 'READY')}
                        className="px-3 py-1.5 rounded-xl bg-[#15803d] text-white text-xs font-bold shadow-warm-sm hover:bg-[#166534]"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleQuickStatusChange(order.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-xl bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm"
                      >
                        Complete & Bill
                      </button>
                    )}

                    <Link
                      to={`/orders/${order.id}`}
                      className="p-1.5 rounded-xl border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-gray-600"
                      title="Inspect order details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watchlist (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
              <h3 className="font-headline font-bold text-base text-[#1b1c1c]">
                Stock Attention List
              </h3>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-[#8b4513] hover:underline">
              Ledger
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              All inventory levels are healthy!
            </div>
          ) : (
            <div className="divide-y divide-[#f6f3f2]">
              {lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-headline font-bold text-xs text-[#1b1c1c]">{item.name}</h4>
                    <span className="text-[10px] text-gray-500">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${item.is_sold_out ? 'text-[#dc2626]' : 'text-[#d97706]'}`}>
                      {item.is_sold_out ? 'SOLD OUT' : `${item.quantity} ${item.unit} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/admin/inventory"
              className="w-full py-2.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-xs font-bold text-[#6c2f00] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Boxes className="w-4 h-4" />
              <span>Restock Inventory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
