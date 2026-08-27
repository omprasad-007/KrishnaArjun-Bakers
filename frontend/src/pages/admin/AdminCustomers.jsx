import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Search, ShoppingBag, Phone, MapPin, MessageSquare, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data || []);
    } catch (err) {
      toast.error("Failed to load customer registry.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.village && c.village.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
          Customer Directory & CRM
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Registered bakery clients, order frequency, total spending, and delivery addresses in Sangola.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#dac2b6]/40 shadow-warm-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, phone, or village..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No registered customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fcf9f8] border-b border-[#f0eded] text-gray-700 font-headline font-bold">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Phone & Email</th>
                  <th className="py-3.5 px-4">Address / Village</th>
                  <th className="py-3.5 px-4 text-center">Total Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Spent</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f3f2]">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#fffbf5]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {cust.name[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-headline font-bold text-sm text-[#1b1c1c] block">
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Joined {new Date(cust.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-gray-800 font-medium block">{cust.phone}</span>
                      <span className="text-gray-400 text-[11px]">{cust.email || 'No email provided'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                      {cust.address ? `${cust.address}, ` : ''}{cust.village || 'Sangola'}, {cust.district || 'Solapur'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-800">
                      {cust.total_orders}
                    </td>

                    <td className="py-3.5 px-4 text-right font-headline font-bold text-sm text-[#6c2f00]">
                      ₹{cust.total_spending.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/chat?customerId=${cust.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-xs font-bold text-[#6c2f00] transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-secondary" />
                        <span>Chat</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
