import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: string;
  image: string;
  slug: string;
  rawPrice?: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (item) => {
        const { items } = get();
        const exists = items.find((i) => i.id === item.id);
        
        if (exists) {
          set({ items: items.filter((i) => i.id !== item.id) });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'unrwly-wishlist-storage',
    }
  )
);
