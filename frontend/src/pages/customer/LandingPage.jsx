import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import DoughProgressBar from '../../components/common/DoughProgressBar';
import Badge from '../../components/common/Badge';
import {
  ShoppingBag,
  Sparkles,
  Award,
  Clock,
  MapPin,
  Phone,
  Flame,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Heart,
  ChevronRight,
  ShieldCheck,
  Plus,
  MessageSquare,
  Truck,
  Star,
  Users,
  Store
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const { addToCart, totalItemsCount } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    // Load products from Firestore in real-time
    const unsubscribe = api.subscribeToProducts((prods) => {
      setProducts(prods || []);
      setLoading(false);
    });

    // Check for user's latest active order
    if (user) {
      api.getOrders(user.id, false).then((orders) => {
        const active = (orders || []).find((o) =>
          ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
        );
        if (active) {
          setActiveOrder(active);
        }
      }).catch(() => {});
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleOrderNow = (product) => {
    if (!user) {
      toast.info("Please sign in or create an account to order.");
      navigate("/login?redirect=/home");
      return;
    }
    if (product) {
      addToCart(product, 1);
    }
    navigate("/home");
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (product.quantity <= 0 || !product.is_available) {
      toast.error(`'${product.name}' is currently SOLD OUT.`);
      return;
    }
    addToCart(product, 1);
  };

  const featuredProducts = products.slice(0, 8);
  const categories = ['ALL', ...new Set(products.map((p) => p.category))];

  const filteredFeatured = featuredProducts.filter((p) =>
    selectedCategory === 'ALL' ? true : p.category === selectedCategory
  );

  return (
    <div className="space-y-16 pb-24 -mt-2">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8b4513] via-[#6c2f00] to-[#3a1800] text-white p-8 sm:p-12 md:p-16 shadow-warm-lg">
        {/* Decorative ambient glowing circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fea619]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ffc29f]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Authentic Dealer Badge */}
          <div className="inline-flex items-center gap-2 bg-[#fea619]/20 border border-[#fea619]/40 text-[#ffdbc9] px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
            <Award className="w-4 h-4 text-[#fea619]" />
            <span>Authorized Chakote Brand Dealer • Sangola, Maharashtra</span>
          </div>

          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white tracking-tight">
            Artisanal Warmth & Morning Oven Bakes
          </h1>

          <p className="text-sm sm:text-base text-[#ffdbc9] leading-relaxed max-w-2xl font-medium">
            From hot, fluffy daily Ladi Pav at 06:00 AM to nutritious Chakote Milk Bread, crispy cardamom rusks, and custom celebratory cakes. Freshly baked daily in Sangola with pure ingredients.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => handleOrderNow()}
              className="px-7 py-3.5 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#6c2f00] font-headline font-extrabold text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{user ? 'Order Today’s Fresh Batch' : 'Sign In & Order Fresh Bakes'}</span>
            </button>

            <Link
              to="/products"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <span>Explore Bakery Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              to="/bulk-orders"
              className="px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/15 text-[#ffdbc9] font-headline font-semibold text-xs border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fea619]" />
              <span>Festival / Bulk Orders</span>
            </Link>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15 text-xs">
            <div>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-white block">06:00 AM</span>
              <span className="text-[#ffdbc9] text-[11px]">Daily Fresh Oven Batch</span>
            </div>
            <div>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-[#fea619] block">100%</span>
              <span className="text-[#ffdbc9] text-[11px]">Pure Ingredients</span>
            </div>
            <div>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-white block">Sangola</span>
              <span className="text-[#ffdbc9] text-[11px]">Chakote Dealer Hub</span>
            </div>
            <div>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-[#fea619] block">Instant</span>
              <span className="text-[#ffdbc9] text-[11px]">Live Oven Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACTIVE ORDER QUICK-TRACKER BANNER (If customer has an ongoing order) */}
      {activeOrder && (
        <section className="bg-white rounded-3xl p-6 border-2 border-[#fea619] shadow-warm-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0eded] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fea619] animate-ping" />
              <h3 className="font-headline font-bold text-base text-[#1b1c1c]">
                Live Active Order in Kitchen: #{activeOrder.order_number}
              </h3>
              <Badge variant="brand" size="sm">
                {activeOrder.status}
              </Badge>
            </div>
            <Link
              to={`/orders/${activeOrder.id}`}
              className="text-xs font-bold text-[#8b4513] hover:text-[#6c2f00] flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Live Dough Progress & Modify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DoughProgressBar status={activeOrder.status} />
        </section>
      )}

      {/* 3. FEATURED PRODUCTS & DIRECT ADD-TO-CART (Connected to Firestore) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#f0eded] pb-4">
          <div>
            <span className="text-xs font-extrabold text-[#855300] uppercase tracking-wider">
              From Our Sangola Bakery Oven
            </span>
            <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c] mt-1">
              Fresh Daily Bakery Specialties
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select items directly to add to your order or browse the full catalog.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#8b4513] text-white shadow-warm-sm'
                    : 'bg-[#f6f3f2] text-gray-700 hover:bg-[#eae7e7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading oven bakes...</div>
        ) : filteredFeatured.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">No products found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredFeatured.map((prod) => {
              const isSoldOut = !prod.is_available || prod.quantity <= 0;
              const isLowStock = prod.quantity <= (prod.low_stock_threshold || 10) && !isSoldOut;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl p-5 border border-[#dac2b6]/40 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="h-44 rounded-2xl overflow-hidden relative bg-[#f6f3f2]">
                      <img
                        src={prod.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isSoldOut ? (
                          <span className="bg-[#dc2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            SOLD OUT
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-[#fea619] text-[#6c2f00] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            Only {prod.quantity} Left
                          </span>
                        ) : (
                          <span className="bg-[#15803d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            Fresh Batch
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                        {prod.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-headline font-bold text-base text-[#1b1c1c] line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description || 'Freshly baked with premium ingredients.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#f0eded] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Price per {prod.unit}</span>
                      <span className="font-headline font-extrabold text-lg text-[#6c2f00]">
                        ₹{Number(prod.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      disabled={isSoldOut}
                      onClick={(e) => handleAddToCart(prod, e)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-warm-sm active:scale-95 ${
                        isSoldOut
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#8b4513] hover:bg-[#6c2f00] text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSoldOut ? 'Sold Out' : '+ Add'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-[#dac2b6] text-[#6c2f00] font-headline font-bold text-xs shadow-warm-sm hover:bg-[#f6f3f2] transition-all"
          >
            <span>View All {products.length} Bakery Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. WHY SANGOLA CHOOSES KRISHNAARJUN BAKERS */}
      <section className="bg-[#fcf9f8] rounded-3xl p-8 sm:p-12 border border-[#dac2b6]/40 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-[#855300] uppercase tracking-wider">
            Artisanal Standards & Trust
          </span>
          <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            The KrishnaArjun Quality Promise
          </h2>
          <p className="text-xs text-gray-500">
            Serving Sangola with authentic Chakote products and daily oven freshness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#f0eded] shadow-warm-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold text-xl">
              🍞
            </div>
            <h4 className="font-headline font-bold text-base text-[#1b1c1c]">Never Old Stock</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every loaf of bread, tray of pav, and sweet roll is baked fresh daily for morning delivery and counter collection.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#f0eded] shadow-warm-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold text-xl">
              🤝
            </div>
            <h4 className="font-headline font-bold text-base text-[#1b1c1c]">Direct Chakote Dealer</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Official dealership ensuring genuine Chakote Milk Bread, Toast, Cream Rolls, and Biscuits with authentic recipe standards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#f0eded] shadow-warm-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold text-xl">
              📱
            </div>
            <h4 className="font-headline font-bold text-base text-[#1b1c1c]">Advance & Bulk Booking</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Order today for tomorrow morning or book large catering batches for weddings, poojas, and Ganesh Chaturthi.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FESTIVAL & BULK ORDERS PROMO BANNER */}
      <section className="rounded-3xl bg-gradient-to-r from-[#fea619] via-[#f59e0b] to-[#8b4513] text-[#1b1c1c] p-8 sm:p-10 shadow-warm-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-extrabold uppercase bg-white/30 text-[#6c2f00] px-3 py-1 rounded-full">
            Special Event Catering
          </span>
          <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-white">
            Need Bulk Pav, Bread, or Faral in Sangola?
          </h3>
          <p className="text-xs sm:text-sm text-white/90">
            Submit your bulk event requirements. We allocate dedicated early morning oven capacities with special dealer pricing.
          </p>
        </div>

        <Link
          to="/bulk-orders"
          className="px-6 py-3.5 rounded-2xl bg-white text-[#6c2f00] font-headline font-extrabold text-xs sm:text-sm shadow-warm-md hover:bg-[#fffbf5] transition-all whitespace-nowrap active:scale-98"
        >
          Book Festival / Bulk Order
        </Link>
      </section>

      {/* 6. LIVE REAL-TIME CHAT & HELP DESK BANNER */}
      <section className="bg-white rounded-3xl p-8 border border-[#dac2b6]/40 shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-2xl shadow-warm-sm flex-shrink-0">
            💬
          </div>
          <div>
            <h4 className="font-headline font-bold text-base text-[#1b1c1c]">
              Need Custom Cake Designs or Immediate Inquiry?
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Chat directly with KrishnaArjun Baker desk in real time.
            </p>
          </div>
        </div>

        <Link
          to={user ? "/chat" : "/login?redirect=/chat"}
          className="px-5 py-2.5 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm transition-all whitespace-nowrap flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat with Baker</span>
        </Link>
      </section>

      {/* 7. LOCATION, TIMINGS & OUTLET CONTACT */}
      <section className="bg-white rounded-3xl p-8 border border-[#dac2b6]/40 shadow-warm-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#855300]">
            <MapPin className="w-4 h-4 text-[#fea619]" />
            <span>Sangola, Solapur District, Maharashtra</span>
          </div>
          <h3 className="font-headline font-extrabold text-2xl text-[#1b1c1c]">
            Visit KrishnaArjun Bakers & Outlet
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Main Market Road, Near ST Stand, Sangola, Solapur District, Maharashtra 413307
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-gray-700">
            <span className="flex items-center gap-1.5 bg-[#fcf9f8] px-3 py-2 rounded-xl border border-[#f0eded]">
              <Clock className="w-4 h-4 text-[#8b4513]" />
              06:00 AM – 10:00 PM Daily
            </span>
            <a
              href="tel:9876543210"
              className="flex items-center gap-1.5 bg-[#fcf9f8] hover:bg-[#eae7e7] px-3 py-2 rounded-xl border border-[#f0eded] text-[#8b4513]"
            >
              <Phone className="w-4 h-4" />
              +91 98765 43210
            </a>
          </div>
        </div>

        <div className="bg-[#fffbf5] p-6 rounded-2xl border border-[#fea619]/40 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-2xl mx-auto shadow-warm-sm">
            🥖
          </div>
          <h4 className="font-headline font-bold text-base text-[#1b1c1c]">
            Ready to order fresh morning bakery batches?
          </h4>
          <p className="text-xs text-gray-500">
            Sign in with email to reserve your bread, pav, and cakes.
          </p>
          <button
            onClick={() => handleOrderNow()}
            className="w-full py-3 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm transition-all"
          >
            {user ? 'Go to Storefront & Order' : 'Sign In with Email to Order'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
