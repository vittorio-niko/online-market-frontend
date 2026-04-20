import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterUser } from '@/api/generated/api-gateway-api';
import { ErrorResponseCode } from '@/api/generated/api-gateway-api.schemas';
import { UserPlus, ShieldCheck, Info } from 'lucide-react';

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors, dirtyFields }, setError } = useForm();
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();

    const { mutateAsync: registerUser, isPending } = useRegisterUser();

    const onSubmit = async (data: any) => {
        try {
            setServerError('');
            await registerUser({ data });
            navigate('/login');
        } catch (error: any) {
            const errorData = error.response?.data;
            const code = errorData?.code;

            if (code === ErrorResponseCode.EMAIL_DUPLICATE_CONFLICT) {
                setServerError('An account with this email already exists.');
                setError('email', { type: 'manual' });
            } else if (code === ErrorResponseCode.PASSWORD_VALIDATION_ERROR) {
                setServerError('The password provided does not meet our security requirements.');
                setError('password', { type: 'manual' });
            } else {
                setServerError(errorData?.message || 'Registration failed. Please try again.');
            }
        }
    };

    const getFieldStyle = (fieldName: string, isDirtyField: boolean | undefined) => {
        const hasError = !!errors[fieldName];
        const base = "w-full p-4 border rounded-2xl outline-none transition-all duration-200 ";

        if (hasError) return `${base} bg-red-50 border-red-300 focus:ring-4 focus:ring-red-500/10`;

        return isDirtyField
            ? `${base} bg-primary-50/50 border-primary-200 ring-2 ring-primary-50`
            : `${base} bg-white border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10`;
    };

    return (
        <>
            <Helmet><title>Register | Market Local</title></Helmet>
            <div className="max-w-lg mx-auto mt-12 bg-white p-10 md:p-12 border border-surface-200 rounded-[2.5rem] shadow-premium">

                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="bg-primary-50 text-primary-600 p-4 rounded-full mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-surface-900 tracking-tight">Create Account</h1>
                    <p className="text-surface-500 mt-2">Join our Market Local today</p>
                </div>

                {serverError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center border border-red-100 animate-fade-in flex items-center justify-center gap-2">
                        <span>{serverError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className={getFieldStyle('name', dirtyFields.name)}
                            />
                            {errors.name && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.name.message as string}</span>}
                        </div>
                        <div>
                            <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                            <input
                                {...register('surname', { required: 'Surname is required' })}
                                className={getFieldStyle('surname', dirtyFields.surname)}
                            />
                            {errors.surname && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.surname.message as string}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Birth Date</label>
                        <input
                            type="date"
                            {...register('birthDate', { required: 'Birth date is required' })}
                            className={getFieldStyle('birthDate', dirtyFields.birthDate)}
                        />
                        {errors.birthDate && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.birthDate.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className={getFieldStyle('email', dirtyFields.email)}
                        />
                        {errors.email && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                                    message: "Password doesn't meet security requirements"
                                }
                            })}
                            className={getFieldStyle('password', dirtyFields.password)}
                        />

                        {/* Password Policy Info Message */}
                        <div className="mt-3 p-3 bg-surface-50 rounded-xl border border-surface-100 flex items-start gap-3">
                            <Info size={16} className="text-primary-600 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-surface-600 leading-relaxed">
                                <span className="font-bold text-surface-900">Security Requirement:</span><br />
                                Must be at least 8 characters long, including at least one digit and one uppercase letter.
                            </p>
                        </div>

                        {errors.password && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password.message as string}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-surface-900 hover:bg-primary-600 text-white font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-95 mt-4 flex items-center justify-center gap-2"
                    >
                        {isPending ? 'Creating Account...' : 'Create Account'}
                        {!isPending && <ShieldCheck size={20} />}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-surface-100 pt-8">
                    <Link to="/login" className="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest">
                        Already have an account? Sign In
                    </Link>
                </div>
            </div>
        </>
    );
}