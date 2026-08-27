import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingBag, Clock, MessageSquare, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const { totalItemsCount } = useCart();
  const { user, isAdmin } = useAuth();

  if (isAdmin) {
    return null; // Admins use sidebar & top nav
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#dac2b6]/50 px-2 py-1 shadow-warm-lg">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#6c2f00] font-bold scale-105' : 'text-gray-500 font-medium'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#6c2f00] font-bold scale-105' : 'text-gray-500 font-medium'
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Bakes</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#6c2f00] font-bold scale-105' : 'text-gray-500 font-medium'
            }`
          }
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#fea619] text-[#6c2f00] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Cart</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#6c2f00] font-bold scale-105' : 'text-gray-500 font-medium'
            }`
          }
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Orders</span>
        </NavLink>

        <NavLink
          to="/bulk-orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#6c2f00] font-bold scale-105' : 'text-gray-500 font-medium'
            }`
          }
        >
          <Sparkles className="w-5 h-5 text-[#fea619]" />
          <span className="text-[10px] mt-0.5">Festival</span>
        </NavLink>

        {user && (
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#6c2f00] font-bold scale-105' : 'text-gray-500 font-medium'
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Chat</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;
