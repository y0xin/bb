import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

const PROMO_CODES: Record<string, number> = {
  'SALE10': 10,
  'SALE20': 20,
  'WELCOME': 15,
  'VIP50': 50,
};

interface CartStore {
  items: CartItem[];
  promoCode: string | null;
  discount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  getTotalPrice: () => number;
  getDiscountedPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discount: 0,

      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [], promoCode: null, discount: 0 }),

      applyPromoCode: (code: string) => {
        const upperCode = code.toUpperCase().trim();
        if (PROMO_CODES[upperCode]) {
          set({ promoCode: upperCode, discount: PROMO_CODES[upperCode] });
          return true;
        }
        return false;
      },

      removePromoCode: () => set({ promoCode: null, discount: 0 }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getDiscountedPrice: () => {
        const total = get().getTotalPrice();
        const discount = get().discount;
        return total - (total * discount / 100);
      },
    }),
    { name: 'cart-storage' }
  )
);
