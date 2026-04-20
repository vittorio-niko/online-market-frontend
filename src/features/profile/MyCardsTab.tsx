import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreditCard, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import {
    useGetUserCards,
    useCreatePaymentCard,
    useActivatePaymentCard,
    useDeactivatePaymentCard,
    useDeletePaymentCard
} from '@/api/generated/user-user-service';

export default function MyCardsTab() {
    const [isAdding, setIsAdding] = useState(false);

    const { data: response, refetch, isLoading } = useGetUserCards();

    const cards = response?.status === 200 ? response.data : null;

    const { mutateAsync: addCard } = useCreatePaymentCard();
    const { mutateAsync: activateCard } = useActivatePaymentCard();
    const { mutateAsync: deactivateCard } = useDeactivatePaymentCard();
    const { mutateAsync: deleteCard } = useDeletePaymentCard();

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const handleAddCard = async (data: any) => {
        try {
            await addCard({ data });
            setIsAdding(false);
            reset();
            await refetch(); // Await the refetch
        } catch (error: any) {
            if (error.response?.data?.code === 'CARDS_COUNT_LIMIT_OVERFLOW') {
                alert('You have reached the maximum limit of 5 cards.');
            } else {
                alert('Failed to add card. Make sure the date is in the future.');
            }
        }
    };

    const handleToggleStatus = async (cardId: number, isActive: boolean) => {
        try {
            if (isActive) await deactivateCard({ cardId });
            else await activateCard({ cardId });

            await refetch(); // Await the refetch
        } catch (error) {
            alert('Failed to update card status.');
        }
    };

    const handleDelete = async (cardId: number) => {
        if (confirm('Remove this card from your account?')) {
            await deleteCard({ cardId });
            await refetch();
        }
    };

    if (isLoading) return <div className="p-8 text-center text-surface-500 animate-pulse">Loading cards...</div>;

    return (
        <div className="bg-white border border-surface-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-surface-900">Payment Cards</h3>
                {!isAdding && (cards?.length || 0) < 5 && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Card
                    </button>
                )}
            </div>

            <p className="text-sm text-surface-500 mb-6">You can link up to 5 payment cards. ({cards?.length || 0}/5 used)</p>

            {isAdding && (
                <form onSubmit={handleSubmit(handleAddCard)} className="mb-8 p-6 bg-surface-50 border border-surface-200 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Card Number</label>
                        <input
                            placeholder="1234123412341234"
                            maxLength={16}
                            {...register('number', { required: true, pattern: /^[0-9]{16}$/ })}
                            className="w-full p-3 border border-surface-300 rounded-lg outline-none font-mono"
                        />
                        {errors.number && <span className="text-red-500 text-xs">Must be exactly 16 digits</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Cardholder Name</label>
                            <input
                                {...register('holder', { required: true })}
                                className="w-full p-3 border border-surface-300 rounded-lg outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Expiration Date</label>
                            <input
                                type="date"
                                {...register('expirationDate', { required: true })}
                                className="w-full p-3 border border-surface-300 rounded-lg outline-none"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700">Save Card</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-surface-600 px-4 py-2 hover:bg-surface-200 rounded-lg">Cancel</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Now properly mapped since 'cards' is unwrapped */}
                {cards?.map(card => (
                    <div key={card.id} className="relative p-6 border border-surface-200 rounded-2xl bg-gradient-to-br from-surface-50 to-white shadow-sm overflow-hidden group">
                        <div className="flex justify-between items-start mb-8">
                            <CreditCard className={`w-8 h-8 ${card.active ? 'text-primary-600' : 'text-surface-400'}`} />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggleStatus(card.id!, card.active!)}
                                    title={card.active ? "Deactivate" : "Activate"}
                                    className="p-1.5 text-surface-400 hover:text-surface-800 transition-colors bg-white rounded-md border border-surface-200 shadow-sm"
                                >
                                    {card.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(card.id!)}
                                    title="Delete"
                                    className="p-1.5 text-red-400 hover:text-red-600 transition-colors bg-white rounded-md border border-surface-200 shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="font-mono text-lg tracking-widest text-surface-900 mb-2">{card.maskedNumber}</p>
                        <div className="flex justify-between items-end">
                            <p className="text-sm font-medium text-surface-600 uppercase">{card.holder}</p>
                            <span className={`px-2 py-1 text-xs rounded-md font-bold ${card.active ? 'bg-green-100 text-green-700' : 'bg-surface-200 text-surface-500'}`}>
                                {card.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}