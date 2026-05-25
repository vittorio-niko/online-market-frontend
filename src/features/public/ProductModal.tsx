import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useGetItemById } from '@/api/generated/user-order-service';
import { X, Minus, Plus } from 'lucide-react';
import placeholderProductImage from "@/assets/product.png";

export const ProductModal = ({ id, onClose }: { id: number; onClose: () => void }) => {
    const { isAuthenticated } = useAuthStore();
    const addItem = useCartStore(state => state.addItem);
    const [quantity, setQuantity] = useState(1);
    const { data: response, isLoading } = useGetItemById(id);
    const item = response?.status === 200 ? response.data : null;

    const handleAddToCart = () => {
        if (item?.id) {
            addItem(item.id, quantity, item.price || 0, item.name || 'Product');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-all"><X className="w-5 h-5" /></button>
                {isLoading ? <div className="h-96 animate-pulse bg-surface-100" /> : (
                    <>
                        <div className="aspect-video bg-surface-50 flex items-center justify-center">
                            <img
                                src={ placeholderProductImage }
                                alt={ item?.name }
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-10">
                            <h2 className="text-3xl font-black text-surface-900 mb-2">{item?.name}</h2>
                            <p className="text-2xl font-bold text-primary-600 mb-8">${item?.price?.toFixed(2)}</p>
                            {isAuthenticated() ? (
                                <div className="flex gap-4">
                                    <div className="flex items-center bg-surface-100 rounded-2xl p-1">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Minus className="w-4 h-4" /></button>
                                        <span className="w-12 text-center font-bold">{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button onClick={handleAddToCart} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-200">
                                        Add to Cart • ${((item?.price || 0) * quantity).toFixed(2)}
                                    </button>
                                </div>
                            ) : <p className="text-center text-surface-500 font-medium py-4 bg-surface-50 rounded-2xl border border-dashed border-surface-200">Please sign in to order</p>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};