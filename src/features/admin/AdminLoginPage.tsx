import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/store/useAuthStore.ts';
import { useLogin } from '@/api/generated/api-gateway-api.ts';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
    const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm();
    const [serverError, setServerError] = useState('');

    const { setToken, isAuthenticated, role } = useAuthStore();
    const navigate = useNavigate();

    const { mutateAsync: login, isPending } = useLogin();

    useEffect(() => {
        if (isAuthenticated() && role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, role, navigate]);

    const onSubmit = async (data: any) => {
        try {
            setServerError('');
            const response = await login({ data });
            if (response.status === 200 && response.data?.accessToken) {
                setToken(response.data.accessToken);
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Invalid admin credentials');
        }
    };

    const getFieldStyle = (fieldName: string, isDirtyField: boolean | undefined) => {
        const hasError = !!errors[fieldName];
        const base = "w-full p-4 border rounded-2xl outline-none transition-all duration-200 ";

        if (hasError) return `${base} bg-red-50 border-red-300 focus:ring-4 focus:ring-red-500/10`;

        return isDirtyField
            ? `${base} bg-surface-50 border-surface-300 ring-2 ring-surface-100`
            : `${base} bg-white border-surface-200 focus:border-surface-900 focus:ring-4 focus:ring-surface-900/10`;
    };

    return (
        <div className="min-h-screen bg-surface-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-surface-200">
            <Helmet><title>Admin Portal | Market Local</title></Helmet>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-surface-900 text-white p-4 rounded-2xl shadow-xl">
                        <Shield size={36} strokeWidth={2.5} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-black text-surface-900 tracking-tight">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-surface-500 font-medium uppercase tracking-widest">
                    Authorized Personnel Only
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-8 shadow-premium rounded-[2.5rem] border border-surface-200">

                    {serverError && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center border border-red-100 animate-fade-in">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                {...register('email', { required: 'Email is required' })}
                                className={getFieldStyle('email', dirtyFields.email)}
                            />
                            {errors.email && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email.message as string}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">
                                Password
                            </label>
                            <input
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                                className={getFieldStyle('password', dirtyFields.password)}
                            />
                            {errors.password && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password.message as string}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-surface-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
                        >
                            {isPending ? 'Authenticating...' : 'Authenticate'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-surface-100 text-center">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                            Market.local secure gateway
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}