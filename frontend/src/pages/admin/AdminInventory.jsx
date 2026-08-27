import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Boxes,
  History,
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('ALL');
  const [activeTab, setActiveTab] = useState('LEDGER'); // LEDGER or TRANSACTIONS

  // Quick Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(25);
  const [restockReason, setRestockReason] = useState('Fresh morning baking batch');

  const toast = useToast();

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [prods, txs] = await Promise.all([
        api.getProducts(),
        api.getInventoryTransactions(),
      ]);
      setProducts(prods || []);
      setTransactions(txs || []);
    } catch (err) {
      toast.error("Failed to load inventory ledger.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestock = (product) => {
    setRestockProduct(product);
    setRestockQty(25);
    setRestockReason('Fresh morning bake batch');
    setRestockModalOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProduct) return;

    try {
      await api.updateProductStock(restockProduct.id, restockQty, restockReason);
      toast.success(`Restocked ${restockQty} units of '${restockProduct.name}'.`);
      setRestockModalOpen(false);
      loadInventoryData();
    } catch (err) {
      toast.error(err.message || "Failed to update stock.");
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedProductId === 'ALL') return true;
    return tx.product_id === parseInt(selectedProductId);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Inventory & Stock Ledger
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time stock tracking with immutable transaction audit log and negative stock guards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInventoryData}
            className="p-2 rounded-xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#dac2b6]/40 pb-2">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'LEDGER'
              ? 'border-[#8b4513] text-[#6c2f00]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Live Stock Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'TRANSACTIONS'
              ? 'border-[#8b4513] text-[#6c2f00]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transaction Audit History ({transactions.length})</span>
        </button>
      </div>

      {/* Tab 1: Live Stock Ledger */}
      {activeTab === 'LEDGER' && (
        <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fcf9f8] border-b border-[#f0eded] text-gray-700 font-headline font-bold">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Threshold</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f3f2]">
                {products.map((p) => {
                  const isSoldOut = !p.is_available || p.quantity <= 0;
                  const isLow = !isSoldOut && p.quantity <= p.low_stock_threshold;

                  return (
                    <tr key={p.id} className="hover:bg-[#fffbf5]/60 transition-colors">
                      <td className="py-3.5 px-4 font-headline font-bold text-sm text-[#1b1c1c]">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-800">₹{p.price.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-bold text-sm ${isSoldOut ? 'text-[#dc2626]' : isLow ? 'text-[#d97706]' : 'text-gray-900'}`}>
                          {p.quantity} {p.unit}s
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500">{p.low_stock_threshold}</td>
                      <td className="py-3.5 px-4">
                        {isSoldOut ? (
                          <Badge variant="soldout" size="sm">SOLD OUT</Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="sm">Low Stock</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Optimal</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenRestock(p)}
                          className="px-3 py-1.5 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm transition-all"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Transaction History Audit */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-4">
          {/* Filter by Product dropdown */}
          <div className="bg-white rounded-2xl p-3 border border-[#dac2b6]/40 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-700">Filter by Product:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="p-2 rounded-xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white font-medium"
            >
              <option value="ALL">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#fcf9f8] border-b border-[#f0eded] text-gray-700 font-headline font-bold">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Transaction Type</th>
                    <th className="py-3.5 px-4">Quantity Delta</th>
                    <th className="py-3.5 px-4">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f6f3f2]">
                  {filteredTransactions.map((tx) => {
                    const isPositive = tx.quantity > 0;

                    return (
                      <tr key={tx.id} className="hover:bg-[#fffbf5]/60 transition-colors">
                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {tx.product?.name || `Product #${tx.product_id}`}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] bg-[#f6f3f2] px-2 py-0.5 rounded-md font-semibold text-gray-800">
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${
                              isPositive ? 'text-[#16a34a]' : 'text-[#dc2626]'
                            }`}
                          >
                            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                            {isPositive ? `+${tx.quantity}` : tx.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px] font-mono">
                          {tx.reference_type ? `${tx.reference_type} (${tx.reference_id || '-'})` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title="Restock Product Inventory"
        subtitle={restockProduct?.name}
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#fcf9f8] rounded-2xl border border-[#f0eded] flex items-center justify-between">
            <span className="text-gray-600">Current Stock:</span>
            <span className="font-mono font-bold text-base text-[#6c2f00]">
              {restockProduct?.quantity} {restockProduct?.unit}s
            </span>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Stock Quantity to Add (+)
            </label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Batch / Restock Reason</label>
            <input
              type="text"
              required
              value={restockReason}
              onChange={(e) => setRestockReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
            />
          </div>

          <div className="pt-4 border-t border-[#f0eded] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRestockModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm"
            >
              Confirm Restock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInventory;
