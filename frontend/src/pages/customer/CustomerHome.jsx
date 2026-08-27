import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import {
  ShoppingBag,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Flame,
  Plus,
  Minus,
  Check
} from 'lucide-react';

export const CustomerHome = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const { addToCart, orderDate, setOrderDate } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(prodData || []);
      setCategories(['All', ...(catData || [])]);
    } catch (err) {
      toast.error("Failed to load bakery products. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getQty = (prodId) => quantities[prodId] || 1;

  const handleQtyChange = (prodId, delta, maxStock) => {
    const current = getQty(prodId);
    const next = Math.max(1, Math.min(maxStock, current + delta));
    setQuantities((prev) => ({ ...prev, [prodId]: next }));
  };

  const handleAddProduct = (product) => {
    const qty = getQty(product.id);
    addToCart(product, qty);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return (
    <div className="pb-24 pt-4 md:pt-6 space-y-8">
      {/* Hero Banner with Artisanal Theme */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6c2f00] via-[#8b4513] to-[#855300] text-white p-6 sm:p-10 shadow-warm-lg">
        {/* Background Decorative Pattern */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#fea619]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#fea619]/20 border border-[#fea619]/40 text-[#ffdbc9] px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Award className="w-4 h-4 text-[#fea619]" />
            <span>Sangola's Trusted Chakote Brand Dealer</span>
          </div>

          <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Fresh Bakes From Our Oven To Your Table
          </h1>

          <p className="text-sm sm:text-base text-[#ffdbc9] font-normal leading-relaxed">
            Order daily soft Ladi Pav, crispy Chakote Toast, buttery Khari, and celebration cakes. Freshly baked daily in Sangola.
          </p>

          {/* Quick Date Preference Picker */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-[#ffdbc9] font-medium">Baking For:</span>
            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-2xl backdrop-blur-md border border-white/20">
              <button
                onClick={() => setOrderDate(todayStr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderDate === todayStr ? 'bg-[#fea619] text-[#6c2f00] shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                Today's Fresh Batch
              </button>
              <button
                onClick={() => setOrderDate(tomorrowStr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderDate === tomorrowStr ? 'bg-[#fea619] text-[#6c2f00] shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                Tomorrow Morning
              </button>
            </div>
            
            <Link
              to="/bulk-orders"
              className="inline-flex items-center gap-1.5 bg-[#fea619] hover:bg-[#ffb95f] text-[#6c2f00] px-4 py-2 rounded-xl text-xs font-bold shadow-warm-sm transition-all ml-auto"
            >
              <Sparkles className="w-4 h-4" />
              Festival / Bulk Orders
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-[#1b1c1c] flex items-center gap-2">
            <span>Explore Fresh Categories</span>
            <span className="text-xs text-gray-500 font-normal">({filteredProducts.length} items)</span>
          </h2>
          <Link to="/products" className="text-xs font-semibold text-[#8b4513] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#8b4513] text-white shadow-warm-sm scale-105'
                  : 'bg-white text-gray-700 border border-[#dac2b6]/50 hover:bg-[#f6f3f2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-3">
                <div className="h-44 bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#dac2b6]/40 shadow-warm-sm">
            <div className="text-4xl mb-3">🥖</div>
            <h3 className="font-headline font-bold text-lg text-gray-800">No products found in this category</h3>
            <p className="text-xs text-gray-500 mt-1">Please check back later or explore other fresh categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const isSoldOut = !product.is_available || product.quantity <= 0;
              const isLowStock = !isSoldOut && product.quantity <= product.low_stock_threshold;
              const qty = getQty(product.id);

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-warm-sm hover:shadow-warm-md ${
                    isSoldOut ? 'border-gray-200 opacity-80' : 'border-[#dac2b6]/40 hover:border-primary/40'
                  }`}
                >
                  {/* Top Image Container */}
                  <div className="relative h-44 w-full bg-[#f6f3f2] overflow-hidden">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Chip Top Left */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-md text-[#6c2f00] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {product.category}
                      </span>
                    </div>

                    {/* Stock Status Badge Top Right */}
                    <div className="absolute top-3 right-3">
                      {isSoldOut ? (
                        <Badge variant="soldout" size="sm">SOLD OUT</Badge>
                      ) : isLowStock ? (
                        <Badge variant="warning" size="sm">Only {product.quantity} Left</Badge>
                      ) : (
                        <Badge variant="success" size="sm">In Stock</Badge>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-headline font-bold text-base text-[#1b1c1c] group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description || "Freshly baked with wholesome bakery ingredients."}
                      </p>
                    </div>

                    {/* Price and Quantity Controls */}
                    <div className="pt-2 border-t border-[#f0eded] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Price</span>
                        <div className="font-headline font-extrabold text-lg text-[#6c2f00]">
                          ₹{product.price.toFixed(2)}
                          <span className="text-[10px] text-gray-500 font-normal"> / {product.unit}</span>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      {!isSoldOut && (
                        <div className="flex items-center border border-[#dac2b6]/60 rounded-xl bg-[#fcf9f8] p-0.5">
                          <button
                            onClick={() => handleQtyChange(product.id, -1, product.quantity)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-gray-800">{qty}</span>
                          <button
                            onClick={() => handleQtyChange(product.id, 1, product.quantity)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      disabled={isSoldOut}
                      onClick={() => handleAddProduct(product)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isSoldOut
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#8b4513] hover:bg-[#6c2f00] text-white shadow-warm-sm hover:shadow-warm-md active:scale-98'
                      }`}
                    >
                      {isSoldOut ? (
                        <span>Currently Sold Out</span>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bakery Features / Chakote Quality Guarantee */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2b6]/40 shadow-warm-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">Daily Morning Bakes</h4>
              <p className="text-xs text-gray-500 mt-1">Baked fresh at 6:00 AM every day with high quality flour and authentic recipes.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6c2f00]/10 text-[#6c2f00] flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">Authorized Chakote Dealer</h4>
              <p className="text-xs text-gray-500 mt-1">Direct dealership ensuring genuine Chakote Bread, Toast, Khari, and Cookies.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#dcfce7] text-[#166534] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">Flexible Modifications</h4>
              <p className="text-xs text-gray-500 mt-1">Modify your order quantities anytime before the cutoff baking window.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerHome;
