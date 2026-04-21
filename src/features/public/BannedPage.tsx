import { Helmet } from 'react-helmet-async';
import { Ban, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function BannedPage() {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
            <Helmet><title>Account Suspended | Market Local</title></Helmet>

            <div className="bg-white max-w-md w-full p-10 rounded-[2.5rem] shadow-premium text-center border border-red-100">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                    <Ban size={40} />
                </div>

                <h1 className="text-3xl font-black text-surface-900 tracking-tight mb-3">Account Suspended</h1>
                <p className="text-surface-500 font-medium mb-8 leading-relaxed">
                    Your access to Market Local has been restricted due to a violation of our terms of service or suspicious activity.
                </p>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full bg-surface-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-95"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}