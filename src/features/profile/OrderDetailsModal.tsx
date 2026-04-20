import { useGetOrderWithOrderItemsById } from '@/api/generated/user-order-service';
import { X, Package, ReceiptText, Truck, CreditCard } from 'lucide-react';

interface OrderDetailsModalProps {
    orderId: number;
    onClose: () => void;
}

export function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
    const { data: response, isLoading } = useGetOrderWithOrderItemsById(orderId);
    const orderDetails = response?.status === 200 ? response.data : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in relative">
                {/* Header */}
                <div className="p-6 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-100 text-primary-600 p-2 rounded-xl">
                            <ReceiptText size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-surface-900">Order Details #{orderId}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-full transition-colors text-surface-400 hover:text-surface-900">
                        <X size={20} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        <p className="text-surface-500 font-medium">Loading order details...</p>
                    </div>
                ) : orderDetails ? (
                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100">
                                <div className="flex items-center gap-2 text-surface-400 mb-2">
                                    <Truck size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Delivery Status</span>
                                </div>
                                <p className="font-bold text-surface-900">{orderDetails.deliveryStatus}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100">
                                <div className="flex items-center gap-2 text-surface-400 mb-2">
                                    <CreditCard size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Payment Status</span>
                                </div>
                                <p className="font-bold text-surface-900">{orderDetails.paymentStatus}</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <h3 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-4">Purchased Items</h3>
                        <div className="space-y-3 mb-8">
                            {orderDetails.orderItems?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-4 rounded-xl border border-surface-100 hover:bg-surface-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-surface-100 p-2 rounded-lg text-surface-400">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-surface-900">{item.itemName}</p>
                                            <p className="text-xs text-surface-400">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-surface-900">${(item.itemPrice! * item.quantity!).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="pt-6 border-t border-surface-100 flex justify-between items-end">
                            <span className="font-bold text-surface-500">Order Total</span>
                            <span className="text-3xl font-black text-primary-600 tracking-tighter">
                                ${orderDetails.totalPrice?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-surface-500">Could not find order details.</div>
                )}
            </div>
        </div>
    );
}