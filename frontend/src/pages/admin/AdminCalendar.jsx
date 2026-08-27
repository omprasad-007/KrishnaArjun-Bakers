import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import {
  CalendarDays,
  Clock,
  Flame,
  Boxes,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadCalendarData(selectedDate);
  }, [selectedDate]);

  const loadCalendarData = async (date) => {
    try {
      setLoading(true);
      const data = await api.getDailyCalendarSummary(date);
      setSummary(data);
    } catch (err) {
      toast.error("Failed to load production calendar for selected date.");
    } finally {
      setLoading(false);
    }
  };

  const handleDayShift = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Baking Production Calendar
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Aggregated daily baking quantities required across regular customer orders and festival bulk requests.
          </p>
        </div>

        <button
          onClick={() => loadCalendarData(selectedDate)}
          className="p-2 rounded-xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors self-start sm:self-auto"
          title="Refresh Calendar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#dac2b6]/40 shadow-warm-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleDayShift(-1)}
            className="p-2 rounded-xl border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDate === todayStr
                  ? 'bg-[#8b4513] text-white shadow-warm-sm'
                  : 'bg-[#f6f3f2] text-gray-700 hover:bg-[#eae7e7]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDate === tomorrowStr
                  ? 'bg-[#8b4513] text-white shadow-warm-sm'
                  : 'bg-[#f6f3f2] text-gray-700 hover:bg-[#eae7e7]'
              }`}
            >
              Tomorrow
            </button>
          </div>

          <button
            onClick={() => handleDayShift(1)}
            className="p-2 rounded-xl border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-600">Specific Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 rounded-xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white font-medium"
          />
        </div>
      </div>

      {/* Daily Overview KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#dac2b6]/40 shadow-warm-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Orders</span>
          <div className="font-headline font-extrabold text-2xl text-[#6c2f00] mt-1">
            {summary?.total_orders || 0} Regular Orders
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#dac2b6]/40 shadow-warm-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bulk / Festival Orders</span>
          <div className="font-headline font-extrabold text-2xl text-[#855300] mt-1">
            {summary?.total_bulk_orders || 0} Bulk Requests
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#dac2b6]/40 shadow-warm-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unique Products to Bake</span>
          <div className="font-headline font-extrabold text-2xl text-[#15803d] mt-1">
            {summary?.products_required?.length || 0} Items
          </div>
        </div>
      </div>

      {/* Aggregated Daily Product Requirement Table */}
      <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
          <div>
            <h3 className="font-headline font-bold text-lg text-[#1b1c1c]">
              Total Quantities Required for {new Date(selectedDate).toDateString()}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Exact baking counts required to satisfy all regular and bulk customer orders.
            </p>
          </div>
          <span className="bg-[#fea619]/20 text-[#855300] text-xs font-bold px-3 py-1 rounded-full">
            Target Date: {selectedDate}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Calculating kitchen requirements...</div>
        ) : !summary || summary.products_required.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No product baking demands scheduled for this date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fcf9f8] border-b border-[#f0eded] text-gray-700 font-headline font-bold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Regular Orders Qty</th>
                  <th className="py-3 px-4 text-center">Bulk/Festival Qty</th>
                  <th className="py-3 px-4 text-center">Total Required Qty</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-right">Production Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f3f2]">
                {summary.products_required.map((req) => {
                  const isShortage = req.current_in_stock < req.total_required_qty;

                  return (
                    <tr key={req.product_id} className="hover:bg-[#fffbf5]/60 transition-colors">
                      <td className="py-3.5 px-4 font-headline font-bold text-sm text-[#1b1c1c]">
                        {req.product_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{req.category}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-gray-800">
                        {req.regular_order_qty}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#855300]">
                        {req.bulk_order_qty}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-headline font-extrabold text-base text-[#6c2f00] bg-[#ffdbc9]/40 px-3 py-1 rounded-xl">
                          {req.total_required_qty} {req.unit}s
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-700">
                        {req.current_in_stock}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isShortage ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#dc2626] bg-[#fee2e2] px-2.5 py-1 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Bake {req.total_required_qty - req.current_in_stock} more
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#166534] bg-[#dcfce7] px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCalendar;
