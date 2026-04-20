import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useCreateCashOnDeliveryOrder, useCreatePrepaidOrder } from '@/api/generated/user-order-service';
import { generatePaymentId } from '@/utils/payment';
import { ShoppingBag, Trash2, ChevronRight } from 'lucide-react';

const CartItemRow = ({ item }: { item: CartItem }) => {
    const { updateQuantity, removeItem } = useCartStore();
    return (
        <div className="flex items-center gap-4 p-5 bg-white border border-surface-200 rounded-[1.5rem] mb-3 shadow-sm hover:border-primary-200 transition-all">
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-surface-900 truncate">{item.name}</h4>
                <p className="text-primary-600 font-bold">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center bg-surface-50 rounded-xl p-1 border border-surface-200">
                    <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all">-</button>
                    <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all">+</button>
                </div>
                <p className="hidden sm:block font-black text-surface-900 w-24 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item.itemId)} className="text-surface-400 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
        </div>
    );
};

export default function CartPage() {
    const { items, clearCart, getTotalPrice } = useCartStore();
    const navigate = useNavigate();
    const [orderType, setOrderType] = useState<'COD' | 'PREPAID'>('PREPAID');
    const totalSum = getTotalPrice();

    const { mutateAsync: createCOD } = useCreateCashOnDeliveryOrder();
    const { mutateAsync: createPrepaid } = useCreatePrepaidOrder();

    const handleCheckout = async () => {
        try {
            const orderItemsDto = items.map(i => ({ itemId: i.itemId, quantity: i.quantity }));
            if (orderType === 'COD') await createCOD({ data: { orderItemsDto } });
            else await createPrepaid({ data: { paymentId: generatePaymentId(), orderItemsDto } });
            clearCart();
            alert('Order placed!');
            navigate('/profile');
        } catch (error: any) { alert(error.message); }
    };

    if (items.length === 0) return <div className="text-center py-40"><ShoppingBag className="mx-auto mb-4 text-surface-200" size={64} /><h2 className="text-2xl font-bold text-surface-400">Cart is empty</h2></div>;

    return (
        <div className="max-w-6xl mx-auto px-4">
            <Helmet><title>My Cart | Market Local</title></Helmet>
            <h1 className="text-4xl font-black text-surface-900 mb-10 tracking-tight">My Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">{items.map(item => <CartItemRow key={item.itemId} item={item} />)}</div>
                <div className="lg:col-span-4">
                    <div className="bg-white border border-surface-200 p-8 rounded-[2rem] shadow-premium sticky top-24">
                        <h3 className="text-xl font-bold mb-6">Summary</h3>
                        <div className="flex justify-between items-end mb-8 border-t border-surface-100 pt-6">
                            <span className="font-bold text-surface-500 uppercase text-xs tracking-widest">Total to pay</span>
                            <span className="text-3xl font-black text-primary-600 tracking-tighter">${totalSum.toFixed(2)}</span>
                        </div>
                        <div className="space-y-2 mb-8">
                            <button onClick={() => setOrderType('PREPAID')} className={`w-full p-4 rounded-2xl border-2 font-bold text-sm flex justify-between items-center ${orderType === 'PREPAID' ? 'border-primary-600 bg-primary-50/50' : 'border-surface-100 text-surface-400'}`}>Pay Now {orderType === 'PREPAID' && <ChevronRight size={16}/>}</button>
                            <button onClick={() => setOrderType('COD')} className={`w-full p-4 rounded-2xl border-2 font-bold text-sm flex justify-between items-center ${orderType === 'COD' ? 'border-primary-600 bg-primary-50/50' : 'border-surface-100 text-surface-400'}`}>Cash on Delivery {orderType === 'COD' && <ChevronRight size={16}/>}</button>
                        </div>
                        <button onClick={handleCheckout} className="w-full bg-surface-900 text-white font-bold py-5 rounded-2xl hover:bg-primary-600 transition-all shadow-xl active:scale-95">Complete Order</button>
                    </div>
                </div>
            </div>
        </div>
    );
}