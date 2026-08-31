import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingBag, Clock, Sparkles, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const { totalItemsCount } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Hide bottom bar on admin dashboard routes to maximize screen estate for admin tools
  if (isAdmin && location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-lg border border-[#dac2b6]/60 rounded-2xl shadow-warm-lg px-2 py-1.5 flex items-center justify-around">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#6c2f00] font-black bg-[#fff5ee] shadow-sm'
                : 'text-gray-500 font-medium hover:text-[#6c2f00]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </NavLink>

        {/* Menu / Catalog */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#6c2f00] font-black bg-[#fff5ee] shadow-sm'
                : 'text-gray-500 font-medium hover:text-[#6c2f00]'
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Bakes</span>
        </NavLink>

        {/* Order Now (Center Highlight) */}
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `relative -top-3 flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 shadow-warm-md ${
              isActive
                ? 'bg-[#6c2f00] text-white ring-4 ring-[#fea619]/40 scale-105'
                : 'bg-gradient-to-tr from-[#6c2f00] to-[#8b4513] text-white hover:scale-105'
            }`
          }
        >
          <Sparkles className="w-5 h-5 text-[#fea619]" />
          <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Order</span>
        </NavLink>

        {/* Shopping Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#6c2f00] font-black bg-[#fff5ee] shadow-sm'
                : 'text-gray-500 font-medium hover:text-[#6c2f00]'
            }`
          }
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#fea619] text-[#4a2003] text-[10px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 ring-2 ring-white shadow-sm animate-pulse">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Cart</span>
        </NavLink>

        {/* Orders / Profile */}
        <NavLink
          to={user ? '/orders' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#6c2f00] font-black bg-[#fff5ee] shadow-sm'
                : 'text-gray-500 font-medium hover:text-[#6c2f00]'
            }`
          }
        >
          {user ? <Clock className="w-5 h-5" /> : <User className="w-5 h-5" />}
          <span className="text-[10px] mt-0.5 tracking-tight">
            {user ? 'Orders' : 'Sign In'}
          </span>
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNav;
