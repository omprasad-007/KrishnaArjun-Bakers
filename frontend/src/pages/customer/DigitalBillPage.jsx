import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Printer, Download, ArrowLeft, CheckCircle2, Store, FileText } from 'lucide-react';

export const DigitalBillPage = () => {
  const { orderId } = useParams();
  const [bill, setBill] = useState(null);
  const [billsList, setBillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (orderId) {
      loadSingleBill(orderId);
    } else {
      loadBillsList();
    }
  }, [orderId]);

  const loadSingleBill = async (id) => {
    try {
      setLoading(true);
      const data = await api.getBillByOrder(id);
      setBill(data);
    } catch (err) {
      toast.error("Digital bill not yet generated for this order.");
    } finally {
      setLoading(false);
    }
  };

  const loadBillsList = async () => {
    try {
      setLoading(true);
      const data = await api.getBills();
      setBillsList(data || []);
      if (data && data.length > 0) {
        setBill(data[0]);
      }
    } catch (err) {
      toast.error("Failed to load digital bills.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-medium">Generating digital invoice...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 space-y-6 max-w-4xl mx-auto">
      {/* Top action controls */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b4513] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {!bill ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#dac2b6]/40 shadow-warm-sm">
          <div className="text-4xl mb-3">🧾</div>
          <h3 className="font-headline font-bold text-lg text-gray-800">No Digital Bills Generated Yet</h3>
          <p className="text-xs text-gray-500 mt-1">
            Digital bills are generated automatically once an order is marked READY or COMPLETED.
          </p>
        </div>
      ) : (
        /* Printable Bill Paper Container */
        <div
          id="printable-bill"
          className="bg-white rounded-3xl p-8 sm:p-12 border border-[#dac2b6]/50 shadow-warm-md space-y-8 print:shadow-none print:border-none print:p-0"
        >
          {/* Header Brand */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-[#8b4513] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥖</span>
                <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#6c2f00] tracking-tight">
                  KRISHNAARJUN BAKERS
                </h1>
              </div>
              <p className="text-xs font-bold text-[#855300] uppercase tracking-wider">
                Authorized Chakote Brand Dealer
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Main Market Road, Near ST Stand, Sangola 413307<br />
                Phone: +91 12345 67890 • Email: krishnaarjunbakers@gmail.com
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-[#fffbf5] sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-none border-[#fea619]/30">
              <span className="inline-block bg-[#8b4513] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                Official Tax Invoice
              </span>
              <p className="text-xs text-gray-500">
                Bill No: <strong className="text-gray-900 font-mono">{bill.bill_number}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Order No: <strong className="text-gray-900 font-mono">{bill.order?.order_number}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Date: <strong className="text-gray-900">{new Date(bill.created_at).toLocaleDateString()}</strong>
              </p>
            </div>
          </div>

          {/* Customer Details Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#fcf9f8] p-4 rounded-2xl border border-[#f0eded]">
            <div>
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Billed To:</span>
              <h3 className="font-headline font-bold text-sm text-[#1b1c1c] mt-0.5">
                {bill.order?.user?.name || "Valued Customer"}
              </h3>
              <p className="text-gray-600 mt-0.5">Phone: {bill.order?.user?.phone}</p>
              <p className="text-gray-600">
                Location: {bill.order?.user?.village || "Sangola"}, {bill.order?.user?.district || "Solapur"}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Payment & Status:</span>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#166534] font-bold px-3 py-1 rounded-full text-xs border border-[#86efac]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{bill.status}</span>
                </span>
              </div>
              <p className="text-gray-500 mt-1">Delivery / Baking Date: {bill.order?.order_date}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#8b4513] text-[#6c2f00] font-headline font-bold">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-2">Product Description</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Unit Price</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eded]">
                {bill.order?.items?.map((item, idx) => (
                  <tr key={item.id} className="text-gray-700">
                    <td className="py-3 px-2 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-2 font-bold text-gray-900">{item.product_name_snapshot}</td>
                    <td className="py-3 px-2 text-center font-semibold">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono">₹{item.price_snapshot.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-gray-900">
                      ₹{item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t-2 border-[#8b4513]/30 pt-6">
            <div className="text-xs text-gray-500 space-y-1 max-w-sm">
              <p className="font-bold text-gray-800">Terms & Conditions:</p>
              <p>1. Fresh bakery goods should be consumed within recommended shelf life.</p>
              <p>2. Keep cakes and pastries refrigerated below 5°C.</p>
              <p className="font-bold text-[#6c2f00] pt-1">Thank you for visiting KrishnaArjun Bakers!</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-gray-800">₹{bill.subtotal.toFixed(2)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-[#15803d]">
                  <span>Discount:</span>
                  <span className="font-mono font-semibold">-₹{bill.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#6c2f00] border-t-2 border-[#8b4513] pt-2">
                <span>Total Amount:</span>
                <span className="font-headline font-mono">₹{bill.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-8 border-t border-[#f0eded] flex items-center justify-between text-[11px] text-gray-400">
            <span>Authorized Signatory • KrishnaArjun Bakers (Sangola)</span>
            <span>Computer Generated Invoice</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalBillPage;
