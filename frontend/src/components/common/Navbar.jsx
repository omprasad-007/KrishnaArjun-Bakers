import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import {
  ShoppingBag,
  Bell,
  MessageSquare,
  User,
  LogOut,
  ShieldAlert,
  Store,
  Menu,
  X,
  ChevronDown,
  Calendar,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.is_read).length;
      setUnreadNotifCount(unread);
    } catch (e) {
      // quiet fail on background notification check
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotifCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadNotifCount((prev) => Math.max(0, prev - 1));
      }
      setShowNotifs(false);
      
      if (notif.type === 'CHAT') {
        navigate('/chat');
      } else if (notif.type === 'BILL') {
        navigate('/bills');
      } else if (notif.type === 'BULK_ORDER') {
        navigate(isAdmin ? '/admin/bulk-orders' : '/bulk-orders');
      } else {
        navigate(isAdmin ? '/admin/orders' : '/orders');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#dac2b6]/40 shadow-warm-sm transition-all">
      {/* Top Banner for Bakery Identity */}
      <div className="bg-gradient-to-r from-[#6c2f00] via-[#8b4513] to-[#855300] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="bg-[#fea619] text-[#6c2f00] px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
              Authorized Chakote Dealer
            </span>
            <span className="hidden sm:inline text-[#ffdbc9]">Fresh Daily Baking • Sangola, Maharashtra</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#ffdbc9]">
            <span>📞 +91 98765 43210</span>
            {isAdmin && (
              <span className="bg-white/20 text-white px-2 py-0.5 rounded font-bold">
                ADMIN CONSOLE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-headline font-extrabold text-xl shadow-warm-sm group-hover:scale-105 transition-transform">
              🥖
            </div>
            <div>
              <div className="font-headline font-extrabold text-lg text-[#6c2f00] tracking-tight leading-none flex items-center gap-1.5">
                KrishnaArjun Bakers
              </div>
              <p className="text-[11px] text-[#855300] font-medium tracking-wide leading-tight">
                Fresh Sangola Bakes & Sweets
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === '/admin' ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/orders') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Live Orders
                </Link>
                <Link
                  to="/admin/products"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/products') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Products
                </Link>
                <Link
                  to="/admin/inventory"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/inventory') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Inventory
                </Link>
                <Link
                  to="/admin/calendar"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/calendar') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Baking Calendar
                </Link>
                <Link
                  to="/admin/bulk-orders"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/bulk-orders') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Bulk / Festival
                </Link>
                <Link
                  to="/admin/reports"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/reports') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Reports
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === '/' ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/home"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === '/home' ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Daily Order
                </Link>
                <Link
                  to="/products"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === '/products' ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Bakery Catalog
                </Link>
                <Link
                  to="/bulk-orders"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                    location.pathname === '/bulk-orders' ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#fea619]" />
                  Festival & Bulk
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/orders') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  My Orders
                </Link>
                <Link
                  to="/bills"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/bills') ? 'bg-[#ffdbc9] text-[#6c2f00]' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  Digital Bills
                </Link>
              </>
            )}
          </nav>

          {/* Action Icons Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Cart Icon */}
            {!isAdmin && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-gray-700 hover:bg-[#f6f3f2] hover:text-[#6c2f00] transition-colors"
                title="View Cart"
              >
                <ShoppingBag className="w-6 h-6" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#fea619] text-[#6c2f00] text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {totalItemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Chat Icon */}
            {user && (
              <Link
                to={isAdmin ? "/admin/chat" : "/chat"}
                className="relative p-2 rounded-xl text-gray-700 hover:bg-[#f6f3f2] hover:text-[#6c2f00] transition-colors"
                title="Live Bakery Chat"
              >
                <MessageSquare className="w-6 h-6" />
              </Link>
            )}

            {/* Notification Bell with Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-xl text-gray-700 hover:bg-[#f6f3f2] hover:text-[#6c2f00] transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-warm-lg border border-[#dac2b6]/60 z-50 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-[#f0eded] bg-[#fcf9f8] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">Notifications</h4>
                        {unreadNotifCount > 0 && (
                          <span className="bg-[#fea619]/20 text-[#855300] text-xs px-2 py-0.5 rounded-full font-bold">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-[#8b4513] hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#f6f3f2]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-[#fcf9f8] cursor-pointer transition-colors ${
                              !n.is_read ? 'bg-[#fffbf5] font-medium' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-[#6c2f00]">{n.title}</span>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#f6f3f2] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-gray-800 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* Profile dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-warm-lg border border-[#dac2b6]/60 z-50 overflow-hidden py-1">
                    <div className="px-4 py-3 border-b border-[#f0eded] bg-[#fcf9f8]">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold text-[#1b1c1c] truncate">{user.name}</p>
                      <p className="text-xs text-[#855300] font-semibold mt-0.5">{user.phone} ({user.role})</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-[#f6f3f2]"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      My Profile & Address
                    </Link>

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#6c2f00] font-semibold hover:bg-[#f6f3f2]"
                      >
                        <ShieldAlert className="w-4 h-4 text-[#8b4513]" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/orders"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-[#f6f3f2]"
                      >
                        <ShoppingBag className="w-4 h-4 text-gray-500" />
                        My Orders
                      </Link>
                    )}

                    <div className="border-t border-[#f0eded] my-1"></div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#dc2626] font-semibold hover:bg-[#fee2e2]/50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-[#6c2f00] hover:bg-[#ffdbc9] rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#8b4513] hover:bg-[#6c2f00] rounded-xl shadow-warm-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
