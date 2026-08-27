import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import { ShoppingBag, ArrowRight, Calendar, Clock, Eye, FileText } from 'lucide-react';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (err) {
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="pb-24 pt-4 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track active baking orders, view digital bills, and review your order history.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#8b4513] hover:bg-[#6c2f00] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-warm-sm transition-all self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>New Order</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-[#8b4513] text-white shadow-warm-sm'
                : 'bg-white text-gray-600 border border-[#dac2b6]/50 hover:bg-[#f6f3f2]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#dac2b6]/40 shadow-warm-sm">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-headline font-bold text-lg text-gray-800">No orders found</h3>
          <p className="text-xs text-gray-500 mt-1">You haven't placed any orders matching this filter yet.</p>
          <div className="mt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#8b4513] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-warm-sm"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const hasBill = ['READY', 'RECEIVED', 'COMPLETED'].includes(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#dac2b6]/40 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-headline font-bold text-base text-[#1b1c1c]">
                      Order #{order.order_number}
                    </h3>
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

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      Delivery Date: <strong>{order.order_date}</strong>
                    </span>
                    <span>•</span>
                    <span>{order.items.length} product(s)</span>
                    <span>•</span>
                    <span className="font-bold text-[#6c2f00]">₹{order.total_amount.toFixed(2)}</span>
                  </div>

                  {/* Snapshot of items */}
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {order.items.map((i) => `${i.product_name_snapshot} (${i.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  {hasBill && (
                    <Link
                      to={`/bills/${order.id}`}
                      className="px-3.5 py-2 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-xs font-bold text-gray-700 transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Bill</span>
                    </Link>
                  )}
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
