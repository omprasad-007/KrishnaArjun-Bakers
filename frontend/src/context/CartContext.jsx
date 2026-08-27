import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("ka_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Default order date to Tomorrow (standard bakery advance order practice) or Today
  const [orderDate, setOrderDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [orderNotes, setOrderNotes] = useState("");
  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem("ka_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product.is_available || product.quantity <= 0) {
      toast.error(`'${product.name}' is currently SOLD OUT.`);
      return;
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    if (existingIndex > -1) {
      const existingItem = items[existingIndex];
      const newQty = existingItem.quantity + quantity;

      if (newQty > product.quantity) {
        toast.warning(`Only ${product.quantity} units of '${product.name}' available in stock.`);
        const updated = [...items];
        updated[existingIndex] = { ...existingItem, quantity: product.quantity };
        setItems(updated);
        return;
      }

      const updated = [...items];
      updated[existingIndex] = { ...existingItem, quantity: newQty };
      setItems(updated);
      toast.success(`Updated '${product.name}' quantity to ${newQty}.`);
    } else {
      let finalQty = quantity;
      if (quantity > product.quantity) {
        toast.warning(`Only ${product.quantity} units available.`);
        finalQty = product.quantity;
      }
      setItems([...items, { product, quantity: finalQty }]);
      toast.success(`Added ${finalQty} × '${product.name}' to cart.`);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    let warningMsg = null;
    const updated = items.map((item) => {
      if (item.product.id === productId) {
        if (quantity > item.product.quantity) {
          warningMsg = `Only ${item.product.quantity} units available in stock.`;
          return { ...item, quantity: item.product.quantity };
        }
        return { ...item, quantity };
      }
      return item;
    });

    setItems(updated);
    if (warningMsg) {
      toast.warning(warningMsg);
    }
  };

  const removeFromCart = (productId) => {
    const item = items.find((i) => i.product.id === productId);
    setItems(items.filter((i) => i.product.id !== productId));
    if (item) {
      toast.info(`Removed '${item.product.name}' from cart.`);
    }
  };

  const clearCart = () => {
    setItems([]);
    setOrderNotes("");
  };

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        orderDate,
        setOrderDate,
        orderNotes,
        setOrderNotes,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
