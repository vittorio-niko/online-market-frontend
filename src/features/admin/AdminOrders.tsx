import { useState } from 'react';
import {
    useGetOrders,
    useGetOrderWithOrderItemsByIdAdmin
} from '@/api/generated/admin-order-service';
import {
    GetOrdersDeliveryStatus,
    GetOrdersPaymentStatus,
    OrderResponseDtoPaymentStatus,
    OrderResponseDtoDeliveryStatus,
    OrderResponseDto
} from '@/api/generated/admin-order-service.schemas';
import OrderDetailsPanel from './components/OrderDetailsPanel';

export default function AdminOrders() {
    const [page, setPage] = useState(0);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const [searchUserId, setSearchUserId] = useState('');
    const [searchOrderId, setSearchOrderId] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState<GetOrdersDeliveryStatus | ''>('');
    const [paymentStatus, setPaymentStatus] = useState<GetOrdersPaymentStatus | ''>('');

    const { data: listResponse, isLoading: isListLoading, refetch: refetchList } = useGetOrders({
        userId: searchUserId || undefined,
        deliveryStatus: deliveryStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        page,
        size: 15,
        sort: ['id,desc']
    }, { query: { enabled: !searchOrderId } });

    const { data: singleResponse, isLoading: isSingleLoading } = useGetOrderWithOrderItemsByIdAdmin(
        Number(searchOrderId),
        { query: { enabled: !!searchOrderId && !isNaN(Number(searchOrderId)) } }
    );

    const isLoading = searchOrderId ? isSingleLoading : isListLoading;
    const pageData = searchOrderId ? null : (listResponse?.status === 200 ? listResponse.data : null);

    let orders: OrderResponseDto[] = [];
    if (searchOrderId) {
        if (singleResponse?.status === 200 && singleResponse.data) {
            orders = [singleResponse.data];
        }
    } else {
        orders = pageData?.content || [];
    }

    const handleFilterChange = () => setPage(0);

    const inputStyle = "w-full p-4 border border-surface-200 rounded-2xl outline-none focus:border-surface-900 focus:ring-4 focus:ring-surface-900/10 transition-all duration-200 bg-white text-sm font-medium";

    return (
        <div className="w-full space-y-6 relative">
            <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
                <h1 className="text-2xl font-bold text-surface-900">Manage Orders</h1>
                <p className="text-surface-500 text-sm mt-1">View, filter, and manage fulfillment for all system orders.</p>
            </div>

            {/* Controls Section: Search & Filters */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <input
                        type="text"
                        placeholder="Search by User ID..."
                        value={searchUserId}
                        onChange={(e) => { setSearchUserId(e.target.value); handleFilterChange(); }}
                        className={`${inputStyle} flex-1 min-w-[180px]`}
                        disabled={!!searchOrderId}
                    />
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={searchOrderId}
                        onChange={(e) => { setSearchOrderId(e.target.value); handleFilterChange(); }}
                        className={`${inputStyle} flex-1 min-w-[180px]`}
                    />
                    <select
                        value={deliveryStatus}
                        onChange={(e) => { setDeliveryStatus(e.target.value as any); handleFilterChange(); }}
                        className={`${inputStyle} cursor-pointer flex-1 min-w-[200px]`}
                        disabled={!!searchOrderId}
                    >
                        <option value="">All Delivery Statuses</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                    <select
                        value={paymentStatus}
                        onChange={(e) => { setPaymentStatus(e.target.value as any); handleFilterChange(); }}
                        className={`${inputStyle} cursor-pointer flex-1 min-w-[200px]`}
                        disabled={!!searchOrderId}
                    >
                        <option value="">All Payment Statuses</option>
                        <option value="INITIAL">INITIAL</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="FAILED">FAILED</option>
                    </select>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2 shrink-0 xl:justify-end">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || isLoading || !!searchOrderId}
                        className="px-4 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl disabled:opacity-50 text-sm font-bold transition-colors"
                    >
                        Prev
                    </button>
                    <span className="text-sm font-medium text-surface-600 px-2 whitespace-nowrap">
                        Page {searchOrderId ? 1 : page + 1}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={pageData?.last || isLoading || !!searchOrderId}
                        className="px-4 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl disabled:opacity-50 text-sm font-bold transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-surface-500 animate-pulse">Loading orders...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-surface-50 text-surface-600 font-medium border-b border-surface-200">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">User ID</th>
                                <th className="p-4">Total Price</th>
                                <th className="p-4">Delivery Status</th>
                                <th className="p-4">Payment Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-surface-500">#{order.id}</td>
                                    <td className="p-4 text-surface-900 font-medium">{order.userId}</td>
                                    <td className="p-4 font-bold text-primary-600">${order.totalPrice?.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                            order.deliveryStatus === OrderResponseDtoDeliveryStatus.DELIVERED ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                            order.paymentStatus === OrderResponseDtoPaymentStatus.PAID ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                        }`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedOrderId(order.id!)}
                                                className="px-4 py-2 border-2 border-surface-100 hover:border-surface-200 text-surface-700 hover:text-surface-900 rounded-xl text-xs font-bold transition-all"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-surface-500">
                                        No orders match your criteria.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Separated Panel Component */}
            {selectedOrderId && (
                <OrderDetailsPanel
                    orderId={selectedOrderId}
                    onClose={() => {
                        setSelectedOrderId(null);
                        if (!searchOrderId) refetchList();
                    }}
                />
            )}
        </div>
    );
}