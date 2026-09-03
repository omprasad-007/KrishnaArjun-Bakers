import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  Boxes,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  ArrowUpDown,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Upload,
  Sparkles
} from 'lucide-react';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bread & Pav',
    description: '',
    price: 40.0,
    unit: 'packet',
    quantity: 50,
    low_stock_threshold: 15,
    image_url: '',
    is_available: true,
    available_from: '06:00 AM',
    available_until: '09:00 PM',
  });

  // Stock Quick-Adjust Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [stockChangeQty, setStockChangeQty] = useState(0);
  const [stockChangeReason, setStockChangeReason] = useState('Fresh morning bake batch');

  // Camera & Gallery Refs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState('');

  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const prods = await api.getProducts();
      setProducts(prods || []);
      const cats = [...new Set(prods.map((p) => p.category))];
      setCategories(cats);
    } catch (err) {
      toast.error("Failed to load bakery products.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Bread & Pav',
      description: '',
      price: 40.0,
      unit: 'packet',
      quantity: 50,
      low_stock_threshold: 15,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
      is_available: true,
      available_from: '06:00 AM',
      available_until: '09:00 PM',
    });
    setImagePreview('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600');
    setProductModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      low_stock_threshold: product.low_stock_threshold,
      image_url: product.image_url || '',
      is_available: product.is_available,
      available_from: product.available_from || '06:00 AM',
      available_until: product.available_until || '09:00 PM',
    });
    setImagePreview(product.image_url || '');
    setProductModalOpen(true);
  };

  const handleOpenStockModal = (product) => {
    setSelectedStockProduct(product);
    setStockChangeQty(20);
    setStockChangeReason('Fresh morning bake batch');
    setStockModalOpen(true);
  };

  // Image File Compression & Upload Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress using HTML5 Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(compressedDataUrl);
        setFormData((prev) => ({ ...prev, image_url: compressedDataUrl }));
        toast.success("Photo captured and attached!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        toast.success(`Product '${formData.name}' updated.`);
      } else {
        await api.createProduct(formData);
        toast.success(`Product '${formData.name}' created and stock initialized.`);
      }
      setProductModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedStockProduct) return;

    try {
      await api.updateProductStock(selectedStockProduct.id, stockChangeQty, stockChangeReason);
      toast.success(`Stock updated for '${selectedStockProduct.name}'.`);
      setStockModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to adjust stock.");
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (window.confirm(`Are you sure you want to delete '${name}'? This cannot be undone.`)) {
      try {
        await api.deleteProduct(productId);
        toast.success(`'${name}' deleted.`);
        loadProducts();
      } catch (err) {
        toast.error(err.message || "Failed to delete product.");
      }
    }
  };

  const handleSeedSampleProducts = async () => {
    try {
      setLoading(true);
      toast.info("Populating fresh bakery products into database...");
      await api.seedInitialBakeryData();
      localStorage.setItem('ka_catalog_initialized', 'true');
      toast.success("Sample bakery products populated successfully!");
      await loadProducts();
    } catch (err) {
      toast.error(err?.message || "Failed to populate products. Please check Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Inputs for Camera & Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleImageFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Product Catalog & Pricing
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage bakery items, capture photos via camera/gallery, set prices, and update stock thresholds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadProducts}
            className="p-2.5 rounded-2xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSeedSampleProducts}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-[#fea619] bg-[#fff5ee] hover:bg-[#ffdbc9] text-[#6c2f00] font-headline font-bold text-xs shadow-warm-sm transition-all"
            title="Load initial sample bakery products into Firestore"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fea619]" />
            <span>Load Sample Items</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-3xl p-4 border border-[#dac2b6]/40 shadow-warm-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#8b4513] text-white shadow-warm-sm'
                : 'bg-[#f6f3f2] text-gray-600 hover:bg-[#eae7e7]'
            }`}
          >
            All Categories ({products.length})
          </button>
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

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading bakery products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No products found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fcf9f8] border-b border-[#f0eded] text-gray-700 font-headline font-bold">
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f3f2]">
                {filteredProducts.map((p) => {
                  const isSoldOut = !p.is_available || p.quantity <= 0;
                  const isLow = p.quantity <= p.low_stock_threshold && !isSoldOut;

                  return (
                    <tr key={p.id} className="hover:bg-[#fffbf5]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200'}
                            alt={p.name}
                            className="w-11 h-11 rounded-2xl object-cover border border-[#dac2b6]/40 flex-shrink-0"
                          />
                          <div>
                            <span className="font-headline font-bold text-sm text-[#1b1c1c] block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Unit: {p.unit} • Threshold: {p.low_stock_threshold}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 font-medium">{p.category}</td>

                      <td className="py-3.5 px-4 font-headline font-bold text-sm text-[#6c2f00]">
                        ₹{Number(p.price).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isSoldOut ? 'text-[#dc2626]' : isLow ? 'text-[#d97706]' : 'text-gray-900'
                            }`}
                          >
                            {p.quantity} {p.unit}s
                          </span>
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            className="p-1 rounded-lg border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-gray-600 text-[10px] flex items-center gap-1 font-medium"
                            title="Quick Adjust Stock"
                          >
                            <ArrowUpDown className="w-3 h-3 text-[#8b4513]" />
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isSoldOut ? (
                          <Badge variant="danger" size="sm">
                            SOLD OUT
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="sm">
                            LOW STOCK ({p.quantity})
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            IN STOCK
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 rounded-xl border border-[#dac2b6]/60 hover:bg-[#f6f3f2] text-gray-700"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 rounded-xl border border-[#fee2e2] bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626]"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? `Edit '${editingProduct.name}'` : 'Add New Bakery Product'}
        subtitle="Specify product details, price, inventory limits, and upload photo via camera/gallery."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chakote Special Butter Pav"
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
              >
                <option value="Bread & Pav">Bread & Pav</option>
                <option value="Toast & Khari">Toast & Khari</option>
                <option value="Snacks & Rolls">Snacks & Rolls</option>
                <option value="Cakes & Pastries">Cakes & Pastries</option>
                <option value="Cookies & Biscuits">Cookies & Biscuits</option>
                <option value="Festival Specials">Festival Specials</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Unit of Measurement *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
              >
                <option value="packet">Packet</option>
                <option value="piece">Piece (Cake/Roll)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="box">Box</option>
                <option value="tray">Tray (Pav bulk)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Low Stock Limit *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 10 })}
                className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Photo Capture & Upload Box */}
          <div className="p-3.5 bg-[#fcf9f8] rounded-2xl border border-[#dac2b6]/60 space-y-3">
            <label className="block font-bold text-gray-700">Product Photo (Camera or Gallery)</label>

            {/* Photo Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8b4513] text-white font-bold text-xs hover:bg-[#6c2f00] shadow-warm-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take Photo (Camera)</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#dac2b6] text-[#6c2f00] font-bold text-xs hover:bg-[#f6f3f2] shadow-warm-sm transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload from Gallery</span>
              </button>
            </div>

            {/* Preview Box */}
            {imagePreview && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#f0eded]">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-16 h-16 rounded-xl object-cover border border-[#dac2b6]/40"
                />
                <div className="flex-1 overflow-hidden">
                  <span className="text-[10px] font-bold text-green-700 block">✓ Photo Ready</span>
                  <span className="text-[9px] text-gray-400 truncate block">Will be saved with product</span>
                </div>
              </div>
            )}

            <div>
              <span className="text-[10px] text-gray-400 block mb-1">Or paste an Image URL directly:</span>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Product Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Freshly baked with pure ingredients, soft crust..."
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
            />
          </div>

          <div className="pt-4 border-t border-[#f0eded] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setProductModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Quick-Adjust Modal */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title={`Adjust Stock: ${selectedStockProduct?.name}`}
        subtitle={`Current quantity: ${selectedStockProduct?.quantity} ${selectedStockProduct?.unit}s`}
      >
        <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Quantity to Add or Remove (Negative to reduce) *
            </label>
            <input
              type="number"
              required
              value={stockChangeQty}
              onChange={(e) => setStockChangeQty(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-mono font-bold text-base text-center"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              New Total will be: <strong>{Number(selectedStockProduct?.quantity || 0) + Number(stockChangeQty)}</strong> {selectedStockProduct?.unit}s
            </p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Reason / Batch Reference *</label>
            <input
              type="text"
              required
              value={stockChangeReason}
              onChange={(e) => setStockChangeReason(e.target.value)}
              placeholder="e.g. Morning 06:00 AM Fresh Oven Batch"
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white font-medium"
            />
          </div>

          <div className="pt-4 border-t border-[#f0eded] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStockModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold shadow-warm-sm"
            >
              Save Stock Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
