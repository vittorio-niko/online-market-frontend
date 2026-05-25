import { useState, useMemo } from 'react';
import {
    useGetPaymentLogsByUserId,
    useGetPaymentLogsByOrderId
} from '@/api/generated/admin-payment-service';
import {
    Search,
    ChevronDown,
    ArrowUpDown,
    Receipt
} from 'lucide-react';

export default function AdminPayments() {
    const [page, setPage] = useState(0);

    const [searchUserId, setSearchUserId] = useState('');
    const [searchOrderId, setSearchOrderId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sort, setSort] = useState<string>('timestamp,desc');

    // Fetch by User ID (Strictly disabled if searchUserId is empty OR searchOrderId is present)
    const { data: userPaymentsResponse, isLoading: loadingUser } = useGetPaymentLogsByUserId(
        searchUserId,
        { page, size: 50, sort: [sort] },
        { query: { enabled: !!searchUserId && !searchOrderId } }
    );

    // Fetch by Order ID (Strictly disabled if searchOrderId is empty)
    const { data: orderPaymentsResponse, isLoading: loadingOrder } = useGetPaymentLogsByOrderId(
        Number(searchOrderId),
        { query: { enabled: !!searchOrderId && !isNaN(Number(searchOrderId)) } }
    );

    const isLoading = (!!searchUserId && loadingUser && !searchOrderId) || (!!searchOrderId && loadingOrder);
    const pageData = searchOrderId ? null : (userPaymentsResponse?.status === 200 ? userPaymentsResponse.data : null);

    const handleFilterChange = () => setPage(0);

    const filteredPayments = useMemo(() => {
        let rawList: any[] = [];

        if (searchOrderId) {
            rawList = orderPaymentsResponse?.status === 200 ? orderPaymentsResponse.data : [];
            if (sort === 'timestamp,desc') rawList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (sort === 'timestamp,asc') rawList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            if (sort === 'paymentAmount,desc') rawList.sort((a, b) => b.paymentAmount - a.paymentAmount);
            if (sort === 'paymentAmount,asc') rawList.sort((a, b) => a.paymentAmount - b.paymentAmount);
        } else if (searchUserId) {
            rawList = userPaymentsResponse?.status === 200 ? userPaymentsResponse.data.content || [] : [];
        }

        return rawList.filter(p => {
            if (statusFilter && p.status !== statusFilter) return false;
            if (startDate && p.timestamp) {
                const pDate = new Date(p.timestamp).toISOString().split('T')[0];
                if (pDate < startDate) return false;
            }
            if (endDate && p.timestamp) {
                const pDate = new Date(p.timestamp).toISOString().split('T')[0];
                if (pDate > endDate) return false;
            }
            return true;
        });
    }, [searchOrderId, searchUserId, orderPaymentsResponse, userPaymentsResponse, statusFilter, startDate, endDate, sort]);

    const inputStyle = "w-full p-3.5 border border-surface-200 rounded-2xl outline-none focus:border-surface-900 focus:ring-4 focus:ring-surface-900/10 transition-all duration-200 bg-white text-sm font-medium";

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm text-center">
                <h1 className="text-2xl font-bold text-surface-900">Payment Transactions</h1>
                <p className="text-surface-500 text-sm mt-1">Search and filter individual user or order payment logs.</p>
            </div>

            {/* Landing-Page Style 2-Row Control Section */}
            <div className="flex flex-col gap-4 bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm">

                {/* ROW 1: Search Inputs */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by User ID..."
                            value={searchUserId}
                            onChange={(e) => { setSearchUserId(e.target.value); setSearchOrderId(''); handleFilterChange(); }}
                            className={`${inputStyle} pl-12 bg-surface-50 border-transparent`}
                        />
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            value={searchOrderId}
                            onChange={(e) => { setSearchOrderId(e.target.value); setSearchUserId(''); handleFilterChange(); }}
                            className={`${inputStyle} pl-12 bg-surface-50 border-transparent`}
                        />
                    </div>
                </div>

                {/* ROW 2: Filters, Sorting, and Pagination */}
                <div className="flex flex-col xl:flex-row gap-4 items-end xl:items-center justify-between">

                    {/* Date & Status Filters */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); handleFilterChange(); }}
                            className={`${inputStyle} text-surface-500 max-w-[160px]`}
                            title="Start Date"
                        />
                        <span className="text-surface-300 font-bold">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); handleFilterChange(); }}
                            className={`${inputStyle} text-surface-500 max-w-[160px]`}
                            title="End Date"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); handleFilterChange(); }}
                            className={`${inputStyle} cursor-pointer min-w-[160px] max-w-[200px]`}
                        >
                            <option value="">All Statuses</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="PENDING">PENDING</option>
                            <option value="FAILED">FAILED</option>
                            <option value="INITIAL">INITIAL</option>
                        </select>
                    </div>

                    {/* Sorting & Pagination */}
                    <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
                        <div className="relative min-w-[200px]">
                            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                            <select
                                value={sort}
                                onChange={(e) => { setSort(e.target.value); handleFilterChange(); }}
                                className={`${inputStyle} pl-11 pr-10 appearance-none cursor-pointer text-surface-600 font-bold`}
                            >
                                <option value="timestamp,desc">Newest First</option>
                                <option value="timestamp,asc">Oldest First</option>
                                <option value="paymentAmount,desc">Highest Amount</option>
                                <option value="paymentAmount,asc">Lowest Amount</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                        </div>

                        <div className="flex items-center gap-2 bg-surface-50 p-1.5 rounded-2xl border border-surface-100">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0 || isLoading || !!searchOrderId || (!searchUserId && !searchOrderId)}
                                className="p-2.5 bg-white text-surface-700 rounded-xl disabled:opacity-30 transition-all hover:bg-surface-100 shadow-sm border border-surface-200"
                            >
                                <ChevronDown className="w-4 h-4 rotate-90" />
                            </button>
                            <span className="text-xs font-black uppercase tracking-widest text-surface-400 px-3 whitespace-nowrap">
                                Pg {searchOrderId ? 1 : (!searchUserId ? 1 : page + 1)}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={pageData?.last || isLoading || !!searchOrderId || (!searchUserId && !searchOrderId)}
                                className="p-2.5 bg-white text-surface-700 rounded-xl disabled:opacity-30 transition-all hover:bg-surface-100 shadow-sm border border-surface-200"
                            >
                                <ChevronDown className="w-4 h-4 -rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-sm">
                {!searchUserId && !searchOrderId ? (
                    <div className="p-16 text-center">
                        <div className="flex flex-col items-center">
                            <Search className="w-10 h-10 text-surface-300 mb-4" />
                            <p className="font-bold text-surface-900 mb-1 text-lg">Awaiting Search</p>
                            <p className="text-surface-500 font-medium">Please enter a User ID or Order ID above to view payment transactions.</p>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="p-16 text-center text-surface-500 animate-pulse flex flex-col items-center">
                        <Receipt className="w-8 h-8 text-surface-300 mb-4 animate-bounce" />
                        Loading transactions...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-surface-50 text-surface-600 font-medium border-b border-surface-200">
                            <tr>
                                <th className="p-4 pl-6">Timestamp</th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">User ID</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4 pr-6 text-right">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200">
                            {filteredPayments.map((payment, idx) => (
                                <tr key={idx} className="hover:bg-surface-50 transition-colors">
                                    <td className="p-4 pl-6 text-surface-600 text-sm font-medium">
                                        {payment.timestamp ? new Date(payment.timestamp).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="p-4 font-mono text-sm text-surface-500">#{payment.orderId}</td>
                                    <td className="p-4 text-surface-900 text-sm font-medium max-w-[200px] truncate" title={payment.userId}>
                                        {payment.userId || 'N/A'}
                                    </td>
                                    <td className="p-4 font-black text-surface-900">${payment.paymentAmount?.toFixed(2)}</td>
                                    <td className="p-4 pr-6 text-right">
                                      <span className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border rounded-lg font-bold ${
                                          payment.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' :
                                              payment.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' :
                                                  payment.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm' :
                                                      'bg-surface-100 text-surface-700 border-surface-200 shadow-sm'
                                      }`}>
                                        {payment.status}
                                      </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-surface-500">
                                        <div className="flex flex-col items-center">
                                            <Receipt className="w-10 h-10 text-surface-300 mb-4" />
                                            <p className="font-bold text-surface-900 mb-1">No payments found</p>
                                            <p className="text-sm">No transactions match your current filters or search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}