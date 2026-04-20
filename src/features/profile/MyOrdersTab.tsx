import { useState } from 'react';
import { useGetMyOrders, useSoftDeleteMyOrderById, useTriggerOrderPayment } from '@/api/generated/user-order-service';
import { generatePaymentId } from '@/utils/payment';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Package, Trash2 } from "lucide-react";
import { OrderSummaryResponseDtoDeliveryStatus, OrderSummaryResponseDtoPaymentStatus } from '@/api/generated/user-order-service.schemas';

export default function MyOrdersTab() {
    const { data: response, refetch } = useGetMyOrders({ page: 0, size: 20, sort: ['id,desc'] });
    const { mutateAsync: deleteOrder } = useSoftDeleteMyOrderById();
    const { mutateAsync: payOrder } = useTriggerOrderPayment();

    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const orders = response?.status === 200 ? response.data : null;

    const handleSoftDelete = async (id: number) => {
        if (confirm('Are you sure you want to remove this order from your history?')) {
            try {
                await deleteOrder({ id });
                await refetch();
            } catch (error) {
                alert('Failed to delete the order record.');
            }
        }
    };

    const handlePay = async (orderId: number) => {
        try {
            const paymentId = generatePaymentId();
            await payOrder({ orderId, data: { paymentId } });
            alert('Payment initiated successfully!');
            await refetch();
        } catch (error) {
            alert('Failed to initiate payment.');
        }
    };

    return (
        <div className="bg-white border border-surface-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-2xl font-black text-surface-900 mb-8 tracking-tight">Order History</h3>

            <div className="space-y-4">
                {orders?.content?.map(order => (
                    <div key={order.id} className="border border-surface-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-primary-200 transition-all hover:shadow-lg hover:shadow-surface-100 group">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-1">Order ID: #{order.id}</p>
                            <p className="font-black text-surface-900 text-2xl tracking-tighter mb-3">${order.totalPrice?.toFixed(2)}</p>

                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-surface-100 text-surface-600 text-[10px] rounded-full font-bold uppercase tracking-wider">
                                    {order.deliveryStatus}
                                </span>
                                <span className={`px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${order.paymentStatus === OrderSummaryResponseDtoPaymentStatus.PAID ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setSelectedOrderId(order.id!)}
                                className="flex-1 md:flex-none border-2 border-surface-100 hover:border-surface-200 text-surface-600 hover:text-surface-900 px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                            >
                                Details
                            </button>

                            {/* Pay Now Button Logic */}
                            {order.paymentStatus !== OrderSummaryResponseDtoPaymentStatus.PAID && (
                                <button
                                    onClick={() => handlePay(order.id!)}
                                    disabled={order.paymentStatus === OrderSummaryResponseDtoPaymentStatus.PENDING}
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg 
                                        ${order.paymentStatus === OrderSummaryResponseDtoPaymentStatus.PENDING
                                        ? 'bg-surface-200 text-surface-400 cursor-not-allowed shadow-none'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100'}`}
                                >
                                    {order.paymentStatus === OrderSummaryResponseDtoPaymentStatus.PENDING ? 'Processing...' : 'Pay Now'}
                                </button>
                            )}

                            {/* Soft Delete Button Logic */}
                            {order.deliveryStatus === OrderSummaryResponseDtoDeliveryStatus.COMPLETED &&
                                order.paymentStatus === OrderSummaryResponseDtoPaymentStatus.PAID && (
                                    <button
                                        onClick={() => handleSoftDelete(order.id!)}
                                        className="p-3 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                        </div>
                    </div>
                ))}

                {(!orders?.content || orders.content.length === 0) && (
                    <div className="text-center py-16 bg-surface-50 rounded-[2rem] border border-dashed border-surface-200">
                        <Package className="mx-auto mb-4 text-surface-300" size={48} />
                        <p className="text-surface-500 font-medium">You haven't placed any orders yet.</p>
                    </div>
                )}
            </div>

            {selectedOrderId && (
                <OrderDetailsModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
        </div>
    );
}