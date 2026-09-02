"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: any) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  checkoutUrl: string | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize cart from localStorage (static persist)
  useEffect(() => {
    const savedCart = localStorage.getItem('unrwly-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('unrwly-cart', JSON.stringify(items));
  }, [items]);

  const addItem = async (item: any) => {
    console.log("Mock Add Item:", item);
    setIsLoading(true);
    // Generic add logic
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsDrawerOpen(true);
    setIsLoading(false);
  };

  const removeItem = async (id: string) => {
    console.log("Mock Remove Item:", id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    console.log("Mock Update Quantity:", id, quantity);
    if (quantity < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('unrwly-cart');
  };

  const subtotal = items.reduce((total, item) => {
    const priceValue = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return total + priceValue * item.quantity;
  }, 0);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      subtotal, 
      itemCount,
      checkoutUrl: null, // No Shopify checkout URL
      isDrawerOpen,
      setIsDrawerOpen,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
