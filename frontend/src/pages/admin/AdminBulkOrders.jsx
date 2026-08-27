import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowRight,
  MessageSquare,
  PackageCheck,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminBulkOrders = () => {
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review & Approval Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBulk, setSelectedBulk] = useState(null);
  const [approvedQuantities, setApprovedQuantities] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [bulkStatus, setBulkStatus] = useState('ACCEPTED');

  const toast = useToast();

  useEffect(() => {
    loadBulkOrders();
  }, []);

  const loadBulkOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getBulkOrders();
      setBulkOrders(data || []);
    } catch (err) {
      toast.error("Failed to load bulk order requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (bulk) => {
    setSelectedBulk(bulk);
    const initialApproved = {};
    bulk.items.forEach((item) => {
      initialApproved[item.id] = item.approved_quantity !== null ? item.approved_quantity : item.requested_quantity;
    });
    setApprovedQuantities(initialApproved);
    setAdminNotes(bulk.admin_notes || '');
    setBulkStatus(bulk.status === 'PENDING' ? 'ACCEPTED' : bulk.status);
    setReviewModalOpen(true);
  };

  const handleSaveApproval = async (e) => {
    e.preventDefault();
    if (!selectedBulk) return;

    try {
      const itemsPayload = Object.entries(approvedQuantities).map(([itemId, approvedQty]) => ({
        item_id: parseInt(itemId),
        approved_quantity: parseInt(approvedQty),
      }));

      await api.updateBulkOrder(selectedBulk.id, {
        status: bulkStatus,
        admin_notes: adminNotes,
        items: itemsPayload,
      });

      toast.success(`Bulk request #${selectedBulk.request_number} updated.`);
      setReviewModalOpen(false);
      loadBulkOrders();
    } catch (err) {
      toast.error(err.message || "Failed to update bulk request.");
    }
  };

  const handleConvertToActiveOrder = async (bulkId) => {
    if (window.confirm("Convert this accepted bulk request into an active bakery order? Stock will be reserved.")) {
      try {
        const order = await api.convertBulkToOrder(bulkId);
        toast.success(`Successfully converted to active Order #${order.order_number}!`);
        loadBulkOrders();
      } catch (err) {
        toast.error(err.message || "Failed to convert bulk order.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Festival & Bulk Order Bookings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review event requests, allocate baking batch capacities, modify approved quantities, and convert to confirmed orders.
          </p>
        </div>

        <button
          onClick={loadBulkOrders}
          className="p-2 rounded-xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors self-start sm:self-auto"
          title="Refresh Bulk Orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Bulk Orders List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">Loading festival requests...</div>
      ) : bulkOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#dac2b6]/40 shadow-warm-sm">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="font-headline font-bold text-lg text-gray-800">No bulk orders submitted yet</h3>
          <p className="text-xs text-gray-500 mt-1">Customer festival bookings will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bulkOrders.map((bulk) => {
            const isAccepted = bulk.status === 'ACCEPTED';
            const isPending = bulk.status === 'PENDING' || bulk.status === 'REVIEWING';

            return (
              <div
                key={bulk.id}
                className="bg-white rounded-3xl p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0eded] pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-headline font-bold text-base text-[#1b1c1c]">
                        {bulk.event_name}
                      </h3>
                      <Badge
                        variant={
                          bulk.status === 'ACCEPTED' ? 'success' :
                          bulk.status === 'REVIEWING' ? 'secondary' :
                          bulk.status === 'REJECTED' ? 'danger' : 'warning'
                        }
                        size="sm"
                      >
                        {bulk.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Request #{bulk.request_number} • Customer: <strong>{bulk.user?.name}</strong> ({bulk.user?.phone})
                    </p>
                    <p className="text-[11px] text-[#6c2f00] font-semibold mt-0.5">
                      Required On: {bulk.required_date} at {bulk.required_time || 'Morning'} • {bulk.user?.village || "Sangola"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleOpenReview(bulk)}
                      className="px-3.5 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm transition-all"
                    >
                      Review & Approve
                    </button>

                    {isAccepted && (
                      <button
                        onClick={() => handleConvertToActiveOrder(bulk.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold shadow-warm-sm transition-all flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Convert to Order</span>
                      </button>
                    )}

                    <Link
                      to={`/admin/chat?customerId=${bulk.user_id}`}
                      className="p-2 rounded-xl border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-[#855300]"
                      title="Chat with customer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Items requested and approved */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bulk.items.map((item) => (
                    <div key={item.id} className="p-3 bg-[#fcf9f8] rounded-2xl border border-[#f0eded]">
                      <h4 className="font-headline font-bold text-xs text-[#1b1c1c]">{item.product_name_snapshot}</h4>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-gray-500">Requested: <strong>{item.requested_quantity}</strong></span>
                        <span className="font-bold text-[#15803d]">
                          Approved: {item.approved_quantity !== null ? item.approved_quantity : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Notes & Admin Notes */}
                {(bulk.notes || bulk.admin_notes) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {bulk.notes && (
                      <div className="p-3 bg-[#fcf9f8] rounded-2xl border border-[#f0eded]">
                        <span className="font-bold text-gray-500 uppercase text-[10px]">Customer Note:</span>
                        <p className="text-gray-700 mt-0.5">{bulk.notes}</p>
                      </div>
                    )}
                    {bulk.admin_notes && (
                      <div className="p-3 bg-[#fffbf5] rounded-2xl border border-[#fea619]/40">
                        <span className="font-bold text-[#855300] uppercase text-[10px]">Bakery Admin Note:</span>
                        <p className="text-gray-800 mt-0.5">{bulk.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review & Approve Bulk Request"
        subtitle={`Request #${selectedBulk?.request_number} (${selectedBulk?.event_name})`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveApproval} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Approval Status</label>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
            >
              <option value="PENDING">PENDING</option>
              <option value="REVIEWING">REVIEWING</option>
              <option value="ACCEPTED">ACCEPTED (Approved for baking)</option>
              <option value="REJECTED">REJECTED (Capacity full)</option>
              <option value="PREPARING">PREPARING</option>
              <option value="READY">READY</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {/* Adjust approved quantities */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700">Approve Quantities per Product</label>
            <div className="divide-y divide-[#f6f3f2] max-h-48 overflow-y-auto border border-[#dac2b6]/40 rounded-2xl p-3 bg-[#fcf9f8]">
              {selectedBulk?.items.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-headline font-bold text-xs text-[#1b1c1c]">{item.product_name_snapshot}</h5>
                    <span className="text-[10px] text-gray-500">Requested: {item.requested_quantity}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-semibold">Approved:</span>
                    <input
                      type="number"
                      min="0"
                      value={approvedQuantities[item.id] ?? item.requested_quantity}
                      onChange={(e) =>
                        setApprovedQuantities({
                          ...approvedQuantities,
                          [item.id]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-20 p-1.5 border border-[#dac2b6] rounded-xl text-center font-mono font-bold bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Admin Feedback Note for Customer</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Approved for 200 Pavs and 50 Breads. Early morning batch at 07:00 AM ready."
              rows={2}
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
            />
          </div>

          <div className="pt-4 border-t border-[#f0eded] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm"
            >
              Save Approval & Notify
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBulkOrders;
