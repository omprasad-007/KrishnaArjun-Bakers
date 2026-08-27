import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { Search, ShoppingBag, Plus, Minus, Filter, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prods || []);
      setCategories(['All', ...(cats || [])]);
    } catch (err) {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAvailable = onlyAvailable ? (p.is_available && p.quantity > 0) : true;
    return matchesCategory && matchesSearch && matchesAvailable;
  });

  const getQty = (prodId) => quantities[prodId] || 1;

  const handleQtyChange = (prodId, delta, maxStock) => {
    const current = getQty(prodId);
    const next = Math.max(1, Math.min(maxStock, current + delta));
    setQuantities((prev) => ({ ...prev, [prodId]: next }));
  };

  return (
    <div className="pb-24 pt-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Bakery Catalog
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Browse our full assortment of fresh bakery items, Chakote dealership products, and celebration cakes.
          </p>
        </div>

        <Link
          to="/bulk-orders"
          className="inline-flex items-center gap-1.5 bg-[#fea619] hover:bg-[#ffb95f] text-[#6c2f00] px-4 py-2 rounded-xl text-xs font-bold shadow-warm-sm transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Festival & Bulk Orders
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#dac2b6]/40 shadow-warm-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pav, bread, toast, cake, cookies..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          {/* Toggle Available Only */}
          <label className="flex items-center gap-2 px-3 py-2 border border-[#dac2b6]/60 rounded-xl bg-[#fcf9f8] cursor-pointer text-xs font-medium text-gray-700 hover:bg-white transition-all self-start sm:self-auto">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <span>Available in Stock Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#8b4513] text-white shadow-warm-sm'
                  : 'bg-[#f6f3f2] text-gray-600 hover:bg-[#eae7e7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-headline font-bold text-lg text-gray-800">No products found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search filters or category selection.</p>
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
                <div className="relative h-44 w-full bg-[#f6f3f2] overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-[#6c2f00] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {product.category}
                    </span>
                  </div>
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

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-headline font-bold text-base text-[#1b1c1c] group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description || "Freshly prepared daily in our bakery kitchen."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#f0eded] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 font-medium">Price</span>
                      <div className="font-headline font-extrabold text-lg text-[#6c2f00]">
                        ₹{product.price.toFixed(2)}
                        <span className="text-[10px] text-gray-500 font-normal"> / {product.unit}</span>
                      </div>
                    </div>

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

                  <button
                    disabled={isSoldOut}
                    onClick={() => addToCart(product, qty)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSoldOut
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#8b4513] hover:bg-[#6c2f00] text-white shadow-warm-sm hover:shadow-warm-md active:scale-98'
                    }`}
                  >
                    {isSoldOut ? (
                      <span>Sold Out</span>
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
    </div>
  );
};

export default ProductList;
