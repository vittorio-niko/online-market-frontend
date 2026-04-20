import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    itemId: number;
    quantity: number;
    price: number;
    name: string;
}

interface CartState {
    items: CartItem[];
    addItem: (itemId: number, quantity: number, price: number, name: string) => void;
    removeItem: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (itemId, quantity, price, name) => set((state) => {
                const existing = state.items.find(i => i.itemId === itemId);
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
                        )
                    };
                }
                return { items: [...state.items, { itemId, quantity, price, name }] };
            }),
            removeItem: (itemId) => set((state) => ({
                items: state.items.filter(i => i.itemId !== itemId)
            })),
            updateQuantity: (itemId, quantity) => set((state) => ({
                items: state.items.map(i =>
                    i.itemId === itemId ? { ...i, quantity: Math.max(1, quantity) } : i
                )
            })),
            clearCart: () => set({ items: [] }),
            getTotalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
            getTotalPrice: () => get().items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
        }),
        { name: 'cart-storage' }
    )
);