import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  ShoppingBag,
  Package,
  Calendar,
  MessageSquare,
  FileText,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  User,
  UserPlus,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleOrderNow = () => {
    if (!user) {
      toast.info("Please sign in with your account to place an order.");
      navigate("/login?redirect=/home");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#1c110b] text-[#fbf7f4] font-sans -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6">
      {/* 2. HERO BANNER SECTION (Warm Artisan Bakery Showcase) */}
      <section className="relative overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center bg-[#23150d]">
        {/* Rich Bakery Hero Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-75"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1800&auto=format&fit=crop')`,
          }}
        />

        {/* Cinematic Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#170c06] via-[#1f1109]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#170c06] via-transparent to-black/30" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          {/* Left Text & Call-To-Actions */}
          <div className="max-w-xl space-y-6 z-10">
            {/* Elegant Script Header */}
            <div className="font-serif italic text-2xl sm:text-3xl text-[#e8ba6c] font-normal tracking-wide">
              Welcome to
            </div>

            <div className="space-y-2">
              <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none">
                KrishnaArjun <span className="text-[#e5a823]">Bakers</span>
              </h1>

              {/* Decorative Waveform Divider */}
              <div className="flex items-center gap-2 pt-1 text-[#b8860b]">
                <div className="h-[2px] w-12 bg-[#b8860b]" />
                <svg className="w-16 h-3 text-[#e5a823]" viewBox="0 0 60 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M0 6h15l4-5 5 10 4-8 4 6 4-3h24" />
                </svg>
                <div className="h-[2px] w-24 bg-[#b8860b]" />
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[#f5e2cc] tracking-wide">
              Dealers of Chakote Brand from Sangola City
            </h2>

            <p className="text-xs sm:text-sm text-[#d4bca7] leading-relaxed font-normal max-w-lg">
              Enjoy the freshness and taste of our wide range of bakery products made with love and the finest ingredients.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={handleOrderNow}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#2b170e] hover:bg-[#3f2315] text-[#fbf7f4] font-bold text-xs border border-[#b8860b] shadow-lg shadow-black/40 hover:scale-102 active:scale-98 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-[#e5a823]" />
                <span>Order Now</span>
              </button>

              <Link
                to="/products"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-black/40 hover:bg-black/60 text-[#fbf7f4] font-bold text-xs border border-[#d6c2b4]/40 backdrop-blur-sm transition-all"
              >
                <Package className="w-4 h-4 text-[#e5a823]" />
                <span>View Products</span>
              </Link>
            </div>
          </div>

          {/* Right Scalloped Stamp Badge */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="w-44 h-44 rounded-full border-4 border-dashed border-[#b8860b] bg-[#fffdf9]/95 text-[#2c1810] p-4 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md transform hover:rotate-6 transition-transform">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8b5a2b]">
                DILLARS OF
              </span>
              <div className="my-1 border-t border-b border-[#b8860b] py-1 w-full">
                <span className="font-serif font-black text-xl text-[#2c1810] tracking-wider block">
                  CHAKOTE
                </span>
                <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#8b5a2b] block uppercase">
                  BRAND
                </span>
              </div>
              <span className="text-[8px] font-bold text-[#8b5a2b] tracking-wider uppercase mt-0.5">
                ★ SANGOLA ★
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FIVE FEATURE HIGHLIGHT CARDS (Beige Container) */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="bg-[#f5eee6] text-[#2c1810] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e4d5c7] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-0 lg:divide-x divide-[#e2d2c2]">
          {/* Card 1: Wide Range */}
          <div className="flex flex-col items-center text-center px-4 space-y-3 group">
            <div className="w-14 h-14 rounded-full bg-[#2c1810] text-[#e5a823] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-extrabold text-sm sm:text-base text-[#2c1810]">
              Wide Range
            </h3>
            <p className="text-[11px] text-[#6b4c3b] leading-relaxed font-medium">
              Explore a variety of fresh breads, biscuits, cakes, buns and more.
            </p>
          </div>

          {/* Card 2: Daily & Future Orders */}
          <div className="flex flex-col items-center text-center px-4 space-y-3 group">
            <div className="w-14 h-14 rounded-full bg-[#2c1810] text-[#e5a823] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-extrabold text-sm sm:text-base text-[#2c1810]">
              Daily & Future Orders
            </h3>
            <p className="text-[11px] text-[#6b4c3b] leading-relaxed font-medium">
              Place orders for today or schedule for tomorrow or any special day.
            </p>
          </div>

          {/* Card 3: Chat With Us */}
          <div className="flex flex-col items-center text-center px-4 space-y-3 group">
            <div className="w-14 h-14 rounded-full bg-[#2c1810] text-[#e5a823] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-extrabold text-sm sm:text-base text-[#2c1810]">
              Chat With Us
            </h3>
            <p className="text-[11px] text-[#6b4c3b] leading-relaxed font-medium">
              Connect directly with us for any queries or custom requirements.
            </p>
          </div>

          {/* Card 4: Digital Bill */}
          <div className="flex flex-col items-center text-center px-4 space-y-3 group">
            <div className="w-14 h-14 rounded-full bg-[#2c1810] text-[#e5a823] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-extrabold text-sm sm:text-base text-[#2c1810]">
              Digital Bill
            </h3>
            <p className="text-[11px] text-[#6b4c3b] leading-relaxed font-medium">
              Get your order bills instantly and keep track of your purchases.
            </p>
          </div>

          {/* Card 5: Secure & Reliable */}
          <div className="flex flex-col items-center text-center px-4 space-y-3 group">
            <div className="w-14 h-14 rounded-full bg-[#2c1810] text-[#e5a823] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-extrabold text-sm sm:text-base text-[#2c1810]">
              Secure & Reliable
            </h3>
            <p className="text-[11px] text-[#6b4c3b] leading-relaxed font-medium">
              Your data and orders are safe with us. We value your trust.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ABOUT & SPECIALTIES SHORTCUT */}
      <section id="about" className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="bg-[#241710] border border-[#3d271c] rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-extrabold text-[#e5a823] uppercase tracking-widest">
              Authorized Chakote Dealer • Sangola Hub
            </span>
            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
              Authentic Chakote Bakery Products & Daily Fresh Bakes
            </h2>
            <p className="text-xs sm:text-sm text-[#d4bca7] leading-relaxed">
              We provide Sangola and nearby areas with genuine Chakote Milk Bread, Cardamom Toast, Khari, Cream Rolls, Sponge Cakes, and daily hot Ladi Pav baked fresh at 06:00 AM every morning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="px-6 py-3.5 rounded-xl bg-[#e5a823] hover:bg-[#f0b533] text-[#2c1810] font-bold text-xs shadow transition-all whitespace-nowrap"
            >
              Browse Full Catalog
            </Link>
            <Link
              to="/bulk-orders"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all whitespace-nowrap"
            >
              Festival Catering
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOOTER BANNER (Dark Brown Aesthetic with Updated Contact) */}
      <footer id="contact" className="bg-[#180e08] border-t border-[#311b11] text-[#e0cfc3] py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2a1910] text-[#e5a823] flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-white">
                Sangola City, Maharashtra
              </h4>
              <p className="text-[#a89080] text-[11px] mt-0.5">
                Proud dealers of Chakote Brand
              </p>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2a1910] text-[#e5a823] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-white">
                07:00 AM - 10:00 PM
              </h4>
              <p className="text-[#a89080] text-[11px] mt-0.5">
                Open Daily (Mon - Sun)
              </p>
            </div>
          </div>

          {/* Email Support */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2a1910] text-[#e5a823] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <a href="mailto:krishnaarjunbakers@gmail.com" className="font-serif font-bold text-sm text-white hover:text-[#e5a823] transition-colors block">
                krishnaarjunbakers@gmail.com
              </a>
              <p className="text-[#a89080] text-[11px] mt-0.5">
                We're here to help you!
              </p>
            </div>
          </div>

          {/* Social Follow Us */}
          <div className="flex flex-col sm:items-end justify-center gap-2">
            <span className="font-serif font-bold text-xs text-white">Follow Us</span>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#f5eee6] text-[#2c1810] flex items-center justify-center font-bold text-xs hover:bg-[#e5a823] transition-colors shadow"
                title="Facebook"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#f5eee6] text-[#2c1810] flex items-center justify-center font-bold text-xs hover:bg-[#e5a823] transition-colors shadow"
                title="Instagram"
              >
                📸
              </a>
              <Link
                to="/chat"
                className="w-8 h-8 rounded-full bg-[#f5eee6] text-[#2c1810] flex items-center justify-center font-bold text-xs hover:bg-[#e5a823] transition-colors shadow"
                title="Live Chat Support"
              >
                💬
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#29170e] text-center text-[10px] text-[#7d6758]">
          © {new Date().getFullYear()} KrishnaArjun Bakers, Sangola. All Rights Reserved. Authorized Dealer of Chakote Brand.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
