import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  ShieldCheck
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOrderClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login?redirect=/home');
    }
  };

  return (
    <div className="space-y-16 pb-20 -mt-2">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8b4513] via-[#6c2f00] to-[#421d00] text-white p-8 sm:p-12 md:p-16 shadow-warm-lg">
        {/* Background decorative glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fea619]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ffc29f]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#fea619]/20 border border-[#fea619]/40 text-[#ffdbc9] px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
            <Award className="w-4 h-4 text-[#fea619]" />
            <span>Authorized Chakote Brand Dealer • Sangola</span>
          </div>

          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
            Artisanal Bakes & Morning Warmth
          </h1>

          <p className="text-sm sm:text-base text-[#ffdbc9] leading-relaxed max-w-xl">
            From oven-fresh soft Ladi Pav at 06:00 AM to nutritious Chakote Milk Bread, crispy cardamom toast, and celebratory cakes. Baked daily in Sangola with pure ingredients.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleOrderClick}
              className="px-6 py-3.5 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#6c2f00] font-headline font-extrabold text-xs sm:text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{user ? 'Order Fresh Bakes Now' : 'Sign In & Order Fresh Bakes'}</span>
            </button>

            <Link
              to="/products"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <span>Explore Bakery Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-md text-xs">
            <div>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-white block">06:00 AM</span>
              <span className="text-[#ffdbc9] text-[11px]">Daily Fresh Batch</span>
            </div>
            <div>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-white block">100%</span>
              <span className="text-[#ffdbc9] text-[11px]">Chakote Dealer Quality</span>
            </div>
            <div>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-white block">5000+</span>
              <span className="text-[#ffdbc9] text-[11px]">Sangola Happy Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Signature Categories Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#f0eded] pb-4">
          <div>
            <span className="text-xs font-extrabold text-[#855300] uppercase tracking-wider">Our Daily Oven Specialties</span>
            <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c] mt-1">
              Fresh Morning Bakes & Delicacies
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#8b4513] hover:text-[#6c2f00] flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-5 border border-[#dac2b6]/40 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
              <img
                src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600"
                alt="Fresh Ladi Pav"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-[#8b4513] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Daily 06:00 AM Batch
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#1b1c1c]">Fresh Ladi Pav</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              Fluffy, soft, authentic golden pav baked fresh daily morning. Ideal for Misal & Vada Pav.
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0eded]">
              <span className="font-headline font-bold text-sm text-[#6c2f00]">₹30.00 / pack</span>
              <button
                onClick={handleOrderClick}
                className="px-3 py-1.5 rounded-xl bg-[#fffbf5] hover:bg-[#8b4513] text-[#8b4513] hover:text-white border border-[#dac2b6] text-xs font-bold transition-all"
              >
                Order
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-5 border border-[#dac2b6]/40 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"
                alt="Chakote Milk Bread"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-[#15803d] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Chakote Brand
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#1b1c1c]">Chakote Premium Milk Bread</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              Nutritious, enriched soft sandwich bread with delicate sweetness and golden crust.
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0eded]">
              <span className="font-headline font-bold text-sm text-[#6c2f00]">₹45.00 / pack</span>
              <button
                onClick={handleOrderClick}
                className="px-3 py-1.5 rounded-xl bg-[#fffbf5] hover:bg-[#8b4513] text-[#8b4513] hover:text-white border border-[#dac2b6] text-xs font-bold transition-all"
              >
                Order
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-5 border border-[#dac2b6]/40 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
              <img
                src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600"
                alt="Crispy Toast"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-[#855300] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Elaichi Aroma
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#1b1c1c]">Crispy Elaichi Toast</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              Golden double-baked cardamom rusks made for morning chai sessions.
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0eded]">
              <span className="font-headline font-bold text-sm text-[#6c2f00]">₹50.00 / pack</span>
              <button
                onClick={handleOrderClick}
                className="px-3 py-1.5 rounded-xl bg-[#fffbf5] hover:bg-[#8b4513] text-[#8b4513] hover:text-white border border-[#dac2b6] text-xs font-bold transition-all"
              >
                Order
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-5 border border-[#dac2b6]/40 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600"
                alt="Truffle Cake"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-[#9333ea] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Custom Celebration
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#1b1c1c]">Chocolate Truffle Cake</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              Rich dark chocolate sponge layered with smooth chocolate ganache. Freshly crafted.
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0eded]">
              <span className="font-headline font-bold text-sm text-[#6c2f00]">₹380.00 / piece</span>
              <button
                onClick={handleOrderClick}
                className="px-3 py-1.5 rounded-xl bg-[#fffbf5] hover:bg-[#8b4513] text-[#8b4513] hover:text-white border border-[#dac2b6] text-xs font-bold transition-all"
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why KrishnaArjun Bakers */}
      <section className="bg-[#fcf9f8] rounded-3xl p-8 sm:p-12 border border-[#dac2b6]/40 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-[#855300] uppercase tracking-wider">The Sangola Tradition</span>
          <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Why Sangola Loves KrishnaArjun Bakers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#f0eded] shadow-warm-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold text-xl">
              🍞
            </div>
            <h4 className="font-headline font-bold text-base text-[#1b1c1c]">Fresh Daily Batch</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              We never sell yesterday's stock. All pav, breads, and rolls come straight from the oven every single morning.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#f0eded] shadow-warm-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold text-xl">
              🎉
            </div>
            <h4 className="font-headline font-bold text-base text-[#1b1c1c]">Festival & Bulk Catering</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Special large volume orders for Ganesh Chaturthi, Diwali Faral, weddings, and community religious events.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#f0eded] shadow-warm-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold text-xl">
              🔒
            </div>
            <h4 className="font-headline font-bold text-base text-[#1b1c1c]">Guaranteed Fresh Booking</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Place orders for tomorrow morning with guaranteed stock reservation and real-time live baking tracking.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Festival / Bulk Orders Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-[#fea619] via-[#f59e0b] to-[#8b4513] text-[#1b1c1c] p-8 sm:p-10 shadow-warm-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-extrabold uppercase bg-white/30 text-[#6c2f00] px-3 py-1 rounded-full">
            Special Event Bookings
          </span>
          <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-white">
            Planning a Festival, Wedding, or Large Event in Sangola?
          </h3>
          <p className="text-xs sm:text-sm text-white/90">
            Submit your bulk quantity request. We allocate dedicated oven batches and ensure timely morning packaging.
          </p>
        </div>

        <Link
          to="/bulk-orders"
          className="px-6 py-3.5 rounded-2xl bg-white text-[#6c2f00] font-headline font-extrabold text-xs sm:text-sm shadow-warm-md hover:bg-[#fffbf5] transition-all whitespace-nowrap active:scale-98"
        >
          Book Bulk / Festival Order
        </Link>
      </section>

      {/* 5. Bakery Location & Contact */}
      <section className="bg-white rounded-3xl p-8 border border-[#dac2b6]/40 shadow-warm-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#855300]">
            <MapPin className="w-4 h-4 text-[#fea619]" />
            <span>Sangola, Maharashtra</span>
          </div>
          <h3 className="font-headline font-extrabold text-2xl text-[#1b1c1c]">
            Visit Our Bakery & Dealer Outlet
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            KrishnaArjun Bakers & Chakote Dealer Outlet<br />
            Main Market Road, Near ST Stand, Sangola, Solapur District, Maharashtra 413307
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs font-bold text-gray-700">
            <span className="flex items-center gap-1.5 bg-[#fcf9f8] px-3 py-2 rounded-xl border border-[#f0eded]">
              <Clock className="w-4 h-4 text-[#8b4513]" />
              06:00 AM – 10:00 PM Daily
            </span>
            <span className="flex items-center gap-1.5 bg-[#fcf9f8] px-3 py-2 rounded-xl border border-[#f0eded]">
              <Phone className="w-4 h-4 text-[#8b4513]" />
              +91 98765 43210
            </span>
          </div>
        </div>

        <div className="bg-[#fffbf5] p-6 rounded-2xl border border-[#fea619]/40 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-2xl mx-auto shadow-warm-sm">
            🥖
          </div>
          <h4 className="font-headline font-bold text-base text-[#1b1c1c]">
            Ready to taste fresh bakery quality?
          </h4>
          <p className="text-xs text-gray-500">
            Log in to select your delivery date and reserve fresh morning bakes.
          </p>
          <button
            onClick={handleOrderClick}
            className="w-full py-3 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm transition-all"
          >
            {user ? 'Enter Home Storefront' : 'Sign In / Register to Order'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
