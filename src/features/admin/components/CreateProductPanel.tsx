import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { useCreateItem, useUpdateItem } from '@/api/generated/admin-order-service';

export interface EditingItem {
    id: number;
    name: string;
    price: number;
}

interface CreateProductPanelProps {
    editingItem: EditingItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface ProductForm {
    name: string;
    price: number;
}

export default function CreateProductPanel({ editingItem, onClose, onSuccess }: CreateProductPanelProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>();

    const { mutateAsync: createItem } = useCreateItem();
    const { mutateAsync: updateItem } = useUpdateItem();

    // Populate form if we are editing an existing item
    useEffect(() => {
        if (editingItem) {
            reset({
                name: editingItem.name,
                price: editingItem.price
            });
        } else {
            reset({ name: '', price: 0 });
        }
    }, [editingItem, reset]);

    const onSubmit = async (formData: ProductForm) => {
        try {
            if (editingItem) {
                await updateItem({ id: editingItem.id, data: { price: formData.price } });
            } else {
                await createItem({ data: { name: formData.name, price: formData.price } });
            }
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to save product. Please check validation rules.');
        }
    };

    const getFieldStyle = (fieldName: keyof ProductForm) => {
        const hasError = !!errors[fieldName];
        const base = "w-full p-4 border rounded-2xl outline-none transition-all duration-200 text-sm font-medium ";
        if (hasError) return `${base} bg-red-50 border-red-300 focus:ring-4 focus:ring-red-500/10`;
        return `${base} bg-white border-surface-200 focus:border-surface-900 focus:ring-4 focus:ring-surface-900/10 disabled:bg-surface-100 disabled:text-surface-500`;
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 md:p-10 shadow-2xl relative border border-surface-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-surface-400 hover:text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-surface-900 mb-8">
                    {editingItem ? 'Edit Product Price' : 'Add New Product'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Product Name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            disabled={!!editingItem}
                            className={getFieldStyle('name')}
                            placeholder="e.g., Premium Coffee Beans"
                        />
                        {errors.name && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase block">{errors.name.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('price', { required: 'Price is required', min: 0.01 })}
                            className={getFieldStyle('price')}
                            placeholder="0.00"
                        />
                        {errors.price && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase block">Must be at least $0.01</span>}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border-2 border-surface-200 text-surface-700 font-bold py-4 rounded-2xl hover:bg-surface-50 hover:border-surface-300 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-surface-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}