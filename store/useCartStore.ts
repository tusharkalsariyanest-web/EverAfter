import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  gownId: number;
  name: string;
  price: number; // Stored as a pure number for easy math
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (gownId: number) => void;
  updateQuantity: (gownId: number, quantity: number) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false, // Controls whether the slide-out drawer is visible
      
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.gownId === newItem.gownId);
        
        if (existingItem) {
          // If already in cart, just increase quantity
          set({
            items: currentItems.map((i) =>
              i.gownId === newItem.gownId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          // If new, add to cart with quantity 1
          set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
        }
        // Magically open the drawer so the user sees the item was added!
        get().openCart(); 
      },
      
      removeItem: (gownId) => set({ items: get().items.filter((i) => i.gownId !== gownId) }),
      
      updateQuantity: (gownId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(gownId);
          return;
        }
        set({
          items: get().items.map((i) => (i.gownId === gownId ? { ...i, quantity } : i)),
        });
      },
      
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'everafter-cart', // This is the key used in localStorage
    }
  )
);