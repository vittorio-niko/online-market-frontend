import { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import {
    useGetItemsAdmin,
    useDeleteItem
} from '@/api/generated/admin-order-service';
import CreateProductPanel, { EditingItem } from './components/CreateProductPanel';

export default function AdminProducts() {
    const [page, setPage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    const { data: response, refetch, isLoading } = useGetItemsAdmin({ page, size: 10 });

    const pageData = response?.status === 200 ? response.data : null;
    const items = pageData?.content || [];

    const { mutateAsync: deleteItem } = useDeleteItem();

    const openAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem({ id: item.id, name: item.name, price: item.price });
        setIsModalOpen(true);
        setMenuOpenId(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteItem({ id });
                await refetch();
            } catch (error) {
                alert('Failed to delete item.');
            }
        }
        setMenuOpenId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Product Management</h1>
                    <p className="text-surface-500 text-sm mt-1">Add, update, or remove products from the catalog.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || isLoading}
                            className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 rounded-lg disabled:opacity-50 text-sm font-semibold transition-colors text-surface-700"
                        >
                            Prev
                        </button>
                        <span className="text-sm font-medium text-surface-600 px-2">Page {page + 1}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={pageData?.last || isLoading}
                            className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 rounded-lg disabled:opacity-50 text-sm font-semibold transition-colors text-surface-700"
                        >
                            Next
                        </button>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="bg-white border border-surface-200 rounded-2xl overflow-visible shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-surface-500 animate-pulse">Loading products...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-surface-50 text-surface-600 font-medium border-b border-surface-200">
                            <tr>
                                <th className="p-4 w-24">ID</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-surface-50 transition-colors relative">
                                    <td className="p-4 text-surface-500 font-mono text-sm">#{item.id}</td>
                                    <td className="p-4 font-medium text-surface-900">{item.name}</td>
                                    <td className="p-4 text-primary-600 font-bold">${item.price?.toFixed(2)}</td>
                                    <td className="p-4">
                                        {item.deleted ? (
                                            <span className="px-2 py-1 bg-red-50 text-red-700 text-[10px] uppercase tracking-wider rounded-md font-bold border border-red-200">Deleted</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] uppercase tracking-wider rounded-md font-bold border border-green-200">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right relative">
                                        <button
                                            onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id!)}
                                            className="p-2 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-surface-100 transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {/* Dropdown menu */}
                                        {menuOpenId === item.id && (
                                            <div className="absolute right-8 top-10 mt-1 w-40 bg-white border border-surface-200 rounded-xl shadow-xl z-40 py-1 animate-fade-in">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 text-left transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" /> Edit Price
                                                </button>
                                                {!item.deleted && (
                                                    <button
                                                        onClick={() => handleDelete(item.id!)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 text-left transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Soft Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-surface-500">No products found.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Render the separated panel */}
            {isModalOpen && (
                <CreateProductPanel
                    editingItem={editingItem}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    );
}