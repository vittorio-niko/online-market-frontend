import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    useGetUserById,
    useGetUserCardsAdmin,
    useActivateUser,
    useDeactivateUser
} from '@/api/generated/admin-user-service';
import { useGetOrders } from '@/api/generated/admin-order-service';
import { useGetPaymentLogsByUserId } from '@/api/generated/admin-payment-service';

interface UserDetailsPanelProps {
    userId: number;
    onClose: () => void;
}

export default function UserDetailsPanel({ userId, onClose }: UserDetailsPanelProps) {
    const [activeTab, setActiveTab] = useState<'INFO' | 'ORDERS' | 'PAYMENTS'>('INFO');

    // Pagination states
    const [ordersPage, setOrdersPage] = useState(0);
    const [paymentsPage, setPaymentsPage] = useState(0);

    const { data: userResponse, refetch: refetchUser } = useGetUserById(userId);
    const user = userResponse?.status === 200 ? userResponse.data : null;
    const authId = user?.authId || '';

    const { data: cardsResponse } = useGetUserCardsAdmin(userId);
    const cards = cardsResponse?.status === 200 ? cardsResponse.data : null;

    // Added pagination and sort parameters
    const { data: ordersResponse } = useGetOrders(
        { userId: authId, page: ordersPage, size: 10, sort: ['id,desc'] },
        { query: { enabled: !!authId } }
    );
    const orders = ordersResponse?.status === 200 ? ordersResponse.data : null;

    // Added pagination and sort parameters
    const { data: paymentsResponse } = useGetPaymentLogsByUserId(
        authId,
        { page: paymentsPage, size: 10, sort: ['id,desc'] },
        { query: { enabled: !!authId } }
    );
    const payments = paymentsResponse?.status === 200 ? paymentsResponse.data : null;

    const { mutateAsync: activateUser } = useActivateUser();
    const { mutateAsync: deactivateUser } = useDeactivateUser();

    const handleToggleStatus = async () => {
        try {
            if (user?.active) {
                await deactivateUser({ id: userId });
            } else {
                await activateUser({ id: userId });
            }
            await refetchUser();
        } catch (error) {
            alert('Failed to update user status.');
        }
    };

    if (!user) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-900/60 backdrop-blur-md p-4 md:p-8" onClick={onClose}>
            <div
                className="bg-surface-50 w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col rounded-[2.5rem] animate-fade-in overflow-hidden border border-surface-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div className="bg-white px-8 py-6 border-b border-surface-200 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-surface-900">{user.name} {user.surname}</h2>
                        <p className="text-sm text-surface-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleStatus}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                user.active ? 'border border-surface-300 text-surface-700 hover:bg-surface-100' : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="w-px h-6 bg-surface-200 mx-1"></div>
                        <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors">✕</button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white px-8 border-b border-surface-200">
                    <nav className="flex gap-8">
                        {(['INFO', 'ORDERS', 'PAYMENTS'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-sm font-bold border-b-2 transition-colors ${
                                    activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
                                }`}
                            >
                                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
                    {/* INFO TAB */}
                    {activeTab === 'INFO' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
                                <h3 className="font-bold text-surface-900 mb-4">Profile Details</h3>
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <span className="block text-surface-500 mb-1">Date of Birth</span>
                                        <span className="font-semibold text-surface-900">{user.birthDate || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-surface-500 mb-1">Account Created</span>
                                        <span className="font-semibold text-surface-900">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-surface-500 mb-2">Auth ID (System Identifier)</span>
                                        <span className="font-mono text-xs text-surface-600 bg-surface-100 px-4 py-3 rounded-xl border border-surface-200 break-all block">
                                            {user.authId || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
                                <h3 className="font-bold text-surface-900 mb-4">Payment Cards ({cards?.length || 0}/5)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {cards?.map(card => (
                                        <div key={card.id} className="flex justify-between items-center p-4 bg-surface-50 border border-surface-200 rounded-xl">
                                            <div>
                                                <p className="font-mono font-bold text-surface-900">{card.maskedNumber}</p>
                                                <p className="text-xs text-surface-500 uppercase tracking-wider mt-0.5">{card.holder}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full font-bold ${card.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-surface-200 text-surface-700'}`}>
                                                {card.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    ))}
                                    {(!cards || cards.length === 0) && <p className="text-sm text-surface-500">No payment cards registered.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'ORDERS' && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4">
                                {orders?.content?.map(order => (
                                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-surface-900 text-lg">Order #{order.id}</p>
                                            <p className="text-sm text-surface-500 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-primary-600 text-xl">${order.totalPrice?.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mt-1">{order.deliveryStatus}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!orders?.content || orders.content.length === 0) && <p className="text-center text-surface-500 mt-8">No orders found.</p>}
                            </div>

                            {/* Orders Pagination */}
                            {orders && (orders.totalPages ?? 0) > 1 && (
                                <div className="flex justify-end items-center gap-2 mt-2">
                                    <button
                                        onClick={() => setOrdersPage(p => Math.max(0, p - 1))}
                                        disabled={ordersPage === 0}
                                        className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-xl disabled:opacity-50 text-sm font-bold transition-colors"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm font-medium text-surface-600 px-2">
                                        Page {ordersPage + 1}
                                    </span>
                                    <button
                                        onClick={() => setOrdersPage(p => p + 1)}
                                        disabled={orders.last}
                                        className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-xl disabled:opacity-50 text-sm font-bold transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PAYMENTS TAB */}
                    {activeTab === 'PAYMENTS' && (
                        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden flex flex-col">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-50 text-surface-600 border-b border-surface-200 font-bold">
                                <tr><th className="p-5">Order ID</th><th className="p-5">Amount</th><th className="p-5">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-surface-200">
                                {payments?.content?.map((payment, idx) => (
                                    <tr key={idx} className="hover:bg-surface-50 transition-colors">
                                        <td className="p-5 font-mono text-surface-500">#{payment.orderId}</td>
                                        <td className="p-5 font-bold text-surface-900 text-lg">${payment.paymentAmount?.toFixed(2)}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-md font-bold ${payment.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-surface-200 text-surface-700'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!payments?.content || payments.content.length === 0) && <tr><td colSpan={3} className="p-8 text-center text-surface-500">No payment history found.</td></tr>}
                                </tbody>
                            </table>

                            {/* Payments Pagination */}
                            {payments && (payments.totalPages ?? 0) > 1 && (
                                <div className="p-4 border-t border-surface-200 flex justify-end items-center gap-2 bg-surface-50">
                                    <button
                                        onClick={() => setPaymentsPage(p => Math.max(0, p - 1))}
                                        disabled={paymentsPage === 0}
                                        className="px-4 py-2 bg-white hover:bg-surface-100 border border-surface-200 rounded-xl disabled:opacity-50 text-sm font-bold transition-colors shadow-sm"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm font-medium text-surface-600 px-2">
                                        Page {paymentsPage + 1}
                                    </span>
                                    <button
                                        onClick={() => setPaymentsPage(p => p + 1)}
                                        disabled={payments.last}
                                        className="px-4 py-2 bg-white hover:bg-surface-100 border border-surface-200 rounded-xl disabled:opacity-50 text-sm font-bold transition-colors shadow-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}