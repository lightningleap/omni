import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId: string;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean; // Added UI State
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDrawerOpen: (isOpen: boolean) => void; // Added UI Toggle
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) =>
        set((state) => {
          // Robust Deduplication: Check if item already exists by ID
          const existingItemIndex = state.items.findIndex((i) => i.id === item.id);
          
          if (existingItemIndex > -1) {
            const nextItems = [...state.items];
            nextItems[existingItemIndex] = {
              ...nextItems[existingItemIndex],
              quantity: nextItems[existingItemIndex].quantity + item.quantity
            };
            return {
              items: nextItems,
              isDrawerOpen: true,
            };
          }
          
          return { items: [...state.items, item], isDrawerOpen: true };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i // Prevents going below 1
          ),
        })),

      clearCart: () => set({ items: [] }),
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
    }),
    {
      name: 'unrwly-cart-storage',
      // partialize ensures we only save the items to localStorage, not the drawer's open/closed state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
