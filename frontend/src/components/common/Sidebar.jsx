import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  CalendarDays,
  Sparkles,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  LogOut,
  ExternalLink,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Live Orders' },
    { to: '/admin/products', icon: Package, label: 'Product Catalog' },
    { to: '/admin/inventory', icon: Boxes, label: 'Inventory Ledger' },
    { to: '/admin/calendar', icon: CalendarDays, label: 'Production Calendar' },
    { to: '/admin/bulk-orders', icon: Sparkles, label: 'Festival / Bulk Orders' },
    { to: '/admin/customers', icon: Users, label: 'Customer CRM' },
    { to: '/admin/chat', icon: MessageSquare, label: 'Live Customer Chat' },
    { to: '/admin/reports', icon: BarChart3, label: 'Sales & Analytics' },
    { to: '/admin/team', icon: ShieldCheck, label: 'Admin Team & Roles' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#dac2b6]/40 min-h-[calc(100vh-64px)] flex flex-col justify-between p-4 shadow-warm-sm">
      <div className="space-y-6">
        {/* Admin Badge */}
        <div className="p-3.5 bg-gradient-to-br from-[#fcf9f8] to-[#f6f3f2] rounded-2xl border border-[#dac2b6]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-extrabold text-base shadow-warm-sm">
              👑
            </div>
            <div className="overflow-hidden">
              <h4 className="font-headline font-bold text-sm text-[#1b1c1c] truncate">{user?.name || "Admin"}</h4>
              <p className="text-[11px] text-[#855300] font-semibold">Bakery Operations</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8b4513] text-white shadow-warm-sm'
                      : 'text-gray-700 hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Customer View Link & Logout */}
      <div className="pt-4 border-t border-[#f0eded] space-y-2">
        <NavLink
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#855300] hover:bg-[#fea619]/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#855300]" />
            <span>Customer Storefront</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5" />
        </NavLink>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2]/60 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
