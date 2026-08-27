import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DoughProgressBar from '../../components/common/DoughProgressBar';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  Clock,
  MessageSquare,
  FileText,
  Edit3,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  Phone,
  Check,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

export const OrderTracking = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modifyingModalOpen, setModifyingModalOpen] = useState(false);
  const [modifiedItems, setModifiedItems] = useState({});
  const [modifyingLoading, setModifyingLoading] = useState(false);

  useEffect(() => {
    loadOrderDetails();
    const interval = setInterval(loadOrderDetails, 10000); // live polling updates
    return () => clearInterval(interval);
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      const data = await api.getOrder(id);
      setOrder(data);
      // Initialize modification item quantities
      if (data?.items) {
        const initial = {};
        data.items.forEach((item) => {
          initial[item.id] = item.quantity;
        });
        setModifiedItems(initial);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load order tracking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleModifyQuantityChange = (itemId, delta) => {
    setModifiedItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleSaveModifications = async () => {
    try {
      setModifyingLoading(true);
      const itemsPayload = Object.entries(modifiedItems).map(([itemId, newQty]) => ({
        item_id: parseInt(itemId),
        new_quantity: newQty,
      }));

      const updated = await api.modifyOrderItems(order.id, itemsPayload);
      setOrder(updated);
      setModifyingModalOpen(false);
      toast.success("Order quantities updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to modify order quantities.");
    } finally {
      setModifyingLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order? Any reserved bakery inventory will be released.")) {
      try {
        const updated = await api.cancelOrder(order.id);
        setOrder(updated);
        toast.info("Order has been cancelled.");
      } catch (err) {
        toast.error(err.message || "Unable to cancel order.");
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-medium">Tracking fresh bakery batch...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="text-4xl">⚠️</div>
        <h2 className="font-headline font-bold text-xl text-gray-800">Order Not Found</h2>
        <p className="text-xs text-gray-500">The requested order does not exist or has been removed.</p>
        <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const isModifiable = order.status === 'PENDING' || order.status === 'ACCEPTED';
  const hasBill = ['READY', 'RECEIVED', 'COMPLETED'].includes(order.status);

  return (
    <div className="pb-24 pt-4 space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b4513] hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
              Order #{order.order_number}
            </h1>
            <Badge
              variant={
                order.status === 'COMPLETED' ? 'success' :
                order.status === 'PREPARING' ? 'secondary' :
                order.status === 'READY' ? 'brand' :
                order.status === 'CANCELLED' ? 'danger' : 'warning'
              }
              size="md"
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Delivery/Pickup Date: <strong className="text-[#6c2f00]">{order.order_date}</strong> • Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action buttons top */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/chat?orderId=${order.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#dac2b6]/60 text-xs font-bold text-[#6c2f00] hover:bg-[#f6f3f2] shadow-warm-sm transition-all"
          >
            <MessageSquare className="w-4 h-4 text-secondary" />
            <span>Chat with Baker</span>
          </button>

          {hasBill && (
            <Link
              to={`/bills/${order.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8b4513] text-white text-xs font-bold shadow-warm-sm hover:bg-[#6c2f00] transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Digital Bill</span>
            </Link>
          )}

          <button
            onClick={loadOrderDetails}
            className="p-2 rounded-xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dough Progress Bar Timeline */}
      <DoughProgressBar currentStatus={order.status} />

      {/* Modification Cutoff Alert Banner */}
      {isModifiable && (
        <div className="bg-gradient-to-r from-[#fffbf5] to-[#fcf9f8] rounded-2xl p-4 border border-[#fea619]/40 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-xs text-[#1b1c1c]">Modify Order Quantities</h4>
              <p className="text-[11px] text-gray-500">You can increase or decrease quantities before baking commences.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModifyingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#fea619] hover:bg-[#ffb95f] text-[#6c2f00] text-xs font-bold shadow-warm-sm transition-all"
            >
              Modify Quantities
            </button>
            <button
              onClick={handleCancelOrder}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#dc2626] hover:bg-[#fee2e2]/50 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </div>
      )}

      {/* Order Items Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-6">
        <h3 className="font-headline font-bold text-lg text-[#1b1c1c] border-b border-[#f0eded] pb-3">
          Order Items Breakdown
        </h3>

        <div className="divide-y divide-[#f6f3f2]">
          {order.items.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">{item.product_name_snapshot}</h4>
                <p className="text-xs text-gray-500">₹{item.price_snapshot.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs font-semibold text-gray-700 bg-[#f6f3f2] px-3 py-1 rounded-xl">
                  Qty: {item.quantity}
                </span>
                <span className="font-headline font-bold text-sm text-[#6c2f00] min-w-[70px] text-right">
                  ₹{item.subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Special instructions */}
        {order.notes && (
          <div className="p-4 bg-[#fcf9f8] rounded-2xl border border-[#f0eded]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Order Notes:</span>
            <p className="text-xs text-gray-700 mt-1">{order.notes}</p>
          </div>
        )}

        {/* Financial Summary */}
        <div className="pt-4 border-t border-[#f0eded] space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">₹{order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#15803d]">
              <span>Discount</span>
              <span className="font-semibold">-₹{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-[#6c2f00] pt-2 border-t border-[#f0eded]">
            <span>Grand Total</span>
            <span className="font-headline">₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bakery Contact & Sangola Address Details */}
      <div className="bg-white rounded-3xl p-6 border border-[#dac2b6]/40 shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">KrishnaArjun Bakers (Sangola)</h4>
          <p className="text-xs text-gray-500 mt-0.5">Main Market Road, Near ST Stand, Sangola, Solapur</p>
        </div>
        <a
          href="tel:+911234567890"
          className="flex-1 py-3 rounded-2xl bg-white border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-gray-700 font-headline font-bold text-xs shadow-warm-sm transition-all flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4 text-[#8b4513]" />
          <span>Call Bakery (+91 12345 67890)</span>
        </a>
      </div>

      {/* Quantity Modification Modal */}
      <Modal
        isOpen={modifyingModalOpen}
        onClose={() => setModifyingModalOpen(false)}
        title="Modify Order Quantities"
        subtitle={`Order #${order.order_number} • Real-time stock validation applied`}
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Adjust quantities below. If an item quantity is set to 0, it will be removed from your order.
          </p>

          <div className="divide-y divide-[#f6f3f2] max-h-64 overflow-y-auto">
            {order.items.map((item) => {
              const currentQty = modifiedItems[item.id] ?? item.quantity;

              return (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-headline font-bold text-xs text-[#1b1c1c]">{item.product_name_snapshot}</h5>
                    <p className="text-[11px] text-gray-500">₹{item.price_snapshot.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#dac2b6]/60 rounded-xl bg-[#fcf9f8] p-0.5">
                      <button
                        onClick={() => handleModifyQuantityChange(item.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-800">{currentQty}</span>
                      <button
                        onClick={() => handleModifyQuantityChange(item.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#f0eded] flex items-center justify-end gap-2">
            <button
              onClick={() => setModifyingModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
            >
              Cancel
            </button>
            <button
              disabled={modifyingLoading}
              onClick={handleSaveModifications}
              className="px-5 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm"
            >
              {modifyingLoading ? 'Saving...' : 'Save Modifications'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderTracking;
