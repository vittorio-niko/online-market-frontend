import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    useGetOrderWithOrderItemsByIdAdmin,
    useUpdateOrderDeliveryStatus,
    useTriggerOrderPaymentAdmin
} from '@/api/generated/admin-order-service';
import { generatePaymentId } from '@/utils/payment';
import {
    OrderResponseDtoDeliveryStatus,
    OrderResponseDtoPaymentStatus
} from '@/api/generated/admin-order-service.schemas';

interface AdminOrderDetailsPanelProps {
    orderId: number;
    onClose: () => void;
}

export default function OrderDetailsPanel({ orderId, onClose }: AdminOrderDetailsPanelProps) {
    const [activeTab, setActiveTab] = useState<'INFO' | 'ITEMS'>('INFO');

    // Fetch order details with auto-refresh
    const { data: response, refetch } = useGetOrderWithOrderItemsByIdAdmin(orderId, {
        query: { refetchInterval: 2500 }
    });

    const order = response?.status === 200 ? response.data : null;

    const { mutateAsync: updateDelivery } = useUpdateOrderDeliveryStatus();
    const { mutateAsync: triggerPayment } = useTriggerOrderPaymentAdmin();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            await updateDelivery({ id: orderId, params: { deliveryStatus: e.target.value as any }});
            await refetch();
        } catch (error) {
            console.error(error);
            alert('Failed to update delivery status.');
        }
    };

    const handleTriggerPayment = async () => {
        try {
            const paymentId = generatePaymentId();
            await triggerPayment({ orderId, data: { paymentId } });
            await refetch();
        } catch (error) {
            console.error(error);
            alert('Failed to trigger payment');
        }
    };

    if (!order) return null;

    const inputStyle = "w-full p-4 border border-surface-200 rounded-2xl outline-none focus:border-surface-900 focus:ring-4 focus:ring-surface-900/10 transition-all duration-200 bg-white text-sm font-medium";

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-900/60 backdrop-blur-md p-4 md:p-8 animate-fade-in" onClick={onClose}>
            <div
                className="bg-surface-50 w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col rounded-[2.5rem] overflow-hidden border border-surface-200 transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div className="bg-white px-8 py-6 border-b border-surface-200 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-surface-900">Order #{order.id}</h2>
                        <p className="text-sm text-surface-500 mt-1">User ID: <span className="font-mono text-surface-600 bg-surface-100 px-2 py-0.5 rounded ml-1">{order.userId}</span></p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Total Amount</p>
                            <p className="text-2xl font-black text-primary-600">${order.totalPrice?.toFixed(2)}</p>
                        </div>
                        <div className="w-px h-8 bg-surface-200 mx-2"></div>
                        <div className="text-xs font-bold text-surface-400 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Live Sync
                        </div>
                        <button onClick={onClose} className="p-3 text-surface-400 hover:text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors ml-2">✕</button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white px-8 border-b border-surface-200">
                    <nav className="flex gap-8">
                        {(['INFO', 'ITEMS'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors ${
                                    activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
                                }`}
                            >
                                {tab === 'INFO' ? 'Order Details' : `Order Items (${order.orderItems?.length || 0})`}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">

                    {/* INFO TAB */}
                    {activeTab === 'INFO' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-surface-200 shadow-sm">
                                <h3 className="font-bold text-surface-900 mb-6 text-lg">Status Management</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-3 ml-1">Delivery Status</label>
                                        <select
                                            value={order.deliveryStatus}
                                            onChange={handleStatusChange}
                                            className={`${inputStyle} cursor-pointer hover:border-surface-300`}
                                        >
                                            <option value={OrderResponseDtoDeliveryStatus.PROCESSING}>PROCESSING</option>
                                            <option value={OrderResponseDtoDeliveryStatus.SHIPPED}>SHIPPED</option>
                                            <option value={OrderResponseDtoDeliveryStatus.DELIVERED}>DELIVERED</option>
                                            <option value={OrderResponseDtoDeliveryStatus.COMPLETED}>COMPLETED</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-3 ml-1">Payment Status</label>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-5 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider border ${
                                                order.paymentStatus === OrderResponseDtoPaymentStatus.PAID ? 'bg-green-50 text-green-700 border-green-200' :
                                                    order.paymentStatus === OrderResponseDtoPaymentStatus.FAILED ? 'bg-red-50 text-red-700 border-red-200' :
                                                        order.paymentStatus === OrderResponseDtoPaymentStatus.PENDING ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                            'bg-surface-100 text-surface-700 border-surface-200'
                                            }`}>
                                                {order.paymentStatus}
                                            </span>

                                            {order.paymentStatus !== OrderResponseDtoPaymentStatus.PAID && (
                                                <button
                                                    onClick={handleTriggerPayment}
                                                    disabled={order.paymentStatus === OrderResponseDtoPaymentStatus.PENDING}
                                                    className={`text-sm font-bold px-6 py-4 rounded-2xl transition-all shadow-lg ${
                                                        order.paymentStatus === OrderResponseDtoPaymentStatus.PENDING
                                                            ? 'bg-surface-200 text-surface-400 cursor-not-allowed shadow-none'
                                                            : 'bg-surface-900 text-white hover:bg-black active:scale-95'
                                                    }`}
                                                >
                                                    {order.paymentStatus === OrderResponseDtoPaymentStatus.PENDING ? 'Processing...' :
                                                        order.paymentStatus === OrderResponseDtoPaymentStatus.FAILED ? 'Retry Payment' : 'Trigger Pay'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-surface-200 shadow-sm">
                                <h3 className="font-bold text-surface-900 mb-6 text-lg">Metadata</h3>
                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <span className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Created At</span>
                                        <span className="font-semibold text-surface-900 bg-surface-50 px-4 py-2 rounded-xl border border-surface-100 block">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Last Updated</span>
                                        <span className="font-semibold text-surface-900 bg-surface-50 px-4 py-2 rounded-xl border border-surface-100 block">
                                            {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">User Auth ID (System Identifier)</span>
                                        <span className="font-mono text-sm text-surface-600 bg-surface-100 px-5 py-4 rounded-2xl border border-surface-200 break-all block">
                                            {order.userId || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ITEMS TAB */}
                    {activeTab === 'ITEMS' && (
                        <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden animate-fade-in">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-50 text-surface-600 font-bold border-b border-surface-200">
                                <tr>
                                    <th className="p-6">Item ID</th>
                                    <th className="p-6">Product Name</th>
                                    <th className="p-6">Unit Price</th>
                                    <th className="p-6 text-center">Quantity</th>
                                    <th className="p-6 text-right">Subtotal</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-200">
                                {order.orderItems?.map(item => (
                                    <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="p-6 font-mono text-surface-500">#{item.itemId}</td>
                                        <td className="p-6 font-bold text-surface-900">{item.itemName}</td>
                                        <td className="p-6 text-surface-600 font-medium">${item.itemPrice?.toFixed(2)}</td>
                                        <td className="p-6 text-center font-black text-surface-900 bg-surface-50/50">x{item.quantity}</td>
                                        <td className="p-6 text-right font-black text-primary-600 text-base">
                                            ${((item.itemPrice || 0) * (item.quantity || 0)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {(!order.orderItems || order.orderItems.length === 0) && (
                                    <tr><td colSpan={5} className="p-12 text-center text-surface-500">No items found in this order.</td></tr>
                                )}
                                </tbody>
                                <tfoot className="bg-surface-50 border-t border-surface-200">
                                <tr>
                                    <td colSpan={4} className="p-6 text-right font-black text-surface-500 uppercase tracking-widest text-xs">Final Total</td>
                                    <td className="p-6 text-right font-black text-surface-900 text-2xl">${order.totalPrice?.toFixed(2)}</td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}