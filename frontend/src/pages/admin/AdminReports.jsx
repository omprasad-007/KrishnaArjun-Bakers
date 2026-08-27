import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import {
  BarChart3,
  TrendingUp,
  Award,
  IndianRupee,
  Calendar,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';

export const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [trendDays, setTrendDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadReportsData();
  }, [trendDays]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [statsData, trendData, topProdsData] = await Promise.all([
        api.getDashboardStats(),
        api.getSalesTrend(trendDays),
        api.getTopProducts(6),
      ]);
      setStats(statsData);
      setSalesTrend(trendData || []);
      setTopProducts(topProdsData || []);
    } catch (err) {
      toast.error("Failed to load sales analytics reports.");
    } finally {
      setLoading(false);
    }
  };

  const maxSales = Math.max(...salesTrend.map((t) => t.sales), 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Sales Analytics & Revenue Reports
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time bakery performance metrics, revenue trends, and bestseller volume analytics.
          </p>
        </div>

        <button
          onClick={loadReportsData}
          className="p-2 rounded-xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors self-start sm:self-auto"
          title="Refresh Reports"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Total Revenue"
          value={`₹${(stats?.today_sales || 0).toFixed(2)}`}
          subtitle={`${stats?.today_orders_count || 0} orders placed today`}
          icon={IndianRupee}
          color="primary"
        />
        <StatCard
          title="Lifetime Gross Sales"
          value={`₹${(stats?.total_sales || 0).toFixed(2)}`}
          subtitle="Total completed revenue"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Active Products In Stock"
          value={stats?.available_products_count || 0}
          subtitle={`${stats?.low_stock_products_count || 0} items near threshold`}
          icon={ShoppingBag}
          color="green"
        />
      </div>

      {/* Sales Revenue Trend Chart (Visual Bar Graph) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2b6]/40 shadow-warm-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0eded] pb-4">
          <div>
            <h3 className="font-headline font-bold text-lg text-[#1b1c1c] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              <span>Daily Revenue Performance</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Sales breakdown over the selected timeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTrendDays(days)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trendDays === days
                    ? 'bg-[#8b4513] text-white shadow-warm-sm'
                    : 'bg-[#f6f3f2] text-gray-600 hover:bg-[#eae7e7]'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Visual Graph Bars */}
        <div className="pt-6">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">Calculating revenue data...</div>
          ) : salesTrend.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">No sales recorded yet.</div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-64 pt-6 pb-2 px-2 overflow-x-auto border-b border-[#dac2b6]/40">
              {salesTrend.map((item, idx) => {
                const heightPercent = Math.max(6, (item.sales / maxSales) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 min-w-[32px] group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#6c2f00] text-white text-[10px] py-1 px-2 rounded-lg font-bold shadow-sm pointer-events-none whitespace-nowrap z-10">
                      ₹{item.sales.toFixed(2)} ({item.order_count} orders)
                    </div>

                    <div className="w-full flex items-end justify-center h-48 bg-[#f6f3f2] rounded-2xl p-1">
                      <div
                        className="w-full rounded-xl bg-gradient-to-t from-[#8b4513] to-[#fea619] transition-all duration-500 group-hover:brightness-110 shadow-sm"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className="text-[10px] font-semibold text-gray-500 text-center truncate max-w-full">
                      {item.period}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Selling Products List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2b6]/40 shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#fea619]" />
            <h3 className="font-headline font-bold text-lg text-[#1b1c1c]">
              Top Selling Bakery Products
            </h3>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No completed order data available yet to rank bestsellers.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts.map((p, idx) => (
              <div
                key={p.product_id || idx}
                className="p-4 bg-[#fcf9f8] rounded-2xl border border-[#f0eded] flex items-center justify-between gap-3 shadow-warm-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-headline font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs text-[#1b1c1c] line-clamp-1">{p.product_name}</h4>
                    <span className="text-[10px] text-gray-500">{p.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-headline font-bold text-xs text-[#6c2f00] block">
                    ₹{p.total_revenue.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {p.total_quantity_sold} sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
