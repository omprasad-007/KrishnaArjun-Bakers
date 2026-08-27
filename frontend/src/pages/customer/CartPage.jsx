import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Info,
  CheckCircle2,
  FileText,
  Lock
} from 'lucide-react';

export const CartPage = () => {
  const {
    items,
    orderDate,
    setOrderDate,
    orderNotes,
    setOrderNotes,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItemsCount
  } = useCart();

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const handleCheckout = async () => {
    if (!user) {
      toast.info("Please sign in or create an account to place your bakery order.");
      navigate("/login?redirect=/cart");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        order_date: orderDate,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        notes: orderNotes,
      };

      const newOrder = await api.createOrder(payload, user);
      clearCart();

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fea619', '#8b4513', '#6c2f00', '#22c55e']
      });

      toast.success(`Order #${newOrder.order_number} placed successfully!`);
      navigate(`/orders/${newOrder.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#f6f3f2] flex items-center justify-center mx-auto text-4xl shadow-warm-sm">
          🥖
        </div>
        <h2 className="font-headline font-bold text-2xl text-[#1b1c1c]">Your bakery cart is empty</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Explore our fresh Sangola daily bakes, Chakote bread, crispy toast, and cakes to fill your cart.
        </p>
        <div className="pt-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#8b4513] hover:bg-[#6c2f00] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-warm-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Fresh Bakes</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
          Cart & Order Date Selection
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Select your required baking date and review your fresh bakery order items.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Date Selector + Items List */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Date Selection Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Calendar className="w-5 h-5 text-secondary" />
              <span>Select Required Baking & Delivery Date</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Today */}
              <button
                type="button"
                onClick={() => setOrderDate(todayStr)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  orderDate === todayStr
                    ? 'border-[#8b4513] bg-[#ffdbc9]/40 ring-2 ring-[#8b4513]/20'
                    : 'border-[#dac2b6]/50 hover:bg-[#f6f3f2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6c2f00]">Today's Batch</span>
                  {orderDate === todayStr && <CheckCircle2 className="w-4 h-4 text-[#8b4513]" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{todayStr}</p>
                <p className="text-[10px] text-[#855300] font-semibold mt-2">Ready in ~2 hours</p>
              </button>

              {/* Option 2: Tomorrow */}
              <button
                type="button"
                onClick={() => setOrderDate(tomorrowStr)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  orderDate === tomorrowStr
                    ? 'border-[#8b4513] bg-[#ffdbc9]/40 ring-2 ring-[#8b4513]/20'
                    : 'border-[#dac2b6]/50 hover:bg-[#f6f3f2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6c2f00]">Tomorrow Morning</span>
                  {orderDate === tomorrowStr && <CheckCircle2 className="w-4 h-4 text-[#8b4513]" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{tomorrowStr}</p>
                <p className="text-[10px] text-[#15803d] font-semibold mt-2">Fresh Morning 6 AM Bake</p>
              </button>

              {/* Option 3: Advance Date */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  orderDate !== todayStr && orderDate !== tomorrowStr
                    ? 'border-[#8b4513] bg-[#ffdbc9]/40 ring-2 ring-[#8b4513]/20'
                    : 'border-[#dac2b6]/50 hover:bg-[#f6f3f2]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#6c2f00]">Advance Date</span>
                </div>
                <input
                  type="date"
                  min={todayStr}
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full bg-white text-xs border border-[#dac2b6] rounded-xl px-2 py-1.5 focus:outline-none focus:border-secondary font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-[#fcf9f8] rounded-2xl border border-[#f0eded] flex items-start gap-2.5 text-xs text-[#54433a]">
              <Info className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>
                Order date locked to <strong>{orderDate}</strong>. Bakery inventory is checked in real-time.
              </span>
            </div>
          </div>

          {/* 2. Cart Items Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0eded] pb-3">
              <h3 className="font-headline font-bold text-lg text-[#1b1c1c]">
                Order Items ({totalItemsCount})
              </h3>
              <button
                onClick={clearCart}
                className="text-xs text-[#dc2626] hover:underline font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>

            <div className="divide-y divide-[#f6f3f2]">
              {items.map((item) => {
                const itemTotal = item.product.price * item.quantity;

                return (
                  <div key={item.product.id} className="py-4 flex items-center justify-between gap-4">
                    {/* Item Details */}
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-2xl object-cover bg-[#f6f3f2] flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-headline font-bold text-sm text-[#1b1c1c]">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          ₹{item.product.price.toFixed(2)} / {item.product.unit}
                        </p>
                        <span className="text-[10px] text-[#855300] font-semibold bg-[#fea619]/10 px-2 py-0.5 rounded-full">
                          {item.product.category}
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls + Total */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-[#dac2b6]/60 rounded-xl bg-[#fcf9f8] p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded] transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f0eded] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="font-headline font-bold text-sm text-[#6c2f00]">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-[#dc2626] p-1.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes for Bakery Kitchen */}
            <div className="pt-4 border-t border-[#f0eded] space-y-2">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-secondary" />
                <span>Special Instructions for KrishnaArjun Bakers:</span>
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Please pack in individual paper bags, add birthday name tag on cake, slice bread medium thickness..."
                rows={3}
                className="w-full p-3 rounded-2xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Order Summary & Checkout Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#dac2b6]/40 shadow-warm-sm space-y-6 sticky top-24">
            <h3 className="font-headline font-bold text-lg text-[#1b1c1c] border-b border-[#f0eded] pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Estimated Bakery Tax</span>
                <span className="font-semibold text-gray-800">₹0.00</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Packaging & Handling</span>
                <span className="font-semibold text-[#15803d]">FREE</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Date</span>
                <span className="font-bold text-[#6c2f00]">{orderDate}</span>
              </div>

              <div className="border-t border-[#f0eded] pt-3 flex items-center justify-between">
                <div>
                  <span className="font-headline font-extrabold text-sm text-[#1b1c1c]">Grand Total</span>
                  <p className="text-[10px] text-gray-500">Pay on pickup / delivery</p>
                </div>
                <span className="font-headline font-extrabold text-2xl text-[#6c2f00]">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Login Warning for Guests */}
            {!user && (
              <div className="p-3.5 bg-[#fffbf5] border border-[#fea619]/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#855300]">
                  <Lock className="w-4 h-4 text-[#fea619]" />
                  <span>Login Required to Place Order</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Please log in with your phone number to confirm your order and track baking progress.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to="/login?redirect=/cart"
                    className="flex-1 text-center py-2 bg-[#8b4513] hover:bg-[#6c2f00] text-white text-xs font-bold rounded-xl shadow-warm-sm transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register?redirect=/cart"
                    className="flex-1 text-center py-2 bg-white border border-[#dac2b6] text-gray-800 text-xs font-bold rounded-xl hover:bg-[#f6f3f2] transition-all"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Place Order CTA */}
            {user ? (
              <button
                disabled={loading}
                onClick={handleCheckout}
                className="w-full py-4 rounded-2xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span>Confirming Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <Link
                to="/login?redirect=/cart"
                className="w-full py-4 rounded-2xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 text-center"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In to Place Order</span>
              </Link>
            )}

            <div className="p-3 bg-[#fcf9f8] rounded-2xl text-[11px] text-gray-500 text-center">
              🔒 Safe & verified ordering direct from KrishnaArjun Bakers Sangola
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
