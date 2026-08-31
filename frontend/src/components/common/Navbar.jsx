import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Calendar,
  Sparkles,
  Search,
  Phone,
  MapPin,
  Clock,
  Package,
  Receipt,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  HeartHandshake
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close open dropdowns and drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifs(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications polling
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
        navigate(isAdmin ? '/admin/chat' : '/chat');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#dac2b6]/40 transition-all duration-300 ${
          isScrolled ? 'shadow-warm-md' : 'shadow-warm-sm'
        }`}
      >
        {/* Top Identity & Announcement Bar */}
        <div className="bg-gradient-to-r from-[#4a2003] via-[#6c2f00] to-[#855300] text-white text-xs select-none">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
            {/* Left: Brand Badge */}
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="inline-flex items-center gap-1 bg-[#fea619] text-[#4a2003] px-2 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider shadow-sm flex-shrink-0">
                <Award className="w-3 h-3 text-[#4a2003]" />
                Authorized Chakote Dealer
              </span>
              <span className="hidden md:inline text-[#ffdbc9] text-[11px] font-medium truncate">
                Sangola, Maharashtra • Fresh Daily Baking Since 1998
              </span>
            </div>

            {/* Right: Contact Helpline & Admin Tag */}
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-[#ffdbc9] flex-shrink-0 font-medium">
              <a
                href="tel:+919876543210"
                className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"
                title="Direct Bakery Helpline"
              >
                <Phone className="w-3 h-3 text-[#fea619]" />
                <span>+91 98765 43210</span>
              </a>
              <span className="hidden lg:inline text-white/30">•</span>
              <span className="hidden lg:inline text-[#ffdbc9]/90">
                Open Daily: 7:00 AM – 10:00 PM
              </span>
              {isAdmin && (
                <span className="bg-[#fea619] text-[#4a2003] px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <ShieldAlert className="w-3 h-3" />
                  Admin Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            {/* Left: Mobile Menu Button + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#6c2f00] hover:bg-[#fff5ee] focus:outline-none focus:ring-2 focus:ring-[#fea619] transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#6c2f00]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#6c2f00]" />
                )}
              </button>

              {/* Brand Logo & Title */}
              <Link
                to={isAdmin ? '/admin' : '/'}
                className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
              >
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#b8860b] bg-gradient-to-br from-[#fffcf5] to-[#fdedd9] flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-[#855300] transition-all flex-shrink-0">
                  <span className="text-[#6c2f00] font-serif font-black text-sm tracking-tight">KA</span>
                  <div className="absolute -bottom-1 bg-[#6c2f00] text-[7px] text-[#fea619] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider border border-[#b8860b]/40 scale-90">
                    ESTD
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-serif font-black text-base sm:text-lg text-[#2c1810] tracking-wide uppercase leading-tight group-hover:text-[#6c2f00] transition-colors">
                    KrishnaArjun
                  </div>
                  <div className="flex items-center gap-1.5 leading-none mt-0.5">
                    <span className="text-[10px] font-extrabold tracking-[0.22em] text-[#8b4513] uppercase">
                      BAKERS
                    </span>
                    <span className="text-[8px] text-[#a07855] font-semibold hidden sm:inline">
                      • Sangola
                    </span>
                  </div>
                  <div className="text-[8px] font-bold tracking-wider text-[#9c6a38] uppercase leading-none hidden xs:block">
                    Authorized Chakote Dealer
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-gray-700">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-xl transition-all ${
                      location.pathname === '/admin'
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm font-extrabold'
                        : 'hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/orders"
                    className={`px-3 py-2 rounded-xl transition-all ${
                      location.pathname.startsWith('/admin/orders')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm font-extrabold'
                        : 'hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                    }`}
                  >
                    Live Orders
                  </Link>
                  <Link
                    to="/admin/products"
                    className={`px-3 py-2 rounded-xl transition-all ${
                      location.pathname.startsWith('/admin/products')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm font-extrabold'
                        : 'hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                    }`}
                  >
                    Products
                  </Link>
                  <Link
                    to="/admin/inventory"
                    className={`px-3 py-2 rounded-xl transition-all ${
                      location.pathname.startsWith('/admin/inventory')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm font-extrabold'
                        : 'hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                    }`}
                  >
                    Inventory
                  </Link>
                  <Link
                    to="/admin/calendar"
                    className={`px-3 py-2 rounded-xl transition-all ${
                      location.pathname.startsWith('/admin/calendar')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm font-extrabold'
                        : 'hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                    }`}
                  >
                    Calendar
                  </Link>
                  <Link
                    to="/admin/bulk-orders"
                    className={`px-3 py-2 rounded-xl transition-all ${
                      location.pathname.startsWith('/admin/bulk-orders')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm font-extrabold'
                        : 'hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                    }`}
                  >
                    Bulk & Festival
                  </Link>
                  <Link
                    to="/admin/reports"
                    className={`px-3 py-2 rounded-xl transition-all ${
                      location.pathname.startsWith('/admin/reports')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm font-extrabold'
                        : 'hover:bg-[#f6f3f2] hover:text-[#6c2f00]'
                    }`}
                  >
                    Reports
                  </Link>
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-xl text-[#855300] hover:bg-[#fea619]/15 transition-all flex items-center gap-1 font-bold"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Storefront</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActiveRoute('/') && location.pathname === '/'
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/products"
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActiveRoute('/products')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <span>Bakery Menu</span>
                  </Link>
                  <Link
                    to="/home"
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActiveRoute('/home')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <span className="relative">
                      Order Now
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#fea619] ml-1 align-top animate-ping" />
                    </span>
                  </Link>
                  <Link
                    to="/bulk-orders"
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActiveRoute('/bulk-orders')
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#fea619]" />
                    <span>Bulk & Festival</span>
                  </Link>
                  <a
                    href="/#about"
                    className="px-3.5 py-2 rounded-xl text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-colors"
                  >
                    About Us
                  </a>
                  <a
                    href="/#contact"
                    className="px-3.5 py-2 rounded-xl text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-colors"
                  >
                    Contact
                  </a>
                </>
              )}
            </nav>

            {/* Right: Actions (Search, Cart, Notifications, Profile/Login) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Quick Search Button / Input trigger */}
              <button
                onClick={() => {
                  const input = document.getElementById('navbar-quick-search');
                  if (input) {
                    input.focus();
                  } else {
                    navigate('/products');
                  }
                }}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-gray-500 hover:text-[#6c2f00] text-xs transition-colors border border-[#dac2b6]/40"
                title="Search fresh baked goods"
              >
                <Search className="w-3.5 h-3.5 text-[#8b4513]" />
                <span className="font-medium text-[11px]">Search bakes...</span>
              </button>

              {/* Customer Cart Icon Button */}
              {!isAdmin && (
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-all group focus:outline-none"
                  title="View Shopping Cart"
                >
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 text-[#2c1810]" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#fea619] text-[#4a2003] text-[11px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-sm animate-bounce">
                      {totalItemsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Chat Icon Button (Logged in users) */}
              {user && (
                <Link
                  to={isAdmin ? '/admin/chat' : '/chat'}
                  className="relative p-2.5 rounded-xl text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-all group focus:outline-none"
                  title="Live Bakery Chat Support"
                >
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 text-[#2c1810]" />
                </Link>
              )}

              {/* Notification Bell Dropdown */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="relative p-2.5 rounded-xl text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-all group focus:outline-none"
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 text-[#2c1810]" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#dc2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-sm">
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-warm-lg border border-[#dac2b6]/60 z-50 overflow-hidden animate-fade-in divide-y divide-[#f0eded]">
                      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#fcf9f8] to-[#fffbf5] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">
                            Notifications
                          </h4>
                          {unreadNotifCount > 0 && (
                            <span className="bg-[#fea619]/20 text-[#855300] text-[11px] px-2 py-0.5 rounded-full font-bold">
                              {unreadNotifCount} unread
                            </span>
                          )}
                        </div>
                        {unreadNotifCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-[#8b4513] hover:text-[#6c2f00] hover:underline font-bold transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-[#f6f3f2]">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 text-gray-300" />
                            <span>You're all caught up! No notifications yet.</span>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 hover:bg-[#fffaf5] cursor-pointer transition-colors ${
                                !n.is_read ? 'bg-[#fff8f0] font-medium border-l-4 border-[#fea619]' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-[#6c2f00]">{n.title}</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {new Date(n.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Avatar / Login CTA */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-[#fff5ee] border border-transparent hover:border-[#dac2b6]/40 transition-all focus:outline-none"
                    aria-label="User profile menu"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#8b4513] to-[#6c2f00] text-[#ffdbc9] flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#fea619]/40">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden md:flex flex-col text-left leading-tight">
                      <span className="text-xs font-bold text-[#1b1c1c] max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-[#855300] font-semibold capitalize">
                        {isAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-warm-lg border border-[#dac2b6]/60 z-50 overflow-hidden py-1.5 animate-fade-in divide-y divide-[#f0eded]">
                      <div className="px-4 py-3 bg-gradient-to-r from-[#fcf9f8] to-[#fffbf5]">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-[#1b1c1c] truncate">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#6c2f00] font-medium">{user.phone}</span>
                          <span className="text-[9px] bg-[#fea619]/20 text-[#6c2f00] px-1.5 py-0.5 rounded font-bold uppercase">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#fffaf5] hover:text-[#6c2f00] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#8b4513]" />
                          <span>My Profile & Delivery Address</span>
                        </Link>

                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#6c2f00] bg-[#fff5ee]/60 hover:bg-[#fff5ee] transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4 text-[#8b4513]" />
                            <span>Admin Operations Dashboard</span>
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/orders"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#fffaf5] hover:text-[#6c2f00] transition-colors"
                            >
                              <ShoppingBag className="w-4 h-4 text-[#8b4513]" />
                              <span>My Orders & Live Tracking</span>
                            </Link>
                            <Link
                              to="/bills"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#fffaf5] hover:text-[#6c2f00] transition-colors"
                            >
                              <Receipt className="w-4 h-4 text-[#8b4513]" />
                              <span>Digital Invoices & Bills</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#dc2626] hover:bg-[#fee2e2]/60 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-2 text-xs font-bold text-[#6c2f00] hover:bg-[#fff5ee] rounded-xl transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#6c2f00] to-[#8b4513] hover:from-[#4a2003] hover:to-[#6c2f00] rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-1"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-sm bg-[#fffbf5] h-full shadow-2xl flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-out animate-slide-in">
            {/* Drawer Header with Bakery Seal */}
            <div className="p-4 bg-gradient-to-r from-[#4a2003] via-[#6c2f00] to-[#855300] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[#fea619] bg-[#fffbf5] flex items-center justify-center text-[#6c2f00] font-serif font-black text-sm shadow-inner">
                  KA
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-wide uppercase text-white">
                    KrishnaArjun Bakers
                  </h3>
                  <p className="text-[10px] text-[#ffdbc9] font-medium">
                    Authorized Chakote Dealer • Sangola
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Greeting / Auth Hub */}
            <div className="p-4 bg-[#fff5ee] border-b border-[#dac2b6]/40">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8b4513] text-[#ffdbc9] font-bold text-sm flex items-center justify-center shadow-sm">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Welcome back,</p>
                      <h4 className="font-headline font-bold text-sm text-[#1b1c1c] leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-[11px] text-[#855300] font-semibold">{user.phone}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-white border border-[#dac2b6]/60 text-[#6c2f00] hover:bg-[#f6f3f2] text-xs font-bold"
                    title="Account Settings"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium">
                    Order fresh bakery delights delivered right in Sangola.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 text-xs font-bold text-[#6c2f00] bg-white border border-[#dac2b6]/60 rounded-xl hover:bg-[#f6f3f2]"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 text-xs font-bold text-white bg-[#6c2f00] rounded-xl shadow-warm-sm hover:bg-[#4a2003]"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Search Bar inside Drawer */}
            <div className="p-3 border-b border-[#dac2b6]/30 bg-white">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Pao, Toast, Cakes, Cookies..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f6f3f2] border border-[#dac2b6]/50 focus:outline-none focus:ring-2 focus:ring-[#fea619] focus:bg-white text-gray-800"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </form>
            </div>

            {/* Drawer Scrollable Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Bakery Main Catalog Navigation */}
              <div>
                <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8b4513] mb-2 px-1">
                  Bakery Catalog
                </h5>
                <nav className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/'
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4" />
                      <span>Bakery Home</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>

                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/products'
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" />
                      <span>All Baked Goods</span>
                    </div>
                    <span className="text-[10px] bg-[#fea619]/20 text-[#6c2f00] px-2 py-0.5 rounded-full font-bold">
                      Catalog
                    </span>
                  </Link>

                  <Link
                    to="/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/home'
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#fea619]" />
                      <span>Order Daily Fresh</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                  </Link>

                  <Link
                    to="/bulk-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/bulk-orders'
                        ? 'bg-[#6c2f00] text-white shadow-warm-sm'
                        : 'text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#fea619]" />
                      <span>Festival & Bulk Catering</span>
                    </div>
                    <span className="text-[10px] bg-[#fea619] text-[#4a2003] px-2 py-0.5 rounded-full font-extrabold">
                      Special
                    </span>
                  </Link>
                </nav>
              </div>

              {/* Customer Account & Order Links */}
              <div>
                <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8b4513] mb-2 px-1">
                  Orders & Support
                </h5>
                <nav className="space-y-1">
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4 text-[#8b4513]" />
                      <span>My Cart</span>
                    </div>
                    {totalItemsCount > 0 && (
                      <span className="bg-[#fea619] text-[#4a2003] text-[10px] font-black px-2 py-0.5 rounded-full">
                        {totalItemsCount} items
                      </span>
                    )}
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#8b4513]" />
                          <span>My Orders & Tracking</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </Link>

                      <Link
                        to="/bills"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Receipt className="w-4 h-4 text-[#8b4513]" />
                          <span>Digital Invoices & Bills</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </Link>

                      <Link
                        to="/chat"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#fff5ee] hover:text-[#6c2f00] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-[#8b4513]" />
                          <span>Baker Live Chat</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </Link>
                    </>
                  )}
                </nav>
              </div>

              {/* Admin Panel Quick Access (if admin) */}
              {isAdmin && (
                <div className="p-3 bg-[#fff0e6] rounded-2xl border border-[#fea619]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#6c2f00] flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Admin Quick Console
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-center text-xs font-bold bg-white text-[#6c2f00] rounded-xl hover:bg-[#6c2f00] hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-center text-xs font-bold bg-white text-[#6c2f00] rounded-xl hover:bg-[#6c2f00] hover:text-white transition-colors"
                    >
                      Live Orders
                    </Link>
                    <Link
                      to="/admin/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-center text-xs font-bold bg-white text-[#6c2f00] rounded-xl hover:bg-[#6c2f00] hover:text-white transition-colors"
                    >
                      Catalog
                    </Link>
                    <Link
                      to="/admin/inventory"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-center text-xs font-bold bg-white text-[#6c2f00] rounded-xl hover:bg-[#6c2f00] hover:text-white transition-colors"
                    >
                      Inventory
                    </Link>
                  </div>
                </div>
              )}

              {/* Instant Help & Store Contacts */}
              <div className="p-4 bg-white rounded-2xl border border-[#dac2b6]/50 space-y-3 shadow-warm-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8b4513]" />
                  <div>
                    <h6 className="font-bold text-xs text-[#1b1c1c]">Sangola Storefront</h6>
                    <p className="text-[11px] text-gray-500">Open 7:00 AM – 10:00 PM Daily</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#fff5ee] text-[#6c2f00] text-xs font-bold hover:bg-[#ffdbc9] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Store</span>
                  </a>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20KrishnaArjun%20Bakers,%20I%20would%20like%20to%20place%20an%20order"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#25d366]/15 text-[#128c7e] text-xs font-bold hover:bg-[#25d366]/25 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Sign Out */}
            {user && (
              <div className="p-4 border-t border-[#dac2b6]/40 bg-white">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#fee2e2] text-[#dc2626] text-xs font-bold hover:bg-[#fecaca] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
