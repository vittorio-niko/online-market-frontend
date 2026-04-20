import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogin } from '@/api/generated/api-gateway-api';
import { LogIn } from 'lucide-react'; // Added icon

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm();
    const [serverError, setServerError] = useState('');
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const { mutateAsync: login, isPending } = useLogin();

    const onSubmit = async (data: any) => {
        try {
            setServerError('');
            const response = await login({ data });
            if (response.status === 200 && response.data?.accessToken) {
                setToken(response.data.accessToken);
                navigate('/');
            }
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Invalid credentials');
        }
    };

    // Shared style helper
    const getFieldStyle = (isDirtyField: boolean | undefined) => {
        const base = "w-full p-4 border rounded-2xl outline-none transition-all duration-200 ";
        return isDirtyField
            ? `${base} bg-primary-50/50 border-primary-200 ring-2 ring-primary-50`
            : `${base} bg-white border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10`;
    };

    return (
        <>
            <Helmet><title>Login | Market Local</title></Helmet>
            <div className="max-w-md mx-auto mt-16 bg-white p-10 md:p-12 border border-surface-200 rounded-[2.5rem] shadow-premium">

                {/* Centered Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="bg-primary-50 text-primary-600 p-4 rounded-full mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-surface-900 tracking-tight">Sign In</h1>
                    <p className="text-surface-500 mt-2">Welcome back to Market Local</p>
                </div>

                {serverError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center border border-red-100 animate-fade-in">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className={getFieldStyle(dirtyFields.email)}
                        />
                        {errors.email && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            className={getFieldStyle(dirtyFields.password)}
                        />
                        {errors.password && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password.message as string}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-surface-900 hover:bg-primary-600 text-white font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/register" className="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest">
                        Just found us? Register
                    </Link>
                </div>
            </div>
        </>
    );
}