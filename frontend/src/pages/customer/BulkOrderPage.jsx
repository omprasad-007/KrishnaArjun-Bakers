import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Sparkles,
  Calendar,
  Clock,
  Plus,
  Minus,
  Trash2,
  Send,
  Info,
  CheckCircle2,
  PartyPopper,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BulkOrderPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [eventName, setEventName] = useState('Ganesh Chaturthi Festival');
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [requiredTime, setRequiredTime] = useState('08:00 AM');
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const prods = await api.getProducts();
      setProducts(prods || []);

      if (user) {
        const bulks = await api.getBulkOrders();
        setBulkOrders(bulks || []);
      }
    } catch (err) {
      toast.error("Failed to load bulk order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (productId) => {
    if (!productId) return;
    const prod = products.find((p) => p.id === parseInt(productId));
    if (!prod) return;

    if (selectedItems.some((i) => i.product_id === prod.id)) {
      toast.warning(`${prod.name} is already in the list.`);
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        product_id: prod.id,
        product_name: prod.name,
        unit: prod.unit,
        price: prod.price,
        requested_quantity: 50,
      }
    ]);
  };

  const handleUpdateItemQty = (prodId, delta) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.product_id === prodId) {
          const next = Math.max(1, item.requested_quantity + delta);
          return { ...item, requested_quantity: next };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (prodId) => {
    setSelectedItems((prev) => prev.filter((i) => i.product_id !== prodId));
  };

  const handleSubmitBulkOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please log in to submit a festival / bulk order.");
      navigate("/login?redirect=/bulk-orders");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please add at least one bakery product to your bulk request.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        event_name: eventName,
        required_date: requiredDate,
        required_time: requiredTime,
        items: selectedItems.map((i) => ({
          product_id: i.product_id,
          requested_quantity: i.requested_quantity,
        })),
        notes: notes,
      };

      const newBulk = await api.createBulkOrder(payload, user);
      setBulkOrders((prev) => [newBulk, ...prev]);
      setCreateModalOpen(false);
      setSelectedItems([]);
      setNotes('');
      toast.success(`Bulk order request #${newBulk.request_number} submitted!`);
    } catch (err) {
      toast.error(err.message || "Failed to submit bulk request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-4 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#855300] via-[#8b4513] to-[#6c2f00] text-white p-6 sm:p-10 shadow-warm-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#fea619]/20 border border-[#fea619]/40 text-[#ffdbc9] px-3.5 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-[#fea619]" />
            <span>Festivals, Weddings & Community Catering</span>
          </div>

          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            Festival & Bulk Bakery Orders
          </h1>

          <p className="text-xs sm:text-sm text-[#ffdbc9] leading-relaxed">
            Planning Ganesh Chaturthi, Diwali Faral, weddings, school snacks, or birthday events in Sangola? Submit your bulk requirements for special pricing and batch planning.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (!user) {
                  navigate("/login?redirect=/bulk-orders");
                  return;
                }
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#fea619] hover:bg-[#ffb95f] text-[#6c2f00] px-5 py-3 rounded-2xl text-xs font-extrabold shadow-warm-md transition-all active:scale-98"
            >
              <PartyPopper className="w-4 h-4" />
              <span>Submit New Bulk / Festival Request</span>
            </button>
          </div>
        </div>
      </section>

      {/* Existing Bulk Requests List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-[#1b1c1c]">
            My Festival & Bulk Requests ({bulkOrders.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : bulkOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#dac2b6]/40 shadow-warm-sm">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-headline font-bold text-lg text-gray-800">No bulk requests yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Need 50+ Pav packets, customized celebration cakes, or bulk bread for an event? Submit your request today.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bulkOrders.map((bulk) => (
              <div
                key={bulk.id}
                className="bg-white rounded-3xl p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eded] pb-3">
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
                    <p className="text-xs text-gray-500 mt-0.5">
                      Request #{bulk.request_number} • Required on: <strong>{bulk.required_date} at {bulk.required_time || 'Morning'}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/chat')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-xs font-bold text-[#6c2f00] self-start sm:self-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat With Bakery</span>
                  </button>
                </div>

                {/* Items requested and approved */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bulk.items.map((item) => (
                    <div key={item.id} className="p-3 bg-[#fcf9f8] rounded-2xl border border-[#f0eded]">
                      <h4 className="font-headline font-bold text-xs text-[#1b1c1c]">{item.product_name_snapshot}</h4>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-gray-500">Requested: {item.requested_quantity}</span>
                        {item.approved_quantity !== null && (
                          <span className="font-bold text-[#15803d]">
                            Approved: {item.approved_quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Admin notes if provided */}
                {bulk.admin_notes && (
                  <div className="p-3 bg-[#fffbf5] rounded-2xl border border-[#fea619]/40 text-xs">
                    <span className="font-bold text-[#855300]">Bakery Admin Note:</span>
                    <p className="text-gray-700 mt-0.5">{bulk.admin_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New Bulk Request Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Submit Festival / Bulk Order Request"
        subtitle="KrishnaArjun Bakers • Sangola Special Event Booking"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitBulkOrder} className="space-y-4 text-xs">
          {/* Event Name */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Event / Festival Name</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Ganesh Chaturthi / Wedding Reception / School Annual Day"
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Required Delivery Date</label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Required Time</label>
              <select
                value={requiredTime}
                onChange={(e) => setRequiredTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
              >
                <option value="06:00 AM">06:00 AM (Early Morning Bake)</option>
                <option value="08:00 AM">08:00 AM (Breakfast Batch)</option>
                <option value="12:00 PM">12:00 PM (Noon Batch)</option>
                <option value="04:00 PM">04:00 PM (Evening Batch)</option>
                <option value="07:00 PM">07:00 PM (Night Batch)</option>
              </select>
            </div>
          </div>

          {/* Product Selector */}
          <div className="space-y-2 pt-2 border-t border-[#f0eded]">
            <label className="block font-bold text-gray-700">Add Products for Bulk Baking</label>
            <div className="flex gap-2">
              <select
                id="bulk-product-select"
                className="flex-1 p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium"
                defaultValue=""
              >
                <option value="" disabled>Select bakery item to add...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price}/{p.unit})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('bulk-product-select');
                  if (el && el.value) {
                    handleAddItem(el.value);
                    el.value = "";
                  }
                }}
                className="px-4 py-2.5 bg-[#8b4513] text-white font-bold rounded-xl shadow-warm-sm hover:bg-[#6c2f00]"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Selected items list */}
          {selectedItems.length > 0 && (
            <div className="divide-y divide-[#f6f3f2] max-h-48 overflow-y-auto border border-[#dac2b6]/40 rounded-2xl p-3 bg-[#fcf9f8]">
              {selectedItems.map((item) => (
                <div key={item.product_id} className="py-2 flex items-center justify-between">
                  <div>
                    <h5 className="font-headline font-bold text-xs text-[#1b1c1c]">{item.product_name}</h5>
                    <span className="text-[10px] text-gray-500">₹{item.price} / {item.unit}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#dac2b6]/60 rounded-xl bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(item.product_id, -10)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-gray-800">
                        {item.requested_quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(item.product_id, 10)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="text-gray-400 hover:text-[#dc2626]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Requirements */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Special Requirements / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need delivery at Ganesh Mandir, hot pav in 250 piece bulk trays..."
              rows={2}
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-[#f0eded] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-[#f6f3f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-bold shadow-warm-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Request to Bakery'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BulkOrderPage;
