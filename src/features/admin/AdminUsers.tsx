import { useState } from 'react';
import {
    useGetAllUsers,
    useDeactivateUser,
    useActivateUser
} from '@/api/generated/admin-user-service';
import UserDetailsPanel from './components/UserDetailsPanel';
import {
    Search,
    ChevronDown,
    ArrowUpDown,
    Eye,
    Ban,
    CheckCircle
} from 'lucide-react';

export default function AdminUsers() {
    const [page, setPage] = useState(0);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [activeStatus, setActiveStatus] = useState<string>(''); // '', 'true', 'false'
    const [sort, setSort] = useState<string>('createdAt,desc'); // Default: Newest first

    const { data: response, isLoading, refetch } = useGetAllUsers({
        page,
        size: 15,
        name: name || undefined,
        surname: surname || undefined,
        email: email || undefined,
        active: activeStatus === 'true' ? true : activeStatus === 'false' ? false : undefined,
        sort: [sort]
    });

    const { mutateAsync: deactivateUser } = useDeactivateUser();
    const { mutateAsync: activateUser } = useActivateUser();

    const pageData = response?.status === 200 ? response.data : null;
    const users = pageData?.content || [];

    const handleFilterChange = () => setPage(0);

    const handleToggleBan = async (user: any) => {
        const action = user.active ? 'ban' : 'unban';
        if (confirm(`Are you sure you want to ${action} ${user.email}?`)) {
            try {
                if (user.active) {
                    await deactivateUser({ id: user.id! });
                } else {
                    await activateUser({ id: user.id! });
                }
                await refetch();
            } catch (error) {
                alert(`Failed to ${action} user.`);
            }
        }
    };

    const inputStyle = "w-full p-4 border border-surface-200 rounded-2xl outline-none focus:border-surface-900 focus:ring-4 focus:ring-surface-900/10 transition-all duration-200 bg-white text-sm font-medium";

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
                <h1 className="text-2xl font-bold text-surface-900">User Management</h1>
                <p className="text-surface-500 text-sm mt-1">View, filter, and manage platform users and their access.</p>
            </div>

            {/* Controls Section: Search, Filter, Sort */}
            <div className="flex flex-col xl:flex-row gap-6 justify-between bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">

                {/* Search Inputs */}
                <div className="flex flex-wrap items-start gap-4 w-full xl:w-auto flex-1">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={name}
                            onChange={(e) => { setName(e.target.value); handleFilterChange(); }}
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by surname..."
                            value={surname}
                            onChange={(e) => { setSurname(e.target.value); handleFilterChange(); }}
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); handleFilterChange(); }}
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                    <select
                        value={activeStatus}
                        onChange={(e) => { setActiveStatus(e.target.value); handleFilterChange(); }}
                        className={`${inputStyle} cursor-pointer min-w-[160px] flex-1 xl:flex-none`}
                    >
                        <option value="">All Statuses</option>
                        <option value="true">Active Only</option>
                        <option value="false">Banned Only</option>
                    </select>
                </div>

                {/* Sorting & Pagination (Stacked) */}
                <div className="flex flex-col gap-4 w-full xl:w-auto xl:items-end shrink-0">
                    <div className="relative w-full xl:w-[220px]">
                        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <select
                            value={sort}
                            onChange={(e) => { setSort(e.target.value); handleFilterChange(); }}
                            className={`${inputStyle} pl-12 pr-10 appearance-none cursor-pointer font-bold text-surface-600`}
                        >
                            <option value="createdAt,desc">Newest First</option>
                            <option value="createdAt,asc">Oldest First</option>
                            <option value="email,asc">Email: A-Z</option>
                            <option value="name,asc">Name: A-Z</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-end bg-surface-50 p-1.5 rounded-xl border border-surface-200">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || isLoading}
                            className="p-2 bg-white text-surface-700 rounded-lg disabled:opacity-30 transition-all hover:bg-surface-100 shadow-sm border border-surface-200"
                        >
                            <ChevronDown className="w-5 h-5 rotate-90" />
                        </button>
                        <span className="text-sm font-bold text-surface-600 whitespace-nowrap px-4">
                            Page {page + 1}
                        </span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={pageData?.last || isLoading}
                            className="p-2 bg-white text-surface-700 rounded-lg disabled:opacity-30 transition-all hover:bg-surface-100 shadow-sm border border-surface-200"
                        >
                            <ChevronDown className="w-5 h-5 -rotate-90" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-surface-500 animate-pulse">Loading users...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-surface-50 text-surface-600 font-medium border-b border-surface-200">
                            <tr>
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Registered</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-surface-500">#{user.id}</td>
                                    <td className="p-4 font-medium text-surface-900">{user.name} {user.surname}</td>
                                    <td className="p-4 text-surface-600">{user.email}</td>
                                    <td className="p-4 text-surface-500 text-sm">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        {user.active ? (
                                            <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] uppercase tracking-wider rounded-md font-bold border border-green-200">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-50 text-red-700 text-[10px] uppercase tracking-wider rounded-md font-bold border border-red-200">Banned</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedUserId(user.id!)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-100"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Details
                                            </button>

                                            <button
                                                onClick={() => handleToggleBan(user)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                                                    user.active
                                                        ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-100'
                                                        : 'text-green-600 bg-green-50 hover:bg-green-100 border-green-100'
                                                }`}
                                            >
                                                {user.active ? (
                                                    <><Ban className="w-3.5 h-3.5" /> Ban</>
                                                ) : (
                                                    <><CheckCircle className="w-3.5 h-3.5" /> Unban</>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-surface-500">
                                        No users match your criteria.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedUserId && (
                <UserDetailsPanel
                    userId={selectedUserId}
                    onClose={async () => {
                        setSelectedUserId(null);
                        await refetch();
                    }}
                />
            )}
        </div>
    );
}