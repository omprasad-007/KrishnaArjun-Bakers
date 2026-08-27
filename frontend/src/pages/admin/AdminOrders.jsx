import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  ShoppingBag,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialStatus = params.get('status');
    if (initialStatus) {
      setStatusFilter(initialStatus);
    }
  }, [location.search]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 12000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (err) {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (order, targetStatus) => {
    setSelectedOrder(order);
    setNextStatus(targetStatus);
    setStatusNotes('');
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !nextStatus) return;

    try {
      await api.updateOrderStatus(selectedOrder.id, nextStatus, statusNotes);
      toast.success(`Order #${selectedOrder.order_number} marked as ${nextStatus}`);
      setStatusModalOpen(false);
      loadOrders();
    } catch (err) {
      toast.error(err.message || "Failed to update order status.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchLow) ||
      (o.user?.name && o.user.name.toLowerCase().includes(searchLow)) ||
      (o.user?.phone && o.user.phone.includes(searchLow));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Customer Orders Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Accept orders, transition kitchen baking stages, generate digital bills, and chat with customers.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors self-start sm:self-auto"
          title="Refresh Orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#dac2b6]/40 shadow-warm-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number (KA-...), customer name, or phone number..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#8b4513] text-white shadow-warm-sm'
                  : 'bg-[#f6f3f2] text-gray-600 hover:bg-[#eae7e7]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading live bakery orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No orders found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fcf9f8] border-b border-[#f0eded] text-gray-700 font-headline font-bold">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Stage Status</th>
                  <th className="py-3.5 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f3f2]">
                {filteredOrders.map((order) => {
                  const hasBill = ['READY', 'RECEIVED', 'COMPLETED'].includes(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-[#fffbf5]/60 transition-colors">
                      {/* Order Number & Dates */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs text-gray-900 block">
                          #{order.order_number}
                        </span>
                        <span className="text-[11px] text-[#6c2f00] font-semibold block mt-0.5">
                          Delivery: {order.order_date}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-headline font-bold text-xs text-[#1b1c1c] block">
                          {order.user?.name || "Customer"}
                        </span>
                        <span className="text-[11px] text-gray-500 block">{order.user?.phone}</span>
                        <span className="text-[10px] text-gray-400">{order.user?.village || "Sangola"}</span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {order.items.map((item) => (
                            <div key={item.id} className="text-[11px] text-gray-700 flex items-center justify-between gap-2">
                              <span className="font-medium truncate">{item.product_name_snapshot}</span>
                              <span className="font-bold text-gray-900 flex-shrink-0">× {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <span className="inline-block text-[10px] text-[#855300] bg-[#fea619]/10 px-2 py-0.5 rounded mt-1 truncate max-w-full">
                            Note: {order.notes}
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-headline font-bold text-sm text-[#6c2f00]">
                        ₹{order.total_amount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
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
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Status progression triggers */}
                          {order.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleOpenStatusModal(order, 'ACCEPTED')}
                                className="px-2.5 py-1 rounded-lg bg-[#8b4513] text-white font-bold text-[11px] hover:bg-[#6c2f00]"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(order, 'REJECTED')}
                                className="px-2 py-1 rounded-lg bg-[#fee2e2] text-[#dc2626] font-bold text-[11px] hover:bg-[#fca5a5]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {order.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleOpenStatusModal(order, 'PREPARING')}
                              className="px-2.5 py-1 rounded-lg bg-[#fea619] text-[#6c2f00] font-bold text-[11px] hover:bg-[#ffb95f]"
                            >
                              In Oven
                            </button>
                          )}

                          {order.status === 'PREPARING' && (
                            <button
                              onClick={() => handleOpenStatusModal(order, 'READY')}
                              className="px-2.5 py-1 rounded-lg bg-[#15803d] text-white font-bold text-[11px] hover:bg-[#166534]"
                            >
                              Ready
                            </button>
                          )}

                          {order.status === 'READY' && (
                            <button
                              onClick={() => handleOpenStatusModal(order, 'COMPLETED')}
                              className="px-2.5 py-1 rounded-lg bg-[#6c2f00] text-white font-bold text-[11px]"
                            >
                              Complete & Bill
                            </button>
                          )}

                          {/* Chat button */}
                          <Link
                            to={`/admin/chat?customerId=${order.user_id}`}
                            className="p-1.5 rounded-lg border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-[#855300]"
                            title="Chat with customer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Link>

                          {/* Bill view */}
                          {hasBill && (
                            <Link
                              to={`/bills/${order.id}`}
                              className="p-1.5 rounded-lg border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-gray-700"
                              title="Digital Invoice"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Confirmation Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status to '${nextStatus}'`}
        subtitle={`Order #${selectedOrder?.order_number} (${selectedOrder?.user?.name})`}
      >
        <form onSubmit={handleConfirmStatusChange} className="space-y-4 text-xs">
          <p className="text-gray-600">
            Are you sure you want to transition this order status to <strong>{nextStatus}</strong>?
            Customer will receive an instant notification.
          </p>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Optional Admin Note / Kitchen Remark</label>
            <input
              type="text"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="e.g. Fresh batch packed, ready for counter collection..."
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
            />
          </div>

          <div className="pt-4 border-t border-[#f0eded] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm"
            >
              Confirm Status Change
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminOrders;
