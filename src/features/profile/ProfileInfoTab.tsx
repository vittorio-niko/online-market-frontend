import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetCurrentUser, useUpdateCurrentUserById } from '@/api/generated/user-user-service';
import { User, CheckCircle2 } from 'lucide-react';

export default function ProfileInfoTab() {
    const { data: response, isLoading, refetch } = useGetCurrentUser();
    const { mutateAsync: updateUser, isPending } = useUpdateCurrentUserById();

    const { register, handleSubmit, reset, formState: { errors, isDirty, dirtyFields } } = useForm();

    const user = response?.status === 200 ? response.data : null;

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                surname: user.surname,
                birthDate: user.birthDate,
            });
        }
    }, [user, reset]);

    const onSubmit = async (formData: any) => {
        try {
            await updateUser({ data: formData });
            alert('Profile updated successfully!');
            await refetch();
        } catch (error) {
            alert('Failed to update profile. Please check validation rules.');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-surface-500 animate-pulse">Loading profile...</div>;

    const getFieldStyle = (isDirtyField: boolean | undefined) => {
        const base = "w-full p-4 border rounded-2xl outline-none transition-all duration-200 ";
        return isDirtyField
            ? `${base} bg-primary-50/50 border-primary-200 ring-2 ring-primary-50` // Edited style
            : `${base} bg-white border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10`; // Standard style
    };

    return (
        <div className="bg-white border border-surface-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center">
            <div className="flex flex-col items-center mb-10">
                <div className="bg-primary-50 text-primary-600 p-4 rounded-full mb-4">
                    <User size={32} />
                </div>
                <h3 className="text-3xl font-black text-surface-900 tracking-tight">Profile Information</h3>
                <p className="text-surface-500 mt-2">Manage your personal details and account settings</p>
            </div>

            <div className="mb-10 p-6 bg-surface-50 rounded-3xl border border-surface-100 max-w-md mx-auto">
                <p className="text-xs font-black text-surface-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-surface-900 text-lg">{user?.email}</p>
                <div className="mt-4 pt-4 border-t border-surface-200/50">
                    <p className="text-[10px] text-surface-400 uppercase font-bold">To change email, contact support</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className={getFieldStyle(dirtyFields.name)}
                        />
                        {errors.name && <span className="text-red-500 text-xs mt-1 ml-1">{errors.name.message as string}</span>}
                    </div>
                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                        <input
                            {...register('surname', { required: 'Surname is required' })}
                            className={getFieldStyle(dirtyFields.surname)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Date of Birth</label>
                    <input
                        type="date"
                        {...register('birthDate', { required: 'Birth date is required' })}
                        className={getFieldStyle(dirtyFields.birthDate)}
                    />
                </div>

                {isDirty && (
                    <div className="flex items-center justify-center gap-2 text-primary-600 animate-fade-in">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">You have unsaved changes</span>
                    </div>
                )}

                <div className="pt-4 flex justify-center">
                    <button
                        type="submit"
                        disabled={!isDirty || isPending}
                        className="w-full sm:w-auto min-w-[200px] bg-surface-900 hover:bg-primary-600 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}